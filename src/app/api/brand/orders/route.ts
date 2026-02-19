import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

interface BrandOrder {
  id: string
  public_id: string
  order_number: string
  client: {
    id: string
    business_name: string
  } | null
  distributor: {
    id: string
    name: string
  } | null
  assigned_user: {
    id: string
    first_name: string
    last_name: string
  } | null
  order_status: string
  order_type: string | null
  source_channel: string
  order_date: string
  total_amount: number
  items_count: number
  priority: string
  created_at: string
}

interface OrdersSummary {
  total_orders: number
  total_sales: number
  pending_orders: number
  completed_orders: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId: targetBrandId } = result

    // 2. Obtener parametros de paginacion y filtros
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const clientId = searchParams.get('client_id') || ''
    const distributorId = searchParams.get('distributor_id') || ''
    const dateFrom = searchParams.get('date_from') || ''
    const dateTo = searchParams.get('date_to') || ''

    // 3. Consultar ordenes de esta marca
    let ordersQuery = supabase
      .from('orders')
      .select(`
        id,
        public_id,
        order_number,
        order_status,
        order_type,
        source_channel,
        order_date,
        total_amount,
        priority,
        created_at,
        client:clients(
          id,
          business_name
        ),
        distributor:distributors(
          id,
          name
        ),
        assigned_user:user_profiles!assigned_to(
          id,
          first_name,
          last_name
        ),
        order_items(count)
      `)
      .eq('brand_id', targetBrandId)
      .is('deleted_at', null)

    // Aplicar filtros
    if (status && status !== 'all') {
      ordersQuery = ordersQuery.eq('order_status', status)
    }

    if (clientId) {
      ordersQuery = ordersQuery.eq('client_id', clientId)
    }

    if (distributorId) {
      ordersQuery = ordersQuery.eq('distributor_id', distributorId)
    }

    if (dateFrom) {
      ordersQuery = ordersQuery.gte('order_date', dateFrom)
    }

    if (dateTo) {
      ordersQuery = ordersQuery.lte('order_date', dateTo)
    }

    ordersQuery = ordersQuery.order('created_at', { ascending: false })

    const { data: ordersData, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error('Error fetching brand orders:', ordersError)
      return NextResponse.json(
        { error: 'Error al obtener ordenes', details: ordersError.message },
        { status: 500 }
      )
    }

    // 4. Transformar datos
    const allOrders: BrandOrder[] = (ordersData || []).map((order: unknown) => {
      const o = order as Record<string, unknown>

      const clientData = o.client as unknown
      const client = (Array.isArray(clientData) ? clientData[0] : clientData) as BrandOrder['client']

      const distributorData = o.distributor as unknown
      const distributor = (Array.isArray(distributorData) ? distributorData[0] : distributorData) as BrandOrder['distributor']

      const assignedUserData = o.assigned_user as unknown
      const assignedUser = (Array.isArray(assignedUserData) ? assignedUserData[0] : assignedUserData) as BrandOrder['assigned_user']

      const orderItems = o.order_items as Array<{ count: number }> | undefined
      const itemsCount = orderItems?.[0]?.count || 0

      return {
        id: o.id as string,
        public_id: o.public_id as string,
        order_number: (o.order_number || o.public_id) as string,
        client,
        distributor,
        assigned_user: assignedUser,
        order_status: (o.order_status || 'draft') as string,
        order_type: o.order_type as string | null,
        source_channel: (o.source_channel || 'client_portal') as string,
        order_date: o.order_date as string,
        total_amount: (o.total_amount || 0) as number,
        items_count: itemsCount,
        priority: (o.priority || 'normal') as string,
        created_at: o.created_at as string
      }
    })

    // 5. Paginar resultados
    const total = allOrders.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedOrders = allOrders.slice(offset, offset + limit)

    // 6. Calcular estadisticas
    const summary: OrdersSummary = {
      total_orders: allOrders.length,
      total_sales: allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      pending_orders: allOrders.filter(o =>
        ['draft', 'submitted', 'confirmed', 'processing'].includes(o.order_status)
      ).length,
      completed_orders: allOrders.filter(o =>
        ['delivered', 'completed'].includes(o.order_status)
      ).length
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
    console.error('Error en GET /api/brand/orders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
