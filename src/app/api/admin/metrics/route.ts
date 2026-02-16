import { NextRequest } from 'next/server';
import { getAuthenticatedServiceClient } from '@/lib/utils/tenant';

export async function GET(request: NextRequest) {
  try {
    const t0 = Date.now();
    const { supabase, tenantId } = await getAuthenticatedServiceClient();
    console.log(`[metrics] auth: ${Date.now() - t0}ms`);

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthStart = currentMonth.toISOString();

    const activityLimit = 5;

    // All queries in parallel — single auth, one Promise.all
    const [
      brandsRes, clientsRes, usersRes,
      totalVisitsRes, monthlyVisitsRes,
      totalOrdersRes, monthlyOrdersRes,
      recentVisitsRes, recentOrdersRes, recentClientsRes
    ] = await Promise.all([
      supabase.from('brands').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId).eq('status', 'active').is('deleted_at', null),
      supabase.from('clients').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId).eq('status', 'active').is('deleted_at', null),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId).eq('status', 'active').is('deleted_at', null),
      supabase.from('visits').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId).is('deleted_at', null),
      supabase.from('visits').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId).gte('created_at', monthStart).is('deleted_at', null),
      supabase.from('orders').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId).is('deleted_at', null),
      supabase.from('orders').select('total_amount')
        .eq('tenant_id', tenantId).gte('created_at', monthStart).is('deleted_at', null),
      supabase.from('visits')
        .select('id, visit_status, created_at, client:clients(business_name)')
        .eq('tenant_id', tenantId).is('deleted_at', null)
        .order('created_at', { ascending: false }).limit(activityLimit),
      supabase.from('orders')
        .select('id, order_number, order_status, total_amount, created_at')
        .eq('tenant_id', tenantId).is('deleted_at', null)
        .order('created_at', { ascending: false }).limit(activityLimit),
      supabase.from('clients')
        .select('id, business_name, created_at')
        .eq('tenant_id', tenantId).is('deleted_at', null)
        .order('created_at', { ascending: false }).limit(activityLimit),
    ]);

    console.log(`[metrics] queries: ${Date.now() - t0}ms`);

    const monthlyRevenue = (monthlyOrdersRes.data || []).reduce(
      (sum, o) => sum + (o.total_amount || 0), 0
    );

    type ActivityItem = { id: string; action_type: string; description: string; resource_type: string; created_at: string };
    const activities: ActivityItem[] = [];

    for (const v of recentVisitsRes.data || []) {
      const name = (v.client as { business_name?: string })?.business_name || 'Cliente';
      activities.push({
        id: v.id, action_type: 'visit_created', resource_type: 'visits',
        created_at: v.created_at,
        description: `Visita ${v.visit_status === 'completed' ? 'completada' : 'registrada'} para ${name}`
      });
    }
    for (const o of recentOrdersRes.data || []) {
      activities.push({
        id: o.id, action_type: 'order_created', resource_type: 'orders',
        created_at: o.created_at,
        description: `Orden ${o.order_number || ''} por $${(o.total_amount || 0).toLocaleString('es-MX')}`
      });
    }
    for (const c of recentClientsRes.data || []) {
      activities.push({
        id: c.id, action_type: 'client_created', resource_type: 'clients',
        created_at: c.created_at,
        description: `Cliente ${c.business_name} registrado`
      });
    }

    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`[metrics] total: ${Date.now() - t0}ms`);
    return Response.json({
      totalBrands: brandsRes.count || 0,
      activeBrands: brandsRes.count || 0,
      totalClients: clientsRes.count || 0,
      activeClients: clientsRes.count || 0,
      totalUsers: usersRes.count || 0,
      activeUsers: usersRes.count || 0,
      totalVisits: totalVisitsRes.count || 0,
      monthlyVisits: monthlyVisitsRes.count || 0,
      totalOrders: totalOrdersRes.count || 0,
      monthlyRevenue,
      recentActivity: activities.slice(0, activityLimit)
    });

  } catch (error) {
    console.error('API Route metrics error:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
