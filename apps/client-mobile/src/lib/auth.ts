import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { unregisterPushTokenAsync } from '@/features/notifications/push'
import { supabase } from './supabase'

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

export async function signOut(): Promise<void> {
  // Deactivate the push token first (still authenticated). Failures are
  // logged but don't block the signOut — the user gets out either way.
  try {
    await unregisterPushTokenAsync()
  } catch (err) {
    console.error('[signOut] push deactivate failed:', err)
  }
  await supabase.auth.signOut()
}
