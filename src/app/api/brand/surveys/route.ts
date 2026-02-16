import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_approval: 'Pendiente de aprobación',
  approved: 'Aprobada',
  active: 'Activa',
  closed: 'Cerrada',
  archived: 'Archivada'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('surveys')
      .select(`
        id,
        public_id,
        title,
        description,
        survey_status,
        target_roles,
        start_date,
        end_date,
        max_responses_per_user,
        created_at,
        updated_at,
        brands!inner(name)
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('survey_status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,public_id.ilike.%${search}%`)
    }

    // Count query
    let countQuery = supabase
      .from('surveys')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .is('deleted_at', null)

    if (status && status !== 'all') {
      countQuery = countQuery.eq('survey_status', status)
    }

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,public_id.ilike.%${search}%`)
    }

    const { count } = await countQuery

    const { data: surveys, error: dataError } = await query
      .range(offset, offset + limit - 1)

    if (dataError) {
      throw new Error(`Error al obtener encuestas: ${dataError.message}`)
    }

    // Get metrics
    const { data: metricsData } = await supabase
      .from('surveys')
      .select('survey_status')
      .eq('brand_id', brandId)
      .is('deleted_at', null)

    // Get response counts for surveys
    const surveyIds = (surveys || []).map(s => s.id)
    let responseCounts: Record<string, number> = {}
    if (surveyIds.length > 0) {
      const { data: responses } = await supabase
        .from('survey_responses')
        .select('survey_id')
        .in('survey_id', surveyIds)

      responseCounts = (responses || []).reduce((acc, r) => {
        acc[r.survey_id] = (acc[r.survey_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    const metrics = {
      total: metricsData?.length || 0,
      active: metricsData?.filter(s => s.survey_status === 'active').length || 0,
      pending: metricsData?.filter(s => s.survey_status === 'pending_approval').length || 0,
      draft: metricsData?.filter(s => s.survey_status === 'draft').length || 0,
      totalResponses: Object.values(responseCounts).reduce((sum, c) => sum + c, 0)
    }

    const transformedSurveys = (surveys || []).map(survey => ({
      ...survey,
      status_label: STATUS_LABELS[survey.survey_status] || survey.survey_status,
      response_count: responseCounts[survey.id] || 0
    }))

    return NextResponse.json({
      surveys: transformedSurveys,
      metrics,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error en GET /api/brand/surveys:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
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
    const { brandId, tenantId, userProfileId } = result

    const body = await request.json()
    const {
      title,
      description,
      target_roles,
      target_zone_ids,
      target_client_type_categories,
      start_date,
      end_date,
      max_responses_per_user = 1,
      questions = []
    } = body

    // Validate
    const errors: Array<{ field: string; message: string }> = []

    if (!title?.trim()) {
      errors.push({ field: 'title', message: 'El título es requerido' })
    }
    if (!start_date) {
      errors.push({ field: 'start_date', message: 'La fecha de inicio es requerida' })
    }
    if (!end_date) {
      errors.push({ field: 'end_date', message: 'La fecha de fin es requerida' })
    }
    if (!target_roles || target_roles.length === 0) {
      errors.push({ field: 'target_roles', message: 'Debe seleccionar al menos un rol objetivo' })
    }
    if (questions.length === 0) {
      errors.push({ field: 'questions', message: 'Debe agregar al menos una pregunta' })
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Errores de validación', details: errors },
        { status: 400 }
      )
    }

    // Create survey
    const { data: newSurvey, error: insertError } = await supabase
      .from('surveys')
      .insert({
        tenant_id: tenantId,
        brand_id: brandId,
        title: title.trim(),
        description: description?.trim() || null,
        survey_status: 'draft',
        target_roles,
        target_zone_ids: target_zone_ids?.length > 0 ? target_zone_ids : null,
        target_client_type_categories: target_client_type_categories?.length > 0 ? target_client_type_categories : null,
        start_date,
        end_date,
        max_responses_per_user,
        created_by: userProfileId
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating survey:', insertError)
      return NextResponse.json(
        { error: 'Error al crear la encuesta', details: insertError.message },
        { status: 500 }
      )
    }

    // Create questions
    if (questions.length > 0) {
      const questionRows = questions.map((q: { question_text: string; question_type: string; is_required?: boolean; sort_order: number; options?: unknown }, idx: number) => ({
        survey_id: newSurvey.id,
        tenant_id: tenantId,
        question_text: q.question_text,
        question_type: q.question_type,
        is_required: q.is_required ?? true,
        sort_order: q.sort_order ?? idx,
        options: q.options || null
      }))

      const { error: questionsError } = await supabase
        .from('survey_questions')
        .insert(questionRows)

      if (questionsError) {
        console.error('Error creating survey questions:', questionsError)
        // Clean up survey if questions fail
        await supabase.from('surveys').delete().eq('id', newSurvey.id)
        return NextResponse.json(
          { error: 'Error al crear las preguntas', details: questionsError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      survey: newSurvey,
      message: 'Encuesta guardada como borrador'
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/brand/surveys:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
