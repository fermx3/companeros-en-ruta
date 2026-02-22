import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveIdColumn } from '@/lib/utils/public-id'

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

// GET /api/promotor/visits/[id] - Get a single visit
export async function GET(
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

    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .select(`
        *,
        client:clients(id, public_id, business_name, owner_name, address_street, address_neighborhood, phone, latitude, longitude)
      `)
      .eq(resolveIdColumn(id), id)
      .eq('promotor_id', promotorId)
      .is('deleted_at', null)
      .single()

    if (visitError) {
      if (visitError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Visita no encontrada' },
          { status: 404 }
        )
      }
      console.error('Error fetching visit:', visitError)
      return NextResponse.json(
        { error: 'Error al obtener la visita', details: visitError.message },
        { status: 500 }
      )
    }

    // Fetch brand info separately
    let brandInfo = null
    if (visit.brand_id) {
      const { data: brand } = await supabase
        .from('brands')
        .select('id, name, logo_url')
        .eq('id', visit.brand_id)
        .single()
      brandInfo = brand
    }

    // Map public_id to visit_number and visit_status to status for frontend compatibility
    return NextResponse.json({
      visit: {
        ...visit,
        visit_number: visit.public_id,
        status: visit.visit_status,
        brand: brandInfo
      }
    })

  } catch (error) {
    console.error('Error en GET /api/promotor/visits/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

// PUT /api/promotor/visits/[id] - Update a visit
export async function PUT(
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

    // First verify the visit belongs to this promotor
    const { data: existingVisit, error: fetchError } = await supabase
      .from('visits')
      .select('id, visit_status')
      .eq(resolveIdColumn(id), id)
      .eq('promotor_id', promotorId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existingVisit) {
      return NextResponse.json(
        { error: 'Visita no encontrada o no tienes permiso para editarla' },
        { status: 404 }
      )
    }

    // Don't allow updates to completed visits
    if (existingVisit.visit_status === 'completed') {
      return NextResponse.json(
        { error: 'No se puede modificar una visita completada' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      promotor_notes,
      latitude,
      longitude,
      overall_rating
    } = body

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (promotor_notes !== undefined) updateData.promotor_notes = promotor_notes
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude
    if (overall_rating !== undefined) updateData.overall_rating = overall_rating

    const { data: updatedVisit, error: updateError } = await supabase
      .from('visits')
      .update(updateData)
      .eq('id', existingVisit.id)
      .select(`
        *,
        client:clients(id, public_id, business_name, owner_name, address_street, address_neighborhood, phone)
      `)
      .single()

    if (updateError) {
      console.error('Error updating visit:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la visita', details: updateError.message },
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
      message: 'Visita actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error en PUT /api/promotor/visits/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
