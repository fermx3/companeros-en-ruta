-- ============================================================================
-- Migration: 20260221140000_rls_consolidation_phase3_write_policies.sql
-- Purpose:   Consolidate write policies (INSERT/UPDATE/DELETE) into FOR ALL.
--
--   A) 22 tables: 3 admin I/U/D → 1 admin FOR ALL  (-44 policies)
--   B) order_items: 3 client I/U/D → 1 FOR ALL      (-2 policies)
--   C) visit_order_items: 3 promotor I/U/D → 1 FOR ALL (-2 policies)
--
-- Net reduction: -48 policies (238 → 190)
--
-- Pre-requisite: Phase 1 helpers (is_global_admin, get_user_profile_id)
--                Phase 2 SELECT consolidation (rls_select_* policies)
--
-- Rollback: See bottom of file.
-- ============================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- A) Admin INSERT/UPDATE/DELETE → 1 FOR ALL per table (22 tables)
--    Condition: (SELECT is_global_admin()) — identical for all 3 operations.
--    FOR ALL covers SELECT too, which is redundant with rls_select_* but
--    harmless (PostgreSQL ORs permissive policies).
-- ══════════════════════════════════════════════════════════════════════════

-- ── campaigns ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "admins_update_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "admins_delete_campaigns" ON public.campaigns;

CREATE POLICY "admins_manage_campaigns" ON public.campaigns
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── client_brand_memberships ─────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_client_brand_memberships" ON public.client_brand_memberships;
DROP POLICY IF EXISTS "admins_update_client_brand_memberships" ON public.client_brand_memberships;
DROP POLICY IF EXISTS "admins_delete_client_brand_memberships" ON public.client_brand_memberships;

CREATE POLICY "admins_manage_client_brand_memberships" ON public.client_brand_memberships
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── client_invoice_data ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_client_invoice_data" ON public.client_invoice_data;
DROP POLICY IF EXISTS "admins_update_client_invoice_data" ON public.client_invoice_data;
DROP POLICY IF EXISTS "admins_delete_client_invoice_data" ON public.client_invoice_data;

CREATE POLICY "admins_manage_client_invoice_data" ON public.client_invoice_data
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── client_tier_assignments ──────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_client_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "admins_update_client_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "admins_delete_client_tier_assignments" ON public.client_tier_assignments;

CREATE POLICY "admins_manage_client_tier_assignments" ON public.client_tier_assignments
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── client_types ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_client_types" ON public.client_types;
DROP POLICY IF EXISTS "admins_update_client_types" ON public.client_types;
DROP POLICY IF EXISTS "admins_delete_client_types" ON public.client_types;

CREATE POLICY "admins_manage_client_types" ON public.client_types
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── clients ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_clients" ON public.clients;
DROP POLICY IF EXISTS "admins_update_clients" ON public.clients;
DROP POLICY IF EXISTS "admins_delete_clients" ON public.clients;

CREATE POLICY "admins_manage_clients" ON public.clients
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── commercial_structures ────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_commercial_structures" ON public.commercial_structures;
DROP POLICY IF EXISTS "admins_update_commercial_structures" ON public.commercial_structures;
DROP POLICY IF EXISTS "admins_delete_commercial_structures" ON public.commercial_structures;

CREATE POLICY "admins_manage_commercial_structures" ON public.commercial_structures
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── markets ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_markets" ON public.markets;
DROP POLICY IF EXISTS "admins_update_markets" ON public.markets;
DROP POLICY IF EXISTS "admins_delete_markets" ON public.markets;

CREATE POLICY "admins_manage_markets" ON public.markets
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── product_categories ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "admins_update_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "admins_delete_product_categories" ON public.product_categories;

CREATE POLICY "admins_manage_product_categories" ON public.product_categories
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── product_variants ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "admins_update_product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "admins_delete_product_variants" ON public.product_variants;

CREATE POLICY "admins_manage_product_variants" ON public.product_variants
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── products ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_products" ON public.products;
DROP POLICY IF EXISTS "admins_update_products" ON public.products;
DROP POLICY IF EXISTS "admins_delete_products" ON public.products;

CREATE POLICY "admins_manage_products" ON public.products
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── promotion_rules ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_promotion_rules" ON public.promotion_rules;
DROP POLICY IF EXISTS "admins_update_promotion_rules" ON public.promotion_rules;
DROP POLICY IF EXISTS "admins_delete_promotion_rules" ON public.promotion_rules;

CREATE POLICY "admins_manage_promotion_rules" ON public.promotion_rules
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── promotions ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_promotions" ON public.promotions;
DROP POLICY IF EXISTS "admins_update_promotions" ON public.promotions;
DROP POLICY IF EXISTS "admins_delete_promotions" ON public.promotions;

CREATE POLICY "admins_manage_promotions" ON public.promotions
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── rewards ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_rewards" ON public.rewards;
DROP POLICY IF EXISTS "admins_update_rewards" ON public.rewards;
DROP POLICY IF EXISTS "admins_delete_rewards" ON public.rewards;

CREATE POLICY "admins_manage_rewards" ON public.rewards
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── tiers ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_tiers" ON public.tiers;
DROP POLICY IF EXISTS "admins_update_tiers" ON public.tiers;
DROP POLICY IF EXISTS "admins_delete_tiers" ON public.tiers;

CREATE POLICY "admins_manage_tiers" ON public.tiers
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── user_roles ───────────────────────────────────────────────────────────
-- user_roles was NOT part of Phase 2 SELECT consolidation, so the old
-- admins_select_user_roles is now redundant with the new FOR ALL.
DROP POLICY IF EXISTS "admins_select_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_insert_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_update_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_delete_user_roles" ON public.user_roles;

CREATE POLICY "admins_manage_user_roles" ON public.user_roles
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── visit_assessments ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "admins_update_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "admins_delete_visit_assessments" ON public.visit_assessments;

CREATE POLICY "admins_manage_visit_assessments" ON public.visit_assessments
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── visit_communication_plans ────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "admins_update_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "admins_delete_visit_communication_plans" ON public.visit_communication_plans;

CREATE POLICY "admins_manage_visit_communication_plans" ON public.visit_communication_plans
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── visit_inventories ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "admins_update_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "admins_delete_visit_inventories" ON public.visit_inventories;

CREATE POLICY "admins_manage_visit_inventories" ON public.visit_inventories
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── visit_orders ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_visit_orders" ON public.visit_orders;
DROP POLICY IF EXISTS "admins_update_visit_orders" ON public.visit_orders;
DROP POLICY IF EXISTS "admins_delete_visit_orders" ON public.visit_orders;

CREATE POLICY "admins_manage_visit_orders" ON public.visit_orders
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── visits ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_visits" ON public.visits;
DROP POLICY IF EXISTS "admins_update_visits" ON public.visits;
DROP POLICY IF EXISTS "admins_delete_visits" ON public.visits;

CREATE POLICY "admins_manage_visits" ON public.visits
  FOR ALL TO public
  USING ((SELECT is_global_admin()));

-- ── zones ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_zones" ON public.zones;
DROP POLICY IF EXISTS "admins_update_zones" ON public.zones;
DROP POLICY IF EXISTS "admins_delete_zones" ON public.zones;

CREATE POLICY "admins_manage_zones" ON public.zones
  FOR ALL TO public
  USING ((SELECT is_global_admin()));


-- ══════════════════════════════════════════════════════════════════════════
-- B) Client order_items: 3 I/U/D → 1 FOR ALL
--    Original condition: client owns the draft order.
--    USING adds deleted_at IS NULL check (for existing rows: UPDATE, DELETE).
--    WITH CHECK omits it (for new rows: INSERT, UPDATE new).
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "policy_order_items_client_insert" ON public.order_items;
DROP POLICY IF EXISTS "policy_order_items_client_update" ON public.order_items;
DROP POLICY IF EXISTS "policy_order_items_client_delete" ON public.order_items;

CREATE POLICY "clients_manage_own_draft_order_items" ON public.order_items
  FOR ALL TO public
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN clients c ON c.id = o.client_id
      WHERE c.user_id = (SELECT auth.uid())
        AND o.order_status = 'draft'::order_status_enum
        AND o.deleted_at IS NULL AND c.deleted_at IS NULL
    ) AND deleted_at IS NULL
  )
  WITH CHECK (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN clients c ON c.id = o.client_id
      WHERE c.user_id = (SELECT auth.uid())
        AND o.order_status = 'draft'::order_status_enum
        AND o.deleted_at IS NULL AND c.deleted_at IS NULL
    )
  );


-- ══════════════════════════════════════════════════════════════════════════
-- C) Promotor visit_order_items: 3 I/U/D → 1 FOR ALL
--    Original condition: promotor owns the visit order.
--    All 3 policies share the same condition.
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "policy_visit_order_items_promotor_insert" ON public.visit_order_items;
DROP POLICY IF EXISTS "policy_visit_order_items_promotor_update" ON public.visit_order_items;
DROP POLICY IF EXISTS "policy_visit_order_items_promotor_delete" ON public.visit_order_items;

CREATE POLICY "promotors_manage_own_visit_order_items" ON public.visit_order_items
  FOR ALL TO public
  USING (
    visit_order_id IN (
      SELECT vo.id FROM visit_orders vo
      WHERE vo.promotor_id = (SELECT get_user_profile_id())
        AND vo.deleted_at IS NULL
    )
  );

COMMIT;

-- ============================================================================
-- ROLLBACK SQL — Recreate individual admin I/U/D policies + client/promotor
-- ============================================================================
--
-- BEGIN;
--
-- -- Drop consolidated policies
-- DROP POLICY IF EXISTS "admins_manage_campaigns" ON public.campaigns;
-- DROP POLICY IF EXISTS "admins_manage_client_brand_memberships" ON public.client_brand_memberships;
-- DROP POLICY IF EXISTS "admins_manage_client_invoice_data" ON public.client_invoice_data;
-- DROP POLICY IF EXISTS "admins_manage_client_tier_assignments" ON public.client_tier_assignments;
-- DROP POLICY IF EXISTS "admins_manage_client_types" ON public.client_types;
-- DROP POLICY IF EXISTS "admins_manage_clients" ON public.clients;
-- DROP POLICY IF EXISTS "admins_manage_commercial_structures" ON public.commercial_structures;
-- DROP POLICY IF EXISTS "admins_manage_markets" ON public.markets;
-- DROP POLICY IF EXISTS "admins_manage_product_categories" ON public.product_categories;
-- DROP POLICY IF EXISTS "admins_manage_product_variants" ON public.product_variants;
-- DROP POLICY IF EXISTS "admins_manage_products" ON public.products;
-- DROP POLICY IF EXISTS "admins_manage_promotion_rules" ON public.promotion_rules;
-- DROP POLICY IF EXISTS "admins_manage_promotions" ON public.promotions;
-- DROP POLICY IF EXISTS "admins_manage_rewards" ON public.rewards;
-- DROP POLICY IF EXISTS "admins_manage_tiers" ON public.tiers;
-- DROP POLICY IF EXISTS "admins_manage_user_roles" ON public.user_roles;
-- DROP POLICY IF EXISTS "admins_manage_visit_assessments" ON public.visit_assessments;
-- DROP POLICY IF EXISTS "admins_manage_visit_communication_plans" ON public.visit_communication_plans;
-- DROP POLICY IF EXISTS "admins_manage_visit_inventories" ON public.visit_inventories;
-- DROP POLICY IF EXISTS "admins_manage_visit_orders" ON public.visit_orders;
-- DROP POLICY IF EXISTS "admins_manage_visits" ON public.visits;
-- DROP POLICY IF EXISTS "admins_manage_zones" ON public.zones;
-- DROP POLICY IF EXISTS "clients_manage_own_draft_order_items" ON public.order_items;
-- DROP POLICY IF EXISTS "promotors_manage_own_visit_order_items" ON public.visit_order_items;
--
-- -- Recreate individual policies (use is_global_admin() for admin policies)
-- -- ... (omitted for brevity, use original policy definitions from initplan migration)
--
-- COMMIT;
