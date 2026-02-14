-- Migration: Create Assessment Detail Tables
-- Description: Normalized tables for detailed visit assessment data
-- Dependencies: visits, products, brand_competitors, brand_pop_materials, brand_exhibitions

-- ============================================================================
-- TYPE: stock_level_observed_enum
-- Description: Observed stock levels during visit
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE "public"."stock_level_observed_enum" AS ENUM (
        'out_of_stock',
        'low',
        'medium',
        'high'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TYPE: material_condition_enum
-- Description: Condition of POP materials
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE "public"."material_condition_enum" AS ENUM (
        'good',
        'damaged',
        'missing'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TYPE: execution_quality_enum
-- Description: Quality of exhibition execution
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE "public"."execution_quality_enum" AS ENUM (
        'excellent',
        'good',
        'fair',
        'poor'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLE: visit_brand_product_assessments
-- Description: Observed prices and status of brand's own products
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."visit_brand_product_assessments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "visit_id" UUID NOT NULL REFERENCES "public"."visits"("id") ON DELETE CASCADE,
    "product_id" UUID NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "product_variant_id" UUID REFERENCES "public"."product_variants"("id") ON DELETE SET NULL,

    -- Pricing
    "current_price" DECIMAL(10, 2),
    "suggested_price" DECIMAL(10, 2),

    -- Status
    "has_active_promotion" BOOLEAN DEFAULT false,
    "promotion_description" VARCHAR(255),
    "has_pop_material" BOOLEAN DEFAULT false,
    "is_product_present" BOOLEAN DEFAULT true,
    "stock_level" "public"."stock_level_observed_enum",

    -- Timestamps
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),

    -- Unique per visit+product+variant
    CONSTRAINT "uq_visit_brand_product" UNIQUE ("visit_id", "product_id", "product_variant_id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_product_assessments_visit ON "public"."visit_brand_product_assessments"("visit_id");
CREATE INDEX IF NOT EXISTS idx_brand_product_assessments_product ON "public"."visit_brand_product_assessments"("product_id");
CREATE INDEX IF NOT EXISTS idx_brand_product_assessments_tenant ON "public"."visit_brand_product_assessments"("tenant_id");

-- Comments
COMMENT ON TABLE "public"."visit_brand_product_assessments" IS 'Evaluación de precios y estado de productos de la marca durante visitas';
COMMENT ON COLUMN "public"."visit_brand_product_assessments"."promotion_description" IS 'Descripción de promoción activa (ej: "2x1", "Descuento 10%")';
COMMENT ON COLUMN "public"."visit_brand_product_assessments"."stock_level" IS 'Nivel de stock observado';

-- ============================================================================
-- TABLE: visit_competitor_assessments
-- Description: Observed prices and status of competitor products
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."visit_competitor_assessments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "visit_id" UUID NOT NULL REFERENCES "public"."visits"("id") ON DELETE CASCADE,
    "competitor_id" UUID NOT NULL REFERENCES "public"."brand_competitors"("id") ON DELETE CASCADE,
    "competitor_product_id" UUID REFERENCES "public"."brand_competitor_products"("id") ON DELETE SET NULL,

    -- Product info (if not in catalog)
    "product_name_observed" VARCHAR(255),
    "size_grams" INTEGER,

    -- Pricing
    "observed_price" DECIMAL(10, 2),

    -- Status
    "has_active_promotion" BOOLEAN DEFAULT false,
    "promotion_description" VARCHAR(255),
    "has_pop_material" BOOLEAN DEFAULT false,

    -- Timestamps
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_competitor_assessments_visit ON "public"."visit_competitor_assessments"("visit_id");
CREATE INDEX IF NOT EXISTS idx_competitor_assessments_competitor ON "public"."visit_competitor_assessments"("competitor_id");
CREATE INDEX IF NOT EXISTS idx_competitor_assessments_tenant ON "public"."visit_competitor_assessments"("tenant_id");

-- Comments
COMMENT ON TABLE "public"."visit_competitor_assessments" IS 'Evaluación de productos de competidores durante visitas';
COMMENT ON COLUMN "public"."visit_competitor_assessments"."product_name_observed" IS 'Nombre del producto si no está en el catálogo';
COMMENT ON COLUMN "public"."visit_competitor_assessments"."size_grams" IS 'Tamaño observado en gramos';

-- ============================================================================
-- TABLE: visit_pop_material_checks
-- Description: Verification of POP materials during visit
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."visit_pop_material_checks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "visit_id" UUID NOT NULL REFERENCES "public"."visits"("id") ON DELETE CASCADE,
    "pop_material_id" UUID NOT NULL REFERENCES "public"."brand_pop_materials"("id") ON DELETE CASCADE,

    -- Status
    "is_present" BOOLEAN DEFAULT false,
    "condition" "public"."material_condition_enum",
    "notes" TEXT,

    -- Timestamps
    "created_at" TIMESTAMPTZ DEFAULT now(),

    -- Unique per visit+material
    CONSTRAINT "uq_visit_pop_material" UNIQUE ("visit_id", "pop_material_id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pop_checks_visit ON "public"."visit_pop_material_checks"("visit_id");
CREATE INDEX IF NOT EXISTS idx_pop_checks_material ON "public"."visit_pop_material_checks"("pop_material_id");
CREATE INDEX IF NOT EXISTS idx_pop_checks_tenant ON "public"."visit_pop_material_checks"("tenant_id");

-- Comments
COMMENT ON TABLE "public"."visit_pop_material_checks" IS 'Verificación de materiales POP durante visitas';
COMMENT ON COLUMN "public"."visit_pop_material_checks"."condition" IS 'Condición del material: good, damaged, missing';

-- ============================================================================
-- TABLE: visit_exhibition_checks
-- Description: Verification of exhibitions during visit
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."visit_exhibition_checks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "visit_id" UUID NOT NULL REFERENCES "public"."visits"("id") ON DELETE CASCADE,
    "exhibition_id" UUID NOT NULL REFERENCES "public"."brand_exhibitions"("id") ON DELETE CASCADE,

    -- Status
    "is_executed" BOOLEAN DEFAULT false,
    "execution_quality" "public"."execution_quality_enum",
    "notes" TEXT,

    -- Timestamps
    "created_at" TIMESTAMPTZ DEFAULT now(),

    -- Unique per visit+exhibition
    CONSTRAINT "uq_visit_exhibition" UNIQUE ("visit_id", "exhibition_id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exhibition_checks_visit ON "public"."visit_exhibition_checks"("visit_id");
CREATE INDEX IF NOT EXISTS idx_exhibition_checks_exhibition ON "public"."visit_exhibition_checks"("exhibition_id");
CREATE INDEX IF NOT EXISTS idx_exhibition_checks_tenant ON "public"."visit_exhibition_checks"("tenant_id");

-- Comments
COMMENT ON TABLE "public"."visit_exhibition_checks" IS 'Verificación de exhibiciones durante visitas';
COMMENT ON COLUMN "public"."visit_exhibition_checks"."execution_quality" IS 'Calidad de ejecución: excellent, good, fair, poor';

-- ============================================================================
-- Trigger: Update updated_at for brand_product_assessments
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."update_brand_product_assessments_updated_at"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER "trigger_brand_product_assessments_updated_at"
    BEFORE UPDATE ON "public"."visit_brand_product_assessments"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_brand_product_assessments_updated_at"();

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE "public"."visit_brand_product_assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."visit_competitor_assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."visit_pop_material_checks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."visit_exhibition_checks" ENABLE ROW LEVEL SECURITY;

-- Policy: visit_brand_product_assessments - tenant isolation
CREATE POLICY "brand_product_assessments_tenant_isolation" ON "public"."visit_brand_product_assessments"
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

-- Policy: visit_competitor_assessments - tenant isolation
CREATE POLICY "competitor_assessments_tenant_isolation" ON "public"."visit_competitor_assessments"
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

-- Policy: visit_pop_material_checks - tenant isolation
CREATE POLICY "pop_material_checks_tenant_isolation" ON "public"."visit_pop_material_checks"
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

-- Policy: visit_exhibition_checks - tenant isolation
CREATE POLICY "exhibition_checks_tenant_isolation" ON "public"."visit_exhibition_checks"
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

-- Additional policies for promotor access to their own visits
CREATE POLICY "brand_product_assessments_promotor_own" ON "public"."visit_brand_product_assessments"
    FOR ALL
    USING (
        visit_id IN (
            SELECT v.id FROM "public"."visits" v
            JOIN "public"."user_profiles" up ON v.promotor_id = up.id
            WHERE up.user_id = auth.uid()
        )
    );

CREATE POLICY "competitor_assessments_promotor_own" ON "public"."visit_competitor_assessments"
    FOR ALL
    USING (
        visit_id IN (
            SELECT v.id FROM "public"."visits" v
            JOIN "public"."user_profiles" up ON v.promotor_id = up.id
            WHERE up.user_id = auth.uid()
        )
    );

CREATE POLICY "pop_material_checks_promotor_own" ON "public"."visit_pop_material_checks"
    FOR ALL
    USING (
        visit_id IN (
            SELECT v.id FROM "public"."visits" v
            JOIN "public"."user_profiles" up ON v.promotor_id = up.id
            WHERE up.user_id = auth.uid()
        )
    );

CREATE POLICY "exhibition_checks_promotor_own" ON "public"."visit_exhibition_checks"
    FOR ALL
    USING (
        visit_id IN (
            SELECT v.id FROM "public"."visits" v
            JOIN "public"."user_profiles" up ON v.promotor_id = up.id
            WHERE up.user_id = auth.uid()
        )
    );
