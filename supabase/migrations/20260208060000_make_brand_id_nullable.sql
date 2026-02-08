-- ============================================================================
-- Migration: Make brand_id nullable in client_assignments
-- ============================================================================
-- This allows the table to support both:
-- - Promotor: Works for a specific brand (brand_id NOT NULL)
-- - Asesor de Ventas: Works for a distributor (brand_id can be NULL)
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: Drop the old unique index that includes brand_id
-- ============================================================================
-- The index was originally created as unique_active_advisor_client_assignment
-- on (advisor_id, client_id, brand_id). Even after table/column renames,
-- the index name remains the same.

DROP INDEX IF EXISTS unique_active_advisor_client_assignment;
DROP INDEX IF EXISTS unique_active_promotor_client_assignment;

-- ============================================================================
-- PHASE 2: Make brand_id nullable
-- ============================================================================

ALTER TABLE client_assignments ALTER COLUMN brand_id DROP NOT NULL;

-- ============================================================================
-- PHASE 3: Create new unique index on (user_profile_id, client_id) only
-- ============================================================================
-- Business rule: A user can only be assigned once to the same client,
-- regardless of brand.

CREATE UNIQUE INDEX unique_active_client_assignment
ON client_assignments (user_profile_id, client_id)
WHERE is_active = true AND deleted_at IS NULL;

-- ============================================================================
-- PHASE 4: Update index on brand_id to handle NULLs properly
-- ============================================================================
-- The existing idx_client_assignments_brand_id should still work fine with NULLs

-- Add a comment explaining the nullable brand_id
COMMENT ON COLUMN client_assignments.brand_id IS
'Optional brand association. NULL for asesor_de_ventas (distributor-based), NOT NULL for promotors (brand-based).';

COMMIT;

-- ============================================================================
-- Summary:
-- 1. Dropped old unique index unique_active_advisor_client_assignment
-- 2. Made brand_id nullable to support asesor_de_ventas role
-- 3. Created new unique index on (user_profile_id, client_id) only
-- 4. Added documentation comment for the column
-- ============================================================================
