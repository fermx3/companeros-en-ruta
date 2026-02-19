import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { buildCsvString, csvResponse, formatCsvDate } from '@/lib/utils/csv'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    let query = supabase
      .from('surveys')
      .select(`
        id, public_id, title, description, survey_status,
        target_roles, start_date, end_date,
        max_responses_per_user, created_at, approved_at,
        created_by_profile:user_profiles!surveys_created_by_fkey(first_name, last_name),
        approved_by_profile:user_profiles!surveys_approved_by_fkey(first_name, last_name)
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    const status = searchParams.get('status')
    if (status && status !== 'all') {
      query = query.eq('survey_status', status)
    }

    const { data: surveys, error } = await query

    if (error) {
      return Response.json({ error: 'Error al obtener encuestas' }, { status: 500 })
    }

    // Get response counts per survey
    const surveyIds = (surveys || []).map(s => s.id)
    let responseCounts: Record<string, number> = {}
    if (surveyIds.length > 0) {
      const { data: responses } = await supabase
        .from('survey_responses')
        .select('survey_id')
        .in('survey_id', surveyIds)

      if (responses) {
        responseCounts = responses.reduce((acc, r) => {
          acc[r.survey_id] = (acc[r.survey_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    const statusLabels: Record<string, string> = {
      draft: 'Borrador',
      pending_approval: 'Pendiente',
      approved: 'Aprobada',
      active: 'Activa',
      closed: 'Cerrada',
      archived: 'Archivada',
    }

    const roleLabels: Record<string, string> = {
      promotor: 'Promotor',
      asesor_de_ventas: 'Asesor',
      client: 'Cliente',
    }

    const headers = [
      'ID', 'Título', 'Estado', 'Roles Objetivo', 'Inicio',
      'Fin', 'Respuestas', 'Max Respuestas', 'Creada Por',
      'Aprobada Por', 'Fecha Aprobación', 'Creada',
    ]

    let rows = (surveys || []).map(s => {
      const createdBy = s.created_by_profile as any
      const approvedBy = s.approved_by_profile as any
      const roles = Array.isArray(s.target_roles)
        ? s.target_roles.map((r: string) => roleLabels[r] || r).join(', ')
        : ''

      return [
        s.public_id || '',
        s.title || '',
        statusLabels[s.survey_status] || s.survey_status || '',
        roles,
        formatCsvDate(s.start_date),
        formatCsvDate(s.end_date),
        String(responseCounts[s.id] || 0),
        String(s.max_responses_per_user ?? 1),
        createdBy ? `${createdBy.first_name} ${createdBy.last_name}` : '',
        approvedBy ? `${approvedBy.first_name} ${approvedBy.last_name}` : '',
        formatCsvDate(s.approved_at),
        formatCsvDate(s.created_at),
      ]
    })

    const search = searchParams.get('search')
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(row =>
        row[1].toLowerCase().includes(s) || row[0].toLowerCase().includes(s)
      )
    }

    const csv = buildCsvString(headers, rows)
    return csvResponse(csv, `encuestas_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error in GET /api/brand/surveys/export:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
