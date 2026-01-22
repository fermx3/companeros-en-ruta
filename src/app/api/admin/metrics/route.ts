import { NextRequest } from 'next/server';
import { getAuthenticatedServiceClient } from '@/lib/utils/tenant';

export async function GET(request: NextRequest) {
  try {
    // Obtener cliente autenticado y tenant_id
    const { supabase, tenantId } = await getAuthenticatedServiceClient();

    console.log('API Route - getDashboardMetrics:', { tenantId });

    // Ejecutar consultas en paralelo para obtener métricas
    const [
      brandsResponse,
      clientsResponse,
      usersResponse,
      visitsResponse,
      ordersResponse
    ] = await Promise.all([
      // Brands activas
      supabase
        .from('brands')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .is('deleted_at', null),

      // Clientes activos
      supabase
        .from('clients')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .is('deleted_at', null),

      // Usuarios activos
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .is('deleted_at', null),

      // Visitas del mes
      supabase
        .from('visits')
        .select('id, created_at', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null),

      // Órdenes recientes
      supabase
        .from('orders')
        .select('id, total_amount, created_at', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
    ]);

    // Procesar resultados
    const brands = brandsResponse.data || [];
    const clients = clientsResponse.data || [];
    const users = usersResponse.data || [];
    const visits = visitsResponse.data || [];
    const orders = ordersResponse.data || [];

    // Calcular visitas del mes actual
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyVisits = visits.filter(visit =>
      new Date(visit.created_at) >= currentMonth
    ).length;

    // Calcular revenue del mes
    const monthlyOrders = orders.filter(order =>
      new Date(order.created_at) >= currentMonth
    );
    const monthlyRevenue = monthlyOrders.reduce((sum, order) =>
      sum + (order.total_amount || 0), 0
    );

    const metrics = {
      totalBrands: brandsResponse.count || 0,
      activeBrands: brands.length,
      totalClients: clientsResponse.count || 0,
      activeClients: clients.length,
      totalUsers: usersResponse.count || 0,
      activeUsers: users.length,
      totalVisits: visitsResponse.count || 0,
      monthlyVisits,
      totalOrders: ordersResponse.count || 0,
      monthlyRevenue
    };

    console.log('API Route - metrics result:', metrics);

    return Response.json(metrics);

  } catch (error) {
    console.error('API Route metrics error:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
