import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: tierId } = await params

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado', details: authError?.message },
        { status: 401 }
      )
    }

    // 2. Get user_profile and brand_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_roles!user_roles_user_profile_id_fkey(
          brand_id,
          role,
          status
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado', details: profileError?.message },
        { status: 404 }
      )
    }

    // Validate active brand role
    const brandRole = userProfile.user_roles.find(role =>
      role.status === 'active' &&
      ['brand_manager', 'brand_admin'].includes(role.role)
    )

    if (!brandRole || !brandRole.brand_id) {
      return NextResponse.json(
        { error: 'Usuario no tiene permisos de marca activos' },
        { status: 403 }
      )
    }

    const targetBrandId = brandRole.brand_id

    // 3. Verify tier exists and belongs to this brand
    const { data: existingTier, error: tierError } = await supabase
      .from('tiers')
      .select('id, brand_id, is_default, tier_level')
      .eq('id', tierId)
      .is('deleted_at', null)
      .single()

    if (tierError || !existingTier) {
      return NextResponse.json(
        { error: 'Nivel no encontrado' },
        { status: 404 }
      )
    }

    if (existingTier.brand_id !== targetBrandId) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este nivel' },
        { status: 403 }
      )
    }

    // 4. Get request body
    const body = await request.json()
    const {
      name,
      tier_level,
      min_points_required,
      min_visits_required,
      min_purchases_required,
      points_multiplier,
      discount_percentage,
      benefits,
      tier_color,
      is_default,
      is_active
    } = body

    // 5. Validate tier_level uniqueness if being changed
    if (tier_level !== undefined && tier_level !== existingTier.tier_level) {
      const { data: levelConflict } = await supabase
        .from('tiers')
        .select('id')
        .eq('brand_id', targetBrandId)
        .eq('tier_level', tier_level)
        .neq('id', tierId)
        .is('deleted_at', null)
        .single()

      if (levelConflict) {
        return NextResponse.json(
          { error: `Ya existe un nivel con el número ${tier_level} en esta marca` },
          { status: 400 }
        )
      }
    }

    // 6. If setting as default, unset existing default
    if (is_default === true && !existingTier.is_default) {
      await supabase
        .from('tiers')
        .update({ is_default: false })
        .eq('brand_id', targetBrandId)
        .eq('is_default', true)
    }

    // 7. Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name.trim()
    if (tier_level !== undefined) updateData.tier_level = tier_level
    if (min_points_required !== undefined) updateData.min_points_required = min_points_required
    if (min_visits_required !== undefined) updateData.min_visits_required = min_visits_required
    if (min_purchases_required !== undefined) updateData.min_purchases_required = min_purchases_required
    if (points_multiplier !== undefined) updateData.points_multiplier = points_multiplier
    if (discount_percentage !== undefined) updateData.discount_percentage = discount_percentage
    if (benefits !== undefined) updateData.benefits = benefits
    if (tier_color !== undefined) updateData.tier_color = tier_color
    if (is_default !== undefined) updateData.is_default = is_default
    if (is_active !== undefined) updateData.is_active = is_active

    // 8. Update tier
    const { data: updatedTier, error: updateError } = await supabase
      .from('tiers')
      .update(updateData)
      .eq('id', tierId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al actualizar nivel: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Nivel actualizado correctamente',
      tier: updatedTier
    })

  } catch (error) {
    console.error('Error en PUT /api/brand/tiers/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: tierId } = await params

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado', details: authError?.message },
        { status: 401 }
      )
    }

    // 2. Get user_profile and brand_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_roles!user_roles_user_profile_id_fkey(
          brand_id,
          role,
          status
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado', details: profileError?.message },
        { status: 404 }
      )
    }

    // Validate active brand role
    const brandRole = userProfile.user_roles.find(role =>
      role.status === 'active' &&
      ['brand_manager', 'brand_admin'].includes(role.role)
    )

    if (!brandRole || !brandRole.brand_id) {
      return NextResponse.json(
        { error: 'Usuario no tiene permisos de marca activos' },
        { status: 403 }
      )
    }

    const targetBrandId = brandRole.brand_id

    // 3. Verify tier exists and belongs to this brand
    const { data: existingTier, error: tierError } = await supabase
      .from('tiers')
      .select('id, brand_id, is_default')
      .eq('id', tierId)
      .is('deleted_at', null)
      .single()

    if (tierError || !existingTier) {
      return NextResponse.json(
        { error: 'Nivel no encontrado' },
        { status: 404 }
      )
    }

    if (existingTier.brand_id !== targetBrandId) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este nivel' },
        { status: 403 }
      )
    }

    // 4. Prevent deleting default tier
    if (existingTier.is_default) {
      return NextResponse.json(
        { error: 'No se puede eliminar el nivel predeterminado. Asigna otro nivel como predeterminado primero.' },
        { status: 400 }
      )
    }

    // 5. Get default tier for reassigning members
    const { data: defaultTier } = await supabase
      .from('tiers')
      .select('id')
      .eq('brand_id', targetBrandId)
      .eq('is_default', true)
      .is('deleted_at', null)
      .single()

    // 6. Reassign members to default tier (if exists)
    if (defaultTier) {
      await supabase
        .from('client_brand_memberships')
        .update({ current_tier_id: defaultTier.id })
        .eq('current_tier_id', tierId)
    } else {
      // If no default tier, just null out the tier_id
      await supabase
        .from('client_brand_memberships')
        .update({ current_tier_id: null })
        .eq('current_tier_id', tierId)
    }

    // 7. Soft delete tier
    const { error: deleteError } = await supabase
      .from('tiers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', tierId)

    if (deleteError) {
      throw new Error(`Error al eliminar nivel: ${deleteError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Nivel eliminado correctamente'
    })

  } catch (error) {
    console.error('Error en DELETE /api/brand/tiers/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
