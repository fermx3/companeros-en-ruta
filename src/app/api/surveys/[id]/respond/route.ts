import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type { SurveyTargetRoleEnum } from '@/lib/types/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get user ID from middleware header or fallback to getUser()
    let userId: string | undefined
    try {
      const h = await headers()
      userId = h.get('x-supabase-user-id') || undefined
    } catch { /* headers() not available */ }

    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
      }
      userId = user.id
    }

    // Resolve tenant — staff users have user_profiles, client users may only have clients
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', userId)
      .single()

    let tenantId: string
    let profileId: string | null = null

    if (userProfile) {
      tenantId = userProfile.tenant_id
      profileId = userProfile.id
    } else {
      const { data: clientRow } = await supabase
        .from('clients')
        .select('id, tenant_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1)
        .single()

      if (!clientRow) {
        return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
      }
      tenantId = clientRow.tenant_id
    }

    if (!profileId) {
      return NextResponse.json(
        { error: 'Tu perfil no permite enviar respuestas de encuestas aún' },
        { status: 403 }
      )
    }

    // Fetch survey, check duplicates, and determine role IN PARALLEL
    const [surveyResult, existingResponseResult, userRolesResult] = await Promise.all([
      supabase
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
        .eq('tenant_id', tenantId)
        .eq('survey_status', 'active')
        .is('deleted_at', null)
        .single(),

      supabase
        .from('survey_responses')
        .select('id')
        .eq('survey_id', id)
        .eq('respondent_id', profileId)
        .limit(1),

      supabase
        .from('user_roles')
        .select('role')
        .eq('user_profile_id', profileId)
        .eq('status', 'active')
        .is('deleted_at', null),
    ])

    const survey = surveyResult.data
    if (surveyResult.error || !survey) {
      return NextResponse.json({ error: 'Encuesta no encontrada o no activa' }, { status: 404 })
    }

    // Check date range
    const today = new Date().toISOString().split('T')[0]
    if (survey.start_date > today || survey.end_date < today) {
      return NextResponse.json({ error: 'La encuesta no está dentro del período de vigencia' }, { status: 400 })
    }

    // Check for duplicate response
    if (existingResponseResult.data && existingResponseResult.data.length > 0) {
      return NextResponse.json(
        { error: 'Ya has respondido esta encuesta' },
        { status: 409 }
      )
    }

    // Determine respondent role
    const userRoles = userRolesResult.data

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
        respondent_id: profileId,
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
