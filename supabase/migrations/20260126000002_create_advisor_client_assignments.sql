-- Migration: Create advisor_client_assignments table
-- Date: 2026-01-26
-- Description: Table to assign specific clients to advisors

-- 1. Create function for public_id generation
CREATE OR REPLACE FUNCTION generate_advisor_client_assignment_public_id()
RETURNS VARCHAR AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'ACA-' || LPAD(counter::TEXT, 5, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM advisor_client_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Create table
CREATE TABLE IF NOT EXISTS advisor_client_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR NOT NULL,
    advisor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assignment_type VARCHAR DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'support', 'temporary')),
    assigned_by UUID REFERENCES user_profiles(id),
    assigned_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- 3. Set default for public_id
ALTER TABLE advisor_client_assignments ALTER COLUMN public_id SET DEFAULT generate_advisor_client_assignment_public_id();

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_advisor_client_assignments_advisor_id ON advisor_client_assignments(advisor_id);
CREATE INDEX IF NOT EXISTS idx_advisor_client_assignments_client_id ON advisor_client_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_advisor_client_assignments_brand_id ON advisor_client_assignments(brand_id);
CREATE INDEX IF NOT EXISTS idx_advisor_client_assignments_tenant_id ON advisor_client_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_advisor_client_assignments_is_active ON advisor_client_assignments(is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_advisor_client_assignment ON advisor_client_assignments(advisor_id, client_id, brand_id) WHERE deleted_at IS NULL AND is_active = TRUE;

-- 5. Create trigger
DROP TRIGGER IF EXISTS set_updated_at_advisor_client_assignments ON advisor_client_assignments;
CREATE TRIGGER set_updated_at_advisor_client_assignments
    BEFORE UPDATE ON advisor_client_assignments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- 6. Enable RLS
ALTER TABLE advisor_client_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Advisors can view their assigned clients" ON advisor_client_assignments;
CREATE POLICY "Advisors can view their assigned clients" ON advisor_client_assignments
    FOR SELECT USING (
        advisor_id IN (SELECT up.id FROM user_profiles up WHERE up.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admin and brand managers can manage client assignments" ON advisor_client_assignments;
CREATE POLICY "Admin and brand managers can manage client assignments" ON advisor_client_assignments
    FOR ALL USING (
        tenant_id IN (
            SELECT ur.tenant_id FROM user_roles ur 
            JOIN user_profiles up ON ur.user_profile_id = up.id 
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('admin', 'brand_manager')
            AND ur.status = 'active'
        )
    );

COMMENT ON TABLE advisor_client_assignments IS 'Assignment of specific clients to advisors';
