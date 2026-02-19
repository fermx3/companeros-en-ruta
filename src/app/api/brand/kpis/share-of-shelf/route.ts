import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/kpis/share-of-shelf?month=2026-02
 * Returns POP + exhibition execution metrics by zone
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

    const { data: sosData } = await supabase
      .from('v_kpi_share_of_shelf')
      .select('zone_id, zone_name, pop_pct, exhib_pct, combined_pct, pop_total, pop_present, exhib_total, exhib_executed')
      .eq('brand_id', brandId)
      .eq('period_month', periodMonth)

    const by_zone = (sosData || []).map(row => ({
      zone_id: row.zone_id,
      zone_name: row.zone_name,
      combined_pct: Number(row.combined_pct) || 0,
      pop_pct: Number(row.pop_pct) || 0,
      exhib_pct: Number(row.exhib_pct) || 0,
    })).sort((a, b) => b.combined_pct - a.combined_pct)

    // Totals
    const totalPopPresent = (sosData || []).reduce((s, r) => s + (Number(r.pop_present) || 0), 0)
    const totalPopAll = (sosData || []).reduce((s, r) => s + (Number(r.pop_total) || 0), 0)
    const totalExhibExec = (sosData || []).reduce((s, r) => s + (Number(r.exhib_executed) || 0), 0)
    const totalExhibAll = (sosData || []).reduce((s, r) => s + (Number(r.exhib_total) || 0), 0)

    const pop_pct = totalPopAll > 0 ? Math.round(totalPopPresent / totalPopAll * 1000) / 10 : 0
    const exhib_pct = totalExhibAll > 0 ? Math.round(totalExhibExec / totalExhibAll * 1000) / 10 : 0
    const totalAll = totalPopAll + totalExhibAll
    const combined_pct = totalAll > 0
      ? Math.round((totalPopPresent + totalExhibExec) / totalAll * 1000) / 10
      : 0

    // Target
    const { data: target } = await supabase
      .from('kpi_targets')
      .select('target_value')
      .eq('brand_id', brandId)
      .eq('kpi_slug', 'share_of_shelf')
      .eq('period_type', 'monthly')
      .eq('period_start', periodMonth)
      .is('zone_id', null)
      .is('deleted_at', null)
      .maybeSingle()

    const targetValue = target?.target_value ? Number(target.target_value) : null
    const achievement_pct = targetValue && targetValue > 0
      ? Math.round(combined_pct / targetValue * 1000) / 10
      : null

    return Response.json({
      combined_pct,
      pop_pct,
      exhib_pct,
      by_zone,
      target: targetValue,
      achievement_pct,
    })
  } catch (error) {
    console.error('Error in GET /api/brand/kpis/share-of-shelf:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
