import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/kpis/market-share?month=2026-02
 * Returns market share data: presence-based and facing-based, by zone
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

    const { data: msData } = await supabase
      .from('v_kpi_market_share')
      .select('zone_id, zone_name, brand_present, competitor_present, share_pct, brand_facings, competitor_facings, share_by_facings_pct')
      .eq('brand_id', brandId)
      .eq('period_month', periodMonth)

    const by_zone = (msData || []).map(row => ({
      zone_id: row.zone_id,
      zone_name: row.zone_name,
      share_pct: Number(row.share_pct) || 0,
      brand_present: Number(row.brand_present) || 0,
      competitor_present: Number(row.competitor_present) || 0,
    })).sort((a, b) => b.share_pct - a.share_pct)

    // Totals
    const totalBrand = by_zone.reduce((sum, z) => sum + z.brand_present, 0)
    const totalComp = by_zone.reduce((sum, z) => sum + z.competitor_present, 0)
    const totalAll = totalBrand + totalComp
    const share_pct = totalAll > 0 ? Math.round(totalBrand / totalAll * 1000) / 10 : 0

    const totalBrandFacings = (msData || []).reduce((sum, r) => sum + (Number(r.brand_facings) || 0), 0)
    const totalCompFacings = (msData || []).reduce((sum, r) => sum + (Number(r.competitor_facings) || 0), 0)
    const totalFacings = totalBrandFacings + totalCompFacings
    const share_by_facings_pct = totalFacings > 0
      ? Math.round(totalBrandFacings / totalFacings * 1000) / 10
      : 0

    // Target
    const { data: target } = await supabase
      .from('kpi_targets')
      .select('target_value')
      .eq('brand_id', brandId)
      .eq('kpi_slug', 'market_share')
      .eq('period_type', 'monthly')
      .eq('period_start', periodMonth)
      .is('zone_id', null)
      .is('deleted_at', null)
      .maybeSingle()

    const targetValue = target?.target_value ? Number(target.target_value) : null
    const achievement_pct = targetValue && targetValue > 0
      ? Math.round(share_pct / targetValue * 1000) / 10
      : null

    return Response.json({
      share_pct,
      brand_present: totalBrand,
      competitor_present: totalComp,
      share_by_facings_pct,
      by_zone,
      target: targetValue,
      achievement_pct,
    })
  } catch (error) {
    console.error('Error in GET /api/brand/kpis/market-share:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
