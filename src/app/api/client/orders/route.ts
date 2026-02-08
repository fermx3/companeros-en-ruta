import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UnifiedOrder {
  id: string
  public_id: string
  order_number: string
  total_amount: number
  order_status: string
  order_type: string | null
  source: 'direct' | 'visit'
  notes: string | null
  brand_id: string | null
  brand_name: string | null
  promotor_name: string | null
  order_date: string
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Get client linked to this user
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'No se encontró cuenta de cliente vinculada' },
        { status: 404 }
      )
    }

    // 3. Get pagination params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const source = searchParams.get('source') || '' // 'direct', 'visit', or '' for all

    // 4. Query direct orders (from orders table)
    let directOrdersQuery = supabase
      .from('orders')
      .select(`
        id,
        public_id,
        order_number,
        total_amount,
        order_status,
        order_type,
        client_notes,
        brand_id,
        order_date,
        created_at,
        brands:brand_id(
          id,
          name
        )
      `)
      .eq('client_id', clientData.id)
      .is('deleted_at', null)

    if (status && status !== 'all') {
      directOrdersQuery = directOrdersQuery.eq('order_status', status)
    }

    // 5. Query visit orders (from visit_orders table)
    let visitOrdersQuery = supabase
      .from('visit_orders')
      .select(`
        id,
        public_id,
        order_number,
        total_amount,
        order_status,
        order_type,
        order_notes,
        order_date,
        created_at,
        promotor:promotor_id(
          first_name,
          last_name
        ),
        visits:visit_id(
          brand_id,
          brands:brand_id(
            id,
            name
          )
        )
      `)
      .eq('client_id', clientData.id)
      .is('deleted_at', null)

    if (status && status !== 'all') {
      visitOrdersQuery = visitOrdersQuery.eq('order_status', status)
    }

    // 6. Execute queries based on source filter
    let directOrders: unknown[] = []
    let visitOrders: unknown[] = []

    if (source !== 'visit') {
      const { data, error } = await directOrdersQuery.order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching direct orders:', error)
      } else {
        directOrders = data || []
      }
    }

    if (source !== 'direct') {
      const { data, error } = await visitOrdersQuery.order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching visit orders:', error)
      } else {
        visitOrders = data || []
      }
    }

    // 7. Transform and combine orders
    const transformedDirectOrders: UnifiedOrder[] = directOrders.map((order: unknown) => {
      const o = order as Record<string, unknown>
      const brandData = o.brands as unknown
      const brand = (Array.isArray(brandData) ? brandData[0] : brandData) as { id: string; name: string } | null

      return {
        id: o.id as string,
        public_id: o.public_id as string,
        order_number: (o.order_number || o.public_id) as string,
        total_amount: (o.total_amount || 0) as number,
        order_status: (o.order_status || 'draft') as string,
        order_type: o.order_type as string | null,
        source: 'direct' as const,
        notes: o.client_notes as string | null,
        brand_id: brand?.id || null,
        brand_name: brand?.name || null,
        promotor_name: null,
        order_date: o.order_date as string,
        created_at: o.created_at as string
      }
    })

    const transformedVisitOrders: UnifiedOrder[] = visitOrders.map((order: unknown) => {
      const o = order as Record<string, unknown>
      const promotorData = o.promotor as unknown
      const promotor = (Array.isArray(promotorData) ? promotorData[0] : promotorData) as { first_name: string; last_name: string } | null

      const visitData = o.visits as unknown
      const visit = (Array.isArray(visitData) ? visitData[0] : visitData) as { brand_id: string; brands: unknown } | null
      const brandData = visit?.brands as unknown
      const brand = (Array.isArray(brandData) ? brandData[0] : brandData) as { id: string; name: string } | null

      const promotorName = promotor ? `${promotor.first_name || ''} ${promotor.last_name || ''}`.trim() : null

      return {
        id: o.id as string,
        public_id: o.public_id as string,
        order_number: (o.order_number || o.public_id) as string,
        total_amount: (o.total_amount || 0) as number,
        order_status: (o.order_status || 'draft') as string,
        order_type: o.order_type as string | null,
        source: 'visit' as const,
        notes: o.order_notes as string | null,
        brand_id: brand?.id || visit?.brand_id || null,
        brand_name: brand?.name || null,
        promotor_name: promotorName,
        order_date: o.order_date as string,
        created_at: o.created_at as string
      }
    })

    // 8. Combine and sort by date
    const allOrders = [...transformedDirectOrders, ...transformedVisitOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 9. Paginate combined results
    const total = allOrders.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedOrders = allOrders.slice(offset, offset + limit)

    // 10. Calculate summary stats
    const summary = {
      total_orders: allOrders.length,
      total_spent: allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      direct_orders: transformedDirectOrders.length,
      visit_orders: transformedVisitOrders.length,
      pending_orders: allOrders.filter(o => ['draft', 'submitted'].includes(o.order_status)).length,
      completed_orders: allOrders.filter(o => ['delivered', 'completed', 'shipped'].includes(o.order_status)).length
    }

    return NextResponse.json({
      orders: paginatedOrders,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error en GET /api/client/orders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
