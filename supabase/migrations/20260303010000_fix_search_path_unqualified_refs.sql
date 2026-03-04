-- Fix functions broken by empty search_path (set in 20260221170000_fix_function_search_path.sql)
-- These functions had unqualified table/function references that fail with search_path = ''
--
-- Group A: All references resolve to existing public tables/functions
-- Group B: Some references point to non-existent tables (pre-existing issues, not caused by search_path)
--          We qualify what exists and leave non-existent references as-is.

--------------------------------------------------------------------------------
-- GROUP A: Straightforward fixes (all references exist)
--------------------------------------------------------------------------------

-- 1. generate_client_assignment_public_id()
CREATE OR REPLACE FUNCTION public.generate_client_assignment_public_id()
RETURNS character varying
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'CLA-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.client_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;

-- 2. generate_distributor_public_id()
CREATE OR REPLACE FUNCTION public.generate_distributor_public_id()
RETURNS character varying
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'DIST-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.distributors WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;

-- 3. generate_point_transaction_public_id()
CREATE OR REPLACE FUNCTION public.generate_point_transaction_public_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    RETURN public.generate_public_id('point_transaction');
END;
$$;

-- 4. complete_visit(uuid)
-- NOTE: This function also has pre-existing issues (references asesor_id instead of
-- promotor_id, and status instead of visit_status). Those are NOT fixed here —
-- only the search_path qualification is addressed.
CREATE OR REPLACE FUNCTION public.complete_visit(p_visit_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    visit_exists BOOLEAN;
    has_assessment BOOLEAN;
    result JSON;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.visits
        WHERE id = p_visit_id
        AND asesor_id = auth.uid()
        AND tenant_id = public.get_current_tenant_id()
        AND status = 'in_progress'
    ) INTO visit_exists;

    IF NOT visit_exists THEN
        RETURN json_build_object('success', false, 'error', 'Visit not found or already completed');
    END IF;

    SELECT EXISTS(
        SELECT 1 FROM public.visit_assessments
        WHERE visit_id = p_visit_id
        AND tenant_id = public.get_current_tenant_id()
    ) INTO has_assessment;

    IF NOT has_assessment THEN
        RETURN json_build_object('success', false, 'error', 'Visit must have at least one product assessment');
    END IF;

    UPDATE public.visits
    SET
        status = 'completed',
        end_time = NOW(),
        updated_at = NOW()
    WHERE id = p_visit_id;

    SELECT json_build_object(
        'success', true,
        'visit_id', p_visit_id,
        'completed_at', NOW(),
        'status', 'completed'
    ) INTO result;

    RETURN result;
END;
$$;

-- 5. sync_zone_client_assignments()
CREATE OR REPLACE FUNCTION public.sync_zone_client_assignments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    _brand_id UUID;
BEGIN
    IF TG_OP = 'INSERT' AND NEW.zone_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' AND (NEW.zone_id IS NOT DISTINCT FROM OLD.zone_id) THEN
        RETURN NEW;
    END IF;

    IF NEW.is_active = false OR NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    SELECT b.id INTO _brand_id
    FROM public.brands b
    WHERE b.tenant_id = NEW.tenant_id
      AND b.deleted_at IS NULL
    ORDER BY b.created_at
    LIMIT 1;

    IF _brand_id IS NULL THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.client_assignments (
        user_profile_id,
        client_id,
        brand_id,
        tenant_id,
        assignment_type,
        assigned_date,
        is_active
    )
    SELECT
        NEW.user_profile_id,
        c.id,
        _brand_id,
        NEW.tenant_id,
        'primary',
        CURRENT_DATE,
        true
    FROM public.clients c
    WHERE c.zone_id = NEW.zone_id
      AND c.tenant_id = NEW.tenant_id
      AND c.deleted_at IS NULL
      AND c.status != 'inactive'::public.client_status_enum
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

-- 6. sync_new_client_to_zone_promotors()
CREATE OR REPLACE FUNCTION public.sync_new_client_to_zone_promotors()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    _brand_id UUID;
BEGIN
    IF NEW.zone_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' AND (NEW.zone_id IS NOT DISTINCT FROM OLD.zone_id) THEN
        RETURN NEW;
    END IF;

    SELECT b.id INTO _brand_id
    FROM public.brands b
    WHERE b.tenant_id = NEW.tenant_id
      AND b.deleted_at IS NULL
    ORDER BY b.created_at
    LIMIT 1;

    IF _brand_id IS NULL THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.client_assignments (
        user_profile_id,
        client_id,
        brand_id,
        tenant_id,
        assignment_type,
        assigned_date,
        is_active
    )
    SELECT
        pa.user_profile_id,
        NEW.id,
        _brand_id,
        NEW.tenant_id,
        'primary',
        CURRENT_DATE,
        true
    FROM public.promotor_assignments pa
    WHERE pa.zone_id = NEW.zone_id
      AND pa.tenant_id = NEW.tenant_id
      AND pa.is_active = true
      AND pa.deleted_at IS NULL
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

-- 7. get_admin_dashboard_metrics(uuid)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
  month_start timestamptz;
  activity_items jsonb;
BEGIN
  month_start := date_trunc('month', now());

  SELECT COALESCE(jsonb_agg(item ORDER BY (item->>'created_at') DESC), '[]'::jsonb)
  INTO activity_items
  FROM (
    (
      SELECT jsonb_build_object(
        'id', v.id,
        'action_type', 'visit_created',
        'resource_type', 'visits',
        'created_at', v.created_at,
        'description', 'Visita ' || CASE WHEN v.visit_status = 'completed' THEN 'completada' ELSE 'registrada' END || ' para ' || COALESCE(c.business_name, 'Cliente')
      ) as item
      FROM public.visits v
      LEFT JOIN public.clients c ON v.client_id = c.id
      WHERE v.tenant_id = p_tenant_id AND v.deleted_at IS NULL
      ORDER BY v.created_at DESC LIMIT 5
    )
    UNION ALL
    (
      SELECT jsonb_build_object(
        'id', o.id,
        'action_type', 'order_created',
        'resource_type', 'orders',
        'created_at', o.created_at,
        'description', 'Orden ' || COALESCE(o.order_number, '') || ' por $' || COALESCE(o.total_amount::text, '0')
      ) as item
      FROM public.orders o
      WHERE o.tenant_id = p_tenant_id AND o.deleted_at IS NULL
      ORDER BY o.created_at DESC LIMIT 5
    )
    UNION ALL
    (
      SELECT jsonb_build_object(
        'id', c.id,
        'action_type', 'client_created',
        'resource_type', 'clients',
        'created_at', c.created_at,
        'description', 'Cliente ' || c.business_name || ' registrado'
      ) as item
      FROM public.clients c
      WHERE c.tenant_id = p_tenant_id AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC LIMIT 5
    )
  ) sub
  LIMIT 5;

  SELECT jsonb_build_object(
    'totalBrands',    (SELECT count(*) FROM public.brands        WHERE tenant_id = p_tenant_id AND status = 'active'  AND deleted_at IS NULL),
    'activeBrands',   (SELECT count(*) FROM public.brands        WHERE tenant_id = p_tenant_id AND status = 'active'  AND deleted_at IS NULL),
    'totalClients',   (SELECT count(*) FROM public.clients       WHERE tenant_id = p_tenant_id AND status = 'active'  AND deleted_at IS NULL),
    'activeClients',  (SELECT count(*) FROM public.clients       WHERE tenant_id = p_tenant_id AND status = 'active'  AND deleted_at IS NULL),
    'totalUsers',     (SELECT count(*) FROM public.user_profiles WHERE tenant_id = p_tenant_id AND status = 'active'  AND deleted_at IS NULL),
    'activeUsers',    (SELECT count(*) FROM public.user_profiles WHERE tenant_id = p_tenant_id AND status = 'active'  AND deleted_at IS NULL),
    'totalVisits',    (SELECT count(*) FROM public.visits        WHERE tenant_id = p_tenant_id AND deleted_at IS NULL),
    'monthlyVisits',  (SELECT count(*) FROM public.visits        WHERE tenant_id = p_tenant_id AND created_at >= month_start AND deleted_at IS NULL),
    'totalOrders',    (SELECT count(*) FROM public.orders        WHERE tenant_id = p_tenant_id AND deleted_at IS NULL),
    'monthlyRevenue', COALESCE((SELECT sum(total_amount)  FROM public.orders WHERE tenant_id = p_tenant_id AND created_at >= month_start AND deleted_at IS NULL), 0),
    'recentActivity', activity_items
  ) INTO result;

  RETURN result;
END;
$$;

--------------------------------------------------------------------------------
-- GROUP B: Functions with pre-existing broken references to non-existent tables
-- We qualify references that DO exist; leave non-existent table refs as-is.
--------------------------------------------------------------------------------

-- 8. get_applicable_promotions(uuid, uuid, numeric)
-- WARNING: References promotion_segments table which does NOT exist.
CREATE OR REPLACE FUNCTION public.get_applicable_promotions(
    p_client_id uuid,
    p_brand_id uuid,
    p_purchase_amount numeric DEFAULT NULL::numeric
) RETURNS TABLE(
    promotion_id uuid,
    promotion_code character varying,
    promotion_name character varying,
    promotion_type character varying,
    promotion_value numeric,
    minimum_purchase_amount numeric,
    maximum_discount_amount numeric,
    is_applicable boolean,
    estimated_discount numeric,
    start_date date,
    end_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.code,
        p.name,
        p.promotion_type,
        p.promotion_value,
        p.minimum_purchase_amount,
        p.maximum_discount_amount,
        (p_purchase_amount IS NULL OR p_purchase_amount >= COALESCE(p.minimum_purchase_amount, 0)) as is_applicable,
        CASE
            WHEN p_purchase_amount IS NULL THEN 0
            WHEN p.promotion_type = 'discount_percentage' THEN
                LEAST(
                    (p_purchase_amount * p.promotion_value / 100),
                    COALESCE(p.maximum_discount_amount, p_purchase_amount)
                )
            WHEN p.promotion_type = 'discount_amount' THEN
                LEAST(p.promotion_value, COALESCE(p_purchase_amount, p.promotion_value))
            WHEN p.promotion_type = 'points_multiplier' THEN
                (p_purchase_amount * p.promotion_value)
            ELSE 0
        END as estimated_discount,
        p.start_date,
        p.end_date
    FROM public.promotions p
    WHERE p.brand_id = p_brand_id
    AND p.is_active = true
    AND p.approval_status = 'approved'
    AND CURRENT_DATE BETWEEN p.start_date AND p.end_date
    AND p.tenant_id = public.get_current_tenant_id()
    AND (
        -- No segmentation = applies to all
        NOT EXISTS (SELECT 1 FROM promotion_segments ps WHERE ps.promotion_id = p.id)
        OR
        -- Has segmentation that includes the client
        EXISTS (
            SELECT 1 FROM promotion_segments ps
            INNER JOIN public.clients c ON c.id = p_client_id
            WHERE ps.promotion_id = p.id
            AND ps.tenant_id = public.get_current_tenant_id()
            AND (
                (ps.segment_type = 'zone' AND ps.segment_value = c.zone_id::text)
                OR (ps.segment_type = 'market' AND ps.segment_value = c.market_id::text)
                OR (ps.segment_type = 'commercial_structure' AND ps.segment_value = c.commercial_structure_id::text)
                OR (ps.segment_type = 'client_type' AND ps.segment_value = c.client_type_id::text)
                OR (ps.segment_type = 'specific_client' AND ps.segment_value = c.id::text)
            )
        )
    )
    ORDER BY
        CASE WHEN p_purchase_amount IS NOT NULL AND p_purchase_amount >= COALESCE(p.minimum_purchase_amount, 0)
             THEN 0 ELSE 1 END,
        estimated_discount DESC;
END;
$$;

-- 9. create_purchase_with_promotions(...)
-- WARNING: References visit_purchases table which does NOT exist.
-- Also references asesor_id column (renamed to promotor_id) — pre-existing issue.
CREATE OR REPLACE FUNCTION public.create_purchase_with_promotions(
    p_visit_id uuid,
    p_items jsonb,
    p_payment_method character varying,
    p_invoice_number character varying DEFAULT NULL::character varying,
    p_invoice_photo_url text DEFAULT NULL::text,
    p_apply_promotions boolean DEFAULT true
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    visit_data RECORD;
    purchase_item JSONB;
    purchase_id UUID;
    purchase_ids UUID[] := '{}';
    total_amount DECIMAL := 0;
    total_discount DECIMAL := 0;
    applied_promotions JSONB[] := '{}';
    promo_record RECORD;
    result JSON;
BEGIN
    SELECT v.*, c.id as client_id, c.business_name, b.id as brand_id, b.name as brand_name
    INTO visit_data
    FROM public.visits v
    INNER JOIN public.clients c ON c.id = v.client_id
    INNER JOIN public.brands b ON b.id = v.brand_id
    WHERE v.id = p_visit_id
    AND v.asesor_id = auth.uid()
    AND v.tenant_id = public.get_current_tenant_id();

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Visit not found or access denied');
    END IF;

    FOR purchase_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO visit_purchases (
            tenant_id,
            visit_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            subtotal,
            discount_amount,
            total_amount,
            payment_method,
            invoice_number,
            invoice_photo_url
        ) VALUES (
            public.get_current_tenant_id(),
            p_visit_id,
            NULLIF(purchase_item->>'product_id', '')::UUID,
            purchase_item->>'product_name',
            (purchase_item->>'quantity')::INTEGER,
            (purchase_item->>'unit_price')::DECIMAL,
            (purchase_item->>'quantity')::INTEGER * (purchase_item->>'unit_price')::DECIMAL,
            COALESCE((purchase_item->>'discount_amount')::DECIMAL, 0),
            ((purchase_item->>'quantity')::INTEGER * (purchase_item->>'unit_price')::DECIMAL) - COALESCE((purchase_item->>'discount_amount')::DECIMAL, 0),
            p_payment_method,
            p_invoice_number,
            p_invoice_photo_url
        ) RETURNING id INTO purchase_id;

        purchase_ids := array_append(purchase_ids, purchase_id);
        total_amount := total_amount + ((purchase_item->>'quantity')::INTEGER * (purchase_item->>'unit_price')::DECIMAL);
    END LOOP;

    IF p_apply_promotions THEN
        FOR promo_record IN
            SELECT * FROM public.get_applicable_promotions(visit_data.client_id, visit_data.brand_id, total_amount)
            WHERE is_applicable = true
            ORDER BY estimated_discount DESC
        LOOP
            INSERT INTO public.promotion_redemptions (
                tenant_id,
                visit_id,
                promotion_id,
                client_id,
                brand_id,
                redemption_date,
                original_amount,
                discount_amount,
                final_amount,
                points_earned
            ) VALUES (
                public.get_current_tenant_id(),
                p_visit_id,
                promo_record.promotion_id,
                visit_data.client_id,
                visit_data.brand_id,
                CURRENT_DATE,
                total_amount,
                promo_record.estimated_discount,
                total_amount - promo_record.estimated_discount,
                CASE
                    WHEN promo_record.promotion_type = 'points_multiplier'
                    THEN promo_record.estimated_discount::INTEGER
                    ELSE FLOOR(promo_record.estimated_discount / 10)::INTEGER
                END
            );

            applied_promotions := array_append(applied_promotions, json_build_object(
                'promotion_id', promo_record.promotion_id,
                'promotion_name', promo_record.promotion_name,
                'discount_amount', promo_record.estimated_discount,
                'points_earned', CASE
                    WHEN promo_record.promotion_type = 'points_multiplier'
                    THEN promo_record.estimated_discount::INTEGER
                    ELSE FLOOR(promo_record.estimated_discount / 10)::INTEGER
                END
            ));

            total_discount := total_discount + promo_record.estimated_discount;

            EXIT;
        END LOOP;
    END IF;

    SELECT json_build_object(
        'success', true,
        'purchase_ids', purchase_ids,
        'applied_promotions', applied_promotions,
        'total_amount', total_amount,
        'total_discount', total_discount,
        'final_amount', total_amount - total_discount,
        'status', 'success'
    ) INTO result;

    RETURN result;
END;
$$;

-- 10. update_visit_assessment(uuid, jsonb)
-- WARNING: References "users" table which does NOT exist in public schema.
-- Should be auth.users or public.user_profiles — pre-existing issue.
-- Also references asesor_id column (renamed to promotor_id) — pre-existing issue.
CREATE OR REPLACE FUNCTION public.update_visit_assessment(p_visit_id uuid, p_assessment_data jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    visit_exists BOOLEAN;
    assessment_record JSONB;
    inserted_count INTEGER := 0;
    current_tenant_id UUID;
    result JSON;
BEGIN
    SELECT tenant_id INTO current_tenant_id FROM users WHERE id = auth.uid();

    SELECT EXISTS(
        SELECT 1 FROM public.visits
        WHERE id = p_visit_id
        AND asesor_id = auth.uid()
        AND tenant_id = current_tenant_id
    ) INTO visit_exists;

    IF NOT visit_exists THEN
        RETURN json_build_object('success', false, 'error', 'Visit not found or access denied');
    END IF;

    FOR assessment_record IN SELECT * FROM jsonb_array_elements(p_assessment_data->'products')
    LOOP
        INSERT INTO public.visit_assessments (
            tenant_id,
            visit_id,
            product_id,
            product_name,
            presentation,
            current_price,
            has_discount,
            discount_percentage,
            competitor_price,
            competitor_brand,
            package_condition,
            display_quality,
            stock_level,
            comments,
            photo_urls
        ) VALUES (
            current_tenant_id,
            p_visit_id,
            NULLIF(assessment_record->>'product_id', '')::UUID,
            assessment_record->>'product_name',
            assessment_record->>'presentation',
            (assessment_record->>'current_price')::DECIMAL,
            COALESCE((assessment_record->>'has_discount')::BOOLEAN, false),
            NULLIF(assessment_record->>'discount_percentage', '')::DECIMAL,
            NULLIF(assessment_record->>'competitor_price', '')::DECIMAL,
            assessment_record->>'competitor_brand',
            assessment_record->>'package_condition',
            assessment_record->>'display_quality',
            assessment_record->>'stock_level',
            assessment_record->>'comments',
            CASE
                WHEN assessment_record->'photo_urls' IS NOT NULL
                THEN ARRAY(SELECT jsonb_array_elements_text(assessment_record->'photo_urls'))
                ELSE NULL
            END
        )
        ON CONFLICT (tenant_id, visit_id, COALESCE(product_id, '00000000-0000-0000-0000-000000000000'::uuid), product_name)
        DO UPDATE SET
            presentation = EXCLUDED.presentation,
            current_price = EXCLUDED.current_price,
            has_discount = EXCLUDED.has_discount,
            discount_percentage = EXCLUDED.discount_percentage,
            competitor_price = EXCLUDED.competitor_price,
            competitor_brand = EXCLUDED.competitor_brand,
            package_condition = EXCLUDED.package_condition,
            display_quality = EXCLUDED.display_quality,
            stock_level = EXCLUDED.stock_level,
            comments = EXCLUDED.comments,
            photo_urls = EXCLUDED.photo_urls,
            updated_at = NOW();

        inserted_count := inserted_count + 1;
    END LOOP;

    SELECT json_build_object(
        'success', true,
        'visit_id', p_visit_id,
        'assessments_processed', inserted_count,
        'updated_at', NOW()
    ) INTO result;

    RETURN result;
END;
$$;
