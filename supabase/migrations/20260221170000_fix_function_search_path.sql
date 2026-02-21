-- ============================================================================
-- Migration: 20260221170000_fix_function_search_path.sql
-- Purpose:   Fix function_search_path_mutable security warnings by setting
--            search_path = '' on all public schema functions that lack it.
--
-- Scope:     87 custom functions in public schema
-- Impact:    No functional change — all functions already use fully-qualified
--            references (public.table_name) or are trigger functions that
--            operate on NEW/OLD records.
--
-- Note:      pg_trgm extension functions are excluded — they will be handled
--            by moving the extension to the extensions schema.
--
-- Verification: Supabase security advisor should report 0 function_search_path
--               warnings for custom functions after this migration.
-- ============================================================================

BEGIN;

-- ── generate_* trigger/utility functions (no args) ────────────────────────
ALTER FUNCTION public.generate_brand_competitor_public_id() SET search_path = '';
ALTER FUNCTION public.generate_brand_public_id() SET search_path = '';
ALTER FUNCTION public.generate_campaign_public_id() SET search_path = '';
ALTER FUNCTION public.generate_client_assignment_public_id() SET search_path = '';
ALTER FUNCTION public.generate_client_brand_membership_public_id() SET search_path = '';
ALTER FUNCTION public.generate_client_invoice_data_public_id() SET search_path = '';
ALTER FUNCTION public.generate_client_public_id() SET search_path = '';
ALTER FUNCTION public.generate_client_tier_assignment_public_id() SET search_path = '';
ALTER FUNCTION public.generate_client_type_public_id() SET search_path = '';
ALTER FUNCTION public.generate_commercial_structure_public_id() SET search_path = '';
ALTER FUNCTION public.generate_communication_plan_public_id() SET search_path = '';
ALTER FUNCTION public.generate_distributor_public_id() SET search_path = '';
ALTER FUNCTION public.generate_exhibition_public_id() SET search_path = '';
ALTER FUNCTION public.generate_market_public_id() SET search_path = '';
ALTER FUNCTION public.generate_order_public_id() SET search_path = '';
ALTER FUNCTION public.generate_point_transaction_public_id() SET search_path = '';
ALTER FUNCTION public.generate_points_transaction_public_id() SET search_path = '';
ALTER FUNCTION public.generate_pop_material_public_id() SET search_path = '';
ALTER FUNCTION public.generate_product_category_public_id() SET search_path = '';
ALTER FUNCTION public.generate_product_public_id() SET search_path = '';
ALTER FUNCTION public.generate_product_variant_public_id() SET search_path = '';
ALTER FUNCTION public.generate_promotion_public_id() SET search_path = '';
ALTER FUNCTION public.generate_promotion_redemption_public_id() SET search_path = '';
ALTER FUNCTION public.generate_promotion_rule_public_id() SET search_path = '';
ALTER FUNCTION public.generate_promotor_assignment_public_id() SET search_path = '';
ALTER FUNCTION public.generate_qr_code() SET search_path = '';
ALTER FUNCTION public.generate_redemption_code() SET search_path = '';
ALTER FUNCTION public.generate_reward_public_id() SET search_path = '';
ALTER FUNCTION public.generate_reward_redemption_public_id() SET search_path = '';
ALTER FUNCTION public.generate_tenant_public_id() SET search_path = '';
ALTER FUNCTION public.generate_tier_public_id() SET search_path = '';
ALTER FUNCTION public.generate_user_profile_public_id() SET search_path = '';
ALTER FUNCTION public.generate_visit_assessment_public_id() SET search_path = '';
ALTER FUNCTION public.generate_visit_communication_plan_public_id() SET search_path = '';
ALTER FUNCTION public.generate_visit_evidence_public_id() SET search_path = '';
ALTER FUNCTION public.generate_visit_inventory_public_id() SET search_path = '';
ALTER FUNCTION public.generate_visit_order_public_id() SET search_path = '';
ALTER FUNCTION public.generate_visit_public_id() SET search_path = '';
ALTER FUNCTION public.generate_visit_stage_assessment_public_id() SET search_path = '';
ALTER FUNCTION public.generate_zone_public_id() SET search_path = '';

-- ── generate_* functions with args ────────────────────────────────────────
ALTER FUNCTION public.generate_public_id(text) SET search_path = '';
ALTER FUNCTION public.generate_order_number(uuid, date) SET search_path = '';

-- ── validate_* trigger/utility functions (no args) ────────────────────────
ALTER FUNCTION public.validate_campaign_data() SET search_path = '';
ALTER FUNCTION public.validate_client_brand_membership_data() SET search_path = '';
ALTER FUNCTION public.validate_client_data() SET search_path = '';
ALTER FUNCTION public.validate_client_invoice_data() SET search_path = '';
ALTER FUNCTION public.validate_client_tier_assignment_data() SET search_path = '';
ALTER FUNCTION public.validate_client_type_data() SET search_path = '';
ALTER FUNCTION public.validate_commercial_structure_data() SET search_path = '';
ALTER FUNCTION public.validate_current_tier_assignment_unique() SET search_path = '';
ALTER FUNCTION public.validate_default_tier_unique() SET search_path = '';
ALTER FUNCTION public.validate_default_variant_unique() SET search_path = '';
ALTER FUNCTION public.validate_market_data() SET search_path = '';
ALTER FUNCTION public.validate_order_data() SET search_path = '';
ALTER FUNCTION public.validate_points_transaction_data() SET search_path = '';
ALTER FUNCTION public.validate_preferred_invoice_data_unique() SET search_path = '';
ALTER FUNCTION public.validate_primary_brand_unique() SET search_path = '';
ALTER FUNCTION public.validate_product_category_data() SET search_path = '';
ALTER FUNCTION public.validate_product_data() SET search_path = '';
ALTER FUNCTION public.validate_product_variant_data() SET search_path = '';
ALTER FUNCTION public.validate_promotion_data() SET search_path = '';
ALTER FUNCTION public.validate_promotion_redemption_data() SET search_path = '';
ALTER FUNCTION public.validate_promotion_rule_data() SET search_path = '';
ALTER FUNCTION public.validate_reward_data() SET search_path = '';
ALTER FUNCTION public.validate_reward_redemption_data() SET search_path = '';
ALTER FUNCTION public.validate_role_expiration_on_critical_ops() SET search_path = '';
ALTER FUNCTION public.validate_single_primary_role() SET search_path = '';
ALTER FUNCTION public.validate_tier_data() SET search_path = '';
ALTER FUNCTION public.validate_visit_assessment_data() SET search_path = '';
ALTER FUNCTION public.validate_visit_communication_plan_data() SET search_path = '';
ALTER FUNCTION public.validate_visit_data() SET search_path = '';
ALTER FUNCTION public.validate_visit_inventory_data() SET search_path = '';
ALTER FUNCTION public.validate_visit_order_data() SET search_path = '';
ALTER FUNCTION public.validate_zone_data() SET search_path = '';

-- ── validate_* functions with args ────────────────────────────────────────
ALTER FUNCTION public.validate_public_id(text, text) SET search_path = '';

-- ── update_* trigger functions ────────────────────────────────────────────
ALTER FUNCTION public.update_brand_competitors_updated_at() SET search_path = '';
ALTER FUNCTION public.update_brand_product_assessments_updated_at() SET search_path = '';
ALTER FUNCTION public.update_campaign_budget_spent() SET search_path = '';
ALTER FUNCTION public.update_communication_plans_updated_at() SET search_path = '';
ALTER FUNCTION public.update_membership_current_tier() SET search_path = '';
ALTER FUNCTION public.update_membership_points() SET search_path = '';
ALTER FUNCTION public.update_notifications_updated_at() SET search_path = '';
ALTER FUNCTION public.update_pop_materials_updated_at() SET search_path = '';
ALTER FUNCTION public.update_promotion_usage() SET search_path = '';
ALTER FUNCTION public.update_reward_usage_count() SET search_path = '';
ALTER FUNCTION public.update_surveys_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_visit_stage_assessments_updated_at() SET search_path = '';
ALTER FUNCTION public.update_visit_workflow_status() SET search_path = '';
ALTER FUNCTION public.update_visit_workflow_status_communication() SET search_path = '';
ALTER FUNCTION public.update_visit_workflow_status_inventory() SET search_path = '';
ALTER FUNCTION public.update_visit_workflow_status_orders() SET search_path = '';

-- ── update_* functions with args ──────────────────────────────────────────
ALTER FUNCTION public.update_visit_assessment(uuid, jsonb) SET search_path = '';

-- ── calculation functions ─────────────────────────────────────────────────
ALTER FUNCTION public.calculate_current_margin(numeric, numeric) SET search_path = '';
ALTER FUNCTION public.calculate_order_total() SET search_path = '';
ALTER FUNCTION public.calculate_points_balance() SET search_path = '';
ALTER FUNCTION public.calculate_price_variance() SET search_path = '';
ALTER FUNCTION public.calculate_promotion_rule_reach() SET search_path = '';
ALTER FUNCTION public.calculate_visit_duration() SET search_path = '';

-- ── business logic functions ──────────────────────────────────────────────
ALTER FUNCTION public.auto_generate_order_number() SET search_path = '';
ALTER FUNCTION public.cascade_brand_role_soft_delete() SET search_path = '';
ALTER FUNCTION public.cascade_tenant_soft_delete() SET search_path = '';
ALTER FUNCTION public.check_manager_hierarchy() SET search_path = '';
ALTER FUNCTION public.complete_visit(uuid) SET search_path = '';
ALTER FUNCTION public.create_purchase_with_promotions(uuid, jsonb, character varying, character varying, text, boolean) SET search_path = '';
ALTER FUNCTION public.create_redemption_points_transaction() SET search_path = '';
ALTER FUNCTION public.expire_user_roles() SET search_path = '';
ALTER FUNCTION public.expire_user_roles_batch(integer) SET search_path = '';
ALTER FUNCTION public.expire_user_roles_manual() SET search_path = '';
ALTER FUNCTION public.get_admin_dashboard_metrics(uuid) SET search_path = '';
ALTER FUNCTION public.get_applicable_promotions(uuid, uuid, numeric) SET search_path = '';
ALTER FUNCTION public.get_current_tenant_id() SET search_path = '';
ALTER FUNCTION public.get_role_expiration_stats() SET search_path = '';
ALTER FUNCTION public.get_role_system_health() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.handle_promotion_rule_toggles() SET search_path = '';
ALTER FUNCTION public.is_role_active(user_role_status_enum, timestamp with time zone, timestamp with time zone) SET search_path = '';
ALTER FUNCTION public.mark_transaction_reversed() SET search_path = '';
ALTER FUNCTION public.reset_public_id_sequence(text) SET search_path = '';
ALTER FUNCTION public.set_qr_code_default() SET search_path = '';
ALTER FUNCTION public.sync_client_email() SET search_path = '';
ALTER FUNCTION public.sync_user_profile_email() SET search_path = '';
ALTER FUNCTION public.trigger_set_updated_at() SET search_path = '';

COMMIT;

-- ============================================================================
-- ROLLBACK: Reset search_path on all functions
-- ALTER FUNCTION public.<name>(<args>) RESET search_path;
-- ============================================================================
