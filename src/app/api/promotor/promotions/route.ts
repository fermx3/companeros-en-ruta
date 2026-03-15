import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to get promotor profile from auth
async function getPromotorProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: { message: 'Usuario no autenticado', status: 401 } }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('id, role, status, brand_id, tenant_id')
    .eq('user_profile_id', userProfile.id)

  const promotorRole = roles?.find(role =>
    role.status === 'active' && role.role === 'promotor'
  )

  if (!promotorRole) {
    return { error: { message: 'Usuario no tiene rol de promotor activo', status: 403 } }
  }

  const promotorBrandIds = [...new Set(
    (roles || [])
      .filter(r => r.status === 'active' && r.role === 'promotor' && r.brand_id)
      .map(r => r.brand_id as string)
  )]

  // Get promotor zone
  const { data: assignment } = await supabase
    .from('promotor_assignments')
    .select('zone_id')
    .eq('user_profile_id', userProfile.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  return {
    user,
    promotorId: userProfile.id,
    tenantId: promotorRole.tenant_id,
    brandId: promotorRole.brand_id,
    promotorBrandIds,
    zoneId: assignment?.zone_id || null,
  }
}

/**
 * GET /api/promotor/promotions - List active promotions for the promotor's brands
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const result = await getPromotorProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { promotorBrandIds, zoneId } = result

    if (promotorBrandIds.length === 0) {
      return NextResponse.json({ promotions: [], total: 0 })
    }

    const searchParams = request.nextUrl.searchParams
    const typeFilter = searchParams.get('type') || ''

    const now = new Date().toISOString().split('T')[0]

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
        targeting_criteria,
        created_at,
        brands:brand_id(id, name, logo_url)
      `)
      .in('brand_id', promotorBrandIds)
      .eq('status', 'active')
      .lte('start_date', now)
      .gte('end_date', now)
      .is('deleted_at', null)
      .order('end_date', { ascending: true })

    if (typeFilter) {
      query = query.eq('promotion_type', typeFilter as 'discount_amount' | 'discount_percentage' | 'buy_x_get_y' | 'free_product' | 'volume_discount' | 'points_multiplier' | 'tier_bonus' | 'cashback')
    }

    const { data: promotions, error: queryError } = await query

    if (queryError) {
      console.error('Error fetching promotions:', queryError)
      return NextResponse.json(
        { error: 'Error al obtener promociones' },
        { status: 500 }
      )
    }

    // Filter by targeting_criteria.zone_ids if present
    const filtered = (promotions || []).filter(promo => {
      const criteria = promo.targeting_criteria as { zone_ids?: string[] } | null
      if (!criteria?.zone_ids || criteria.zone_ids.length === 0) return true
      if (!zoneId) return true
      return criteria.zone_ids.includes(zoneId)
    })

    // Collect distinct promotion types for filter
    const types = [...new Set(filtered.map(p => p.promotion_type))].sort()

    return NextResponse.json({
      promotions: filtered,
      types,
      total: filtered.length,
    })

  } catch (error) {
    console.error('Error in GET /api/promotor/promotions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
