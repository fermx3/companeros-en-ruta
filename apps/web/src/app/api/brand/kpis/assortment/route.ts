import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/kpis/assortment?month=2026-02
 * Returns assortment % by zone and overall average
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

    const { data: assortmentData } = await supabase
      .from('v_kpi_assortment')
      .select('zone_id, zone_name, avg_assortment_pct, visit_count')
      .eq('brand_id', brandId)
      .eq('period_month', periodMonth)

    const by_zone = (assortmentData || []).map(row => ({
      zone_id: row.zone_id,
      zone_name: row.zone_name,
      avg_pct: Number(row.avg_assortment_pct) || 0,
      visit_count: Number(row.visit_count) || 0,
    })).sort((a, b) => b.avg_pct - a.avg_pct)

    // Weighted average across zones
    const totalVisits = by_zone.reduce((sum, z) => sum + z.visit_count, 0)
    const avg_pct = totalVisits > 0
      ? Math.round(by_zone.reduce((sum, z) => sum + z.avg_pct * z.visit_count, 0) / totalVisits * 10) / 10
      : 0

    // Target
    const { data: target } = await supabase
      .from('kpi_targets')
      .select('target_value')
      .eq('brand_id', brandId)
      .eq('kpi_slug', 'assortment')
      .eq('period_type', 'monthly')
      .eq('period_start', periodMonth)
      .is('zone_id', null)
      .is('deleted_at', null)
      .maybeSingle()

    const targetValue = target?.target_value ? Number(target.target_value) : null
    const achievement_pct = targetValue && targetValue > 0
      ? Math.round(avg_pct / targetValue * 1000) / 10
      : null

    return Response.json({
      avg_pct,
      by_zone,
      target: targetValue,
      achievement_pct,
    })
  } catch (error) {
    console.error('Error in GET /api/brand/kpis/assortment:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
