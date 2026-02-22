import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'

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

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId: targetBrandId } = result
    const serviceSupabase = createServiceClient()

    // 2. Obtener la orden sin filtro de brand (verificaremos acceso después)
    const orderQuery = supabase
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
        brand_id,
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
      .is('deleted_at', null)
      .eq(resolveIdColumn(orderId), orderId)

    const { data: orderData, error: orderError } = await orderQuery.single()

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // 2b. Verificar acceso: brand_id directo O productos de esta marca
    if (orderData.brand_id !== targetBrandId) {
      // Verificar si la orden tiene items con productos de esta marca
      const { data: brandItems } = await serviceSupabase
        .from('order_items')
        .select('id, product:products!fk_order_items_product!inner(brand_id)')
        .eq('order_id', orderData.id)
        .eq('products.brand_id', targetBrandId)
        .is('deleted_at', null)
        .limit(1)

      if (!brandItems || brandItems.length === 0) {
        return NextResponse.json(
          { error: 'Orden no encontrada' },
          { status: 404 }
        )
      }
    }

    // 3. Obtener items de la orden
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

    // 4. Transformar datos
    const clientData = orderData.client as unknown
    const client = (Array.isArray(clientData) ? clientData[0] : clientData) as OrderDetail['client']

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
      distributor,
      assigned_user: assignedUser,
      items
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error('Error en GET /api/brand/orders/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
