import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveAdminAuth, isAdminAuthError, adminAuthErrorResponse } from '@/lib/api/admin-auth'

interface AdminOrder {
  id: string
  public_id: string
  order_number: string
  client: {
    id: string
    business_name: string
    owner_name: string | null
  } | null
  brand: {
    id: string
    name: string
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
  source: 'direct' | 'visit'
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

    // 1. Resolve admin auth (single embedded query instead of 3 sequential)
    const authResult = await resolveAdminAuth(supabase)
    if (isAdminAuthError(authResult)) return adminAuthErrorResponse(authResult)
    const { tenantId } = authResult

    // 2. Obtener parametros de paginacion y filtros
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const clientId = searchParams.get('client_id') || ''
    const brandId = searchParams.get('brand_id') || ''
    const distributorId = searchParams.get('distributor_id') || ''
    const assignedTo = searchParams.get('assigned_to') || ''
    const dateFrom = searchParams.get('date_from') || ''
    const dateTo = searchParams.get('date_to') || ''
    const sourceChannel = searchParams.get('source_channel') || ''
    const search = searchParams.get('search') || ''
    const sourceFilter = searchParams.get('source') || '' // 'direct', 'visit', or '' for all

    const serviceSupabase = createServiceClient()

    // 3. Fetch direct orders and visit orders IN PARALLEL
    const [directResult, visitResult] = await Promise.all([
      // 3a. Direct orders from orders table
      sourceFilter !== 'visit'
        ? (async () => {
            let ordersQuery = serviceSupabase
              .from('orders')
              .select(
                `
                id, public_id, order_number, order_status, order_type, source_channel,
                order_date, total_amount, priority, created_at,
                client:clients(id, business_name, owner_name),
                brand:brands(id, name),
                distributor:distributors(id, name),
                assigned_user:user_profiles!assigned_to(id, first_name, last_name),
                order_items(count)
              `
              )
              .eq('tenant_id', tenantId)
              .is('deleted_at', null)

            if (status && status !== 'all') ordersQuery = ordersQuery.eq('order_status', status)
            if (clientId) ordersQuery = ordersQuery.eq('client_id', clientId)
            if (brandId) ordersQuery = ordersQuery.eq('brand_id', brandId)
            if (distributorId) ordersQuery = ordersQuery.eq('distributor_id', distributorId)
            if (assignedTo) ordersQuery = ordersQuery.eq('assigned_to', assignedTo)
            if (dateFrom) ordersQuery = ordersQuery.gte('order_date', dateFrom)
            if (dateTo) ordersQuery = ordersQuery.lte('order_date', dateTo)
            if (sourceChannel) ordersQuery = ordersQuery.eq('source_channel', sourceChannel)
            if (search) ordersQuery = ordersQuery.ilike('order_number', `%${search}%`)
            ordersQuery = ordersQuery.order('created_at', { ascending: false })

            return ordersQuery
          })()
        : Promise.resolve({ data: null, error: null }),

      // 3b. Visit orders from visit_orders table
      sourceFilter !== 'direct'
        ? (async () => {
            let visitQuery = serviceSupabase
              .from('visit_orders')
              .select(
                `
                id, public_id, order_number, order_status, order_type,
                order_date, total_amount, created_at,
                client:clients!client_id(id, business_name, owner_name),
                promotor:user_profiles!promotor_id(id, first_name, last_name),
                visit:visits!visit_id(brand_id, brand:brands!brand_id(id, name)),
                visit_order_items(count)
              `
              )
              .eq('tenant_id', tenantId)
              .is('deleted_at', null)

            if (status && status !== 'all') visitQuery = visitQuery.eq('order_status', status)
            if (clientId) visitQuery = visitQuery.eq('client_id', clientId)
            if (dateFrom) visitQuery = visitQuery.gte('order_date', dateFrom)
            if (dateTo) visitQuery = visitQuery.lte('order_date', dateTo)
            if (search) visitQuery = visitQuery.ilike('order_number', `%${search}%`)
            visitQuery = visitQuery.order('created_at', { ascending: false })

            return visitQuery
          })()
        : Promise.resolve({ data: null, error: null }),
    ])

    // Process direct orders
    let directOrders: AdminOrder[] = []
    if (directResult.error) {
      console.error('Error fetching orders:', directResult.error)
      return NextResponse.json(
        { error: 'Error al obtener ordenes', details: directResult.error.message },
        { status: 500 }
      )
    }
    if (directResult.data) {
      directOrders = directResult.data.map((order: unknown) => {
        const o = order as Record<string, unknown>
        const clientRaw = o.client as unknown
        const client = (Array.isArray(clientRaw) ? clientRaw[0] : clientRaw) as AdminOrder['client']
        const brandRaw = o.brand as unknown
        const brand = (Array.isArray(brandRaw) ? brandRaw[0] : brandRaw) as AdminOrder['brand']
        const distRaw = o.distributor as unknown
        const distributor = (Array.isArray(distRaw) ? distRaw[0] : distRaw) as AdminOrder['distributor']
        const userRaw = o.assigned_user as unknown
        const assignedUser = (
          Array.isArray(userRaw) ? userRaw[0] : userRaw
        ) as AdminOrder['assigned_user']
        const orderItems = o.order_items as Array<{ count: number }> | undefined

        return {
          id: o.id as string,
          public_id: o.public_id as string,
          order_number: (o.order_number || o.public_id) as string,
          client,
          brand,
          distributor,
          assigned_user: assignedUser,
          order_status: (o.order_status || 'draft') as string,
          order_type: o.order_type as string | null,
          source_channel: (o.source_channel || 'client_portal') as string,
          source: 'direct' as const,
          order_date: o.order_date as string,
          total_amount: (o.total_amount || 0) as number,
          items_count: orderItems?.[0]?.count || 0,
          priority: (o.priority || 'normal') as string,
          created_at: o.created_at as string,
        }
      })
    }

    // Process visit orders
    let visitOrdersList: AdminOrder[] = []
    if (visitResult.error) {
      console.error('Error fetching visit orders:', visitResult.error)
    } else if (visitResult.data) {
      visitOrdersList = visitResult.data.map((order: unknown) => {
        const o = order as Record<string, unknown>
        const clientRaw = o.client as unknown
        const client = (
          Array.isArray(clientRaw) ? clientRaw[0] : clientRaw
        ) as AdminOrder['client']
        const promotorRaw = o.promotor as unknown
        const promotor = (Array.isArray(promotorRaw) ? promotorRaw[0] : promotorRaw) as {
          id: string
          first_name: string
          last_name: string
        } | null
        const visitRaw = o.visit as unknown
        const visit = (Array.isArray(visitRaw) ? visitRaw[0] : visitRaw) as {
          brand_id: string
          brand: unknown
        } | null
        const brandRaw = visit?.brand as unknown
        const brand = (Array.isArray(brandRaw) ? brandRaw[0] : brandRaw) as {
          id: string
          name: string
        } | null
        const visitItems = o.visit_order_items as Array<{ count: number }> | undefined

        return {
          id: o.id as string,
          public_id: o.public_id as string,
          order_number: (o.order_number || o.public_id) as string,
          client,
          brand,
          distributor: null,
          assigned_user: promotor,
          order_status: (o.order_status || 'draft') as string,
          order_type: o.order_type as string | null,
          source_channel: 'mobile_app',
          source: 'visit' as const,
          order_date: o.order_date as string,
          total_amount: (o.total_amount || 0) as number,
          items_count: visitItems?.[0]?.count || 0,
          priority: 'normal',
          created_at: o.created_at as string,
        }
      })
    }

    // 4. Combine and sort
    const allOrders: AdminOrder[] = [...directOrders, ...visitOrdersList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // 5. Paginar resultados
    const total = allOrders.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedOrders = allOrders.slice(offset, offset + limit)

    // 6. Calcular estadisticas de resumen
    const summary: OrdersSummary = {
      total_orders: allOrders.length,
      total_sales: allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      pending_orders: allOrders.filter((o) =>
        ['draft', 'submitted', 'confirmed', 'processing'].includes(o.order_status)
      ).length,
      completed_orders: allOrders.filter((o) =>
        ['delivered', 'completed'].includes(o.order_status)
      ).length,
    }

    return NextResponse.json({
      orders: paginatedOrders,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error en GET /api/admin/orders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
