-- =============================================================================
-- Migration: Add survey sections + new columns on survey_questions
-- Phase 1: survey_sections table with RLS, indexes, trigger
-- Phase 2: section_id + input_attributes columns on survey_questions
-- =============================================================================

-- =============================================================================
-- PHASE 1: survey_sections table
-- =============================================================================

CREATE TABLE public.survey_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visibility_condition JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_survey_sections_survey_id ON public.survey_sections(survey_id);
CREATE INDEX idx_survey_sections_sort ON public.survey_sections(survey_id, sort_order);
CREATE INDEX idx_survey_sections_tenant_id ON public.survey_sections(tenant_id);

-- Enable RLS
ALTER TABLE public.survey_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies (same pattern as survey_questions)

-- SELECT: All tenant users can view sections
CREATE POLICY survey_sections_select ON public.survey_sections
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
  );

-- INSERT: Brand managers (draft only) + admins (draft/pending_approval)
CREATE POLICY survey_sections_insert ON public.survey_sections
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      -- Brand manager: only on draft surveys they own
      survey_id IN (
        SELECT s.id FROM public.surveys s
        WHERE s.survey_status = 'draft'::public.survey_status_enum
          AND s.brand_id IN (
            SELECT ur.brand_id FROM public.user_roles ur
            JOIN public.user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
              AND ur.status = 'active'::public.user_role_status_enum
              AND ur.role = 'brand_manager'::public.user_role_type_enum
              AND ur.deleted_at IS NULL
          )
      )
      OR
      -- Tenant admin: on draft or pending_approval surveys
      (
        public.is_tenant_admin()
        AND survey_id IN (
          SELECT s.id FROM public.surveys s
          WHERE s.survey_status IN ('draft'::public.survey_status_enum, 'pending_approval'::public.survey_status_enum)
        )
      )
    )
  );

-- UPDATE: Brand managers (draft only) + admins (draft/pending_approval)
CREATE POLICY survey_sections_update ON public.survey_sections
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      survey_id IN (
        SELECT s.id FROM public.surveys s
        WHERE s.survey_status = 'draft'::public.survey_status_enum
          AND s.brand_id IN (
            SELECT ur.brand_id FROM public.user_roles ur
            JOIN public.user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
              AND ur.status = 'active'::public.user_role_status_enum
              AND ur.role = 'brand_manager'::public.user_role_type_enum
              AND ur.deleted_at IS NULL
          )
      )
      OR
      (
        public.is_tenant_admin()
        AND survey_id IN (
          SELECT s.id FROM public.surveys s
          WHERE s.survey_status IN ('draft'::public.survey_status_enum, 'pending_approval'::public.survey_status_enum)
        )
      )
    )
  );

-- DELETE: Brand managers (draft only) + admins (draft/pending_approval)
CREATE POLICY survey_sections_delete ON public.survey_sections
  FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND (
      survey_id IN (
        SELECT s.id FROM public.surveys s
        WHERE s.survey_status = 'draft'::public.survey_status_enum
          AND s.brand_id IN (
            SELECT ur.brand_id FROM public.user_roles ur
            JOIN public.user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
              AND ur.status = 'active'::public.user_role_status_enum
              AND ur.role = 'brand_manager'::public.user_role_type_enum
              AND ur.deleted_at IS NULL
          )
      )
      OR
      (
        public.is_tenant_admin()
        AND survey_id IN (
          SELECT s.id FROM public.surveys s
          WHERE s.survey_status IN ('draft'::public.survey_status_enum, 'pending_approval'::public.survey_status_enum)
        )
      )
    )
  );

-- Trigger: reuse update_surveys_updated_at() for updated_at
CREATE TRIGGER trigger_survey_sections_updated_at
  BEFORE UPDATE ON public.survey_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_surveys_updated_at();

-- =============================================================================
-- PHASE 2: New columns on survey_questions
-- =============================================================================

-- FK to section (nullable — backward compatible)
ALTER TABLE public.survey_questions
  ADD COLUMN section_id UUID REFERENCES public.survey_sections(id) ON DELETE SET NULL;

-- HTML input attributes (placeholder, maxLength, max, count, prefix, suffix)
ALTER TABLE public.survey_questions
  ADD COLUMN input_attributes JSONB DEFAULT NULL;

CREATE INDEX idx_survey_questions_section_id ON public.survey_questions(section_id);
