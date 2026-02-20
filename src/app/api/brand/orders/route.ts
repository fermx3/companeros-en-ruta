import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
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

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId: targetBrandId, tenantId } = result
    const serviceSupabase = createServiceClient()

    // 2. Obtener parametros de paginacion y filtros
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const clientId = searchParams.get('client_id') || ''
    const distributorId = searchParams.get('distributor_id') || ''
    const dateFrom = searchParams.get('date_from') || ''
    const dateTo = searchParams.get('date_to') || ''
    const sourceFilter = searchParams.get('source') || '' // 'direct', 'visit', or '' for all

    // 3. Fetch direct orders and visit orders IN PARALLEL
    // Direct orders have a dependency (itemOrderIds lookup first), but we can
    // still parallelize the visit orders fetch alongside the entire direct flow.

    const directOrdersPromise = (async (): Promise<{ data: BrandOrder[]; error: string | null }> => {
      if (sourceFilter === 'visit') return { data: [], error: null }

      // Find orders with NULL brand_id that have products from this brand
      const { data: itemOrderIds } = await serviceSupabase
        .from('order_items')
        .select('order_id, product:products!fk_order_items_product!inner(brand_id)')
        .eq('products.brand_id', targetBrandId)
        .is('deleted_at', null)

      const extraOrderIds = [
        ...new Set(
          (itemOrderIds || []).map(
            (item: Record<string, unknown>) => item.order_id as string
          )
        ),
      ]

      let ordersQuery = serviceSupabase
        .from('orders')
        .select(
          `
          id, public_id, order_number, order_status, order_type, source_channel,
          order_date, total_amount, priority, created_at,
          client:clients(id, business_name),
          distributor:distributors(id, name),
          assigned_user:user_profiles!assigned_to(id, first_name, last_name),
          order_items(count)
        `
        )
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

      if (extraOrderIds.length > 0) {
        ordersQuery = ordersQuery.or(
          `brand_id.eq.${targetBrandId},id.in.(${extraOrderIds.join(',')})`
        )
      } else {
        ordersQuery = ordersQuery.eq('brand_id', targetBrandId)
      }

      if (status && status !== 'all') ordersQuery = ordersQuery.eq('order_status', status)
      if (clientId) ordersQuery = ordersQuery.eq('client_id', clientId)
      if (distributorId) ordersQuery = ordersQuery.eq('distributor_id', distributorId)
      if (dateFrom) ordersQuery = ordersQuery.gte('order_date', dateFrom)
      if (dateTo) ordersQuery = ordersQuery.lte('order_date', dateTo)
      ordersQuery = ordersQuery.order('created_at', { ascending: false })

      const { data: ordersData, error: ordersError } = await ordersQuery
      if (ordersError) {
        return { data: [], error: ordersError.message }
      }

      const mapped = (ordersData || []).map((order: unknown) => {
        const o = order as Record<string, unknown>
        const clientRaw = o.client as unknown
        const client = (Array.isArray(clientRaw) ? clientRaw[0] : clientRaw) as BrandOrder['client']
        const distRaw = o.distributor as unknown
        const distributor = (
          Array.isArray(distRaw) ? distRaw[0] : distRaw
        ) as BrandOrder['distributor']
        const userRaw = o.assigned_user as unknown
        const assignedUser = (
          Array.isArray(userRaw) ? userRaw[0] : userRaw
        ) as BrandOrder['assigned_user']
        const orderItems = o.order_items as Array<{ count: number }> | undefined

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
          source: 'direct' as const,
          order_date: o.order_date as string,
          total_amount: (o.total_amount || 0) as number,
          items_count: orderItems?.[0]?.count || 0,
          priority: (o.priority || 'normal') as string,
          created_at: o.created_at as string,
        }
      })
      return { data: mapped, error: null }
    })()

    const visitOrdersPromise = (async (): Promise<BrandOrder[]> => {
      if (sourceFilter === 'direct') return []

      let visitQuery = serviceSupabase
        .from('visit_orders')
        .select(
          `
          id, public_id, order_number, order_status, order_type,
          order_date, total_amount, created_at,
          client:clients!client_id(id, business_name),
          promotor:user_profiles!promotor_id(id, first_name, last_name),
          visit:visits!visit_id(brand_id),
          visit_order_items(count)
        `
        )
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

      if (status && status !== 'all') visitQuery = visitQuery.eq('order_status', status)
      if (clientId) visitQuery = visitQuery.eq('client_id', clientId)
      if (dateFrom) visitQuery = visitQuery.gte('order_date', dateFrom)
      if (dateTo) visitQuery = visitQuery.lte('order_date', dateTo)
      visitQuery = visitQuery.order('created_at', { ascending: false })

      const { data: visitData, error: visitError } = await visitQuery
      if (visitError) {
        console.error('Error fetching visit orders for brand:', visitError)
        return []
      }

      // Filter to only visits for this brand
      const filtered = (visitData || []).filter((order: unknown) => {
        const o = order as Record<string, unknown>
        const visitRaw = o.visit as unknown
        const visit = (Array.isArray(visitRaw) ? visitRaw[0] : visitRaw) as {
          brand_id: string
        } | null
        return visit?.brand_id === targetBrandId
      })

      return filtered.map((order: unknown) => {
        const o = order as Record<string, unknown>
        const clientRaw = o.client as unknown
        const client = (
          Array.isArray(clientRaw) ? clientRaw[0] : clientRaw
        ) as BrandOrder['client']
        const promotorRaw = o.promotor as unknown
        const promotor = (Array.isArray(promotorRaw) ? promotorRaw[0] : promotorRaw) as {
          id: string
          first_name: string
          last_name: string
        } | null
        const visitItems = o.visit_order_items as Array<{ count: number }> | undefined

        return {
          id: o.id as string,
          public_id: o.public_id as string,
          order_number: (o.order_number || o.public_id) as string,
          client,
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
    })()

    const [directResult, visitOrdersList] = await Promise.all([directOrdersPromise, visitOrdersPromise])

    if (directResult.error) {
      console.error('Error fetching brand orders:', directResult.error)
      return NextResponse.json(
        { error: 'Error al obtener ordenes', details: directResult.error },
        { status: 500 }
      )
    }

    const directOrders = directResult.data

    // 4. Combine and sort
    const allOrders: BrandOrder[] = [...directOrders, ...visitOrdersList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // 5. Paginar resultados
    const total = allOrders.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedOrders = allOrders.slice(offset, offset + limit)

    // 6. Calcular estadisticas
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
    console.error('Error en GET /api/brand/orders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
