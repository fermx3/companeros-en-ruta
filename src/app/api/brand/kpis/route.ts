import { NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { cachedJsonResponse } from '@/lib/api/cache-headers'

interface KpiResult {
  slug: string
  label: string
  value: number
  unit: string
  icon: string
  color: string
  description: string
  period: string
}

/**
 * GET /api/brand/kpis
 * Calculate the selected KPIs for the current brand.
 * Returns up to 5 KPIs with computed values from assessment/order data.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result
    const serviceSupabase = createServiceClient()

    // 1. Get the brand's selected KPI slugs from dashboard_metrics
    const { data: brand } = await serviceSupabase
      .from('brands')
      .select('dashboard_metrics, dashboard_metrics_updated_at')
      .eq('id', brandId)
      .single()

    const selectedSlugs: string[] = brand?.dashboard_metrics || ['volume', 'reach_mix', 'assortment', 'market_share', 'share_of_shelf']

    // 2. Get KPI definitions for the selected slugs
    const { data: kpiDefs } = await serviceSupabase
      .from('kpi_definitions')
      .select('slug, label, description, icon, color, computation_type')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .in('slug', selectedSlugs)
      .order('display_order', { ascending: true })

    if (!kpiDefs || kpiDefs.length === 0) {
      return Response.json({
        kpis: [],
        dashboard_metrics_updated_at: brand?.dashboard_metrics_updated_at,
        selected_slugs: selectedSlugs,
      })
    }

    // 3. Calculate each KPI
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd = now.toISOString()
    const period = `${now.toLocaleString('es-MX', { month: 'long' })} ${now.getFullYear()}`

    const kpis: KpiResult[] = await Promise.all(
      kpiDefs.map(async (def) => {
        const value = await computeKpi(serviceSupabase, brandId, def.computation_type, monthStart, monthEnd)
        return {
          slug: def.slug,
          label: def.label,
          value,
          unit: getKpiUnit(def.computation_type),
          icon: def.icon || 'TrendingUp',
          color: def.color || 'blue',
          description: def.description || '',
          period,
        }
      })
    )

    // Maintain original selection order
    const orderedKpis = selectedSlugs
      .map(slug => kpis.find(k => k.slug === slug))
      .filter(Boolean) as KpiResult[]

    return cachedJsonResponse({
      kpis: orderedKpis,
      dashboard_metrics_updated_at: brand?.dashboard_metrics_updated_at,
      selected_slugs: selectedSlugs,
    })
  } catch (error) {
    console.error('Error in GET /api/brand/kpis:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

function getKpiUnit(computationType: string): string {
  switch (computationType) {
    case 'volume': return 'MXN'
    case 'reach_mix': return '%'
    case 'assortment': return '%'
    case 'market_share': return '%'
    case 'share_of_shelf': return '%'
    default: return ''
  }
}

async function computeKpi(
  supabase: any, brandId: string, computationType: string,
  monthStart: string, monthEnd: string
): Promise<number> {
  switch (computationType) {
    case 'volume':
      return computeVolume(supabase, brandId, monthStart, monthEnd)
    case 'reach_mix':
      return computeReachMix(supabase, brandId, monthStart, monthEnd)
    case 'assortment':
      return computeAssortment(supabase, brandId, monthStart, monthEnd)
    case 'market_share':
      return computeMarketShare(supabase, brandId, monthStart, monthEnd)
    case 'share_of_shelf':
      return computeShareOfShelf(supabase, brandId, monthStart, monthEnd)
    default:
      return 0
  }
}

/**
 * Volume: Sum of total_amount from orders in the period
 */
async function computeVolume(supabase: any, brandId: string, start: string, end: string): Promise<number> {
  const { data } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('brand_id', brandId)
    .is('deleted_at', null)
    .gte('order_date', start)
    .lte('order_date', end)
    .not('order_status', 'in', '("cancelled","returned")')

  if (!data || data.length === 0) return 0
  return data.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0)
}

/**
 * Reach & Mix: (unique clients visited / total clients) * 100
 */
async function computeReachMix(supabase: any, brandId: string, start: string, end: string): Promise<number> {
  // Total clients and visited clients are independent — fetch in parallel
  const [{ count: totalClients }, { data: visits }] = await Promise.all([
    supabase
      .from('client_brand_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('membership_status', 'active')
      .is('deleted_at', null),
    supabase
      .from('visits')
      .select('client_id')
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .gte('visit_date', start)
      .lte('visit_date', end),
  ])

  if (!totalClients || totalClients === 0) return 0
  if (!visits || visits.length === 0) return 0

  const uniqueClients = new Set(visits.map((v: any) => v.client_id))
  return Math.round((uniqueClients.size / totalClients) * 100 * 10) / 10
}

/**
 * Assortment: avg % of brand products present per visit
 */
async function computeAssortment(supabase: any, brandId: string, start: string, end: string): Promise<number> {
  // Products count and visits are independent — fetch in parallel
  const [{ count: totalProducts }, { data: visits }] = await Promise.all([
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .eq('include_in_assessment', true)
      .is('deleted_at', null),
    supabase
      .from('visits')
      .select('id')
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .gte('visit_date', start)
      .lte('visit_date', end),
  ])

  if (!totalProducts || totalProducts === 0) return 0
  if (!visits || visits.length === 0) return 0

  const visitIds = visits.map((v: any) => v.id)

  // Product assessments
  const { data: assessments } = await supabase
    .from('visit_brand_product_assessments')
    .select('visit_id, is_product_present')
    .in('visit_id', visitIds)

  if (!assessments || assessments.length === 0) return 0

  // Group by visit and calculate % present
  const visitGroups: Record<string, { present: number; total: number }> = {}
  for (const a of assessments) {
    if (!visitGroups[a.visit_id]) visitGroups[a.visit_id] = { present: 0, total: 0 }
    visitGroups[a.visit_id].total++
    if (a.is_product_present) visitGroups[a.visit_id].present++
  }

  const percentages = Object.values(visitGroups).map(g => (g.present / g.total) * 100)
  const avg = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
  return Math.round(avg * 10) / 10
}

/**
 * Market Share: brand products present / (brand + competitor products present) * 100
 */
async function computeMarketShare(supabase: any, brandId: string, start: string, end: string): Promise<number> {
  const { data: visits } = await supabase
    .from('visits')
    .select('id')
    .eq('brand_id', brandId)
    .is('deleted_at', null)
    .gte('visit_date', start)
    .lte('visit_date', end)

  if (!visits || visits.length === 0) return 0
  const visitIds = visits.map((v: any) => v.id)

  // Brand and competitor counts are independent — fetch in parallel
  const [{ count: brandPresent }, { count: competitorPresent }] = await Promise.all([
    supabase
      .from('visit_brand_product_assessments')
      .select('id', { count: 'exact', head: true })
      .in('visit_id', visitIds)
      .eq('is_product_present', true),
    supabase
      .from('visit_competitor_assessments')
      .select('id', { count: 'exact', head: true })
      .in('visit_id', visitIds),
  ])

  const total = (brandPresent || 0) + (competitorPresent || 0)
  if (total === 0) return 0

  return Math.round(((brandPresent || 0) / total) * 100 * 10) / 10
}

/**
 * Share of Shelf: (POP present + exhibitions executed) / total checks * 100
 */
async function computeShareOfShelf(supabase: any, brandId: string, start: string, end: string): Promise<number> {
  const { data: visits } = await supabase
    .from('visits')
    .select('id')
    .eq('brand_id', brandId)
    .is('deleted_at', null)
    .gte('visit_date', start)
    .lte('visit_date', end)

  if (!visits || visits.length === 0) return 0
  const visitIds = visits.map((v: any) => v.id)

  // POP and exhibition checks are independent — fetch in parallel
  const [{ data: popChecks }, { data: exhibChecks }] = await Promise.all([
    supabase
      .from('visit_pop_material_checks')
      .select('is_present')
      .in('visit_id', visitIds),
    supabase
      .from('visit_exhibition_checks')
      .select('is_executed')
      .in('visit_id', visitIds),
  ])

  const popTotal = popChecks?.length || 0
  const popPresent = popChecks?.filter((c: any) => c.is_present).length || 0
  const exhibTotal = exhibChecks?.length || 0
  const exhibExecuted = exhibChecks?.filter((c: any) => c.is_executed).length || 0

  const total = popTotal + exhibTotal
  if (total === 0) return 0

  const present = popPresent + exhibExecuted
  return Math.round((present / total) * 100 * 10) / 10
}
