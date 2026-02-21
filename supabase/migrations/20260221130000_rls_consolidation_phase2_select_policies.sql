-- ============================================================================
-- Migration: 20260221130000_rls_consolidation_phase2_select_policies.sql
-- Purpose:   Consolidate multiple PERMISSIVE SELECT policies per table into
--            a single policy. PostgreSQL ORs all PERMISSIVE policies, so
--            evaluating N separate policies has overhead vs 1 with OR branches.
--
-- Scope:     27 tables, ~144 SELECT policies → 27 consolidated policies
-- Impact:    SELECT access unchanged — exact logical equivalence preserved.
--
-- Derivation: Each OR branch is derived from the USING clause of the
--             corresponding policy as it exists in the live database (post
--             initplan fix + optimize_rls migrations).
--
-- Helper functions used:
--   is_global_admin()              (20260219130000)
--   get_tenant_admin_tenant_ids()  (20260221120000)
--   get_user_profile_id()          (20260220120000)
--   get_user_role_brand_ids(role)  (20260220120000)
--   get_brand_manager_brand_ids()  (20260219130000)
--   get_supervised_profile_ids()   (20260220120000)
--   get_field_user_tenant_id()     (20260220120000)
--   get_client_ids_for_auth_user() (20260221120000)
--   get_promotor_profile_ids()     (20260221120000)
--   is_client_assigned_to_user()   (20260208050000)
--
-- Rollback:   See bottom of file.
-- ============================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- TIER 1: High-frequency tables (5-7 SELECT policies each)
-- ══════════════════════════════════════════════════════════════════════════

-- ── CLIENTS (6 SELECT → 1) ────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_clients" ON public.clients;
DROP POLICY IF EXISTS "asesor_ventas_select_clients" ON public.clients;
DROP POLICY IF EXISTS "brand_managers_select_clients" ON public.clients;
DROP POLICY IF EXISTS "clients_select_own_profile" ON public.clients;
DROP POLICY IF EXISTS "field_users_select_clients" ON public.clients;
DROP POLICY IF EXISTS "tenant_admins_select_clients" ON public.clients;

CREATE POLICY "rls_select_clients" ON public.clients
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: sees clients in tenants of their brands
        OR tenant_id IN (
          SELECT b.tenant_id FROM brands b
          WHERE b.id IN (SELECT get_brand_manager_brand_ids())
            AND b.deleted_at IS NULL
        )
        -- field users (supervisor/advisor/market_analyst)
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- asesor de ventas: sees assigned clients
        OR is_client_assigned_to_user(id)
        -- client: own profile
        OR user_id = (SELECT auth.uid())
      )
    )
  );

-- ── ORDERS (7 SELECT → 1) ────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_orders" ON public.orders;
DROP POLICY IF EXISTS "asesor_ventas_select_orders" ON public.orders;
DROP POLICY IF EXISTS "brand_managers_select_orders" ON public.orders;
DROP POLICY IF EXISTS "clients_select_own_orders" ON public.orders;
DROP POLICY IF EXISTS "promotors_select_orders" ON public.orders;
DROP POLICY IF EXISTS "supervisors_select_orders" ON public.orders;
DROP POLICY IF EXISTS "tenant_admins_select_orders" ON public.orders;

CREATE POLICY "rls_select_orders" ON public.orders
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        -- promotor/asesor: directly assigned
        OR assigned_to = ANY(get_promotor_profile_ids())
        -- client: own orders
        OR client_id = ANY(get_client_ids_for_auth_user())
        -- promotor: orders for clients in their visits
        OR client_id IN (
          SELECT c.id FROM clients c
          JOIN visits v ON v.client_id = c.id
          WHERE v.promotor_id = ANY(get_promotor_profile_ids())
            AND v.deleted_at IS NULL AND c.deleted_at IS NULL
        )
        -- supervisor: orders for clients of supervised promotors
        OR client_id IN (
          SELECT DISTINCT v.client_id FROM visits v
          JOIN clients c ON c.id = v.client_id
          WHERE v.promotor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL AND c.deleted_at IS NULL
        )
      )
    )
  );

-- ── VISITS (6 SELECT → 1) ────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_visits" ON public.visits;
DROP POLICY IF EXISTS "brand_managers_select_visits" ON public.visits;
DROP POLICY IF EXISTS "clients_select_visits" ON public.visits;
DROP POLICY IF EXISTS "promotors_select_visits" ON public.visits;
DROP POLICY IF EXISTS "supervisors_select_visits" ON public.visits;
DROP POLICY IF EXISTS "tenant_admins_select_visits" ON public.visits;

CREATE POLICY "rls_select_visits" ON public.visits
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: visits for clients in their brands
        OR client_id IN (
          SELECT cbm.client_id FROM client_brand_memberships cbm
          WHERE cbm.brand_id IN (SELECT get_brand_manager_brand_ids())
            AND cbm.deleted_at IS NULL
        )
        -- promotor/supervisor acting as promotor: own visits
        OR promotor_id IN (
          SELECT ur.user_profile_id FROM user_roles ur
          WHERE ur.user_profile_id = (SELECT get_user_profile_id())
            AND ur.role = ANY(ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])
            AND ur.status = 'active'::user_role_status_enum
            AND ur.deleted_at IS NULL
        )
        -- supervisor: subordinates' visits
        OR promotor_id = ANY(get_supervised_profile_ids())
        -- client: own visits
        OR client_id = ANY(get_client_ids_for_auth_user())
      )
    )
  );

-- ── VISIT_INVENTORIES (6 SELECT → 1) ─────────────────────────────────
DROP POLICY IF EXISTS "admins_select_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "brand_managers_select_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "clients_select_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "promotors_select_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "supervisors_select_visit_inventories" ON public.visit_inventories;
DROP POLICY IF EXISTS "tenant_admins_select_visit_inventories" ON public.visit_inventories;

CREATE POLICY "rls_select_visit_inventories" ON public.visit_inventories
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: via product's brand
        OR product_id IN (
          SELECT p.id FROM products p
          WHERE p.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND p.deleted_at IS NULL
        )
        -- promotor/supervisor: via visit
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            WHERE ur.user_profile_id = (SELECT get_user_profile_id())
              AND ur.role = ANY(ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])
              AND ur.status = 'active'::user_role_status_enum
              AND ur.deleted_at IS NULL
          ) AND v.deleted_at IS NULL
        )
        -- supervisor: subordinates' visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL
        )
        -- client: via visit
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.client_id = ANY(get_client_ids_for_auth_user())
            AND v.deleted_at IS NULL
        )
      )
    )
  );

-- ── VISIT_COMMUNICATION_PLANS (6 SELECT → 1) ─────────────────────────
DROP POLICY IF EXISTS "admins_select_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "brand_managers_select_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "clients_select_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "promotors_select_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "supervisors_select_visit_communication_plans" ON public.visit_communication_plans;
DROP POLICY IF EXISTS "tenant_admins_select_visit_communication_plans" ON public.visit_communication_plans;

CREATE POLICY "rls_select_visit_communication_plans" ON public.visit_communication_plans
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: direct brand_id
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        -- promotor/supervisor: via visit
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            WHERE ur.user_profile_id = (SELECT get_user_profile_id())
              AND ur.role = ANY(ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])
              AND ur.status = 'active'::user_role_status_enum
              AND ur.deleted_at IS NULL
          ) AND v.deleted_at IS NULL
        )
        -- supervisor: subordinates' visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL
        )
        -- client: via visit
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.client_id = ANY(get_client_ids_for_auth_user())
            AND v.deleted_at IS NULL
        )
      )
    )
  );

-- ── VISIT_ASSESSMENTS (6 SELECT → 1) ─────────────────────────────────
DROP POLICY IF EXISTS "admins_select_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "brand_managers_select_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "clients_select_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "promotors_select_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "supervisors_select_visit_assessments" ON public.visit_assessments;
DROP POLICY IF EXISTS "tenant_admins_select_visit_assessments" ON public.visit_assessments;

CREATE POLICY "rls_select_visit_assessments" ON public.visit_assessments
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: via product's brand
        OR product_id IN (
          SELECT p.id FROM products p
          WHERE p.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND p.deleted_at IS NULL
        )
        -- promotor/supervisor: via visit
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            WHERE ur.user_profile_id = (SELECT get_user_profile_id())
              AND ur.role = ANY(ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])
              AND ur.status = 'active'::user_role_status_enum
              AND ur.deleted_at IS NULL
          ) AND v.deleted_at IS NULL
        )
        -- supervisor: subordinates' visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL
        )
        -- client: via visit
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.client_id = ANY(get_client_ids_for_auth_user())
            AND v.deleted_at IS NULL
        )
      )
    )
  );

-- ── VISIT_ORDERS (5 SELECT → 1) ──────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_visit_orders" ON public.visit_orders;
DROP POLICY IF EXISTS "clients_select_visit_orders" ON public.visit_orders;
DROP POLICY IF EXISTS "promotors_select_visit_orders" ON public.visit_orders;
DROP POLICY IF EXISTS "supervisors_select_visit_orders" ON public.visit_orders;
DROP POLICY IF EXISTS "tenant_admins_select_visit_orders" ON public.visit_orders;

CREATE POLICY "rls_select_visit_orders" ON public.visit_orders
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- promotor/supervisor: via visit
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            WHERE ur.user_profile_id = (SELECT get_user_profile_id())
              AND ur.role = ANY(ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])
              AND ur.status = 'active'::user_role_status_enum
              AND ur.deleted_at IS NULL
          ) AND v.deleted_at IS NULL
        )
        -- supervisor: subordinates' visits
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.promotor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL
        )
        -- client: via visit
        OR visit_id IN (
          SELECT v.id FROM visits v
          WHERE v.client_id = ANY(get_client_ids_for_auth_user())
            AND v.deleted_at IS NULL
        )
      )
    )
  );

-- ══════════════════════════════════════════════════════════════════════════
-- TIER 2: Medium-frequency tables (4-6 SELECT policies each)
-- ══════════════════════════════════════════════════════════════════════════

-- ── PRODUCTS (6 SELECT → 1) ──────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_products" ON public.products;
DROP POLICY IF EXISTS "asesor_ventas_select_products" ON public.products;
DROP POLICY IF EXISTS "brand_managers_select_products" ON public.products;
DROP POLICY IF EXISTS "clients_select_products" ON public.products;
DROP POLICY IF EXISTS "field_users_select_products" ON public.products;
DROP POLICY IF EXISTS "tenant_admins_select_products" ON public.products;

CREATE POLICY "rls_select_products" ON public.products
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        -- asesor de ventas: products from their brand
        OR brand_id = ANY(get_user_role_brand_ids('asesor_de_ventas'::user_role_type_enum))
        -- field users
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- client: active products from their active brand memberships
        OR (
          is_active = true
          AND brand_id IN (
            SELECT cbm.brand_id FROM client_brand_memberships cbm
            JOIN clients c ON cbm.client_id = c.id
            WHERE c.user_id = (SELECT auth.uid())
              AND cbm.membership_status = 'active'::membership_status_enum
              AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
          )
        )
      )
    )
  );

-- ── PROMOTIONS (6 SELECT → 1) ────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_promotions" ON public.promotions;
DROP POLICY IF EXISTS "asesor_ventas_select_promotions" ON public.promotions;
DROP POLICY IF EXISTS "brand_managers_select_promotions" ON public.promotions;
DROP POLICY IF EXISTS "Clients can view active promotions from their brands" ON public.promotions;
DROP POLICY IF EXISTS "field_users_select_promotions" ON public.promotions;
DROP POLICY IF EXISTS "tenant_admins_select_promotions" ON public.promotions;

CREATE POLICY "rls_select_promotions" ON public.promotions
  FOR SELECT TO public
  USING (
    -- global admin (no deleted_at filter)
    (SELECT is_global_admin())
    -- admin/brand_manager broad access (from "Clients can view" policy, no deleted_at)
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_profile_id = (SELECT get_user_profile_id())
        AND ur.status = 'active'::user_role_status_enum
        AND ur.role = ANY(ARRAY['admin'::user_role_type_enum, 'brand_manager'::user_role_type_enum])
        AND ur.deleted_at IS NULL
    )
    -- client: brand membership match (from "Clients can view" policy, no deleted_at)
    OR EXISTS (
      SELECT 1 FROM clients c
      JOIN client_brand_memberships cbm ON cbm.client_id = c.id
      WHERE c.user_id = (SELECT auth.uid())
        AND cbm.brand_id = promotions.brand_id
        AND cbm.membership_status = 'active'::membership_status_enum
        AND cbm.deleted_at IS NULL
    )
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager (specific brands)
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        -- field users
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- asesor de ventas: active promotions from their brand
        OR (
          status = 'active'::promotion_status_enum
          AND brand_id = ANY(get_user_role_brand_ids('asesor_de_ventas'::user_role_type_enum))
        )
      )
    )
  );

-- ── CAMPAIGNS (4 SELECT → 1) ─────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "brand_managers_select_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "field_users_select_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "tenant_admins_select_campaigns" ON public.campaigns;

CREATE POLICY "rls_select_campaigns" ON public.campaigns
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        OR tenant_id = (SELECT get_field_user_tenant_id())
      )
    )
  );

-- ── REWARDS (5 SELECT → 1) ───────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_rewards" ON public.rewards;
DROP POLICY IF EXISTS "brand_managers_select_rewards" ON public.rewards;
DROP POLICY IF EXISTS "clients_select_rewards" ON public.rewards;
DROP POLICY IF EXISTS "field_users_select_rewards" ON public.rewards;
DROP POLICY IF EXISTS "tenant_admins_select_rewards" ON public.rewards;

CREATE POLICY "rls_select_rewards" ON public.rewards
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        -- field users: active rewards in their tenant
        OR (
          is_active = true
          AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
          AND valid_from <= CURRENT_DATE
          AND tenant_id = (SELECT get_field_user_tenant_id())
        )
        -- client: complex tier-based access
        OR (
          is_active = true
          AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
          AND valid_from <= CURRENT_DATE
          AND (usage_limit_total IS NULL OR usage_count_total < usage_limit_total)
          AND brand_id IN (
            SELECT cbm.brand_id
            FROM client_brand_memberships cbm
            JOIN clients c ON cbm.client_id = c.id
            JOIN tiers t ON cbm.current_tier_id = t.id
            WHERE c.user_id = (SELECT auth.uid())
              AND cbm.membership_status = 'active'::membership_status_enum
              AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
              AND (
                rewards.tier_requirements IS NULL
                OR (
                  (NOT (rewards.tier_requirements ? 'min_tier_level') OR t.tier_level >= (rewards.tier_requirements ->> 'min_tier_level')::integer)
                  AND (NOT (rewards.tier_requirements ? 'allowed_tiers') OR (rewards.tier_requirements -> 'allowed_tiers') ? t.code::text)
                  AND (NOT (rewards.tier_requirements ? 'exclusive_to_tier') OR (rewards.tier_requirements ->> 'exclusive_to_tier') = t.code::text)
                )
              )
          )
        )
      )
    )
  );

-- ── TIERS (5 SELECT → 1) ─────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_tiers" ON public.tiers;
DROP POLICY IF EXISTS "brand_managers_select_tiers" ON public.tiers;
DROP POLICY IF EXISTS "clients_select_tiers" ON public.tiers;
DROP POLICY IF EXISTS "field_users_select_tiers" ON public.tiers;
DROP POLICY IF EXISTS "tenant_admins_select_tiers" ON public.tiers;

CREATE POLICY "rls_select_tiers" ON public.tiers
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        -- field users: active tiers in tenant
        OR (
          is_active = true
          AND tenant_id = (SELECT get_field_user_tenant_id())
        )
        -- client: active tiers from their brands
        OR (
          is_active = true
          AND brand_id IN (
            SELECT cbm.brand_id FROM client_brand_memberships cbm
            JOIN clients c ON cbm.client_id = c.id
            WHERE c.user_id = (SELECT auth.uid())
              AND cbm.membership_status = 'active'::membership_status_enum
              AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
          )
        )
      )
    )
  );

-- ── CLIENT_BRAND_MEMBERSHIPS (6 SELECT → 1) ──────────────────────────
DROP POLICY IF EXISTS "admins_select_client_brand_memberships" ON public.client_brand_memberships;
DROP POLICY IF EXISTS "brand_managers_select_client_brand_memberships" ON public.client_brand_memberships;
DROP POLICY IF EXISTS "clients_can_read_own_memberships" ON public.client_brand_memberships;
DROP POLICY IF EXISTS "clients_select_own_memberships" ON public.client_brand_memberships;
DROP POLICY IF EXISTS "field_users_select_client_brand_memberships" ON public.client_brand_memberships;
DROP POLICY IF EXISTS "tenant_admins_select_client_brand_memberships" ON public.client_brand_memberships;

CREATE POLICY "rls_select_client_brand_memberships" ON public.client_brand_memberships
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    -- client: own memberships (clients_can_read_own_memberships has no deleted_at filter)
    OR client_id = ANY(get_client_ids_for_auth_user())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        -- field users
        OR tenant_id = (SELECT get_field_user_tenant_id())
      )
    )
  );

-- ── CLIENT_TIER_ASSIGNMENTS (6 SELECT → 1) ───────────────────────────
DROP POLICY IF EXISTS "admins_select_client_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "brand_managers_select_client_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "clients_select_own_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "promotors_select_client_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "supervisors_select_client_tier_assignments" ON public.client_tier_assignments;
DROP POLICY IF EXISTS "tenant_admins_select_client_tier_assignments" ON public.client_tier_assignments;

CREATE POLICY "rls_select_client_tier_assignments" ON public.client_tier_assignments
  FOR SELECT TO public
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
        -- client: own tier assignments via membership
        OR client_brand_membership_id IN (
          SELECT cbm.id FROM client_brand_memberships cbm
          JOIN clients c ON cbm.client_id = c.id
          WHERE c.user_id = (SELECT auth.uid())
            AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
        )
        -- promotor: clients in their visits
        OR client_brand_membership_id IN (
          SELECT cbm.id FROM client_brand_memberships cbm
          JOIN clients c ON cbm.client_id = c.id
          WHERE c.id IN (
            SELECT DISTINCT v.client_id FROM visits v
            WHERE v.promotor_id = ANY(get_promotor_profile_ids())
              AND v.deleted_at IS NULL
          ) AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
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

-- ── POINTS_TRANSACTIONS (6 SELECT → 1) ───────────────────────────────
DROP POLICY IF EXISTS "admins_select_points_transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "brand_managers_select_points_transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "clients_select_own_points_transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "promotors_select_points_transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "supervisors_select_points_transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "tenant_admins_select_points_transactions" ON public.points_transactions;

CREATE POLICY "rls_select_points_transactions" ON public.points_transactions
  FOR SELECT TO public
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
        -- client: own points via membership
        OR client_brand_membership_id IN (
          SELECT cbm.id FROM client_brand_memberships cbm
          JOIN clients c ON cbm.client_id = c.id
          WHERE c.user_id = (SELECT auth.uid())
            AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
        )
        -- promotor: clients in their visits
        OR client_brand_membership_id IN (
          SELECT cbm.id FROM client_brand_memberships cbm
          JOIN clients c ON cbm.client_id = c.id
          WHERE c.id IN (
            SELECT DISTINCT v.client_id FROM visits v
            WHERE v.promotor_id = ANY(get_promotor_profile_ids())
              AND v.deleted_at IS NULL
          ) AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
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

-- ── PROMOTION_REDEMPTIONS (6 SELECT → 1) ─────────────────────────────
DROP POLICY IF EXISTS "admins_select_promotion_redemptions" ON public.promotion_redemptions;
DROP POLICY IF EXISTS "brand_managers_select_promotion_redemptions" ON public.promotion_redemptions;
DROP POLICY IF EXISTS "clients_select_own_promotion_redemptions" ON public.promotion_redemptions;
DROP POLICY IF EXISTS "promotors_select_promotion_redemptions" ON public.promotion_redemptions;
DROP POLICY IF EXISTS "supervisors_select_promotion_redemptions" ON public.promotion_redemptions;
DROP POLICY IF EXISTS "tenant_admins_select_promotion_redemptions" ON public.promotion_redemptions;

CREATE POLICY "rls_select_promotion_redemptions" ON public.promotion_redemptions
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: via promotion → brand
        OR promotion_id IN (
          SELECT p.id FROM promotions p
          WHERE p.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND p.deleted_at IS NULL
        )
        -- client: own redemptions via membership
        OR client_brand_membership_id IN (
          SELECT cbm.id FROM client_brand_memberships cbm
          JOIN clients c ON cbm.client_id = c.id
          WHERE c.user_id = (SELECT auth.uid())
            AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
        )
        -- promotor: applied by self
        OR applied_by = ANY(get_promotor_profile_ids())
        -- supervisor: applied by subordinates OR clients of supervised promotors
        OR applied_by = ANY(get_supervised_profile_ids())
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

-- ── REWARD_REDEMPTIONS (6 SELECT → 1) ────────────────────────────────
DROP POLICY IF EXISTS "admins_select_reward_redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "brand_managers_select_reward_redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "clients_select_own_reward_redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "promotors_select_reward_redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "supervisors_select_reward_redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "tenant_admins_select_reward_redemptions" ON public.reward_redemptions;

CREATE POLICY "rls_select_reward_redemptions" ON public.reward_redemptions
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
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
        -- client: own redemptions via membership
        OR client_brand_membership_id IN (
          SELECT cbm.id FROM client_brand_memberships cbm
          JOIN clients c ON cbm.client_id = c.id
          WHERE c.user_id = (SELECT auth.uid())
            AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
        )
        -- promotor: clients in their visits
        OR client_brand_membership_id IN (
          SELECT cbm.id FROM client_brand_memberships cbm
          JOIN clients c ON cbm.client_id = c.id
          WHERE c.id IN (
            SELECT DISTINCT v.client_id FROM visits v
            WHERE v.promotor_id = ANY(get_promotor_profile_ids())
              AND v.deleted_at IS NULL
          ) AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
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

-- ── ORDER_ITEMS (4 SELECT → 1) ───────────────────────────────────────
-- Note: Uses TO authenticated (not TO public). Admin access via FOR ALL policy.
DROP POLICY IF EXISTS "policy_order_items_brand_manager" ON public.order_items;
DROP POLICY IF EXISTS "policy_order_items_client_select" ON public.order_items;
DROP POLICY IF EXISTS "policy_order_items_promotor" ON public.order_items;
DROP POLICY IF EXISTS "policy_order_items_supervisor" ON public.order_items;

CREATE POLICY "rls_select_order_items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    -- promotor: no deleted_at on order_items (preserves original)
    order_id IN (
      SELECT o.id FROM orders o
      WHERE o.assigned_to = ANY(get_promotor_profile_ids())
        AND o.deleted_at IS NULL
    )
    OR (
      deleted_at IS NULL
      AND (
        -- brand manager: via product's brand
        product_id IN (
          SELECT p.id FROM products p
          WHERE p.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND p.deleted_at IS NULL
        )
        -- client: own orders
        OR order_id IN (
          SELECT o.id FROM orders o
          JOIN clients c ON c.id = o.client_id
          WHERE c.user_id = (SELECT auth.uid())
            AND o.deleted_at IS NULL AND c.deleted_at IS NULL
        )
        -- supervisor: orders for clients of supervised promotors
        OR order_id IN (
          SELECT o.id FROM orders o
          JOIN clients c ON c.id = o.client_id
          WHERE c.id IN (
            SELECT DISTINCT v.client_id FROM visits v
            WHERE v.promotor_id = ANY(get_supervised_profile_ids())
              AND v.deleted_at IS NULL
          ) AND o.deleted_at IS NULL AND c.deleted_at IS NULL
        )
      )
    )
  );

-- ── VISIT_ORDER_ITEMS (3 SELECT → 1) ─────────────────────────────────
-- Note: Uses TO authenticated. Admin/tenant_admin/supervisor via FOR ALL policies.
DROP POLICY IF EXISTS "policy_visit_order_items_brand_manager" ON public.visit_order_items;
DROP POLICY IF EXISTS "policy_visit_order_items_client_select" ON public.visit_order_items;
DROP POLICY IF EXISTS "policy_visit_order_items_promotor_select" ON public.visit_order_items;

CREATE POLICY "rls_select_visit_order_items" ON public.visit_order_items
  FOR SELECT TO authenticated
  USING (
    -- promotor: no deleted_at on visit_order_items (preserves original)
    visit_order_id IN (
      SELECT vo.id FROM visit_orders vo
      WHERE vo.promotor_id = (SELECT get_user_profile_id())
        AND vo.deleted_at IS NULL
    )
    OR (
      deleted_at IS NULL
      AND (
        -- brand manager: via product's brand
        product_id IN (
          SELECT p.id FROM products p
          WHERE p.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND p.deleted_at IS NULL
        )
        -- client: via visit_order's client
        OR visit_order_id IN (
          SELECT vo.id FROM visit_orders vo
          JOIN clients c ON c.id = vo.client_id
          WHERE c.user_id = (SELECT auth.uid())
            AND vo.deleted_at IS NULL AND c.deleted_at IS NULL
        )
      )
    )
  );

-- ══════════════════════════════════════════════════════════════════════════
-- TIER 3: Reference data & config tables (4-5 SELECT policies each)
-- ══════════════════════════════════════════════════════════════════════════

-- ── ZONES (5 SELECT → 1) ─────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_zones" ON public.zones;
DROP POLICY IF EXISTS "brand_managers_select_zones" ON public.zones;
DROP POLICY IF EXISTS "clients_select_assigned_zone" ON public.zones;
DROP POLICY IF EXISTS "field_users_select_assigned_zones" ON public.zones;
DROP POLICY IF EXISTS "tenant_admins_select_zones" ON public.zones;

CREATE POLICY "rls_select_zones" ON public.zones
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: zones in their brands' tenants
        OR tenant_id IN (
          SELECT b.tenant_id FROM brands b
          WHERE b.id IN (SELECT get_brand_manager_brand_ids())
            AND b.deleted_at IS NULL
        )
        -- field users: active zones in their tenant
        OR (
          is_active = true
          AND EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_profile_id = (SELECT get_user_profile_id())
              AND ur.role = ANY(ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum])
              AND ur.status = 'active'::user_role_status_enum
              AND ur.deleted_at IS NULL
              AND ur.tenant_id = zones.tenant_id
          )
        )
        -- client: their assigned zone
        OR (
          is_active = true
          AND EXISTS (
            SELECT 1 FROM clients c
            WHERE c.user_id = (SELECT auth.uid())
              AND c.zone_id = zones.id
              AND c.deleted_at IS NULL
          )
        )
      )
    )
  );

-- ── MARKETS (5 SELECT → 1) ───────────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_markets" ON public.markets;
DROP POLICY IF EXISTS "brand_managers_select_markets" ON public.markets;
DROP POLICY IF EXISTS "clients_select_assigned_market" ON public.markets;
DROP POLICY IF EXISTS "field_users_select_markets" ON public.markets;
DROP POLICY IF EXISTS "tenant_admins_select_markets" ON public.markets;

CREATE POLICY "rls_select_markets" ON public.markets
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR tenant_id IN (
          SELECT b.tenant_id FROM brands b
          WHERE b.id IN (SELECT get_brand_manager_brand_ids())
            AND b.deleted_at IS NULL
        )
        -- field users
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- client: their assigned market
        OR (
          is_active = true
          AND EXISTS (
            SELECT 1 FROM clients c
            WHERE c.user_id = (SELECT auth.uid())
              AND c.market_id = markets.id
              AND c.deleted_at IS NULL
          )
        )
      )
    )
  );

-- ── CLIENT_TYPES (5 SELECT → 1) ──────────────────────────────────────
DROP POLICY IF EXISTS "admins_select_client_types" ON public.client_types;
DROP POLICY IF EXISTS "brand_managers_select_client_types" ON public.client_types;
DROP POLICY IF EXISTS "clients_select_assigned_client_type" ON public.client_types;
DROP POLICY IF EXISTS "field_users_select_client_types" ON public.client_types;
DROP POLICY IF EXISTS "tenant_admins_select_client_types" ON public.client_types;

CREATE POLICY "rls_select_client_types" ON public.client_types
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR tenant_id IN (
          SELECT b.tenant_id FROM brands b
          WHERE b.id IN (SELECT get_brand_manager_brand_ids())
            AND b.deleted_at IS NULL
        )
        -- field users
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- client: their assigned type
        OR (
          is_active = true
          AND EXISTS (
            SELECT 1 FROM clients c
            WHERE c.user_id = (SELECT auth.uid())
              AND c.client_type_id = client_types.id
              AND c.deleted_at IS NULL
          )
        )
      )
    )
  );

-- ── COMMERCIAL_STRUCTURES (5 SELECT → 1) ─────────────────────────────
DROP POLICY IF EXISTS "admins_select_commercial_structures" ON public.commercial_structures;
DROP POLICY IF EXISTS "brand_managers_select_commercial_structures" ON public.commercial_structures;
DROP POLICY IF EXISTS "clients_select_assigned_commercial_structure" ON public.commercial_structures;
DROP POLICY IF EXISTS "field_users_select_commercial_structures" ON public.commercial_structures;
DROP POLICY IF EXISTS "tenant_admins_select_commercial_structures" ON public.commercial_structures;

CREATE POLICY "rls_select_commercial_structures" ON public.commercial_structures
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR tenant_id IN (
          SELECT b.tenant_id FROM brands b
          WHERE b.id IN (SELECT get_brand_manager_brand_ids())
            AND b.deleted_at IS NULL
        )
        -- field users
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- client: their assigned commercial structure
        OR (
          is_active = true
          AND EXISTS (
            SELECT 1 FROM clients c
            WHERE c.user_id = (SELECT auth.uid())
              AND c.commercial_structure_id = commercial_structures.id
              AND c.deleted_at IS NULL
          )
        )
      )
    )
  );

-- ── PRODUCT_CATEGORIES (5 SELECT → 1) ────────────────────────────────
DROP POLICY IF EXISTS "admins_select_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "brand_managers_select_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "clients_select_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "field_users_select_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "tenant_admins_select_product_categories" ON public.product_categories;

CREATE POLICY "rls_select_product_categories" ON public.product_categories
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
        -- field users
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- client: active categories from their brands (or tenant-level if brand_id IS NULL)
        OR (
          is_active = true
          AND (
            brand_id IN (
              SELECT cbm.brand_id FROM client_brand_memberships cbm
              JOIN clients c ON cbm.client_id = c.id
              WHERE c.user_id = (SELECT auth.uid())
                AND cbm.membership_status = 'active'::membership_status_enum
                AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
            )
            OR (
              brand_id IS NULL
              AND tenant_id IN (
                SELECT cbm.tenant_id FROM client_brand_memberships cbm
                JOIN clients c ON cbm.client_id = c.id
                WHERE c.user_id = (SELECT auth.uid())
                  AND cbm.membership_status = 'active'::membership_status_enum
                  AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
              )
            )
          )
        )
      )
    )
  );

-- ── PRODUCT_VARIANTS (5 SELECT → 1) ──────────────────────────────────
DROP POLICY IF EXISTS "admins_select_product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "brand_managers_select_product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "clients_select_product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "field_users_select_product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "tenant_admins_select_product_variants" ON public.product_variants;

CREATE POLICY "rls_select_product_variants" ON public.product_variants
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager
        OR product_id IN (
          SELECT p.id FROM products p
          WHERE p.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND p.deleted_at IS NULL
        )
        -- field users
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- client: active variants of active products from their brands
        OR (
          is_active = true
          AND product_id IN (
            SELECT p.id FROM products p
            WHERE p.brand_id IN (
              SELECT cbm.brand_id FROM client_brand_memberships cbm
              JOIN clients c ON cbm.client_id = c.id
              WHERE c.user_id = (SELECT auth.uid())
                AND cbm.membership_status = 'active'::membership_status_enum
                AND cbm.deleted_at IS NULL AND c.deleted_at IS NULL
            ) AND p.deleted_at IS NULL AND p.is_active = true
          )
        )
      )
    )
  );

-- ── PROMOTION_RULES (4 SELECT → 1) ───────────────────────────────────
DROP POLICY IF EXISTS "admins_select_promotion_rules" ON public.promotion_rules;
DROP POLICY IF EXISTS "brand_managers_select_promotion_rules" ON public.promotion_rules;
DROP POLICY IF EXISTS "field_users_select_promotion_rules" ON public.promotion_rules;
DROP POLICY IF EXISTS "tenant_admins_select_promotion_rules" ON public.promotion_rules;

CREATE POLICY "rls_select_promotion_rules" ON public.promotion_rules
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: via promotion's brand
        OR promotion_id IN (
          SELECT p.id FROM promotions p
          WHERE p.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND p.deleted_at IS NULL
        )
        -- field users: active rules of active promotions in their tenant
        OR (
          is_active = true
          AND promotion_id IN (
            SELECT p.id FROM promotions p
            WHERE p.status = 'active'::promotion_status_enum
              AND p.start_date <= CURRENT_DATE
              AND p.end_date >= CURRENT_DATE
              AND p.tenant_id = (SELECT get_field_user_tenant_id())
              AND p.deleted_at IS NULL
          )
        )
      )
    )
  );

-- ── CLIENT_INVOICE_DATA (5 SELECT → 1) ───────────────────────────────
DROP POLICY IF EXISTS "admins_select_client_invoice_data" ON public.client_invoice_data;
DROP POLICY IF EXISTS "brand_managers_select_client_invoice_data" ON public.client_invoice_data;
DROP POLICY IF EXISTS "clients_select_own_invoice_data" ON public.client_invoice_data;
DROP POLICY IF EXISTS "field_users_select_client_invoice_data" ON public.client_invoice_data;
DROP POLICY IF EXISTS "tenant_admins_select_client_invoice_data" ON public.client_invoice_data;

CREATE POLICY "rls_select_client_invoice_data" ON public.client_invoice_data
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: via client → client_brand_membership → brand
        OR client_id IN (
          SELECT cbm.client_id FROM client_brand_memberships cbm
          WHERE cbm.brand_id = ANY(get_user_role_brand_ids('brand_manager'::user_role_type_enum))
            AND cbm.deleted_at IS NULL
        )
        -- field users (supervisor/advisor/market_analyst)
        OR tenant_id = (SELECT get_field_user_tenant_id())
        -- client: own invoice data
        OR client_id = ANY(get_client_ids_for_auth_user())
      )
    )
  );

COMMIT;

-- ============================================================================
-- ROLLBACK SQL — Recreate all individual SELECT policies
-- Due to file size, rollback would require restoring ~144 individual policies.
-- Use: psql -f supabase/migrations/20260221100000_fix_auth_rls_initplan.sql
-- (re-apply the initplan migration which contains all original policies)
-- ============================================================================
