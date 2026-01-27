-- ==========================================
-- VISTA: brand_dashboard_metrics
-- Métricas consolidadas para el dashboard de marca
-- ==========================================

CREATE OR REPLACE VIEW brand_dashboard_metrics AS
SELECT
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

    -- Estadísticas de membresías (de la vista existente brand_membership_stats)
    COALESCE(bms.total_memberships, 0) as total_clients,
    COALESCE(bms.active_memberships, 0) as active_clients,
    COALESCE(bms.pending_memberships, 0) as pending_clients,
    COALESCE(bms.avg_lifetime_points, 0) as avg_client_points,
    COALESCE(bms.total_points_balance, 0) as total_points_balance,

    -- Estadísticas de visitas (calculadas)
    COALESCE(visit_stats.total_visits, 0) as total_visits,
    COALESCE(visit_stats.monthly_visits, 0) as monthly_visits,
    COALESCE(visit_stats.active_visits, 0) as active_visits,
    COALESCE(visit_stats.avg_visit_rating, 0) as avg_visit_rating,

    -- Estadísticas de órdenes (calculadas)
    COALESCE(order_stats.total_orders, 0) as total_orders,
    COALESCE(order_stats.monthly_orders, 0) as monthly_orders,
    COALESCE(order_stats.total_revenue, 0) as total_revenue,
    COALESCE(order_stats.monthly_revenue, 0) as monthly_revenue,

    -- Estadísticas de promociones (calculadas)
    COALESCE(promo_stats.active_promotions, 0) as active_promotions,
    COALESCE(promo_stats.total_promotions, 0) as total_promotions,

    -- KPIs calculados
    CASE
        WHEN visit_stats.total_visits > 0 THEN
            ROUND(COALESCE(order_stats.total_orders::numeric / visit_stats.total_visits * 100, 0), 2)
        ELSE 0
    END as conversion_rate,

    CASE
        WHEN bms.active_memberships > 0 THEN
            ROUND(COALESCE(order_stats.monthly_revenue / bms.active_memberships, 0), 2)
        ELSE 0
    END as revenue_per_client,

    -- Fechas importantes
    bms.first_membership_date,
    bms.last_membership_date,
    visit_stats.last_visit_date,
    order_stats.last_order_date

FROM brands b
JOIN tenants t ON t.id = b.tenant_id
LEFT JOIN brand_membership_stats bms ON bms.brand_id = b.id
LEFT JOIN (
    -- Subquery para estadísticas de visitas por marca
    SELECT
        v.brand_id,
        COUNT(*) as total_visits,
        COUNT(CASE WHEN v.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as monthly_visits,
        COUNT(CASE WHEN v.status IN ('in_progress', 'scheduled') THEN 1 END) as active_visits,
        AVG(CASE WHEN v.overall_rating IS NOT NULL THEN v.overall_rating ELSE NULL END) as avg_visit_rating,
        MAX(v.created_at::date) as last_visit_date
    FROM visits v
    WHERE v.deleted_at IS NULL
    GROUP BY v.brand_id
) visit_stats ON visit_stats.brand_id = b.id
LEFT JOIN (
    -- Subquery para estadísticas de órdenes por marca
    SELECT
        o.brand_id,
        COUNT(*) as total_orders,
        COUNT(CASE WHEN o.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as monthly_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN o.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN o.total_amount ELSE 0 END), 0) as monthly_revenue,
        MAX(o.created_at::date) as last_order_date
    FROM orders o
    WHERE o.deleted_at IS NULL
      AND o.order_status NOT IN ('cancelled', 'rejected')
    GROUP BY o.brand_id
) order_stats ON order_stats.brand_id = b.id
LEFT JOIN (
    -- Subquery para estadísticas de promociones por marca
    SELECT
        p.brand_id,
        COUNT(*) as total_promotions,
        COUNT(CASE WHEN p.status = 'active' AND CURRENT_DATE BETWEEN p.valid_from AND COALESCE(p.valid_until, CURRENT_DATE) THEN 1 END) as active_promotions
    FROM promotions p
    WHERE p.deleted_at IS NULL
    GROUP BY p.brand_id
) promo_stats ON promo_stats.brand_id = b.id
WHERE b.deleted_at IS NULL;

-- Comentario para documentación
COMMENT ON VIEW brand_dashboard_metrics IS
'Vista consolidada con todas las métricas necesarias para el dashboard de marca, incluyendo clientes, visitas, órdenes, promociones y KPIs calculados';

-- Permisos: La vista hereda los permisos RLS de las tablas base
