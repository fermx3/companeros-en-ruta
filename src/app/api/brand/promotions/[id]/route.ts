import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createBulkNotifications } from '@/lib/notifications'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

// Promotion type labels
const PROMOTION_TYPE_LABELS: Record<string, string> = {
  discount_percentage: 'Descuento porcentual',
  discount_amount: 'Descuento fijo',
  buy_x_get_y: 'Compra X, Lleva Y',
  free_product: 'Producto gratis',
  volume_discount: 'Descuento por volumen',
  tier_bonus: 'Bonus de nivel',
  cashback: 'Cashback',
  points_multiplier: 'Multiplicador de puntos'
}

// Status labels
const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_approval: 'Pendiente de aprobación',
  approved: 'Aprobada',
  active: 'Activa',
  paused: 'Pausada',
  completed: 'Completada',
  cancelled: 'Cancelada'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    // Get promotion with rules
    const { data: promotion, error: promotionError } = await supabase
      .from('promotions')
      .select(`
        *,
        promotion_rules (
          id,
          public_id,
          rule_type,
          rule_name,
          is_inclusion,
          apply_to_all,
          target_zones,
          target_states,
          target_markets,
          target_commercial_structures,
          target_client_types,
          target_clients,
          target_products,
          target_categories,
          target_tiers,
          custom_conditions,
          effective_from,
          effective_until,
          priority,
          is_active
        )
      `)
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (promotionError) {
      if (promotionError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Promoción no encontrada' },
          { status: 404 }
        )
      }
      throw new Error(`Error al obtener promoción: ${promotionError.message}`)
    }

    // Get redemption stats
    const { count: redemptionCount } = await supabase
      .from('promotion_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('promotion_id', id)
      .is('deleted_at', null)

    // Get applied discount stats
    const { data: redemptionStats } = await supabase
      .from('promotion_redemptions')
      .select('applied_discount_amount, bonus_points_awarded')
      .eq('promotion_id', id)
      .is('deleted_at', null)

    const stats = {
      total_redemptions: redemptionCount || 0,
      total_discount_given: redemptionStats?.reduce((sum, r) => sum + (Number(r.applied_discount_amount) || 0), 0) || 0,
      total_bonus_points: redemptionStats?.reduce((sum, r) => sum + (Number(r.bonus_points_awarded) || 0), 0) || 0
    }

    return NextResponse.json({
      promotion: {
        ...promotion,
        promotion_type_label: PROMOTION_TYPE_LABELS[promotion.promotion_type] || promotion.promotion_type,
        status_label: STATUS_LABELS[promotion.status] || promotion.status
      },
      stats
    })

  } catch (error) {
    console.error('Error en GET /api/brand/promotions/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Only allow edits in draft or approved status
    if (!['draft', 'approved'].includes(currentPromotion.status)) {
      return NextResponse.json(
        { error: `No se puede editar una promoción en estado "${STATUS_LABELS[currentPromotion.status] || currentPromotion.status}"` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      promotion_type,
      start_date,
      end_date,
      start_time,
      end_time,
      days_of_week,
      discount_percentage,
      discount_amount,
      min_purchase_amount,
      max_discount_amount,
      buy_quantity,
      get_quantity,
      points_multiplier,
      usage_limit_per_client,
      usage_limit_total,
      budget_allocated,
      priority,
      stackable,
      auto_apply,
      requires_code,
      promo_code,
      terms_and_conditions,
      internal_notes,
      creative_assets,
      submit_for_approval,
      pause,
      resume
    } = body

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (promotion_type !== undefined) updateData.promotion_type = promotion_type
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (start_time !== undefined) updateData.start_time = start_time || null
    if (end_time !== undefined) updateData.end_time = end_time || null
    if (days_of_week !== undefined) updateData.days_of_week = days_of_week
    if (discount_percentage !== undefined) updateData.discount_percentage = discount_percentage
    if (discount_amount !== undefined) updateData.discount_amount = discount_amount
    if (min_purchase_amount !== undefined) updateData.min_purchase_amount = min_purchase_amount
    if (max_discount_amount !== undefined) updateData.max_discount_amount = max_discount_amount
    if (buy_quantity !== undefined) updateData.buy_quantity = buy_quantity
    if (get_quantity !== undefined) updateData.get_quantity = get_quantity
    if (points_multiplier !== undefined) updateData.points_multiplier = points_multiplier
    if (usage_limit_per_client !== undefined) updateData.usage_limit_per_client = usage_limit_per_client
    if (usage_limit_total !== undefined) updateData.usage_limit_total = usage_limit_total
    if (budget_allocated !== undefined) updateData.budget_allocated = budget_allocated
    if (priority !== undefined) updateData.priority = priority
    if (stackable !== undefined) updateData.stackable = stackable
    if (auto_apply !== undefined) updateData.auto_apply = auto_apply
    if (requires_code !== undefined) updateData.requires_code = requires_code
    if (promo_code !== undefined) updateData.promo_code = promo_code?.trim() || null
    if (terms_and_conditions !== undefined) updateData.terms_and_conditions = terms_and_conditions?.trim() || null
    if (internal_notes !== undefined) updateData.internal_notes = internal_notes?.trim() || null
    if (creative_assets !== undefined) updateData.creative_assets = creative_assets

    // Handle status changes
    if (submit_for_approval && currentPromotion.status === 'draft') {
      updateData.status = 'pending_approval'
    }

    if (pause && currentPromotion.status === 'active') {
      updateData.status = 'paused'
    }

    if (resume && currentPromotion.status === 'paused') {
      updateData.status = 'active'
    }

    const { data: updatedPromotion, error: updateError } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .eq('brand_id', brandId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al actualizar promoción: ${updateError.message}`)
    }

    // Notify admins if promotion was submitted for approval
    if (submit_for_approval && updatedPromotion.status === 'pending_approval') {
      try {
        const serviceClient = createServiceClient()
        const { data: adminProfiles, error: adminError } = await serviceClient
          .from('user_roles')
          .select('user_profile_id')
          .eq('tenant_id', tenantId)
          .eq('role', 'admin')
          .eq('status', 'active')
          .is('deleted_at', null)

        if (adminError) {
          console.error('[update-promotion] Error fetching admin profiles:', adminError)
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
        console.error('[update-promotion] Error creating notification:', notifError)
      }
    }

    return NextResponse.json({
      promotion: {
        ...updatedPromotion,
        promotion_type_label: PROMOTION_TYPE_LABELS[updatedPromotion.promotion_type] || updatedPromotion.promotion_type,
        status_label: STATUS_LABELS[updatedPromotion.status] || updatedPromotion.status
      },
      message: 'Promoción actualizada correctamente'
    })

  } catch (error) {
    console.error('Error en PATCH /api/brand/promotions/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    // Get current promotion
    const { data: currentPromotion, error: fetchError } = await supabase
      .from('promotions')
      .select('id, status')
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

    // Only allow deletion of drafts
    if (currentPromotion.status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar promociones en estado borrador' },
        { status: 400 }
      )
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('promotions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('brand_id', brandId)

    if (deleteError) {
      throw new Error(`Error al eliminar promoción: ${deleteError.message}`)
    }

    return NextResponse.json({
      message: 'Promoción eliminada correctamente'
    })

  } catch (error) {
    console.error('Error en DELETE /api/brand/promotions/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
