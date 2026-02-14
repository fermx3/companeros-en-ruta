-- Migration: Create Brand POP Materials Table
-- Description: Materials POP (Point of Purchase) with system templates and custom per brand
-- Dependencies: tenants, brands tables

-- ============================================================================
-- TABLE: brand_pop_materials
-- Description: POP materials - system templates + custom per brand
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."brand_pop_materials" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "public_id" VARCHAR(20) UNIQUE,
    "tenant_id" UUID REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "brand_id" UUID REFERENCES "public"."brands"("id") ON DELETE CASCADE,
    "material_name" VARCHAR(255) NOT NULL,
    "material_category" VARCHAR(100),
    "is_system_template" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "deleted_at" TIMESTAMPTZ,
    -- System templates have NULL tenant_id and brand_id
    CONSTRAINT "chk_system_or_brand" CHECK (
        (is_system_template = true AND tenant_id IS NULL AND brand_id IS NULL) OR
        (is_system_template = false AND tenant_id IS NOT NULL AND brand_id IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_pop_materials_tenant_id ON "public"."brand_pop_materials"("tenant_id") WHERE "tenant_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_brand_pop_materials_brand_id ON "public"."brand_pop_materials"("brand_id") WHERE "brand_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_brand_pop_materials_is_system ON "public"."brand_pop_materials"("is_system_template");
CREATE INDEX IF NOT EXISTS idx_brand_pop_materials_category ON "public"."brand_pop_materials"("material_category");

-- Comments
COMMENT ON TABLE "public"."brand_pop_materials" IS 'Materiales POP - plantillas del sistema + personalizados por marca';
COMMENT ON COLUMN "public"."brand_pop_materials"."material_category" IS 'Categoría: poster, exhibidor, senalizacion, colgante, banner';
COMMENT ON COLUMN "public"."brand_pop_materials"."is_system_template" IS 'true = plantilla del sistema disponible para todas las marcas';

-- ============================================================================
-- Function: Generate public_id for brand_pop_materials
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."generate_pop_material_public_id"()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR(20);
    counter INTEGER := 0;
BEGIN
    LOOP
        new_id := 'POP-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM "public"."brand_pop_materials" WHERE public_id = new_id);
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique public_id after 100 attempts';
        END IF;
    END LOOP;
    RETURN new_id;
END;
$$;

-- Set default for public_id
ALTER TABLE "public"."brand_pop_materials"
    ALTER COLUMN "public_id" SET DEFAULT "public"."generate_pop_material_public_id"();

-- ============================================================================
-- Trigger: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."update_pop_materials_updated_at"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER "trigger_pop_materials_updated_at"
    BEFORE UPDATE ON "public"."brand_pop_materials"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_pop_materials_updated_at"();

-- ============================================================================
-- SEED DATA: System POP Material Templates
-- ============================================================================
INSERT INTO "public"."brand_pop_materials"
    ("material_name", "material_category", "is_system_template", "is_active", "display_order")
VALUES
    ('Poster A3', 'poster', true, true, 1),
    ('Poster A4', 'poster', true, true, 2),
    ('Danglers', 'colgante', true, true, 3),
    ('Exhibidor de piso', 'exhibidor', true, true, 4),
    ('Exhibidor de mostrador', 'exhibidor', true, true, 5),
    ('Stopper de anaquel', 'senalizacion', true, true, 6),
    ('Cenefa', 'senalizacion', true, true, 7),
    ('Banner exterior', 'banner', true, true, 8),
    ('Sticker de piso', 'senalizacion', true, true, 9),
    ('Wobbler', 'senalizacion', true, true, 10),
    ('Totem', 'exhibidor', true, true, 11),
    ('Glorificador', 'exhibidor', true, true, 12);

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE "public"."brand_pop_materials" ENABLE ROW LEVEL SECURITY;

-- Policy: System templates are readable by everyone
CREATE POLICY "pop_materials_system_templates_read" ON "public"."brand_pop_materials"
    FOR SELECT
    USING (is_system_template = true);

-- Policy: Brand-specific materials - tenant isolation
CREATE POLICY "pop_materials_brand_tenant_isolation" ON "public"."brand_pop_materials"
    FOR ALL
    USING (
        is_system_template = true OR
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
