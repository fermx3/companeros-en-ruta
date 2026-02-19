import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/kpis/mix?month=2026-02
 * Returns channel diversity: distinct markets visited with client counts
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

    // Get mix summary
    const { data: mixData } = await supabase
      .from('v_kpi_mix')
      .select('distinct_markets_visited, distinct_client_types_visited, total_clients_visited')
      .eq('brand_id', brandId)
      .eq('period_month', periodMonth)
      .maybeSingle()

    // Get per-market breakdown from the base visit facts
    const { data: channelData } = await supabase
      .from('v_visit_assessment_facts')
      .select('market_id, market_name, client_id')
      .eq('brand_id', brandId)
      .eq('period_month', periodMonth)
      .not('market_id', 'is', null)

    // Aggregate: distinct clients per market
    const marketMap = new Map<string, { market_id: string; market_name: string; clients: Set<string> }>()
    for (const row of channelData || []) {
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

    const distinct_count = mixData?.distinct_markets_visited || channels.length

    // Target
    const { data: target } = await supabase
      .from('kpi_targets')
      .select('target_value')
      .eq('brand_id', brandId)
      .eq('kpi_slug', 'mix')
      .eq('period_type', 'monthly')
      .eq('period_start', periodMonth)
      .is('zone_id', null)
      .is('deleted_at', null)
      .maybeSingle()

    const targetValue = target?.target_value ? Number(target.target_value) : null
    const achievement_pct = targetValue && targetValue > 0
      ? Math.round(distinct_count / targetValue * 1000) / 10
      : null

    return Response.json({
      channels,
      distinct_count,
      target: targetValue,
      achievement_pct,
    })
  } catch (error) {
    console.error('Error in GET /api/brand/kpis/mix:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
