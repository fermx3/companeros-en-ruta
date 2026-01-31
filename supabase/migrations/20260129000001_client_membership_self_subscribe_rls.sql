-- Migration: Allow clients to self-subscribe to brands (pending status only)
-- This adds RLS policies for clients to request brand memberships

-- Policy: Clients can insert their own membership requests with pending status
CREATE POLICY "clients_can_request_membership"
ON public.client_brand_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  -- The client_id must match the authenticated user's client record
  client_id IN (
    SELECT id FROM public.clients
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
  )
  -- Only allow pending status for self-subscription
  AND membership_status = 'pending'
  -- Brand must be in the same tenant as the client
  AND brand_id IN (
    SELECT b.id FROM public.brands b
    JOIN public.clients c ON c.tenant_id = b.tenant_id
    WHERE c.user_id = auth.uid()
    AND c.deleted_at IS NULL
    AND b.deleted_at IS NULL
    AND b.status = 'active'
  )
);

-- Policy: Clients can read their own memberships
CREATE POLICY "clients_can_read_own_memberships"
ON public.client_brand_memberships
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- Add comment for documentation
COMMENT ON POLICY "clients_can_request_membership" ON public.client_brand_memberships IS
'Allows authenticated clients to request membership to brands in their tenant. Status is always pending.';

COMMENT ON POLICY "clients_can_read_own_memberships" ON public.client_brand_memberships IS
'Allows authenticated clients to read their own membership records.';
