import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/kpis/summary?month=2026-02
 * Returns all KPIs with actual/target/achievement for ring displays
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)
    const periodMonth = `${month}-01`

    // Get selected KPI slugs
    const { data: brand } = await supabase
      .from('brands')
      .select('dashboard_metrics')
      .eq('id', brandId)
      .single()

    const selectedSlugs: string[] = brand?.dashboard_metrics ||
      ['volume', 'reach_mix', 'assortment', 'market_share', 'share_of_shelf']

    // Get KPI definitions
    const { data: kpiDefs } = await supabase
      .from('kpi_definitions')
      .select('slug, label, icon, color')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .in('slug', selectedSlugs)

    const defMap = new Map((kpiDefs || []).map(d => [d.slug, d]))

    // Get summary from view
    const { data: summaryData } = await supabase
      .from('v_kpi_dashboard_summary')
      .select('kpi_slug, actual_value, target_value, achievement_pct, unit')
      .eq('brand_id', brandId)
      .eq('period_month', periodMonth)

    // Build the response, maintaining selection order
    const kpis = selectedSlugs.map(slug => {
      const def = defMap.get(slug)
      const summary = (summaryData || []).find(s => s.kpi_slug === slug)
      return {
        slug,
        label: def?.label || slug,
        actual: summary ? Number(summary.actual_value) || 0 : 0,
        target: summary?.target_value ? Number(summary.target_value) : null,
        achievement_pct: summary?.achievement_pct ? Number(summary.achievement_pct) : null,
        unit: summary?.unit || '%',
        icon: def?.icon || 'TrendingUp',
        color: def?.color || 'blue',
      }
    })

    const now = new Date()
    const period = `${now.toLocaleString('es-MX', { month: 'long' })} ${now.getFullYear()}`

    return Response.json({ kpis, period })
  } catch (error) {
    console.error('Error in GET /api/brand/kpis/summary:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
