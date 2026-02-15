-- FINDING-001: Fix hardcoded tenant UUID in RLS policies
--
-- Three policies (brands_tenant_access, clients_tenant_access, user_profiles_tenant_access)
-- use a hardcoded UUID for tenant filtering, blocking multi-tenancy entirely.
--
-- This migration:
-- 1. Creates get_user_tenant_ids() — a SECURITY DEFINER function that resolves
--    the current user's tenant IDs dynamically from 3 sources
-- 2. Replaces all 3 policies to use the function instead of the hardcoded UUID

BEGIN;

-- =============================================================================
-- 1. Create helper function: get_user_tenant_ids()
-- =============================================================================
-- SECURITY DEFINER: bypasses RLS so we can query user_profiles without
-- circular dependency (user_profiles policy cannot query user_profiles via RLS).
-- This pattern is already established in this codebase (is_client_assigned_to_asesor).

CREATE OR REPLACE FUNCTION public.get_user_tenant_ids()
RETURNS SETOF uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    -- Branch 1: Staff users — have entries in user_roles
    SELECT DISTINCT up.tenant_id
    FROM user_profiles up
    JOIN user_roles ur ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
      AND ur.status = 'active'
      AND ur.deleted_at IS NULL

    UNION

    -- Branch 2: Client users — have entries in clients (no user_roles entry)
    SELECT DISTINCT c.tenant_id
    FROM clients c
    WHERE c.user_id = auth.uid()

    UNION

    -- Branch 3: New users — profile exists but no roles or client record yet
    SELECT DISTINCT up2.tenant_id
    FROM user_profiles up2
    WHERE up2.user_id = auth.uid();
END;
$$;

-- Only authenticated users can call this function
GRANT EXECUTE ON FUNCTION public.get_user_tenant_ids() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_ids() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_ids() FROM public;

-- =============================================================================
-- 2. Replace brands_tenant_access policy
-- =============================================================================
DROP POLICY IF EXISTS "brands_tenant_access" ON "public"."brands";

CREATE POLICY "brands_tenant_access"
  ON "public"."brands"
  FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.get_user_tenant_ids()));

-- =============================================================================
-- 3. Replace clients_tenant_access policy
-- =============================================================================
DROP POLICY IF EXISTS "clients_tenant_access" ON "public"."clients";

CREATE POLICY "clients_tenant_access"
  ON "public"."clients"
  FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.get_user_tenant_ids()));

-- =============================================================================
-- 4. Replace user_profiles_tenant_access policy
-- =============================================================================
DROP POLICY IF EXISTS "user_profiles_tenant_access" ON "public"."user_profiles";

CREATE POLICY "user_profiles_tenant_access"
  ON "public"."user_profiles"
  FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.get_user_tenant_ids()));

COMMIT;
