import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to get promotor profile from auth
async function getPromotorProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: { message: 'Usuario no autenticado', status: 401 } }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('id, role, status, brand_id, tenant_id')
    .eq('user_profile_id', userProfile.id)

  const promotorRole = roles?.find(role =>
    role.status === 'active' && role.role === 'promotor'
  )

  if (!promotorRole) {
    return { error: { message: 'Usuario no tiene rol de promotor activo', status: 403 } }
  }

  return {
    user,
    userProfile,
    promotorRole,
    promotorId: userProfile.id,
    tenantId: promotorRole.tenant_id
  }
}

// POST /api/promotor/visits/[id]/checkin - Check in to a visit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const result = await getPromotorProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { promotorId } = result

    // Get the visit and validate it belongs to this promotor
    const { data: visit, error: fetchError } = await supabase
      .from('visits')
      .select('id, visit_status, check_in_time')
      .eq('id', id)
      .eq('promotor_id', promotorId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !visit) {
      return NextResponse.json(
        { error: 'Visita no encontrada o no tienes permiso para accederla' },
        { status: 404 }
      )
    }

    // Validate visit status allows check-in
    if (visit.visit_status === 'in_progress') {
      return NextResponse.json(
        { error: 'Ya has iniciado esta visita' },
        { status: 400 }
      )
    }

    if (visit.visit_status === 'completed') {
      return NextResponse.json(
        { error: 'No puedes iniciar una visita que ya fue completada' },
        { status: 400 }
      )
    }

    if (visit.visit_status === 'cancelled') {
      return NextResponse.json(
        { error: 'No puedes iniciar una visita cancelada' },
        { status: 400 }
      )
    }

    // Parse request body for optional location
    const body = await request.json().catch(() => ({}))
    const { latitude, longitude } = body

    const now = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      visit_status: 'in_progress',
      check_in_time: now,
      updated_at: now
    }

    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude

    const { data: updatedVisit, error: updateError } = await supabase
      .from('visits')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        client:clients(id, public_id, business_name, owner_name, address_street, address_neighborhood, phone)
      `)
      .single()

    if (updateError) {
      console.error('Error checking in:', updateError)
      return NextResponse.json(
        { error: 'Error al iniciar la visita', details: updateError.message },
        { status: 500 }
      )
    }

    // Fetch brand info separately
    let brandInfo = null
    if (updatedVisit.brand_id) {
      const { data: brand } = await supabase
        .from('brands')
        .select('id, name, logo_url')
        .eq('id', updatedVisit.brand_id)
        .single()
      brandInfo = brand
    }

    // Map public_id to visit_number and visit_status to status for frontend compatibility
    return NextResponse.json({
      visit: {
        ...updatedVisit,
        visit_number: updatedVisit.public_id,
        status: updatedVisit.visit_status,
        brand: brandInfo
      },
      message: 'Check-in realizado exitosamente'
    })

  } catch (error) {
    console.error('Error en POST /api/promotor/visits/[id]/checkin:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
