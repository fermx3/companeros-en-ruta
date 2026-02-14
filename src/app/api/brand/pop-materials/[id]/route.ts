import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getBrandProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: { message: 'Usuario no autenticado', status: 401 } }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      tenant_id,
      user_roles!user_roles_user_profile_id_fkey(
        brand_id,
        role,
        status,
        tenant_id
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  const brandRole = userProfile.user_roles.find((role: { status: string; role: string }) =>
    role.status === 'active' &&
    ['brand_manager', 'brand_admin'].includes(role.role)
  )

  if (!brandRole || !brandRole.brand_id) {
    return { error: { message: 'Usuario no tiene permisos de marca activos', status: 403 } }
  }

  return {
    brandId: brandRole.brand_id,
    tenantId: brandRole.tenant_id || userProfile.tenant_id
  }
}

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId } = result
    const body = await request.json()

    // Verify material belongs to brand (not system template)
    const { data: existing } = await supabase
      .from('brand_pop_materials')
      .select('id, is_system_template')
      .eq('id', id)
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
      .eq('id', id)
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
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId } = result

    // Verify material belongs to brand
    const { data: existing } = await supabase
      .from('brand_pop_materials')
      .select('id, is_system_template')
      .eq('id', id)
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
      .eq('id', id)

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
