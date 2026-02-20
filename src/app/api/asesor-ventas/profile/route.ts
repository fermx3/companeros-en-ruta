import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveAsesorAuth, isAsesorAuthError, asesorAuthErrorResponse } from '@/lib/api/asesor-auth'

interface UserRole {
  id: string
  role: string
  scope: string
  status: string
  brand_id?: string
  tenant_id: string
  is_primary?: boolean
  permissions?: Record<string, unknown>
  granted_by?: string
  granted_at: string
  expires_at?: string
  created_at: string
  updated_at?: string
}

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  distributor_id?: string
  user_roles: UserRole[]
}

interface Distributor {
  id: string
  name: string
  public_id: string
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Authenticate and verify asesor role
    const authResult = await resolveAsesorAuth(supabase)
    if (isAsesorAuthError(authResult)) return asesorAuthErrorResponse(authResult)
    const { user, userProfileId, distributorId, brandId } = authResult

    // Fetch extra profile fields needed for this route
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', userProfileId)
      .single()

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'Error al obtener perfil de usuario' },
        { status: 404 }
      )
    }

    // Fetch full roles for profile response
    const { data: roles } = await supabase
      .from('user_roles')
      .select(`
        id,
        role,
        scope,
        status,
        brand_id,
        tenant_id,
        is_primary,
        permissions,
        granted_by,
        granted_at,
        expires_at,
        created_at,
        updated_at
      `)
      .eq('user_profile_id', userProfileId)

    const userProfile: UserProfile = {
      id: userProfileId,
      ...profileData,
      distributor_id: distributorId || undefined,
      user_roles: roles || []
    }

    const asesorVentasRole = userProfile.user_roles.find((role: UserRole) =>
      role.role === 'asesor_de_ventas'
    )!

    // 5. Obtener informacion del distribuidor
    let distributorInfo: Distributor | null = null
    if (userProfile.distributor_id) {
      const { data: distributor } = await supabase
        .from('distributors')
        .select('id, name, public_id')
        .eq('id', userProfile.distributor_id)
        .single()

      distributorInfo = distributor
    }

    // 6. Obtener clientes asignados (via brand memberships del rol)
    let totalClients = 0
    if (brandId) {
      const { count } = await supabase
        .from('client_brand_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .is('deleted_at', null)

      totalClients = count || 0
    }

    // 7. Construir perfil del asesor de ventas
    const fullName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Usuario';

    const asesorVentasProfile = {
      id: userProfile.id,
      public_id: `ADV-${userProfile.id.substring(0, 8).toUpperCase()}`,
      user_id: user.id,
      full_name: fullName,
      email: userProfile.email || null,
      phone: userProfile.phone || null,
      // Informacion del distribuidor
      distributor_id: userProfile.distributor_id || null,
      distributor_name: distributorInfo?.name || null,
      distributor_public_id: distributorInfo?.public_id || null,
      // Campos del rol
      role: asesorVentasRole.role,
      scope: asesorVentasRole.scope,
      status: asesorVentasRole.status,
      brand_id: asesorVentasRole.brand_id,
      tenant_id: asesorVentasRole.tenant_id,
      is_primary: asesorVentasRole.is_primary,
      permissions: asesorVentasRole.permissions,
      // Estadisticas basicas
      total_clients: totalClients,
      // Campos de auditoria
      created_at: asesorVentasRole.created_at,
      updated_at: asesorVentasRole.updated_at,
      // Informacion adicional
      hasActiveRole: asesorVentasRole.status === 'active',
      hasDistributor: !!userProfile.distributor_id,
      needsDistributorAssignment: !userProfile.distributor_id
    }

    return NextResponse.json(asesorVentasProfile)

  } catch (error) {
    console.error('Error en /api/asesor-ventas/profile:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
