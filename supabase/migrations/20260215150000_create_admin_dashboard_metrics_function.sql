-- Single function to return all admin dashboard metrics + recent activity
-- Replaces 10 separate PostgREST queries with 1 database call
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  month_start timestamptz;
  activity_items jsonb;
BEGIN
  month_start := date_trunc('month', now());

  -- Get recent activity (combine visits, orders, clients, sort, limit 5)
  SELECT COALESCE(jsonb_agg(item ORDER BY (item->>'created_at') DESC), '[]'::jsonb)
  INTO activity_items
  FROM (
    (
      SELECT jsonb_build_object(
        'id', v.id,
        'action_type', 'visit_created',
        'resource_type', 'visits',
        'created_at', v.created_at,
        'description', 'Visita ' || CASE WHEN v.visit_status = 'completed' THEN 'completada' ELSE 'registrada' END || ' para ' || COALESCE(c.business_name, 'Cliente')
      ) as item
      FROM visits v
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE v.tenant_id = p_tenant_id AND v.deleted_at IS NULL
      ORDER BY v.created_at DESC LIMIT 5
    )
    UNION ALL
    (
      SELECT jsonb_build_object(
        'id', o.id,
        'action_type', 'order_created',
        'resource_type', 'orders',
        'created_at', o.created_at,
        'description', 'Orden ' || COALESCE(o.order_number, '') || ' por $' || COALESCE(o.total_amount::text, '0')
      ) as item
      FROM orders o
      WHERE o.tenant_id = p_tenant_id AND o.deleted_at IS NULL
      ORDER BY o.created_at DESC LIMIT 5
    )
    UNION ALL
    (
      SELECT jsonb_build_object(
        'id', c.id,
        'action_type', 'client_created',
        'resource_type', 'clients',
        'created_at', c.created_at,
        'description', 'Cliente ' || c.business_name || ' registrado'
      ) as item
      FROM clients c
      WHERE c.tenant_id = p_tenant_id AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC LIMIT 5
    )
  ) sub
  LIMIT 5;

  -- Build complete result in one shot
  SELECT jsonb_build_object(
    'totalBrands', (SELECT count(*) FROM brands WHERE tenant_id = p_tenant_id AND status = 'active' AND deleted_at IS NULL),
    'activeBrands', (SELECT count(*) FROM brands WHERE tenant_id = p_tenant_id AND status = 'active' AND deleted_at IS NULL),
    'totalClients', (SELECT count(*) FROM clients WHERE tenant_id = p_tenant_id AND status = 'active' AND deleted_at IS NULL),
    'activeClients', (SELECT count(*) FROM clients WHERE tenant_id = p_tenant_id AND status = 'active' AND deleted_at IS NULL),
    'totalUsers', (SELECT count(*) FROM user_profiles WHERE tenant_id = p_tenant_id AND status = 'active' AND deleted_at IS NULL),
    'activeUsers', (SELECT count(*) FROM user_profiles WHERE tenant_id = p_tenant_id AND status = 'active' AND deleted_at IS NULL),
    'totalVisits', (SELECT count(*) FROM visits WHERE tenant_id = p_tenant_id AND deleted_at IS NULL),
    'monthlyVisits', (SELECT count(*) FROM visits WHERE tenant_id = p_tenant_id AND created_at >= month_start AND deleted_at IS NULL),
    'totalOrders', (SELECT count(*) FROM orders WHERE tenant_id = p_tenant_id AND deleted_at IS NULL),
    'monthlyRevenue', COALESCE((SELECT sum(total_amount) FROM orders WHERE tenant_id = p_tenant_id AND created_at >= month_start AND deleted_at IS NULL), 0),
    'recentActivity', activity_items
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics(uuid) TO service_role;
