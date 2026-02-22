import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    const body = await request.json()

    const { data: existing } = await supabase
      .from('brand_exhibitions')
      .select('id')
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Exhibición no encontrada' },
        { status: 404 }
      )
    }

    const {
      exhibition_name,
      negotiated_period,
      location_description,
      start_date,
      end_date,
      product_id,
      communication_plan_id,
      is_active
    } = body

    const updates: Record<string, unknown> = {}
    if (exhibition_name !== undefined) updates.exhibition_name = exhibition_name.trim()
    if (negotiated_period !== undefined) updates.negotiated_period = negotiated_period
    if (location_description !== undefined) updates.location_description = location_description
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (product_id !== undefined) updates.product_id = product_id
    if (communication_plan_id !== undefined) updates.communication_plan_id = communication_plan_id
    if (is_active !== undefined) updates.is_active = is_active

    const { data: exhibition, error: updateError } = await supabase
      .from('brand_exhibitions')
      .update(updates)
      .eq('id', existing.id)
      .select(`
        id,
        public_id,
        exhibition_name,
        negotiated_period,
        location_description,
        start_date,
        end_date,
        is_active,
        products(
          id,
          name,
          sku
        ),
        brand_communication_plans(
          id,
          plan_name
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating exhibition:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar exhibición' },
        { status: 500 }
      )
    }

    return NextResponse.json({ exhibition })

  } catch (error) {
    console.error('Error in PUT /api/brand/exhibitions/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    const { data: existing } = await supabase
      .from('brand_exhibitions')
      .select('id')
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Exhibición no encontrada' },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabase
      .from('brand_exhibitions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (deleteError) {
      console.error('Error deleting exhibition:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar exhibición' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in DELETE /api/brand/exhibitions/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
