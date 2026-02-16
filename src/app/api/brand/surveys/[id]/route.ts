import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getBrandProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: { message: 'Usuario no autenticado', status: 401 } }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      tenant_id,
      user_roles!user_roles_user_profile_id_fkey(
        brand_id,
        role,
        status,
        tenant_id
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  const brandRole = userProfile.user_roles.find(role =>
    role.status === 'active' &&
    ['brand_manager', 'brand_admin'].includes(role.role)
  )

  if (!brandRole || !brandRole.brand_id) {
    return { error: { message: 'Usuario no tiene permisos de marca activos', status: 403 } }
  }

  return {
    user,
    userProfileId: userProfile.id,
    brandId: brandRole.brand_id,
    tenantId: brandRole.tenant_id || userProfile.tenant_id
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId } = result

    const { data: survey, error: fetchError } = await supabase
      .from('surveys')
      .select(`
        *,
        brands(name),
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
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !survey) {
      return NextResponse.json(
        { error: 'Encuesta no encontrada' },
        { status: 404 }
      )
    }

    // Get response count
    const { count } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', id)

    // Sort questions by sort_order
    if (survey.survey_questions) {
      survey.survey_questions.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    }

    return NextResponse.json({
      survey: {
        ...survey,
        response_count: count || 0
      }
    })

  } catch (error) {
    console.error('Error en GET /api/brand/surveys/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId, tenantId } = result

    // Verify survey exists and is draft
    const { data: currentSurvey, error: fetchError } = await supabase
      .from('surveys')
      .select('id, survey_status')
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentSurvey) {
      return NextResponse.json(
        { error: 'Encuesta no encontrada' },
        { status: 404 }
      )
    }

    if (currentSurvey.survey_status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden editar encuestas en estado borrador' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      target_roles,
      target_zone_ids,
      target_client_type_categories,
      start_date,
      end_date,
      max_responses_per_user,
      questions
    } = body

    // Update survey
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (target_roles !== undefined) updateData.target_roles = target_roles
    if (target_zone_ids !== undefined) updateData.target_zone_ids = target_zone_ids?.length > 0 ? target_zone_ids : null
    if (target_client_type_categories !== undefined) updateData.target_client_type_categories = target_client_type_categories?.length > 0 ? target_client_type_categories : null
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (max_responses_per_user !== undefined) updateData.max_responses_per_user = max_responses_per_user

    const { data: updatedSurvey, error: updateError } = await supabase
      .from('surveys')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al actualizar encuesta: ${updateError.message}`)
    }

    // Update questions if provided
    if (questions !== undefined) {
      // Delete existing questions
      await supabase.from('survey_questions').delete().eq('survey_id', id)

      // Insert new questions
      if (questions.length > 0) {
        const questionRows = questions.map((q: { question_text: string; question_type: string; is_required?: boolean; sort_order: number; options?: unknown }, idx: number) => ({
          survey_id: id,
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
          throw new Error(`Error al actualizar preguntas: ${questionsError.message}`)
        }
      }
    }

    return NextResponse.json({
      survey: updatedSurvey,
      message: 'Encuesta actualizada'
    })

  } catch (error) {
    console.error('Error en PUT /api/brand/surveys/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId } = result

    // Verify survey exists and is draft
    const { data: currentSurvey } = await supabase
      .from('surveys')
      .select('id, survey_status')
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!currentSurvey) {
      return NextResponse.json(
        { error: 'Encuesta no encontrada' },
        { status: 404 }
      )
    }

    if (currentSurvey.survey_status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar encuestas en estado borrador' },
        { status: 400 }
      )
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('surveys')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      throw new Error(`Error al eliminar encuesta: ${deleteError.message}`)
    }

    return NextResponse.json({ message: 'Encuesta eliminada' })

  } catch (error) {
    console.error('Error en DELETE /api/brand/surveys/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
