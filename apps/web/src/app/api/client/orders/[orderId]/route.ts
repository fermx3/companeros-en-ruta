import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/client/orders/[orderId]
 *
 * Returns a single order belonging to the authenticated client, including
 * brand metadata, totals breakdown, and line items. Covers both `orders` and
 * `visit_orders` so deep-links from notifications (which only carry the row id)
 * land on the right detail regardless of the order's source.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  // 1. Try the direct orders table first (most common path for self-service).
  const { data: directOrder } = await supabase
    .from('orders')
    .select(`
      id,
      public_id,
      order_number,
      order_status,
      order_type,
      order_date,
      total_amount,
      subtotal,
      discount_amount,
      payment_method,
      payment_status,
      client_notes,
      brands:brand_id ( name, logo_url ),
      items:order_items ( id, quantity_confirmed, line_subtotal, line_total, product:products(name) )
    `)
    .eq('id', orderId)
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (directOrder) {
    const brand = directOrder.brands as { name?: string | null; logo_url?: string | null } | null
    const items = (directOrder.items ?? []) as Array<{
      id: string
      quantity_confirmed: number | null
      line_subtotal: number | null
      line_total: number | null
      product: { name?: string | null } | null
    }>
    return NextResponse.json({
      order: {
        id: directOrder.id,
        public_id: directOrder.public_id,
        order_number: directOrder.order_number,
        order_status: directOrder.order_status,
        order_type: directOrder.order_type,
        order_date: directOrder.order_date,
        total_amount: Number(directOrder.total_amount ?? 0),
        subtotal: directOrder.subtotal != null ? Number(directOrder.subtotal) : null,
        discount_amount: directOrder.discount_amount != null ? Number(directOrder.discount_amount) : null,
        payment_method: directOrder.payment_method,
        payment_status: directOrder.payment_status,
        client_notes: directOrder.client_notes,
        brand_name: brand?.name ?? null,
        brand_logo_url: brand?.logo_url ?? null,
        items: items.map(i => {
          const qty = Number(i.quantity_confirmed ?? 0)
          const total = i.line_total != null ? Number(i.line_total) : null
          const unitPrice = qty > 0 && total != null ? total / qty : null
          return {
            id: i.id,
            quantity: qty,
            unit_price: unitPrice,
            total_price: total,
            product_name: i.product?.name ?? null,
          }
        }),
      },
    })
  }

  // 2. Fall back to visit_orders (orders captured by promotor during a visit).
  const { data: visitOrder } = await supabase
    .from('visit_orders')
    .select(`
      id,
      public_id,
      order_number,
      order_status,
      order_date,
      total_amount,
      discount_amount,
      order_notes,
      visits:visit_id ( brands:brand_id ( name, logo_url ) )
    `)
    .eq('id', orderId)
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!visitOrder) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const brand = ((visitOrder.visits as { brands?: { name?: string | null; logo_url?: string | null } | null } | null)?.brands) ?? null
  return NextResponse.json({
    order: {
      id: visitOrder.id,
      public_id: visitOrder.public_id,
      order_number: visitOrder.order_number ?? visitOrder.public_id,
      order_status: visitOrder.order_status,
      order_type: 'visit',
      order_date: visitOrder.order_date,
      total_amount: Number(visitOrder.total_amount ?? 0),
      subtotal: null,
      discount_amount: visitOrder.discount_amount != null ? Number(visitOrder.discount_amount) : null,
      payment_method: null,
      payment_status: null,
      client_notes: visitOrder.order_notes,
      brand_name: brand?.name ?? null,
      brand_logo_url: brand?.logo_url ?? null,
      items: [],
    },
  })
}
