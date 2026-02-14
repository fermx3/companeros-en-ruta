-- Migration: Extend Visit Assessments with Stage Tracking
-- Description: Add stage-specific fields and enums to visit_assessments
-- Dependencies: visits, brand_communication_plans tables

-- ============================================================================
-- TYPE: why_not_buying_reason
-- Description: Reasons why client didn't make a purchase
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE "public"."why_not_buying_reason" AS ENUM (
        'lack_of_budget',
        'low_turnover',
        'sufficient_inventory',
        'prefers_other_brand',
        'distributor_issues',
        'not_applicable'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE "public"."why_not_buying_reason" IS 'Razones por las que el cliente no compró';

-- ============================================================================
-- TYPE: compliance_level
-- Description: Level of compliance with communication plan
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE "public"."compliance_level" AS ENUM (
        'full',
        'partial',
        'non_compliant'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE "public"."compliance_level" IS 'Nivel de cumplimiento del plan de comunicación';

-- ============================================================================
-- TABLE: visit_stage_assessments
-- Description: Visit-level assessment tracking (separate from product assessments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."visit_stage_assessments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "public_id" VARCHAR(20) UNIQUE,
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "visit_id" UUID NOT NULL REFERENCES "public"."visits"("id") ON DELETE CASCADE,

    -- Foreign keys
    "communication_plan_id" UUID REFERENCES "public"."brand_communication_plans"("id") ON DELETE SET NULL,

    -- Stage 1: Pricing & Category Audit
    "pricing_audit_notes" TEXT,
    "competitor_analysis_notes" TEXT,
    "stage1_completed_at" TIMESTAMPTZ,

    -- Stage 2: Purchase & Inventory
    "has_inventory" BOOLEAN DEFAULT false,
    "has_purchase_order" BOOLEAN DEFAULT false,
    "purchase_order_number" VARCHAR(100),
    "order_id" UUID REFERENCES "public"."orders"("id") ON DELETE SET NULL,
    "why_not_buying" "public"."why_not_buying_reason",
    "purchase_inventory_notes" TEXT,
    "stage2_completed_at" TIMESTAMPTZ,

    -- Stage 3: Communication & POP
    "communication_compliance" "public"."compliance_level",
    "pop_execution_notes" TEXT,
    "stage3_completed_at" TIMESTAMPTZ,

    -- Overall completion
    "all_stages_completed" BOOLEAN DEFAULT false,
    "completed_at" TIMESTAMPTZ,

    -- Timestamps
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "deleted_at" TIMESTAMPTZ,

    -- One assessment per visit
    CONSTRAINT "uq_visit_stage_assessment" UNIQUE ("visit_id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_visit_stage_assessments_visit_id ON "public"."visit_stage_assessments"("visit_id");
CREATE INDEX IF NOT EXISTS idx_visit_stage_assessments_tenant_id ON "public"."visit_stage_assessments"("tenant_id");
CREATE INDEX IF NOT EXISTS idx_visit_stage_assessments_plan_id ON "public"."visit_stage_assessments"("communication_plan_id");
CREATE INDEX IF NOT EXISTS idx_visit_stage_assessments_order_id ON "public"."visit_stage_assessments"("order_id");
CREATE INDEX IF NOT EXISTS idx_visit_stage_assessments_completed ON "public"."visit_stage_assessments"("all_stages_completed");

-- Comments
COMMENT ON TABLE "public"."visit_stage_assessments" IS 'Evaluación de visita por stages (3 secciones del wizard)';
COMMENT ON COLUMN "public"."visit_stage_assessments"."pricing_audit_notes" IS 'Notas de auditoría de precios (Stage 1)';
COMMENT ON COLUMN "public"."visit_stage_assessments"."purchase_inventory_notes" IS 'Notas de compra e inventario (Stage 2)';
COMMENT ON COLUMN "public"."visit_stage_assessments"."pop_execution_notes" IS 'Notas de ejecución POP (Stage 3)';
COMMENT ON COLUMN "public"."visit_stage_assessments"."why_not_buying" IS 'Razón por la que no se hizo compra';
COMMENT ON COLUMN "public"."visit_stage_assessments"."communication_compliance" IS 'Nivel de cumplimiento del plan de comunicación';

-- ============================================================================
-- Function: Generate public_id for visit_stage_assessments
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."generate_visit_stage_assessment_public_id"()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR(20);
    counter INTEGER := 0;
BEGIN
    LOOP
        new_id := 'VSA-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM "public"."visit_stage_assessments" WHERE public_id = new_id);
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique public_id after 100 attempts';
        END IF;
    END LOOP;
    RETURN new_id;
END;
$$;

-- Set default for public_id
ALTER TABLE "public"."visit_stage_assessments"
    ALTER COLUMN "public_id" SET DEFAULT "public"."generate_visit_stage_assessment_public_id"();

-- ============================================================================
-- Trigger: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."update_visit_stage_assessments_updated_at"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();

    -- Auto-set all_stages_completed when all stages are done
    IF NEW.stage1_completed_at IS NOT NULL
       AND NEW.stage2_completed_at IS NOT NULL
       AND NEW.stage3_completed_at IS NOT NULL
       AND NEW.all_stages_completed = false THEN
        NEW.all_stages_completed = true;
        NEW.completed_at = now();
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER "trigger_visit_stage_assessments_updated_at"
    BEFORE UPDATE ON "public"."visit_stage_assessments"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_visit_stage_assessments_updated_at"();

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE "public"."visit_stage_assessments" ENABLE ROW LEVEL SECURITY;

-- Policy: visit_stage_assessments - tenant isolation
CREATE POLICY "visit_stage_assessments_tenant_isolation" ON "public"."visit_stage_assessments"
    FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM "public"."user_profiles"
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM "public"."user_profiles"
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Promotor can manage their own visit assessments
CREATE POLICY "visit_stage_assessments_promotor_own" ON "public"."visit_stage_assessments"
    FOR ALL
    USING (
        visit_id IN (
            SELECT v.id FROM "public"."visits" v
            JOIN "public"."user_profiles" up ON v.promotor_id = up.id
            WHERE up.user_id = auth.uid()
        )
    )
    WITH CHECK (
        visit_id IN (
            SELECT v.id FROM "public"."visits" v
            JOIN "public"."user_profiles" up ON v.promotor_id = up.id
            WHERE up.user_id = auth.uid()
        )
    );
