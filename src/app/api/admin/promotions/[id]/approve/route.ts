import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'

// Helper to get admin profile from auth
async function getAdminProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: { message: 'Usuario no autenticado', status: 401 } }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      tenant_id,
      user_roles!user_roles_user_profile_id_fkey(
        tenant_id,
        role,
        status
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  const adminRole = userProfile.user_roles.find(role =>
    role.status === 'active' &&
    ['tenant_admin', 'admin', 'super_admin'].includes(role.role)
  )

  if (!adminRole) {
    return { error: { message: 'Usuario no tiene permisos de administrador', status: 403 } }
  }

  return {
    user,
    userProfileId: userProfile.id,
    userProfile,
    adminRole,
    tenantId: adminRole.tenant_id || userProfile.tenant_id
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const result = await getAdminProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { tenantId, userProfileId } = result

    // Get current promotion
    const { data: currentPromotion, error: fetchError } = await supabase
      .from('promotions')
      .select('id, status, name, start_date, created_by, tenant_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentPromotion) {
      return NextResponse.json(
        { error: 'Promoción no encontrada' },
        { status: 404 }
      )
    }

    // Only allow approval from pending_approval status
    if (currentPromotion.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Solo se pueden aprobar promociones en estado pendiente de aprobación' },
        { status: 400 }
      )
    }

    // Get optional approval notes from body
    const body = await request.json().catch(() => ({}))
    const { approval_notes } = body

    // Determine new status: if start_date is today or past, activate immediately
    const today = new Date().toISOString().split('T')[0]
    const newStatus = currentPromotion.start_date <= today ? 'active' : 'approved'

    // Update promotion
    const { data: updatedPromotion, error: updateError } = await supabase
      .from('promotions')
      .update({
        status: newStatus,
        approved_by: userProfileId,
        approved_at: new Date().toISOString(),
        approval_notes: approval_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al aprobar promoción: ${updateError.message}`)
    }

    const message = newStatus === 'active'
      ? `La promoción "${currentPromotion.name}" ha sido aprobada y activada`
      : `La promoción "${currentPromotion.name}" ha sido aprobada y se activará el ${new Date(currentPromotion.start_date).toLocaleDateString('es-MX')}`

    // Notify the brand manager who created the promotion
    try {
      await createNotification({
        tenant_id: currentPromotion.tenant_id,
        user_profile_id: currentPromotion.created_by,
        title: 'Promoción aprobada',
        message,
        notification_type: 'promotion_approved',
        action_url: `/brand/promotions`,
        metadata: { promotion_id: id },
      })
    } catch (notifError) {
      console.error('Error creating approval notification:', notifError)
    }

    return NextResponse.json({
      promotion: updatedPromotion,
      message
    })

  } catch (error) {
    console.error('Error en POST /api/admin/promotions/[id]/approve:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
