-- ============================================================================
-- Migration: Rename advisor → promotor across the entire database
-- ============================================================================
-- This migration uses ALTER TYPE ... ADD VALUE to avoid breaking policies
-- that reference user_roles.role. The old 'advisor' value remains in the enum
-- but is deprecated and unused.
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 0: Drop all dependent views
-- ============================================================================

DROP VIEW IF EXISTS active_user_roles CASCADE;
DROP VIEW IF EXISTS active_visits CASCADE;
DROP VIEW IF EXISTS active_visit_assessments CASCADE;
DROP VIEW IF EXISTS active_visit_orders CASCADE;
DROP VIEW IF EXISTS active_visit_order_items CASCADE;
DROP VIEW IF EXISTS active_visit_communication_plans CASCADE;

-- ============================================================================
-- PHASE 1: Drop constraints that reference 'advisor' in enum
-- ============================================================================

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_non_global_scope_check;

-- ============================================================================
-- PHASE 2: Drop RLS policies that specifically check for 'advisor' role
-- These need to be recreated with 'promotor' instead
-- ============================================================================

-- advisor_assignments policies
DROP POLICY IF EXISTS "Admin and brand managers can manage advisor assignments" ON advisor_assignments;
DROP POLICY IF EXISTS "Users can view advisor assignments in their tenant" ON advisor_assignments;

-- advisor_client_assignments policies
DROP POLICY IF EXISTS "Advisors can view their assigned clients" ON advisor_client_assignments;
DROP POLICY IF EXISTS "Admin and brand managers can manage client assignments" ON advisor_client_assignments;

-- visits policies
DROP POLICY IF EXISTS "advisors_manage_visits" ON visits;
DROP POLICY IF EXISTS "advisors_select_visits" ON visits;

-- visit_orders policies
DROP POLICY IF EXISTS "advisors_manage_visit_orders" ON visit_orders;
DROP POLICY IF EXISTS "advisors_select_visit_orders" ON visit_orders;

-- visit_order_items policies
DROP POLICY IF EXISTS "policy_visit_order_items_advisor_select" ON visit_order_items;
DROP POLICY IF EXISTS "policy_visit_order_items_advisor_insert" ON visit_order_items;
DROP POLICY IF EXISTS "policy_visit_order_items_advisor_update" ON visit_order_items;
DROP POLICY IF EXISTS "policy_visit_order_items_advisor_delete" ON visit_order_items;

-- visit_assessments policies
DROP POLICY IF EXISTS "advisors_manage_visit_assessments" ON visit_assessments;
DROP POLICY IF EXISTS "advisors_select_visit_assessments" ON visit_assessments;

-- visit_inventories policies
DROP POLICY IF EXISTS "advisors_manage_visit_inventories" ON visit_inventories;
DROP POLICY IF EXISTS "advisors_select_visit_inventories" ON visit_inventories;

-- visit_communication_plans policies
DROP POLICY IF EXISTS "advisors_manage_visit_communication_plans" ON visit_communication_plans;
DROP POLICY IF EXISTS "advisors_select_visit_communication_plans" ON visit_communication_plans;

-- order_items policies
DROP POLICY IF EXISTS "policy_order_items_advisor" ON order_items;

-- orders policies
DROP POLICY IF EXISTS "advisors_select_orders" ON orders;

-- points_transactions policies
DROP POLICY IF EXISTS "advisors_select_points_transactions" ON points_transactions;

-- promotion_redemptions policies
DROP POLICY IF EXISTS "advisors_select_promotion_redemptions" ON promotion_redemptions;

-- reward_redemptions policies
DROP POLICY IF EXISTS "advisors_select_reward_redemptions" ON reward_redemptions;

-- client_tier_assignments policies
DROP POLICY IF EXISTS "advisors_select_client_tier_assignments" ON client_tier_assignments;

-- user_roles policy that references 'advisor'
DROP POLICY IF EXISTS "brand_managers_manage_roles" ON user_roles;

-- ============================================================================
-- PHASE 3: Remove default values that depend on functions, then drop functions
-- ============================================================================

-- Remove defaults first to break dependencies
ALTER TABLE advisor_assignments ALTER COLUMN public_id DROP DEFAULT;
ALTER TABLE advisor_client_assignments ALTER COLUMN public_id DROP DEFAULT;

-- Now drop the functions
DROP FUNCTION IF EXISTS generate_advisor_assignment_public_id();
DROP FUNCTION IF EXISTS generate_advisor_client_assignment_public_id();

-- ============================================================================
-- PHASE 4: Add 'promotor' to enum (without removing 'advisor')
-- This avoids breaking the 200+ policies that reference user_roles.role
-- ============================================================================

-- Add the new value to the enum
-- Note: 'advisor' remains in the enum but will be unused
ALTER TYPE user_role_type_enum ADD VALUE IF NOT EXISTS 'promotor';

COMMIT;

-- Start a new transaction because ADD VALUE can't be in the same transaction
-- as the UPDATE that uses the new value
BEGIN;

-- Update existing 'advisor' values to 'promotor'
UPDATE user_roles SET role = 'promotor' WHERE role = 'advisor';

-- ============================================================================
-- PHASE 5: Rename tables
-- ============================================================================

ALTER TABLE advisor_assignments RENAME TO promotor_assignments;
ALTER TABLE advisor_client_assignments RENAME TO promotor_client_assignments;

-- ============================================================================
-- PHASE 6: Rename columns
-- ============================================================================

-- visits table
ALTER TABLE visits RENAME COLUMN advisor_id TO promotor_id;
ALTER TABLE visits RENAME COLUMN advisor_notes TO promotor_notes;

-- visit_orders table
ALTER TABLE visit_orders RENAME COLUMN advisor_id TO promotor_id;

-- visit_order_items table
ALTER TABLE visit_order_items RENAME COLUMN advisor_notes TO promotor_notes;

-- promotor_client_assignments table (after rename)
ALTER TABLE promotor_client_assignments RENAME COLUMN advisor_id TO promotor_id;

-- ============================================================================
-- PHASE 7: Rename advisor enum types
-- ============================================================================

ALTER TYPE advisor_experience_level_enum RENAME TO promotor_experience_level_enum;
ALTER TYPE advisor_specialization_enum RENAME TO promotor_specialization_enum;

-- ============================================================================
-- PHASE 8: Update comments
-- ============================================================================

COMMENT ON TABLE promotor_assignments IS 'Promotor-specific information: assigned zone, specialization and metrics';
COMMENT ON TABLE promotor_client_assignments IS 'Assignment of specific clients to promotors';
COMMENT ON COLUMN visits.promotor_id IS 'promotor que realiza la visita';
COMMENT ON COLUMN visits.promotor_notes IS 'observaciones privadas del promotor';
COMMENT ON COLUMN visit_orders.promotor_id IS 'promotor que registra la compra';
COMMENT ON COLUMN visit_order_items.promotor_notes IS 'Observaciones del promotor sobre este item';

-- ============================================================================
-- PHASE 9: Create new functions
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_promotor_assignment_public_id()
RETURNS character varying
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'PA-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM promotor_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION generate_promotor_client_assignment_public_id()
RETURNS character varying
LANGUAGE plpgsql
AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'PCA-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM promotor_client_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;

-- Update default for public_id column in promotor_assignments
ALTER TABLE promotor_assignments
    ALTER COLUMN public_id SET DEFAULT generate_promotor_assignment_public_id();

-- Update default for public_id column in promotor_client_assignments
ALTER TABLE promotor_client_assignments
    ALTER COLUMN public_id SET DEFAULT generate_promotor_client_assignment_public_id();

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_promotor_assignment_public_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION generate_promotor_client_assignment_public_id() TO anon, authenticated, service_role;

-- ============================================================================
-- PHASE 10: Recreate constraint with 'promotor'
-- ============================================================================

ALTER TABLE user_roles ADD CONSTRAINT user_roles_non_global_scope_check CHECK (
    ((role = ANY (ARRAY['supervisor'::user_role_type_enum, 'promotor'::user_role_type_enum, 'market_analyst'::user_role_type_enum]))
     AND (scope = ANY (ARRAY['tenant'::user_role_scope_enum, 'brand'::user_role_scope_enum])))
    OR (role <> ALL (ARRAY['supervisor'::user_role_type_enum, 'promotor'::user_role_type_enum, 'market_analyst'::user_role_type_enum]))
);

-- ============================================================================
-- PHASE 11: Recreate views with 'promotor' column names
-- ============================================================================

-- active_user_roles view
CREATE VIEW active_user_roles AS
SELECT ur.id,
    ur.user_profile_id,
    ur.tenant_id,
    ur.brand_id,
    ur.role,
    ur.scope,
    ur.is_primary,
    ur.granted_by,
    ur.granted_at,
    ur.expires_at,
    ur.status,
    ur.permissions,
    ur.created_at,
    ur.updated_at,
    ur.deleted_at,
    is_role_active(ur.status, ur.expires_at, ur.deleted_at) AS is_currently_active
FROM user_roles ur
    JOIN user_profiles up ON ur.user_profile_id = up.id
    JOIN tenants t ON ur.tenant_id = t.id
    LEFT JOIN brands b ON ur.brand_id = b.id
WHERE up.deleted_at IS NULL
    AND t.deleted_at IS NULL
    AND (ur.brand_id IS NULL OR b.deleted_at IS NULL)
    AND is_role_active(ur.status, ur.expires_at, ur.deleted_at);

-- active_visits view (with promotor columns)
CREATE VIEW active_visits AS
SELECT v.id,
    v.public_id,
    v.tenant_id,
    v.promotor_id,
    v.client_id,
    v.visit_date,
    v.visit_time_start,
    v.visit_time_end,
    v.visit_type,
    v.visit_status,
    v.workflow_status,
    v.location_coordinates,
    v.check_in_time,
    v.check_out_time,
    v.duration_minutes,
    v.visit_objective,
    v.visit_notes,
    v.next_visit_date,
    v.client_satisfaction_rating,
    v.promotor_notes,
    v.supervisor_notes,
    v.requires_follow_up,
    v.follow_up_reason,
    v.weather_conditions,
    v.visit_attachments,
    v.metadata,
    v.created_at,
    v.updated_at,
    v.deleted_at,
    t.name AS tenant_name,
    up.first_name AS promotor_first_name,
    up.last_name AS promotor_last_name,
    up.email AS promotor_email,
    c.business_name AS client_business_name,
    c.owner_name AS client_owner_name,
    z.name AS client_zone_name,
    m.name AS client_market_name,
    sup.first_name AS supervisor_first_name,
    sup.last_name AS supervisor_last_name,
    CASE
        WHEN v.check_in_time IS NOT NULL AND v.check_out_time IS NULL THEN EXTRACT(epoch FROM now() - v.check_in_time) / 60::numeric
        ELSE v.duration_minutes::numeric
    END AS effective_duration_minutes,
    CASE
        WHEN v.visit_status = 'completed'::visit_status_enum AND v.workflow_status = 'completed'::visit_workflow_status_enum THEN 'fully_completed'::text
        WHEN v.visit_status = 'completed'::visit_status_enum AND v.workflow_status <> 'completed'::visit_workflow_status_enum THEN 'visit_completed_workflow_pending'::text
        WHEN v.visit_status = 'in_progress'::visit_status_enum THEN 'in_progress'::text
        WHEN v.visit_date < CURRENT_DATE AND v.visit_status = 'planned'::visit_status_enum THEN 'overdue'::text
        ELSE v.visit_status::text
    END AS overall_status,
    CURRENT_DATE - v.visit_date AS days_since_visit,
    CASE
        WHEN v.next_visit_date IS NOT NULL THEN v.next_visit_date - CURRENT_DATE
        ELSE NULL::integer
    END AS days_until_next_visit
FROM visits v
    JOIN tenants t ON v.tenant_id = t.id
    JOIN user_profiles up ON v.promotor_id = up.id
    JOIN clients c ON v.client_id = c.id
    JOIN zones z ON c.zone_id = z.id
    JOIN markets m ON c.market_id = m.id
    LEFT JOIN user_profiles sup ON up.manager_id = sup.id
WHERE v.deleted_at IS NULL AND t.deleted_at IS NULL AND up.deleted_at IS NULL AND c.deleted_at IS NULL
ORDER BY v.visit_date DESC, v.created_at DESC;

-- active_visit_assessments view (with promotor columns)
CREATE VIEW active_visit_assessments AS
SELECT va.id,
    va.public_id,
    va.tenant_id,
    va.visit_id,
    va.product_id,
    va.product_variant_id,
    va.assessment_type,
    va.is_present,
    va.stock_level,
    va.stock_quantity,
    va.current_price,
    va.suggested_price,
    va.price_variance_percent,
    va.package_condition,
    va.expiration_date,
    va.shelf_position,
    va.shelf_space_cm,
    va.facing_count,
    va.competitor_present,
    va.competitor_products,
    va.competitor_prices,
    va.display_quality,
    va.promotional_materials,
    va.assessment_notes,
    va.photo_evidence_urls,
    va.requires_action,
    va.recommended_actions,
    va.assessment_score,
    va.created_at,
    va.updated_at,
    va.deleted_at,
    v.visit_date,
    v.visit_status,
    v.workflow_status AS visit_workflow_status,
    up.first_name AS promotor_first_name,
    up.last_name AS promotor_last_name,
    c.business_name AS client_business_name,
    p.name AS product_name,
    p.code AS product_code,
    pv.variant_name,
    pv.variant_code,
    b.name AS brand_name,
    t.name AS tenant_name,
    CASE
        WHEN va.suggested_price IS NOT NULL AND va.suggested_price > 0::numeric AND va.current_price IS NOT NULL THEN (va.current_price - va.suggested_price) / va.suggested_price * 100::numeric
        ELSE va.price_variance_percent
    END AS calculated_price_variance,
    CASE
        WHEN va.is_present = false THEN 'out_of_stock'::text
        WHEN va.requires_action = true THEN 'action_required'::text
        WHEN va.assessment_score >= 8.0 THEN 'excellent'::text
        WHEN va.assessment_score >= 6.0 THEN 'good'::text
        WHEN va.assessment_score >= 4.0 THEN 'needs_improvement'::text
        WHEN va.assessment_score < 4.0 THEN 'poor'::text
        ELSE 'not_scored'::text
    END AS assessment_status,
    CASE
        WHEN va.competitor_present = true THEN jsonb_array_length(COALESCE(va.competitor_products, '[]'::jsonb))
        ELSE 0
    END AS competitor_count
FROM visit_assessments va
    JOIN visits v ON va.visit_id = v.id
    JOIN user_profiles up ON v.promotor_id = up.id
    JOIN clients c ON v.client_id = c.id
    JOIN products p ON va.product_id = p.id
    JOIN brands b ON p.brand_id = b.id
    JOIN tenants t ON va.tenant_id = t.id
    LEFT JOIN product_variants pv ON va.product_variant_id = pv.id
WHERE va.deleted_at IS NULL AND v.deleted_at IS NULL AND up.deleted_at IS NULL AND c.deleted_at IS NULL AND p.deleted_at IS NULL AND b.deleted_at IS NULL AND t.deleted_at IS NULL
ORDER BY va.created_at DESC;

-- active_visit_orders view (with promotor columns)
CREATE VIEW active_visit_orders AS
SELECT vo.id,
    vo.public_id,
    vo.tenant_id,
    vo.visit_id,
    vo.client_id,
    vo.promotor_id,
    vo.order_number,
    vo.order_type,
    vo.order_status,
    vo.order_date,
    vo.delivery_date,
    vo.delivery_address,
    vo.payment_method,
    vo.payment_terms,
    vo.subtotal,
    vo.discount_amount,
    vo.tax_amount,
    vo.total_amount,
    vo.currency,
    vo.exchange_rate,
    vo.requires_approval,
    vo.approved_by,
    vo.approved_at,
    vo.invoice_required,
    vo.client_invoice_data_id,
    vo.delivery_instructions,
    vo.order_notes,
    vo.external_order_id,
    vo.commission_rate,
    vo.commission_amount,
    vo.order_attachments,
    vo.created_at,
    vo.updated_at,
    vo.deleted_at,
    v.visit_date,
    v.visit_status,
    v.workflow_status AS visit_workflow_status,
    up_promotor.first_name AS promotor_first_name,
    up_promotor.last_name AS promotor_last_name,
    up_approver.first_name AS approved_by_first_name,
    up_approver.last_name AS approved_by_last_name,
    c.business_name AS client_business_name,
    c.owner_name AS client_owner_name,
    cid.business_name AS invoice_business_name,
    cid.rfc AS invoice_rfc,
    t.name AS tenant_name,
    CASE
        WHEN vo.order_status = 'delivered'::visit_order_status_enum THEN 'completed'::text
        WHEN vo.order_status = 'cancelled'::visit_order_status_enum THEN 'cancelled'::text
        WHEN vo.requires_approval = true AND vo.approved_by IS NULL THEN 'pending_approval'::text
        WHEN vo.delivery_date IS NOT NULL AND vo.delivery_date < CURRENT_DATE AND (vo.order_status = ANY (ARRAY['confirmed'::visit_order_status_enum, 'processed'::visit_order_status_enum])) THEN 'overdue'::text
        ELSE vo.order_status::text
    END AS order_display_status,
    CASE
        WHEN vo.delivery_date IS NOT NULL THEN vo.delivery_date - CURRENT_DATE
        ELSE NULL::integer
    END AS days_until_delivery,
    CASE
        WHEN vo.commission_rate IS NOT NULL AND vo.subtotal > 0::numeric THEN vo.subtotal * vo.commission_rate
        ELSE vo.commission_amount
    END AS calculated_commission,
    CASE
        WHEN vo.order_attachments IS NOT NULL THEN jsonb_array_length(vo.order_attachments)
        ELSE 0
    END AS attachment_count,
    CASE
        WHEN vo.currency::text <> 'MXN'::text AND vo.exchange_rate <> 1.0000 THEN vo.total_amount * vo.exchange_rate
        ELSE vo.total_amount
    END AS total_amount_mxn
FROM visit_orders vo
    JOIN visits v ON vo.visit_id = v.id
    JOIN user_profiles up_promotor ON vo.promotor_id = up_promotor.id
    LEFT JOIN user_profiles up_approver ON vo.approved_by = up_approver.id
    JOIN clients c ON vo.client_id = c.id
    LEFT JOIN client_invoice_data cid ON vo.client_invoice_data_id = cid.id
    JOIN tenants t ON vo.tenant_id = t.id
WHERE vo.deleted_at IS NULL AND v.deleted_at IS NULL AND up_promotor.deleted_at IS NULL AND c.deleted_at IS NULL AND t.deleted_at IS NULL
ORDER BY vo.created_at DESC;

-- active_visit_order_items view (with promotor columns)
CREATE VIEW active_visit_order_items AS
SELECT voi.id,
    voi.public_id,
    voi.tenant_id,
    voi.visit_order_id,
    voi.product_id,
    voi.product_variant_id,
    voi.line_number,
    voi.quantity_ordered,
    voi.quantity_available,
    voi.quantity_confirmed,
    voi.unit_price,
    voi.suggested_price,
    voi.unit_cost,
    voi.line_subtotal,
    voi.line_discount_amount,
    voi.line_discount_percentage,
    voi.line_total,
    voi.tax_rate,
    voi.tax_amount,
    voi.unit_type,
    voi.item_source,
    voi.price_negotiated,
    voi.original_price,
    voi.negotiation_reason,
    voi.promotor_notes,
    voi.client_notes,
    voi.delivery_preference,
    voi.delivery_date_requested,
    voi.item_priority,
    voi.item_urgency_notes,
    voi.quality_requirements,
    voi.requires_approval,
    voi.approved_by,
    voi.approval_notes,
    voi.promotion_manually_applied,
    voi.promotion_suggested_by_system,
    voi.free_item_reason,
    voi.sample_item,
    voi.commission_rate,
    voi.commission_amount,
    voi.cross_sell_item,
    voi.upsell_item,
    voi.metadata,
    voi.created_at,
    voi.updated_at,
    voi.deleted_at,
    vo.order_number AS visit_order_number,
    vo.order_status AS parent_order_status,
    vo.client_id,
    vo.promotor_id,
    v.public_id AS visit_public_id,
    p.name AS product_name,
    p.code AS product_code,
    pv.variant_name,
    pv.variant_code
FROM visit_order_items voi
    JOIN visit_orders vo ON vo.id = voi.visit_order_id
    JOIN visits v ON v.id = vo.visit_id
    JOIN products p ON p.id = voi.product_id
    LEFT JOIN product_variants pv ON pv.id = voi.product_variant_id
WHERE voi.deleted_at IS NULL AND vo.deleted_at IS NULL AND v.deleted_at IS NULL AND p.deleted_at IS NULL AND (pv.deleted_at IS NULL OR pv.id IS NULL);

-- active_visit_communication_plans view (with promotor columns)
CREATE VIEW active_visit_communication_plans AS
SELECT vcp.id,
    vcp.public_id,
    vcp.tenant_id,
    vcp.visit_id,
    vcp.brand_id,
    vcp.material_type,
    vcp.material_name,
    vcp.material_description,
    vcp.current_status,
    vcp.planned_action,
    vcp.installation_location,
    vcp.material_size,
    vcp.quantity_current,
    vcp.quantity_planned,
    vcp.installation_date_planned,
    vcp.installation_date_actual,
    vcp.installed_by,
    vcp.material_cost,
    vcp.installation_cost,
    vcp.campaign_id,
    vcp.campaign_duration,
    vcp.target_audience,
    vcp.key_message,
    vcp.client_approval,
    vcp.client_approval_notes,
    vcp.material_condition_notes,
    vcp.effectiveness_rating,
    vcp.photo_before_urls,
    vcp.photo_after_urls,
    vcp.implementation_notes,
    vcp.follow_up_required,
    vcp.follow_up_date,
    vcp.follow_up_reason,
    vcp.created_at,
    vcp.updated_at,
    vcp.deleted_at,
    v.visit_date,
    v.visit_status,
    v.workflow_status AS visit_workflow_status,
    up_promotor.first_name AS visit_promotor_first_name,
    up_promotor.last_name AS visit_promotor_last_name,
    up_installer.first_name AS installed_by_first_name,
    up_installer.last_name AS installed_by_last_name,
    c.business_name AS client_business_name,
    b.name AS brand_name,
    b.slug AS brand_slug,
    t.name AS tenant_name,
    CASE
        WHEN vcp.installation_date_actual IS NOT NULL THEN 'installed'::text
        WHEN vcp.client_approval = 'rejected'::client_approval_enum THEN 'rejected'::text
        WHEN vcp.client_approval = 'pending'::client_approval_enum THEN 'pending_approval'::text
        WHEN vcp.installation_date_planned IS NOT NULL AND vcp.installation_date_planned < CURRENT_DATE THEN 'overdue'::text
        WHEN vcp.planned_action = 'no_action'::communication_planned_action_enum THEN 'no_action_planned'::text
        ELSE 'planned'::text
    END AS plan_status,
    CASE
        WHEN vcp.campaign_duration IS NOT NULL AND vcp.campaign_duration ? 'end_date'::text THEN (vcp.campaign_duration ->> 'end_date'::text)::date
        ELSE NULL::date
    END AS campaign_end_date,
    CASE
        WHEN vcp.follow_up_date IS NOT NULL THEN vcp.follow_up_date - CURRENT_DATE
        ELSE NULL::integer
    END AS days_until_follow_up,
    COALESCE(vcp.material_cost, 0::numeric) + COALESCE(vcp.installation_cost, 0::numeric) AS total_cost,
    CASE
        WHEN vcp.photo_before_urls IS NOT NULL THEN jsonb_array_length(vcp.photo_before_urls)
        ELSE 0
    END AS photo_before_count,
    CASE
        WHEN vcp.photo_after_urls IS NOT NULL THEN jsonb_array_length(vcp.photo_after_urls)
        ELSE 0
    END AS photo_after_count,
    CASE
        WHEN vcp.effectiveness_rating IS NOT NULL AND vcp.effectiveness_rating >= 4 THEN 'high_effectiveness'::text
        WHEN vcp.effectiveness_rating IS NOT NULL AND vcp.effectiveness_rating >= 3 THEN 'medium_effectiveness'::text
        WHEN vcp.effectiveness_rating IS NOT NULL THEN 'low_effectiveness'::text
        ELSE 'not_rated'::text
    END AS effectiveness_category
FROM visit_communication_plans vcp
    JOIN visits v ON vcp.visit_id = v.id
    JOIN user_profiles up_promotor ON v.promotor_id = up_promotor.id
    LEFT JOIN user_profiles up_installer ON vcp.installed_by = up_installer.id
    JOIN clients c ON v.client_id = c.id
    JOIN brands b ON vcp.brand_id = b.id
    JOIN tenants t ON vcp.tenant_id = t.id
WHERE vcp.deleted_at IS NULL AND v.deleted_at IS NULL AND up_promotor.deleted_at IS NULL AND c.deleted_at IS NULL AND b.deleted_at IS NULL AND t.deleted_at IS NULL
ORDER BY vcp.created_at DESC;

-- ============================================================================
-- PHASE 12: Recreate RLS policies with 'promotor'
-- ============================================================================

-- promotor_assignments policies (formerly advisor_assignments)
CREATE POLICY "Admin and brand managers can manage promotor assignments"
ON promotor_assignments
USING (tenant_id IN (
    SELECT ur.tenant_id FROM user_roles ur
    JOIN user_profiles up ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
    AND ur.role IN ('admin', 'brand_manager')
    AND ur.status = 'active'
    AND ur.deleted_at IS NULL
));

CREATE POLICY "Users can view promotor assignments in their tenant"
ON promotor_assignments
FOR SELECT
USING (tenant_id IN (
    SELECT ur.tenant_id FROM user_roles ur
    JOIN user_profiles up ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
    AND ur.status = 'active'
    AND ur.deleted_at IS NULL
));

-- promotor_client_assignments policies (formerly advisor_client_assignments)
CREATE POLICY "Admin and brand managers can manage client assignments"
ON promotor_client_assignments
USING (tenant_id IN (
    SELECT ur.tenant_id FROM user_roles ur
    JOIN user_profiles up ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
    AND ur.role IN ('admin', 'brand_manager')
    AND ur.status = 'active'
    AND ur.deleted_at IS NULL
));

CREATE POLICY "Promotors can view their assigned clients"
ON promotor_client_assignments
FOR SELECT
USING (promotor_id IN (
    SELECT up.id FROM user_profiles up
    JOIN user_roles ur ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
    AND ur.role IN ('promotor', 'supervisor')
    AND ur.status = 'active'
    AND ur.deleted_at IS NULL
));

-- visits policies
CREATE POLICY "promotors_manage_visits"
ON visits
USING (
    deleted_at IS NULL
    AND promotor_id IN (
        SELECT ur.user_profile_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role IN ('promotor', 'supervisor')
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

CREATE POLICY "promotors_select_visits"
ON visits
FOR SELECT
USING (
    deleted_at IS NULL
    AND promotor_id IN (
        SELECT ur.user_profile_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role IN ('promotor', 'supervisor')
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

-- visit_orders policies
CREATE POLICY "promotors_manage_visit_orders"
ON visit_orders
USING (
    deleted_at IS NULL
    AND visit_id IN (
        SELECT v.id FROM visits v
        WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('promotor', 'supervisor')
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND v.deleted_at IS NULL
    )
);

CREATE POLICY "promotors_select_visit_orders"
ON visit_orders
FOR SELECT
USING (
    deleted_at IS NULL
    AND visit_id IN (
        SELECT v.id FROM visits v
        WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('promotor', 'supervisor')
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND v.deleted_at IS NULL
    )
);

-- visit_order_items policies
CREATE POLICY "policy_visit_order_items_promotor_select"
ON visit_order_items
FOR SELECT TO authenticated
USING (
    visit_order_id IN (
        SELECT vo.id FROM visit_orders vo
        WHERE vo.promotor_id = (
            SELECT user_profiles.id FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
        )
        AND vo.deleted_at IS NULL
    )
);

CREATE POLICY "policy_visit_order_items_promotor_insert"
ON visit_order_items
FOR INSERT TO authenticated
WITH CHECK (
    visit_order_id IN (
        SELECT vo.id FROM visit_orders vo
        WHERE vo.promotor_id = (
            SELECT user_profiles.id FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
        )
        AND vo.deleted_at IS NULL
    )
);

CREATE POLICY "policy_visit_order_items_promotor_update"
ON visit_order_items
FOR UPDATE TO authenticated
USING (
    visit_order_id IN (
        SELECT vo.id FROM visit_orders vo
        WHERE vo.promotor_id = (
            SELECT user_profiles.id FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
        )
        AND vo.deleted_at IS NULL
    )
)
WITH CHECK (
    visit_order_id IN (
        SELECT vo.id FROM visit_orders vo
        WHERE vo.promotor_id = (
            SELECT user_profiles.id FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
        )
        AND vo.deleted_at IS NULL
    )
);

CREATE POLICY "policy_visit_order_items_promotor_delete"
ON visit_order_items
FOR DELETE TO authenticated
USING (
    visit_order_id IN (
        SELECT vo.id FROM visit_orders vo
        WHERE vo.promotor_id = (
            SELECT user_profiles.id FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
        )
        AND vo.deleted_at IS NULL
    )
);

-- visit_assessments policies
CREATE POLICY "promotors_manage_visit_assessments"
ON visit_assessments
USING (
    deleted_at IS NULL
    AND visit_id IN (
        SELECT v.id FROM visits v
        WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('promotor', 'supervisor')
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND v.deleted_at IS NULL
    )
);

CREATE POLICY "promotors_select_visit_assessments"
ON visit_assessments
FOR SELECT
USING (
    deleted_at IS NULL
    AND visit_id IN (
        SELECT v.id FROM visits v
        WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('promotor', 'supervisor')
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND v.deleted_at IS NULL
    )
);

-- visit_inventories policies
CREATE POLICY "promotors_manage_visit_inventories"
ON visit_inventories
USING (
    deleted_at IS NULL
    AND visit_id IN (
        SELECT v.id FROM visits v
        WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('promotor', 'supervisor')
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND v.deleted_at IS NULL
    )
);

CREATE POLICY "promotors_select_visit_inventories"
ON visit_inventories
FOR SELECT
USING (
    deleted_at IS NULL
    AND visit_id IN (
        SELECT v.id FROM visits v
        WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('promotor', 'supervisor')
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND v.deleted_at IS NULL
    )
);

-- visit_communication_plans policies
CREATE POLICY "promotors_manage_visit_communication_plans"
ON visit_communication_plans
USING (
    deleted_at IS NULL
    AND visit_id IN (
        SELECT v.id FROM visits v
        WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('promotor', 'supervisor')
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND v.deleted_at IS NULL
    )
);

CREATE POLICY "promotors_select_visit_communication_plans"
ON visit_communication_plans
FOR SELECT
USING (
    deleted_at IS NULL
    AND visit_id IN (
        SELECT v.id FROM visits v
        WHERE v.promotor_id IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role IN ('promotor', 'supervisor')
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND v.deleted_at IS NULL
    )
);

-- order_items policy
CREATE POLICY "policy_order_items_promotor"
ON order_items
FOR SELECT TO authenticated
USING (
    order_id IN (
        SELECT o.id FROM orders o
        WHERE o.assigned_to IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role = 'promotor'
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        AND o.deleted_at IS NULL
    )
);

-- orders policy
CREATE POLICY "promotors_select_orders"
ON orders
FOR SELECT
USING (
    deleted_at IS NULL
    AND (
        assigned_to IN (
            SELECT ur.user_profile_id FROM user_roles ur
            JOIN user_profiles up ON ur.user_profile_id = up.id
            WHERE up.user_id = auth.uid()
            AND ur.role = 'promotor'
            AND ur.status = 'active'
            AND ur.deleted_at IS NULL
        )
        OR client_id IN (
            SELECT c.id FROM clients c
            JOIN visits v ON v.client_id = c.id
            WHERE v.promotor_id IN (
                SELECT ur.user_profile_id FROM user_roles ur
                JOIN user_profiles up ON ur.user_profile_id = up.id
                WHERE up.user_id = auth.uid()
                AND ur.role = 'promotor'
                AND ur.status = 'active'
                AND ur.deleted_at IS NULL
            )
            AND v.deleted_at IS NULL
            AND c.deleted_at IS NULL
        )
    )
);

-- points_transactions policy
CREATE POLICY "promotors_select_points_transactions"
ON points_transactions
FOR SELECT
USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
        SELECT cbm.id FROM client_brand_memberships cbm
        JOIN clients c ON cbm.client_id = c.id
        WHERE c.id IN (
            SELECT DISTINCT v.client_id FROM visits v
            WHERE v.promotor_id IN (
                SELECT ur.user_profile_id FROM user_roles ur
                JOIN user_profiles up ON ur.user_profile_id = up.id
                WHERE up.user_id = auth.uid()
                AND ur.role = 'promotor'
                AND ur.status = 'active'
                AND ur.deleted_at IS NULL
            )
            AND v.deleted_at IS NULL
        )
        AND cbm.deleted_at IS NULL
        AND c.deleted_at IS NULL
    )
);

-- promotion_redemptions policy
CREATE POLICY "promotors_select_promotion_redemptions"
ON promotion_redemptions
FOR SELECT
USING (
    deleted_at IS NULL
    AND applied_by IN (
        SELECT ur.user_profile_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role = 'promotor'
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

-- reward_redemptions policy
CREATE POLICY "promotors_select_reward_redemptions"
ON reward_redemptions
FOR SELECT
USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
        SELECT cbm.id FROM client_brand_memberships cbm
        JOIN clients c ON cbm.client_id = c.id
        WHERE c.id IN (
            SELECT DISTINCT v.client_id FROM visits v
            WHERE v.promotor_id IN (
                SELECT ur.user_profile_id FROM user_roles ur
                JOIN user_profiles up ON ur.user_profile_id = up.id
                WHERE up.user_id = auth.uid()
                AND ur.role = 'promotor'
                AND ur.status = 'active'
                AND ur.deleted_at IS NULL
            )
            AND v.deleted_at IS NULL
        )
        AND cbm.deleted_at IS NULL
        AND c.deleted_at IS NULL
    )
);

-- client_tier_assignments policy
CREATE POLICY "promotors_select_client_tier_assignments"
ON client_tier_assignments
FOR SELECT
USING (
    deleted_at IS NULL
    AND client_brand_membership_id IN (
        SELECT cbm.id FROM client_brand_memberships cbm
        JOIN clients c ON cbm.client_id = c.id
        WHERE c.id IN (
            SELECT DISTINCT v.client_id FROM visits v
            WHERE v.promotor_id IN (
                SELECT ur.user_profile_id FROM user_roles ur
                JOIN user_profiles up ON ur.user_profile_id = up.id
                WHERE up.user_id = auth.uid()
                AND ur.role = 'promotor'
                AND ur.status = 'active'
                AND ur.deleted_at IS NULL
            )
            AND v.deleted_at IS NULL
        )
        AND cbm.deleted_at IS NULL
        AND c.deleted_at IS NULL
    )
);

-- user_roles policy for brand managers
CREATE POLICY "brand_managers_manage_roles"
ON user_roles
USING (
    deleted_at IS NULL
    AND role IN ('supervisor', 'promotor', 'market_analyst')
    AND brand_id IN (
        SELECT ur.brand_id FROM user_roles ur
        JOIN user_profiles up ON ur.user_profile_id = up.id
        WHERE up.user_id = auth.uid()
        AND ur.role = 'brand_manager'
        AND ur.status = 'active'
        AND ur.deleted_at IS NULL
    )
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMIT;

-- Summary of changes:
-- 1. Dropped all dependent views first
-- 2. Dropped constraint user_roles_non_global_scope_check
-- 3. Dropped RLS policies referencing 'advisor'
-- 4. Dropped functions and their default dependencies
-- 5. Added 'promotor' to user_role_type_enum (kept 'advisor' deprecated)
-- 6. Updated all user_roles with role='advisor' to role='promotor'
-- 7. Renamed advisor_assignments → promotor_assignments
-- 8. Renamed advisor_client_assignments → promotor_client_assignments
-- 9. Renamed advisor_id columns → promotor_id
-- 10. Renamed advisor_notes columns → promotor_notes
-- 11. Renamed advisor_experience_level_enum → promotor_experience_level_enum
-- 12. Renamed advisor_specialization_enum → promotor_specialization_enum
-- 13. Created new functions generate_promotor_assignment_public_id and generate_promotor_client_assignment_public_id
-- 14. Recreated constraint with 'promotor'
-- 15. Recreated all views with new column names
-- 16. Recreated all RLS policies with 'promotor'
