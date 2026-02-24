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

    // Verify survey belongs to tenant
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, title, survey_status, target_roles')
      .eq(resolveIdColumn(id), id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (surveyError || !survey) {
      return NextResponse.json({ error: 'Encuesta no encontrada' }, { status: 404 })
    }

    // Get questions
    const { data: questions } = await supabase
      .from('survey_questions')
      .select('id, question_text, question_type, sort_order, options')
      .eq('survey_id', survey.id)
      .order('sort_order', { ascending: true })

    // Get all responses with answers
    const { data: responses } = await supabase
      .from('survey_responses')
      .select(`
        id,
        respondent_role,
        submitted_at,
        survey_answers(
          question_id,
          answer_text,
          answer_number,
          answer_choice,
          answer_scale,
          answer_boolean,
          answer_choices,
          answer_json
        )
      `)
      .eq('survey_id', survey.id)

    // Build analytics per question
    const questionAnalytics = (questions || []).map(question => {
      const answers = (responses || []).flatMap(r =>
        (r.survey_answers || []).filter(a => a.question_id === question.id)
      )

      const analytics: Record<string, unknown> = {
        question_id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        total_answers: answers.length
      }

      switch (question.question_type) {
        case 'text':
          analytics.sample_answers = answers
            .map(a => a.answer_text)
            .filter(Boolean)
            .slice(0, 10)
          break

        case 'number': {
          const numbers = answers.map(a => Number(a.answer_number)).filter(n => !isNaN(n))
          analytics.average = numbers.length > 0 ? numbers.reduce((s, n) => s + n, 0) / numbers.length : null
          analytics.min = numbers.length > 0 ? Math.min(...numbers) : null
          analytics.max = numbers.length > 0 ? Math.max(...numbers) : null
          break
        }

        case 'multiple_choice': {
          const choiceCounts: Record<string, number> = {}
          answers.forEach(a => {
            if (a.answer_choice) {
              choiceCounts[a.answer_choice] = (choiceCounts[a.answer_choice] || 0) + 1
            }
          })
          analytics.distribution = Object.entries(choiceCounts).map(([value, count]) => ({
            value,
            count,
            percentage: answers.length > 0 ? Math.round((count / answers.length) * 100) : 0
          }))
          break
        }

        case 'scale': {
          const scales = answers.map(a => Number(a.answer_scale)).filter(n => !isNaN(n))
          analytics.average = scales.length > 0 ? scales.reduce((s, n) => s + n, 0) / scales.length : null
          const scaleCounts: Record<number, number> = {}
          scales.forEach(s => {
            scaleCounts[s] = (scaleCounts[s] || 0) + 1
          })
          analytics.distribution = Object.entries(scaleCounts)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([value, count]) => ({
              value: Number(value),
              count,
              percentage: scales.length > 0 ? Math.round((count / scales.length) * 100) : 0
            }))
          break
        }

        case 'yes_no': {
          const yesCount = answers.filter(a => a.answer_boolean === true).length
          const noCount = answers.filter(a => a.answer_boolean === false).length
          analytics.distribution = [
            { value: 'Si', count: yesCount, percentage: answers.length > 0 ? Math.round((yesCount / answers.length) * 100) : 0 },
            { value: 'No', count: noCount, percentage: answers.length > 0 ? Math.round((noCount / answers.length) * 100) : 0 }
          ]
          break
        }

        case 'checkbox': {
          const checkboxCounts: Record<string, number> = {}
          answers.forEach(a => {
            const choices = a.answer_choices as string[] | null
            if (Array.isArray(choices)) {
              choices.forEach(c => {
                checkboxCounts[c] = (checkboxCounts[c] || 0) + 1
              })
            }
          })
          analytics.distribution = Object.entries(checkboxCounts).map(([value, count]) => ({
            value,
            count,
            percentage: answers.length > 0 ? Math.round((count / answers.length) * 100) : 0
          }))
          break
        }

        case 'ordered_list': {
          const rankSums: Record<string, number> = {}
          const rankCounts: Record<string, number> = {}
          answers.forEach(a => {
            const json = a.answer_json as { ordered_values?: string[] } | null
            const ordered = json?.ordered_values
            if (Array.isArray(ordered)) {
              ordered.forEach((val, idx) => {
                rankSums[val] = (rankSums[val] || 0) + (idx + 1)
                rankCounts[val] = (rankCounts[val] || 0) + 1
              })
            }
          })
          analytics.average_ranks = Object.entries(rankSums).map(([value, sum]) => ({
            value,
            average_rank: Math.round((sum / rankCounts[value]) * 100) / 100,
            response_count: rankCounts[value]
          })).sort((a, b) => a.average_rank - b.average_rank)
          break
        }

        case 'percentage_distribution': {
          const pctSums: Record<string, number> = {}
          const pctCounts: Record<string, number> = {}
          answers.forEach(a => {
            const json = a.answer_json as Record<string, number> | null
            if (json && typeof json === 'object') {
              Object.entries(json).forEach(([key, val]) => {
                if (typeof val === 'number') {
                  pctSums[key] = (pctSums[key] || 0) + val
                  pctCounts[key] = (pctCounts[key] || 0) + 1
                }
              })
            }
          })
          analytics.average_percentages = Object.entries(pctSums).map(([value, sum]) => ({
            value,
            average_percentage: Math.round((sum / pctCounts[value]) * 100) / 100,
            response_count: pctCounts[value]
          }))
          break
        }
      }

      return analytics
    })

    // Response summary by role
    const roleDistribution = (responses || []).reduce((acc, r) => {
      acc[r.respondent_role] = (acc[r.respondent_role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      survey,
      total_responses: responses?.length || 0,
      role_distribution: roleDistribution,
      question_analytics: questionAnalytics
    })

  } catch (error) {
    console.error('Error en GET /api/admin/surveys/[id]/results:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
