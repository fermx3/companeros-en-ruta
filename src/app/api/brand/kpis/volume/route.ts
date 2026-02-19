import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/kpis/volume?month=2026-02
 * Returns weekly bars, monthly total, breakdown by zone, target + achievement
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

    // Weekly data
    const { data: weeklyData } = await supabase
      .from('v_kpi_volume')
      .select('period_week, revenue_mxn, weight_tons')
      .eq('brand_id', brandId)
      .eq('period_month', periodMonth)

    const weeklyMap = new Map<string, { revenue: number; weight_tons: number }>()
    for (const row of weeklyData || []) {
      const key = row.period_week
      const existing = weeklyMap.get(key) || { revenue: 0, weight_tons: 0 }
      existing.revenue += Number(row.revenue_mxn) || 0
      existing.weight_tons += Number(row.weight_tons) || 0
      weeklyMap.set(key, existing)
    }
    const weekly = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week))

    // By zone
    const { data: zoneData } = await supabase
      .from('v_kpi_volume')
      .select('zone_id, zone_name, revenue_mxn, weight_tons')
      .eq('brand_id', brandId)
      .eq('period_month', periodMonth)

    const zoneMap = new Map<string, { zone_id: string | null; zone_name: string | null; revenue: number; weight_tons: number }>()
    for (const row of zoneData || []) {
      const key = row.zone_id || '__none__'
      const existing = zoneMap.get(key) || { zone_id: row.zone_id, zone_name: row.zone_name, revenue: 0, weight_tons: 0 }
      existing.revenue += Number(row.revenue_mxn) || 0
      existing.weight_tons += Number(row.weight_tons) || 0
      zoneMap.set(key, existing)
    }
    const by_zone = Array.from(zoneMap.values()).sort((a, b) => b.revenue - a.revenue)

    const monthly_total = by_zone.reduce((sum, z) => sum + z.revenue, 0)
    const weight_tons_total = by_zone.reduce((sum, z) => sum + z.weight_tons, 0)

    // Target
    const { data: target } = await supabase
      .from('kpi_targets')
      .select('target_value')
      .eq('brand_id', brandId)
      .eq('kpi_slug', 'volume')
      .eq('period_type', 'monthly')
      .eq('period_start', periodMonth)
      .is('zone_id', null)
      .is('deleted_at', null)
      .maybeSingle()

    const targetValue = target?.target_value ? Number(target.target_value) : null
    const achievement_pct = targetValue && targetValue > 0
      ? Math.round(monthly_total / targetValue * 1000) / 10
      : null

    return Response.json({
      weekly,
      monthly_total,
      weight_tons_total,
      by_zone,
      target: targetValue,
      achievement_pct,
    })
  } catch (error) {
    console.error('Error in GET /api/brand/kpis/volume:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
