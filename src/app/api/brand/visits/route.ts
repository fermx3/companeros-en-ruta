import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    // Parse query params
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const status = searchParams.get('status') || ''
    const dateFrom = searchParams.get('date_from') || ''
    const dateTo = searchParams.get('date_to') || ''
    const search = searchParams.get('search') || ''

    // Build visits query
    let query = supabase
      .from('visits')
      .select(`
        id,
        public_id,
        visit_date,
        visit_status,
        check_in_time,
        check_out_time,
        client_satisfaction_rating,
        promotor_notes,
        client_id,
        clients!visits_client_id_fkey(
          id,
          business_name
        ),
        promotor:user_profiles!visits_advisor_id_fkey(
          id,
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('visit_date', { ascending: false })

    if (status) {
      query = query.eq('visit_status', status)
    }
    if (dateFrom) {
      query = query.gte('visit_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('visit_date', dateTo)
    }

    const { data: visits, error: visitsError, count } = await query
      .range(offset, offset + limit - 1)

    if (visitsError) {
      console.error('Error fetching brand visits:', visitsError)
      return NextResponse.json(
        { error: 'Error al obtener visitas' },
        { status: 500 }
      )
    }

    // Get summary stats (all visits, not paginated)
    const { data: allVisits } = await supabase
      .from('visits')
      .select('id, visit_status, client_satisfaction_rating')
      .eq('brand_id', brandId)
      .is('deleted_at', null)

    const totalVisits = allVisits?.length || 0
    const activeVisits = allVisits?.filter(v => v.visit_status === 'in_progress').length || 0
    const completedVisits = allVisits?.filter(v => v.visit_status === 'completed').length || 0
    const ratings = allVisits?.filter(v => v.client_satisfaction_rating != null).map(v => v.client_satisfaction_rating as number) || []
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
      : 0

    // Transform visits for frontend
    const transformedVisits = (visits || []).map((visit) => {
      const v = visit as Record<string, unknown>
      const client = v.clients as Record<string, unknown> | null
      const promotor = v.promotor as Record<string, unknown> | null

      let duration: number | null = null
      if (v.check_in_time && v.check_out_time) {
        const checkin = new Date(v.check_in_time as string).getTime()
        const checkout = new Date(v.check_out_time as string).getTime()
        duration = Math.round((checkout - checkin) / (1000 * 60))
      }

      return {
        id: v.id,
        public_id: v.public_id,
        visit_date: v.visit_date,
        visit_status: v.visit_status,
        duration,
        rating: v.client_satisfaction_rating,
        promotor_notes: v.promotor_notes,
        client_id: v.client_id,
        client_name: (client?.business_name as string) || 'Cliente desconocido',
        promotor_name: promotor
          ? `${promotor.first_name as string} ${promotor.last_name as string}`
          : 'Sin asignar',
      }
    })

    // Client-side search filter (on business_name)
    const filtered = search
      ? transformedVisits.filter(v =>
          v.client_name.toLowerCase().includes(search.toLowerCase())
        )
      : transformedVisits

    return NextResponse.json({
      visits: filtered,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      summary: {
        total: totalVisits,
        active: activeVisits,
        completed: completedVisits,
        avg_rating: avgRating,
      }
    })

  } catch (error) {
    console.error('Error in GET /api/brand/visits:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
