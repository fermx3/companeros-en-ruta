-- ============================================================================
-- Migration: Fix infinite recursion in asesor_ventas_select_clients policy (v2)
-- ============================================================================
-- Root cause: The asesor_ventas_select_clients policy queries client_brand_memberships,
-- which has RLS policies that query clients table, creating an infinite loop.
--
-- Solution: Create a SECURITY DEFINER function that bypasses RLS to check
-- client membership without triggering client RLS policies.
-- ============================================================================

BEGIN;

-- Drop the problematic policy
DROP POLICY IF EXISTS "asesor_ventas_select_clients" ON clients;

-- Create a helper function that checks if a client belongs to a brand
-- This runs as SECURITY DEFINER to bypass RLS on client_brand_memberships
CREATE OR REPLACE FUNCTION public.client_belongs_to_brand(
    p_client_id UUID,
    p_brand_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM client_brand_memberships cbm
        WHERE cbm.client_id = p_client_id
        AND cbm.brand_id = p_brand_id
        AND cbm.deleted_at IS NULL
    );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.client_belongs_to_brand(UUID, UUID) TO authenticated;

-- Create helper function to get asesor's brand_id without causing recursion
CREATE OR REPLACE FUNCTION public.get_asesor_ventas_brand_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_brand_id UUID;
BEGIN
    SELECT ur.brand_id INTO v_brand_id
    FROM user_roles ur
    JOIN user_profiles up ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
    AND ur.role = 'asesor_de_ventas'
    AND ur.status = 'active'
    AND ur.deleted_at IS NULL
    LIMIT 1;

    RETURN v_brand_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_asesor_ventas_brand_id() TO authenticated;

-- Recreate policy using the helper functions to avoid recursion
CREATE POLICY "asesor_ventas_select_clients"
ON clients
FOR SELECT
USING (
    deleted_at IS NULL
    AND public.client_belongs_to_brand(id, public.get_asesor_ventas_brand_id())
);

COMMIT;
