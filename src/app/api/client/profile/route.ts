import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ClientProfile {
  id: string
  public_id: string
  business_name: string
  owner_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  status: string
  zone_name: string | null
  market_name: string | null
  client_type_name: string | null
  total_points: number
  total_orders: number
  last_order_date: string | null
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

    // 2. Get user profile
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

    // 3. Verify client role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status')
      .eq('user_profile_id', userProfile.id)
      .eq('status', 'active')

    const clientRole = roles?.find(r => r.role === 'client')

    if (!clientRole) {
      return NextResponse.json(
        { error: 'Usuario no tiene rol de cliente activo' },
        { status: 403 }
      )
    }

    // 4. Get client data linked to this user
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        public_id,
        business_name,
        owner_name,
        email,
        phone,
        address,
        city,
        state,
        status,
        created_at,
        zones(name),
        markets(name),
        client_types(name)
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (clientError || !clientData) {
      // Try to find client by email if not linked by user_id
      const { data: clientByEmail } = await supabase
        .from('clients')
        .select(`
          id,
          public_id,
          business_name,
          owner_name,
          email,
          phone,
          address,
          city,
          state,
          status,
          created_at,
          zones(name),
          markets(name),
          client_types(name)
        `)
        .eq('email', user.email)
        .is('deleted_at', null)
        .single()

      if (!clientByEmail) {
        return NextResponse.json(
          { error: 'No se encontró un perfil de cliente asociado' },
          { status: 404 }
        )
      }

      // Use client found by email
      Object.assign(clientData || {}, clientByEmail)
    }

    const client = clientData!

    // 5. Get order stats
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

    // 6. Get points balance from memberships
    const { data: memberships } = await supabase
      .from('client_brand_memberships')
      .select('points_balance')
      .eq('client_id', client.id)
      .eq('status', 'active')

    const totalPoints = memberships?.reduce((sum, m) => sum + (m.points_balance || 0), 0) || 0

    // 7. Build profile response
    const zones = client.zones as unknown as { name: string } | null
    const markets = client.markets as unknown as { name: string } | null
    const clientTypes = client.client_types as unknown as { name: string } | null

    const profile: ClientProfile = {
      id: client.id,
      public_id: client.public_id,
      business_name: client.business_name,
      owner_name: client.owner_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      state: client.state,
      status: client.status,
      zone_name: zones?.name || null,
      market_name: markets?.name || null,
      client_type_name: clientTypes?.name || null,
      total_points: totalPoints,
      total_orders: orderCount || 0,
      last_order_date: lastOrder?.created_at || null,
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
