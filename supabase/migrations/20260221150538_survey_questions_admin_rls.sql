-- ============================================================================
-- Migration: 20260221150538_survey_questions_admin_rls.sql
-- Purpose:   Allow tenant admins to INSERT, UPDATE, DELETE survey_questions
--            on surveys in 'draft' or 'pending_approval' status.
--            Previously only brand_managers could modify questions, and only
--            on draft surveys. This enables admins to edit surveys during
--            the approval review flow without rejecting first.
--
-- Impact:    Replaces 3 existing policies on survey_questions (insert, update, delete).
--            Each policy gains an OR branch for tenant admins.
--            SELECT policy is unchanged (already allows all tenant users).
--
-- Rollback:  See bottom of file.
-- ============================================================================

BEGIN;

-- ── INSERT ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "survey_questions_insert" ON "public"."survey_questions";
CREATE POLICY "survey_questions_insert" ON "public"."survey_questions"
  FOR INSERT TO "authenticated"
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      -- Brand manager: only on draft surveys they own
      survey_id IN (
        SELECT s.id FROM surveys s
        WHERE s.survey_status = 'draft'::survey_status_enum
          AND s.brand_id IN (
            SELECT ur.brand_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
              AND ur.status = 'active'::user_role_status_enum
              AND ur.role = 'brand_manager'::user_role_type_enum
              AND ur.deleted_at IS NULL
          )
      )
      OR
      -- Tenant admin: on draft or pending_approval surveys
      (
        is_tenant_admin()
        AND survey_id IN (
          SELECT s.id FROM surveys s
          WHERE s.survey_status IN ('draft'::survey_status_enum, 'pending_approval'::survey_status_enum)
        )
      )
    )
  );

-- ── UPDATE ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "survey_questions_update" ON "public"."survey_questions";
CREATE POLICY "survey_questions_update" ON "public"."survey_questions"
  FOR UPDATE TO "authenticated"
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      survey_id IN (
        SELECT s.id FROM surveys s
        WHERE s.survey_status = 'draft'::survey_status_enum
          AND s.brand_id IN (
            SELECT ur.brand_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
              AND ur.status = 'active'::user_role_status_enum
              AND ur.role = 'brand_manager'::user_role_type_enum
              AND ur.deleted_at IS NULL
          )
      )
      OR
      (
        is_tenant_admin()
        AND survey_id IN (
          SELECT s.id FROM surveys s
          WHERE s.survey_status IN ('draft'::survey_status_enum, 'pending_approval'::survey_status_enum)
        )
      )
    )
  );

-- ── DELETE ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "survey_questions_delete" ON "public"."survey_questions";
CREATE POLICY "survey_questions_delete" ON "public"."survey_questions"
  FOR DELETE TO "authenticated"
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      survey_id IN (
        SELECT s.id FROM surveys s
        WHERE s.survey_status = 'draft'::survey_status_enum
          AND s.brand_id IN (
            SELECT ur.brand_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
              AND ur.status = 'active'::user_role_status_enum
              AND ur.role = 'brand_manager'::user_role_type_enum
              AND ur.deleted_at IS NULL
          )
      )
      OR
      (
        is_tenant_admin()
        AND survey_id IN (
          SELECT s.id FROM surveys s
          WHERE s.survey_status IN ('draft'::survey_status_enum, 'pending_approval'::survey_status_enum)
        )
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
-- DROP POLICY IF EXISTS "survey_questions_insert" ON "public"."survey_questions";
-- CREATE POLICY "survey_questions_insert" ON "public"."survey_questions"
--   FOR INSERT TO "authenticated"
--   WITH CHECK (
--     tenant_id IN (SELECT get_user_tenant_ids())
--     AND survey_id IN (
--       SELECT s.id FROM surveys s
--       WHERE s.survey_status = 'draft'::survey_status_enum
--         AND s.brand_id IN (
--           SELECT ur.brand_id FROM user_roles ur
--           JOIN user_profiles up ON ur.user_profile_id = up.id
--           WHERE up.user_id = auth.uid()
--             AND ur.status = 'active'::user_role_status_enum
--             AND ur.role = 'brand_manager'::user_role_type_enum
--             AND ur.deleted_at IS NULL
--         )
--     )
--   );
--
-- DROP POLICY IF EXISTS "survey_questions_update" ON "public"."survey_questions";
-- CREATE POLICY "survey_questions_update" ON "public"."survey_questions"
--   FOR UPDATE TO "authenticated"
--   USING (
--     tenant_id IN (SELECT get_user_tenant_ids())
--     AND survey_id IN (
--       SELECT s.id FROM surveys s
--       WHERE s.survey_status = 'draft'::survey_status_enum
--         AND s.brand_id IN (
--           SELECT ur.brand_id FROM user_roles ur
--           JOIN user_profiles up ON ur.user_profile_id = up.id
--           WHERE up.user_id = auth.uid()
--             AND ur.status = 'active'::user_role_status_enum
--             AND ur.role = 'brand_manager'::user_role_type_enum
--             AND ur.deleted_at IS NULL
--         )
--     )
--   );
--
-- DROP POLICY IF EXISTS "survey_questions_delete" ON "public"."survey_questions";
-- CREATE POLICY "survey_questions_delete" ON "public"."survey_questions"
--   FOR DELETE TO "authenticated"
--   USING (
--     tenant_id IN (SELECT get_user_tenant_ids())
--     AND survey_id IN (
--       SELECT s.id FROM surveys s
--       WHERE s.survey_status = 'draft'::survey_status_enum
--         AND s.brand_id IN (
--           SELECT ur.brand_id FROM user_roles ur
--           JOIN user_profiles up ON ur.user_profile_id = up.id
--           WHERE up.user_id = auth.uid()
--             AND ur.status = 'active'::user_role_status_enum
--             AND ur.role = 'brand_manager'::user_role_type_enum
--             AND ur.deleted_at IS NULL
--         )
--     )
--   );
--
-- COMMIT;
