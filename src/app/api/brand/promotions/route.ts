import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId } = result

    // Get query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    // Build query
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
        usage_count_total,
        budget_allocated,
        budget_spent,
        priority,
        stackable,
        auto_apply,
        requires_code,
        promo_code,
        approved_at,
        approval_notes,
        terms_and_conditions,
        created_at,
        updated_at
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,public_id.ilike.%${search}%,promo_code.ilike.%${search}%`)
    }

    // Get total count
    let countQuery = supabase
      .from('promotions')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .is('deleted_at', null)

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,public_id.ilike.%${search}%,promo_code.ilike.%${search}%`)
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
      .select('status, budget_allocated, budget_spent')
      .eq('brand_id', brandId)
      .is('deleted_at', null)

    const metrics = {
      total: metricsData?.length || 0,
      active: metricsData?.filter(p => p.status === 'active').length || 0,
      pending: metricsData?.filter(p => p.status === 'pending_approval').length || 0,
      draft: metricsData?.filter(p => p.status === 'draft').length || 0,
      totalBudget: metricsData?.reduce((sum, p) => sum + (Number(p.budget_allocated) || 0), 0) || 0,
      spentBudget: metricsData?.reduce((sum, p) => sum + (Number(p.budget_spent) || 0), 0) || 0
    }

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
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error en GET /api/brand/promotions:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId, tenantId, userProfileId } = result

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
      priority = 0,
      stackable = false,
      auto_apply = false,
      requires_code = false,
      promo_code,
      terms_and_conditions,
      internal_notes,
      creative_assets,
      submit_for_approval = false
    } = body

    // Validate required fields
    const validationErrors: Array<{ field: string; message: string }> = []

    if (!name?.trim()) {
      validationErrors.push({ field: 'name', message: 'El nombre de la promoción es requerido' })
    }

    if (!promotion_type) {
      validationErrors.push({ field: 'promotion_type', message: 'El tipo de promoción es requerido' })
    }

    const validTypes = ['discount_percentage', 'discount_amount', 'buy_x_get_y', 'free_product', 'volume_discount', 'tier_bonus', 'cashback', 'points_multiplier']
    if (promotion_type && !validTypes.includes(promotion_type)) {
      validationErrors.push({ field: 'promotion_type', message: 'Tipo de promoción no válido' })
    }

    if (!start_date) {
      validationErrors.push({ field: 'start_date', message: 'La fecha de inicio es requerida' })
    }

    if (!end_date) {
      validationErrors.push({ field: 'end_date', message: 'La fecha de fin es requerida' })
    }

    // Validate type-specific fields
    if (promotion_type === 'discount_percentage' || promotion_type === 'cashback' || promotion_type === 'volume_discount') {
      if (!discount_percentage || discount_percentage <= 0 || discount_percentage > 100) {
        validationErrors.push({ field: 'discount_percentage', message: 'El porcentaje de descuento debe estar entre 1 y 100' })
      }
    }

    if (promotion_type === 'discount_amount') {
      if (!discount_amount || discount_amount <= 0) {
        validationErrors.push({ field: 'discount_amount', message: 'El monto de descuento debe ser mayor a 0' })
      }
    }

    if (promotion_type === 'buy_x_get_y') {
      if (!buy_quantity || buy_quantity <= 0) {
        validationErrors.push({ field: 'buy_quantity', message: 'La cantidad a comprar debe ser mayor a 0' })
      }
      if (!get_quantity || get_quantity <= 0) {
        validationErrors.push({ field: 'get_quantity', message: 'La cantidad gratis debe ser mayor a 0' })
      }
    }

    if (promotion_type === 'points_multiplier' || promotion_type === 'tier_bonus') {
      if (!points_multiplier || points_multiplier <= 1) {
        validationErrors.push({ field: 'points_multiplier', message: 'El multiplicador de puntos debe ser mayor a 1' })
      }
    }

    // Validate promo_code if requires_code
    if (requires_code && !promo_code?.trim()) {
      validationErrors.push({ field: 'promo_code', message: 'El código promocional es requerido cuando se requiere código' })
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Errores de validación', details: validationErrors },
        { status: 400 }
      )
    }

    // Determine initial status
    const initialStatus = submit_for_approval ? 'pending_approval' : 'draft'

    // Create promotion
    const promotionData = {
      tenant_id: tenantId,
      brand_id: brandId,
      name: name.trim(),
      description: description?.trim() || null,
      promotion_type,
      status: initialStatus,
      start_date,
      end_date,
      start_time: start_time || null,
      end_time: end_time || null,
      days_of_week: days_of_week || null,
      discount_percentage: discount_percentage || null,
      discount_amount: discount_amount || null,
      min_purchase_amount: min_purchase_amount || 0,
      max_discount_amount: max_discount_amount || null,
      buy_quantity: buy_quantity || null,
      get_quantity: get_quantity || null,
      points_multiplier: points_multiplier || 1,
      usage_limit_per_client: usage_limit_per_client || null,
      usage_limit_total: usage_limit_total || null,
      usage_count_total: 0,
      budget_allocated: budget_allocated || null,
      budget_spent: 0,
      priority: priority || 0,
      stackable: stackable || false,
      auto_apply: auto_apply || false,
      requires_code: requires_code || false,
      promo_code: promo_code?.trim() || null,
      terms_and_conditions: terms_and_conditions?.trim() || null,
      internal_notes: internal_notes?.trim() || null,
      creative_assets: creative_assets || null,
      created_by: userProfileId
    }

    const { data: newPromotion, error: insertError } = await supabase
      .from('promotions')
      .insert(promotionData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating promotion:', insertError)
      return NextResponse.json(
        { error: 'Error al crear la promoción', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      promotion: {
        ...newPromotion,
        promotion_type_label: PROMOTION_TYPE_LABELS[newPromotion.promotion_type] || newPromotion.promotion_type,
        status_label: STATUS_LABELS[newPromotion.status] || newPromotion.status
      },
      message: submit_for_approval
        ? 'Promoción creada y enviada para aprobación'
        : 'Promoción guardada como borrador'
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/brand/promotions:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
