-- Fix: All views must respect RLS of underlying tables
-- PostgreSQL 15+ supports security_invoker on views
-- Without this, views run as SECURITY DEFINER (default), bypassing RLS entirely
-- This means any authenticated user could see data from ALL tenants via views

-- Active entity views
ALTER VIEW public.active_brands SET (security_invoker = on);
ALTER VIEW public.active_campaigns SET (security_invoker = on);
ALTER VIEW public.active_client_brand_memberships SET (security_invoker = on);
ALTER VIEW public.active_client_invoice_data SET (security_invoker = on);
ALTER VIEW public.active_client_tier_assignments SET (security_invoker = on);
ALTER VIEW public.active_client_types SET (security_invoker = on);
ALTER VIEW public.active_commercial_structures SET (security_invoker = on);
ALTER VIEW public.active_markets SET (security_invoker = on);
ALTER VIEW public.active_order_items SET (security_invoker = on);
ALTER VIEW public.active_orders SET (security_invoker = on);
ALTER VIEW public.active_points_transactions SET (security_invoker = on);
ALTER VIEW public.active_product_categories SET (security_invoker = on);
ALTER VIEW public.active_product_variants SET (security_invoker = on);
ALTER VIEW public.active_products SET (security_invoker = on);
ALTER VIEW public.active_promotion_redemptions SET (security_invoker = on);
ALTER VIEW public.active_promotion_rules SET (security_invoker = on);
ALTER VIEW public.active_promotions SET (security_invoker = on);
ALTER VIEW public.active_reward_redemptions SET (security_invoker = on);
ALTER VIEW public.active_rewards SET (security_invoker = on);
ALTER VIEW public.active_tenants SET (security_invoker = on);
ALTER VIEW public.active_tiers SET (security_invoker = on);
ALTER VIEW public.active_user_profiles SET (security_invoker = on);
ALTER VIEW public.active_user_roles SET (security_invoker = on);
ALTER VIEW public.active_visit_assessments SET (security_invoker = on);
ALTER VIEW public.active_visit_communication_plans SET (security_invoker = on);
ALTER VIEW public.active_visit_inventories SET (security_invoker = on);
ALTER VIEW public.active_visit_order_items SET (security_invoker = on);
ALTER VIEW public.active_visit_orders SET (security_invoker = on);
ALTER VIEW public.active_visits SET (security_invoker = on);
ALTER VIEW public.active_zones SET (security_invoker = on);
ALTER VIEW public.active_distributors SET (security_invoker = on);

-- Statistics views
ALTER VIEW public.brand_membership_stats SET (security_invoker = on);
ALTER VIEW public.brand_product_stats SET (security_invoker = on);
ALTER VIEW public.brand_tier_member_distribution SET (security_invoker = on);
ALTER VIEW public.brand_tier_stats SET (security_invoker = on);
ALTER VIEW public.client_type_kpi_analysis SET (security_invoker = on);
ALTER VIEW public.client_type_tenant_summary SET (security_invoker = on);
ALTER VIEW public.clients_with_inherited_values SET (security_invoker = on);
ALTER VIEW public.market_stats SET (security_invoker = on);
ALTER VIEW public.market_tenant_summary SET (security_invoker = on);
ALTER VIEW public.product_category_stats SET (security_invoker = on);
ALTER VIEW public.product_variant_stats SET (security_invoker = on);
