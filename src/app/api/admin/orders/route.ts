import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Obtener user_profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 404 }
      )
    }

    // 3. Verificar rol admin activo
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status, tenant_id')
      .eq('user_profile_id', userProfile.id)

    const adminRole = roles?.find(role =>
      role.status === 'active' &&
      role.role === 'admin'
    )

    if (!adminRole) {
      return NextResponse.json(
        { error: 'Usuario no tiene rol de Administrador activo' },
        { status: 403 }
      )
    }

    // 4. Obtener parametros de paginacion y filtros
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

    // 5. Consultar todas las ordenes del tenant
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
          business_name,
          owner_name
        ),
        brand:brands(
          id,
          name
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
      .eq('tenant_id', userProfile.tenant_id)
      .is('deleted_at', null)

    // Aplicar filtros
    if (status && status !== 'all') {
      ordersQuery = ordersQuery.eq('order_status', status)
    }

    if (clientId) {
      ordersQuery = ordersQuery.eq('client_id', clientId)
    }

    if (brandId) {
      ordersQuery = ordersQuery.eq('brand_id', brandId)
    }

    if (distributorId) {
      ordersQuery = ordersQuery.eq('distributor_id', distributorId)
    }

    if (assignedTo) {
      ordersQuery = ordersQuery.eq('assigned_to', assignedTo)
    }

    if (dateFrom) {
      ordersQuery = ordersQuery.gte('order_date', dateFrom)
    }

    if (dateTo) {
      ordersQuery = ordersQuery.lte('order_date', dateTo)
    }

    if (sourceChannel) {
      ordersQuery = ordersQuery.eq('source_channel', sourceChannel)
    }

    if (search) {
      ordersQuery = ordersQuery.ilike('order_number', `%${search}%`)
    }

    // Ordenar por fecha mas reciente
    ordersQuery = ordersQuery.order('created_at', { ascending: false })

    const { data: ordersData, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json(
        { error: 'Error al obtener ordenes', details: ordersError.message },
        { status: 500 }
      )
    }

    // 6. Transformar datos
    const allOrders: AdminOrder[] = (ordersData || []).map((order: unknown) => {
      const o = order as Record<string, unknown>

      const clientData = o.client as unknown
      const client = (Array.isArray(clientData) ? clientData[0] : clientData) as AdminOrder['client']

      const brandData = o.brand as unknown
      const brand = (Array.isArray(brandData) ? brandData[0] : brandData) as AdminOrder['brand']

      const distributorData = o.distributor as unknown
      const distributor = (Array.isArray(distributorData) ? distributorData[0] : distributorData) as AdminOrder['distributor']

      const assignedUserData = o.assigned_user as unknown
      const assignedUser = (Array.isArray(assignedUserData) ? assignedUserData[0] : assignedUserData) as AdminOrder['assigned_user']

      const orderItems = o.order_items as Array<{ count: number }> | undefined
      const itemsCount = orderItems?.[0]?.count || 0

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
        order_date: o.order_date as string,
        total_amount: (o.total_amount || 0) as number,
        items_count: itemsCount,
        priority: (o.priority || 'normal') as string,
        created_at: o.created_at as string
      }
    })

    // 7. Paginar resultados
    const total = allOrders.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedOrders = allOrders.slice(offset, offset + limit)

    // 8. Calcular estadisticas de resumen
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
    console.error('Error en GET /api/admin/orders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
