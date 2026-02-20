-- Migration: fix_field_users_products_rls
-- Purpose: Add promotor and asesor_de_ventas to field_users_select_products and
--          field_users_select_product_variants RLS policies.
--
-- Problem:
--   The original policies only allow supervisor/advisor/market_analyst roles.
--   Promotors and asesores get empty product lists during visit assessments.
--
-- Solution:
--   Rewrite both policies to use get_field_user_tenant_id() helper
--   (created in 20260220120000_optimize_rls_policies), which already includes
--   promotor and asesor_de_ventas in its role check.

BEGIN;

-- 1. Rewrite field_users_select_products
DROP POLICY IF EXISTS "field_users_select_products" ON public.products;
CREATE POLICY "field_users_select_products" ON public.products
  FOR SELECT USING (
    deleted_at IS NULL
    AND is_active = true
    AND tenant_id = get_field_user_tenant_id()
  );

-- 2. Rewrite field_users_select_product_variants
DROP POLICY IF EXISTS "field_users_select_product_variants" ON public.product_variants;
CREATE POLICY "field_users_select_product_variants" ON public.product_variants
  FOR SELECT USING (
    deleted_at IS NULL
    AND is_active = true
    AND product_id IN (
      SELECT p.id
      FROM products p
      WHERE p.tenant_id = get_field_user_tenant_id()
        AND p.deleted_at IS NULL
        AND p.is_active = true
    )
  );

COMMIT;
