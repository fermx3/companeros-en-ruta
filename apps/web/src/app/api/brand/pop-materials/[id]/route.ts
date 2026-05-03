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

    // Verify material belongs to brand (not system template)
    const { data: existing } = await supabase
      .from('brand_pop_materials')
      .select('id, is_system_template')
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    if (existing.is_system_template) {
      return NextResponse.json(
        { error: 'No se pueden modificar materiales del sistema' },
        { status: 403 }
      )
    }

    const { material_name, material_category, is_active } = body
    const updates: Record<string, unknown> = {}
    if (material_name !== undefined) updates.material_name = material_name.trim()
    if (material_category !== undefined) updates.material_category = material_category
    if (is_active !== undefined) updates.is_active = is_active

    const { data: material, error: updateError } = await supabase
      .from('brand_pop_materials')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating material:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar material' },
        { status: 500 }
      )
    }

    return NextResponse.json({ material })

  } catch (error) {
    console.error('Error in PUT /api/brand/pop-materials/[id]:', error)
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

    // Verify material belongs to brand
    const { data: existing } = await supabase
      .from('brand_pop_materials')
      .select('id, is_system_template')
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    if (existing.is_system_template) {
      return NextResponse.json(
        { error: 'No se pueden eliminar materiales del sistema' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from('brand_pop_materials')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (deleteError) {
      console.error('Error deleting material:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar material' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in DELETE /api/brand/pop-materials/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
