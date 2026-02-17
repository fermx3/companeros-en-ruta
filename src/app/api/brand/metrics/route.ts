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

    // Obtener información real de la marca
    const { data: brandInfo, error: brandError } = await supabase
      .from('brands')
      .select(`
        *,
        tenants!brands_tenant_id_fkey(
          name,
          slug
        )
      `)
      .eq('id', targetBrandId)
      .single()

    if (brandError || !brandInfo) {
      throw new Error('Marca no encontrada')
    }

    // Obtener métricas reales de client_brand_memberships
    const { data: memberships, error: membershipsError } = await supabase
      .from('client_brand_memberships')
      .select('id, membership_status, joined_date, lifetime_points, points_balance, last_purchase_date, created_at')
      .eq('brand_id', targetBrandId)
      .is('deleted_at', null)

    if (membershipsError) {
      console.error('Error al obtener membresías:', membershipsError)
    }

    // Calcular métricas desde client_brand_memberships
    const totalClients = memberships?.length || 0
    const activeClients = memberships?.filter(m => m.membership_status === 'active').length || 0
    const pendingClients = memberships?.filter(m => m.membership_status === 'pending').length || 0

    const totalPointsBalance = memberships?.reduce((sum, m) => sum + (Number(m.points_balance) || 0), 0) || 0
    const avgClientPoints = totalClients > 0 ? Math.round((totalPointsBalance / totalClients) * 100) / 100 : 0

    // Fechas de membresía
    const membershipDates = memberships
      ?.filter(m => m.joined_date)
      .map(m => new Date(m.joined_date!))
      .sort((a, b) => a.getTime() - b.getTime()) || []

    const firstMembershipDate = membershipDates.length > 0 ? membershipDates[0].toISOString() : null
    const lastMembershipDate = membershipDates.length > 0 ? membershipDates[membershipDates.length - 1].toISOString() : null

    // Visits — direct query (active_visits view does not have brand_id)
    const { data: visitRows } = await supabase
      .from('visits')
      .select('id, visit_status, visit_date, client_satisfaction_rating')
      .eq('brand_id', targetBrandId)
      .is('deleted_at', null)

    const totalVisits = visitRows?.length || 0
    const activeVisitsCount = visitRows?.filter(v => v.visit_status === 'in_progress').length || 0

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const monthlyVisits = visitRows?.filter(v => v.visit_date && v.visit_date >= monthStart).length || 0

    const visitRatings = visitRows?.filter(v => v.client_satisfaction_rating != null).map(v => v.client_satisfaction_rating as number) || []
    const avgVisitRating = visitRatings.length > 0
      ? Math.round((visitRatings.reduce((sum, r) => sum + r, 0) / visitRatings.length) * 10) / 10
      : 0

    const visitDates = visitRows?.filter(v => v.visit_date).map(v => v.visit_date as string).sort() || []
    const lastVisitDate = visitDates.length > 0 ? visitDates[visitDates.length - 1] : null

    // Orders — use active_orders view
    const { data: orderRows } = await supabase
      .from('active_orders')
      .select('id, order_status, order_date, total_amount')
      .eq('brand_id', targetBrandId)

    const totalOrders = orderRows?.length || 0
    const monthlyOrders = orderRows?.filter(o => o.order_date && o.order_date >= monthStart).length || 0
    const totalRevenue = orderRows?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0
    const monthlyRevenue = orderRows
      ?.filter(o => o.order_date && o.order_date >= monthStart)
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0

    const orderDates = orderRows?.filter(o => o.order_date).map(o => o.order_date as string).sort() || []
    const lastOrderDate = orderDates.length > 0 ? orderDates[orderDates.length - 1] : null

    // Promotions — use active_promotions view
    const { data: promoRows } = await supabase
      .from('active_promotions')
      .select('id, status')
      .eq('brand_id', targetBrandId)

    const totalPromotions = promoRows?.length || 0
    const activePromotions = promoRows?.filter(p => p.status === 'active').length || 0

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
