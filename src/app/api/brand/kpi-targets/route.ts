import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { z } from 'zod'

const createTargetSchema = z.object({
  kpi_slug: z.string().min(1).max(50),
  period_type: z.enum(['monthly', 'weekly', 'quarterly']),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  target_value: z.number().positive(),
  target_unit: z.string().min(1).max(20),
  zone_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

/**
 * GET /api/brand/kpi-targets
 * List targets for the brand, optionally filtered by period_type and period_start
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    let query = supabase
      .from('kpi_targets')
      .select('*')
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('kpi_slug')
      .order('period_start', { ascending: false })

    const periodType = searchParams.get('period_type')
    if (periodType) query = query.eq('period_type', periodType)

    const periodStart = searchParams.get('period_start')
    if (periodStart) query = query.eq('period_start', periodStart)

    const kpiSlug = searchParams.get('kpi_slug')
    if (kpiSlug) query = query.eq('kpi_slug', kpiSlug)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching kpi_targets:', error)
      return Response.json({ error: 'Error al obtener targets' }, { status: 500 })
    }

    return Response.json({ targets: data || [] })
  } catch (error) {
    console.error('Error in GET /api/brand/kpi-targets:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * POST /api/brand/kpi-targets
 * Create a new KPI target
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    const body = await request.json()
    const parsed = createTargetSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { kpi_slug, period_type, period_start, period_end, target_value, target_unit, zone_id, notes } = parsed.data

    // Validate kpi_slug exists in definitions
    const { count } = await supabase
      .from('kpi_definitions')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('slug', kpi_slug)
      .eq('is_active', true)

    if (!count || count === 0) {
      return Response.json({ error: `KPI "${kpi_slug}" no encontrado o inactivo` }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('kpi_targets')
      .insert({
        tenant_id: tenantId,
        brand_id: brandId,
        kpi_slug,
        period_type,
        period_start,
        period_end,
        target_value,
        target_unit,
        zone_id: zone_id || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return Response.json({ error: 'Ya existe un target para este KPI, periodo y zona' }, { status: 409 })
      }
      console.error('Error creating kpi_target:', error)
      return Response.json({ error: 'Error al crear target' }, { status: 500 })
    }

    return Response.json({ target: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/brand/kpi-targets:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
