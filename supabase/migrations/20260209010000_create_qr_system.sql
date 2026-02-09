-- Migration: Create QR System Tables
-- TASK-010 & TASK-010b: qr_codes and qr_redemptions tables
--
-- Flow: Client generates QR → Asesor de Ventas scans → Redemption tracked
-- Features:
--   - Multi-use promotions (max_redemptions configurable)
--   - "First to scan wins" logic
--   - Tracking for distributor→brand billing

BEGIN;

-- =============================================================================
-- ENUMS
-- =============================================================================

-- QR Code status
CREATE TYPE qr_status_enum AS ENUM (
  'active',      -- QR is valid and can be redeemed
  'fully_redeemed', -- All redemptions used (redemption_count >= max_redemptions)
  'expired',     -- Past expiration date
  'cancelled'    -- Manually cancelled
);

-- Redemption status
CREATE TYPE qr_redemption_status_enum AS ENUM (
  'pending',     -- Redemption initiated but not confirmed
  'completed',   -- Successfully redeemed
  'failed',      -- Redemption failed (validation error, etc.)
  'reversed'     -- Redemption was reversed/cancelled
);

-- =============================================================================
-- QR CODES TABLE
-- =============================================================================

CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Unique code for the QR (what gets encoded)
  code VARCHAR(50) NOT NULL UNIQUE,

  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,

  -- QR Configuration
  qr_type VARCHAR(50) NOT NULL DEFAULT 'promotion', -- 'promotion', 'loyalty', 'discount'
  status qr_status_enum NOT NULL DEFAULT 'active',

  -- Redemption limits
  max_redemptions INTEGER NOT NULL DEFAULT 1, -- 1 = single use, >1 = multi-use
  redemption_count INTEGER NOT NULL DEFAULT 0,

  -- Value/Discount
  discount_type VARCHAR(20), -- 'percentage', 'fixed_amount', 'free_product', 'points'
  discount_value NUMERIC(10,2),
  discount_description TEXT,

  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT qr_codes_max_redemptions_positive CHECK (max_redemptions > 0),
  CONSTRAINT qr_codes_redemption_count_valid CHECK (redemption_count >= 0 AND redemption_count <= max_redemptions),
  CONSTRAINT qr_codes_discount_value_positive CHECK (discount_value IS NULL OR discount_value > 0)
);

-- Indexes for common queries
CREATE INDEX idx_qr_codes_tenant ON qr_codes(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_qr_codes_client ON qr_codes(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_qr_codes_code ON qr_codes(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_qr_codes_status ON qr_codes(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_qr_codes_promotion ON qr_codes(promotion_id) WHERE deleted_at IS NULL AND promotion_id IS NOT NULL;

-- =============================================================================
-- QR REDEMPTIONS TABLE
-- =============================================================================

CREATE TABLE qr_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Who redeemed (Asesor de Ventas)
  redeemed_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Distributor info (for billing)
  distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,

  -- Status
  status qr_redemption_status_enum NOT NULL DEFAULT 'completed',

  -- Value at time of redemption (snapshot)
  discount_type VARCHAR(20),
  discount_value NUMERIC(10,2),

  -- Location data
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),

  -- Metadata for billing/tracking
  metadata JSONB DEFAULT '{}',
  notes TEXT,

  -- Audit
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,

  -- For "first to scan wins" - unique constraint on qr_code for single-use
  -- This is handled by the redemption_count check, but we add an index for performance
  CONSTRAINT qr_redemptions_discount_value_positive CHECK (discount_value IS NULL OR discount_value >= 0)
);

-- Indexes
CREATE INDEX idx_qr_redemptions_qr_code ON qr_redemptions(qr_code_id);
CREATE INDEX idx_qr_redemptions_redeemed_by ON qr_redemptions(redeemed_by);
CREATE INDEX idx_qr_redemptions_distributor ON qr_redemptions(distributor_id) WHERE distributor_id IS NOT NULL;
CREATE INDEX idx_qr_redemptions_tenant ON qr_redemptions(tenant_id);
CREATE INDEX idx_qr_redemptions_date ON qr_redemptions(redeemed_at);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to generate unique QR code
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
AS $$
DECLARE
  new_code VARCHAR(50);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code: QR-XXXXXX-XXXX (alphanumeric)
    new_code := 'QR-' ||
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6)) || '-' ||
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 7 FOR 4));

    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM qr_codes WHERE code = new_code) INTO code_exists;

    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$;

-- Function to attempt QR redemption (handles "first to scan wins")
CREATE OR REPLACE FUNCTION redeem_qr_code(
  p_qr_code VARCHAR(50),
  p_user_profile_id UUID,
  p_distributor_id UUID DEFAULT NULL,
  p_latitude NUMERIC DEFAULT NULL,
  p_longitude NUMERIC DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  redemption_id UUID,
  qr_data JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_qr_record RECORD;
  v_redemption_id UUID;
  v_tenant_id UUID;
BEGIN
  -- Get QR code with row lock to prevent race conditions
  SELECT * INTO v_qr_record
  FROM qr_codes
  WHERE code = p_qr_code
    AND deleted_at IS NULL
  FOR UPDATE;

  -- Check if QR exists
  IF v_qr_record IS NULL THEN
    RETURN QUERY SELECT
      FALSE,
      'QR code not found'::TEXT,
      NULL::UUID,
      NULL::JSONB;
    RETURN;
  END IF;

  -- Check status
  IF v_qr_record.status != 'active' THEN
    RETURN QUERY SELECT
      FALSE,
      ('QR code is ' || v_qr_record.status)::TEXT,
      NULL::UUID,
      NULL::JSONB;
    RETURN;
  END IF;

  -- Check expiration
  IF v_qr_record.valid_until IS NOT NULL AND v_qr_record.valid_until < NOW() THEN
    -- Update status to expired
    UPDATE qr_codes SET status = 'expired', updated_at = NOW() WHERE id = v_qr_record.id;

    RETURN QUERY SELECT
      FALSE,
      'QR code has expired'::TEXT,
      NULL::UUID,
      NULL::JSONB;
    RETURN;
  END IF;

  -- Check if not yet valid
  IF v_qr_record.valid_from > NOW() THEN
    RETURN QUERY SELECT
      FALSE,
      'QR code is not yet valid'::TEXT,
      NULL::UUID,
      NULL::JSONB;
    RETURN;
  END IF;

  -- Check redemption limit ("first to scan wins")
  IF v_qr_record.redemption_count >= v_qr_record.max_redemptions THEN
    RETURN QUERY SELECT
      FALSE,
      'QR code has reached maximum redemptions'::TEXT,
      NULL::UUID,
      NULL::JSONB;
    RETURN;
  END IF;

  -- Get tenant_id from user profile
  SELECT tenant_id INTO v_tenant_id FROM user_profiles WHERE id = p_user_profile_id;

  -- Create redemption record
  INSERT INTO qr_redemptions (
    qr_code_id,
    tenant_id,
    redeemed_by,
    distributor_id,
    status,
    discount_type,
    discount_value,
    latitude,
    longitude,
    notes
  ) VALUES (
    v_qr_record.id,
    v_tenant_id,
    p_user_profile_id,
    p_distributor_id,
    'completed',
    v_qr_record.discount_type,
    v_qr_record.discount_value,
    p_latitude,
    p_longitude,
    p_notes
  ) RETURNING id INTO v_redemption_id;

  -- Update QR code redemption count
  UPDATE qr_codes
  SET
    redemption_count = redemption_count + 1,
    status = CASE
      WHEN redemption_count + 1 >= max_redemptions THEN 'fully_redeemed'::qr_status_enum
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = v_qr_record.id;

  -- Return success
  RETURN QUERY SELECT
    TRUE,
    'QR code redeemed successfully'::TEXT,
    v_redemption_id,
    jsonb_build_object(
      'qr_id', v_qr_record.id,
      'client_id', v_qr_record.client_id,
      'promotion_id', v_qr_record.promotion_id,
      'discount_type', v_qr_record.discount_type,
      'discount_value', v_qr_record.discount_value,
      'discount_description', v_qr_record.discount_description,
      'redemptions_remaining', v_qr_record.max_redemptions - v_qr_record.redemption_count - 1
    );
END;
$$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-set code if not provided
CREATE OR REPLACE FUNCTION set_qr_code_default()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_qr_code
  BEFORE INSERT ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION set_qr_code_default();

-- Update updated_at
CREATE TRIGGER trigger_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_qr_redemptions_updated_at
  BEFORE UPDATE ON qr_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_redemptions ENABLE ROW LEVEL SECURITY;

-- QR Codes policies

-- Clients can view their own QR codes
CREATE POLICY "clients_view_own_qr_codes" ON qr_codes
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE user_id = auth.uid()
    )
  );

-- Clients can create QR codes for themselves
CREATE POLICY "clients_create_own_qr_codes" ON qr_codes
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients
      WHERE user_id = auth.uid()
    )
  );

-- Asesor de Ventas can view QR codes from their assigned clients
CREATE POLICY "asesor_ventas_view_qr_codes" ON qr_codes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON ur.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
        AND ur.role = 'asesor_de_ventas'
        AND ur.status = 'active'
        AND (
          -- Direct assignment
          EXISTS (
            SELECT 1 FROM client_assignments ca
            WHERE ca.client_id = qr_codes.client_id
              AND ca.user_profile_id = up.id
              AND ca.is_active = TRUE
              AND ca.deleted_at IS NULL
          )
          OR
          -- Brand membership
          EXISTS (
            SELECT 1 FROM client_brand_memberships cbm
            WHERE cbm.client_id = qr_codes.client_id
              AND cbm.brand_id = ur.brand_id
              AND cbm.deleted_at IS NULL
          )
        )
    )
  );

-- Admin can manage all QR codes in tenant
CREATE POLICY "admin_manage_qr_codes" ON qr_codes
  FOR ALL
  USING (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      JOIN user_roles ur ON ur.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
        AND ur.role = 'admin'
        AND ur.status = 'active'
    )
  );

-- QR Redemptions policies

-- Asesor de Ventas can view their own redemptions
CREATE POLICY "asesor_ventas_view_own_redemptions" ON qr_redemptions
  FOR SELECT
  USING (
    redeemed_by IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Asesor de Ventas can create redemptions
CREATE POLICY "asesor_ventas_create_redemptions" ON qr_redemptions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON ur.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
        AND up.id = qr_redemptions.redeemed_by
        AND ur.role = 'asesor_de_ventas'
        AND ur.status = 'active'
    )
  );

-- Clients can view redemptions of their QR codes
CREATE POLICY "clients_view_qr_redemptions" ON qr_redemptions
  FOR SELECT
  USING (
    qr_code_id IN (
      SELECT qc.id FROM qr_codes qc
      JOIN clients c ON c.id = qc.client_id
      WHERE c.user_id = auth.uid()
    )
  );

-- Admin can manage all redemptions in tenant
CREATE POLICY "admin_manage_qr_redemptions" ON qr_redemptions
  FOR ALL
  USING (
    tenant_id IN (
      SELECT up.tenant_id FROM user_profiles up
      JOIN user_roles ur ON ur.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
        AND ur.role = 'admin'
        AND ur.status = 'active'
    )
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE qr_codes IS 'QR codes generated by clients for promotions/discounts';
COMMENT ON TABLE qr_redemptions IS 'Track each QR code redemption for billing and analytics';
COMMENT ON FUNCTION redeem_qr_code IS 'Atomic function to redeem QR code with "first to scan wins" logic';
COMMENT ON COLUMN qr_codes.max_redemptions IS 'Number of times this QR can be redeemed (1=single use)';
COMMENT ON COLUMN qr_redemptions.distributor_id IS 'Distributor who redeemed, used for billing to brand';

COMMIT;
