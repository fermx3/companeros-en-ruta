-- ============================================================================
-- Migration: Rename promotor_client_assignments → client_assignments
-- ============================================================================
-- This makes the table generic for any role that needs client assignments
-- (promotor, asesor_de_ventas, supervisor, etc.)
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: Clean up broken objects from previous migration attempt
-- ============================================================================

-- Drop broken policy on clients (references non-existent table)
DROP POLICY IF EXISTS "asesor_ventas_select_clients" ON clients;

-- Drop broken functions from previous migration
DROP FUNCTION IF EXISTS public.is_client_assigned_to_asesor(UUID);
DROP FUNCTION IF EXISTS public.client_belongs_to_brand(UUID, UUID);
DROP FUNCTION IF EXISTS public.get_asesor_ventas_brand_id();

-- ============================================================================
-- PHASE 2: Drop existing policies on promotor_client_assignments
-- ============================================================================

DROP POLICY IF EXISTS "Admin and brand managers can manage client assignments" ON promotor_client_assignments;
DROP POLICY IF EXISTS "Promotors can view their assigned clients" ON promotor_client_assignments;

-- ============================================================================
-- PHASE 3: Remove default before dropping function
-- ============================================================================

ALTER TABLE promotor_client_assignments ALTER COLUMN public_id DROP DEFAULT;

-- Drop old function
DROP FUNCTION IF EXISTS generate_promotor_client_assignment_public_id();

-- ============================================================================
-- PHASE 4: Rename table and column
-- ============================================================================

ALTER TABLE promotor_client_assignments RENAME TO client_assignments;
ALTER TABLE client_assignments RENAME COLUMN promotor_id TO user_profile_id;

-- Update comments
COMMENT ON TABLE client_assignments IS 'Assignment of specific clients to users (promotors, asesores, supervisors)';
COMMENT ON COLUMN client_assignments.user_profile_id IS 'The user_profile.id of the assigned user';

-- ============================================================================
-- PHASE 5: Create new public_id generator function
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_client_assignment_public_id()
RETURNS character varying
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'CLA-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM client_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;

-- Set default
ALTER TABLE client_assignments ALTER COLUMN public_id SET DEFAULT generate_client_assignment_public_id();

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_client_assignment_public_id() TO anon, authenticated, service_role;

-- ============================================================================
-- PHASE 6: Update indexes (rename to match new table name)
-- ============================================================================

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_promotor_client_assignments_promotor_id;
DROP INDEX IF EXISTS idx_promotor_client_assignments_client_id;
DROP INDEX IF EXISTS idx_promotor_client_assignments_brand_id;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_client_assignments_user_profile_id
ON client_assignments(user_profile_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_client_assignments_client_id
ON client_assignments(client_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_client_assignments_brand_id
ON client_assignments(brand_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_client_assignments_active
ON client_assignments(user_profile_id, client_id)
WHERE is_active = true AND deleted_at IS NULL;

-- ============================================================================
-- PHASE 7: Create new RLS policies for client_assignments
-- ============================================================================

-- Admins and brand managers can manage all assignments
CREATE POLICY "admins_manage_client_assignments"
ON client_assignments
USING (
    tenant_id IN (
        SELECT ur.tenant_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role IN ('admin', 'brand_manager')
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

-- Users can view their own assignments (promotors, asesores, supervisors)
CREATE POLICY "users_view_own_client_assignments"
ON client_assignments
FOR SELECT
USING (
    user_profile_id IN (
        SELECT up.id FROM user_profiles up
        WHERE up.user_id = auth.uid()
        AND up.deleted_at IS NULL
    )
);

-- ============================================================================
-- PHASE 8: Create helper function for client visibility check
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_client_assigned_to_user(p_client_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_profile_id UUID;
BEGIN
    -- Get the current user's profile_id
    SELECT id INTO v_user_profile_id
    FROM user_profiles
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
    LIMIT 1;

    IF v_user_profile_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if client is assigned to this user
    RETURN EXISTS (
        SELECT 1
        FROM client_assignments ca
        WHERE ca.user_profile_id = v_user_profile_id
        AND ca.client_id = p_client_id
        AND ca.is_active = true
        AND ca.deleted_at IS NULL
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_client_assigned_to_user(UUID) TO authenticated;

-- ============================================================================
-- PHASE 9: Create RLS policy for asesor_de_ventas to see their assigned clients
-- ============================================================================

CREATE POLICY "asesor_ventas_select_clients"
ON clients
FOR SELECT
USING (
    deleted_at IS NULL
    AND public.is_client_assigned_to_user(id)
);

-- ============================================================================
-- PHASE 10: Update foreign key constraint names (optional but cleaner)
-- ============================================================================

-- Note: Foreign keys are automatically preserved during rename
-- Just updating constraint names for clarity is optional

COMMIT;

-- ============================================================================
-- Summary:
-- 1. Cleaned up broken objects from previous migrations
-- 2. Renamed promotor_client_assignments → client_assignments
-- 3. Renamed promotor_id → user_profile_id
-- 4. Updated generator function to CLA-XXXX format
-- 5. Created generic RLS policies for any role
-- 6. Created helper function for client visibility
-- 7. Fixed asesor_ventas_select_clients policy
-- ============================================================================
