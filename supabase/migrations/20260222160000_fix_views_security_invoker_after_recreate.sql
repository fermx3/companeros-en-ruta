-- Fix: Re-apply security_invoker = on to views that were recreated
-- in migration 20260222130000_add_client_onboarding_fields.sql.
-- DROP VIEW + CREATE VIEW resets security_invoker to the default (off),
-- which makes views run as SECURITY DEFINER, bypassing RLS entirely.

ALTER VIEW public.active_points_transactions SET (security_invoker = on);
ALTER VIEW public.active_client_brand_memberships SET (security_invoker = on);
ALTER VIEW public.active_promotion_redemptions SET (security_invoker = on);
ALTER VIEW public.active_visits SET (security_invoker = on);
ALTER VIEW public.active_client_invoice_data SET (security_invoker = on);
ALTER VIEW public.active_client_tier_assignments SET (security_invoker = on);
ALTER VIEW public.active_visit_orders SET (security_invoker = on);
ALTER VIEW public.active_reward_redemptions SET (security_invoker = on);
ALTER VIEW public.active_orders SET (security_invoker = on);
ALTER VIEW public.clients_with_inherited_values SET (security_invoker = on);
