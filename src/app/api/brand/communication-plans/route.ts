import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    const activeOnly = searchParams.get('active_only') === 'true'

    let query = supabase
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
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: plans, error } = await query

    if (error) {
      console.error('Error fetching communication plans:', error)
      return NextResponse.json(
        { error: 'Error al obtener planes de comunicación' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      plans: plans || [],
      total: plans?.length || 0
    })

  } catch (error) {
    console.error('Error in GET /api/brand/communication-plans:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    const body = await request.json()

    const {
      plan_name,
      plan_period,
      target_locations,
      start_date,
      end_date,
      materials,
      activities
    } = body

    if (!plan_name?.trim() || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Nombre del plan, fecha inicio y fecha fin son requeridos' },
        { status: 400 }
      )
    }

    // Create plan
    const { data: plan, error: planError } = await supabase
      .from('brand_communication_plans')
      .insert({
        tenant_id: tenantId,
        brand_id: brandId,
        plan_name: plan_name.trim(),
        plan_period: plan_period || null,
        target_locations: target_locations || null,
        start_date,
        end_date,
        is_active: true
      })
      .select()
      .single()

    if (planError) {
      console.error('Error creating plan:', planError)
      return NextResponse.json(
        { error: 'Error al crear plan de comunicación' },
        { status: 500 }
      )
    }

    // Add materials if provided
    if (materials && Array.isArray(materials)) {
      for (const material of materials) {
        if (!material.pop_material_id) continue

        await supabase
          .from('brand_communication_plan_materials')
          .insert({
            communication_plan_id: plan.id,
            pop_material_id: material.pop_material_id,
            quantity_required: material.quantity_required || 1,
            placement_notes: material.placement_notes || null
          })
      }
    }

    // Add activities if provided
    if (activities && Array.isArray(activities)) {
      for (const activity of activities) {
        if (!activity.activity_name?.trim()) continue

        await supabase
          .from('brand_communication_plan_activities')
          .insert({
            communication_plan_id: plan.id,
            activity_name: activity.activity_name.trim(),
            activity_description: activity.activity_description || null,
            scheduled_date: activity.scheduled_date || null,
            is_recurring: activity.is_recurring || false
          })
      }
    }

    // Fetch complete plan
    const { data: completePlan } = await supabase
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
      .eq('id', plan.id)
      .single()

    return NextResponse.json({ plan: completePlan }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/brand/communication-plans:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
