import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

interface AdminAuthSuccess {
  user: { id: string }
  userProfileId: string
  tenantId: string
}

interface AdminAuthError {
  _type: 'admin_auth_error'
  message: string
  status: number
}

type AdminAuthResult = AdminAuthSuccess | AdminAuthError

/**
 * Centralized admin auth resolution for API routes.
 *
 * Replaces the 3-query pattern: getUser() → user_profiles → user_roles
 * with a single embedded query using the middleware-injected user ID header.
 */
export async function resolveAdminAuth(
  supabase: SupabaseClient
): Promise<AdminAuthResult> {
  let userId: string | undefined
  try {
    const h = await headers()
    userId = h.get('x-supabase-user-id') || undefined
  } catch {
    // headers() not available outside request context
  }

  let user: { id: string }

  if (userId) {
    user = { id: userId }
  } else {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return { _type: 'admin_auth_error', message: 'Usuario no autenticado', status: 401 }
    }
    user = authUser
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id, tenant_id,
      user_roles!user_roles_user_profile_id_fkey(role, status, scope)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('user_roles.status', 'active')
    .is('user_roles.deleted_at', null)
    .single()

  if (profileError || !userProfile) {
    return { _type: 'admin_auth_error', message: 'Perfil de usuario no encontrado', status: 404 }
  }

  const roles = userProfile.user_roles as Array<{
    role: string
    status: string
    scope: string
  }> | null

  const isAdmin = roles?.some(r => r.role === 'admin')

  if (!isAdmin) {
    return { _type: 'admin_auth_error', message: 'Usuario no tiene rol de Administrador activo', status: 403 }
  }

  return {
    user,
    userProfileId: userProfile.id,
    tenantId: userProfile.tenant_id,
  }
}

export function isAdminAuthError(result: AdminAuthResult): result is AdminAuthError {
  return '_type' in result && result._type === 'admin_auth_error'
}

export function adminAuthErrorResponse(error: AdminAuthError): NextResponse {
  return NextResponse.json({ error: error.message }, { status: error.status })
}
