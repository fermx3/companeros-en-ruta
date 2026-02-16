import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createNotification, createBulkNotifications } from '@/lib/notifications'

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

    // Get survey
    const { data: survey, error: fetchError } = await supabase
      .from('surveys')
      .select('id, survey_status, title, tenant_id, created_by, start_date, target_roles')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !survey) {
      return NextResponse.json({ error: 'Encuesta no encontrada' }, { status: 404 })
    }

    if (survey.survey_status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Solo se pueden aprobar encuestas en estado pendiente de aprobación' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { approval_notes } = body

    // Determine status: if start_date is today or past, activate immediately
    const today = new Date().toISOString().split('T')[0]
    const newStatus = survey.start_date <= today ? 'active' : 'approved'

    const { data: updatedSurvey, error: updateError } = await supabase
      .from('surveys')
      .update({
        survey_status: newStatus,
        approved_by: userProfile.id,
        approved_at: new Date().toISOString(),
        approval_notes: approval_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al aprobar encuesta: ${updateError.message}`)
    }

    // Notify brand manager who created the survey
    try {
      await createNotification({
        tenant_id: survey.tenant_id,
        user_profile_id: survey.created_by,
        title: 'Encuesta aprobada',
        message: `Tu encuesta "${survey.title}" ha sido aprobada${newStatus === 'active' ? ' y activada' : ''}.`,
        notification_type: 'survey_approved',
        action_url: `/brand/surveys/${id}`,
        metadata: { survey_id: id }
      })
    } catch (notifError) {
      console.error('Error creating approval notification:', notifError)
    }

    // If active, notify targeted respondents
    if (newStatus === 'active') {
      try {
        await notifyTargetedRespondents(supabase, survey)
      } catch (notifError) {
        console.error('Error notifying respondents:', notifError)
      }
    }

    const message = newStatus === 'active'
      ? `Encuesta "${survey.title}" aprobada y activada`
      : `Encuesta "${survey.title}" aprobada, se activará el ${new Date(survey.start_date).toLocaleDateString('es-MX')}`

    return NextResponse.json({
      survey: updatedSurvey,
      message
    })

  } catch (error) {
    console.error('Error en POST /api/admin/surveys/[id]/approve:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

async function notifyTargetedRespondents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  survey: { id: string; title: string; tenant_id: string; target_roles: string[] }
) {
  // Map survey target roles to user_roles role names
  const roleMap: Record<string, string[]> = {
    promotor: ['promotor'],
    asesor_de_ventas: ['asesor_de_ventas'],
    client: [] // Clients don't have user_roles entries
  }

  const dbRoles = survey.target_roles
    .flatMap(r => roleMap[r] || [])
    .filter(Boolean)

  const profileIds: string[] = []

  // Get staff profiles matching roles
  if (dbRoles.length > 0) {
    const { data: staffProfiles } = await supabase
      .from('user_roles')
      .select('user_profile_id')
      .eq('tenant_id', survey.tenant_id)
      .in('role', dbRoles)
      .eq('status', 'active')
      .is('deleted_at', null)

    if (staffProfiles) {
      profileIds.push(...staffProfiles.map(p => p.user_profile_id))
    }
  }

  // Get client profiles if client is targeted
  if (survey.target_roles.includes('client')) {
    const { data: clientProfiles } = await supabase
      .from('clients')
      .select('user_id')
      .eq('tenant_id', survey.tenant_id)
      .eq('is_active', true)
      .not('user_id', 'is', null)

    if (clientProfiles) {
      for (const cp of clientProfiles) {
        if (cp.user_id) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', cp.user_id)
            .single()
          if (profile) profileIds.push(profile.id)
        }
      }
    }
  }

  const uniqueIds = [...new Set(profileIds)]
  if (uniqueIds.length === 0) return

  await createBulkNotifications(
    uniqueIds.map(profileId => ({
      tenant_id: survey.tenant_id,
      user_profile_id: profileId,
      title: 'Nueva encuesta disponible',
      message: `Tienes una nueva encuesta por responder: "${survey.title}"`,
      notification_type: 'survey_assigned' as const,
      action_url: `/surveys/${survey.id}`,
      metadata: { survey_id: survey.id }
    }))
  )
}
