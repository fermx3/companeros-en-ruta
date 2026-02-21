-- ============================================================================
-- Migration: 20260222100000_fix_is_tenant_admin_scope.sql
-- Purpose:   Fix is_tenant_admin() to accept both 'tenant' and 'global' scopes.
--            All admin users currently have scope='global', so the original
--            function (which only checked scope='tenant') always returned FALSE.
--            This broke the survey_questions admin RLS policies that rely on it.
--
-- Impact:    Fixes INSERT/UPDATE/DELETE on survey_questions for admin users.
--            Also future-proofs any policy that uses is_tenant_admin().
--
-- Rollback:  See bottom of file.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_profile_id = get_user_profile_id()
      AND ur.role = 'admin'::user_role_type_enum
      AND ur.scope IN ('tenant'::user_role_scope_enum, 'global'::user_role_scope_enum)
      AND ur.status = 'active'::user_role_status_enum
      AND ur.deleted_at IS NULL
  );
$$;

COMMIT;

-- ============================================================================
-- ROLLBACK SQL
-- ============================================================================
--
-- BEGIN;
--
-- CREATE OR REPLACE FUNCTION public.is_tenant_admin()
-- RETURNS boolean
-- LANGUAGE sql
-- STABLE
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
--   SELECT EXISTS (
--     SELECT 1
--     FROM user_roles ur
--     WHERE ur.user_profile_id = get_user_profile_id()
--       AND ur.role = 'admin'::user_role_type_enum
--       AND ur.scope = 'tenant'::user_role_scope_enum
--       AND ur.status = 'active'::user_role_status_enum
--       AND ur.deleted_at IS NULL
--   );
-- $$;
--
-- COMMIT;
