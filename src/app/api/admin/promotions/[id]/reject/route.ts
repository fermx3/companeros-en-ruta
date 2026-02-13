import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get rejection reason from body
    const body = await request.json()
    const { rejection_reason } = body

    if (!rejection_reason?.trim()) {
      return NextResponse.json(
        { error: 'El motivo de rechazo es requerido' },
        { status: 400 }
      )
    }

    // Get current promotion
    const { data: currentPromotion, error: fetchError } = await supabase
      .from('promotions')
      .select('id, status, name')
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

    // Only allow rejection from pending_approval status
    if (currentPromotion.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Solo se pueden rechazar promociones en estado pendiente de aprobación' },
        { status: 400 }
      )
    }

    // Update promotion to cancelled with rejection reason
    const { data: updatedPromotion, error: updateError } = await supabase
      .from('promotions')
      .update({
        status: 'cancelled',
        approved_by: userProfileId,
        approved_at: new Date().toISOString(),
        approval_notes: `RECHAZADA: ${rejection_reason.trim()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al rechazar promoción: ${updateError.message}`)
    }

    return NextResponse.json({
      promotion: updatedPromotion,
      message: `La promoción "${currentPromotion.name}" ha sido rechazada`
    })

  } catch (error) {
    console.error('Error en POST /api/admin/promotions/[id]/reject:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
