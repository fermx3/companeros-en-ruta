-- ============================================================================
-- Migration: 20260221120000_rls_consolidation_phase1_helpers.sql
-- Purpose:   Create helper functions needed for RLS policy consolidation.
--            These functions extract repeated subquery patterns into reusable
--            SECURITY DEFINER functions, avoiding RLS recursion and enabling
--            the PostgreSQL planner to evaluate them once per query.
--
-- Impact:    Zero — only creates new functions. No existing policies are modified.
--
-- New functions:
--   1. is_tenant_admin()               → boolean
--   2. get_tenant_admin_tenant_ids()   → UUID[]
--   3. get_client_ids_for_auth_user()  → UUID[]
--   4. get_promotor_profile_ids()      → UUID[]
--
-- Existing functions (reused internally):
--   - get_user_profile_id()            (from 20260220120000)
--   - auth.uid()                       (Supabase built-in)
--
-- Rollback:   See bottom of file.
-- ============================================================================

BEGIN;

-- ── 1. is_tenant_admin() ──────────────────────────────────────────────────
-- Returns TRUE if the current auth user has an active tenant-admin role.
-- Used in ~51 policy expressions to gate tenant-level admin access.
-- Leverages get_user_profile_id() to avoid JOIN to user_profiles.
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
      AND ur.scope = 'tenant'::user_role_scope_enum
      AND ur.status = 'active'::user_role_status_enum
      AND ur.deleted_at IS NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_tenant_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_tenant_admin() FROM anon, public;

-- ── 2. get_tenant_admin_tenant_ids() ──────────────────────────────────────
-- Returns array of tenant_ids where the current user is a tenant admin.
-- Used in consolidated policies: tenant_id = ANY(get_tenant_admin_tenant_ids())
-- Replaces the repeated subquery:
--   SELECT ur.tenant_id FROM user_roles ur JOIN user_profiles up ON ...
--   WHERE up.user_id = auth.uid() AND ur.role = 'admin' AND ur.scope = 'tenant' ...
CREATE OR REPLACE FUNCTION public.get_tenant_admin_tenant_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(ur.tenant_id), '{}')
  FROM user_roles ur
  WHERE ur.user_profile_id = get_user_profile_id()
    AND ur.role = 'admin'::user_role_type_enum
    AND ur.scope = 'tenant'::user_role_scope_enum
    AND ur.status = 'active'::user_role_status_enum
    AND ur.deleted_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_tenant_admin_tenant_ids() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_tenant_admin_tenant_ids() FROM anon, public;

-- ── 3. get_client_ids_for_auth_user() ─────────────────────────────────────
-- Returns array of client IDs owned by the current auth user.
-- Client users have no user_roles entry; they are identified by clients.user_id.
-- Used in consolidated policies: client_id = ANY(get_client_ids_for_auth_user())
-- Replaces the repeated subquery:
--   SELECT c.id FROM clients c WHERE c.user_id = auth.uid() AND c.deleted_at IS NULL
CREATE OR REPLACE FUNCTION public.get_client_ids_for_auth_user()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(c.id), '{}')
  FROM clients c
  WHERE c.user_id = (SELECT auth.uid())
    AND c.deleted_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_client_ids_for_auth_user() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_client_ids_for_auth_user() FROM anon, public;

-- ── 4. get_promotor_profile_ids() ─────────────────────────────────────────
-- Returns the profile IDs for the current user if they have an active
-- promotor or asesor_de_ventas role. These are the field roles that match
-- against promotor_id / assigned_to columns in various tables.
-- Replaces the repeated subquery:
--   SELECT ur.user_profile_id FROM user_roles ur JOIN user_profiles up ON ...
--   WHERE up.user_id = auth.uid() AND ur.role IN ('promotor','asesor_de_ventas') ...
CREATE OR REPLACE FUNCTION public.get_promotor_profile_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(DISTINCT ur.user_profile_id), '{}')
  FROM user_roles ur
  WHERE ur.user_profile_id = get_user_profile_id()
    AND ur.role = ANY(ARRAY['promotor'::user_role_type_enum, 'asesor_de_ventas'::user_role_type_enum])
    AND ur.status = 'active'::user_role_status_enum
    AND ur.deleted_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_promotor_profile_ids() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_promotor_profile_ids() FROM anon, public;

COMMIT;

-- ============================================================================
-- ROLLBACK SQL
-- ============================================================================
--
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.is_tenant_admin();
-- DROP FUNCTION IF EXISTS public.get_tenant_admin_tenant_ids();
-- DROP FUNCTION IF EXISTS public.get_client_ids_for_auth_user();
-- DROP FUNCTION IF EXISTS public.get_promotor_profile_ids();
-- COMMIT;
