import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: clientPublicId } = await params
    const supabase = await createClient()

    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Obtener user_profile del asesor de ventas
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

    // 3. Verificar rol de asesor_de_ventas activo
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status, brand_id, tenant_id')
      .eq('user_profile_id', userProfile.id)

    const asesorVentasRole = roles?.find(role =>
      role.status === 'active' &&
      role.role === 'asesor_de_ventas'
    )

    if (!asesorVentasRole) {
      return NextResponse.json(
        { error: 'Usuario no tiene rol de Asesor de Ventas activo' },
        { status: 403 }
      )
    }

    // 4. Obtener datos del cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        public_id,
        business_name,
        owner_name,
        email,
        phone,
        whatsapp,
        address_street,
        address_city,
        address_state,
        address_postal_code,
        status,
        latitude,
        longitude,
        created_at,
        zone:zones(id, name),
        market:markets(id, name),
        client_type:client_types(id, name)
      `)
      .eq('public_id', clientPublicId)
      .is('deleted_at', null)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // 5. Verificar que el asesor tiene acceso a este cliente
    // Check direct assignment first
    const { data: assignment } = await supabase
      .from('client_assignments')
      .select('id')
      .eq('client_id', clientData.id)
      .eq('user_profile_id', userProfile.id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    let hasAccess = !!assignment

    // If no direct assignment but has brand_id, check brand membership
    if (!hasAccess && asesorVentasRole.brand_id) {
      const { data: membership } = await supabase
        .from('client_brand_memberships')
        .select('id')
        .eq('client_id', clientData.id)
        .eq('brand_id', asesorVentasRole.brand_id)
        .is('deleted_at', null)
        .single()

      hasAccess = !!membership
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tiene acceso a este cliente' },
        { status: 403 }
      )
    }

    // 6. Obtener membresias del cliente a marcas
    const { data: memberships, error: membershipsError } = await supabase
      .from('client_brand_memberships')
      .select(`
        id,
        membership_status,
        points_balance,
        lifetime_points,
        created_at,
        brand:brands(id, name, logo_url),
        tier:tiers!current_tier_id(id, name, min_points_required)
      `)
      .eq('client_id', clientData.id)
      .eq('membership_status', 'active')
      .is('deleted_at', null)

    if (membershipsError) {
      console.error('Error fetching memberships:', membershipsError)
    }

    // 7. Obtener promociones activas disponibles para el cliente
    const { data: promotions } = await supabase
      .from('promotions')
      .select(`
        id,
        public_id,
        name,
        description,
        promotion_type,
        discount_value,
        discount_type,
        start_date,
        end_date,
        status,
        brand:brands(id, name)
      `)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString().split('T')[0])
      .is('deleted_at', null)
      .limit(10)

    // 8. Obtener ordenes recientes del cliente creadas por este asesor
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        public_id,
        order_number,
        order_status,
        order_date,
        total_amount,
        created_at
      `)
      .eq('client_id', clientData.id)
      .eq('assigned_to', userProfile.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5)

    // 9. Calcular estadisticas
    const { data: orderStats } = await supabase
      .from('orders')
      .select('id, total_amount, order_status')
      .eq('client_id', clientData.id)
      .eq('assigned_to', userProfile.id)
      .is('deleted_at', null)

    const stats = {
      total_orders: orderStats?.length || 0,
      total_sales: orderStats?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      pending_orders: orderStats?.filter(o =>
        ['draft', 'submitted', 'confirmed', 'processing'].includes(o.order_status)
      ).length || 0,
      completed_orders: orderStats?.filter(o =>
        ['delivered', 'completed'].includes(o.order_status)
      ).length || 0
    }

    // 10. Formatear respuesta
    const client = {
      id: clientData.id,
      public_id: clientData.public_id,
      business_name: clientData.business_name,
      owner_name: clientData.owner_name,
      email: clientData.email,
      phone: clientData.phone,
      whatsapp: clientData.whatsapp,
      address: {
        street: clientData.address_street,
        city: clientData.address_city,
        state: clientData.address_state,
        postal_code: clientData.address_postal_code
      },
      location: clientData.latitude && clientData.longitude ? {
        latitude: clientData.latitude,
        longitude: clientData.longitude
      } : null,
      status: clientData.status,
      zone: Array.isArray(clientData.zone) ? clientData.zone[0] : clientData.zone,
      market: Array.isArray(clientData.market) ? clientData.market[0] : clientData.market,
      client_type: Array.isArray(clientData.client_type) ? clientData.client_type[0] : clientData.client_type,
      created_at: clientData.created_at
    }

    const formattedMemberships = (memberships || []).map(m => ({
      id: m.id,
      status: m.membership_status,
      points_balance: m.points_balance || 0,
      total_points_earned: m.lifetime_points || 0,
      brand: Array.isArray(m.brand) ? m.brand[0] : m.brand,
      tier: Array.isArray(m.tier) ? m.tier[0] : m.tier,
      created_at: m.created_at
    }))

    const formattedPromotions = (promotions || []).map(p => ({
      id: p.id,
      public_id: p.public_id,
      name: p.name,
      description: p.description,
      promotion_type: p.promotion_type,
      discount_value: p.discount_value,
      discount_type: p.discount_type,
      start_date: p.start_date,
      end_date: p.end_date,
      status: p.status,
      brand: Array.isArray(p.brand) ? p.brand[0] : p.brand
    }))

    return NextResponse.json({
      client,
      memberships: formattedMemberships,
      promotions: formattedPromotions,
      recent_orders: recentOrders || [],
      stats
    })

  } catch (error) {
    console.error('Error en GET /api/asesor-ventas/clients/[id]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
