-- ============================================================================
-- Migration: Rename products.code to products.sku
-- ============================================================================
-- The 'code' column serves as the SKU (Stock Keeping Unit) identifier.
-- Renaming for clarity and industry standard naming.
-- ============================================================================

BEGIN;

-- 1. Rename the column
ALTER TABLE products RENAME COLUMN code TO sku;

-- 2. Update any indexes that reference 'code'
-- Check for existing indexes and rename if needed
DROP INDEX IF EXISTS idx_products_code;
CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);

-- 3. Add comment for documentation
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product identifier code';

COMMIT;
