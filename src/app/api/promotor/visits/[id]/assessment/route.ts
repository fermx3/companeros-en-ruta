import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveIdColumn } from '@/lib/utils/public-id'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET: Retrieve assessment data for a visit
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: visitId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  // Verify visit belongs to the promotor
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('id, brand_id, client_id')
    .eq(resolveIdColumn(visitId), visitId)
    .eq('promotor_id', userProfile.id)
    .is('deleted_at', null)
    .single()

  if (visitError || !visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  }

  // Fetch stage assessments
  const { data: stageAssessment } = await supabase
    .from('visit_stage_assessments')
    .select('*')
    .eq('visit_id', visit.id)
    .single()

  // Fetch brand product assessments
  const { data: brandProductAssessments } = await supabase
    .from('visit_brand_product_assessments')
    .select('*')
    .eq('visit_id', visit.id)

  // Fetch competitor assessments
  const { data: competitorAssessments } = await supabase
    .from('visit_competitor_assessments')
    .select('*')
    .eq('visit_id', visit.id)

  // Fetch POP material checks
  const { data: popMaterialChecks } = await supabase
    .from('visit_pop_material_checks')
    .select('*')
    .eq('visit_id', visit.id)

  // Fetch exhibition checks
  const { data: exhibitionChecks } = await supabase
    .from('visit_exhibition_checks')
    .select('*')
    .eq('visit_id', visit.id)

  // Fetch evidence photos
  const { data: evidence } = await supabase
    .from('visit_evidence')
    .select('*')
    .eq('visit_id', visit.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  return NextResponse.json({
    stageAssessment: stageAssessment || null,
    brandProductAssessments: brandProductAssessments || [],
    competitorAssessments: competitorAssessments || [],
    popMaterialChecks: popMaterialChecks || [],
    exhibitionChecks: exhibitionChecks || [],
    evidence: evidence || []
  })
}

// POST: Save assessment data for a specific stage
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: visitId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile for tenant_id and user_profile_id
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('user_id', user.id)
    .single()

  if (profileError) {
    return NextResponse.json({ error: 'User profile not found', details: profileError.message }, { status: 404 })
  }

  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  // Check user roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role, status')
    .eq('user_profile_id', userProfile.id)
    .eq('status', 'active')
    .is('deleted_at', null)

  // Verify visit exists and user has access
  // Note: The actual column is 'visit_status', not 'status'
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('id, brand_id, client_id, visit_status, tenant_id, promotor_id')
    .eq(resolveIdColumn(visitId), visitId)
    .eq('promotor_id', userProfile.id)  // Ensure visit belongs to this promotor
    .is('deleted_at', null)
    .single()

  if (visitError) {
    // If it's a "no rows" error, it could be RLS blocking access
    if (visitError.code === 'PGRST116') {
      return NextResponse.json({
        error: 'Visit not found or access denied',
        details: 'The visit may not exist or you may not have permission to access it',
        debug: { visitId, userProfileId: userProfile.id }
      }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error fetching visit', details: visitError.message }, { status: 500 })
  }

  if (!visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  }

  if (visit.visit_status !== 'in_progress') {
    return NextResponse.json({ error: 'Visit must be in progress to save assessment' }, { status: 400 })
  }

  const body = await request.json()
  const { stage, data } = body

  if (!stage || !data) {
    return NextResponse.json({ error: 'Stage and data are required' }, { status: 400 })
  }

  try {
    // Upsert stage assessment record
    const stageField = `stage${stage}_completed_at`
    const notesField = stage === 1 ? 'pricing_audit_notes' : stage === 2 ? 'purchase_inventory_notes' : 'pop_execution_notes'

    const stageAssessmentData: Record<string, unknown> = {
      visit_id: visit.id,
      tenant_id: userProfile.tenant_id,
      [stageField]: new Date().toISOString()
    }

    // Add stage-specific fields
    if (stage === 1) {
      stageAssessmentData.pricing_audit_notes = data.pricingAuditNotes || null
    } else if (stage === 2) {
      stageAssessmentData.has_inventory = data.hasInventory || false
      stageAssessmentData.has_purchase_order = data.hasPurchaseOrder || false
      stageAssessmentData.purchase_order_number = data.purchaseOrderNumber || null
      stageAssessmentData.why_not_buying = data.whyNotBuying || null
      stageAssessmentData.purchase_inventory_notes = data.purchaseInventoryNotes || null
      if (data.orderId) {
        stageAssessmentData.order_id = data.orderId
      }
    } else if (stage === 3) {
      stageAssessmentData.communication_plan_id = data.communicationPlanId || null
      stageAssessmentData.communication_compliance = data.communicationCompliance || null
      stageAssessmentData.pop_execution_notes = data.popExecutionNotes || null
    }

    // Upsert stage assessment
    const { error: upsertError } = await supabase
      .from('visit_stage_assessments')
      .upsert(stageAssessmentData, {
        onConflict: 'visit_id'
      })

    if (upsertError) {
      console.error('Error upserting stage assessment:', upsertError)
      return NextResponse.json({ error: 'Error saving stage assessment' }, { status: 500 })
    }

    // Handle stage-specific data
    if (stage === 1) {
      // Save brand product assessments
      if (data.brandProductAssessments?.length > 0) {
        // Delete existing and insert new
        await supabase
          .from('visit_brand_product_assessments')
          .delete()
          .eq('visit_id', visit.id)

        const brandAssessments = data.brandProductAssessments.map((a: Record<string, unknown>) => ({
          visit_id: visit.id,
          product_id: a.product_id,
          product_variant_id: a.product_variant_id || null,
          current_price: a.current_price || null,
          suggested_price: a.suggested_price || null,
          has_active_promotion: a.has_active_promotion || false,
          promotion_description: a.promotion_description || null,
          has_pop_material: a.has_pop_material || false,
          is_product_present: a.is_product_present !== false,
          stock_level: a.stock_level || null
        }))

        const { error: brandError } = await supabase
          .from('visit_brand_product_assessments')
          .insert(brandAssessments)

        if (brandError) {
          console.error('Error saving brand product assessments:', brandError)
        }
      }

      // Save competitor assessments
      if (data.competitorAssessments?.length > 0) {
        await supabase
          .from('visit_competitor_assessments')
          .delete()
          .eq('visit_id', visit.id)

        const competitorAssessments = data.competitorAssessments.map((a: Record<string, unknown>) => ({
          visit_id: visit.id,
          competitor_id: a.competitor_id,
          competitor_product_id: a.competitor_product_id || null,
          product_name_observed: a.product_name_observed || null,
          size_grams: a.size_grams || null,
          observed_price: a.observed_price || null,
          has_active_promotion: a.has_active_promotion || false,
          promotion_description: a.promotion_description || null,
          has_pop_material: a.has_pop_material || false
        }))

        const { error: compError } = await supabase
          .from('visit_competitor_assessments')
          .insert(competitorAssessments)

        if (compError) {
          console.error('Error saving competitor assessments:', compError)
        }
      }
    } else if (stage === 3) {
      // Save POP material checks
      if (data.popMaterialChecks?.length > 0) {
        await supabase
          .from('visit_pop_material_checks')
          .delete()
          .eq('visit_id', visit.id)

        const popChecks = data.popMaterialChecks.map((c: Record<string, unknown>) => ({
          visit_id: visit.id,
          pop_material_id: c.pop_material_id,
          is_present: c.is_present || false,
          condition: c.condition || null,
          notes: c.notes || null
        }))

        const { error: popError } = await supabase
          .from('visit_pop_material_checks')
          .insert(popChecks)

        if (popError) {
          console.error('Error saving POP material checks:', popError)
        }
      }

      // Save exhibition checks
      if (data.exhibitionChecks?.length > 0) {
        await supabase
          .from('visit_exhibition_checks')
          .delete()
          .eq('visit_id', visit.id)

        const exhibitionChecks = data.exhibitionChecks.map((c: Record<string, unknown>) => ({
          visit_id: visit.id,
          exhibition_id: c.exhibition_id,
          is_executed: c.is_executed || false,
          execution_quality: c.execution_quality || null,
          notes: c.notes || null
        }))

        const { error: exhibError } = await supabase
          .from('visit_exhibition_checks')
          .insert(exhibitionChecks)

        if (exhibError) {
          console.error('Error saving exhibition checks:', exhibError)
        }
      }
    }

    // Note: Evidence photos are saved separately via the
    // POST /api/promotor/visits/[id]/evidence endpoint (file upload).
    // No additional handling needed here.

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving assessment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Mark all stages as completed (for checkout)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id: visitId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile to filter by promotor_id
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  // Verify visit belongs to the promotor (visit_status, not status)
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('id, visit_status')
    .eq(resolveIdColumn(visitId), visitId)
    .eq('promotor_id', userProfile.id)
    .is('deleted_at', null)
    .single()

  if (visitError || !visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  }

  // Check if all stages are completed
  const { data: stageAssessment } = await supabase
    .from('visit_stage_assessments')
    .select('stage1_completed_at, stage2_completed_at, stage3_completed_at')
    .eq('visit_id', visit.id)
    .single()

  if (!stageAssessment) {
    return NextResponse.json({ error: 'No assessment data found' }, { status: 400 })
  }

  const allStagesCompleted =
    stageAssessment.stage1_completed_at &&
    stageAssessment.stage2_completed_at &&
    stageAssessment.stage3_completed_at

  if (!allStagesCompleted) {
    return NextResponse.json({
      error: 'All stages must be completed before checkout',
      stages: {
        stage1: !!stageAssessment.stage1_completed_at,
        stage2: !!stageAssessment.stage2_completed_at,
        stage3: !!stageAssessment.stage3_completed_at
      }
    }, { status: 400 })
  }

  // Mark all stages as completed
  const { error: updateError } = await supabase
    .from('visit_stage_assessments')
    .update({ all_stages_completed: true })
    .eq('visit_id', visit.id)

  if (updateError) {
    console.error('Error marking assessment complete:', updateError)
    return NextResponse.json({ error: 'Error completing assessment' }, { status: 500 })
  }

  return NextResponse.json({ success: true, allStagesCompleted: true })
}
