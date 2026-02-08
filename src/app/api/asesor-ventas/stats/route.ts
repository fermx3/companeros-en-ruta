import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado', details: authError?.message },
        { status: 401 }
      )
    }

    // 2. Obtener user_profile del asesor de ventas
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, distributor_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado', details: profileError?.message },
        { status: 404 }
      )
    }

    // 3. Obtener roles del usuario
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status, brand_id, tenant_id')
      .eq('user_profile_id', userProfile.id)

    // 4. Validar que tenga rol de asesor_de_ventas activo
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

    const asesorId = userProfile.id
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // 5. Obtener estadisticas de ordenes
    let orderStats = {
      total_orders: 0,
      orders_this_month: 0,
      pending_orders: 0,
      completed_orders: 0,
      total_sales_amount: 0,
      avg_order_value: 0
    }

    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_status, total_amount, created_at')
        .eq('assigned_to', asesorId)
        .is('deleted_at', null)

      if (!ordersError && orders) {
        const completedOrders = orders.filter(o => o.order_status === 'completed' || o.order_status === 'delivered')
        const totalSales = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

        orderStats = {
          total_orders: orders.length,
          orders_this_month: orders.filter(o => new Date(o.created_at) >= firstDayOfMonth).length,
          pending_orders: orders.filter(o =>
            ['draft', 'submitted', 'confirmed', 'processing'].includes(o.order_status || '')
          ).length,
          completed_orders: completedOrders.length,
          total_sales_amount: totalSales,
          avg_order_value: completedOrders.length > 0 ? totalSales / completedOrders.length : 0
        }
      }
    } catch {
      // Orders table query failed, using defaults
    }

    // 6. Obtener estadisticas de clientes asignados
    const clientStats = {
      total_clients: 0
    }

    try {
      // First, count from direct client_assignments
      const { count: assignmentsCount } = await supabase
        .from('client_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('user_profile_id', asesorId)
        .eq('is_active', true)
        .is('deleted_at', null)

      clientStats.total_clients = assignmentsCount || 0

      // If no direct assignments but has brand_id, fallback to brand memberships
      if (clientStats.total_clients === 0 && asesorVentasRole.brand_id) {
        const { count: membershipsCount } = await supabase
          .from('client_brand_memberships')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', asesorVentasRole.brand_id)
          .is('deleted_at', null)

        clientStats.total_clients = membershipsCount || 0
      }
    } catch {
      // Client query failed, using defaults
    }

    // 7. Obtener estadisticas de QR canjeados (cuando exista la tabla)
    const qrStats = {
      qr_redeemed_this_month: 0,
      total_qr_redeemed: 0
    }

    // La tabla qr_redemptions sera creada en tareas futuras
    // Por ahora usamos valores por defecto

    const stats = {
      ...orderStats,
      ...clientStats,
      ...qrStats
    }

    return NextResponse.json({
      stats
    })

  } catch (error) {
    console.error('Error en /api/asesor-ventas/stats:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
