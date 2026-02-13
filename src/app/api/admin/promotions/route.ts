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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const result = await getAdminProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { tenantId } = result

    // Get query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'pending_approval'
    const brandId = searchParams.get('brand_id') || ''
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    // Build query with brand info
    let query = supabase
      .from('promotions')
      .select(`
        id,
        public_id,
        name,
        description,
        promotion_type,
        status,
        start_date,
        end_date,
        discount_percentage,
        discount_amount,
        buy_quantity,
        get_quantity,
        points_multiplier,
        usage_limit_total,
        budget_allocated,
        created_at,
        updated_at,
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
        )
      `)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply brand filter
    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,public_id.ilike.%${search}%`)
    }

    // Get total count
    let countQuery = supabase
      .from('promotions')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    if (brandId) {
      countQuery = countQuery.eq('brand_id', brandId)
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,public_id.ilike.%${search}%`)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      throw new Error(`Error al contar promociones: ${countError.message}`)
    }

    // Get paginated data
    const { data: promotions, error: dataError } = await query
      .range(offset, offset + limit - 1)

    if (dataError) {
      throw new Error(`Error al obtener promociones: ${dataError.message}`)
    }

    // Get metrics
    const { data: metricsData } = await supabase
      .from('promotions')
      .select('status')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    const metrics = {
      total: metricsData?.length || 0,
      pending_approval: metricsData?.filter(p => p.status === 'pending_approval').length || 0,
      approved: metricsData?.filter(p => p.status === 'approved').length || 0,
      active: metricsData?.filter(p => p.status === 'active').length || 0
    }

    // Get available brands for filter
    const { data: brands } = await supabase
      .from('brands')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('name')

    // Transform promotions with labels
    const transformedPromotions = (promotions || []).map(promo => ({
      ...promo,
      promotion_type_label: PROMOTION_TYPE_LABELS[promo.promotion_type] || promo.promotion_type,
      status_label: STATUS_LABELS[promo.status] || promo.status
    }))

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      promotions: transformedPromotions,
      metrics,
      brands: brands || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error en GET /api/admin/promotions:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
