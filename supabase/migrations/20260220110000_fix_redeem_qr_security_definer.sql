-- Fix redeem_qr_code function: change to SECURITY DEFINER
-- The function performs SELECT ... FOR UPDATE, INSERT, and UPDATE on qr_codes
-- and qr_redemptions. The asesor_de_ventas RLS policies only grant SELECT on
-- qr_codes and INSERT on qr_redemptions — FOR UPDATE and UPDATE are blocked.
-- Since the API already validates the user has asesor_de_ventas role before
-- calling this RPC, SECURITY DEFINER is safe here.

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
SECURITY DEFINER
SET search_path = public
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
      'brand_id', v_qr_record.brand_id,
      'discount_type', v_qr_record.discount_type,
      'discount_value', v_qr_record.discount_value,
      'discount_description', v_qr_record.discount_description,
      'redemptions_remaining', v_qr_record.max_redemptions - v_qr_record.redemption_count - 1
    );
END;
$$;
