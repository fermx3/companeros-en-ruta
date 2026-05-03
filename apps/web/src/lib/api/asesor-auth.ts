import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

interface AsesorAuthSuccess {
  user: { id: string }
  userProfileId: string
  tenantId: string
  distributorId: string | null
  brandId: string | null
}

interface AsesorAuthError {
  _type: 'asesor_auth_error'
  message: string
  status: number
}

type AsesorAuthResult = AsesorAuthSuccess | AsesorAuthError

/**
 * Centralized asesor de ventas auth resolution for API routes.
 *
 * Replaces the 3-query pattern: getUser() → user_profiles → user_roles
 * with a single embedded query using the middleware-injected user ID header.
 */
export async function resolveAsesorAuth(
  supabase: SupabaseClient
): Promise<AsesorAuthResult> {
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
      return { _type: 'asesor_auth_error', message: 'Usuario no autenticado', status: 401 }
    }
    user = authUser
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id, tenant_id, distributor_id,
      user_roles!user_roles_user_profile_id_fkey(role, status, brand_id)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('user_roles.status', 'active')
    .is('user_roles.deleted_at', null)
    .single()

  if (profileError || !userProfile) {
    return { _type: 'asesor_auth_error', message: 'Perfil de usuario no encontrado', status: 404 }
  }

  const roles = userProfile.user_roles as Array<{
    role: string
    status: string
    brand_id: string | null
  }> | null

  const asesorRole = roles?.find(r => r.role === 'asesor_de_ventas')

  if (!asesorRole) {
    return { _type: 'asesor_auth_error', message: 'Usuario no tiene rol de Asesor de Ventas activo', status: 403 }
  }

  return {
    user,
    userProfileId: userProfile.id,
    tenantId: userProfile.tenant_id,
    distributorId: userProfile.distributor_id,
    brandId: asesorRole.brand_id,
  }
}

export function isAsesorAuthError(result: AsesorAuthResult): result is AsesorAuthError {
  return '_type' in result && result._type === 'asesor_auth_error'
}

export function asesorAuthErrorResponse(error: AsesorAuthError): NextResponse {
  return NextResponse.json({ error: error.message }, { status: error.status })
}
