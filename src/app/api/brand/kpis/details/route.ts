import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { cachedJsonResponse } from '@/lib/api/cache-headers'

/**
 * GET /api/brand/kpis/details?month=2026-02
 *
 * Consolidated endpoint that returns detail data for ALL selected KPIs in one request.
 * Replaces 5 individual detail fetches (volume, reach, mix, assortment, market-share, share-of-shelf)
 * each with their own auth call, into a single auth + parallel data fetch.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)
    const periodMonth = `${month}-01`

    // Get brand's selected KPI slugs
    const { data: brand } = await supabase
      .from('brands')
      .select('dashboard_metrics')
      .eq('id', brandId)
      .single()

    const selectedSlugs: string[] = brand?.dashboard_metrics ||
      ['volume', 'reach_mix', 'assortment', 'market_share', 'share_of_shelf']

    // Fetch all view data + targets in parallel
    const slugSet = new Set(selectedSlugs)

    const [
      volumeData,
      reachData,
      mixData,
      channelData,
      assortmentData,
      marketShareData,
      shareOfShelfData,
      targetsData,
    ] = await Promise.all([
      slugSet.has('volume')
        ? supabase.from('v_kpi_volume')
            .select('period_week, zone_id, zone_name, revenue_mxn, weight_tons')
            .eq('brand_id', brandId)
            .eq('period_month', periodMonth)
        : null,
      slugSet.has('reach_mix')
        ? supabase.from('v_kpi_reach')
            .select('zone_id, zone_name, market_id, market_name, clients_visited, total_active_members, reach_pct')
            .eq('brand_id', brandId)
            .eq('period_month', periodMonth)
        : null,
      slugSet.has('mix')
        ? supabase.from('v_kpi_mix')
            .select('distinct_markets_visited, distinct_client_types_visited, total_clients_visited')
            .eq('brand_id', brandId)
            .eq('period_month', periodMonth)
            .maybeSingle()
        : null,
      slugSet.has('mix')
        ? supabase.from('v_visit_assessment_facts')
            .select('market_id, market_name, client_id')
            .eq('brand_id', brandId)
            .eq('period_month', periodMonth)
            .not('market_id', 'is', null)
        : null,
      slugSet.has('assortment')
        ? supabase.from('v_kpi_assortment')
            .select('zone_id, zone_name, avg_assortment_pct, visit_count')
            .eq('brand_id', brandId)
            .eq('period_month', periodMonth)
        : null,
      slugSet.has('market_share')
        ? supabase.from('v_kpi_market_share')
            .select('zone_id, zone_name, brand_present, competitor_present, share_pct, brand_facings, competitor_facings, share_by_facings_pct')
            .eq('brand_id', brandId)
            .eq('period_month', periodMonth)
        : null,
      slugSet.has('share_of_shelf')
        ? supabase.from('v_kpi_share_of_shelf')
            .select('zone_id, zone_name, pop_pct, exhib_pct, combined_pct, pop_total, pop_present, exhib_total, exhib_executed')
            .eq('brand_id', brandId)
            .eq('period_month', periodMonth)
        : null,
      // Batch targets — single query for all selected slugs
      supabase.from('kpi_targets')
        .select('kpi_slug, target_value')
        .eq('brand_id', brandId)
        .eq('period_type', 'monthly')
        .eq('period_start', periodMonth)
        .is('zone_id', null)
        .is('deleted_at', null)
        .in('kpi_slug', selectedSlugs),
    ])

    // Build targets map
    const targetMap = new Map<string, number>()
    for (const t of targetsData?.data || []) {
      if (t.target_value) targetMap.set(t.kpi_slug, Number(t.target_value))
    }

    // Process each KPI
    const details: Record<string, Record<string, unknown>> = {}

    if (slugSet.has('volume')) {
      details.volume = processVolume(volumeData?.data || [], targetMap.get('volume'))
    }
    if (slugSet.has('reach_mix')) {
      details.reach_mix = processReach(reachData?.data || [], targetMap.get('reach_mix'))
    }
    if (slugSet.has('mix')) {
      details.mix = processMix(mixData?.data || null, channelData?.data || [], targetMap.get('mix'))
    }
    if (slugSet.has('assortment')) {
      details.assortment = processAssortment(assortmentData?.data || [], targetMap.get('assortment'))
    }
    if (slugSet.has('market_share')) {
      details.market_share = processMarketShare(marketShareData?.data || [], targetMap.get('market_share'))
    }
    if (slugSet.has('share_of_shelf')) {
      details.share_of_shelf = processShareOfShelf(shareOfShelfData?.data || [], targetMap.get('share_of_shelf'))
    }

    return cachedJsonResponse(details)
  } catch (error) {
    console.error('Error in GET /api/brand/kpis/details:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

function achievement(value: number, target: number | undefined): number | null {
  return target && target > 0 ? Math.round(value / target * 1000) / 10 : null
}

function processVolume(rows: any[], target: number | undefined) {
  // Weekly aggregation
  const weeklyMap = new Map<string, { revenue: number; weight_tons: number }>()
  for (const row of rows) {
    const key = row.period_week
    const existing = weeklyMap.get(key) || { revenue: 0, weight_tons: 0 }
    existing.revenue += Number(row.revenue_mxn) || 0
    existing.weight_tons += Number(row.weight_tons) || 0
    weeklyMap.set(key, existing)
  }
  const weekly = Array.from(weeklyMap.entries())
    .map(([week, data]) => ({ week, ...data }))
    .sort((a, b) => a.week.localeCompare(b.week))

  // Zone aggregation
  const zoneMap = new Map<string, { zone_id: string | null; zone_name: string | null; revenue: number; weight_tons: number }>()
  for (const row of rows) {
    const key = row.zone_id || '__none__'
    const existing = zoneMap.get(key) || { zone_id: row.zone_id, zone_name: row.zone_name, revenue: 0, weight_tons: 0 }
    existing.revenue += Number(row.revenue_mxn) || 0
    existing.weight_tons += Number(row.weight_tons) || 0
    zoneMap.set(key, existing)
  }
  const by_zone = Array.from(zoneMap.values()).sort((a, b) => b.revenue - a.revenue)

  const monthly_total = by_zone.reduce((sum, z) => sum + z.revenue, 0)
  const weight_tons_total = by_zone.reduce((sum, z) => sum + z.weight_tons, 0)

  return {
    weekly,
    monthly_total,
    weight_tons_total,
    by_zone,
    target: target ?? null,
    achievement_pct: achievement(monthly_total, target),
  }
}

function processReach(rows: any[], target: number | undefined) {
  const zoneMap = new Map<string, {
    zone_id: string | null; zone_name: string | null;
    clients_visited: number; total_active_members: number
  }>()

  for (const row of rows) {
    const key = row.zone_id || '__none__'
    const existing = zoneMap.get(key)
    if (!existing) {
      zoneMap.set(key, {
        zone_id: row.zone_id,
        zone_name: row.zone_name,
        clients_visited: Number(row.clients_visited) || 0,
        total_active_members: Number(row.total_active_members) || 0,
      })
    } else {
      existing.clients_visited += Number(row.clients_visited) || 0
    }
  }

  const by_zone = Array.from(zoneMap.values()).map(z => ({
    ...z,
    reach_pct: z.total_active_members > 0
      ? Math.round(z.clients_visited / z.total_active_members * 1000) / 10
      : 0,
  })).sort((a, b) => b.reach_pct - a.reach_pct)

  const totalVisited = by_zone.reduce((sum, z) => sum + z.clients_visited, 0)
  const totalMembers = by_zone.length > 0 ? by_zone[0].total_active_members : 0
  const reach_pct = totalMembers > 0
    ? Math.round(totalVisited / totalMembers * 1000) / 10
    : 0

  return {
    by_zone,
    monthly_total_visited: totalVisited,
    total_active_members: totalMembers,
    reach_pct,
    target: target ?? null,
    achievement_pct: achievement(reach_pct, target),
  }
}

function processMix(mixSummary: any | null, channelRows: any[], target: number | undefined) {
  const marketMap = new Map<string, { market_id: string; market_name: string; clients: Set<string> }>()
  for (const row of channelRows) {
    if (!row.market_id) continue
    const existing = marketMap.get(row.market_id)
    if (!existing) {
      marketMap.set(row.market_id, {
        market_id: row.market_id,
        market_name: row.market_name || '',
        clients: new Set([row.client_id]),
      })
    } else {
      existing.clients.add(row.client_id)
    }
  }

  const channels = Array.from(marketMap.values())
    .map(m => ({ market_id: m.market_id, market_name: m.market_name, client_count: m.clients.size }))
    .sort((a, b) => b.client_count - a.client_count)

  const distinct_count = mixSummary?.distinct_markets_visited || channels.length

  return {
    channels,
    distinct_count,
    target: target ?? null,
    achievement_pct: achievement(distinct_count, target),
  }
}

function processAssortment(rows: any[], target: number | undefined) {
  const by_zone = rows.map(row => ({
    zone_id: row.zone_id,
    zone_name: row.zone_name,
    avg_pct: Number(row.avg_assortment_pct) || 0,
    visit_count: Number(row.visit_count) || 0,
  })).sort((a, b) => b.avg_pct - a.avg_pct)

  const totalVisits = by_zone.reduce((sum, z) => sum + z.visit_count, 0)
  const avg_pct = totalVisits > 0
    ? Math.round(by_zone.reduce((sum, z) => sum + z.avg_pct * z.visit_count, 0) / totalVisits * 10) / 10
    : 0

  return {
    avg_pct,
    by_zone,
    target: target ?? null,
    achievement_pct: achievement(avg_pct, target),
  }
}

function processMarketShare(rows: any[], target: number | undefined) {
  const by_zone = rows.map(row => ({
    zone_id: row.zone_id,
    zone_name: row.zone_name,
    share_pct: Number(row.share_pct) || 0,
    brand_present: Number(row.brand_present) || 0,
    competitor_present: Number(row.competitor_present) || 0,
  })).sort((a, b) => b.share_pct - a.share_pct)

  const totalBrand = by_zone.reduce((sum, z) => sum + z.brand_present, 0)
  const totalComp = by_zone.reduce((sum, z) => sum + z.competitor_present, 0)
  const totalAll = totalBrand + totalComp
  const share_pct = totalAll > 0 ? Math.round(totalBrand / totalAll * 1000) / 10 : 0

  const totalBrandFacings = rows.reduce((sum, r) => sum + (Number(r.brand_facings) || 0), 0)
  const totalCompFacings = rows.reduce((sum, r) => sum + (Number(r.competitor_facings) || 0), 0)
  const totalFacings = totalBrandFacings + totalCompFacings
  const share_by_facings_pct = totalFacings > 0
    ? Math.round(totalBrandFacings / totalFacings * 1000) / 10
    : 0

  return {
    share_pct,
    brand_present: totalBrand,
    competitor_present: totalComp,
    share_by_facings_pct,
    by_zone,
    target: target ?? null,
    achievement_pct: achievement(share_pct, target),
  }
}

function processShareOfShelf(rows: any[], target: number | undefined) {
  const by_zone = rows.map(row => ({
    zone_id: row.zone_id,
    zone_name: row.zone_name,
    combined_pct: Number(row.combined_pct) || 0,
    pop_pct: Number(row.pop_pct) || 0,
    exhib_pct: Number(row.exhib_pct) || 0,
  })).sort((a, b) => b.combined_pct - a.combined_pct)

  const totalPopPresent = rows.reduce((s, r) => s + (Number(r.pop_present) || 0), 0)
  const totalPopAll = rows.reduce((s, r) => s + (Number(r.pop_total) || 0), 0)
  const totalExhibExec = rows.reduce((s, r) => s + (Number(r.exhib_executed) || 0), 0)
  const totalExhibAll = rows.reduce((s, r) => s + (Number(r.exhib_total) || 0), 0)

  const pop_pct = totalPopAll > 0 ? Math.round(totalPopPresent / totalPopAll * 1000) / 10 : 0
  const exhib_pct = totalExhibAll > 0 ? Math.round(totalExhibExec / totalExhibAll * 1000) / 10 : 0
  const totalAll = totalPopAll + totalExhibAll
  const combined_pct = totalAll > 0
    ? Math.round((totalPopPresent + totalExhibExec) / totalAll * 1000) / 10
    : 0

  return {
    combined_pct,
    pop_pct,
    exhib_pct,
    by_zone,
    target: target ?? null,
    achievement_pct: achievement(combined_pct, target),
  }
}
