import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ClientProfile {
  id: string
  public_id: string
  business_name: string
  legal_name: string | null
  owner_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_postal_code: string | null
  status: string
  zone_name: string | null
  market_name: string | null
  client_type_name: string | null
  total_points: number
  total_orders: number
  last_order_date: string | null
  last_visit_date: string | null
  created_at: string
}

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Get client data linked to this user (clients use user_id directly, not user_roles)
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        public_id,
        business_name,
        legal_name,
        owner_name,
        email,
        phone,
        whatsapp,
        address_street,
        address_neighborhood,
        address_city,
        address_state,
        address_postal_code,
        status,
        last_visit_date,
        created_at,
        zones(name),
        markets(name),
        client_types(name)
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'No se encontró un perfil de cliente asociado a tu cuenta' },
        { status: 404 }
      )
    }

    if (clientData.status !== 'active') {
      return NextResponse.json(
        { error: 'Tu cuenta de cliente está inactiva' },
        { status: 403 }
      )
    }

    const client = clientData

    // 3. Get order stats
    const { count: orderCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', client.id)
      .is('deleted_at', null)

    const { data: lastOrder } = await supabase
      .from('orders')
      .select('created_at')
      .eq('client_id', client.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // 4. Get points balance from memberships
    const { data: memberships } = await supabase
      .from('client_brand_memberships')
      .select('points_balance')
      .eq('client_id', client.id)
      .eq('status', 'active')

    const totalPoints = memberships?.reduce((sum, m) => sum + (m.points_balance || 0), 0) || 0

    // 5. Build profile response
    const zones = client.zones as unknown as { name: string } | null
    const markets = client.markets as unknown as { name: string } | null
    const clientTypes = client.client_types as unknown as { name: string } | null

    const profile: ClientProfile = {
      id: client.id,
      public_id: client.public_id,
      business_name: client.business_name,
      legal_name: client.legal_name,
      owner_name: client.owner_name,
      email: client.email,
      phone: client.phone,
      whatsapp: client.whatsapp,
      address_street: client.address_street,
      address_neighborhood: client.address_neighborhood,
      address_city: client.address_city,
      address_state: client.address_state,
      address_postal_code: client.address_postal_code,
      status: client.status,
      zone_name: zones?.name || null,
      market_name: markets?.name || null,
      client_type_name: clientTypes?.name || null,
      total_points: totalPoints,
      total_orders: orderCount || 0,
      last_order_date: lastOrder?.created_at || null,
      last_visit_date: client.last_visit_date,
      created_at: client.created_at
    }

    return NextResponse.json(profile)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, whatsapp } = body

    // Only allow updating contact fields the client owns
    const updates: Record<string, string | null> = {}
    if (phone !== undefined) updates.phone = phone || null
    if (whatsapp !== undefined) updates.whatsapp = whatsapp || null

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('clients')
      .update(updates)
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar el perfil', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
