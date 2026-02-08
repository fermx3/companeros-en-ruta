-- ============================================================================
-- Migration: Make orders.brand_id nullable
-- ============================================================================
-- For asesor_de_ventas who work for distributors (not specific brands),
-- orders can contain products from multiple brands, so brand_id should be NULL.
-- ============================================================================

ALTER TABLE orders ALTER COLUMN brand_id DROP NOT NULL;

COMMENT ON COLUMN orders.brand_id IS
'Optional brand association. NULL for multi-brand orders from asesor_de_ventas, NOT NULL for single-brand orders from promotors.';
