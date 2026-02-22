import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveIdColumn } from '@/lib/utils/public-id'

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
    const result = await getAdminProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { tenantId } = result

    // Get promotion with all related data
    const { data: promotion, error: promotionError } = await supabase
      .from('promotions')
      .select(`
        *,
        brands!promotions_brand_id_fkey(
          id,
          name,
          logo_url,
          brand_color_primary
        ),
        user_profiles!promotions_created_by_fkey(
          id,
          first_name,
          last_name,
          email
        ),
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
          is_active
        )
      `)
      .eq(resolveIdColumn(id), id)
      .eq('tenant_id', tenantId)
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
      .eq('promotion_id', promotion.id)
      .is('deleted_at', null)

    const { data: redemptionStats } = await supabase
      .from('promotion_redemptions')
      .select('applied_discount_amount, bonus_points_awarded')
      .eq('promotion_id', promotion.id)
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
    console.error('Error en GET /api/admin/promotions/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
