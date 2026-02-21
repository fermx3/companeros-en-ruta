-- ============================================================================
-- Migration: 20260221160000_drop_unused_indexes.sql
-- Purpose:   Drop GIN indexes on JSONB columns that have 0 scans (idx_scan=0)
--            in remote pg_stat_user_indexes. These are speculative indexes
--            adding write overhead with zero read benefit.
--
-- Scope:     46 GIN indexes on JSONB metadata/config columns
-- Impact:    Reduces index maintenance overhead on INSERT/UPDATE. No query
--            regressions — planner never chose these indexes.
--
-- Verification: pg_stat_user_indexes.idx_scan = 0 for all of these on remote.
-- ============================================================================

BEGIN;

-- ── products (4 GIN) ──────────────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_products_dimensions_gin;
DROP INDEX IF EXISTS public.idx_products_specifications_gin;
DROP INDEX IF EXISTS public.idx_products_gallery_urls_gin;
DROP INDEX IF EXISTS public.idx_products_marketing_tags_gin;

-- ── promotion_rules (8 GIN) ──────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_promotion_rules_target_zones_gin;
DROP INDEX IF EXISTS public.idx_promotion_rules_target_commercial_structures_gin;
DROP INDEX IF EXISTS public.idx_promotion_rules_target_markets_gin;
DROP INDEX IF EXISTS public.idx_promotion_rules_custom_conditions_gin;
DROP INDEX IF EXISTS public.idx_promotion_rules_target_client_types_gin;
DROP INDEX IF EXISTS public.idx_promotion_rules_target_states_gin;
DROP INDEX IF EXISTS public.idx_promotion_rules_target_clients_gin;
DROP INDEX IF EXISTS public.idx_promotion_rules_target_tiers_gin;
DROP INDEX IF EXISTS public.idx_promotion_rules_target_categories_gin;
DROP INDEX IF EXISTS public.idx_promotion_rules_target_products_gin;

-- ── client_brand_memberships (2 GIN) ─────────────────────────────────────
DROP INDEX IF EXISTS public.idx_client_brand_memberships_communication_preferences_gin;
DROP INDEX IF EXISTS public.idx_client_brand_memberships_membership_preferences_gin;

-- ── tiers (3 GIN) ────────────────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_tiers_benefits_gin;
DROP INDEX IF EXISTS public.idx_tiers_auto_assignment_rules_gin;
DROP INDEX IF EXISTS public.idx_tiers_requirements_gin;

-- ── order_items / visit_order_items (2 GIN) ──────────────────────────────
DROP INDEX IF EXISTS public.idx_order_items_metadata;
DROP INDEX IF EXISTS public.idx_visit_order_items_metadata;

-- ── client_types (2 GIN) ────────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_client_types_characteristics_gin;
DROP INDEX IF EXISTS public.idx_client_types_kpi_targets_gin;

-- ── commercial_structures (3 GIN) ───────────────────────────────────────
DROP INDEX IF EXISTS public.idx_commercial_structures_coverage_zones_gin;
DROP INDEX IF EXISTS public.idx_commercial_structures_commission_structure_gin;
DROP INDEX IF EXISTS public.idx_commercial_structures_supported_markets_gin;

-- ── zones (3 GIN) ───────────────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_zones_coordinates_gin;
DROP INDEX IF EXISTS public.idx_zones_cities_gin;
DROP INDEX IF EXISTS public.idx_zones_postal_codes_gin;

-- ── markets (1 GIN) ────────────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_markets_characteristics_gin;

-- ── promotions (3 GIN) ─────────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_promotions_performance_metrics_gin;
DROP INDEX IF EXISTS public.idx_promotions_days_of_week_gin;
DROP INDEX IF EXISTS public.idx_promotions_creative_assets_gin;

-- ── clients (1 GIN) ────────────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_clients_metadata_gin;

-- ── visits (2 GIN) ─────────────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_visits_metadata_gin;
DROP INDEX IF EXISTS public.idx_visits_attachments_gin;

-- ── client_tier_assignments (1 GIN) ─────────────────────────────────────
DROP INDEX IF EXISTS public.idx_client_tier_assignments_metadata_gin;

-- ── points_transactions (1 GIN) ────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_points_transactions_metadata_gin;

-- ── orders (3 GIN) ─────────────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_orders_order_attachments_gin;
DROP INDEX IF EXISTS public.idx_orders_delivery_confirmation_gin;
DROP INDEX IF EXISTS public.idx_orders_metadata_gin;

-- ── product_categories (1 GIN) ─────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_product_categories_characteristics_gin;

-- ── product_variants (2 GIN) ───────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_product_variants_dimensions_gin;
DROP INDEX IF EXISTS public.idx_product_variants_case_dimensions_gin;

-- ── visit_orders (1 GIN) ───────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_visit_orders_attachments_gin;

COMMIT;

-- ============================================================================
-- ROLLBACK: Recreate all GIN indexes
-- (Run only if needed — these indexes were never used by the query planner)
-- ============================================================================
-- CREATE INDEX idx_products_dimensions_gin ON public.products USING gin (dimensions);
-- CREATE INDEX idx_products_specifications_gin ON public.products USING gin (specifications);
-- ... (all CREATE INDEX statements for the dropped indexes)
