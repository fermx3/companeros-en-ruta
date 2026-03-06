-- Add client_id support to notifications table
-- Client users don't have user_profiles entries, so notifications
-- must support targeting them via client_id directly.

BEGIN;

-- 1. Add client_id column (nullable FK to clients)
ALTER TABLE notifications ADD COLUMN client_id UUID REFERENCES clients(id);

-- 2. Make user_profile_id nullable (was NOT NULL)
ALTER TABLE notifications ALTER COLUMN user_profile_id DROP NOT NULL;

-- 3. Ensure at least one recipient is always set
ALTER TABLE notifications ADD CONSTRAINT notifications_has_recipient
  CHECK (user_profile_id IS NOT NULL OR client_id IS NOT NULL);

-- 4. Index for client notification lookups
CREATE INDEX idx_notifications_client_unread
  ON notifications(client_id, is_read)
  WHERE client_id IS NOT NULL AND is_read = false AND deleted_at IS NULL;

-- 5. Update RLS policies to support client_id
-- Drop existing policies (last defined in 20260221100000_fix_auth_rls_initplan.sql)
DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      (
        user_profile_id IS NOT NULL
        AND user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
      )
      OR
      (
        client_id IS NOT NULL
        AND client_id IN (SELECT id FROM clients WHERE user_id = auth.uid() AND deleted_at IS NULL)
      )
    )
  );

DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      (
        user_profile_id IS NOT NULL
        AND user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
      )
      OR
      (
        client_id IS NOT NULL
        AND client_id IN (SELECT id FROM clients WHERE user_id = auth.uid() AND deleted_at IS NULL)
      )
    )
  )
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      (
        user_profile_id IS NOT NULL
        AND user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
      )
      OR
      (
        client_id IS NOT NULL
        AND client_id IN (SELECT id FROM clients WHERE user_id = auth.uid() AND deleted_at IS NULL)
      )
    )
  );

COMMIT;
