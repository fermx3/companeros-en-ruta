-- Migration: Create Visit Evidence Table
-- Description: Dedicated table for visit photo evidence with metadata
-- Dependencies: tenants, visits tables

-- ============================================================================
-- TYPE: evidence_stage_enum
-- Description: Stage of the visit where evidence was captured
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE "public"."evidence_stage_enum" AS ENUM (
        'pricing',
        'inventory',
        'communication'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TYPE: evidence_type_enum
-- Description: Type of evidence captured
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE "public"."evidence_type_enum" AS ENUM (
        'shelf_photo',
        'price_tag',
        'competitor_display',
        'purchase_order',
        'inventory_count',
        'promotion_display',
        'pop_material',
        'exhibition',
        'activity',
        'general'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLE: visit_evidence
-- Description: Photo evidence for visits with metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."visit_evidence" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "public_id" VARCHAR(20) UNIQUE,
    "tenant_id" UUID NOT NULL REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "visit_id" UUID NOT NULL REFERENCES "public"."visits"("id") ON DELETE CASCADE,

    -- Categorization
    "evidence_stage" "public"."evidence_stage_enum" NOT NULL,
    "evidence_type" "public"."evidence_type_enum",

    -- File info
    "file_url" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255),
    "file_size_bytes" INTEGER,
    "mime_type" VARCHAR(100),

    -- Capture metadata
    "captured_at" TIMESTAMPTZ DEFAULT now(),
    "capture_latitude" DECIMAL(10, 8),
    "capture_longitude" DECIMAL(11, 8),

    -- Notes
    "caption" TEXT,

    -- Timestamps
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "deleted_at" TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_visit_evidence_visit_id ON "public"."visit_evidence"("visit_id");
CREATE INDEX IF NOT EXISTS idx_visit_evidence_stage ON "public"."visit_evidence"("evidence_stage");
CREATE INDEX IF NOT EXISTS idx_visit_evidence_tenant_id ON "public"."visit_evidence"("tenant_id");
CREATE INDEX IF NOT EXISTS idx_visit_evidence_type ON "public"."visit_evidence"("evidence_type");

-- Comments
COMMENT ON TABLE "public"."visit_evidence" IS 'Evidencia fotográfica de visitas con metadata';
COMMENT ON COLUMN "public"."visit_evidence"."evidence_stage" IS 'Stage del wizard donde se capturó: pricing, inventory, communication';
COMMENT ON COLUMN "public"."visit_evidence"."evidence_type" IS 'Tipo específico de evidencia';
COMMENT ON COLUMN "public"."visit_evidence"."capture_latitude" IS 'Latitud GPS de captura';
COMMENT ON COLUMN "public"."visit_evidence"."capture_longitude" IS 'Longitud GPS de captura';
COMMENT ON COLUMN "public"."visit_evidence"."caption" IS 'Descripción breve de la foto';

-- ============================================================================
-- Function: Generate public_id for visit_evidence
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."generate_visit_evidence_public_id"()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR(20);
    counter INTEGER := 0;
BEGIN
    LOOP
        new_id := 'EVD-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM "public"."visit_evidence" WHERE public_id = new_id);
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique public_id after 100 attempts';
        END IF;
    END LOOP;
    RETURN new_id;
END;
$$;

-- Set default for public_id
ALTER TABLE "public"."visit_evidence"
    ALTER COLUMN "public_id" SET DEFAULT "public"."generate_visit_evidence_public_id"();

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE "public"."visit_evidence" ENABLE ROW LEVEL SECURITY;

-- Policy: visit_evidence - tenant isolation
CREATE POLICY "visit_evidence_tenant_isolation" ON "public"."visit_evidence"
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

-- Policy: visit_evidence - promotor can manage their visit evidence
CREATE POLICY "visit_evidence_promotor_own_visits" ON "public"."visit_evidence"
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
