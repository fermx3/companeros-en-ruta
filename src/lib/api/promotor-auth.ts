import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

interface PromotorAuthSuccess {
  user: { id: string }
  userProfileId: string
  tenantId: string
  brandId: string | null
  role: {
    id: string
    role: string
    scope: string
    status: string
    brand_id: string | null
    tenant_id: string
    is_primary: boolean | null
    permissions: Record<string, unknown> | null
    created_at: string
    updated_at: string | null
  }
}

interface PromotorAuthError {
  _type: 'promotor_auth_error'
  message: string
  status: number
}

type PromotorAuthResult = PromotorAuthSuccess | PromotorAuthError

/**
 * Centralized promotor auth resolution for API routes.
 *
 * Replaces the 3-query pattern: getUser() → user_profiles → user_roles
 * with a single embedded query using the middleware-injected user ID header.
 */
export async function resolvePromotorAuth(
  supabase: SupabaseClient
): Promise<PromotorAuthResult> {
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
      return { _type: 'promotor_auth_error', message: 'Usuario no autenticado', status: 401 }
    }
    user = authUser
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id, tenant_id, first_name, last_name, email, phone,
      user_roles!user_roles_user_profile_id_fkey(
        id, role, scope, status, brand_id, tenant_id,
        is_primary, permissions, created_at, updated_at
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('user_roles.status', 'active')
    .is('user_roles.deleted_at', null)
    .single()

  if (profileError || !userProfile) {
    return { _type: 'promotor_auth_error', message: 'Perfil de usuario no encontrado', status: 404 }
  }

  const roles = userProfile.user_roles as Array<{
    id: string
    role: string
    scope: string
    status: string
    brand_id: string | null
    tenant_id: string
    is_primary: boolean | null
    permissions: Record<string, unknown> | null
    created_at: string
    updated_at: string | null
  }> | null

  const promotorRole = roles?.find(r => r.role === 'promotor')

  if (!promotorRole) {
    return {
      _type: 'promotor_auth_error',
      message: 'Usuario no tiene rol de promotor asignado',
      status: 403,
    }
  }

  return {
    user,
    userProfileId: userProfile.id,
    tenantId: userProfile.tenant_id,
    brandId: promotorRole.brand_id,
    role: promotorRole,
  }
}

export function isPromotorAuthError(result: PromotorAuthResult): result is PromotorAuthError {
  return '_type' in result && result._type === 'promotor_auth_error'
}

export function promotorAuthErrorResponse(error: PromotorAuthError): NextResponse {
  return NextResponse.json({ error: error.message }, { status: error.status })
}
