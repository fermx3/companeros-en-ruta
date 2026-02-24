import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolvePromotorAuth, isPromotorAuthError, promotorAuthErrorResponse } from '@/lib/api/promotor-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET: Retrieve orders for a visit
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: visitId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  // Verify visit belongs to the user
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('id, client_id')
    .eq(resolveIdColumn(visitId), visitId)
    .single()

  if (visitError || !visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  }

  // Build query for visit_orders (orders created during visits)
  let query = supabase
    .from('visit_orders')
    .select(`
      id,
      order_number,
      order_status,
      total_amount,
      distributor_id,
      payment_method,
      order_notes,
      created_at,
      visit_order_items (
        id,
        product_id,
        product_variant_id,
        quantity_ordered,
        unit_price,
        product:products (name)
      )
    `)
    .eq('visit_id', visit.id)
    .is('deleted_at', null)

  if (status) {
    query = query.eq('order_status', status as any)
  } else {
    // By default exclude cancelled orders
    query = query.neq('order_status', 'cancelled')
  }

  const { data: orders, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 })
  }

  // Get distributor names for orders that have distributor_id
  const distributorIds = [...new Set(
    (orders || []).map(o => o.distributor_id).filter(Boolean) as string[]
  )]

  let distributorNames: Record<string, string> = {}
  if (distributorIds.length > 0) {
    const { data: distributors } = await supabase
      .from('distributors')
      .select('id, name')
      .in('id', distributorIds)

    if (distributors) {
      distributorNames = Object.fromEntries(distributors.map(d => [d.id, d.name]))
    }
  }

  // Transform to match expected format
  const transformedOrders = (orders || []).map(order => ({
    id: order.id,
    order_number: order.order_number,
    order_status: order.order_status,
    total_amount: order.total_amount,
    distributor_id: order.distributor_id,
    distributor_name: order.distributor_id ? distributorNames[order.distributor_id] || null : null,
    payment_method: order.payment_method,
    order_notes: order.order_notes,
    created_at: order.created_at,
    items: (
      (order.visit_order_items as unknown as Array<{
        id: string
        product_id: string
        product_variant_id: string | null
        quantity_ordered: number
        unit_price: number
        product: { name: string } | { name: string }[] | null
      }>) || []
    ).map(item => {
      const product = item.product
      const productName = Array.isArray(product)
        ? product[0]?.name || 'Producto'
        : product?.name || 'Producto'
      return {
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        product_name: productName,
        quantity: item.quantity_ordered,
        unit_price: Number(item.unit_price),
      }
    }),
  }))

  return NextResponse.json({ orders: transformedOrders })
}

// POST: Create a new visit order with items
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: visitId } = await params
    const supabase = await createClient()

    const auth = await resolvePromotorAuth(supabase)
    if (isPromotorAuthError(auth)) return promotorAuthErrorResponse(auth)

    const { userProfileId, tenantId } = auth

    // Verify visit exists and belongs to the promotor
    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .select('id, client_id, promotor_id')
      .eq(resolveIdColumn(visitId), visitId)
      .single()

    if (visitError || !visit) {
      return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
    }

    if (visit.promotor_id !== userProfileId) {
      return NextResponse.json({ error: 'No tienes acceso a esta visita' }, { status: 403 })
    }

    const body = await request.json()
    const {
      distributor_id,
      items,
      payment_method = 'cash',
      delivery_date,
      delivery_instructions,
      order_notes,
    } = body

    // Validate distributor_id
    if (!distributor_id) {
      return NextResponse.json({ error: 'Distribuidor es requerido' }, { status: 400 })
    }

    // Verify distributor is accessible (RLS will filter)
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('id', distributor_id)
      .single()

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distribuidor no válido' }, { status: 400 })
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un producto' }, { status: 400 })
    }

    for (const item of items) {
      if (!item.product_id) {
        return NextResponse.json({ error: 'product_id es requerido para cada item' }, { status: 400 })
      }
      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: 'La cantidad debe ser mayor a 0' }, { status: 400 })
      }
      if (item.unit_price === undefined || item.unit_price < 0) {
        return NextResponse.json({ error: 'El precio unitario debe ser >= 0' }, { status: 400 })
      }
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    )
    const totalAmount = subtotal // No discount/tax for now

    // Insert visit_order
    const { data: newOrder, error: orderError } = await supabase
      .from('visit_orders')
      .insert({
        tenant_id: tenantId,
        visit_id: visit.id,
        client_id: visit.client_id,
        promotor_id: userProfileId,
        distributor_id,
        order_date: new Date().toISOString().split('T')[0],
        order_status: 'draft',
        order_type: 'immediate',
        payment_method: payment_method || 'cash',
        delivery_date: delivery_date || null,
        delivery_instructions: delivery_instructions || null,
        order_notes: order_notes || null,
        subtotal: subtotal.toFixed(2),
        discount_amount: '0.00',
        tax_amount: '0.00',
        total_amount: totalAmount.toFixed(2),
        currency: 'MXN',
      } as any)
      .select('id')
      .single()

    if (orderError || !newOrder) {
      console.error('Error creating visit_order:', orderError)
      return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
    }

    // Insert visit_order_items
    const orderItems = items.map((item: {
      product_id: string
      product_variant_id?: string
      quantity: number
      unit_price: number
      unit_type?: string
    }, index: number) => {
      const lineSubtotal = item.quantity * item.unit_price
      return {
        tenant_id: tenantId,
        visit_order_id: newOrder.id,
        product_id: item.product_id,
        product_variant_id: item.product_variant_id || null,
        line_number: index + 1,
        quantity_ordered: item.quantity,
        unit_price: item.unit_price.toFixed(2),
        line_subtotal: lineSubtotal.toFixed(2),
        line_total: lineSubtotal.toFixed(2),
        unit_type: item.unit_type || 'pieza',
      }
    })

    const { error: itemsError } = await supabase
      .from('visit_order_items')
      .insert(orderItems as any)

    if (itemsError) {
      console.error('Error creating visit_order_items:', itemsError)
      // Order was created but items failed — still return the order ID
      return NextResponse.json(
        { error: 'Orden creada pero hubo error al agregar items', order_id: newOrder.id },
        { status: 207 }
      )
    }

    return NextResponse.json(
      { order_id: newOrder.id, message: 'Orden creada exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/promotor/visits/[id]/orders:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE: Cancel a visit order (set status to 'cancelled')
// Note: Soft-delete (setting deleted_at) is blocked by RLS policies that check
// deleted_at IS NULL in WITH CHECK. We use order_status = 'cancelled' instead.
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: visitId } = await params
    const supabase = await createClient()

    const auth = await resolvePromotorAuth(supabase)
    if (isPromotorAuthError(auth)) return promotorAuthErrorResponse(auth)

    const { userProfileId } = auth

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.json({ error: 'order_id es requerido' }, { status: 400 })
    }

    // Verify visit exists and belongs to the promotor
    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .select('id, promotor_id')
      .eq(resolveIdColumn(visitId), visitId)
      .single()

    if (visitError || !visit) {
      return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
    }

    if (visit.promotor_id !== userProfileId) {
      return NextResponse.json({ error: 'No tienes acceso a esta visita' }, { status: 403 })
    }

    // Verify order belongs to this visit and is in draft status
    const { data: order, error: orderError } = await supabase
      .from('visit_orders')
      .select('id, order_status')
      .eq('id', orderId)
      .eq('visit_id', visit.id)
      .is('deleted_at', null)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (order.order_status !== 'draft') {
      return NextResponse.json({ error: 'Solo se pueden eliminar órdenes en borrador' }, { status: 400 })
    }

    // Cancel the order instead of soft-deleting
    const { error: cancelError } = await supabase
      .from('visit_orders')
      .update({ order_status: 'cancelled' })
      .eq('id', orderId)

    if (cancelError) {
      console.error('Error cancelling visit_order:', cancelError)
      return NextResponse.json({ error: 'Error al eliminar la orden' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Orden eliminada exitosamente' })
  } catch (error) {
    console.error('Error in DELETE /api/promotor/visits/[id]/orders:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
