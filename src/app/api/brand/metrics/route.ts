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

      total_visits: 0,
      monthly_visits: 0,
      active_visits: 0,
      avg_visit_rating: 0,

      total_orders: 0,
      monthly_orders: 0,
      total_revenue: 0,
      monthly_revenue: 0,

      active_promotions: 0,
      total_promotions: 0,

      conversion_rate: 0,
      revenue_per_client: 0,

      first_membership_date: firstMembershipDate,
      last_membership_date: lastMembershipDate,
      last_visit_date: null,
      last_order_date: null
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
