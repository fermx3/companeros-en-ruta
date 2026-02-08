-- ============================================================================
-- Migration: Fix infinite recursion in asesor_ventas_select_clients policy
-- ============================================================================
-- The original policy had a self-referencing subquery:
--   SELECT c.id FROM clients c JOIN client_brand_memberships cbm...
-- This causes infinite recursion because querying clients triggers the same
-- policy, which queries clients again.
--
-- Fix: Query client_brand_memberships.client_id directly without joining back
-- to the clients table within the policy.
-- ============================================================================

BEGIN;

-- Drop the problematic policy
DROP POLICY IF EXISTS "asesor_ventas_select_clients" ON clients;

-- Recreate with fixed query (no self-reference to clients table)
CREATE POLICY "asesor_ventas_select_clients"
ON clients
FOR SELECT
USING (
    deleted_at IS NULL
    AND id IN (
        SELECT cbm.client_id
        FROM client_brand_memberships cbm
        WHERE cbm.brand_id IN (
            SELECT ur.brand_id
            FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role = 'asesor_de_ventas'
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND cbm.deleted_at IS NULL
    )
);

COMMIT;
