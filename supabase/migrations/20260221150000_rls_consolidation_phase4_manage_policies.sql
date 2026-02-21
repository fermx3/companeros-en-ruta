-- ============================================================================
-- Migration: 20260221150000_rls_consolidation_phase4_manage_policies.sql
-- Purpose:   Consolidate multiple FOR ALL (manage) policies per table into
--            single consolidated policies. Covers visit sub-tables,
--            admin+tenant_admin patterns, and multi-role manage patterns.
--
-- Groups:
--   A) Visit sub-tables: tenant_isolation + promotor_own → 1 (6 tables, -6)
--   B) Admin + Tenant Admin manage → 1 (4 tables, -4)
--   C) Admin + Tenant Admin + Brand Manager manage → 1 (8 tables, -16)
--   D) Visit-related manage (admin+ta+promotor+supervisor+bm) → 1 (5 tables, -16)
--   E) Special multi-role manage → 1 (6 tables, -10)
--
-- Net reduction: ~52 policies (189 → ~137)
--
-- Rollback: See bottom of file.
-- ============================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- A) Visit sub-tables: dual FOR ALL → 1 merged FOR ALL (6 tables)
--
-- Each has: tenant_isolation (USING + WITH CHECK) + promotor_own (USING only*)
-- *except visit_evidence and visit_stage_assessments which have USING+WITH CHECK
--
-- Merged: USING = tenant_isolation OR promotor_own
--         WITH CHECK = tenant_isolation (4 tables) or tenant_isolation OR promotor_own (2 tables)
-- ══════════════════════════════════════════════════════════════════════════

-- ── visit_brand_product_assessments ──────────────────────────────────────
DROP POLICY IF EXISTS "brand_product_assessments_tenant_isolation" ON public.visit_brand_product_assessments;
DROP POLICY IF EXISTS "brand_product_assessments_promotor_own" ON public.visit_brand_product_assessments;

CREATE POLICY "rls_manage_visit_brand_product_assessments" ON public.visit_brand_product_assessments
  FOR ALL TO public
  USING (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
    OR visit_id IN (
      SELECT v.id FROM visits v
      WHERE v.promotor_id = (SELECT get_user_profile_id())
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
  );

-- ── visit_competitor_assessments ─────────────────────────────────────────
DROP POLICY IF EXISTS "competitor_assessments_tenant_isolation" ON public.visit_competitor_assessments;
DROP POLICY IF EXISTS "competitor_assessments_promotor_own" ON public.visit_competitor_assessments;

CREATE POLICY "rls_manage_visit_competitor_assessments" ON public.visit_competitor_assessments
  FOR ALL TO public
  USING (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
    OR visit_id IN (
      SELECT v.id FROM visits v
      WHERE v.promotor_id = (SELECT get_user_profile_id())
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
  );

-- ── visit_exhibition_checks ──────────────────────────────────────────────
DROP POLICY IF EXISTS "exhibition_checks_tenant_isolation" ON public.visit_exhibition_checks;
DROP POLICY IF EXISTS "exhibition_checks_promotor_own" ON public.visit_exhibition_checks;

CREATE POLICY "rls_manage_visit_exhibition_checks" ON public.visit_exhibition_checks
  FOR ALL TO public
  USING (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
    OR visit_id IN (
      SELECT v.id FROM visits v
      WHERE v.promotor_id = (SELECT get_user_profile_id())
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
  );

-- ── visit_pop_material_checks ────────────────────────────────────────────
DROP POLICY IF EXISTS "pop_material_checks_tenant_isolation" ON public.visit_pop_material_checks;
DROP POLICY IF EXISTS "pop_material_checks_promotor_own" ON public.visit_pop_material_checks;

CREATE POLICY "rls_manage_visit_pop_material_checks" ON public.visit_pop_material_checks
  FOR ALL TO public
  USING (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
    OR visit_id IN (
      SELECT v.id FROM visits v
      WHERE v.promotor_id = (SELECT get_user_profile_id())
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
  );

-- ── visit_evidence (promotor_own HAS WITH CHECK) ─────────────────────────
DROP POLICY IF EXISTS "visit_evidence_tenant_isolation" ON public.visit_evidence;
DROP POLICY IF EXISTS "visit_evidence_promotor_own_visits" ON public.visit_evidence;

CREATE POLICY "rls_manage_visit_evidence" ON public.visit_evidence
  FOR ALL TO public
  USING (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
    OR visit_id IN (
      SELECT v.id FROM visits v
      WHERE v.promotor_id = (SELECT get_user_profile_id())
    )
  );
  -- WITH CHECK defaults to USING (both paths had WITH CHECK in originals)

-- ── visit_stage_assessments (promotor_own HAS WITH CHECK) ────────────────
DROP POLICY IF EXISTS "visit_stage_assessments_tenant_isolation" ON public.visit_stage_assessments;
DROP POLICY IF EXISTS "visit_stage_assessments_promotor_own" ON public.visit_stage_assessments;

CREATE POLICY "rls_manage_visit_stage_assessments" ON public.visit_stage_assessments
  FOR ALL TO public
  USING (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
    )
    OR visit_id IN (
      SELECT v.id FROM visits v
      WHERE v.promotor_id = (SELECT get_user_profile_id())
    )
  );
  -- WITH CHECK defaults to USING (both paths had WITH CHECK in originals)


-- ══════════════════════════════════════════════════════════════════════════
-- B) Admin + Tenant Admin manage → 1 (4 tables)
-- ══════════════════════════════════════════════════════════════════════════

-- ── client_types ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_client_types" ON public.client_types;
DROP POLICY IF EXISTS "tenant_admins_manage_client_types" ON public.client_types;

CREATE POLICY "rls_manage_client_types" ON public.client_types
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (deleted_at IS NULL AND tenant_id = ANY(get_tenant_admin_tenant_ids()))
  );

-- ── commercial_structures ────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_commercial_structures" ON public.commercial_structures;
DROP POLICY IF EXISTS "tenant_admins_manage_commercial_structures" ON public.commercial_structures;

CREATE POLICY "rls_manage_commercial_structures" ON public.commercial_structures
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (deleted_at IS NULL AND tenant_id = ANY(get_tenant_admin_tenant_ids()))
  );

-- ── markets ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_markets" ON public.markets;
DROP POLICY IF EXISTS "tenant_admins_manage_markets" ON public.markets;

CREATE POLICY "rls_manage_markets" ON public.markets
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (deleted_at IS NULL AND tenant_id = ANY(get_tenant_admin_tenant_ids()))
  );

-- ── zones ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_zones" ON public.zones;
DROP POLICY IF EXISTS "tenant_admins_manage_zones" ON public.zones;

CREATE POLICY "rls_manage_zones" ON public.zones
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (deleted_at IS NULL AND tenant_id = ANY(get_tenant_admin_tenant_ids()))
  );


-- ══════════════════════════════════════════════════════════════════════════
-- C) Admin + Tenant Admin + Brand Manager manage → 1 (8 tables)
--    Tables with direct brand_id column.
-- ══════════════════════════════════════════════════════════════════════════

-- ── products ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_products" ON public.products;
DROP POLICY IF EXISTS "tenant_admins_manage_products" ON public.products;
DROP POLICY IF EXISTS "brand_managers_manage_products" ON public.products;

CREATE POLICY "rls_manage_products" ON public.products
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
      )
    )
  );

-- ── promotions ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_promotions" ON public.promotions;
DROP POLICY IF EXISTS "tenant_admins_manage_promotions" ON public.promotions;
DROP POLICY IF EXISTS "brand_managers_manage_promotions" ON public.promotions;

CREATE POLICY "rls_manage_promotions" ON public.promotions
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
      )
    )
  );

-- ── campaigns ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "tenant_admins_manage_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "brand_managers_manage_campaigns" ON public.campaigns;

CREATE POLICY "rls_manage_campaigns" ON public.campaigns
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
      )
    )
  );

-- ── rewards ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_rewards" ON public.rewards;
DROP POLICY IF EXISTS "tenant_admins_manage_rewards" ON public.rewards;
DROP POLICY IF EXISTS "brand_managers_manage_rewards" ON public.rewards;

CREATE POLICY "rls_manage_rewards" ON public.rewards
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
      )
    )
  );

-- ── tiers ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_tiers" ON public.tiers;
DROP POLICY IF EXISTS "tenant_admins_manage_tiers" ON public.tiers;
DROP POLICY IF EXISTS "brand_managers_manage_tiers" ON public.tiers;

CREATE POLICY "rls_manage_tiers" ON public.tiers
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
      )
    )
  );

-- ── product_categories ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "tenant_admins_manage_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "brand_managers_manage_product_categories" ON public.product_categories;

CREATE POLICY "rls_manage_product_categories" ON public.product_categories
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
      )
    )
  );

-- ── client_brand_memberships ─────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_client_brand_memberships" ON public.client_brand_memberships;
DROP POLICY IF EXISTS "tenant_admins_manage_client_brand_memberships" ON public.client_brand_memberships;
DROP POLICY IF EXISTS "brand_managers_manage_client_brand_memberships" ON public.client_brand_memberships;

CREATE POLICY "rls_manage_client_brand_memberships" ON public.client_brand_memberships
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
      )
    )
  );

-- ── product_variants (brand_id via products table) ───────────────────────
DROP POLICY IF EXISTS "admins_manage_product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "tenant_admins_manage_product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "brand_managers_manage_product_variants" ON public.product_variants;

CREATE POLICY "rls_manage_product_variants" ON public.product_variants
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR product_id IN (
          SELECT p.id FROM products p
          WHERE p.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND p.deleted_at IS NULL
        )
      )
    )
  );

-- ── promotion_rules (brand_id via promotions table) ──────────────────────
DROP POLICY IF EXISTS "admins_manage_promotion_rules" ON public.promotion_rules;
DROP POLICY IF EXISTS "tenant_admins_manage_promotion_rules" ON public.promotion_rules;
DROP POLICY IF EXISTS "brand_managers_manage_promotion_rules" ON public.promotion_rules;

CREATE POLICY "rls_manage_promotion_rules" ON public.promotion_rules
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR promotion_id IN (
          SELECT p.id FROM promotions p
          WHERE p.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND p.deleted_at IS NULL
        )
      )
    )
  );


-- ══════════════════════════════════════════════════════════════════════════
-- D) Visit-related manage: admin + tenant_admin + promotor + supervisor
--    (+ brand_manager for visit_communication_plans) → 1
-- ══════════════════════════════════════════════════════════════════════════

-- ── visits (4 → 1) ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_visits" ON public.visits;
DROP POLICY IF EXISTS "tenant_admins_manage_visits" ON public.visits;
DROP POLICY IF EXISTS "promotors_manage_visits" ON public.visits;
DROP POLICY IF EXISTS "supervisors_manage_visits" ON public.visits;

CREATE POLICY "rls_manage_visits" ON public.visits
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- promotor/supervisor: own visits
        OR promotor_id = ANY(get_promotor_profile_ids())
        -- supervisor: subordinate visits
        OR promotor_id = ANY(get_supervised_profile_ids())
      )
    )
  );

-- ── visit_assessments (4 → 1) ───────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "tenant_admins_manage_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "promotors_manage_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "supervisors_manage_visit_assessments" ON public.visit_assessments;

CREATE POLICY "rls_manage_visit_assessments" ON public.visit_assessments
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- promotor/supervisor: own visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_promotor_profile_ids())
            AND v.deleted_at IS NULL
        )
        -- supervisor: subordinate visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL
        )
      )
    )
  );

-- ── visit_inventories (4 → 1) ───────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "tenant_admins_manage_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "promotors_manage_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "supervisors_manage_visit_inventories" ON public.visit_inventories;

CREATE POLICY "rls_manage_visit_inventories" ON public.visit_inventories
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- promotor/supervisor: own visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_promotor_profile_ids())
            AND v.deleted_at IS NULL
        )
        -- supervisor: subordinate visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL
        )
      )
    )
  );

-- ── visit_orders (4 → 1) ────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_visit_orders" ON public.visit_orders;
DROP POLICY IF EXISTS "tenant_admins_manage_visit_orders" ON public.visit_orders;
DROP POLICY IF EXISTS "promotors_manage_visit_orders" ON public.visit_orders;
DROP POLICY IF EXISTS "supervisors_manage_visit_orders" ON public.visit_orders;

CREATE POLICY "rls_manage_visit_orders" ON public.visit_orders
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- promotor/supervisor: own visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_promotor_profile_ids())
            AND v.deleted_at IS NULL
        )
        -- supervisor: subordinate visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL
        )
      )
    )
  );

-- ── visit_communication_plans (5 → 1) ───────────────────────────────────
DROP POLICY IF EXISTS "admins_manage_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "tenant_admins_manage_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "brand_managers_manage_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "promotors_manage_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "supervisors_manage_visit_communication_plans" ON public.visit_communication_plans;

CREATE POLICY "rls_manage_visit_communication_plans" ON public.visit_communication_plans
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        -- promotor/supervisor: own visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_promotor_profile_ids())
            AND v.deleted_at IS NULL
        )
        -- supervisor: subordinate visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL
        )
      )
    )
  );


-- ══════════════════════════════════════════════════════════════════════════
-- E) Special multi-role manage consolidation
-- ══════════════════════════════════════════════════════════════════════════

-- ── client_tier_assignments (4 → 1) ─────────────────────────────────────
-- admin + tenant_admin + brand_manager (via cbm) + supervisor (via cbm→visits)
DROP POLICY IF EXISTS "admins_manage_client_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "tenant_admins_manage_client_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "brand_managers_manage_client_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "supervisors_manage_client_tier_assignments" ON public.client_tier_assignments;

CREATE POLICY "rls_manage_client_tier_assignments" ON public.client_tier_assignments
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: via client_brand_membership → brand
        OR client_brand_membership_id IN (
          SELECT cbm.id FROM client_brand_memberships cbm
          WHERE cbm.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND cbm.deleted_at IS NULL
        )
        -- supervisor: clients of supervised promotors
        OR client_brand_membership_id IN (
          SELECT cbm.id FROM client_brand_memberships cbm
          JOIN clients c ON cbm.client_id = c.id
          WHERE c.id IN (
            SELECT DISTINCT v.client_id FROM visits v
            WHERE v.promotor_id = ANY(get_supervised_profile_ids())
              AND v.deleted_at IS NULL
          ) AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
        )
      )
    )
  );

-- ── client_invoice_data (4 → 1) ─────────────────────────────────────────
-- admin + tenant_admin + field_users (supervisor/advisor) + clients_own
DROP POLICY IF EXISTS "admins_manage_client_invoice_data" ON public.client_invoice_data;
DROP POLICY IF EXISTS "tenant_admins_manage_client_invoice_data" ON public.client_invoice_data;
DROP POLICY IF EXISTS "field_users_manage_client_invoice_data" ON public.client_invoice_data;
DROP POLICY IF EXISTS "clients_manage_own_invoice_data" ON public.client_invoice_data;

CREATE POLICY "rls_manage_client_invoice_data" ON public.client_invoice_data
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- field users (supervisor/advisor)
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- client: own invoice data
        OR client_id = ANY(get_client_ids_for_auth_user())
      )
    )
  );

-- ── points_transactions (2 FOR ALL → 1) ─────────────────────────────────
-- brand_manager (via cbm) + tenant_admin
-- Note: admin has separate INSERT/UPDATE policies (not FOR ALL, not touched)
DROP POLICY IF EXISTS "brand_managers_manage_points_transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "tenant_admins_manage_points_transactions" ON public.points_transactions;

CREATE POLICY "rls_manage_points_transactions" ON public.points_transactions
  FOR ALL TO public
  USING (
    deleted_at IS NULL
    AND (
      -- tenant admin
      tenant_id = ANY(get_tenant_admin_tenant_ids())
      -- brand manager: via client_brand_membership → brand
      OR client_brand_membership_id IN (
        SELECT cbm.id FROM client_brand_memberships cbm
        WHERE cbm.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
          AND cbm.deleted_at IS NULL
      )
    )
  );

-- ── reward_redemptions (2 FOR ALL → 1) ──────────────────────────────────
-- brand_manager (via reward) + tenant_admin
-- Note: admin has separate INSERT/UPDATE policies (not FOR ALL, not touched)
DROP POLICY IF EXISTS "brand_managers_manage_reward_redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "tenant_admins_manage_reward_redemptions" ON public.reward_redemptions;

CREATE POLICY "rls_manage_reward_redemptions" ON public.reward_redemptions
  FOR ALL TO public
  USING (
    deleted_at IS NULL
    AND (
      -- tenant admin
      tenant_id = ANY(get_tenant_admin_tenant_ids())
      -- brand manager: via reward → brand
      OR reward_id IN (
        SELECT r.id FROM rewards r
        WHERE r.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
          AND r.deleted_at IS NULL
      )
    )
  );

-- ── orders (2 FOR ALL → 1) ──────────────────────────────────────────────
-- asesor_ventas + tenant_admin
-- Note: admin has separate INSERT/UPDATE policies (not FOR ALL, not touched)
DROP POLICY IF EXISTS "asesor_ventas_manage_orders" ON public.orders;
DROP POLICY IF EXISTS "tenant_admins_manage_orders" ON public.orders;

CREATE POLICY "rls_manage_orders" ON public.orders
  FOR ALL TO public
  USING (
    deleted_at IS NULL
    AND (
      -- tenant admin
      tenant_id = ANY(get_tenant_admin_tenant_ids())
      -- asesor de ventas: assigned orders
      OR assigned_to = ANY(get_promotor_profile_ids())
    )
  );

-- ── clients (3 FOR ALL → 1) ─────────────────────────────────────────────
-- admin + tenant_admin + clients_tenant_access
-- clients_tenant_access: tenant_id match with WITH CHECK
DROP POLICY IF EXISTS "admins_manage_clients" ON public.clients;
DROP POLICY IF EXISTS "tenant_admins_manage_clients" ON public.clients;
DROP POLICY IF EXISTS "clients_tenant_access" ON public.clients;

CREATE POLICY "rls_manage_clients" ON public.clients
  FOR ALL TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- clients: own tenant (field users do reads via rls_select_clients)
        OR tenant_id IN (
          SELECT up.tenant_id FROM user_profiles up
          WHERE up.user_id = (SELECT auth.uid())
        )
      )
    )
  )
  WITH CHECK (
    (SELECT is_global_admin())
    OR (
      tenant_id = ANY(get_tenant_admin_tenant_ids())
      OR tenant_id IN (
        SELECT up.tenant_id FROM user_profiles up
        WHERE up.user_id = (SELECT auth.uid())
      )
    )
  );

COMMIT;

-- ============================================================================
-- ROLLBACK SQL
-- ============================================================================
--
-- BEGIN;
--
-- -- Drop all consolidated policies from Phase 4
-- DROP POLICY IF EXISTS "rls_manage_visit_brand_product_assessments" ON public.visit_brand_product_assessments;
-- DROP POLICY IF EXISTS "rls_manage_visit_competitor_assessments" ON public.visit_competitor_assessments;
-- DROP POLICY IF EXISTS "rls_manage_visit_exhibition_checks" ON public.visit_exhibition_checks;
-- DROP POLICY IF EXISTS "rls_manage_visit_pop_material_checks" ON public.visit_pop_material_checks;
-- DROP POLICY IF EXISTS "rls_manage_visit_evidence" ON public.visit_evidence;
-- DROP POLICY IF EXISTS "rls_manage_visit_stage_assessments" ON public.visit_stage_assessments;
-- DROP POLICY IF EXISTS "rls_manage_client_types" ON public.client_types;
-- DROP POLICY IF EXISTS "rls_manage_commercial_structures" ON public.commercial_structures;
-- DROP POLICY IF EXISTS "rls_manage_markets" ON public.markets;
-- DROP POLICY IF EXISTS "rls_manage_zones" ON public.zones;
-- DROP POLICY IF EXISTS "rls_manage_products" ON public.products;
-- DROP POLICY IF EXISTS "rls_manage_promotions" ON public.promotions;
-- DROP POLICY IF EXISTS "rls_manage_campaigns" ON public.campaigns;
-- DROP POLICY IF EXISTS "rls_manage_rewards" ON public.rewards;
-- DROP POLICY IF EXISTS "rls_manage_tiers" ON public.tiers;
-- DROP POLICY IF EXISTS "rls_manage_product_categories" ON public.product_categories;
-- DROP POLICY IF EXISTS "rls_manage_client_brand_memberships" ON public.client_brand_memberships;
-- DROP POLICY IF EXISTS "rls_manage_product_variants" ON public.product_variants;
-- DROP POLICY IF EXISTS "rls_manage_promotion_rules" ON public.promotion_rules;
-- DROP POLICY IF EXISTS "rls_manage_visits" ON public.visits;
-- DROP POLICY IF EXISTS "rls_manage_visit_assessments" ON public.visit_assessments;
-- DROP POLICY IF EXISTS "rls_manage_visit_inventories" ON public.visit_inventories;
-- DROP POLICY IF EXISTS "rls_manage_visit_orders" ON public.visit_orders;
-- DROP POLICY IF EXISTS "rls_manage_visit_communication_plans" ON public.visit_communication_plans;
-- DROP POLICY IF EXISTS "rls_manage_client_tier_assignments" ON public.client_tier_assignments;
-- DROP POLICY IF EXISTS "rls_manage_client_invoice_data" ON public.client_invoice_data;
-- DROP POLICY IF EXISTS "rls_manage_points_transactions" ON public.points_transactions;
-- DROP POLICY IF EXISTS "rls_manage_reward_redemptions" ON public.reward_redemptions;
-- DROP POLICY IF EXISTS "rls_manage_orders" ON public.orders;
-- DROP POLICY IF EXISTS "rls_manage_clients" ON public.clients;
--
-- -- Recreate original policies (use policy definitions from initplan migration)
-- -- ... (omitted for brevity)
--
-- COMMIT;
