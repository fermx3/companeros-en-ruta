-- Create KPI definitions catalog table
-- Admin configures available KPIs; Brand Manager selects up to 5

-- 1. KPI definitions table
CREATE TABLE kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  computation_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Index for common queries
CREATE INDEX idx_kpi_definitions_tenant_active
  ON kpi_definitions(tenant_id, is_active)
  WHERE is_active = true;

COMMENT ON TABLE kpi_definitions IS 'Catalog of available KPI metrics configurable by admin';
COMMENT ON COLUMN kpi_definitions.slug IS 'Unique identifier for the KPI within a tenant';
COMMENT ON COLUMN kpi_definitions.computation_type IS 'Determines which calculation logic to apply';

-- 2. Add cooldown tracking column to brands
ALTER TABLE brands
  ADD COLUMN dashboard_metrics_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN brands.dashboard_metrics_updated_at IS 'Tracks when KPI selection was last changed (24hr cooldown)';

-- 3. RLS policies
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kpi_definitions_tenant_isolation"
  ON kpi_definitions
  FOR ALL
  USING (tenant_id IN (
    SELECT up.tenant_id FROM user_profiles up
    WHERE up.user_id = auth.uid()
  ));

-- 4. Seed default KPI definitions for all existing tenants
INSERT INTO kpi_definitions (tenant_id, slug, label, description, icon, color, computation_type, is_active, display_order)
SELECT
  t.id,
  kpi.slug,
  kpi.label,
  kpi.description,
  kpi.icon,
  kpi.color,
  kpi.computation_type,
  true,
  kpi.display_order
FROM tenants t
CROSS JOIN (
  VALUES
    ('volume',         'Avances de Volumen',  'Suma del monto total de ordenes en el periodo',                      'TrendingUp',   'blue',   'volume',         0),
    ('reach_mix',      'Reach y Mix',         'Porcentaje de clientes visitados y diversidad de productos',         'Target',        'green',  'reach_mix',      1),
    ('assortment',     'Assortment',          'Porcentaje promedio de productos presentes por visita',              'Package',       'purple', 'assortment',     2),
    ('market_share',   'Market Share',        'Participacion de productos propios vs competencia',                  'PieChart',      'orange', 'market_share',   3),
    ('share_of_shelf', 'Share of Shelf',      'Presencia de materiales POP y ejecucion de exhibiciones',           'LayoutGrid',    'red',    'share_of_shelf', 4)
) AS kpi(slug, label, description, icon, color, computation_type, display_order);
