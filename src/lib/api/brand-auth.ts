import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

interface BrandAuthSuccess {
  user: { id: string; email?: string }
  userProfileId: string
  brandId: string
  tenantId: string
  allBrandRoles: Array<{
    brand_id: string
    role: string
    is_primary: boolean
  }>
}

interface BrandAuthError {
  _type: 'brand_auth_error'
  message: string
  status: number
}

type BrandAuthResult = BrandAuthSuccess | BrandAuthError

/**
 * Centralized brand auth resolution for API routes.
 *
 * Replaces the duplicated `getBrandProfile()` pattern across 26+ routes.
 *
 * Resolution order:
 * 1. If `requestedBrandId` is provided, validates user has an active role for that brand
 * 2. Uses `is_primary = true` role
 * 3. Falls back to first active brand_manager/brand_admin role
 * 4. For global admins without brand-specific roles, uses first active brand in tenant
 */
export async function resolveBrandAuth(
  supabase: SupabaseClient,
  requestedBrandId?: string | null
): Promise<BrandAuthResult> {
  // 1. Get authenticated user — prefer middleware-injected header to avoid redundant getUser()
  let userId: string | undefined
  try {
    const h = await headers()
    userId = h.get('x-supabase-user-id') || undefined
  } catch {
    // headers() not available outside request context — fallback below
  }

  let user: { id: string; email?: string }

  if (userId) {
    user = { id: userId }
  } else {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return { _type: 'brand_auth_error', message: 'Usuario no autenticado', status: 401 }
    }
    user = authUser
  }

  // 2. Get user profile + roles in a single embedded query
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id, tenant_id,
      user_roles(brand_id, role, scope, tenant_id, is_primary)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('user_roles.status', 'active')
    .is('user_roles.deleted_at', null)
    .single()

  if (profileError || !userProfile) {
    return { _type: 'brand_auth_error', message: 'Perfil de usuario no encontrado', status: 404 }
  }

  const roles = userProfile.user_roles as Array<{
    brand_id: string | null
    role: string
    scope: string
    tenant_id: string
    is_primary: boolean | null
  }> | null

  if (!roles || roles.length === 0) {
    return { _type: 'brand_auth_error', message: 'No tienes roles asignados', status: 403 }
  }

  // Build list of brand-specific roles
  const brandRoles = roles
    .filter(r => r.brand_id && ['brand_manager', 'brand_admin'].includes(r.role))
    .map(r => ({
      brand_id: r.brand_id as string,
      role: r.role,
      is_primary: r.is_primary ?? false,
    }))

  const tenantId = userProfile.tenant_id

  // 4. If a specific brand_id was requested, validate access
  if (requestedBrandId) {
    const hasAccess = brandRoles.some(r => r.brand_id === requestedBrandId)

    // Also allow global admins
    const isGlobalAdmin = roles.some(r => r.role === 'admin' && r.scope === 'global')

    if (!hasAccess && !isGlobalAdmin) {
      return { _type: 'brand_auth_error', message: 'No tienes acceso a esta marca', status: 403 }
    }

    return {
      user,
      userProfileId: userProfile.id,
      brandId: requestedBrandId,
      tenantId,
      allBrandRoles: brandRoles,
    }
  }

  // 5. No specific brand requested — resolve automatically
  if (brandRoles.length > 0) {
    // Prefer is_primary
    const primaryRole = brandRoles.find(r => r.is_primary)
    const selectedBrandId = primaryRole
      ? primaryRole.brand_id
      : brandRoles[0].brand_id

    return {
      user,
      userProfileId: userProfile.id,
      brandId: selectedBrandId,
      tenantId,
      allBrandRoles: brandRoles,
    }
  }

  // 6. No brand-specific roles — check if global admin
  const isGlobalAdmin = roles.some(r => r.role === 'admin' && r.scope === 'global')
  if (isGlobalAdmin) {
    const { data: firstBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .limit(1)
      .single()

    if (firstBrand) {
      return {
        user,
        userProfileId: userProfile.id,
        brandId: firstBrand.id,
        tenantId,
        allBrandRoles: brandRoles,
      }
    }
  }

  // 7. Also allow promotor/supervisor/asesor_de_ventas roles (they have brand_id too)
  const otherBrandRoles = roles
    .filter(r => r.brand_id && !['brand_manager', 'brand_admin'].includes(r.role))
    .map(r => ({
      brand_id: r.brand_id as string,
      role: r.role,
      is_primary: r.is_primary ?? false,
    }))

  if (otherBrandRoles.length > 0) {
    const primaryRole = otherBrandRoles.find(r => r.is_primary)
    const selectedBrandId = primaryRole
      ? primaryRole.brand_id
      : otherBrandRoles[0].brand_id

    return {
      user,
      userProfileId: userProfile.id,
      brandId: selectedBrandId,
      tenantId,
      allBrandRoles: [...brandRoles, ...otherBrandRoles],
    }
  }

  return {
    _type: 'brand_auth_error',
    message: 'No se pudo determinar una marca. Roles: ' + roles.map(r => `${r.role}(${r.scope})`).join(', '),
    status: 403,
  }
}

export function isBrandAuthError(result: BrandAuthResult): result is BrandAuthError {
  return '_type' in result && result._type === 'brand_auth_error'
}

export function brandAuthErrorResponse(error: BrandAuthError): NextResponse {
  return NextResponse.json({ error: error.message }, { status: error.status })
}
