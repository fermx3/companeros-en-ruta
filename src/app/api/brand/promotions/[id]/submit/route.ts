import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createBulkNotifications } from '@/lib/notifications'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
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
      const { data: adminProfiles, error: adminError } = await serviceClient
        .from('user_roles')
        .select('user_profile_id, tenant_id')
        .eq('tenant_id', tenantId)
        .eq('role', 'admin')
        .eq('status', 'active')
        .is('deleted_at', null)

      if (adminError) {
        console.error('[submit-promotion] Error fetching admin profiles:', adminError)
      }

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
      console.error('[submit-promotion] Error creating notification:', notifError)
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
