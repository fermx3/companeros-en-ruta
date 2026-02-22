import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
      created_at
    `)
    .eq('visit_id', visit.id)
    .is('deleted_at', null)

  if (status) {
    query = query.eq('order_status', status)
  }

  const { data: orders, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 })
  }

  // Transform to match expected format
  const transformedOrders = (orders || []).map(order => ({
    id: order.id,
    order_number: order.order_number,
    status: order.order_status,
    total_amount: order.total_amount,
    created_at: order.created_at
  }))

  return NextResponse.json({ orders: transformedOrders })
}
