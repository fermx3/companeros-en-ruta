-- Migration: Add RLS policy for clients to view active promotions
-- Created: 2026-02-13
-- Description: Allow clients to view active promotions from brands they have memberships with

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Clients can view active promotions from their brands" ON promotions;

-- Create policy for clients to view promotions
CREATE POLICY "Clients can view active promotions from their brands"
ON promotions
FOR SELECT
TO authenticated
USING (
  -- Allow if user is a client with active membership to this brand
  EXISTS (
    SELECT 1
    FROM clients c
    INNER JOIN client_brand_memberships cbm ON cbm.client_id = c.id
    WHERE c.user_id = auth.uid()
      AND cbm.brand_id = promotions.brand_id
      AND cbm.membership_status = 'active'
      AND cbm.deleted_at IS NULL
  )
  OR
  -- Allow if user has admin or brand_manager role (existing access)
  EXISTS (
    SELECT 1
    FROM user_profiles up
    INNER JOIN user_roles ur ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
      AND ur.status = 'active'
      AND ur.role IN ('admin', 'brand_manager')
  )
);

-- Add comment
COMMENT ON POLICY "Clients can view active promotions from their brands" ON promotions IS 
'Allows clients to view promotions from brands they have active memberships with, and allows admins/brand managers to view all promotions';
