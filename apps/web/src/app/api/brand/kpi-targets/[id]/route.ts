import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'
import { z } from 'zod'

const updateTargetSchema = z.object({
  target_value: z.number().positive().optional(),
  target_unit: z.string().min(1).max(20).optional(),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(500).nullable().optional(),
})

/**
 * PUT /api/brand/kpi-targets/[id]
 * Update an existing KPI target
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const { id } = await params

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    const body = await request.json()
    const parsed = updateTargetSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (parsed.data.target_value !== undefined) updates.target_value = parsed.data.target_value
    if (parsed.data.target_unit !== undefined) updates.target_unit = parsed.data.target_unit
    if (parsed.data.period_end !== undefined) updates.period_end = parsed.data.period_end
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes

    const { data, error } = await supabase
      .from('kpi_targets')
      .update(updates)
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      console.error('Error updating kpi_target:', error)
      return Response.json({ error: 'Error al actualizar target' }, { status: 500 })
    }

    if (!data) {
      return Response.json({ error: 'Target no encontrado' }, { status: 404 })
    }

    return Response.json({ target: data })
  } catch (error) {
    console.error('Error in PUT /api/brand/kpi-targets/[id]:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/brand/kpi-targets/[id]
 * Soft-delete a KPI target
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const { id } = await params

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    const { error } = await supabase
      .from('kpi_targets')
      .update({ deleted_at: new Date().toISOString() })
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)

    if (error) {
      console.error('Error deleting kpi_target:', error)
      return Response.json({ error: 'Error al eliminar target' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/brand/kpi-targets/[id]:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
