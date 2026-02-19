import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/kpis/selection
 * Returns available KPI definitions + current selection + cooldown info
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    // Get all active KPI definitions
    const { data: definitions } = await supabase
      .from('kpi_definitions')
      .select('id, slug, label, description, icon, color, computation_type, display_order')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // Get current brand selection + cooldown
    const { data: brand } = await supabase
      .from('brands')
      .select('dashboard_metrics, dashboard_metrics_updated_at')
      .eq('id', brandId)
      .single()

    const selectedSlugs: string[] = brand?.dashboard_metrics || []
    const lastUpdated = brand?.dashboard_metrics_updated_at
    const canUpdate = !lastUpdated || (Date.now() - new Date(lastUpdated).getTime()) > 24 * 60 * 60 * 1000

    return Response.json({
      definitions: definitions || [],
      selected_slugs: selectedSlugs,
      dashboard_metrics_updated_at: lastUpdated,
      can_update: canUpdate,
      cooldown_remaining_ms: lastUpdated && !canUpdate
        ? (24 * 60 * 60 * 1000) - (Date.now() - new Date(lastUpdated).getTime())
        : 0,
    })
  } catch (error) {
    console.error('Error in GET /api/brand/kpis/selection:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/brand/kpis/selection
 * Update the brand's selected KPIs (max 5, 24hr cooldown)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    const body = await request.json()
    const kpiSlugs: string[] = body.kpi_slugs

    // Validate input
    if (!Array.isArray(kpiSlugs) || kpiSlugs.length === 0) {
      return Response.json({ error: 'Selecciona al menos un KPI' }, { status: 400 })
    }
    if (kpiSlugs.length > 5) {
      return Response.json({ error: 'Máximo 5 KPIs permitidos' }, { status: 400 })
    }

    // Validate slugs exist and are active
    const { data: validDefs } = await supabase
      .from('kpi_definitions')
      .select('slug')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .in('slug', kpiSlugs)

    const validSlugs = new Set((validDefs || []).map((d: any) => d.slug))
    const invalidSlugs = kpiSlugs.filter(s => !validSlugs.has(s))

    if (invalidSlugs.length > 0) {
      return Response.json({ error: `KPIs no válidos: ${invalidSlugs.join(', ')}` }, { status: 400 })
    }

    // Check cooldown — reorder-only changes (same set of slugs) bypass it
    const { data: brand } = await supabase
      .from('brands')
      .select('dashboard_metrics, dashboard_metrics_updated_at')
      .eq('id', brandId)
      .single()

    const currentSlugs: string[] = brand?.dashboard_metrics || []
    const isReorderOnly =
      currentSlugs.length === kpiSlugs.length &&
      [...currentSlugs].sort().join(',') === [...kpiSlugs].sort().join(',')

    if (!isReorderOnly && brand?.dashboard_metrics_updated_at) {
      const elapsed = Date.now() - new Date(brand.dashboard_metrics_updated_at).getTime()
      const twentyFourHours = 24 * 60 * 60 * 1000
      if (elapsed < twentyFourHours) {
        const remaining = Math.ceil((twentyFourHours - elapsed) / (60 * 60 * 1000))
        return Response.json({
          error: `Debes esperar ${remaining} hora${remaining !== 1 ? 's' : ''} para cambiar KPIs`
        }, { status: 429 })
      }
    }

    // Update brand — only bump cooldown timestamp when the selection set changes
    const { error: updateError } = await supabase
      .from('brands')
      .update({
        dashboard_metrics: kpiSlugs,
        ...(isReorderOnly ? {} : { dashboard_metrics_updated_at: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', brandId)

    if (updateError) {
      console.error('Error updating brand KPIs:', updateError)
      return Response.json({ error: 'Error al actualizar KPIs' }, { status: 500 })
    }

    return Response.json({
      selected_slugs: kpiSlugs,
      dashboard_metrics_updated_at: isReorderOnly
        ? brand?.dashboard_metrics_updated_at
        : new Date().toISOString(),
      can_update: isReorderOnly ? !brand?.dashboard_metrics_updated_at || (Date.now() - new Date(brand.dashboard_metrics_updated_at).getTime()) > 24 * 60 * 60 * 1000 : false,
    })
  } catch (error) {
    console.error('Error in PATCH /api/brand/kpis/selection:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
