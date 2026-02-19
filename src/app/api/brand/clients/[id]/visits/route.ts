import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    // Verify client belongs to brand
    const { data: membership } = await supabase
      .from('client_brand_memberships')
      .select('id')
      .eq('client_id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Cliente no encontrado en esta marca' },
        { status: 404 }
      )
    }

    // Parse query params
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const status = searchParams.get('status') || ''

    // Query visits
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
        promotor:user_profiles!visits_advisor_id_fkey(
          id,
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .eq('client_id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('visit_date', { ascending: false })

    if (status) {
      query = query.eq('visit_status', status)
    }

    const { data: visits, error: visitsError, count } = await query
      .range(offset, offset + limit - 1)

    if (visitsError) {
      console.error('Error fetching client visits:', visitsError)
      return NextResponse.json(
        { error: 'Error al obtener visitas' },
        { status: 500 }
      )
    }

    // Transform for frontend
    const transformedVisits = (visits || []).map((visit) => {
      const v = visit as Record<string, unknown>
      const promotor = v.promotor as Record<string, unknown> | null

      // Calculate duration in minutes
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
        check_in_time: v.check_in_time,
        check_out_time: v.check_out_time,
        duration,
        rating: v.client_satisfaction_rating,
        promotor_notes: v.promotor_notes,
        promotor_name: promotor
          ? `${promotor.first_name} ${promotor.last_name}`
          : 'Sin asignar',
      }
    })

    return NextResponse.json({
      visits: transformedVisits,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })

  } catch (error) {
    console.error('Error in GET /api/brand/clients/[id]/visits:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
