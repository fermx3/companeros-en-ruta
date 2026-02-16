import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SurveyTargetRoleEnum } from '@/lib/types/database'

export async function POST(
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
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Get survey and questions
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select(`
        id,
        tenant_id,
        survey_status,
        target_roles,
        start_date,
        end_date,
        max_responses_per_user,
        survey_questions(
          id,
          question_type,
          is_required
        )
      `)
      .eq('id', id)
      .eq('tenant_id', userProfile.tenant_id)
      .eq('survey_status', 'active')
      .is('deleted_at', null)
      .single()

    if (surveyError || !survey) {
      return NextResponse.json({ error: 'Encuesta no encontrada o no activa' }, { status: 404 })
    }

    // Check date range
    const today = new Date().toISOString().split('T')[0]
    if (survey.start_date > today || survey.end_date < today) {
      return NextResponse.json({ error: 'La encuesta no está dentro del período de vigencia' }, { status: 400 })
    }

    // Check for duplicate response
    const { data: existingResponse } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('survey_id', id)
      .eq('respondent_id', userProfile.id)
      .limit(1)

    if (existingResponse && existingResponse.length > 0) {
      return NextResponse.json(
        { error: 'Ya has respondido esta encuesta' },
        { status: 409 }
      )
    }

    // Determine respondent role
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_profile_id', userProfile.id)
      .eq('status', 'active')
      .is('deleted_at', null)

    let respondentRole: SurveyTargetRoleEnum = 'client'
    const roles = (userRoles || []).map(r => r.role)
    if (roles.includes('promotor')) respondentRole = 'promotor'
    else if (roles.includes('asesor_de_ventas')) respondentRole = 'asesor_de_ventas'

    // Validate body
    const body = await request.json()
    const { answers } = body

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Las respuestas son requeridas' }, { status: 400 })
    }

    // Validate required questions are answered
    const requiredQuestionIds = new Set(
      (survey.survey_questions || [])
        .filter(q => q.is_required)
        .map(q => q.id)
    )

    const answeredQuestionIds = new Set(answers.map((a: { question_id: string }) => a.question_id))

    for (const reqId of requiredQuestionIds) {
      if (!answeredQuestionIds.has(reqId)) {
        return NextResponse.json(
          { error: 'Faltan respuestas a preguntas obligatorias' },
          { status: 400 }
        )
      }
    }

    // Create response
    const { data: newResponse, error: responseError } = await supabase
      .from('survey_responses')
      .insert({
        survey_id: id,
        tenant_id: survey.tenant_id,
        respondent_id: userProfile.id,
        respondent_role: respondentRole
      })
      .select()
      .single()

    if (responseError) {
      if (responseError.code === '23505') {
        return NextResponse.json({ error: 'Ya has respondido esta encuesta' }, { status: 409 })
      }
      throw new Error(`Error al crear respuesta: ${responseError.message}`)
    }

    // Create answers
    const questionMap = new Map(
      (survey.survey_questions || []).map(q => [q.id, q])
    )

    const answerRows = answers
      .filter((a: { question_id: string }) => questionMap.has(a.question_id))
      .map((a: { question_id: string; value: unknown }) => {
        const question = questionMap.get(a.question_id)!
        const row: Record<string, unknown> = {
          response_id: newResponse.id,
          question_id: a.question_id,
          tenant_id: survey.tenant_id
        }

        switch (question.question_type) {
          case 'text':
            row.answer_text = String(a.value || '')
            break
          case 'number':
            row.answer_number = Number(a.value)
            break
          case 'multiple_choice':
            row.answer_choice = String(a.value || '')
            break
          case 'scale':
            row.answer_scale = Number(a.value)
            break
          case 'yes_no':
            row.answer_boolean = Boolean(a.value)
            break
        }

        return row
      })

    if (answerRows.length > 0) {
      const { error: answersError } = await supabase
        .from('survey_answers')
        .insert(answerRows)

      if (answersError) {
        // Clean up response if answers fail
        await supabase.from('survey_responses').delete().eq('id', newResponse.id)
        throw new Error(`Error al guardar respuestas: ${answersError.message}`)
      }
    }

    return NextResponse.json({
      response: newResponse,
      message: 'Encuesta respondida exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/surveys/[id]/respond:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
