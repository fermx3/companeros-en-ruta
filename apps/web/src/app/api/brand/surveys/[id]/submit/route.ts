import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createBulkNotifications } from '@/lib/notifications'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    // Get survey
    const { data: survey, error: fetchError } = await supabase
      .from('surveys')
      .select('id, survey_status, title, tenant_id, brand_id')
      .eq(resolveIdColumn(id), id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !survey) {
      return NextResponse.json({ error: 'Encuesta no encontrada' }, { status: 404 })
    }

    if (survey.survey_status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden enviar a aprobación encuestas en estado borrador' },
        { status: 400 }
      )
    }

    // Verify has questions
    const { count } = await supabase
      .from('survey_questions')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', survey.id)

    if (!count || count === 0) {
      return NextResponse.json(
        { error: 'La encuesta debe tener al menos una pregunta' },
        { status: 400 }
      )
    }

    // Update to pending_approval
    const { data: updatedSurvey, error: updateError } = await supabase
      .from('surveys')
      .update({
        survey_status: 'pending_approval',
        updated_at: new Date().toISOString()
      })
      .eq('id', survey.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al enviar encuesta: ${updateError.message}`)
    }

    // Notify admins
    try {
      const serviceClient = createServiceClient()
      const { data: adminProfiles, error: adminError } = await serviceClient
        .from('user_roles')
        .select('user_profile_id')
        .eq('tenant_id', tenantId)
        .eq('role', 'admin')
        .eq('status', 'active')
        .is('deleted_at', null)

      if (adminError) {
        console.error('[submit-survey] Error fetching admin profiles:', adminError)
      }

      if (adminProfiles && adminProfiles.length > 0) {
        const uniqueIds = [...new Set(adminProfiles.map(a => a.user_profile_id))]
        await createBulkNotifications(
          uniqueIds.map(profileId => ({
            tenant_id: tenantId!,
            user_profile_id: profileId,
            title: 'Nueva encuesta pendiente de aprobación',
            message: `La encuesta "${survey.title}" requiere tu revisión y aprobación.`,
            notification_type: 'new_survey_pending' as const,
            action_url: `/admin/surveys/${survey.id}`,
            metadata: { survey_id: survey.id }
          }))
        )
      }
    } catch (notifError) {
      console.error('[submit-survey] Error creating notification:', notifError)
    }

    return NextResponse.json({
      survey: updatedSurvey,
      message: 'Encuesta enviada para aprobación'
    })

  } catch (error) {
    console.error('Error en POST /api/brand/surveys/[id]/submit:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
