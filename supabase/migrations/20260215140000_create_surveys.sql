-- =============================================================================
-- Survey System Migration
-- =============================================================================
-- Creates the full survey schema: enums, tables, indexes, RLS policies.
-- Workflow: Brand creates -> Admin approves -> Circulated to targeted respondents.

BEGIN;

-- =============================================================================
-- 1. Enums
-- =============================================================================

CREATE TYPE survey_status_enum AS ENUM (
  'draft',
  'pending_approval',
  'approved',
  'active',
  'closed',
  'archived'
);

CREATE TYPE survey_question_type_enum AS ENUM (
  'text',
  'number',
  'multiple_choice',
  'scale',
  'yes_no'
);

CREATE TYPE survey_target_role_enum AS ENUM (
  'promotor',
  'asesor_de_ventas',
  'client'
);

-- Add new notification types for survey workflow
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'survey_approved';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'survey_rejected';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'new_survey_pending';

-- =============================================================================
-- 2. Tables
-- =============================================================================

-- surveys: main survey entity
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(20) NOT NULL DEFAULT 'SRV-' || substr(gen_random_uuid()::text, 1, 8),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  brand_id UUID NOT NULL REFERENCES brands(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  survey_status survey_status_enum NOT NULL DEFAULT 'draft',
  target_roles survey_target_role_enum[] NOT NULL DEFAULT '{}',
  target_zone_ids UUID[] DEFAULT NULL,
  target_client_type_categories client_type_category_enum[] DEFAULT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  rejection_reason TEXT,
  max_responses_per_user INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT surveys_dates_check CHECK (end_date >= start_date)
);

-- survey_questions: questions belonging to a survey
CREATE TABLE survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(20) NOT NULL DEFAULT 'SQ-' || substr(gen_random_uuid()::text, 1, 8),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  question_text TEXT NOT NULL,
  question_type survey_question_type_enum NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  options JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- survey_responses: one per user per survey
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(20) NOT NULL DEFAULT 'SR-' || substr(gen_random_uuid()::text, 1, 8),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  respondent_id UUID NOT NULL REFERENCES user_profiles(id),
  respondent_role survey_target_role_enum NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT survey_responses_unique UNIQUE (survey_id, respondent_id)
);

-- survey_answers: individual answers per question per response
CREATE TABLE survey_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  answer_text TEXT,
  answer_number NUMERIC,
  answer_choice VARCHAR(255),
  answer_scale INTEGER,
  answer_boolean BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT survey_answers_unique UNIQUE (response_id, question_id)
);

-- =============================================================================
-- 3. Indexes
-- =============================================================================

CREATE INDEX idx_surveys_tenant_id ON surveys(tenant_id);
CREATE INDEX idx_surveys_brand_id ON surveys(brand_id);
CREATE INDEX idx_surveys_status ON surveys(survey_status);
CREATE INDEX idx_surveys_created_by ON surveys(created_by);
CREATE INDEX idx_surveys_dates ON surveys(start_date, end_date);

CREATE INDEX idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX idx_survey_questions_sort ON survey_questions(survey_id, sort_order);

CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_respondent ON survey_responses(respondent_id);

CREATE INDEX idx_survey_answers_response_id ON survey_answers(response_id);
CREATE INDEX idx_survey_answers_question_id ON survey_answers(question_id);

-- =============================================================================
-- 4. RLS
-- =============================================================================

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;

-- ----- SURVEYS -----

-- Brand managers: full CRUD on their brand's surveys
CREATE POLICY surveys_brand_select ON surveys
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      -- Brand managers see their brand's surveys
      brand_id IN (
        SELECT ur.brand_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
          AND ur.status = 'active'
          AND ur.role = 'brand_manager'
          AND ur.deleted_at IS NULL
      )
      -- Admins see all tenant surveys
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
          AND ur.status = 'active'
          AND ur.role = 'admin'
          AND ur.deleted_at IS NULL
      )
      -- Respondents see active surveys that target their role and are in date range
      OR (
        survey_status = 'active'
        AND deleted_at IS NULL
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE
      )
    )
  );

CREATE POLICY surveys_brand_insert ON surveys
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND brand_id IN (
      SELECT ur.brand_id FROM user_roles ur
      JOIN user_profiles up ON ur.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
        AND ur.status = 'active'
        AND ur.role = 'brand_manager'
        AND ur.deleted_at IS NULL
    )
  );

CREATE POLICY surveys_brand_update ON surveys
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      -- Brand managers update their own brand's surveys
      brand_id IN (
        SELECT ur.brand_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
          AND ur.status = 'active'
          AND ur.role = 'brand_manager'
          AND ur.deleted_at IS NULL
      )
      -- Admins can update any survey in tenant (for approval)
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

-- ----- SURVEY QUESTIONS -----

CREATE POLICY survey_questions_select ON survey_questions
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
  );

CREATE POLICY survey_questions_insert ON survey_questions
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND survey_id IN (
      SELECT s.id FROM surveys s
      WHERE s.survey_status = 'draft'
        AND s.brand_id IN (
          SELECT ur.brand_id FROM user_roles ur
          JOIN user_profiles up ON ur.user_profile_id = up.id
          WHERE up.user_id = auth.uid()
            AND ur.status = 'active'
            AND ur.role = 'brand_manager'
            AND ur.deleted_at IS NULL
        )
    )
  );

CREATE POLICY survey_questions_update ON survey_questions
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND survey_id IN (
      SELECT s.id FROM surveys s
      WHERE s.survey_status = 'draft'
        AND s.brand_id IN (
          SELECT ur.brand_id FROM user_roles ur
          JOIN user_profiles up ON ur.user_profile_id = up.id
          WHERE up.user_id = auth.uid()
            AND ur.status = 'active'
            AND ur.role = 'brand_manager'
            AND ur.deleted_at IS NULL
        )
    )
  );

CREATE POLICY survey_questions_delete ON survey_questions
  FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND survey_id IN (
      SELECT s.id FROM surveys s
      WHERE s.survey_status = 'draft'
        AND s.brand_id IN (
          SELECT ur.brand_id FROM user_roles ur
          JOIN user_profiles up ON ur.user_profile_id = up.id
          WHERE up.user_id = auth.uid()
            AND ur.status = 'active'
            AND ur.role = 'brand_manager'
            AND ur.deleted_at IS NULL
        )
    )
  );

-- ----- SURVEY RESPONSES -----

CREATE POLICY survey_responses_select ON survey_responses
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      -- Own responses
      respondent_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
      -- Brand managers see responses for their brand's surveys
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
      -- Admins see all
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

CREATE POLICY survey_responses_insert ON survey_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND respondent_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- ----- SURVEY ANSWERS -----

CREATE POLICY survey_answers_select ON survey_answers
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      -- Own answers
      response_id IN (
        SELECT sr.id FROM survey_responses sr
        WHERE sr.respondent_id IN (
          SELECT id FROM user_profiles WHERE user_id = auth.uid()
        )
      )
      -- Brand managers
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
      -- Admins
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

CREATE POLICY survey_answers_insert ON survey_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND response_id IN (
      SELECT sr.id FROM survey_responses sr
      WHERE sr.respondent_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- =============================================================================
-- 5. Updated_at trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION update_surveys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_surveys_updated_at();

CREATE TRIGGER trigger_survey_questions_updated_at
  BEFORE UPDATE ON survey_questions
  FOR EACH ROW EXECUTE FUNCTION update_surveys_updated_at();

COMMIT;
