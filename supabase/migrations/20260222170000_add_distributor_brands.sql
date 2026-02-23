-- Migration: Add distributor_brands junction table, distributor_id to visit_orders, and promotor RLS on distributors
-- Purpose: Enable distributor-brand relationships and order creation from visits

-- 1. Junction table: distributor_brands
CREATE TABLE IF NOT EXISTS distributor_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT distributor_brands_unique UNIQUE (distributor_id, brand_id)
);

CREATE INDEX idx_distributor_brands_distributor ON distributor_brands(distributor_id);
CREATE INDEX idx_distributor_brands_brand ON distributor_brands(brand_id);
CREATE INDEX idx_distributor_brands_tenant ON distributor_brands(tenant_id);

-- RLS on distributor_brands
ALTER TABLE distributor_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_manage_distributor_brands"
  ON distributor_brands FOR ALL TO public
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

CREATE POLICY "promotors_select_distributor_brands"
  ON distributor_brands FOR SELECT TO public
  USING (
    tenant_id IN (
      SELECT ur.tenant_id FROM user_roles ur
      JOIN user_profiles up ON ur.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
        AND ur.role = 'promotor'
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
  );

-- 2. Add distributor_id to visit_orders
ALTER TABLE visit_orders
  ADD COLUMN IF NOT EXISTS distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_visit_orders_distributor_id ON visit_orders(distributor_id);

-- 3. RLS: promotors can SELECT active distributors in their tenant
CREATE POLICY "promotors_select_distributors"
  ON public.distributors FOR SELECT TO public
  USING (
    deleted_at IS NULL
    AND status = 'active'
    AND tenant_id IN (
      SELECT ur.tenant_id FROM user_roles ur
      JOIN user_profiles up ON ur.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
        AND ur.role = 'promotor'
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
  );
