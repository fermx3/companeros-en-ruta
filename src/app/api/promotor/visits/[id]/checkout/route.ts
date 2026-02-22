import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createBulkNotifications } from '@/lib/notifications'
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

// POST /api/promotor/visits/[id]/checkout - Complete a visit
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
      .eq(resolveIdColumn(id), id)
      .eq('promotor_id', promotorId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !visit) {
      return NextResponse.json(
        { error: 'Visita no encontrada o no tienes permiso para accederla' },
        { status: 404 }
      )
    }

    // Validate visit status - must be in_progress to checkout
    if (visit.visit_status !== 'in_progress') {
      if (visit.visit_status === 'completed') {
        return NextResponse.json(
          { error: 'Esta visita ya fue completada' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Debes iniciar la visita (check-in) antes de completarla' },
        { status: 400 }
      )
    }

    // Parse request body for optional data
    const body = await request.json().catch(() => ({}))
    const { promotor_notes, latitude, longitude } = body

    const now = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      visit_status: 'completed',
      check_out_time: now,
      updated_at: now
    }

    // Only update notes if provided (append to existing notes)
    if (promotor_notes) {
      const { data: currentVisit } = await supabase
        .from('visits')
        .select('promotor_notes')
        .eq('id', visit.id)
        .single()

      const existingNotes = currentVisit?.promotor_notes || ''
      updateData.promotor_notes = existingNotes
        ? `${existingNotes}\n\n[Checkout] ${promotor_notes}`
        : `[Checkout] ${promotor_notes}`
    }

    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude

    const { data: updatedVisit, error: updateError } = await supabase
      .from('visits')
      .update(updateData)
      .eq('id', visit.id)
      .select(`
        *,
        client:clients(id, public_id, business_name, owner_name, address_street, address_neighborhood, phone)
      `)
      .single()

    if (updateError) {
      console.error('Error checking out:', updateError)
      return NextResponse.json(
        { error: 'Error al completar la visita', details: updateError.message },
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

    // Notify supervisors of completed visit
    try {
      const serviceClient = createServiceClient()
      const { data: supervisors } = await serviceClient
        .from('user_roles')
        .select('user_profile_id')
        .eq('tenant_id', result.tenantId)
        .eq('role', 'supervisor')
        .eq('status', 'active')

      if (supervisors && supervisors.length > 0) {
        const clientName = updatedVisit.client?.business_name ?? 'un cliente'
        await createBulkNotifications(
          supervisors.map(s => ({
            tenant_id: result.tenantId!,
            user_profile_id: s.user_profile_id,
            title: 'Visita completada',
            message: `Visita completada en ${clientName}`,
            notification_type: 'visit_completed' as const,
            action_url: '/supervisor/',
            metadata: { visit_id: visit.id },
          }))
        )
      }
    } catch (notifError) {
      console.error('Error creating visit checkout notification:', notifError)
    }

    // Calculate visit duration
    const startTime = new Date(visit.check_in_time!).getTime()
    const endTime = new Date(now).getTime()
    const durationMinutes = Math.round((endTime - startTime) / 60000)

    // Map public_id to visit_number and visit_status to status for frontend compatibility
    return NextResponse.json({
      visit: {
        ...updatedVisit,
        visit_number: updatedVisit.public_id,
        status: updatedVisit.visit_status,
        brand: brandInfo
      },
      message: 'Visita completada exitosamente',
      duration_minutes: durationMinutes
    })

  } catch (error) {
    console.error('Error en POST /api/promotor/visits/[id]/checkout:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
