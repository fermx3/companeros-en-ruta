import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createNotification, getClientUserProfileId } from '@/lib/notifications'
import { resolveAsesorAuth, isAsesorAuthError, asesorAuthErrorResponse } from '@/lib/api/asesor-auth'

interface AsesorOrder {
  id: string
  public_id: string
  order_number: string
  client: {
    id: string
    public_id: string
    business_name: string
    owner_name: string | null
  } | null
  brand: {
    id: string
    name: string
  } | null
  order_status: string
  order_type: string | null
  source_channel: string
  order_date: string
  total_amount: number
  items_count: number
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

    // Authenticate and verify asesor role
    const authResult = await resolveAsesorAuth(supabase)
    if (isAsesorAuthError(authResult)) return asesorAuthErrorResponse(authResult)
    const { userProfileId } = authResult

    // 4. Obtener parametros de paginacion y filtros
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const clientId = searchParams.get('client_id') || ''
    const dateFrom = searchParams.get('date_from') || ''
    const dateTo = searchParams.get('date_to') || ''

    const asesorId = userProfileId

    // 5. Consultar ordenes asignadas a este asesor
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
        created_at,
        client:clients(
          id,
          public_id,
          business_name,
          owner_name
        ),
        brand:brands(
          id,
          name
        ),
        order_items(count)
      `)
      .eq('assigned_to', asesorId)
      .is('deleted_at', null)

    // Aplicar filtros
    if (status && status !== 'all') {
      ordersQuery = ordersQuery.eq('order_status', status)
    }

    if (clientId) {
      ordersQuery = ordersQuery.eq('client_id', clientId)
    }

    if (dateFrom) {
      ordersQuery = ordersQuery.gte('order_date', dateFrom)
    }

    if (dateTo) {
      ordersQuery = ordersQuery.lte('order_date', dateTo)
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
    const allOrders: AsesorOrder[] = (ordersData || []).map((order: unknown) => {
      const o = order as Record<string, unknown>

      // Handle client - can be object or array
      const clientData = o.client as unknown
      const client = (Array.isArray(clientData) ? clientData[0] : clientData) as {
        id: string
        public_id: string
        business_name: string
        owner_name: string | null
      } | null

      // Handle brand - can be object or array
      const brandData = o.brand as unknown
      const brand = (Array.isArray(brandData) ? brandData[0] : brandData) as {
        id: string
        name: string
      } | null

      // Handle items count
      const orderItems = o.order_items as Array<{ count: number }> | undefined
      const itemsCount = orderItems?.[0]?.count || 0

      return {
        id: o.id as string,
        public_id: o.public_id as string,
        order_number: (o.order_number || o.public_id) as string,
        client,
        brand,
        order_status: (o.order_status || 'draft') as string,
        order_type: o.order_type as string | null,
        source_channel: (o.source_channel || 'client_portal') as string,
        order_date: o.order_date as string,
        total_amount: (o.total_amount || 0) as number,
        items_count: itemsCount,
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
    console.error('Error en GET /api/asesor-ventas/orders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate and verify asesor role
    const authResult = await resolveAsesorAuth(supabase)
    if (isAsesorAuthError(authResult)) return asesorAuthErrorResponse(authResult)
    const { userProfileId, tenantId, distributorId, brandId } = authResult

    // 4. Parsear body de la peticion
    const body = await request.json()
    const {
      client_id,
      items,
      delivery_address,
      delivery_instructions,
      requested_delivery_date,
      client_notes,
      priority = 'normal'
    } = body

    // 5. Validar campos requeridos
    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id es requerido' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items es requerido y debe contener al menos un producto' },
        { status: 400 }
      )
    }

    // 6. Verificar que el cliente esta asignado al asesor
    // First, check direct client_assignments
    const { data: clientAssignment, error: assignmentError } = await supabase
      .from('client_assignments')
      .select('id, client_id')
      .eq('client_id', client_id)
      .eq('user_profile_id', userProfileId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    let hasAccess = !assignmentError && clientAssignment

    // If no direct assignment but has brand_id, fallback to brand memberships
    if (!hasAccess && brandId) {
      const { data: clientMembership, error: membershipError } = await supabase
        .from('client_brand_memberships')
        .select('id, client_id')
        .eq('client_id', client_id)
        .eq('brand_id', brandId)
        .is('deleted_at', null)
        .single()

      hasAccess = !membershipError && clientMembership
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tiene acceso a este cliente' },
        { status: 403 }
      )
    }

    // 7. Obtener commercial_structure_id del asesor

    // Buscar el commercial_structure vinculado al distribuidor
    let commercialStructureId: string | null = null
    if (distributorId) {
      const { data: commercialStructure } = await supabase
        .from('commercial_structures')
        .select('id')
        .eq('distributor_id', distributorId)
        .is('deleted_at', null)
        .single()

      commercialStructureId = commercialStructure?.id || null
    }

    // Si no hay estructura comercial, buscar una por defecto para el tenant
    if (!commercialStructureId && tenantId) {
      const { data: defaultStructure } = await supabase
        .from('commercial_structures')
        .select('id')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .limit(1)
        .single()

      commercialStructureId = defaultStructure?.id || null
    }

    if (!commercialStructureId) {
      return NextResponse.json(
        { error: 'No se encontro estructura comercial para crear la orden' },
        { status: 400 }
      )
    }

    // 8. Generar numero de orden
    const orderNumber = `ORD-${Date.now()}`
    const orderDate = new Date().toISOString().split('T')[0]

    // 9. Calcular totales
    let subtotal = 0
    for (const item of items) {
      const lineTotal = (item.quantity || 0) * (item.unit_price || 0)
      subtotal += lineTotal
    }
    const totalAmount = subtotal // Por ahora sin impuestos ni descuentos

    // 10. Crear la orden (brand_id puede ser NULL para ordenes multi-marca)
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        tenant_id: tenantId,
        client_id,
        brand_id: brandId || null,
        order_number: orderNumber,
        order_type: 'standard',
        order_status: 'draft',
        order_date: orderDate,
        requested_delivery_date: requested_delivery_date || null,
        delivery_address: delivery_address || null,
        delivery_instructions: delivery_instructions || null,
        commercial_structure_id: commercialStructureId,
        distributor_id: distributorId,
        subtotal,
        total_amount: totalAmount,
        priority,
        source_channel: 'field_sales',
        assigned_to: userProfileId,
        client_notes: client_notes || null
      })
      .select('id, public_id, order_number')
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Error al crear la orden', details: orderError.message },
        { status: 500 }
      )
    }

    // 11. Crear items de la orden
    const orderItems = items.map((item: {
      product_id: string
      product_variant_id?: string
      quantity: number
      unit_price: number
      unit_type?: string
    }, index: number) => ({
      tenant_id: tenantId,
      order_id: newOrder.id,
      product_id: item.product_id,
      product_variant_id: item.product_variant_id || null,
      line_number: index + 1,
      quantity_ordered: item.quantity,
      unit_price: item.unit_price,
      line_subtotal: item.quantity * item.unit_price,
      line_total: item.quantity * item.unit_price,
      unit_type: item.unit_type || 'pieza',
      item_status: 'pending'
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // La orden ya se creo, reportar el error pero no fallar completamente
      return NextResponse.json({
        order: newOrder,
        warning: 'Orden creada pero hubo un error al agregar algunos items',
        details: itemsError.message
      }, { status: 201 })
    }

    // Notify the client about the new order
    try {
      const serviceClient = createServiceClient()
      const clientProfileId = await getClientUserProfileId(serviceClient, client_id)
      if (clientProfileId) {
        await createNotification({
          tenant_id: tenantId,
          user_profile_id: clientProfileId,
          title: 'Nueva orden creada',
          message: `Se ha creado la orden ${newOrder.order_number} para tu negocio`,
          notification_type: 'order_created',
          action_url: '/client/orders',
          metadata: { order_id: newOrder.id },
        })
      }
    } catch (notifError) {
      console.error('Error creating order notification:', notifError)
    }

    return NextResponse.json({
      order: newOrder,
      message: 'Orden creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/asesor-ventas/orders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
