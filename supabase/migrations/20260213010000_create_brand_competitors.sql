-- Migration: Create Brand Competitors Tables
-- Description: Tables for managing competitor information per brand
-- Dependencies: tenants, brands tables

-- ============================================================================
-- TABLE: brand_competitors
-- Description: Competitors tracked by each brand
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."brand_competitors" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "public_id" VARCHAR(20) UNIQUE,
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "brand_id" UUID NOT NULL REFERENCES "public"."brands"("id") ON DELETE CASCADE,
    "competitor_name" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(500),
    "is_active" BOOLEAN DEFAULT true,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "deleted_at" TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_competitors_tenant_id ON "public"."brand_competitors"("tenant_id");
CREATE INDEX IF NOT EXISTS idx_brand_competitors_brand_id ON "public"."brand_competitors"("brand_id");
CREATE INDEX IF NOT EXISTS idx_brand_competitors_is_active ON "public"."brand_competitors"("is_active") WHERE "deleted_at" IS NULL;

-- Comments
COMMENT ON TABLE "public"."brand_competitors" IS 'Competidores rastreados por cada marca';
COMMENT ON COLUMN "public"."brand_competitors"."competitor_name" IS 'Nombre del competidor';
COMMENT ON COLUMN "public"."brand_competitors"."display_order" IS 'Orden de visualización en formularios';

-- ============================================================================
-- TABLE: brand_competitor_products
-- Description: Products from competitors (normalized, not JSON)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."brand_competitor_products" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "competitor_id" UUID NOT NULL REFERENCES "public"."brand_competitors"("id") ON DELETE CASCADE,
    "product_name" VARCHAR(255) NOT NULL,
    "default_size_grams" INTEGER,
    "default_size_ml" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_competitor_products_competitor_id ON "public"."brand_competitor_products"("competitor_id");
CREATE INDEX IF NOT EXISTS idx_brand_competitor_products_is_active ON "public"."brand_competitor_products"("is_active");

-- Comments
COMMENT ON TABLE "public"."brand_competitor_products" IS 'Productos de competidores para tracking de precios';
COMMENT ON COLUMN "public"."brand_competitor_products"."default_size_grams" IS 'Tamaño por defecto en gramos (si aplica)';
COMMENT ON COLUMN "public"."brand_competitor_products"."default_size_ml" IS 'Tamaño por defecto en mililitros (si aplica)';

-- ============================================================================
-- TABLE: brand_competitor_product_sizes
-- Description: Size variants for competitor products
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."brand_competitor_product_sizes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "competitor_product_id" UUID NOT NULL REFERENCES "public"."brand_competitor_products"("id") ON DELETE CASCADE,
    "size_value" INTEGER NOT NULL,
    "size_unit" VARCHAR(10) DEFAULT 'g' CHECK ("size_unit" IN ('g', 'ml', 'kg', 'l')),
    "is_default" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_competitor_product_sizes_product_id ON "public"."brand_competitor_product_sizes"("competitor_product_id");

-- Comments
COMMENT ON TABLE "public"."brand_competitor_product_sizes" IS 'Variantes de tamaño para productos de competidores';
COMMENT ON COLUMN "public"."brand_competitor_product_sizes"."size_value" IS 'Valor numérico del tamaño (ej: 355, 500, 1000)';
COMMENT ON COLUMN "public"."brand_competitor_product_sizes"."size_unit" IS 'Unidad de medida: g (gramos), ml (mililitros), kg, l (litros)';

-- ============================================================================
-- Function: Generate public_id for brand_competitors
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."generate_brand_competitor_public_id"()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR(20);
    counter INTEGER := 0;
BEGIN
    LOOP
        new_id := 'CMP-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM "public"."brand_competitors" WHERE public_id = new_id);
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique public_id after 100 attempts';
        END IF;
    END LOOP;
    RETURN new_id;
END;
$$;

-- Set default for public_id
ALTER TABLE "public"."brand_competitors"
    ALTER COLUMN "public_id" SET DEFAULT "public"."generate_brand_competitor_public_id"();

-- ============================================================================
-- Trigger: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."update_brand_competitors_updated_at"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER "trigger_brand_competitors_updated_at"
    BEFORE UPDATE ON "public"."brand_competitors"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_brand_competitors_updated_at"();

CREATE TRIGGER "trigger_brand_competitor_products_updated_at"
    BEFORE UPDATE ON "public"."brand_competitor_products"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_brand_competitors_updated_at"();

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE "public"."brand_competitors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."brand_competitor_products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."brand_competitor_product_sizes" ENABLE ROW LEVEL SECURITY;

-- Policy: brand_competitors - tenant isolation
CREATE POLICY "brand_competitors_tenant_isolation" ON "public"."brand_competitors"
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

-- Policy: brand_competitor_products - tenant isolation through competitor
CREATE POLICY "brand_competitor_products_tenant_isolation" ON "public"."brand_competitor_products"
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

-- Policy: brand_competitor_product_sizes - through competitor_products
CREATE POLICY "brand_competitor_product_sizes_tenant_isolation" ON "public"."brand_competitor_product_sizes"
    FOR ALL
    USING (
        competitor_product_id IN (
            SELECT bcp.id FROM "public"."brand_competitor_products" bcp
            JOIN "public"."user_profiles" up ON bcp.tenant_id = up.tenant_id
            WHERE up.user_id = auth.uid()
        )
    )
    WITH CHECK (
        competitor_product_id IN (
            SELECT bcp.id FROM "public"."brand_competitor_products" bcp
            JOIN "public"."user_profiles" up ON bcp.tenant_id = up.tenant_id
            WHERE up.user_id = auth.uid()
        )
    );
