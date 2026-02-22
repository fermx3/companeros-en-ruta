import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { resolveIdColumn } from '@/lib/utils/public-id'

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
      .select('id, survey_status, title, tenant_id, created_by')
      .eq(resolveIdColumn(id), id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !survey) {
      return NextResponse.json({ error: 'Encuesta no encontrada' }, { status: 404 })
    }

    if (survey.survey_status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Solo se pueden rechazar encuestas en estado pendiente de aprobación' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { rejection_reason } = body

    if (!rejection_reason?.trim()) {
      return NextResponse.json(
        { error: 'Debe proporcionar un motivo de rechazo' },
        { status: 400 }
      )
    }

    const { data: updatedSurvey, error: updateError } = await supabase
      .from('surveys')
      .update({
        survey_status: 'draft',
        rejection_reason: rejection_reason.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', survey.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al rechazar encuesta: ${updateError.message}`)
    }

    // Notify brand manager
    try {
      await createNotification({
        tenant_id: survey.tenant_id,
        user_profile_id: survey.created_by,
        title: 'Encuesta rechazada',
        message: `Tu encuesta "${survey.title}" fue rechazada. Motivo: ${rejection_reason.trim()}`,
        notification_type: 'survey_rejected',
        action_url: `/brand/surveys/${survey.id}`,
        metadata: { survey_id: survey.id, rejection_reason: rejection_reason.trim() }
      })
    } catch (notifError) {
      console.error('Error creating rejection notification:', notifError)
    }

    return NextResponse.json({
      survey: updatedSurvey,
      message: `Encuesta "${survey.title}" rechazada`
    })

  } catch (error) {
    console.error('Error en POST /api/admin/surveys/[id]/reject:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
