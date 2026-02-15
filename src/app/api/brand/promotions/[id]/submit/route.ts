import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createBulkNotifications } from '@/lib/notifications'

// Helper to get brand profile from auth
async function getBrandProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
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
        brand_id,
        role,
        status,
        tenant_id
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  const brandRole = userProfile.user_roles.find(role =>
    role.status === 'active' &&
    ['brand_manager', 'brand_admin'].includes(role.role)
  )

  if (!brandRole || !brandRole.brand_id) {
    return { error: { message: 'Usuario no tiene permisos de marca activos', status: 403 } }
  }

  return {
    user,
    userProfileId: userProfile.id,
    userProfile,
    brandRole,
    brandId: brandRole.brand_id,
    tenantId: brandRole.tenant_id || userProfile.tenant_id
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId, tenantId } = result

    // Get current promotion
    const { data: currentPromotion, error: fetchError } = await supabase
      .from('promotions')
      .select('id, status, name')
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentPromotion) {
      return NextResponse.json(
        { error: 'Promoción no encontrada' },
        { status: 404 }
      )
    }

    // Only allow submission from draft status
    if (currentPromotion.status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden enviar a aprobación promociones en estado borrador' },
        { status: 400 }
      )
    }

    // Update status to pending_approval
    const { data: updatedPromotion, error: updateError } = await supabase
      .from('promotions')
      .update({
        status: 'pending_approval',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('brand_id', brandId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al enviar promoción: ${updateError.message}`)
    }

    // Notify all tenant admins about the new pending promotion
    try {
      const serviceClient = createServiceClient()
      const { data: adminProfiles } = await serviceClient
        .from('user_roles')
        .select('user_profile_id, tenant_id')
        .eq('tenant_id', tenantId)
        .in('role', ['admin', 'tenant_admin', 'super_admin'])
        .eq('status', 'active')
        .is('deleted_at', null)

      if (adminProfiles && adminProfiles.length > 0) {
        const uniqueAdminIds = [...new Set(adminProfiles.map(a => a.user_profile_id))]
        await createBulkNotifications(
          uniqueAdminIds.map(adminProfileId => ({
            tenant_id: tenantId!,
            user_profile_id: adminProfileId,
            title: 'Nueva promoción pendiente',
            message: `La promoción "${currentPromotion.name}" fue enviada para aprobación`,
            notification_type: 'new_promotion' as const,
            action_url: `/admin/promotions`,
            metadata: { promotion_id: id },
          }))
        )
      }
    } catch (notifError) {
      console.error('Error creating submit notification:', notifError)
    }

    return NextResponse.json({
      promotion: updatedPromotion,
      message: `La promoción "${currentPromotion.name}" ha sido enviada para aprobación`
    })

  } catch (error) {
    console.error('Error en POST /api/brand/promotions/[id]/submit:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
