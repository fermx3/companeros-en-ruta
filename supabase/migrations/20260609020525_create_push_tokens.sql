-- Push notification tokens for mobile apps (Expo Push API).
-- Each row maps an Expo push token to either a staff user (user_profile_id) or
-- a client portal user (client_id), matching the notifications table's
-- recipient model. Service-role inserts/updates these; users only read and
-- soft-deactivate (is_active=false) their own.

BEGIN;

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  device_id TEXT,
  -- 'client_mobile' = apps/client-mobile, 'staff_mobile' = apps/mobile.
  app_variant TEXT NOT NULL CHECK (app_variant IN ('client_mobile', 'staff_mobile')),
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Mirror notifications.notifications_has_recipient: exactly one recipient.
  CONSTRAINT push_tokens_has_recipient CHECK (
    (user_profile_id IS NOT NULL AND client_id IS NULL)
    OR (user_profile_id IS NULL AND client_id IS NOT NULL)
  ),
  -- A token is unique per app variant. The same physical device could in
  -- theory have both client and staff apps installed; the token differs per
  -- bundle id so this is safe.
  CONSTRAINT push_tokens_unique_per_app UNIQUE (expo_push_token, app_variant)
);

-- Indexes used by the push-dispatch path.
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_profile_active
  ON push_tokens (user_profile_id)
  WHERE user_profile_id IS NOT NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_push_tokens_client_active
  ON push_tokens (client_id)
  WHERE client_id IS NOT NULL AND is_active = true;

-- updated_at trigger (reuse the project's standard helper).
CREATE TRIGGER push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- SELECT: users see their own tokens (mirrors notifications_select_own).
DROP POLICY IF EXISTS push_tokens_select_own ON push_tokens;
CREATE POLICY push_tokens_select_own ON push_tokens
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      (
        user_profile_id IS NOT NULL
        AND user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
      )
      OR (
        client_id IS NOT NULL
        AND client_id IN (SELECT id FROM clients WHERE user_id = auth.uid() AND deleted_at IS NULL)
      )
    )
  );

-- UPDATE: users can update their own tokens (used for is_active toggle on
-- logout). Cannot move tokens across recipients.
DROP POLICY IF EXISTS push_tokens_update_own ON push_tokens;
CREATE POLICY push_tokens_update_own ON push_tokens
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      (
        user_profile_id IS NOT NULL
        AND user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
      )
      OR (
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
      OR (
        client_id IS NOT NULL
        AND client_id IN (SELECT id FROM clients WHERE user_id = auth.uid() AND deleted_at IS NULL)
      )
    )
  );

-- INSERT and DELETE are reserved for service-role (the
-- /api/device/register-token endpoint runs under the user's JWT but uses the
-- service client to upsert because the user's first registration needs to
-- happen even if no row exists yet for them).

COMMIT;
