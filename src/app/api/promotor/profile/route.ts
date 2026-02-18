import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractDigits } from '@/lib/utils/phone'

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
  user_roles: UserRole[]
}

interface ZoneInfo {
  id: string
  name: string
  code: string
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

    // 2. Obtener o crear user_profile del promotor
    let userProfile: UserProfile | null = null

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, phone')
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

    // Ahora obtener los roles por separado
    const { data: roles, error: rolesError } = await supabase
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

    userProfile = {
      ...profileData,
      user_roles: roles || []
    }

    // 3. Buscar rol de promotor (sin bloquear si no existe)
    if (!userProfile) {
      return NextResponse.json(
        { error: 'No se pudo obtener el perfil del usuario' },
        { status: 500 }
      )
    }

    const promotorRole = userProfile.user_roles.find((role: UserRole) =>
      role.role === 'promotor'
    )

    if (!promotorRole) {
      return NextResponse.json(
        {
          error: 'Usuario no tiene rol de promotor asignado',
          availableRoles: userProfile.user_roles.map((r: UserRole) => r.role),
          help: 'Debe ser asignado como promotor por un admin o brand manager'
        },
        { status: 403 }
      )
    }

    // 4. Obtener información específica de promotor (zona, especialización)
    const { data: promotorInfo } = await supabase
      .from('promotor_assignments')
      .select(`
        id,
        zone_id,
        specialization,
        experience_level,
        monthly_quota,
        performance_rating,
        zones(
          id,
          name,
          code
        )
      `)
      .eq('user_profile_id', userProfile.id)
      .eq('is_active', true)
      .single()

    // 5. Obtener clientes asignados
    const { data: assignedClients } = await supabase
      .from('client_assignments')
      .select('id')
      .eq('user_profile_id', userProfile.id)
      .eq('is_active', true)

    const totalAssignedClients = assignedClients?.length || 0
    const zoneInfo = (promotorInfo?.zones as ZoneInfo[])?.[0] || null

    // 6. Construir perfil del promotor con datos reales
    const fullName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Usuario';

    const promotorProfile = {
      id: userProfile.id,
      public_id: `ASR-${userProfile.id.substring(0, 8).toUpperCase()}`,
      user_id: user.id,
      full_name: fullName,
      email: userProfile.email || user.email,
      phone: userProfile.phone,
      // Campos del rol real
      role: promotorRole.role,
      scope: promotorRole.scope,
      status: promotorRole.status,
      brand_id: promotorRole.brand_id,
      tenant_id: promotorRole.tenant_id,
      is_primary: promotorRole.is_primary,
      permissions: promotorRole.permissions,
      // Información específica del promotor (datos reales)
      zone_id: promotorInfo?.zone_id || null,
      zone_name: zoneInfo?.name || 'Sin zona asignada',
      zone_code: zoneInfo?.code || null,
      territory_assigned: zoneInfo?.name || 'Pendiente de asignación',
      specialization: promotorInfo?.specialization || 'Sin especialización',
      experience_level: promotorInfo?.experience_level || 'Sin definir',
      monthly_quota: promotorInfo?.monthly_quota || 0,
      performance_rating: promotorInfo?.performance_rating || null,
      total_assigned_clients: totalAssignedClients,
      // Campos de auditoría
      created_at: promotorRole.created_at,
      updated_at: promotorRole.updated_at,
      // Información adicional
      hasActiveRole: true,
      hasPromotorAssignment: !!promotorInfo,
      needsZoneAssignment: !promotorInfo?.zone_id,
      needsSpecialization: !promotorInfo?.specialization || promotorInfo.specialization === 'general'
    }

    return NextResponse.json(promotorProfile)

  } catch (error) {
    console.error('Error en /api/promotor/profile:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado', details: authError?.message },
        { status: 401 }
      )
    }

    // 2. Obtener datos del body
    const body = await request.json()
    const {
      phone,
      territory_assigned,
      specialization,
      experience_level
    } = body

    // 3. Obtener user_profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado', details: profileError?.message },
        { status: 404 }
      )
    }

    // Validate phone (10 digits for Mexico)
    if (phone) {
      const phoneDigits = extractDigits(phone)
      if (phoneDigits.length !== 10) {
        return NextResponse.json(
          { error: 'El teléfono debe tener 10 dígitos' },
          { status: 400 }
        )
      }
    }

    // 4. Actualizar user_profile
    if (phone) {
      const phoneDigits = extractDigits(phone)
      const { error: updateProfileError } = await supabase
        .from('user_profiles')
        .update({
          phone: phoneDigits,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id)

      if (updateProfileError) {
        throw new Error(`Error al actualizar perfil: ${updateProfileError.message}`)
      }
    }

    // 5. Actualizar user_role de promotor
    const { error: updateRoleError } = await supabase
      .from('user_roles')
      .update({
        territory_assigned,
        specialization,
        experience_level,
        updated_at: new Date().toISOString()
      })
      .eq('user_profile_id', userProfile.id)
      .eq('role', 'promotor')
      .eq('status', 'active')

    if (updateRoleError) {
      throw new Error(`Error al actualizar rol de promotor: ${updateRoleError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente'
    })

  } catch (error) {
    console.error('Error en PUT /api/promotor/profile:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
