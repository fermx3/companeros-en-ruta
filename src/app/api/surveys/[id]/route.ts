import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveIdColumn } from '@/lib/utils/public-id'

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

    // Resolve tenant — staff users have user_profiles, client users may only have clients
    let tenantId: string
    let profileId: string | null = null

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (userProfile) {
      tenantId = userProfile.tenant_id
      profileId = userProfile.id
    } else {
      const { data: clientRow } = await supabase
        .from('clients')
        .select('id, tenant_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .single()

      if (!clientRow) {
        return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
      }
      tenantId = clientRow.tenant_id
    }

    const { data: survey, error: fetchError } = await supabase
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
        brands(name, logo_url),
        survey_questions(
          id,
          public_id,
          question_text,
          question_type,
          is_required,
          sort_order,
          options
        )
      `)
      .eq(resolveIdColumn(id), id)
      .eq('tenant_id', tenantId)
      .eq('survey_status', 'active')
      .is('deleted_at', null)
      .single()

    if (fetchError || !survey) {
      return NextResponse.json({ error: 'Encuesta no encontrada' }, { status: 404 })
    }

    // Sort questions
    if (survey.survey_questions) {
      survey.survey_questions.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    }

    // Check if already responded
    let existingResponse: { id: string; submitted_at: string }[] | null = null
    if (profileId) {
      const { data } = await supabase
        .from('survey_responses')
        .select('id, submitted_at')
        .eq('survey_id', survey.id)
        .eq('respondent_id', profileId)
        .limit(1)
      existingResponse = data
    }

    return NextResponse.json({
      survey,
      has_responded: (existingResponse && existingResponse.length > 0),
      existing_response: existingResponse?.[0] || null
    })

  } catch (error) {
    console.error('Error en GET /api/surveys/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
