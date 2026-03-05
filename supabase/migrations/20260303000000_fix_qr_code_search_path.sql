-- Fix generate_qr_code() and set_qr_code_default() functions
-- that broke after search_path was set to '' in migration 20260221170000.
-- Both functions reference unqualified objects (tables/functions) which
-- cannot be resolved with an empty search_path.

-- Recreate generate_qr_code with schema-qualified table reference
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SET search_path = ''
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

    -- Check if exists (schema-qualified)
    SELECT EXISTS(SELECT 1 FROM public.qr_codes WHERE code = new_code) INTO code_exists;

    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$;

-- Recreate set_qr_code_default with schema-qualified function call
CREATE OR REPLACE FUNCTION public.set_qr_code_default()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := public.generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$;
