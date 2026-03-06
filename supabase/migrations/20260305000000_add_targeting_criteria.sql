-- Migration: Add targeting_criteria JSONB to promotions, surveys, brand_communication_plans
-- Purpose: Unified targeting/segmentation system for client and staff audiences

-- 1. Add targeting_criteria column to promotions
ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS targeting_criteria JSONB DEFAULT NULL;

ALTER TABLE promotions
  ADD CONSTRAINT promotions_targeting_criteria_is_object
  CHECK (targeting_criteria IS NULL OR jsonb_typeof(targeting_criteria) = 'object');

CREATE INDEX IF NOT EXISTS idx_promotions_targeting_criteria
  ON promotions USING GIN (targeting_criteria)
  WHERE targeting_criteria IS NOT NULL;

-- 2. Add targeting_criteria column to surveys
ALTER TABLE surveys
  ADD COLUMN IF NOT EXISTS targeting_criteria JSONB DEFAULT NULL;

ALTER TABLE surveys
  ADD CONSTRAINT surveys_targeting_criteria_is_object
  CHECK (targeting_criteria IS NULL OR jsonb_typeof(targeting_criteria) = 'object');

CREATE INDEX IF NOT EXISTS idx_surveys_targeting_criteria
  ON surveys USING GIN (targeting_criteria)
  WHERE targeting_criteria IS NOT NULL;

-- 3. Add targeting_criteria column to brand_communication_plans
ALTER TABLE brand_communication_plans
  ADD COLUMN IF NOT EXISTS targeting_criteria JSONB DEFAULT NULL;

ALTER TABLE brand_communication_plans
  ADD CONSTRAINT brand_communication_plans_targeting_criteria_is_object
  CHECK (targeting_criteria IS NULL OR jsonb_typeof(targeting_criteria) = 'object');

CREATE INDEX IF NOT EXISTS idx_brand_communication_plans_targeting_criteria
  ON brand_communication_plans USING GIN (targeting_criteria)
  WHERE targeting_criteria IS NOT NULL;
