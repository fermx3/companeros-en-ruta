import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveIdColumn } from '@/lib/utils/public-id'
import { resolveVisibilityConditions } from '@/lib/surveys/resolve-visibility-conditions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select(`
        id,
        tenant_id,
        user_roles!user_roles_user_profile_id_fkey(tenant_id, role, status)
      `)
      .eq('user_id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const adminRole = userProfile.user_roles.find(r =>
      r.status === 'active' && ['tenant_admin', 'admin', 'super_admin'].includes(r.role)
    )

    if (!adminRole) {
      return NextResponse.json({ error: 'Sin permisos de administrador' }, { status: 403 })
    }

    const tenantId = adminRole.tenant_id || userProfile.tenant_id

    const { data: survey, error: fetchError } = await supabase
      .from('surveys')
      .select(`
        *,
        brands(name, logo_url),
        creator:user_profiles!surveys_created_by_fkey(first_name, last_name, email),
        approver:user_profiles!surveys_approved_by_fkey(first_name, last_name),
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
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !survey) {
      return NextResponse.json({ error: 'Encuesta no encontrada' }, { status: 404 })
    }

    // Sort questions and sections
    if (survey.survey_questions) {
      survey.survey_questions.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    }
    if (survey.survey_sections) {
      survey.survey_sections.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    }

    // Response count
    const { count } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', survey.id)

    return NextResponse.json({
      survey: {
        ...survey,
        response_count: count || 0
      }
    })

  } catch (error) {
    console.error('Error en GET /api/admin/surveys/[id]:', error)
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select(`
        id,
        tenant_id,
        user_roles!user_roles_user_profile_id_fkey(tenant_id, role, status)
      `)
      .eq('user_id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const adminRole = userProfile.user_roles.find(r =>
      r.status === 'active' && ['tenant_admin', 'admin', 'super_admin'].includes(r.role)
    )

    if (!adminRole) {
      return NextResponse.json({ error: 'Sin permisos de administrador' }, { status: 403 })
    }

    const tenantId = adminRole.tenant_id || userProfile.tenant_id

    // Verify survey exists and is in an editable status for admin
    const { data: currentSurvey, error: fetchError } = await supabase
      .from('surveys')
      .select('id, survey_status')
      .eq(resolveIdColumn(id), id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentSurvey) {
      return NextResponse.json({ error: 'Encuesta no encontrada' }, { status: 404 })
    }

    if (!['pending_approval', 'draft'].includes(currentSurvey.survey_status)) {
      return NextResponse.json(
        { error: 'Solo se pueden editar encuestas en estado borrador o pendiente de aprobación' },
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

    // Update survey fields
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
      message: 'Encuesta actualizada por administrador'
    })

  } catch (error) {
    console.error('Error en PUT /api/admin/surveys/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
