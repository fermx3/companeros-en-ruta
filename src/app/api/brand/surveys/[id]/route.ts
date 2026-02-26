import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'
import { resolveVisibilityConditions } from '@/lib/surveys/resolve-visibility-conditions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    const { data: survey, error: fetchError } = await supabase
      .from('surveys')
      .select(`
        *,
        brands(name),
        survey_sections(
          id,
          title,
          description,
          sort_order,
          visibility_condition
        ),
        survey_questions(
          id,
          public_id,
          question_text,
          question_type,
          is_required,
          sort_order,
          options,
          section_id,
          input_attributes
        )
      `)
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !survey) {
      return NextResponse.json(
        { error: 'Encuesta no encontrada' },
        { status: 404 }
      )
    }

    // Get response count
    const { count } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', survey.id)

    // Sort questions and sections by sort_order
    if (survey.survey_questions) {
      survey.survey_questions.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    }
    if (survey.survey_sections) {
      survey.survey_sections.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    }

    return NextResponse.json({
      survey: {
        ...survey,
        response_count: count || 0
      }
    })

  } catch (error) {
    console.error('Error en GET /api/brand/surveys/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    // Verify survey exists and is draft
    const { data: currentSurvey, error: fetchError } = await supabase
      .from('surveys')
      .select('id, survey_status')
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentSurvey) {
      return NextResponse.json(
        { error: 'Encuesta no encontrada' },
        { status: 404 }
      )
    }

    if (currentSurvey.survey_status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden editar encuestas en estado borrador' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      target_roles,
      target_zone_ids,
      target_client_type_categories,
      start_date,
      end_date,
      max_responses_per_user,
      questions,
      sections
    } = body

    // Update survey
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (target_roles !== undefined) updateData.target_roles = target_roles
    if (target_zone_ids !== undefined) updateData.target_zone_ids = target_zone_ids?.length > 0 ? target_zone_ids : null
    if (target_client_type_categories !== undefined) updateData.target_client_type_categories = target_client_type_categories?.length > 0 ? target_client_type_categories : null
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (max_responses_per_user !== undefined) updateData.max_responses_per_user = max_responses_per_user

    let updatedSurvey = currentSurvey
    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date().toISOString()
      const { data, error: updateError } = await supabase
        .from('surveys')
        .update(updateData)
        .eq('id', currentSurvey.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Error al actualizar encuesta: ${updateError.message}`)
      }
      updatedSurvey = data
    }

    // Update sections if provided (must be done BEFORE questions for FK references)
    let sectionIdMap: Record<string, string> = {}
    if (sections !== undefined) {
      // Delete existing sections (CASCADE will null out question section_id references)
      await supabase.from('survey_sections').delete().eq('survey_id', currentSurvey.id)

      if (sections.length > 0) {
        const sectionRows = sections.map((s: { title: string; description?: string; sort_order: number; visibility_condition?: unknown }, idx: number) => ({
          survey_id: currentSurvey.id,
          tenant_id: tenantId,
          title: s.title,
          description: s.description || null,
          sort_order: s.sort_order ?? idx,
          visibility_condition: s.visibility_condition || null
        }))

        const { data: insertedSections, error: sectionsError } = await supabase
          .from('survey_sections')
          .insert(sectionRows)
          .select('id, sort_order')

        if (sectionsError) {
          throw new Error(`Error al actualizar secciones: ${sectionsError.message}`)
        }

        // Build map from sort_order to new section ID for question FK assignment
        if (insertedSections) {
          for (const sec of insertedSections) {
            sectionIdMap[String(sec.sort_order)] = sec.id
          }
        }
      }
    }

    // Update questions if provided
    let questionIdMap: Record<string, string> = {}
    if (questions !== undefined) {
      // Delete existing questions
      await supabase.from('survey_questions').delete().eq('survey_id', currentSurvey.id)

      // Insert new questions
      if (questions.length > 0) {
        const questionRows = questions.map((q: { question_text: string; question_type: string; is_required?: boolean; sort_order: number; options?: unknown; section_sort_order?: number; section_id?: string; input_attributes?: unknown }, idx: number) => ({
          survey_id: currentSurvey.id,
          tenant_id: tenantId,
          question_text: q.question_text,
          question_type: q.question_type,
          is_required: q.is_required ?? true,
          sort_order: q.sort_order ?? idx,
          options: q.options || null,
          section_id: q.section_id || (q.section_sort_order !== undefined ? sectionIdMap[String(q.section_sort_order)] : null) || null,
          input_attributes: q.input_attributes || null
        }))

        const { data: insertedQuestions, error: questionsError } = await supabase
          .from('survey_questions')
          .insert(questionRows)
          .select('id, sort_order')

        if (questionsError) {
          throw new Error(`Error al actualizar preguntas: ${questionsError.message}`)
        }

        if (insertedQuestions) {
          for (const q of insertedQuestions) {
            questionIdMap[String(q.sort_order)] = q.id
          }
        }
      }
    }

    // Resolve temporary __q_N references in section visibility_conditions to real UUIDs
    if (sections !== undefined) {
      await resolveVisibilityConditions(supabase, sections, sectionIdMap, questionIdMap)
    }

    return NextResponse.json({
      survey: updatedSurvey,
      message: 'Encuesta actualizada'
    })

  } catch (error) {
    console.error('Error en PUT /api/brand/surveys/[id]:', error)
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
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    // Verify survey exists and is draft
    const { data: currentSurvey } = await supabase
      .from('surveys')
      .select('id, survey_status')
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!currentSurvey) {
      return NextResponse.json(
        { error: 'Encuesta no encontrada' },
        { status: 404 }
      )
    }

    if (currentSurvey.survey_status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar encuestas en estado borrador' },
        { status: 400 }
      )
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('surveys')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', currentSurvey.id)

    if (deleteError) {
      throw new Error(`Error al eliminar encuesta: ${deleteError.message}`)
    }

    return NextResponse.json({ message: 'Encuesta eliminada' })

  } catch (error) {
    console.error('Error en DELETE /api/brand/surveys/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
