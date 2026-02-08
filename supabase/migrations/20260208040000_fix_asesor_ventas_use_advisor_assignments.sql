-- ============================================================================
-- Migration: Fix asesor_ventas policies to use advisor_client_assignments
-- ============================================================================
-- The Asesor de Ventas works with SPECIFIC clients assigned to them,
-- not all clients of a brand. The correct table is advisor_client_assignments.
-- ============================================================================

BEGIN;

-- Drop the previous policy and helper functions
DROP POLICY IF EXISTS "asesor_ventas_select_clients" ON clients;
DROP FUNCTION IF EXISTS public.client_belongs_to_brand(UUID, UUID);
DROP FUNCTION IF EXISTS public.get_asesor_ventas_brand_id();

-- Create helper function to check if client is assigned to the current asesor
CREATE OR REPLACE FUNCTION public.is_client_assigned_to_asesor(p_client_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_asesor_profile_id UUID;
BEGIN
    -- Get the current user's profile_id if they are an asesor_de_ventas
    SELECT up.id INTO v_asesor_profile_id
    FROM user_profiles up
    JOIN user_roles ur ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
    AND ur.role = 'asesor_de_ventas'
    AND ur.status = 'active'
    AND ur.deleted_at IS NULL
    LIMIT 1;

    IF v_asesor_profile_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if client is assigned to this asesor
    RETURN EXISTS (
        SELECT 1
        FROM advisor_client_assignments aca
        WHERE aca.advisor_id = v_asesor_profile_id
        AND aca.client_id = p_client_id
        AND aca.is_active = true
        AND aca.deleted_at IS NULL
    );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_client_assigned_to_asesor(UUID) TO authenticated;

-- Recreate policy using advisor_client_assignments
CREATE POLICY "asesor_ventas_select_clients"
ON clients
FOR SELECT
USING (
    deleted_at IS NULL
    AND public.is_client_assigned_to_asesor(id)
);

COMMIT;
