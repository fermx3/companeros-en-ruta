-- Fix product_public_id_seq to be in sync with existing data
-- This resolves "duplicate key value violates unique constraint products_public_id_key" errors

DO $$
DECLARE
  max_num INT;
BEGIN
  -- Extract the numeric part from existing public_ids (format: PRD-XXXX)
  SELECT COALESCE(MAX(CAST(SUBSTRING(public_id FROM 5) AS INT)), 0)
  INTO max_num
  FROM public.products
  WHERE public_id IS NOT NULL AND public_id ~ '^PRD-[0-9]+$';

  -- Set the sequence to start from max + 1
  IF max_num > 0 THEN
    PERFORM setval('public.product_public_id_seq', max_num, true);
    RAISE NOTICE 'product_public_id_seq set to %', max_num;
  ELSE
    -- If no products exist, reset to 1 (minimum value) with is_called=false
    -- so next call to nextval() returns 1
    PERFORM setval('public.product_public_id_seq', 1, false);
    RAISE NOTICE 'product_public_id_seq reset to 1';
  END IF;
END;
$$;

-- Also fix product_variant_public_id_seq
DO $$
DECLARE
  max_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(public_id FROM 5) AS INT)), 0)
  INTO max_num
  FROM public.product_variants
  WHERE public_id IS NOT NULL AND public_id ~ '^PRV-[0-9]+$';

  IF max_num > 0 THEN
    PERFORM setval('public.product_variant_public_id_seq', max_num, true);
    RAISE NOTICE 'product_variant_public_id_seq set to %', max_num;
  ELSE
    PERFORM setval('public.product_variant_public_id_seq', 1, false);
    RAISE NOTICE 'product_variant_public_id_seq reset to 1';
  END IF;
END;
$$;
