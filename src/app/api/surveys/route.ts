import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
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
      // Client user without user_profile — resolve tenant from clients table
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

    // Determine user's role for survey targeting
    const userTargetRoles: string[] = []

    if (profileId) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_profile_id', profileId)
        .eq('status', 'active')
        .is('deleted_at', null)

      const roleMap: Record<string, string> = {
        promotor: 'promotor',
        asesor_de_ventas: 'asesor_de_ventas'
      }

      for (const r of userRoles || []) {
        const mapped = roleMap[r.role]
        if (mapped) userTargetRoles.push(mapped)
      }
    }

    // Check if user is a client
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)

    if (clientData && clientData.length > 0) {
      userTargetRoles.push('client')
    }

    if (userTargetRoles.length === 0) {
      return NextResponse.json({ surveys: [] })
    }

    // Get active surveys that target the user's role(s)
    const today = new Date().toISOString().split('T')[0]

    const { data: surveys, error: surveyError } = await supabase
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
        brands(name, logo_url)
      `)
      .eq('tenant_id', tenantId)
      .eq('survey_status', 'active')
      .is('deleted_at', null)
      .lte('start_date', today)
      .gte('end_date', today)
      .overlaps('target_roles', userTargetRoles)
      .order('created_at', { ascending: false })

    if (surveyError) {
      throw new Error(`Error al obtener encuestas: ${surveyError.message}`)
    }

    // Check which surveys the user has already responded to
    const surveyIds = (surveys || []).map(s => s.id)
    let respondedSurveys: Set<string> = new Set()

    if (surveyIds.length > 0 && profileId) {
      const { data: responses } = await supabase
        .from('survey_responses')
        .select('survey_id')
        .eq('respondent_id', profileId)
        .in('survey_id', surveyIds)

      respondedSurveys = new Set((responses || []).map(r => r.survey_id))
    }

    const surveysWithStatus = (surveys || []).map(survey => ({
      ...survey,
      has_responded: respondedSurveys.has(survey.id)
    }))

    return NextResponse.json({ surveys: surveysWithStatus })

  } catch (error) {
    console.error('Error en GET /api/surveys:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
