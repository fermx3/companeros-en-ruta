import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'

import { supabase } from './supabase'
import { queryClient } from './query'

export function useSession(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}

export type StaffRole =
  | 'promotor'
  | 'asesor_de_ventas'
  | 'supervisor'
  | 'brand_manager'
  | 'admin'

// Priority order: highest privilege wins when a user has multiple roles.
const ROLE_PRIORITY: readonly StaffRole[] = [
  'admin',
  'supervisor',
  'brand_manager',
  'asesor_de_ventas',
  'promotor',
] as const

interface UserRoleState {
  role: StaffRole | null
  userProfileId: string | null
  loading: boolean
}

/**
 * Resolves the authenticated user's primary staff role.
 *
 * Mirrors the server-side resolution that lives in
 * apps/web/src/lib/api/{admin,supervisor,promotor,asesor}-auth.ts: looks up
 * `user_profiles.id` for the current auth user, then reads `user_roles`
 * filtered to `status='active'` and `deleted_at IS NULL`, and picks the
 * highest-priority role from the list above.
 *
 * Cache: keyed by `session.user.id` via TanStack Query, so every screen reuses
 * the same query result. `signOut()` clears the entire query cache to drop
 * stale role data between accounts.
 */
export function useUserRole(): UserRoleState {
  const { session, loading: sessionLoading } = useSession()
  const userId = session?.user?.id

  const query = useQuery({
    queryKey: ['user-role', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ role: StaffRole | null; userProfileId: string | null }> => {
      if (!userId) return { role: null, userProfileId: null }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, user_roles!user_roles_user_profile_id_fkey(role,status,deleted_at)')
        .eq('user_id', userId)
        .single()

      if (error || !data) return { role: null, userProfileId: null }

      const activeRoles = (data.user_roles ?? [])
        .filter(r => r.status === 'active' && r.deleted_at == null)
        .map(r => r.role as StaffRole)

      const role = ROLE_PRIORITY.find(p => activeRoles.includes(p)) ?? null
      return { role, userProfileId: data.id }
    },
  })

  if (sessionLoading) {
    return { role: null, userProfileId: null, loading: true }
  }
  if (!userId) {
    return { role: null, userProfileId: null, loading: false }
  }
  return {
    role: query.data?.role ?? null,
    userProfileId: query.data?.userProfileId ?? null,
    loading: query.isLoading,
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  // Drop role + per-account caches so the next login starts fresh.
  queryClient.clear()
}
