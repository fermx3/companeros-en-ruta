-- Migration: fix_user_roles_rls_recursion
-- Purpose: Fix infinite recursion in user_roles RLS policies that causes HTTP 500 on login.
--
-- Problem: 5 policies on user_roles query FROM user_roles inside their own
--          policy expressions. When RLS is active, this creates infinite recursion.
--
-- Solution:
--   1. Enable RLS (retro-document production state)
--   2. Create SECURITY DEFINER helper functions that bypass RLS
--   3. Fix broken user_has_role() function
--   4. Replace self-referencing policies with calls to helper functions

BEGIN;

-- ============================================================================
-- STEP 1: Enable RLS on user_roles (retro-documenting production state)
-- ============================================================================
-- RLS was enabled manually in production but never captured in a migration.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Create SECURITY DEFINER helper functions
-- ============================================================================
-- These functions bypass RLS when called, breaking the recursion cycle.

-- is_global_admin(): Returns true if current auth user has an active global admin role
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN user_profiles up ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
      AND ur.role = 'admin'::user_role_type_enum
      AND ur.scope = 'global'::user_role_scope_enum
      AND ur.status = 'active'::user_role_status_enum
      AND ur.deleted_at IS NULL
  );
$$;

-- get_brand_manager_brand_ids(): Returns brand_ids managed by current auth user
CREATE OR REPLACE FUNCTION public.get_brand_manager_brand_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.brand_id
  FROM user_roles ur
  JOIN user_profiles up ON ur.user_profile_id = up.id
  WHERE up.user_id = auth.uid()
    AND ur.role = 'brand_manager'::user_role_type_enum
    AND ur.status = 'active'::user_role_status_enum
    AND ur.deleted_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.is_global_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_brand_manager_brand_ids() TO authenticated;

-- ============================================================================
-- STEP 3: Fix broken user_has_role() function
-- ============================================================================
-- Old version referenced non-existent columns: ur.user_id, ur.is_active
-- and used wrong enum type (user_role_type vs user_role_type_enum).
-- Drop the old broken overload (different param type = different function in PostgreSQL).
DROP FUNCTION IF EXISTS public.user_has_role(user_role_type, uuid);

CREATE OR REPLACE FUNCTION public.user_has_role(
  role_name user_role_type_enum,
  brand_uuid uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
          AND ur.tenant_id = get_current_tenant_id()
          AND ur.role = role_name
          AND ur.status = 'active'::user_role_status_enum
          AND ur.deleted_at IS NULL
          AND (brand_uuid IS NULL OR ur.brand_id = brand_uuid)
    );
END;
$function$;

-- ============================================================================
-- STEP 4: Drop and recreate self-referencing policies
-- ============================================================================
-- These 5 policies previously queried FROM user_roles inside policies ON
-- user_roles, causing infinite recursion when RLS is enabled.

-- 4a: Admin policies (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS admins_select_user_roles ON public.user_roles;
CREATE POLICY admins_select_user_roles ON public.user_roles
  FOR SELECT
  USING (is_global_admin());

DROP POLICY IF EXISTS admins_insert_user_roles ON public.user_roles;
CREATE POLICY admins_insert_user_roles ON public.user_roles
  FOR INSERT
  WITH CHECK (is_global_admin());

DROP POLICY IF EXISTS admins_update_user_roles ON public.user_roles;
CREATE POLICY admins_update_user_roles ON public.user_roles
  FOR UPDATE
  USING (is_global_admin());

DROP POLICY IF EXISTS admins_delete_user_roles ON public.user_roles;
CREATE POLICY admins_delete_user_roles ON public.user_roles
  FOR DELETE
  USING (is_global_admin());

-- 4b: Brand managers policy
DROP POLICY IF EXISTS brand_managers_manage_roles ON public.user_roles;
CREATE POLICY brand_managers_manage_roles ON public.user_roles
  FOR ALL
  USING (
    deleted_at IS NULL
    AND role IN ('supervisor'::user_role_type_enum, 'promotor'::user_role_type_enum, 'market_analyst'::user_role_type_enum)
    AND brand_id IN (SELECT get_brand_manager_brand_ids())
  )
  WITH CHECK (
    deleted_at IS NULL
    AND role IN ('supervisor'::user_role_type_enum, 'promotor'::user_role_type_enum, 'market_analyst'::user_role_type_enum)
    AND brand_id IN (SELECT get_brand_manager_brand_ids())
  );

-- NOTE: These two policies are NOT modified — they only query user_profiles (no recursion):
--   - users_select_own_roles
--   - supervisors_select_subordinate_roles

COMMIT;
