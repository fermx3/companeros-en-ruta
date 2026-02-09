import { NextRequest } from 'next/server';
import { getAuthenticatedServiceClient } from '@/lib/utils/tenant';

export async function GET(request: NextRequest) {
  try {
    // Obtener cliente autenticado y tenant_id
    const { supabase, tenantId } = await getAuthenticatedServiceClient();

    // Calcular fecha de inicio del mes actual (para filtrar en SQL)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthStart = currentMonth.toISOString();

    // Ejecutar TODAS las consultas en paralelo con filtros en SQL
    const [
      brandsResponse,
      clientsResponse,
      usersResponse,
      totalVisitsResponse,
      monthlyVisitsResponse,
      totalOrdersResponse,
      monthlyOrdersResponse
    ] = await Promise.all([
      // Brands activas - solo conteo
      supabase
        .from('brands')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .is('deleted_at', null),

      // Clientes activos - solo conteo
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .is('deleted_at', null),

      // Usuarios activos - solo conteo
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .is('deleted_at', null),

      // Total de visitas - solo conteo
      supabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null),

      // Visitas del mes actual - filtrado en SQL
      supabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', monthStart)
        .is('deleted_at', null),

      // Total de órdenes - solo conteo
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null),

      // Órdenes del mes actual con total_amount - filtrado en SQL
      supabase
        .from('orders')
        .select('total_amount')
        .eq('tenant_id', tenantId)
        .gte('created_at', monthStart)
        .is('deleted_at', null)
    ]);

    // Calcular revenue del mes (solo de órdenes del mes, ya filtradas en SQL)
    const monthlyOrders = monthlyOrdersResponse.data || [];
    const monthlyRevenue = monthlyOrders.reduce((sum, order) =>
      sum + (order.total_amount || 0), 0
    );

    const metrics = {
      totalBrands: brandsResponse.count || 0,
      activeBrands: brandsResponse.count || 0,
      totalClients: clientsResponse.count || 0,
      activeClients: clientsResponse.count || 0,
      totalUsers: usersResponse.count || 0,
      activeUsers: usersResponse.count || 0,
      totalVisits: totalVisitsResponse.count || 0,
      monthlyVisits: monthlyVisitsResponse.count || 0,
      totalOrders: totalOrdersResponse.count || 0,
      monthlyRevenue
    };

    return Response.json(metrics);

  } catch (error) {
    console.error('API Route metrics error:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
