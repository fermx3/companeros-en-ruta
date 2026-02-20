-- Migration: optimize_rls_policies
-- Purpose: Fix statement timeout errors by optimizing deeply-nested RLS policies.
--
-- Problems addressed:
--   1. Supervisor policies have 4-5 levels of nested subqueries
--   2. Brand manager policies repeat user_roles JOIN user_profiles in every policy
--   3. field_users_select_client_brand_memberships does a cartesian-prone tenant_id JOIN
--   4. 17 foreign keys lack covering indexes (Supabase advisor)
--
-- Solution:
--   1. Create SECURITY DEFINER helper functions to flatten lookups
--   2. Rewrite 13+ policies to use those helpers
--   3. Add missing FK indexes

BEGIN;

-- ============================================================================
-- STEP 1: Helper functions (SECURITY DEFINER, bypass RLS)
-- ============================================================================

-- get_user_profile_id(): Returns the user_profile.id for the current auth user.
-- Used by all other helpers to avoid repeated JOIN user_profiles → user_roles.
CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_profile_id() TO authenticated;

-- get_user_role_brand_ids(role): Returns brand_ids for a given role of the current user.
-- Replaces the repeated pattern: SELECT ur.brand_id FROM user_roles ur JOIN user_profiles up ...
CREATE OR REPLACE FUNCTION public.get_user_role_brand_ids(p_role user_role_type_enum)
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(ur.brand_id), '{}')
  FROM user_roles ur
  WHERE ur.user_profile_id = get_user_profile_id()
    AND ur.role = p_role
    AND ur.status = 'active'::user_role_status_enum
    AND ur.deleted_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role_brand_ids(user_role_type_enum) TO authenticated;

-- get_supervised_profile_ids(): Returns user_profile IDs that report to the current user.
-- Flattens the 4-5 level deep supervisor subquery into a single function call.
CREATE OR REPLACE FUNCTION public.get_supervised_profile_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(up.id), '{}')
  FROM user_profiles up
  WHERE up.manager_id = get_user_profile_id()
    AND up.deleted_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_supervised_profile_ids() TO authenticated;

-- get_field_user_tenant_id(): Returns the tenant_id for field users (supervisor/advisor/analyst).
-- Replaces the pattern: SELECT ur.tenant_id FROM user_roles ur JOIN user_profiles up ...
CREATE OR REPLACE FUNCTION public.get_field_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.tenant_id
  FROM user_roles ur
  WHERE ur.user_profile_id = get_user_profile_id()
    AND ur.role = ANY(ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'promotor'::user_role_type_enum, 'market_analyst'::user_role_type_enum, 'asesor_de_ventas'::user_role_type_enum])
    AND ur.status = 'active'::user_role_status_enum
    AND ur.deleted_at IS NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_field_user_tenant_id() TO authenticated;

-- ============================================================================
-- STEP 2: Rewrite SUPERVISOR policies (4-5 level nesting → 1 function call)
-- ============================================================================
-- Original pattern:
--   WHERE advisor_id IN (SELECT up.id FROM user_profiles up
--     WHERE up.manager_id IN (SELECT ur.user_profile_id FROM user_roles ur
--       JOIN user_profiles up_mgr ON ...
--       WHERE up_mgr.user_id = auth.uid() AND ur.role = 'supervisor' ...))
--
-- New pattern:
--   WHERE advisor_id = ANY(get_supervised_profile_ids())

-- 2a. supervisors_select_points_transactions
DROP POLICY IF EXISTS "supervisors_select_points_transactions" ON public.points_transactions;
CREATE POLICY "supervisors_select_points_transactions" ON public.points_transactions
  FOR SELECT USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
      SELECT cbm.id
      FROM client_brand_memberships cbm
      JOIN clients c ON cbm.client_id = c.id
      WHERE c.id IN (
        SELECT DISTINCT v.client_id
        FROM visits v
        WHERE v.advisor_id = ANY(get_supervised_profile_ids())
          AND v.deleted_at IS NULL
      )
      AND cbm.deleted_at IS NULL
      AND c.deleted_at IS NULL
    )
  );

-- 2b. supervisors_select_promotion_redemptions
DROP POLICY IF EXISTS "supervisors_select_promotion_redemptions" ON public.promotion_redemptions;
CREATE POLICY "supervisors_select_promotion_redemptions" ON public.promotion_redemptions
  FOR SELECT USING (
    deleted_at IS NULL
    AND (
      applied_by = ANY(get_supervised_profile_ids())
      OR client_brand_membership_id IN (
        SELECT cbm.id
        FROM client_brand_memberships cbm
        JOIN clients c ON cbm.client_id = c.id
        WHERE c.id IN (
          SELECT DISTINCT v.client_id
          FROM visits v
          WHERE v.advisor_id = ANY(get_supervised_profile_ids())
            AND v.deleted_at IS NULL
        )
        AND cbm.deleted_at IS NULL
        AND c.deleted_at IS NULL
      )
    )
  );

-- 2c. supervisors_select_reward_redemptions
DROP POLICY IF EXISTS "supervisors_select_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "supervisors_select_reward_redemptions" ON public.reward_redemptions
  FOR SELECT USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
      SELECT cbm.id
      FROM client_brand_memberships cbm
      JOIN clients c ON cbm.client_id = c.id
      WHERE c.id IN (
        SELECT DISTINCT v.client_id
        FROM visits v
        WHERE v.advisor_id = ANY(get_supervised_profile_ids())
          AND v.deleted_at IS NULL
      )
      AND cbm.deleted_at IS NULL
      AND c.deleted_at IS NULL
    )
  );

-- 2d. supervisors_select_client_tier_assignments
DROP POLICY IF EXISTS "supervisors_select_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "supervisors_select_client_tier_assignments" ON public.client_tier_assignments
  FOR SELECT USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
      SELECT cbm.id
      FROM client_brand_memberships cbm
      JOIN clients c ON cbm.client_id = c.id
      WHERE c.id IN (
        SELECT DISTINCT v.client_id
        FROM visits v
        WHERE v.advisor_id = ANY(get_supervised_profile_ids())
          AND v.deleted_at IS NULL
      )
      AND cbm.deleted_at IS NULL
      AND c.deleted_at IS NULL
    )
  );

-- 2e. supervisors_manage_client_tier_assignments (FOR ALL)
DROP POLICY IF EXISTS "supervisors_manage_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "supervisors_manage_client_tier_assignments" ON public.client_tier_assignments
  USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
      SELECT cbm.id
      FROM client_brand_memberships cbm
      JOIN clients c ON cbm.client_id = c.id
      WHERE c.id IN (
        SELECT DISTINCT v.client_id
        FROM visits v
        WHERE v.advisor_id = ANY(get_supervised_profile_ids())
          AND v.deleted_at IS NULL
      )
      AND cbm.deleted_at IS NULL
      AND c.deleted_at IS NULL
    )
  );

-- ============================================================================
-- STEP 3: Rewrite BRAND MANAGER policies (use existing get_brand_manager_brand_ids())
-- ============================================================================
-- The function get_brand_manager_brand_ids() already exists from migration 20260219130000.
-- We use it (returns SETOF uuid) for brand_id IN (...) patterns.
-- For cbm-based patterns, we combine it with a simpler subquery.

-- 3a. brand_managers_select_visits
DROP POLICY IF EXISTS "brand_managers_select_visits" ON public.visits;
CREATE POLICY "brand_managers_select_visits" ON public.visits
  FOR SELECT USING (
    deleted_at IS NULL
    AND client_id IN (
      SELECT cbm.client_id
      FROM client_brand_memberships cbm
      WHERE cbm.brand_id IN (SELECT get_brand_manager_brand_ids())
        AND cbm.deleted_at IS NULL
    )
  );

-- 3b. brand_managers_select_client_brand_memberships
DROP POLICY IF EXISTS "brand_managers_select_client_brand_memberships" ON public.client_brand_memberships;
CREATE POLICY "brand_managers_select_client_brand_memberships" ON public.client_brand_memberships
  FOR SELECT USING (
    deleted_at IS NULL
    AND brand_id IN (SELECT get_brand_manager_brand_ids())
  );

-- 3c. brand_managers_manage_client_brand_memberships (FOR ALL)
DROP POLICY IF EXISTS "brand_managers_manage_client_brand_memberships" ON public.client_brand_memberships;
CREATE POLICY "brand_managers_manage_client_brand_memberships" ON public.client_brand_memberships
  USING (
    deleted_at IS NULL
    AND brand_id IN (SELECT get_brand_manager_brand_ids())
  );

-- 3d. brand_managers_select_client_tier_assignments
DROP POLICY IF EXISTS "brand_managers_select_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "brand_managers_select_client_tier_assignments" ON public.client_tier_assignments
  FOR SELECT USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
      SELECT cbm.id
      FROM client_brand_memberships cbm
      WHERE cbm.brand_id IN (SELECT get_brand_manager_brand_ids())
        AND cbm.deleted_at IS NULL
    )
  );

-- 3e. brand_managers_manage_client_tier_assignments (FOR ALL)
DROP POLICY IF EXISTS "brand_managers_manage_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "brand_managers_manage_client_tier_assignments" ON public.client_tier_assignments
  USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
      SELECT cbm.id
      FROM client_brand_memberships cbm
      WHERE cbm.brand_id IN (SELECT get_brand_manager_brand_ids())
        AND cbm.deleted_at IS NULL
    )
  );

-- 3f. brand_managers_select_points_transactions
DROP POLICY IF EXISTS "brand_managers_select_points_transactions" ON public.points_transactions;
CREATE POLICY "brand_managers_select_points_transactions" ON public.points_transactions
  FOR SELECT USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
      SELECT cbm.id
      FROM client_brand_memberships cbm
      WHERE cbm.brand_id IN (SELECT get_brand_manager_brand_ids())
        AND cbm.deleted_at IS NULL
    )
  );

-- 3g. brand_managers_manage_points_transactions (FOR ALL)
DROP POLICY IF EXISTS "brand_managers_manage_points_transactions" ON public.points_transactions;
CREATE POLICY "brand_managers_manage_points_transactions" ON public.points_transactions
  USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
      SELECT cbm.id
      FROM client_brand_memberships cbm
      WHERE cbm.brand_id IN (SELECT get_brand_manager_brand_ids())
        AND cbm.deleted_at IS NULL
    )
  );

-- 3h. brand_managers_select_client_invoice_data
DROP POLICY IF EXISTS "brand_managers_select_client_invoice_data" ON public.client_invoice_data;
CREATE POLICY "brand_managers_select_client_invoice_data" ON public.client_invoice_data
  FOR SELECT USING (
    deleted_at IS NULL
    AND client_id IN (
      SELECT cbm.client_id
      FROM client_brand_memberships cbm
      WHERE cbm.brand_id IN (SELECT get_brand_manager_brand_ids())
        AND cbm.deleted_at IS NULL
    )
  );

-- ============================================================================
-- STEP 4: Rewrite field_users_select_client_brand_memberships
-- ============================================================================
-- Original: JOIN clients c ON c.tenant_id = ur.tenant_id (cartesian-prone)
-- New: Use get_field_user_tenant_id() to get tenant_id without the expensive JOIN

DROP POLICY IF EXISTS "field_users_select_client_brand_memberships" ON public.client_brand_memberships;
CREATE POLICY "field_users_select_client_brand_memberships" ON public.client_brand_memberships
  FOR SELECT USING (
    deleted_at IS NULL
    AND client_id IN (
      SELECT c.id
      FROM clients c
      WHERE c.tenant_id = get_field_user_tenant_id()
        AND c.deleted_at IS NULL
    )
  );

-- ============================================================================
-- STEP 5: Add missing FK indexes (from Supabase performance advisor)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id
  ON public.audit_logs (tenant_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
  ON public.audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_brand_competitor_products_tenant_id
  ON public.brand_competitor_products (tenant_id);

CREATE INDEX IF NOT EXISTS idx_client_assignments_assigned_by
  ON public.client_assignments (assigned_by);

CREATE INDEX IF NOT EXISTS idx_kpi_targets_zone_id
  ON public.kpi_targets (zone_id);

CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id
  ON public.notifications (tenant_id);

CREATE INDEX IF NOT EXISTS idx_order_items_substitute_variant_id
  ON public.order_items (substitute_variant_id);

CREATE INDEX IF NOT EXISTS idx_promotor_assignments_assigned_by
  ON public.promotor_assignments (assigned_by);

CREATE INDEX IF NOT EXISTS idx_qr_codes_brand_id
  ON public.qr_codes (brand_id);

CREATE INDEX IF NOT EXISTS idx_survey_answers_tenant_id
  ON public.survey_answers (tenant_id);

CREATE INDEX IF NOT EXISTS idx_survey_questions_tenant_id
  ON public.survey_questions (tenant_id);

CREATE INDEX IF NOT EXISTS idx_survey_responses_tenant_id
  ON public.survey_responses (tenant_id);

CREATE INDEX IF NOT EXISTS idx_surveys_approved_by
  ON public.surveys (approved_by);

CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by
  ON public.user_roles (granted_by);

CREATE INDEX IF NOT EXISTS idx_visit_brand_product_assessments_product_variant_id
  ON public.visit_brand_product_assessments (product_variant_id);

CREATE INDEX IF NOT EXISTS idx_visit_competitor_assessments_competitor_product_id
  ON public.visit_competitor_assessments (competitor_product_id);

CREATE INDEX IF NOT EXISTS idx_visit_order_items_approved_by
  ON public.visit_order_items (approved_by);

COMMIT;
