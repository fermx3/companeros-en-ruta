-- Create notifications table for in-app notifications (REQ-080/081)
-- All roles receive notifications. Created server-side only (no INSERT policy for authenticated).

BEGIN;

-- =============================================================================
-- 1. Enum type for notification categories
-- =============================================================================

CREATE TYPE notification_type_enum AS ENUM (
  'promotion_approved',
  'promotion_rejected',
  'new_promotion',
  'visit_completed',
  'order_created',
  'qr_redeemed',
  'tier_upgrade',
  'survey_assigned',
  'system'
);

-- =============================================================================
-- 2. Notifications table
-- =============================================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type notification_type_enum NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- =============================================================================
-- 3. Indexes
-- =============================================================================

CREATE INDEX idx_notifications_user_profile_id ON notifications(user_profile_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_profile_id, is_read) WHERE is_read = false AND deleted_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================================================
-- 4. Updated_at trigger (reuse existing pattern)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- =============================================================================
-- 5. RLS policies
-- =============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT their own notifications within their tenant
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND user_profile_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Users can only UPDATE (mark as read) their own notifications
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND user_profile_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND user_profile_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- No INSERT/DELETE policies for authenticated — notifications are created/deleted server-side only

-- =============================================================================
-- 6. Enable Realtime
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

COMMIT;
