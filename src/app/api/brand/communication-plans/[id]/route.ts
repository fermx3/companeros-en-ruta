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

export async function GET(request: NextRequest, context: RouteContext) {
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

    const { data: plan, error } = await supabase
      .from('brand_communication_plans')
      .select(`
        id,
        public_id,
        plan_name,
        plan_period,
        target_locations,
        start_date,
        end_date,
        is_active,
        created_at,
        brand_communication_plan_materials(
          id,
          quantity_required,
          placement_notes,
          brand_pop_materials(
            id,
            material_name,
            material_category
          )
        ),
        brand_communication_plan_activities(
          id,
          activity_name,
          activity_description,
          scheduled_date,
          is_recurring
        )
      `)
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (error || !plan) {
      return NextResponse.json(
        { error: 'Plan de comunicación no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ plan })

  } catch (error) {
    console.error('Error in GET /api/brand/communication-plans/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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

    // Verify plan belongs to brand
    const { data: existing } = await supabase
      .from('brand_communication_plans')
      .select('id')
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Plan de comunicación no encontrado' },
        { status: 404 }
      )
    }

    const {
      plan_name,
      plan_period,
      target_locations,
      start_date,
      end_date,
      is_active,
      materials,
      activities
    } = body

    // Update plan
    const updates: Record<string, unknown> = {}
    if (plan_name !== undefined) updates.plan_name = plan_name.trim()
    if (plan_period !== undefined) updates.plan_period = plan_period
    if (target_locations !== undefined) updates.target_locations = target_locations
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (is_active !== undefined) updates.is_active = is_active

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('brand_communication_plans')
        .update(updates)
        .eq('id', id)

      if (updateError) {
        console.error('Error updating plan:', updateError)
        return NextResponse.json(
          { error: 'Error al actualizar plan' },
          { status: 500 }
        )
      }
    }

    // Handle materials update
    if (materials && Array.isArray(materials)) {
      // Delete existing materials
      await supabase
        .from('brand_communication_plan_materials')
        .delete()
        .eq('communication_plan_id', id)

      // Add new materials
      for (const material of materials) {
        if (!material.pop_material_id) continue

        await supabase
          .from('brand_communication_plan_materials')
          .insert({
            communication_plan_id: id,
            pop_material_id: material.pop_material_id,
            quantity_required: material.quantity_required || 1,
            placement_notes: material.placement_notes || null
          })
      }
    }

    // Handle activities update
    if (activities && Array.isArray(activities)) {
      // Delete existing activities
      await supabase
        .from('brand_communication_plan_activities')
        .delete()
        .eq('communication_plan_id', id)

      // Add new activities
      for (const activity of activities) {
        if (!activity.activity_name?.trim()) continue

        await supabase
          .from('brand_communication_plan_activities')
          .insert({
            communication_plan_id: id,
            activity_name: activity.activity_name.trim(),
            activity_description: activity.activity_description || null,
            scheduled_date: activity.scheduled_date || null,
            is_recurring: activity.is_recurring || false
          })
      }
    }

    // Fetch updated plan
    const { data: plan } = await supabase
      .from('brand_communication_plans')
      .select(`
        id,
        public_id,
        plan_name,
        plan_period,
        target_locations,
        start_date,
        end_date,
        is_active,
        brand_communication_plan_materials(
          id,
          quantity_required,
          placement_notes,
          brand_pop_materials(
            id,
            material_name,
            material_category
          )
        ),
        brand_communication_plan_activities(
          id,
          activity_name,
          activity_description,
          scheduled_date,
          is_recurring
        )
      `)
      .eq('id', id)
      .single()

    return NextResponse.json({ plan })

  } catch (error) {
    console.error('Error in PUT /api/brand/communication-plans/[id]:', error)
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

    const { data: existing } = await supabase
      .from('brand_communication_plans')
      .select('id')
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Plan de comunicación no encontrado' },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabase
      .from('brand_communication_plans')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting plan:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar plan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in DELETE /api/brand/communication-plans/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
