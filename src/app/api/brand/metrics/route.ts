import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/metrics
 * Obtiene las métricas del dashboard para la marca del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId: targetBrandId } = result

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)

    // All queries in parallel — COUNTs use head:true (no data transfer)
    const [
      brandResult,
      membershipsResult,
      // Visit metrics (COUNTs + minimal data)
      totalVisitsResult,
      activeVisitsResult,
      monthlyVisitsResult,
      visitRatingsResult,
      lastVisitResult,
      // Order metrics (COUNTs + amounts only)
      totalOrdersResult,
      monthlyOrdersResult,
      totalRevenueResult,
      monthlyRevenueResult,
      lastOrderResult,
      // Promotion metrics (COUNTs)
      totalPromosResult,
      activePromosResult,
    ] = await Promise.all([
      // Brand info
      supabase
        .from('brands')
        .select(`*, tenants!brands_tenant_id_fkey(name, slug)`)
        .eq('id', targetBrandId)
        .single(),
      // Memberships (small set, need multiple derived values)
      supabase
        .from('client_brand_memberships')
        .select('id, membership_status, joined_date, points_balance')
        .eq('brand_id', targetBrandId)
        .is('deleted_at', null),
      // Visit counts — head:true returns only count, no data
      supabase.from('visits').select('id', { count: 'exact', head: true })
        .eq('brand_id', targetBrandId).is('deleted_at', null),
      supabase.from('visits').select('id', { count: 'exact', head: true })
        .eq('brand_id', targetBrandId).is('deleted_at', null).eq('visit_status', 'in_progress'),
      supabase.from('visits').select('id', { count: 'exact', head: true })
        .eq('brand_id', targetBrandId).is('deleted_at', null).gte('visit_date', monthStart),
      // Visit data — only ratings (filtered non-null) for avg calculation
      supabase.from('visits').select('client_satisfaction_rating')
        .eq('brand_id', targetBrandId).is('deleted_at', null)
        .not('client_satisfaction_rating', 'is', null),
      // Last visit date — order desc limit 1
      supabase.from('visits').select('visit_date')
        .eq('brand_id', targetBrandId).is('deleted_at', null)
        .not('visit_date', 'is', null)
        .order('visit_date', { ascending: false }).limit(1),
      // Order counts
      supabase.from('active_orders').select('id', { count: 'exact', head: true })
        .eq('brand_id', targetBrandId),
      supabase.from('active_orders').select('id', { count: 'exact', head: true })
        .eq('brand_id', targetBrandId).gte('order_date', monthStart),
      // Order amounts — only total_amount column
      supabase.from('active_orders').select('total_amount')
        .eq('brand_id', targetBrandId),
      supabase.from('active_orders').select('total_amount')
        .eq('brand_id', targetBrandId).gte('order_date', monthStart),
      // Last order date
      supabase.from('active_orders').select('order_date')
        .not('order_date', 'is', null)
        .eq('brand_id', targetBrandId)
        .order('order_date', { ascending: false }).limit(1),
      // Promotion counts
      supabase.from('active_promotions').select('id', { count: 'exact', head: true })
        .eq('brand_id', targetBrandId),
      supabase.from('active_promotions').select('id', { count: 'exact', head: true })
        .eq('brand_id', targetBrandId).eq('status', 'active'),
    ])

    const brandInfo = brandResult.data
    if (brandResult.error || !brandInfo) {
      throw new Error('Marca no encontrada')
    }

    // Membership metrics (full fetch — small set, multiple derived values)
    const memberships = membershipsResult.data
    const totalClients = memberships?.length || 0
    const activeClients = memberships?.filter(m => m.membership_status === 'active').length || 0
    const pendingClients = memberships?.filter(m => m.membership_status === 'pending').length || 0
    const totalPointsBalance = memberships?.reduce((sum, m) => sum + (Number(m.points_balance) || 0), 0) || 0
    const avgClientPoints = totalClients > 0 ? Math.round((totalPointsBalance / totalClients) * 100) / 100 : 0

    const membershipDates = memberships
      ?.filter(m => m.joined_date)
      .map(m => new Date(m.joined_date!))
      .sort((a, b) => a.getTime() - b.getTime()) || []
    const firstMembershipDate = membershipDates.length > 0 ? membershipDates[0].toISOString() : null
    const lastMembershipDate = membershipDates.length > 0 ? membershipDates[membershipDates.length - 1].toISOString() : null

    // Visit metrics (from COUNT queries — no full table scan)
    const totalVisits = totalVisitsResult.count || 0
    const activeVisitsCount = activeVisitsResult.count || 0
    const monthlyVisits = monthlyVisitsResult.count || 0

    const visitRatings = visitRatingsResult.data?.map((v: any) => v.client_satisfaction_rating as number) || []
    const avgVisitRating = visitRatings.length > 0
      ? Math.round((visitRatings.reduce((sum: number, r: number) => sum + r, 0) / visitRatings.length) * 10) / 10
      : 0
    const lastVisitDate = lastVisitResult.data?.[0]?.visit_date || null

    // Order metrics (from COUNT + amount-only queries)
    const totalOrders = totalOrdersResult.count || 0
    const monthlyOrders = monthlyOrdersResult.count || 0
    const totalRevenue = totalRevenueResult.data?.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0) || 0
    const monthlyRevenue = monthlyRevenueResult.data?.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0) || 0
    const lastOrderDate = lastOrderResult.data?.[0]?.order_date || null

    // Promotion metrics (from COUNT queries)
    const totalPromotions = totalPromosResult.count || 0
    const activePromotions = activePromosResult.count || 0

    // Derived metrics
    const conversionRate = totalVisits > 0
      ? Math.round((totalOrders / totalVisits) * 1000) / 10
      : 0
    const revenuePerClient = activeClients > 0
      ? Math.round((totalRevenue / activeClients) * 100) / 100
      : 0

    const realMetrics = {
      brand_id: brandInfo.id,
      brand_public_id: brandInfo.public_id,
      tenant_id: brandInfo.tenant_id,
      brand_name: brandInfo.name,
      brand_slug: brandInfo.slug,
      logo_url: brandInfo.logo_url,
      brand_color_primary: brandInfo.brand_color_primary,
      brand_color_secondary: brandInfo.brand_color_secondary,
      website: brandInfo.website,
      contact_email: brandInfo.contact_email,
      contact_phone: brandInfo.contact_phone,
      status: brandInfo.status,
      settings: brandInfo.settings || {},
      created_at: brandInfo.created_at,
      updated_at: brandInfo.updated_at,
      tenant_name: brandInfo.tenants?.name || 'Sin Tenant',
      tenant_slug: brandInfo.tenants?.slug || 'sin-tenant',

      total_clients: totalClients,
      active_clients: activeClients,
      pending_clients: pendingClients,
      avg_client_points: avgClientPoints,
      total_points_balance: totalPointsBalance,

      total_visits: totalVisits,
      monthly_visits: monthlyVisits,
      active_visits: activeVisitsCount,
      avg_visit_rating: avgVisitRating,

      total_orders: totalOrders,
      monthly_orders: monthlyOrders,
      total_revenue: totalRevenue,
      monthly_revenue: monthlyRevenue,

      active_promotions: activePromotions,
      total_promotions: totalPromotions,

      conversion_rate: conversionRate,
      revenue_per_client: revenuePerClient,

      first_membership_date: firstMembershipDate,
      last_membership_date: lastMembershipDate,
      last_visit_date: lastVisitDate,
      last_order_date: lastOrderDate,
    }

    return NextResponse.json(realMetrics)
  } catch (error) {
    console.error('Error in brand metrics API:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    const statusCode = errorMessage.includes('no autenticado') ? 401 :
                      errorMessage.includes('No se encontró') ? 404 : 500

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
