-- Migration: Create points_transactions table
-- Date: 2026-01-31
-- Description: Points ledger for tracking all point transactions (awards, deductions, redemptions)

-- 1. Create function for public_id generation
CREATE OR REPLACE FUNCTION generate_points_transaction_public_id()
RETURNS VARCHAR AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'PTS-' || LPAD(counter::TEXT, 8, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM points_transactions WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Create table
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR NOT NULL,
    client_brand_membership_id UUID NOT NULL REFERENCES client_brand_memberships(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Transaction details
    transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('award', 'deduct', 'redeem', 'expire', 'adjustment', 'bonus')),
    points_amount NUMERIC(12, 2) NOT NULL,
    points_balance_after NUMERIC(12, 2) NOT NULL,

    -- Reference to source (order, visit, promotion, etc.)
    reference_type VARCHAR CHECK (reference_type IN ('order', 'visit', 'promotion', 'manual', 'tier_upgrade', 'birthday', 'referral', 'other')),
    reference_id UUID,

    -- Description and metadata
    description TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',

    -- Who made this transaction
    created_by UUID REFERENCES user_profiles(id),
    approved_by UUID REFERENCES user_profiles(id),

    -- Timestamps
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- 3. Set default for public_id
ALTER TABLE points_transactions ALTER COLUMN public_id SET DEFAULT generate_points_transaction_public_id();

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_points_transactions_membership_id ON points_transactions(client_brand_membership_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_tenant_id ON points_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_transaction_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_transaction_date ON points_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_points_transactions_reference ON points_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);

-- 5. Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_points_transactions ON points_transactions;
CREATE TRIGGER set_updated_at_points_transactions
    BEFORE UPDATE ON points_transactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- 6. Enable RLS
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can view their own points transactions
DROP POLICY IF EXISTS "clients_can_view_own_points" ON points_transactions;
CREATE POLICY "clients_can_view_own_points" ON points_transactions
    FOR SELECT USING (
        client_brand_membership_id IN (
            SELECT cbm.id FROM client_brand_memberships cbm
            JOIN clients c ON cbm.client_id = c.id
            WHERE c.user_id = auth.uid()
            AND c.deleted_at IS NULL
            AND cbm.deleted_at IS NULL
        )
    );

-- Policy: Brand managers can manage points for their brand's members
DROP POLICY IF EXISTS "brand_managers_can_manage_points" ON points_transactions;
CREATE POLICY "brand_managers_can_manage_points" ON points_transactions
    FOR ALL USING (
        client_brand_membership_id IN (
            SELECT cbm.id FROM client_brand_memberships cbm
            JOIN user_roles ur ON cbm.brand_id = ur.brand_id
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('brand_manager', 'brand_admin')
            AND ur.status = 'active'
            AND cbm.deleted_at IS NULL
        )
    );

-- Policy: Advisors can view points for their assigned clients
DROP POLICY IF EXISTS "advisors_can_view_assigned_client_points" ON points_transactions;
CREATE POLICY "advisors_can_view_assigned_client_points" ON points_transactions
    FOR SELECT USING (
        client_brand_membership_id IN (
            SELECT cbm.id FROM client_brand_memberships cbm
            JOIN advisor_client_assignments aca ON cbm.client_id = aca.client_id
            JOIN user_profiles up ON aca.advisor_id = up.id
            WHERE up.user_id = auth.uid()
            AND aca.is_active = TRUE
            AND aca.deleted_at IS NULL
            AND cbm.deleted_at IS NULL
        )
    );

-- Comments
COMMENT ON TABLE points_transactions IS 'Ledger of all points transactions for loyalty program';
COMMENT ON COLUMN points_transactions.transaction_type IS 'Type: award (add), deduct (remove), redeem (use for reward), expire, adjustment, bonus';
COMMENT ON COLUMN points_transactions.points_amount IS 'Positive for awards/bonuses, negative for deductions/redemptions';
COMMENT ON COLUMN points_transactions.points_balance_after IS 'Running balance after this transaction';
COMMENT ON COLUMN points_transactions.reference_type IS 'Source of points: order purchase, visit, promotion, manual entry, etc.';
