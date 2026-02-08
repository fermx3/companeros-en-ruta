import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Obtener user_profile del asesor de ventas
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, phone, distributor_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profileData) {
      return NextResponse.json(
        {
          error: 'Error al obtener perfil de usuario',
          details: profileError?.message,
          userId: user.id,
          help: 'Usuario no encontrado en user_profiles'
        },
        { status: 404 }
      )
    }

    // 3. Obtener los roles
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
      .eq('user_profile_id', profileData.id)

    const userProfile: UserProfile = {
      ...profileData,
      user_roles: roles || []
    }

    // 4. Buscar rol de asesor_de_ventas
    const asesorVentasRole = userProfile.user_roles.find((role: UserRole) =>
      role.role === 'asesor_de_ventas'
    )

    if (!asesorVentasRole) {
      return NextResponse.json(
        {
          error: 'Usuario no tiene rol de Asesor de Ventas asignado',
          availableRoles: userProfile.user_roles.map((r: UserRole) => r.role),
          help: 'Debe ser asignado como Asesor de Ventas por un admin o brand manager'
        },
        { status: 403 }
      )
    }

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
    if (asesorVentasRole.brand_id) {
      const { count } = await supabase
        .from('client_brand_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', asesorVentasRole.brand_id)
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
      email: userProfile.email || user.email,
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
