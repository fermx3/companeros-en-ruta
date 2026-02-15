import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createNotification, getClientUserProfileId } from '@/lib/notifications'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: membershipId } = await params

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado', details: authError?.message },
        { status: 401 }
      )
    }

    // 2. Get user_profile and roles
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_roles!user_roles_user_profile_id_fkey(
          brand_id,
          tenant_id,
          role,
          status
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado', details: profileError?.message },
        { status: 404 }
      )
    }

    // 3. Get the membership first to know client_id and brand_id
    const { data: membership, error: membershipError } = await supabase
      .from('client_brand_memberships')
      .select('id, brand_id, tenant_id, membership_status, client_id')
      .eq('id', membershipId)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membresía no encontrada' },
        { status: 404 }
      )
    }

    // 4. Check user permissions - brand_manager/brand_admin OR supervisor/promotor for assigned clients
    const brandRole = userProfile.user_roles.find(role =>
      role.status === 'active' &&
      ['brand_manager', 'brand_admin'].includes(role.role) &&
      role.brand_id === membership.brand_id
    )

    const supervisorOrPromotorRole = userProfile.user_roles.find(role =>
      role.status === 'active' &&
      ['supervisor', 'promotor'].includes(role.role) &&
      role.tenant_id === membership.tenant_id
    )

    let canApprove = false

    if (brandRole) {
      // Brand managers and admins can approve any membership for their brand
      canApprove = true
    } else if (supervisorOrPromotorRole) {
      // Supervisors and promotors can only approve for clients assigned to them
      const { data: assignment } = await supabase
        .from('client_assignments')
        .select('id')
        .eq('user_profile_id', userProfile.id)
        .eq('client_id', membership.client_id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single()

      if (assignment) {
        canApprove = true
      }
    }

    if (!canApprove) {
      return NextResponse.json(
        { error: 'No tienes permisos para aprobar esta membresía. Verifica que el cliente esté asignado a ti.' },
        { status: 403 }
      )
    }

    // 5. Validate status transition
    if (membership.membership_status !== 'pending') {
      return NextResponse.json(
        { error: `No se puede aprobar una membresía con estado "${membership.membership_status}". Solo membresías pendientes pueden ser aprobadas.` },
        { status: 400 }
      )
    }

    // 6. Get default tier for this brand
    const { data: defaultTier } = await supabase
      .from('tiers')
      .select('id')
      .eq('brand_id', membership.brand_id)
      .eq('is_default', true)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    // 7. Update membership
    const now = new Date().toISOString()
    const { data: updatedMembership, error: updateError } = await supabase
      .from('client_brand_memberships')
      .update({
        membership_status: 'active',
        current_tier_id: defaultTier?.id || null,
        approved_by: userProfile.id,
        approved_date: now,
        joined_date: now,
        updated_at: now
      })
      .eq('id', membershipId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al aprobar membresía: ${updateError.message}`)
    }

    // 8. If default tier exists, create tier assignment record
    if (defaultTier) {
      await supabase
        .from('client_tier_assignments')
        .update({ is_current: false })
        .eq('client_brand_membership_id', membershipId)
        .eq('is_current', true)

      await supabase
        .from('client_tier_assignments')
        .insert({
          client_brand_membership_id: membershipId,
          tier_id: defaultTier.id,
          tenant_id: membership.tenant_id,
          assignment_type: 'automatic',
          is_current: true,
          effective_from: now,
          assigned_by: userProfile.id,
          assigned_date: now
        })
    }

    // Notify the client about the membership approval
    try {
      const serviceClient = createServiceClient()
      const clientProfileId = await getClientUserProfileId(serviceClient, membership.client_id)
      if (clientProfileId) {
        await createNotification({
          tenant_id: membership.tenant_id,
          user_profile_id: clientProfileId,
          title: 'Membresía aprobada',
          message: 'Tu membresía ha sido aprobada',
          notification_type: 'system',
          action_url: '/client/brands',
          metadata: { membership_id: membershipId },
        })
      }
    } catch (notifError) {
      console.error('Error creating membership approval notification:', notifError)
    }

    return NextResponse.json({
      success: true,
      message: 'Membresía aprobada correctamente',
      membership: updatedMembership
    })

  } catch (error) {
    console.error('Error en PUT /api/brand/memberships/[id]/approve:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
