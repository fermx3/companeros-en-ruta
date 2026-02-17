-- Add include_in_assessment flag to products table
-- Allows Brand Managers to control which products appear in the Promotor's assessment wizard
ALTER TABLE public.products
ADD COLUMN include_in_assessment BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.products.include_in_assessment IS 'When false, product is excluded from the Promotor assessment wizard (Stage 1)';
