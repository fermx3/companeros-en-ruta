-- ============================================================================
-- Migration: Add Asesor de Ventas role and distributors infrastructure
-- ============================================================================
-- This migration adds:
-- 1. 'asesor_de_ventas' to user_role_type_enum
-- 2. distributors table for external distributor companies
-- 3. distributor_id column on user_profiles to link sales advisors to distributors
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: Add 'asesor_de_ventas' to user_role_type_enum
-- ============================================================================

ALTER TYPE user_role_type_enum ADD VALUE IF NOT EXISTS 'asesor_de_ventas';

COMMIT;

-- New transaction (required after ADD VALUE)
BEGIN;

-- ============================================================================
-- PHASE 2: Create distributors table
-- ============================================================================

CREATE TABLE IF NOT EXISTS distributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(20) NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    rfc VARCHAR(13),

    -- Contact info
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),

    -- Address
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_postal_code VARCHAR(10),
    address_country VARCHAR(100) DEFAULT 'México',

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT distributors_name_tenant_unique UNIQUE (name, tenant_id)
);

-- Create function to generate distributor public_id
CREATE OR REPLACE FUNCTION generate_distributor_public_id()
RETURNS character varying
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'DIST-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM distributors WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;

-- Set default for public_id
ALTER TABLE distributors ALTER COLUMN public_id SET DEFAULT generate_distributor_public_id();

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_distributor_public_id() TO anon, authenticated, service_role;

-- Create indexes
CREATE INDEX idx_distributors_tenant_id ON distributors(tenant_id);
CREATE INDEX idx_distributors_status ON distributors(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_distributors_name ON distributors(name) WHERE deleted_at IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_distributors
    BEFORE UPDATE ON distributors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE distributors IS 'External distributor companies that employ Asesores de Ventas';
COMMENT ON COLUMN distributors.public_id IS 'Human-readable ID (DIST-XXXX)';
COMMENT ON COLUMN distributors.rfc IS 'Mexican tax ID (Registro Federal de Contribuyentes)';
COMMENT ON COLUMN distributors.status IS 'active, inactive, or suspended';

-- ============================================================================
-- PHASE 3: Add distributor_id to user_profiles (before RLS policies that use it)
-- ============================================================================

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX idx_user_profiles_distributor_id ON user_profiles(distributor_id) WHERE distributor_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN user_profiles.distributor_id IS 'For Asesor de Ventas: the distributor company they work for';

-- ============================================================================
-- PHASE 4: RLS Policies for distributors (after distributor_id column exists)
-- ============================================================================

CREATE POLICY "admins_manage_distributors"
ON distributors
USING (
    tenant_id IN (
        SELECT ur.tenant_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role = 'admin'
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

CREATE POLICY "brand_managers_select_distributors"
ON distributors
FOR SELECT
USING (
    deleted_at IS NULL
    AND tenant_id IN (
        SELECT ur.tenant_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role IN ('brand_manager', 'supervisor')
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

CREATE POLICY "asesor_ventas_select_own_distributor"
ON distributors
FOR SELECT
USING (
    deleted_at IS NULL
    AND id IN (
        SELECT up.distributor_id FROM user_profiles up
        WHERE up.user_id = auth.uid()
        AND up.deleted_at IS NULL
    )
);

-- ============================================================================
-- PHASE 5: Update user_roles constraint to include asesor_de_ventas
-- ============================================================================

-- Drop and recreate the constraint to include the new role
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_non_global_scope_check;

ALTER TABLE user_roles ADD CONSTRAINT user_roles_non_global_scope_check CHECK (
    ((role = ANY (ARRAY[
        'supervisor'::user_role_type_enum,
        'promotor'::user_role_type_enum,
        'market_analyst'::user_role_type_enum,
        'asesor_de_ventas'::user_role_type_enum
    ]))
     AND (scope = ANY (ARRAY['tenant'::user_role_scope_enum, 'brand'::user_role_scope_enum])))
    OR (role <> ALL (ARRAY[
        'supervisor'::user_role_type_enum,
        'promotor'::user_role_type_enum,
        'market_analyst'::user_role_type_enum,
        'asesor_de_ventas'::user_role_type_enum
    ]))
);

-- ============================================================================
-- PHASE 6: Create active_distributors view
-- ============================================================================

CREATE VIEW active_distributors AS
SELECT
    d.id,
    d.public_id,
    d.tenant_id,
    d.name,
    d.legal_name,
    d.rfc,
    d.contact_name,
    d.contact_email,
    d.contact_phone,
    d.address_street,
    d.address_city,
    d.address_state,
    d.address_postal_code,
    d.address_country,
    d.status,
    d.notes,
    d.metadata,
    d.created_at,
    d.updated_at,
    t.name AS tenant_name,
    (
        SELECT COUNT(*)
        FROM user_profiles up
        WHERE up.distributor_id = d.id
        AND up.deleted_at IS NULL
    ) AS employee_count
FROM distributors d
JOIN tenants t ON d.tenant_id = t.id
WHERE d.deleted_at IS NULL
AND t.deleted_at IS NULL
ORDER BY d.name;

-- ============================================================================
-- PHASE 7: Add RLS policies for asesor_de_ventas role
-- ============================================================================

-- Allow asesor_de_ventas to view clients in their assigned zones/brands
CREATE POLICY "asesor_ventas_select_clients"
ON clients
FOR SELECT
USING (
    deleted_at IS NULL
    AND (
        -- Via brand assignment
        id IN (
            SELECT c.id FROM clients c
            JOIN client_brand_memberships cbm ON cbm.client_id = c.id
            WHERE cbm.brand_id IN (
                SELECT ur.brand_id FROM user_roles ur
                JOIN user_profiles up ON ur.user_profile_id = up.id
                WHERE up.user_id = auth.uid()
                AND ur.role = 'asesor_de_ventas'
                AND ur.status = 'active'
                AND ur.deleted_at IS NULL
            )
            AND cbm.deleted_at IS NULL
            AND c.deleted_at IS NULL
        )
    )
);

-- Allow asesor_de_ventas to manage orders for their clients
CREATE POLICY "asesor_ventas_manage_orders"
ON orders
USING (
    deleted_at IS NULL
    AND assigned_to IN (
        SELECT ur.user_profile_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role = 'asesor_de_ventas'
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

CREATE POLICY "asesor_ventas_select_orders"
ON orders
FOR SELECT
USING (
    deleted_at IS NULL
    AND assigned_to IN (
        SELECT ur.user_profile_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role = 'asesor_de_ventas'
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

-- Allow asesor_de_ventas to manage order items
CREATE POLICY "asesor_ventas_manage_order_items"
ON order_items
USING (
    order_id IN (
        SELECT o.id FROM orders o
        WHERE o.assigned_to IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role = 'asesor_de_ventas'
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND o.deleted_at IS NULL
    )
);

-- Allow asesor_de_ventas to view promotions
CREATE POLICY "asesor_ventas_select_promotions"
ON promotions
FOR SELECT
USING (
    deleted_at IS NULL
    AND status = 'active'
    AND brand_id IN (
        SELECT ur.brand_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role = 'asesor_de_ventas'
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

-- Allow asesor_de_ventas to view products
CREATE POLICY "asesor_ventas_select_products"
ON products
FOR SELECT
USING (
    deleted_at IS NULL
    AND brand_id IN (
        SELECT ur.brand_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role = 'asesor_de_ventas'
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMIT;

-- Summary of changes:
-- 1. Added 'asesor_de_ventas' to user_role_type_enum
-- 2. Created distributors table with RLS policies
-- 3. Added distributor_id to user_profiles
-- 4. Updated user_roles constraint to include asesor_de_ventas
-- 5. Created active_distributors view
-- 6. Added RLS policies for asesor_de_ventas role access
