import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createNotification, createBulkNotifications } from '@/lib/notifications'
import { resolveIdColumn } from '@companeros/shared/utils/public-id'
import {
  buildActionUrl,
  isDeliverable,
  type RecipientKind,
} from '@companeros/shared/utils/notification-routing'
import type { Database } from '@companeros/shared/types/supabase'

type UserRoleType = Database['public']['Enums']['user_role_type_enum']

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
      .eq(resolveIdColumn(id), id)
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
      .eq('id', survey.id)
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
        action_url: buildActionUrl('survey_approved', 'brand_manager', { survey_id: survey.id }),
        metadata: { survey_id: survey.id }
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
  supabase: Awaited<Awaited<ReturnType<typeof createClient>>>,
  survey: { id: string; title: string; tenant_id: string; target_roles: string[] }
) {
  // Map survey target roles → (user_roles.role, RecipientKind).
  // Supervisor + asesor + promotor all have a user_roles row; client doesn't
  // (clients are keyed by client_id, see below).
  const STAFF_ROLE_MAP: Record<string, { dbRole: UserRoleType; recipient: RecipientKind }> = {
    promotor: { dbRole: 'promotor' as UserRoleType, recipient: 'promotor' },
    asesor_de_ventas: { dbRole: 'asesor_de_ventas' as UserRoleType, recipient: 'asesor_de_ventas' },
    supervisor: { dbRole: 'supervisor' as UserRoleType, recipient: 'supervisor' },
  }

  const recipients: Parameters<typeof createBulkNotifications>[0] = []
  const metadata = { survey_id: survey.id }
  const baseShape = {
    tenant_id: survey.tenant_id,
    title: 'Nueva encuesta disponible',
    message: `Tienes una nueva encuesta por responder: "${survey.title}"`,
    notification_type: 'survey_assigned' as const,
    metadata,
  }

  // Staff respondents — one query per target role, keyed by user_profile_id.
  for (const targetRole of survey.target_roles) {
    const mapping = STAFF_ROLE_MAP[targetRole]
    if (!mapping) continue
    if (!isDeliverable('survey_assigned', mapping.recipient)) continue

    const { data: staffProfiles } = await supabase
      .from('user_roles')
      .select('user_profile_id')
      .eq('tenant_id', survey.tenant_id)
      .eq('role', mapping.dbRole)
      .eq('status', 'active')
      .is('deleted_at', null)

    const action_url = buildActionUrl('survey_assigned', mapping.recipient, metadata)
    const seen = new Set<string>()
    for (const p of staffProfiles ?? []) {
      if (seen.has(p.user_profile_id)) continue
      seen.add(p.user_profile_id)
      recipients.push({ ...baseShape, action_url, user_profile_id: p.user_profile_id })
    }
  }

  // Client respondents — keyed by client_id (RLS policy scopes client
  // notifications that way; user_profiles mapping silently drops them).
  if (survey.target_roles.includes('client') && isDeliverable('survey_assigned', 'client')) {
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .eq('tenant_id', survey.tenant_id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .not('user_id', 'is', null)

    const action_url = buildActionUrl('survey_assigned', 'client', metadata)
    for (const c of clients ?? []) {
      recipients.push({ ...baseShape, action_url, client_id: c.id })
    }
  }

  if (recipients.length === 0) return

  await createBulkNotifications(recipients)
}
