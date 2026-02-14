-- Migration: Create Brand Communication Plans Tables
-- Description: Communication plans, materials, activities, and exhibitions
-- Dependencies: tenants, brands, brand_pop_materials, products tables

-- ============================================================================
-- TABLE: brand_communication_plans
-- Description: Predefined communication plans per brand
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."brand_communication_plans" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "public_id" VARCHAR(20) UNIQUE,
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "brand_id" UUID NOT NULL REFERENCES "public"."brands"("id") ON DELETE CASCADE,
    "plan_name" VARCHAR(255) NOT NULL,
    "plan_period" VARCHAR(100),
    "target_locations" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "chk_valid_dates" CHECK (end_date >= start_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_communication_plans_tenant_id ON "public"."brand_communication_plans"("tenant_id");
CREATE INDEX IF NOT EXISTS idx_communication_plans_brand_id ON "public"."brand_communication_plans"("brand_id");
CREATE INDEX IF NOT EXISTS idx_communication_plans_is_active ON "public"."brand_communication_plans"("is_active");
CREATE INDEX IF NOT EXISTS idx_communication_plans_dates ON "public"."brand_communication_plans"("start_date", "end_date");

-- Comments
COMMENT ON TABLE "public"."brand_communication_plans" IS 'Planes de comunicación predefinidos por marca';
COMMENT ON COLUMN "public"."brand_communication_plans"."plan_period" IS 'Período descriptivo (ej: "Enero 2026")';
COMMENT ON COLUMN "public"."brand_communication_plans"."target_locations" IS 'Ubicaciones objetivo (ej: "Zona de cajas y entrada principal")';

-- ============================================================================
-- TABLE: brand_communication_plan_materials
-- Description: Materials required per communication plan (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."brand_communication_plan_materials" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "communication_plan_id" UUID NOT NULL REFERENCES "public"."brand_communication_plans"("id") ON DELETE CASCADE,
    "pop_material_id" UUID NOT NULL REFERENCES "public"."brand_pop_materials"("id") ON DELETE CASCADE,
    "quantity_required" INTEGER DEFAULT 1,
    "placement_notes" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT "uq_plan_material" UNIQUE ("communication_plan_id", "pop_material_id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plan_materials_plan_id ON "public"."brand_communication_plan_materials"("communication_plan_id");
CREATE INDEX IF NOT EXISTS idx_plan_materials_pop_id ON "public"."brand_communication_plan_materials"("pop_material_id");

-- Comments
COMMENT ON TABLE "public"."brand_communication_plan_materials" IS 'Materiales POP requeridos por plan de comunicación';
COMMENT ON COLUMN "public"."brand_communication_plan_materials"."placement_notes" IS 'Notas sobre ubicación/colocación del material';

-- ============================================================================
-- TABLE: brand_communication_plan_activities
-- Description: Activities scheduled in communication plans
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."brand_communication_plan_activities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "communication_plan_id" UUID NOT NULL REFERENCES "public"."brand_communication_plans"("id") ON DELETE CASCADE,
    "activity_name" VARCHAR(255) NOT NULL,
    "activity_description" TEXT,
    "scheduled_date" DATE,
    "is_recurring" BOOLEAN DEFAULT false,
    "recurrence_pattern" VARCHAR(100),
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plan_activities_plan_id ON "public"."brand_communication_plan_activities"("communication_plan_id");
CREATE INDEX IF NOT EXISTS idx_plan_activities_date ON "public"."brand_communication_plan_activities"("scheduled_date");

-- Comments
COMMENT ON TABLE "public"."brand_communication_plan_activities" IS 'Actividades programadas del plan de comunicación';
COMMENT ON COLUMN "public"."brand_communication_plan_activities"."activity_name" IS 'Nombre de la actividad (ej: "Degustación fin de semana")';
COMMENT ON COLUMN "public"."brand_communication_plan_activities"."recurrence_pattern" IS 'Patrón de recurrencia (ej: "weekly", "monthly")';

-- ============================================================================
-- TABLE: brand_exhibitions
-- Description: Negotiated exhibitions per brand
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."brand_exhibitions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "public_id" VARCHAR(20) UNIQUE,
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "brand_id" UUID NOT NULL REFERENCES "public"."brands"("id") ON DELETE CASCADE,
    "communication_plan_id" UUID REFERENCES "public"."brand_communication_plans"("id") ON DELETE SET NULL,
    "product_id" UUID REFERENCES "public"."products"("id") ON DELETE SET NULL,
    "exhibition_name" VARCHAR(255) NOT NULL,
    "negotiated_period" VARCHAR(100),
    "location_description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "chk_exhibition_dates" CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exhibitions_tenant_id ON "public"."brand_exhibitions"("tenant_id");
CREATE INDEX IF NOT EXISTS idx_exhibitions_brand_id ON "public"."brand_exhibitions"("brand_id");
CREATE INDEX IF NOT EXISTS idx_exhibitions_plan_id ON "public"."brand_exhibitions"("communication_plan_id");
CREATE INDEX IF NOT EXISTS idx_exhibitions_product_id ON "public"."brand_exhibitions"("product_id");
CREATE INDEX IF NOT EXISTS idx_exhibitions_is_active ON "public"."brand_exhibitions"("is_active");

-- Comments
COMMENT ON TABLE "public"."brand_exhibitions" IS 'Exhibiciones negociadas por marca';
COMMENT ON COLUMN "public"."brand_exhibitions"."negotiated_period" IS 'Período negociado (ej: "Q1 2026")';
COMMENT ON COLUMN "public"."brand_exhibitions"."location_description" IS 'Descripción de la ubicación esperada';

-- ============================================================================
-- Function: Generate public_id for brand_communication_plans
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."generate_communication_plan_public_id"()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR(20);
    counter INTEGER := 0;
BEGIN
    LOOP
        new_id := 'PLN-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM "public"."brand_communication_plans" WHERE public_id = new_id);
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique public_id after 100 attempts';
        END IF;
    END LOOP;
    RETURN new_id;
END;
$$;

-- Function: Generate public_id for brand_exhibitions
CREATE OR REPLACE FUNCTION "public"."generate_exhibition_public_id"()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR(20);
    counter INTEGER := 0;
BEGIN
    LOOP
        new_id := 'EXH-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM "public"."brand_exhibitions" WHERE public_id = new_id);
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique public_id after 100 attempts';
        END IF;
    END LOOP;
    RETURN new_id;
END;
$$;

-- Set defaults for public_ids
ALTER TABLE "public"."brand_communication_plans"
    ALTER COLUMN "public_id" SET DEFAULT "public"."generate_communication_plan_public_id"();

ALTER TABLE "public"."brand_exhibitions"
    ALTER COLUMN "public_id" SET DEFAULT "public"."generate_exhibition_public_id"();

-- ============================================================================
-- Triggers: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."update_communication_plans_updated_at"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER "trigger_communication_plans_updated_at"
    BEFORE UPDATE ON "public"."brand_communication_plans"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_communication_plans_updated_at"();

CREATE TRIGGER "trigger_exhibitions_updated_at"
    BEFORE UPDATE ON "public"."brand_exhibitions"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_communication_plans_updated_at"();

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE "public"."brand_communication_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."brand_communication_plan_materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."brand_communication_plan_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."brand_exhibitions" ENABLE ROW LEVEL SECURITY;

-- Policy: brand_communication_plans - tenant isolation
CREATE POLICY "communication_plans_tenant_isolation" ON "public"."brand_communication_plans"
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

-- Policy: brand_communication_plan_materials - through plan
CREATE POLICY "plan_materials_tenant_isolation" ON "public"."brand_communication_plan_materials"
    FOR ALL
    USING (
        communication_plan_id IN (
            SELECT bcp.id FROM "public"."brand_communication_plans" bcp
            JOIN "public"."user_profiles" up ON bcp.tenant_id = up.tenant_id
            WHERE up.user_id = auth.uid()
        )
    )
    WITH CHECK (
        communication_plan_id IN (
            SELECT bcp.id FROM "public"."brand_communication_plans" bcp
            JOIN "public"."user_profiles" up ON bcp.tenant_id = up.tenant_id
            WHERE up.user_id = auth.uid()
        )
    );

-- Policy: brand_communication_plan_activities - through plan
CREATE POLICY "plan_activities_tenant_isolation" ON "public"."brand_communication_plan_activities"
    FOR ALL
    USING (
        communication_plan_id IN (
            SELECT bcp.id FROM "public"."brand_communication_plans" bcp
            JOIN "public"."user_profiles" up ON bcp.tenant_id = up.tenant_id
            WHERE up.user_id = auth.uid()
        )
    )
    WITH CHECK (
        communication_plan_id IN (
            SELECT bcp.id FROM "public"."brand_communication_plans" bcp
            JOIN "public"."user_profiles" up ON bcp.tenant_id = up.tenant_id
            WHERE up.user_id = auth.uid()
        )
    );

-- Policy: brand_exhibitions - tenant isolation
CREATE POLICY "exhibitions_tenant_isolation" ON "public"."brand_exhibitions"
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
