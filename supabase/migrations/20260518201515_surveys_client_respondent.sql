-- =============================================================================
-- Allow clients to submit survey responses
-- =============================================================================
-- Today `survey_responses.respondent_id` is `NOT NULL REFERENCES user_profiles`,
-- which excludes clients (clients live in `clients`, not `user_profiles`).
-- This migration adds a parallel `client_id` column so a response can come
-- from either a user_profile (staff) OR a client (final customer), enforced
-- by a check constraint. RLS policies on survey_responses and survey_answers
-- are extended so a client sees and writes their own rows.

BEGIN;

-- ----- 1. Schema -----

ALTER TABLE survey_responses
  ALTER COLUMN respondent_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

-- Exactly one of (respondent_id, client_id) must be set.
ALTER TABLE survey_responses
  DROP CONSTRAINT IF EXISTS survey_responses_respondent_or_client_check;
ALTER TABLE survey_responses
  ADD CONSTRAINT survey_responses_respondent_or_client_check
  CHECK (
    (respondent_id IS NOT NULL AND client_id IS NULL)
    OR (respondent_id IS NULL AND client_id IS NOT NULL)
  );

-- Replace the old composite-unique with two partial indexes, one per
-- respondent type. This keeps the "one response per user per survey"
-- guarantee while letting both columns be nullable.
ALTER TABLE survey_responses
  DROP CONSTRAINT IF EXISTS survey_responses_unique;

CREATE UNIQUE INDEX IF NOT EXISTS survey_responses_user_unique
  ON survey_responses (survey_id, respondent_id)
  WHERE respondent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS survey_responses_client_unique
  ON survey_responses (survey_id, client_id)
  WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_survey_responses_client
  ON survey_responses (client_id)
  WHERE client_id IS NOT NULL;

-- ----- 2. RLS policies -----

-- survey_responses SELECT: existing tiers (own / brand manager / admin) plus
-- the client tier — a client sees the rows where client_id matches the
-- client linked to their auth user.
DROP POLICY IF EXISTS survey_responses_select ON survey_responses;
CREATE POLICY survey_responses_select ON survey_responses
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      respondent_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
      OR client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
      OR survey_id IN (
        SELECT s.id FROM surveys s
        WHERE s.brand_id IN (
          SELECT ur.brand_id FROM user_roles ur
          JOIN user_profiles up ON ur.user_profile_id = up.id
          WHERE up.user_id = auth.uid()
            AND ur.status = 'active'
            AND ur.role = 'brand_manager'
            AND ur.deleted_at IS NULL
        )
      )
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
          AND ur.status = 'active'
          AND ur.role = 'admin'
          AND ur.deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS survey_responses_insert ON survey_responses;
CREATE POLICY survey_responses_insert ON survey_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      respondent_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
      OR client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

-- survey_answers SELECT/INSERT: same idea — the response can be owned via
-- either respondent_id or client_id.
DROP POLICY IF EXISTS survey_answers_select ON survey_answers;
CREATE POLICY survey_answers_select ON survey_answers
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      response_id IN (
        SELECT sr.id FROM survey_responses sr
        WHERE sr.respondent_id IN (
          SELECT id FROM user_profiles WHERE user_id = auth.uid()
        )
        OR sr.client_id IN (
          SELECT id FROM clients WHERE user_id = auth.uid()
        )
      )
      OR response_id IN (
        SELECT sr.id FROM survey_responses sr
        JOIN surveys s ON sr.survey_id = s.id
        WHERE s.brand_id IN (
          SELECT ur.brand_id FROM user_roles ur
          JOIN user_profiles up ON ur.user_profile_id = up.id
          WHERE up.user_id = auth.uid()
            AND ur.status = 'active'
            AND ur.role = 'brand_manager'
            AND ur.deleted_at IS NULL
        )
      )
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
          AND ur.status = 'active'
          AND ur.role = 'admin'
          AND ur.deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS survey_answers_insert ON survey_answers;
CREATE POLICY survey_answers_insert ON survey_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND response_id IN (
      SELECT sr.id FROM survey_responses sr
      WHERE sr.respondent_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
      OR sr.client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

COMMIT;
