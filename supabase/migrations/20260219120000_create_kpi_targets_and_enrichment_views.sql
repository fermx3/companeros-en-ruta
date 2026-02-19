-- ============================================================================
-- Migration: KPI Targets table, assessment enrichment columns, and KPI views
-- ============================================================================

-- ============================================================================
-- PART 1: kpi_targets table
-- ============================================================================

CREATE TABLE kpi_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  kpi_slug VARCHAR(50) NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'weekly', 'quarterly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  target_value NUMERIC(14,2) NOT NULL CHECK (target_value > 0),
  target_unit VARCHAR(20) NOT NULL,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT kpi_targets_period_valid CHECK (period_end >= period_start)
);

-- Expression-based unique index (UNIQUE constraint doesn't support COALESCE)
CREATE UNIQUE INDEX idx_kpi_targets_unique_target
  ON kpi_targets (
    tenant_id, brand_id, kpi_slug, period_type, period_start,
    COALESCE(zone_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  WHERE deleted_at IS NULL;

CREATE INDEX idx_kpi_targets_brand_slug_period
  ON kpi_targets (brand_id, kpi_slug, period_start);

CREATE INDEX idx_kpi_targets_tenant
  ON kpi_targets (tenant_id);

ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kpi_targets_tenant_isolation"
  ON kpi_targets
  FOR ALL
  USING (tenant_id IN (
    SELECT up.tenant_id FROM user_profiles up
    WHERE up.user_id = auth.uid()
  ));

-- ============================================================================
-- PART 2: Assessment enrichment columns
-- ============================================================================

ALTER TABLE visit_brand_product_assessments
  ADD COLUMN IF NOT EXISTS facing_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE visit_brand_product_assessments
  ADD COLUMN IF NOT EXISTS shelf_position VARCHAR(30);

ALTER TABLE visit_competitor_assessments
  ADD COLUMN IF NOT EXISTS facing_count INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- PART 3: Base fact views (Layer 1)
-- ============================================================================

-- v_order_line_facts: Unified order line items with product/client/zone context
CREATE OR REPLACE VIEW v_order_line_facts AS
SELECT
  'order'::TEXT AS source,
  o.id AS order_id,
  oi.id AS line_id,
  o.brand_id,
  o.tenant_id,
  o.order_date,
  o.client_id,
  c.zone_id,
  z.name AS zone_name,
  c.market_id,
  m.name AS market_name,
  oi.product_id,
  oi.product_variant_id AS variant_id,
  oi.quantity_ordered AS quantity,
  oi.unit_price,
  oi.line_total,
  (oi.quantity_ordered * COALESCE(
    oi.weight_per_unit_grams,
    pv.weight_grams,
    p.weight_grams
  ) / 1000.0) AS weight_kg,
  DATE_TRUNC('month', o.order_date)::DATE AS period_month,
  DATE_TRUNC('week', o.order_date)::DATE AS period_week
FROM orders o
JOIN order_items oi ON oi.order_id = o.id AND oi.deleted_at IS NULL
JOIN clients c ON c.id = o.client_id
LEFT JOIN zones z ON z.id = c.zone_id
LEFT JOIN markets m ON m.id = c.market_id
LEFT JOIN products p ON p.id = oi.product_id
LEFT JOIN product_variants pv ON pv.id = oi.product_variant_id
WHERE o.deleted_at IS NULL
  AND o.order_status NOT IN ('cancelled', 'returned')
  AND o.brand_id IS NOT NULL

UNION ALL

SELECT
  'visit_order'::TEXT AS source,
  vo.id AS order_id,
  voi.id AS line_id,
  v.brand_id,
  vo.tenant_id,
  vo.order_date,
  vo.client_id,
  c.zone_id,
  z.name AS zone_name,
  c.market_id,
  m.name AS market_name,
  voi.product_id,
  voi.product_variant_id AS variant_id,
  voi.quantity_ordered AS quantity,
  voi.unit_price,
  voi.line_total,
  (voi.quantity_ordered * COALESCE(
    pv.weight_grams,
    p.weight_grams
  ) / 1000.0) AS weight_kg,
  DATE_TRUNC('month', vo.order_date)::DATE AS period_month,
  DATE_TRUNC('week', vo.order_date)::DATE AS period_week
FROM visit_orders vo
JOIN visits v ON v.id = vo.visit_id
JOIN visit_order_items voi ON voi.visit_order_id = vo.id AND voi.deleted_at IS NULL
JOIN clients c ON c.id = vo.client_id
LEFT JOIN zones z ON z.id = c.zone_id
LEFT JOIN markets m ON m.id = c.market_id
LEFT JOIN products p ON p.id = voi.product_id
LEFT JOIN product_variants pv ON pv.id = voi.product_variant_id
WHERE vo.deleted_at IS NULL
  AND vo.order_status NOT IN ('cancelled')
  AND v.brand_id IS NOT NULL;

ALTER VIEW v_order_line_facts SET (security_invoker = on);


-- v_visit_assessment_facts: Visits with client/zone/market context
CREATE OR REPLACE VIEW v_visit_assessment_facts AS
SELECT
  v.id AS visit_id,
  v.brand_id,
  v.tenant_id,
  v.visit_date,
  DATE_TRUNC('month', v.visit_date)::DATE AS period_month,
  DATE_TRUNC('week', v.visit_date)::DATE AS period_week,
  v.client_id,
  c.zone_id,
  z.name AS zone_name,
  c.market_id,
  m.name AS market_name,
  ct.category AS client_type_category,
  v.promotor_id,
  v.visit_status,
  v.workflow_status
FROM visits v
JOIN clients c ON c.id = v.client_id
LEFT JOIN zones z ON z.id = c.zone_id
LEFT JOIN markets m ON m.id = c.market_id
LEFT JOIN client_types ct ON ct.id = c.client_type_id
WHERE v.deleted_at IS NULL
  AND v.brand_id IS NOT NULL;

ALTER VIEW v_visit_assessment_facts SET (security_invoker = on);


-- ============================================================================
-- PART 4: KPI metric views (Layer 2)
-- ============================================================================

-- v_kpi_volume: Revenue and weight by brand/period/zone/market
CREATE OR REPLACE VIEW v_kpi_volume AS
SELECT
  brand_id,
  tenant_id,
  period_month,
  period_week,
  zone_id,
  zone_name,
  market_id,
  market_name,
  SUM(line_total) AS revenue_mxn,
  SUM(COALESCE(weight_kg, 0)) / 1000.0 AS weight_tons,
  COUNT(DISTINCT order_id) AS order_count,
  COUNT(DISTINCT client_id) AS unique_clients
FROM v_order_line_facts
GROUP BY brand_id, tenant_id, period_month, period_week,
         zone_id, zone_name, market_id, market_name;

ALTER VIEW v_kpi_volume SET (security_invoker = on);


-- v_kpi_reach: Unique clients visited vs total active members
CREATE OR REPLACE VIEW v_kpi_reach AS
SELECT
  vaf.brand_id,
  vaf.tenant_id,
  vaf.period_month,
  vaf.zone_id,
  vaf.zone_name,
  vaf.market_id,
  vaf.market_name,
  COUNT(DISTINCT vaf.client_id) AS clients_visited,
  mbr.total_active_members,
  CASE
    WHEN mbr.total_active_members > 0
    THEN ROUND(COUNT(DISTINCT vaf.client_id)::NUMERIC / mbr.total_active_members * 100, 1)
    ELSE 0
  END AS reach_pct
FROM v_visit_assessment_facts vaf
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS total_active_members
  FROM client_brand_memberships cbm
  WHERE cbm.brand_id = vaf.brand_id
    AND cbm.membership_status = 'active'
    AND cbm.deleted_at IS NULL
) mbr ON TRUE
GROUP BY vaf.brand_id, vaf.tenant_id, vaf.period_month,
         vaf.zone_id, vaf.zone_name, vaf.market_id, vaf.market_name,
         mbr.total_active_members;

ALTER VIEW v_kpi_reach SET (security_invoker = on);


-- v_kpi_mix: Channel diversity (distinct markets visited)
CREATE OR REPLACE VIEW v_kpi_mix AS
SELECT
  brand_id,
  tenant_id,
  period_month,
  COUNT(DISTINCT market_id) AS distinct_markets_visited,
  COUNT(DISTINCT client_type_category) AS distinct_client_types_visited,
  COUNT(DISTINCT client_id) AS total_clients_visited
FROM v_visit_assessment_facts
WHERE market_id IS NOT NULL
GROUP BY brand_id, tenant_id, period_month;

ALTER VIEW v_kpi_mix SET (security_invoker = on);


-- v_kpi_assortment: Average % of brand products present per visit
CREATE OR REPLACE VIEW v_kpi_assortment AS
SELECT
  vaf.brand_id,
  vaf.tenant_id,
  vaf.period_month,
  vaf.zone_id,
  vaf.zone_name,
  COUNT(DISTINCT vaf.visit_id) AS visit_count,
  ROUND(AVG(
    CASE
      WHEN per_visit.total_assessed > 0
      THEN per_visit.present_count::NUMERIC / per_visit.total_assessed * 100
      ELSE 0
    END
  ), 1) AS avg_assortment_pct
FROM v_visit_assessment_facts vaf
JOIN LATERAL (
  SELECT
    COUNT(*) AS total_assessed,
    COUNT(*) FILTER (WHERE bpa.is_product_present = TRUE) AS present_count
  FROM visit_brand_product_assessments bpa
  WHERE bpa.visit_id = vaf.visit_id
) per_visit ON TRUE
WHERE per_visit.total_assessed > 0
GROUP BY vaf.brand_id, vaf.tenant_id, vaf.period_month,
         vaf.zone_id, vaf.zone_name;

ALTER VIEW v_kpi_assortment SET (security_invoker = on);


-- v_kpi_market_share: Brand presence vs competitors (by count + facings)
CREATE OR REPLACE VIEW v_kpi_market_share AS
SELECT
  vaf.brand_id,
  vaf.tenant_id,
  vaf.period_month,
  vaf.zone_id,
  vaf.zone_name,
  COALESCE(brand_data.brand_present, 0) AS brand_present,
  COALESCE(comp_data.competitor_present, 0) AS competitor_present,
  CASE
    WHEN COALESCE(brand_data.brand_present, 0) + COALESCE(comp_data.competitor_present, 0) > 0
    THEN ROUND(
      COALESCE(brand_data.brand_present, 0)::NUMERIC /
      (COALESCE(brand_data.brand_present, 0) + COALESCE(comp_data.competitor_present, 0)) * 100, 1
    )
    ELSE 0
  END AS share_pct,
  COALESCE(brand_data.brand_facings, 0) AS brand_facings,
  COALESCE(comp_data.competitor_facings, 0) AS competitor_facings,
  CASE
    WHEN COALESCE(brand_data.brand_facings, 0) + COALESCE(comp_data.competitor_facings, 0) > 0
    THEN ROUND(
      COALESCE(brand_data.brand_facings, 0)::NUMERIC /
      (COALESCE(brand_data.brand_facings, 0) + COALESCE(comp_data.competitor_facings, 0)) * 100, 1
    )
    ELSE 0
  END AS share_by_facings_pct
FROM (
  SELECT DISTINCT brand_id, tenant_id, period_month, zone_id, zone_name
  FROM v_visit_assessment_facts
) vaf
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE bpa.is_product_present) AS brand_present,
    SUM(bpa.facing_count) AS brand_facings
  FROM v_visit_assessment_facts inner_vaf
  JOIN visit_brand_product_assessments bpa ON bpa.visit_id = inner_vaf.visit_id
  WHERE inner_vaf.brand_id = vaf.brand_id
    AND inner_vaf.tenant_id = vaf.tenant_id
    AND inner_vaf.period_month = vaf.period_month
    AND COALESCE(inner_vaf.zone_id, '00000000-0000-0000-0000-000000000000'::uuid) =
        COALESCE(vaf.zone_id, '00000000-0000-0000-0000-000000000000'::uuid)
) brand_data ON TRUE
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS competitor_present,
    SUM(ca.facing_count) AS competitor_facings
  FROM v_visit_assessment_facts inner_vaf
  JOIN visit_competitor_assessments ca ON ca.visit_id = inner_vaf.visit_id
  WHERE inner_vaf.brand_id = vaf.brand_id
    AND inner_vaf.tenant_id = vaf.tenant_id
    AND inner_vaf.period_month = vaf.period_month
    AND COALESCE(inner_vaf.zone_id, '00000000-0000-0000-0000-000000000000'::uuid) =
        COALESCE(vaf.zone_id, '00000000-0000-0000-0000-000000000000'::uuid)
) comp_data ON TRUE;

ALTER VIEW v_kpi_market_share SET (security_invoker = on);


-- v_kpi_share_of_shelf: POP + exhibitions execution (+ facings)
CREATE OR REPLACE VIEW v_kpi_share_of_shelf AS
SELECT
  vaf.brand_id,
  vaf.tenant_id,
  vaf.period_month,
  vaf.zone_id,
  vaf.zone_name,
  COALESCE(pop.pop_total, 0) AS pop_total,
  COALESCE(pop.pop_present, 0) AS pop_present,
  CASE WHEN COALESCE(pop.pop_total, 0) > 0
    THEN ROUND(pop.pop_present::NUMERIC / pop.pop_total * 100, 1) ELSE 0
  END AS pop_pct,
  COALESCE(exhib.exhib_total, 0) AS exhib_total,
  COALESCE(exhib.exhib_executed, 0) AS exhib_executed,
  CASE WHEN COALESCE(exhib.exhib_total, 0) > 0
    THEN ROUND(exhib.exhib_executed::NUMERIC / exhib.exhib_total * 100, 1) ELSE 0
  END AS exhib_pct,
  CASE
    WHEN COALESCE(pop.pop_total, 0) + COALESCE(exhib.exhib_total, 0) > 0
    THEN ROUND(
      (COALESCE(pop.pop_present, 0) + COALESCE(exhib.exhib_executed, 0))::NUMERIC /
      (COALESCE(pop.pop_total, 0) + COALESCE(exhib.exhib_total, 0)) * 100, 1
    )
    ELSE 0
  END AS combined_pct
FROM (
  SELECT DISTINCT brand_id, tenant_id, period_month, zone_id, zone_name
  FROM v_visit_assessment_facts
) vaf
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS pop_total,
    COUNT(*) FILTER (WHERE pmc.is_present) AS pop_present
  FROM v_visit_assessment_facts inner_vaf
  JOIN visit_pop_material_checks pmc ON pmc.visit_id = inner_vaf.visit_id
  WHERE inner_vaf.brand_id = vaf.brand_id
    AND inner_vaf.tenant_id = vaf.tenant_id
    AND inner_vaf.period_month = vaf.period_month
    AND COALESCE(inner_vaf.zone_id, '00000000-0000-0000-0000-000000000000'::uuid) =
        COALESCE(vaf.zone_id, '00000000-0000-0000-0000-000000000000'::uuid)
) pop ON TRUE
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS exhib_total,
    COUNT(*) FILTER (WHERE ec.is_executed) AS exhib_executed
  FROM v_visit_assessment_facts inner_vaf
  JOIN visit_exhibition_checks ec ON ec.visit_id = inner_vaf.visit_id
  WHERE inner_vaf.brand_id = vaf.brand_id
    AND inner_vaf.tenant_id = vaf.tenant_id
    AND inner_vaf.period_month = vaf.period_month
    AND COALESCE(inner_vaf.zone_id, '00000000-0000-0000-0000-000000000000'::uuid) =
        COALESCE(vaf.zone_id, '00000000-0000-0000-0000-000000000000'::uuid)
) exhib ON TRUE;

ALTER VIEW v_kpi_share_of_shelf SET (security_invoker = on);


-- ============================================================================
-- PART 5: Dashboard summary view (Layer 3)
-- ============================================================================

-- v_kpi_dashboard_summary: Cross KPI metrics with targets
CREATE OR REPLACE VIEW v_kpi_dashboard_summary AS
-- Volume
SELECT
  vol.brand_id,
  vol.tenant_id,
  vol.period_month,
  'volume'::TEXT AS kpi_slug,
  SUM(vol.revenue_mxn)::NUMERIC AS actual_value,
  kt.target_value,
  'MXN'::TEXT AS unit,
  CASE
    WHEN kt.target_value > 0
    THEN ROUND(SUM(vol.revenue_mxn)::NUMERIC / kt.target_value * 100, 1)
    ELSE NULL
  END AS achievement_pct
FROM v_kpi_volume vol
LEFT JOIN kpi_targets kt ON kt.brand_id = vol.brand_id
  AND kt.kpi_slug = 'volume'
  AND kt.period_type = 'monthly'
  AND kt.period_start = vol.period_month
  AND kt.zone_id IS NULL
  AND kt.deleted_at IS NULL
GROUP BY vol.brand_id, vol.tenant_id, vol.period_month, kt.target_value

UNION ALL

-- Reach
SELECT
  r.brand_id,
  r.tenant_id,
  r.period_month,
  'reach_mix'::TEXT AS kpi_slug,
  MAX(r.reach_pct)::NUMERIC AS actual_value,
  kt.target_value,
  '%'::TEXT AS unit,
  CASE
    WHEN kt.target_value > 0
    THEN ROUND(MAX(r.reach_pct)::NUMERIC / kt.target_value * 100, 1)
    ELSE NULL
  END AS achievement_pct
FROM v_kpi_reach r
LEFT JOIN kpi_targets kt ON kt.brand_id = r.brand_id
  AND kt.kpi_slug = 'reach_mix'
  AND kt.period_type = 'monthly'
  AND kt.period_start = r.period_month
  AND kt.zone_id IS NULL
  AND kt.deleted_at IS NULL
GROUP BY r.brand_id, r.tenant_id, r.period_month, kt.target_value

UNION ALL

-- Mix
SELECT
  mx.brand_id,
  mx.tenant_id,
  mx.period_month,
  'mix'::TEXT AS kpi_slug,
  mx.distinct_markets_visited::NUMERIC AS actual_value,
  kt.target_value,
  'channels'::TEXT AS unit,
  CASE
    WHEN kt.target_value > 0
    THEN ROUND(mx.distinct_markets_visited::NUMERIC / kt.target_value * 100, 1)
    ELSE NULL
  END AS achievement_pct
FROM v_kpi_mix mx
LEFT JOIN kpi_targets kt ON kt.brand_id = mx.brand_id
  AND kt.kpi_slug = 'mix'
  AND kt.period_type = 'monthly'
  AND kt.period_start = mx.period_month
  AND kt.zone_id IS NULL
  AND kt.deleted_at IS NULL

UNION ALL

-- Assortment
SELECT
  a.brand_id,
  a.tenant_id,
  a.period_month,
  'assortment'::TEXT AS kpi_slug,
  a.avg_assortment_pct::NUMERIC AS actual_value,
  kt.target_value,
  '%'::TEXT AS unit,
  CASE
    WHEN kt.target_value > 0
    THEN ROUND(a.avg_assortment_pct::NUMERIC / kt.target_value * 100, 1)
    ELSE NULL
  END AS achievement_pct
FROM v_kpi_assortment a
LEFT JOIN kpi_targets kt ON kt.brand_id = a.brand_id
  AND kt.kpi_slug = 'assortment'
  AND kt.period_type = 'monthly'
  AND kt.period_start = a.period_month
  AND kt.zone_id IS NULL
  AND kt.deleted_at IS NULL

UNION ALL

-- Market Share
SELECT
  ms.brand_id,
  ms.tenant_id,
  ms.period_month,
  'market_share'::TEXT AS kpi_slug,
  ms.share_pct::NUMERIC AS actual_value,
  kt.target_value,
  '%'::TEXT AS unit,
  CASE
    WHEN kt.target_value > 0
    THEN ROUND(ms.share_pct::NUMERIC / kt.target_value * 100, 1)
    ELSE NULL
  END AS achievement_pct
FROM v_kpi_market_share ms
LEFT JOIN kpi_targets kt ON kt.brand_id = ms.brand_id
  AND kt.kpi_slug = 'market_share'
  AND kt.period_type = 'monthly'
  AND kt.period_start = ms.period_month
  AND kt.zone_id IS NULL
  AND kt.deleted_at IS NULL

UNION ALL

-- Share of Shelf
SELECT
  sos.brand_id,
  sos.tenant_id,
  sos.period_month,
  'share_of_shelf'::TEXT AS kpi_slug,
  sos.combined_pct::NUMERIC AS actual_value,
  kt.target_value,
  '%'::TEXT AS unit,
  CASE
    WHEN kt.target_value > 0
    THEN ROUND(sos.combined_pct::NUMERIC / kt.target_value * 100, 1)
    ELSE NULL
  END AS achievement_pct
FROM v_kpi_share_of_shelf sos
LEFT JOIN kpi_targets kt ON kt.brand_id = sos.brand_id
  AND kt.kpi_slug = 'share_of_shelf'
  AND kt.period_type = 'monthly'
  AND kt.period_start = sos.period_month
  AND kt.zone_id IS NULL
  AND kt.deleted_at IS NULL;

ALTER VIEW v_kpi_dashboard_summary SET (security_invoker = on);
