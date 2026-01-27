-- Migración: Crear vista simplificada de métricas de marca para testing
-- Archivo: 20250120000001_simple_brand_metrics_view.sql

-- Crear vista simplificada que no depende de otras vistas complejas
CREATE OR REPLACE VIEW brand_dashboard_metrics AS
SELECT
  -- Información básica de marca
  b.id as brand_id,
  b.public_id as brand_public_id,
  b.tenant_id,
  b.name as brand_name,
  b.slug as brand_slug,
  b.logo_url,
  b.brand_color_primary,
  b.brand_color_secondary,
  b.website,
  b.contact_email,
  b.contact_phone,
  b.contact_address,
  b.status,
  b.settings,
  b.created_at,
  b.updated_at,

  -- Información del tenant
  t.name as tenant_name,
  t.slug as tenant_slug,

  -- Métricas básicas (con valores por defecto si no hay datos)
  COALESCE(client_stats.total_clients, 0) as total_clients,
  COALESCE(client_stats.active_clients, 0) as active_clients,
  COALESCE(client_stats.pending_clients, 0) as pending_clients,
  0.0 as avg_client_points,
  0.0 as total_points_balance,

  COALESCE(visit_stats.total_visits, 0) as total_visits,
  COALESCE(visit_stats.monthly_visits, 0) as monthly_visits,
  COALESCE(visit_stats.active_visits, 0) as active_visits,
  COALESCE(visit_stats.avg_visit_rating, 0.0) as avg_visit_rating,

  COALESCE(order_stats.total_orders, 0) as total_orders,
  COALESCE(order_stats.monthly_orders, 0) as monthly_orders,
  COALESCE(order_stats.total_revenue, 0.0) as total_revenue,
  COALESCE(order_stats.monthly_revenue, 0.0) as monthly_revenue,

  COALESCE(promo_stats.active_promotions, 0) as active_promotions,
  COALESCE(promo_stats.total_promotions, 0) as total_promotions,

  -- KPIs calculados
  COALESCE(
    CASE
      WHEN COALESCE(visit_stats.total_visits, 0) > 0
      THEN COALESCE(order_stats.total_orders, 0)::decimal / visit_stats.total_visits::decimal
      ELSE 0
    END, 0
  ) as conversion_rate,

  COALESCE(
    CASE
      WHEN COALESCE(client_stats.total_clients, 0) > 0
      THEN COALESCE(order_stats.total_revenue, 0) / client_stats.total_clients
      ELSE 0
    END, 0
  ) as revenue_per_client,

  -- Fechas de métricas (por ahora nulas, se pueden llenar más tarde)
  null::timestamptz as first_membership_date,
  null::timestamptz as last_membership_date,
  visit_stats.last_visit_date,
  order_stats.last_order_date

FROM brands b
  LEFT JOIN tenants t ON b.tenant_id = t.id

  -- Estadísticas de clientes
  LEFT JOIN (
    SELECT
      brand_id,
      COUNT(*) as total_clients,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_clients,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_clients
    FROM clients
    WHERE deleted_at IS NULL
    GROUP BY brand_id
  ) client_stats ON b.id = client_stats.brand_id

  -- Estadísticas de visitas
  LEFT JOIN (
    SELECT
      brand_id,
      COUNT(*) as total_visits,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as monthly_visits,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_visits,
      AVG(COALESCE(rating, 0)) as avg_visit_rating,
      MAX(created_at) as last_visit_date
    FROM visits
    WHERE deleted_at IS NULL
    GROUP BY brand_id
  ) visit_stats ON b.id = visit_stats.brand_id

  -- Estadísticas de pedidos
  LEFT JOIN (
    SELECT
      brand_id,
      COUNT(*) as total_orders,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as monthly_orders,
      SUM(COALESCE(total_amount, 0)) as total_revenue,
      SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN COALESCE(total_amount, 0) ELSE 0 END) as monthly_revenue,
      MAX(created_at) as last_order_date
    FROM orders
    WHERE deleted_at IS NULL AND status != 'cancelled'
    GROUP BY brand_id
  ) order_stats ON b.id = order_stats.brand_id

  -- Estadísticas de promociones
  LEFT JOIN (
    SELECT
      brand_id,
      COUNT(CASE WHEN status = 'active' AND (end_date IS NULL OR end_date >= NOW()) THEN 1 END) as active_promotions,
      COUNT(*) as total_promotions
    FROM promotions
    WHERE deleted_at IS NULL
    GROUP BY brand_id
  ) promo_stats ON b.id = promo_stats.brand_id

WHERE b.deleted_at IS NULL;
