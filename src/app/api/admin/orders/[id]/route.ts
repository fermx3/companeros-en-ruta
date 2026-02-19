import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface OrderDetailItem {
  id: string
  public_id: string
  line_number: number
  quantity_ordered: number
  quantity_confirmed: number | null
  quantity_delivered: number
  unit_price: number
  line_subtotal: number
  line_discount_amount: number
  line_total: number
  unit_type: string
  item_status: string
  product: {
    id: string
    name: string
    sku: string | null
  } | null
  product_variant: {
    id: string
    name: string
  } | null
}

interface OrderDetail {
  id: string
  public_id: string
  order_number: string
  order_status: string
  order_type: string | null
  source_channel: string
  order_date: string
  requested_delivery_date: string | null
  confirmed_delivery_date: string | null
  actual_delivery_date: string | null
  delivery_address: string | null
  delivery_instructions: string | null
  payment_method: string
  payment_status: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  priority: string
  client_notes: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string | null
  client: {
    id: string
    public_id: string
    business_name: string
    owner_name: string | null
    email: string | null
    phone: string | null
    address_street: string | null
    address_city: string | null
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
  items: OrderDetailItem[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: orderId } = await params

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
      .select('id, role, status')
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

    // 4. Obtener la orden por ID o public_id (service client bypasa RLS)
    const serviceSupabase = createServiceClient()
    let orderQuery = serviceSupabase
      .from('orders')
      .select(`
        id,
        public_id,
        order_number,
        order_status,
        order_type,
        source_channel,
        order_date,
        requested_delivery_date,
        confirmed_delivery_date,
        actual_delivery_date,
        delivery_address,
        delivery_instructions,
        payment_method,
        payment_status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        priority,
        client_notes,
        internal_notes,
        created_at,
        updated_at,
        assigned_to,
        distributor_id,
        client:clients(
          id,
          public_id,
          business_name,
          owner_name,
          email,
          phone,
          address_street,
          address_city
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
        )
      `)
      .eq('tenant_id', userProfile.tenant_id)
      .is('deleted_at', null)

    // Buscar por UUID o public_id
    if (orderId.startsWith('ORD-')) {
      orderQuery = orderQuery.eq('public_id', orderId)
    } else {
      orderQuery = orderQuery.eq('id', orderId)
    }

    const { data: orderData, error: orderError } = await orderQuery.single()

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // 5. Obtener items de la orden (service client bypasa RLS)
    const { data: itemsData, error: itemsError } = await serviceSupabase
      .from('order_items')
      .select(`
        id,
        public_id,
        line_number,
        quantity_ordered,
        quantity_confirmed,
        quantity_delivered,
        unit_price,
        line_subtotal,
        line_discount_amount,
        line_total,
        unit_type,
        item_status,
        product:products!fk_order_items_product(
          id,
          name,
          sku
        ),
        product_variant:product_variants!fk_order_items_product_variant(
          id,
          name:variant_name
        )
      `)
      .eq('order_id', orderData.id)
      .is('deleted_at', null)
      .order('line_number', { ascending: true })

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
    }

    // 6. Transformar datos
    const clientData = orderData.client as unknown
    const client = (Array.isArray(clientData) ? clientData[0] : clientData) as OrderDetail['client']

    const brandData = orderData.brand as unknown
    const brand = (Array.isArray(brandData) ? brandData[0] : brandData) as OrderDetail['brand']

    const distributorData = orderData.distributor as unknown
    const distributor = (Array.isArray(distributorData) ? distributorData[0] : distributorData) as OrderDetail['distributor']

    const assignedUserData = orderData.assigned_user as unknown
    const assignedUser = (Array.isArray(assignedUserData) ? assignedUserData[0] : assignedUserData) as OrderDetail['assigned_user']

    const items: OrderDetailItem[] = (itemsData || []).map((item: unknown) => {
      const i = item as Record<string, unknown>

      const productData = i.product as unknown
      const product = (Array.isArray(productData) ? productData[0] : productData) as OrderDetailItem['product']

      const variantData = i.product_variant as unknown
      const productVariant = (Array.isArray(variantData) ? variantData[0] : variantData) as OrderDetailItem['product_variant']

      return {
        id: i.id as string,
        public_id: i.public_id as string,
        line_number: i.line_number as number,
        quantity_ordered: i.quantity_ordered as number,
        quantity_confirmed: i.quantity_confirmed as number | null,
        quantity_delivered: (i.quantity_delivered || 0) as number,
        unit_price: i.unit_price as number,
        line_subtotal: i.line_subtotal as number,
        line_discount_amount: (i.line_discount_amount || 0) as number,
        line_total: i.line_total as number,
        unit_type: i.unit_type as string,
        item_status: i.item_status as string,
        product,
        product_variant: productVariant
      }
    })

    const order: OrderDetail = {
      id: orderData.id,
      public_id: orderData.public_id,
      order_number: orderData.order_number || orderData.public_id,
      order_status: orderData.order_status || 'draft',
      order_type: orderData.order_type,
      source_channel: orderData.source_channel || 'client_portal',
      order_date: orderData.order_date,
      requested_delivery_date: orderData.requested_delivery_date,
      confirmed_delivery_date: orderData.confirmed_delivery_date,
      actual_delivery_date: orderData.actual_delivery_date,
      delivery_address: orderData.delivery_address,
      delivery_instructions: orderData.delivery_instructions,
      payment_method: orderData.payment_method || 'cash',
      payment_status: orderData.payment_status || 'pending',
      subtotal: orderData.subtotal || 0,
      discount_amount: orderData.discount_amount || 0,
      tax_amount: orderData.tax_amount || 0,
      total_amount: orderData.total_amount || 0,
      priority: orderData.priority || 'normal',
      client_notes: orderData.client_notes,
      internal_notes: orderData.internal_notes,
      created_at: orderData.created_at,
      updated_at: orderData.updated_at,
      client,
      brand,
      distributor,
      assigned_user: assignedUser,
      items
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error('Error en GET /api/admin/orders/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: orderId } = await params

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
      .select('id, role, status')
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

    // 4. Obtener la orden actual (service client bypasa RLS)
    const serviceSupabase = createServiceClient()
    let orderQuery = serviceSupabase
      .from('orders')
      .select('id, public_id, order_status')
      .eq('tenant_id', userProfile.tenant_id)
      .is('deleted_at', null)

    if (orderId.startsWith('ORD-')) {
      orderQuery = orderQuery.eq('public_id', orderId)
    } else {
      orderQuery = orderQuery.eq('id', orderId)
    }

    const { data: existingOrder, error: orderError } = await orderQuery.single()

    if (orderError || !existingOrder) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // 5. Parsear body de la peticion
    const body = await request.json()
    const {
      order_status,
      assigned_to,
      distributor_id,
      delivery_address,
      delivery_instructions,
      priority,
      internal_notes
    } = body

    // 6. Validar transiciones de estado permitidas
    const allowedTransitions: Record<string, string[]> = {
      'draft': ['submitted', 'cancelled'],
      'submitted': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['completed'],
      'completed': [],
      'cancelled': []
    }

    if (order_status && order_status !== existingOrder.order_status) {
      const currentStatus = existingOrder.order_status || 'draft'
      const allowed = allowedTransitions[currentStatus] || []

      if (!allowed.includes(order_status)) {
        return NextResponse.json(
          { error: `No se puede cambiar de ${currentStatus} a ${order_status}` },
          { status: 400 }
        )
      }
    }

    // 7. Preparar datos de actualizacion
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (order_status !== undefined) updateData.order_status = order_status
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to
    if (distributor_id !== undefined) updateData.distributor_id = distributor_id
    if (delivery_address !== undefined) updateData.delivery_address = delivery_address
    if (delivery_instructions !== undefined) updateData.delivery_instructions = delivery_instructions
    if (priority !== undefined) updateData.priority = priority
    if (internal_notes !== undefined) updateData.internal_notes = internal_notes

    // 8. Actualizar la orden (service client bypasa RLS)
    const { data: updatedOrder, error: updateError } = await serviceSupabase
      .from('orders')
      .update(updateData)
      .eq('id', existingOrder.id)
      .select('id, public_id, order_number, order_status')
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la orden', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      order: updatedOrder,
      message: 'Orden actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error en PUT /api/admin/orders/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
