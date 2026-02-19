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
      .from('visits')
      .select(`
        id, public_id, visit_status, visit_date, check_in_time, check_out_time,
        promotor_notes, client_satisfaction_rating, created_at,
        client:clients!visits_client_id_fkey(business_name, public_id),
        promotor:user_profiles!visits_advisor_id_fkey(first_name, last_name)
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('visit_date', { ascending: false })

    const status = searchParams.get('status')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    if (status && status !== 'all') {
      query = query.eq('visit_status', status)
    }
    if (dateFrom) query = query.gte('visit_date', dateFrom)
    if (dateTo) query = query.lte('visit_date', dateTo)

    const { data: visits, error } = await query

    if (error) {
      console.error('Visits export query error:', error)
      return Response.json({ error: 'Error al obtener visitas' }, { status: 500 })
    }

    const headers = [
      'ID', 'Fecha', 'Cliente', 'Promotor', 'Estado',
      'Hora Inicio', 'Hora Fin', 'Duración (min)', 'Rating', 'Notas',
    ]

    let rows = (visits || []).map(v => {
      const client = v.client as any
      const promotor = v.promotor as any

      let duration = ''
      if (v.check_in_time && v.check_out_time) {
        const start = new Date(v.check_in_time).getTime()
        const end = new Date(v.check_out_time).getTime()
        duration = String(Math.round((end - start) / 60000))
      }

      return [
        v.public_id || '',
        formatCsvDate(v.visit_date),
        client?.business_name || '',
        promotor ? `${promotor.first_name} ${promotor.last_name}` : '',
        v.visit_status || '',
        v.check_in_time ? formatCsvDate(v.check_in_time) : '',
        v.check_out_time ? formatCsvDate(v.check_out_time) : '',
        duration,
        v.client_satisfaction_rating !== null ? String(v.client_satisfaction_rating) : '',
        v.promotor_notes || '',
      ]
    })

    const search = searchParams.get('search')
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(row =>
        row[2].toLowerCase().includes(s) || row[0].toLowerCase().includes(s)
      )
    }

    const csv = buildCsvString(headers, rows)
    return csvResponse(csv, `visitas_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error in GET /api/brand/visits/export:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
