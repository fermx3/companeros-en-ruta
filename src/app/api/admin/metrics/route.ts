import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Crear cliente Supabase con service role key
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const DEMO_TENANT_ID = 'fe0f429d-2d83-4738-af65-32c655cef656';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id') ?? DEMO_TENANT_ID;

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
      totalClients: clientsResponse.count || 0,
      totalUsers: usersResponse.count || 0,
      monthlyVisits,
      monthlyRevenue,
      activeBrands: brands.length,
      activeClients: clients.length,
      activeUsers: users.length
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
