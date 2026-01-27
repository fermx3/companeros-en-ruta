-- Migration: Create advisor_assignments table
-- Date: 2026-01-26
-- Description: Table to store advisor-specific information (zone assignment, specialization, metrics)

-- 1. Create enums
DO $$ BEGIN
    CREATE TYPE advisor_specialization_enum AS ENUM (
        'retail', 'wholesale', 'pharma', 'food_service', 'convenience', 'supermarket', 'general'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE advisor_experience_level_enum AS ENUM (
        'trainee', 'junior', 'senior', 'expert', 'team_lead'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create function for public_id generation
CREATE OR REPLACE FUNCTION generate_advisor_assignment_public_id()
RETURNS VARCHAR AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'AA-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM advisor_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Create table
CREATE TABLE IF NOT EXISTS advisor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR NOT NULL,
    user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    specialization advisor_specialization_enum NOT NULL DEFAULT 'general',
    experience_level advisor_experience_level_enum NOT NULL DEFAULT 'junior',
    monthly_quota INTEGER DEFAULT 0,
    performance_rating DECIMAL(3,1) CHECK (performance_rating >= 0 AND performance_rating <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    assigned_by UUID REFERENCES user_profiles(id),
    assigned_date DATE DEFAULT CURRENT_DATE,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_rating CHECK (performance_rating IS NULL OR (performance_rating >= 0 AND performance_rating <= 100))
);

-- 4. Set default for public_id
ALTER TABLE advisor_assignments ALTER COLUMN public_id SET DEFAULT generate_advisor_assignment_public_id();

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_advisor_assignments_user_profile_id ON advisor_assignments(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_advisor_assignments_zone_id ON advisor_assignments(zone_id);
CREATE INDEX IF NOT EXISTS idx_advisor_assignments_tenant_id ON advisor_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_advisor_assignments_is_active ON advisor_assignments(is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS unique_advisor_zone_assignment ON advisor_assignments(user_profile_id, zone_id) WHERE deleted_at IS NULL;

-- 6. Create/update trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_advisor_assignments ON advisor_assignments;
CREATE TRIGGER set_updated_at_advisor_assignments
    BEFORE UPDATE ON advisor_assignments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- 7. Enable RLS
ALTER TABLE advisor_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view advisor assignments in their tenant" ON advisor_assignments;
CREATE POLICY "Users can view advisor assignments in their tenant" ON advisor_assignments
    FOR SELECT USING (
        tenant_id IN (
            SELECT ur.tenant_id FROM user_roles ur 
            JOIN user_profiles up ON ur.user_profile_id = up.id 
            WHERE up.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admin and brand managers can manage advisor assignments" ON advisor_assignments;
CREATE POLICY "Admin and brand managers can manage advisor assignments" ON advisor_assignments
    FOR ALL USING (
        tenant_id IN (
            SELECT ur.tenant_id FROM user_roles ur 
            JOIN user_profiles up ON ur.user_profile_id = up.id 
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('admin', 'brand_manager')
            AND ur.status = 'active'
        )
    );

COMMENT ON TABLE advisor_assignments IS 'Advisor-specific information: assigned zone, specialization and metrics';
