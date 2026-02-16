import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
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
      .eq('id', id)
      .eq('tenant_id', userProfile.tenant_id)
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
    const { data: existingResponse } = await supabase
      .from('survey_responses')
      .select('id, submitted_at')
      .eq('survey_id', id)
      .eq('respondent_id', userProfile.id)
      .limit(1)

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
