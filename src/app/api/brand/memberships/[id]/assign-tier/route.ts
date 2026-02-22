import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createNotification, getClientUserProfileId } from '@/lib/notifications'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: membershipId } = await params

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const authResult = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(authResult)) return brandAuthErrorResponse(authResult)
    const { brandId, tenantId, userProfileId } = authResult

    // 2. Get request body
    const body = await request.json()
    const { tier_id, assignment_type = 'manual', effective_until = null } = body

    if (!tier_id) {
      return NextResponse.json(
        { error: 'El ID del nivel es requerido' },
        { status: 400 }
      )
    }

    // 3. Verify membership exists and belongs to this brand
    const { data: membership, error: membershipError } = await supabase
      .from('client_brand_memberships')
      .select('id, brand_id, client_id, membership_status')
      .eq(resolveIdColumn(membershipId), membershipId)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membresía no encontrada' },
        { status: 404 }
      )
    }

    if (membership.brand_id !== brandId) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta membresía' },
        { status: 403 }
      )
    }

    // 4. Verify membership is active
    if (membership.membership_status !== 'active') {
      return NextResponse.json(
        { error: 'Solo se pueden asignar niveles a membresías activas' },
        { status: 400 }
      )
    }

    // 5. Verify tier exists and belongs to this brand
    const { data: tier, error: tierError } = await supabase
      .from('tiers')
      .select('id, brand_id, name, is_active')
      .eq('id', tier_id)
      .is('deleted_at', null)
      .single()

    if (tierError || !tier) {
      return NextResponse.json(
        { error: 'Nivel no encontrado' },
        { status: 404 }
      )
    }

    if (tier.brand_id !== brandId) {
      return NextResponse.json(
        { error: 'El nivel no pertenece a esta marca' },
        { status: 400 }
      )
    }

    if (!tier.is_active) {
      return NextResponse.json(
        { error: 'No se puede asignar un nivel inactivo' },
        { status: 400 }
      )
    }

    // 6. Unset current tier assignment
    await supabase
      .from('client_tier_assignments')
      .update({ is_current: false })
      .eq('client_brand_membership_id', membership.id)
      .eq('is_current', true)

    // 7. Create new tier assignment
    const now = new Date().toISOString()
    const { data: newAssignment, error: assignmentError } = await supabase
      .from('client_tier_assignments')
      .insert({
        client_brand_membership_id: membership.id,
        tier_id: tier_id,
        tenant_id: tenantId,
        assignment_type: assignment_type,
        is_current: true,
        effective_from: now,
        effective_until: effective_until,
        assigned_by: userProfileId,
        assigned_date: now
      })
      .select()
      .single()

    if (assignmentError) {
      throw new Error(`Error al crear asignación de nivel: ${assignmentError.message}`)
    }

    // 8. Update membership with current tier
    const { error: updateError } = await supabase
      .from('client_brand_memberships')
      .update({
        current_tier_id: tier_id,
        updated_at: now
      })
      .eq('id', membership.id)

    if (updateError) {
      throw new Error(`Error al actualizar membresía: ${updateError.message}`)
    }

    // Notify the client about the tier upgrade
    try {
      const serviceClient = createServiceClient()
      const clientProfileId = await getClientUserProfileId(serviceClient, membership.client_id)
      if (clientProfileId) {
        await createNotification({
          tenant_id: tenantId,
          user_profile_id: clientProfileId,
          title: 'Nivel asignado',
          message: `Has sido asignado al nivel "${tier.name}"`,
          notification_type: 'tier_upgrade',
          action_url: '/client/brands',
          metadata: { membership_id: membership.id, tier_id: tier.id },
        })
      }
    } catch (notifError) {
      console.error('Error creating tier upgrade notification:', notifError)
    }

    return NextResponse.json({
      success: true,
      message: `Nivel "${tier.name}" asignado correctamente`,
      assignment: newAssignment
    })

  } catch (error) {
    console.error('Error en POST /api/brand/memberships/[id]/assign-tier:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
