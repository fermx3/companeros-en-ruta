import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolvePromotorAuth, isPromotorAuthError, promotorAuthErrorResponse } from '@/lib/api/promotor-auth'
import { extractDigits } from '@/lib/utils/phone'

interface ZoneInfo {
  id: string
  name: string
  code: string
}

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Resolve promotor auth (single embedded query instead of 3 sequential)
    const authResult = await resolvePromotorAuth(supabase)
    if (isPromotorAuthError(authResult)) return promotorAuthErrorResponse(authResult)
    const { user, userProfileId, role: promotorRole } = authResult

    // 2. Get profile details (first_name, last_name, email, phone)
    // We need these for the response but auth helper doesn't select them all
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', userProfileId)
      .single()

    // 3. Fetch promotor assignment and client count IN PARALLEL
    const [promotorInfoResult, assignedClientsResult] = await Promise.all([
      supabase
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
        .eq('user_profile_id', userProfileId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle(),

      supabase
        .from('client_assignments')
        .select('id')
        .eq('user_profile_id', userProfileId)
        .eq('is_active', true),
    ])

    const promotorInfo = promotorInfoResult.data
    const totalAssignedClients = assignedClientsResult.data?.length || 0
    const zoneInfo = (promotorInfo?.zones as unknown as ZoneInfo | null) || null

    // 4. Build promotor profile response
    const firstName = profileData?.first_name || ''
    const lastName = profileData?.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim() || 'Usuario'

    const promotorProfile = {
      id: userProfileId,
      public_id: `ASR-${userProfileId.substring(0, 8).toUpperCase()}`,
      user_id: user.id,
      full_name: fullName,
      email: profileData?.email || '',
      phone: profileData?.phone,
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

    // 1. Resolve promotor auth (single embedded query)
    const authResult = await resolvePromotorAuth(supabase)
    if (isPromotorAuthError(authResult)) return promotorAuthErrorResponse(authResult)
    const { userProfileId } = authResult

    // 2. Obtener datos del body
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'El teléfono es requerido' },
        { status: 400 }
      )
    }

    // Validate phone (10 digits for Mexico)
    const phoneDigits = extractDigits(phone)
    if (phoneDigits.length !== 10) {
      return NextResponse.json(
        { error: 'El teléfono debe tener 10 dígitos' },
        { status: 400 }
      )
    }

    // 3. Actualizar user_profile (solo teléfono)
    const { error: updateProfileError } = await supabase
      .from('user_profiles')
      .update({
        phone: phoneDigits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userProfileId)

    if (updateProfileError) {
      throw new Error(`Error al actualizar perfil: ${updateProfileError.message}`)
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
