import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/kpis/reach?month=2026-02
 * Returns reach data by zone, monthly totals, target + achievement
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

    const { data: reachData } = await supabase
      .from('v_kpi_reach')
      .select('zone_id, zone_name, market_id, market_name, clients_visited, total_active_members, reach_pct')
      .eq('brand_id', brandId)
      .eq('period_month', periodMonth)

    // Aggregate by zone
    const zoneMap = new Map<string, {
      zone_id: string | null; zone_name: string | null;
      clients_visited: number; total_active_members: number
    }>()
    let totalVisited = 0
    let totalMembers = 0

    for (const row of reachData || []) {
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

    // Overall totals — get total unique clients visited from all zones
    totalVisited = by_zone.reduce((sum, z) => sum + z.clients_visited, 0)
    totalMembers = by_zone.length > 0 ? by_zone[0].total_active_members : 0

    const reach_pct = totalMembers > 0
      ? Math.round(totalVisited / totalMembers * 1000) / 10
      : 0

    // Target
    const { data: target } = await supabase
      .from('kpi_targets')
      .select('target_value')
      .eq('brand_id', brandId)
      .eq('kpi_slug', 'reach_mix')
      .eq('period_type', 'monthly')
      .eq('period_start', periodMonth)
      .is('zone_id', null)
      .is('deleted_at', null)
      .maybeSingle()

    const targetValue = target?.target_value ? Number(target.target_value) : null
    const achievement_pct = targetValue && targetValue > 0
      ? Math.round(reach_pct / targetValue * 1000) / 10
      : null

    return Response.json({
      by_zone,
      monthly_total_visited: totalVisited,
      total_active_members: totalMembers,
      reach_pct,
      target: targetValue,
      achievement_pct,
    })
  } catch (error) {
    console.error('Error in GET /api/brand/kpis/reach:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
