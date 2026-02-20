-- =============================================================================
-- SEED DEMO DATA — Compañeros en Ruta
-- =============================================================================
-- Idempotent script: safe to run multiple times without duplicates.
-- Tags transactional data with '[DEMO-SEED]' in notes/description for cleanup.
-- Target: tenant Demo (fe0f429d-2d83-4738-af65-32c655cef656)
-- =============================================================================

-- UNCOMMENT TO CLEAN BEFORE RE-SEED (destroys ALL demo-seed data):
-- DELETE FROM survey_answers    WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM survey_responses  WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM survey_questions  WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM surveys           WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM notifications     WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM kpi_targets       WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM points_transactions WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM promotion_redemptions WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM promotion_rules   WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM promotions        WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM visit_exhibition_checks WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM visit_pop_material_checks WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM visit_competitor_assessments WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM visit_brand_product_assessments WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM visit_stage_assessments WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM visit_order_items WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM visit_orders      WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM order_items       WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM orders            WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';
-- DELETE FROM visits            WHERE tenant_id = 'fe0f429d-2d83-4738-af65-32c655cef656';

BEGIN;

-- =============================================================================
-- LAYER 0: Validation
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = 'fe0f429d-2d83-4738-af65-32c655cef656') THEN
    RAISE EXCEPTION 'Demo tenant not found! Aborting.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    RAISE EXCEPTION 'pgcrypto extension not enabled! Aborting.';
  END IF;
  RAISE NOTICE 'Layer 0: Validation passed ✓';
END $$;

-- Advance ALL public_id sequences to >= 5000 to avoid collisions with existing data
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT sequencename FROM pg_sequences
    WHERE schemaname = 'public' AND sequencename LIKE '%public_id%'
  LOOP
    BEGIN
      PERFORM setval('public.' || rec.sequencename,
                     GREATEST(nextval('public.' || rec.sequencename), 5000), true);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
  RAISE NOTICE 'Sequences advanced ✓';
END $$;

-- Shorthand variables via CTEs won't work in DDL, so we use literal UUIDs.
-- Tenant Demo: fe0f429d-2d83-4738-af65-32c655cef656

-- =============================================================================
-- LAYER 1: Reference Data (zones, markets, client_types, commercial_structures)
-- =============================================================================

-- Zones
INSERT INTO zones (id, tenant_id, name, code, zone_type, description, is_active)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'fe0f429d-2d83-4738-af65-32c655cef656',
   'Monterrey', 'MTY', 'city', 'Zona Metropolitana de Monterrey', true),
  ('a0000001-0000-0000-0000-000000000002', 'fe0f429d-2d83-4738-af65-32c655cef656',
   'Guadalajara', 'GDL', 'city', 'Zona Metropolitana de Guadalajara', true)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Markets
INSERT INTO markets (id, tenant_id, name, code, description, is_active)
VALUES
  ('a0000002-0000-0000-0000-000000000001', 'fe0f429d-2d83-4738-af65-32c655cef656',
   'Moderno', 'MOD', 'Canal moderno: autoservicio y conveniencia', true),
  ('a0000002-0000-0000-0000-000000000002', 'fe0f429d-2d83-4738-af65-32c655cef656',
   'Autoservicio', 'AUTO', 'Tiendas de autoservicio y departamentales', true)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Client Types
INSERT INTO client_types (id, tenant_id, name, code, category, description, is_active)
VALUES
  ('a0000003-0000-0000-0000-000000000001', 'fe0f429d-2d83-4738-af65-32c655cef656',
   'Abarrotes', 'ABARROTES', 'retail', 'Tiendas de abarrotes y misceláneas', true),
  ('a0000003-0000-0000-0000-000000000002', 'fe0f429d-2d83-4738-af65-32c655cef656',
   'Farmacia', 'FARMACIA', 'retail', 'Farmacias y droguerías', true),
  ('a0000003-0000-0000-0000-000000000003', 'fe0f429d-2d83-4738-af65-32c655cef656',
   'Minisuper', 'MINISUPER', 'retail', 'Minisúper y tiendas de conveniencia', true)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Commercial Structures
INSERT INTO commercial_structures (id, tenant_id, name, code, structure_type, description, is_active)
VALUES
  ('a0000004-0000-0000-0000-000000000001', 'fe0f429d-2d83-4738-af65-32c655cef656',
   'Directo', 'DIR', 'direct', 'Venta directa al punto de venta', true)
ON CONFLICT (tenant_id, code) DO NOTHING;

DO $$ BEGIN RAISE NOTICE 'Layer 1: Reference data ✓'; END $$;

-- =============================================================================
-- LAYER 2: Auth Users + Profiles + Roles
-- =============================================================================

-- We need to discover existing IDs for brands and the existing zone (CDMX).
-- Let's use DO blocks with variables.

DO $$
DECLARE
  v_tenant_id   UUID := 'fe0f429d-2d83-4738-af65-32c655cef656';
  v_brand_coca  UUID;
  v_brand_lala  UUID;
  v_brand_iberia UUID;
  v_zone_cdmx   UUID;

  -- Auth user IDs (deterministic for idempotency)
  v_auth_admin      UUID := 'dd000001-0000-0000-0000-000000000001';
  v_auth_brand      UUID := 'dd000001-0000-0000-0000-000000000002';
  v_auth_supervisor  UUID := 'dd000001-0000-0000-0000-000000000003';
  v_auth_promotor    UUID := 'dd000001-0000-0000-0000-000000000004';
  v_auth_asesor      UUID := 'dd000001-0000-0000-0000-000000000005';
  v_auth_cliente     UUID := 'dd000001-0000-0000-0000-000000000006';

  -- Profile IDs (will be set after user creation — no profile for cliente)
  v_profile_admin      UUID;
  v_profile_brand      UUID;
  v_profile_supervisor  UUID;
  v_profile_promotor    UUID;
  v_profile_asesor      UUID;

  v_password_hash TEXT;
BEGIN
  -- Lookup brands
  SELECT id INTO v_brand_coca FROM brands WHERE tenant_id = v_tenant_id AND slug = 'coca-cola';
  SELECT id INTO v_brand_lala FROM brands WHERE tenant_id = v_tenant_id AND slug = 'lala';
  SELECT id INTO v_brand_iberia FROM brands WHERE tenant_id = v_tenant_id AND slug = 'iberia';

  IF v_brand_coca IS NULL OR v_brand_lala IS NULL OR v_brand_iberia IS NULL THEN
    RAISE EXCEPTION 'Missing required brands (coca-cola, lala, iberia). Found: coca=%, lala=%, iberia=%',
      v_brand_coca, v_brand_lala, v_brand_iberia;
  END IF;

  -- Lookup CDMX zone
  SELECT id INTO v_zone_cdmx FROM zones WHERE tenant_id = v_tenant_id AND code = 'CDMX';
  -- CDMX might not exist, that's OK — we'll check

  -- Hash password once
  v_password_hash := extensions.crypt('Demo2026!', extensions.gen_salt('bf'));

  -- Create auth users
  -- The handle_new_user() trigger will auto-create user_profiles
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    is_sso_user, deleted_at,
    email_change, email_change_token_new, email_change_token_current,
    email_change_confirm_status
  )
  VALUES
    (v_auth_admin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@demo.companerosenruta.com', v_password_hash,
     now(), jsonb_build_object('tenant_id', v_tenant_id, 'first_name', 'Admin', 'last_name', 'Demo'),
     '{"provider":"email","providers":["email"]}'::jsonb,
     now(), now(), '', '', false, null,
     '', '', '', 0),
    (v_auth_brand, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'brand@demo.companerosenruta.com', v_password_hash,
     now(), jsonb_build_object('tenant_id', v_tenant_id, 'first_name', 'Brenda', 'last_name', 'Marca'),
     '{"provider":"email","providers":["email"]}'::jsonb,
     now(), now(), '', '', false, null,
     '', '', '', 0),
    (v_auth_supervisor, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'supervisor@demo.companerosenruta.com', v_password_hash,
     now(), jsonb_build_object('tenant_id', v_tenant_id, 'first_name', 'Samuel', 'last_name', 'Supervisor'),
     '{"provider":"email","providers":["email"]}'::jsonb,
     now(), now(), '', '', false, null,
     '', '', '', 0),
    (v_auth_promotor, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'promotor@demo.companerosenruta.com', v_password_hash,
     now(), jsonb_build_object('tenant_id', v_tenant_id, 'first_name', 'Pedro', 'last_name', 'Promotor'),
     '{"provider":"email","providers":["email"]}'::jsonb,
     now(), now(), '', '', false, null,
     '', '', '', 0),
    (v_auth_asesor, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'asesor@demo.companerosenruta.com', v_password_hash,
     now(), jsonb_build_object('tenant_id', v_tenant_id, 'first_name', 'Ana', 'last_name', 'Asesora'),
     '{"provider":"email","providers":["email"]}'::jsonb,
     now(), now(), '', '', false, null,
     '', '', '', 0),
    (v_auth_cliente, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'cliente@demo.companerosenruta.com', v_password_hash,
     now(), jsonb_build_object('tenant_id', v_tenant_id, 'first_name', 'Carlos', 'last_name', 'Cliente', 'is_client', true),
     '{"provider":"email","providers":["email"]}'::jsonb,
     now(), now(), '', '', false, null,
     '', '', '', 0)
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    email_change = EXCLUDED.email_change,
    email_change_token_new = EXCLUDED.email_change_token_new,
    email_change_token_current = EXCLUDED.email_change_token_current,
    email_change_confirm_status = EXCLUDED.email_change_confirm_status,
    updated_at = now();

  -- Also handle email conflict (different ID same email)
  -- The ON CONFLICT (id) above handles re-runs with same IDs.

  -- Wait for trigger: get profile IDs
  SELECT id INTO v_profile_admin FROM user_profiles WHERE user_id = v_auth_admin;
  SELECT id INTO v_profile_brand FROM user_profiles WHERE user_id = v_auth_brand;
  SELECT id INTO v_profile_supervisor FROM user_profiles WHERE user_id = v_auth_supervisor;
  SELECT id INTO v_profile_promotor FROM user_profiles WHERE user_id = v_auth_promotor;
  SELECT id INTO v_profile_asesor FROM user_profiles WHERE user_id = v_auth_asesor;
  -- Client users should NOT have user_profiles (architecture: clients.user_id only).
  -- The handle_new_user() trigger skips profile creation when is_client=true in metadata.
  -- For safety (e.g., re-runs before migration is applied), also delete any stale profile
  -- and its dependent rows (notifications from previous seed runs).
  DELETE FROM notifications WHERE user_profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = v_auth_cliente
  );
  DELETE FROM user_profiles WHERE user_id = v_auth_cliente;

  -- Update profile details (trigger sets basic info, we enrich)
  UPDATE user_profiles SET
    first_name = 'Admin', last_name = 'Demo', position = 'Administrador General'
  WHERE id = v_profile_admin;

  UPDATE user_profiles SET
    first_name = 'Brenda', last_name = 'Marca', position = 'Brand Manager'
  WHERE id = v_profile_brand;

  UPDATE user_profiles SET
    first_name = 'Samuel', last_name = 'Supervisor', position = 'Supervisor de Zona'
  WHERE id = v_profile_supervisor;

  UPDATE user_profiles SET
    first_name = 'Pedro', last_name = 'Promotor', position = 'Promotor de Campo'
  WHERE id = v_profile_promotor;

  UPDATE user_profiles SET
    first_name = 'Ana', last_name = 'Asesora', position = 'Asesora de Ventas'
  WHERE id = v_profile_asesor;

  -- No profile update for cliente — they use clients.user_id directly

  -- Assign roles (the unique index is partial: WHERE deleted_at IS NULL)
  -- Admin = global role (no brand)
  INSERT INTO user_roles (tenant_id, user_profile_id, role, scope, brand_id, status, granted_by)
  VALUES
    (v_tenant_id, v_profile_admin, 'admin', 'global', NULL, 'active', v_profile_admin)
  ON CONFLICT DO NOTHING;

  -- Brand Manager = brand-scoped, one per brand
  INSERT INTO user_roles (tenant_id, user_profile_id, role, scope, brand_id, status, granted_by)
  VALUES
    (v_tenant_id, v_profile_brand, 'brand_manager', 'brand', v_brand_coca, 'active', v_profile_admin),
    (v_tenant_id, v_profile_brand, 'brand_manager', 'brand', v_brand_lala, 'active', v_profile_admin),
    (v_tenant_id, v_profile_brand, 'brand_manager', 'brand', v_brand_iberia, 'active', v_profile_admin)
  ON CONFLICT DO NOTHING;

  -- Supervisor = brand-scoped
  INSERT INTO user_roles (tenant_id, user_profile_id, role, scope, brand_id, status, granted_by)
  VALUES
    (v_tenant_id, v_profile_supervisor, 'supervisor', 'brand', v_brand_coca, 'active', v_profile_admin)
  ON CONFLICT DO NOTHING;

  -- Promotor = brand-scoped
  INSERT INTO user_roles (tenant_id, user_profile_id, role, scope, brand_id, status, granted_by)
  VALUES
    (v_tenant_id, v_profile_promotor, 'promotor', 'brand', v_brand_lala, 'active', v_profile_admin)
  ON CONFLICT DO NOTHING;

  -- Asesor de ventas = brand-scoped (needs both asesor + promotor roles;
  -- validate_visit_data() only accepts 'promotor'/'supervisor' for visits.promotor_id)
  INSERT INTO user_roles (tenant_id, user_profile_id, role, scope, brand_id, status, granted_by)
  VALUES
    (v_tenant_id, v_profile_asesor, 'asesor_de_ventas', 'brand', v_brand_iberia, 'active', v_profile_admin),
    (v_tenant_id, v_profile_asesor, 'promotor', 'brand', v_brand_iberia, 'active', v_profile_admin)
  ON CONFLICT DO NOTHING;

  -- Client user: NO user_roles entry. Link via clients.user_id (Layer 4).

  RAISE NOTICE 'Layer 2: Users & roles ✓ (admin=%, brand=%, supervisor=%, promotor=%, asesor=%, cliente=no profile)',
    v_profile_admin, v_profile_brand, v_profile_supervisor, v_profile_promotor, v_profile_asesor;
END $$;

-- =============================================================================
-- LAYER 3: Brand Configuration (tiers, categories, products, competitors, POP)
-- =============================================================================

DO $$
DECLARE
  v_tenant_id UUID := 'fe0f429d-2d83-4738-af65-32c655cef656';
  v_brand_coca UUID;
  v_brand_lala UUID;
  v_brand_iberia UUID;
  v_profile_brand UUID;
  v_profile_admin UUID;
BEGIN
  SELECT id INTO v_brand_coca FROM brands WHERE tenant_id = v_tenant_id AND slug = 'coca-cola';
  SELECT id INTO v_brand_lala FROM brands WHERE tenant_id = v_tenant_id AND slug = 'lala';
  SELECT id INTO v_brand_iberia FROM brands WHERE tenant_id = v_tenant_id AND slug = 'iberia';
  SELECT id INTO v_profile_brand FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000002';
  SELECT id INTO v_profile_admin FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000001';

  -- ===== TIERS (Coca-Cola) =====
  INSERT INTO tiers (id, tenant_id, brand_id, name, code, tier_level, min_points_required,
                     points_multiplier, is_default, benefits, is_active)
  VALUES
    ('b0000001-0000-0000-0000-000000000001', v_tenant_id, v_brand_coca,
     'Bronce', 'BRONCE', 1, 0, 1.00, true,
     '[{"type":"custom_service","description":"Acceso básico al programa"}]'::jsonb, true),
    ('b0000001-0000-0000-0000-000000000002', v_tenant_id, v_brand_coca,
     'Plata', 'PLATA', 2, 500, 1.50, false,
     '[{"type":"discount","description":"Descuentos 5%"},{"type":"free_delivery","description":"Entrega prioritaria"}]'::jsonb, true),
    ('b0000001-0000-0000-0000-000000000003', v_tenant_id, v_brand_coca,
     'Oro', 'ORO', 3, 2000, 2.00, false,
     '[{"type":"discount","description":"Descuentos 10%"},{"type":"free_delivery","description":"Entrega prioritaria"},{"type":"exclusive_products","description":"Promociones exclusivas"}]'::jsonb, true)
  ON CONFLICT (tenant_id, brand_id, code) DO NOTHING;

  -- ===== PRODUCT CATEGORIES =====
  -- Coca-Cola categories
  INSERT INTO product_categories (id, tenant_id, brand_id, name, code, is_active, sort_order)
  VALUES
    ('c0000001-0000-0000-0000-000000000001', v_tenant_id, v_brand_coca, 'Refrescos', 'REFRESCOS', true, 1),
    ('c0000001-0000-0000-0000-000000000002', v_tenant_id, v_brand_coca, 'Aguas', 'AGUAS', true, 2),
    ('c0000001-0000-0000-0000-000000000003', v_tenant_id, v_brand_coca, 'Jugos', 'JUGOS', true, 3),
    ('c0000001-0000-0000-0000-000000000004', v_tenant_id, v_brand_coca, 'Bebidas Deportivas', 'DEPORTIVAS', true, 4)
  ON CONFLICT (tenant_id, brand_id, code) DO NOTHING;

  -- Lala categories
  INSERT INTO product_categories (id, tenant_id, brand_id, name, code, is_active, sort_order)
  VALUES
    ('c0000002-0000-0000-0000-000000000001', v_tenant_id, v_brand_lala, 'Leches', 'LECHES', true, 1),
    ('c0000002-0000-0000-0000-000000000002', v_tenant_id, v_brand_lala, 'Yogures', 'YOGURES', true, 2),
    ('c0000002-0000-0000-0000-000000000003', v_tenant_id, v_brand_lala, 'Cremas', 'CREMAS', true, 3),
    ('c0000002-0000-0000-0000-000000000004', v_tenant_id, v_brand_lala, 'Quesos', 'QUESOS', true, 4)
  ON CONFLICT (tenant_id, brand_id, code) DO NOTHING;

  -- Iberia categories
  INSERT INTO product_categories (id, tenant_id, brand_id, name, code, is_active, sort_order)
  VALUES
    ('c0000003-0000-0000-0000-000000000001', v_tenant_id, v_brand_iberia, 'Margarinas', 'MARGARINAS', true, 1),
    ('c0000003-0000-0000-0000-000000000002', v_tenant_id, v_brand_iberia, 'Aceites', 'ACEITES', true, 2)
  ON CONFLICT (tenant_id, brand_id, code) DO NOTHING;

  -- ===== PRODUCTS (Parent products — variants in product_variants) =====
  -- Coca-Cola products (8 parents)
  INSERT INTO products (id, tenant_id, brand_id, category_id, name, sku, base_price, unit_type,
                        volume_ml, is_active, include_in_assessment)
  VALUES
    ('d0000001-0000-0000-0000-000000000001', v_tenant_id, v_brand_coca, 'c0000001-0000-0000-0000-000000000001',
     'Coca-Cola Original', 'CC-ORIG', 18.00, 'pieza', 600, true, true),
    ('d0000001-0000-0000-0000-000000000002', v_tenant_id, v_brand_coca, 'c0000001-0000-0000-0000-000000000001',
     'Coca-Cola Light', 'CC-LIGHT', 18.00, 'pieza', 600, true, true),
    ('d0000001-0000-0000-0000-000000000003', v_tenant_id, v_brand_coca, 'c0000001-0000-0000-0000-000000000001',
     'Coca-Cola Zero', 'CC-ZERO', 18.00, 'pieza', 600, true, true),
    ('d0000001-0000-0000-0000-000000000004', v_tenant_id, v_brand_coca, 'c0000001-0000-0000-0000-000000000001',
     'Sprite', 'SPR', 17.00, 'pieza', 600, true, true),
    ('d0000001-0000-0000-0000-000000000005', v_tenant_id, v_brand_coca, 'c0000001-0000-0000-0000-000000000001',
     'Fanta Naranja', 'FAN', 17.00, 'pieza', 600, true, true),
    ('d0000001-0000-0000-0000-000000000006', v_tenant_id, v_brand_coca, 'c0000001-0000-0000-0000-000000000003',
     'Del Valle', 'DV', 28.00, 'pieza', 1000, true, true),
    ('d0000001-0000-0000-0000-000000000007', v_tenant_id, v_brand_coca, 'c0000001-0000-0000-0000-000000000002',
     'Ciel', 'CIEL', 14.00, 'pieza', 1000, true, true),
    ('d0000001-0000-0000-0000-000000000008', v_tenant_id, v_brand_coca, 'c0000001-0000-0000-0000-000000000004',
     'Powerade', 'PWR', 22.00, 'pieza', 600, true, true)
  ON CONFLICT (id) DO NOTHING;

  -- Lala products (7 parents)
  INSERT INTO products (id, tenant_id, brand_id, category_id, name, sku, base_price, unit_type,
                        weight_grams, volume_ml, requires_refrigeration, is_active, include_in_assessment)
  VALUES
    ('d0000002-0000-0000-0000-000000000001', v_tenant_id, v_brand_lala, 'c0000002-0000-0000-0000-000000000001',
     'Leche Entera', 'LE', 26.00, 'pieza', null, 1000, true, true, true),
    ('d0000002-0000-0000-0000-000000000002', v_tenant_id, v_brand_lala, 'c0000002-0000-0000-0000-000000000001',
     'Leche Deslactosada', 'LDL', 29.00, 'pieza', null, 1000, true, true, true),
    ('d0000002-0000-0000-0000-000000000003', v_tenant_id, v_brand_lala, 'c0000002-0000-0000-0000-000000000002',
     'Yoghurt Natural', 'YN', 38.00, 'pieza', 900, null, true, true, true),
    ('d0000002-0000-0000-0000-000000000004', v_tenant_id, v_brand_lala, 'c0000002-0000-0000-0000-000000000002',
     'Yoghurt Fresa', 'YF', 38.00, 'pieza', 900, null, true, true, true),
    ('d0000002-0000-0000-0000-000000000005', v_tenant_id, v_brand_lala, 'c0000002-0000-0000-0000-000000000004',
     'Queso Panela', 'QP', 55.00, 'pieza', 400, null, true, true, true),
    ('d0000002-0000-0000-0000-000000000006', v_tenant_id, v_brand_lala, 'c0000002-0000-0000-0000-000000000004',
     'Queso Oaxaca', 'QO', 62.00, 'pieza', 400, null, true, true, true),
    ('d0000002-0000-0000-0000-000000000007', v_tenant_id, v_brand_lala, 'c0000002-0000-0000-0000-000000000003',
     'Crema Acida', 'CA', 22.00, 'pieza', null, 200, true, true, true)
  ON CONFLICT (id) DO NOTHING;

  -- Iberia products (5 parents)
  INSERT INTO products (id, tenant_id, brand_id, category_id, name, sku, base_price, unit_type,
                        weight_grams, volume_ml, is_active, include_in_assessment)
  VALUES
    ('d0000003-0000-0000-0000-000000000001', v_tenant_id, v_brand_iberia, 'c0000003-0000-0000-0000-000000000001',
     'Margarina Original', 'MO', 28.00, 'pieza', 250, null, true, true),
    ('d0000003-0000-0000-0000-000000000002', v_tenant_id, v_brand_iberia, 'c0000003-0000-0000-0000-000000000001',
     'Margarina Light', 'ML', 32.00, 'pieza', 250, null, true, true),
    ('d0000003-0000-0000-0000-000000000003', v_tenant_id, v_brand_iberia, 'c0000003-0000-0000-0000-000000000002',
     'Aceite Vegetal', 'AV', 38.00, 'pieza', null, 1000, true, true),
    ('d0000003-0000-0000-0000-000000000004', v_tenant_id, v_brand_iberia, 'c0000003-0000-0000-0000-000000000002',
     'Aceite de Maiz', 'AM', 45.00, 'pieza', null, 1000, true, true),
    ('d0000003-0000-0000-0000-000000000005', v_tenant_id, v_brand_iberia, 'c0000003-0000-0000-0000-000000000001',
     'Mantequilla', 'MT', 25.00, 'pieza', 90, null, true, true)
  ON CONFLICT (id) DO NOTHING;

  -- ===== PRODUCT VARIANTS =====
  -- Coca-Cola Original: 600ml, 1L, 2L, 3L, 355ml lata
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, weight_grams, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000001', v_tenant_id, 'd0000001-0000-0000-0000-000000000001', '600ml', 'CC-600', 18.00, 600, 'ml', 'botella PET', null, true, true),
    ('d0100000-0000-0000-0000-000000000002', v_tenant_id, 'd0000001-0000-0000-0000-000000000001', '1L', 'CC-1L', 25.00, 1000, 'ml', 'botella PET', null, false, true),
    ('d0100000-0000-0000-0000-000000000003', v_tenant_id, 'd0000001-0000-0000-0000-000000000001', '2L', 'CC-2L', 35.00, 2000, 'ml', 'botella PET', null, false, true),
    ('d0100000-0000-0000-0000-000000000004', v_tenant_id, 'd0000001-0000-0000-0000-000000000001', '3L', 'CC-3L', 48.00, 3000, 'ml', 'botella PET', null, false, true),
    ('d0100000-0000-0000-0000-000000000005', v_tenant_id, 'd0000001-0000-0000-0000-000000000001', '355ml Lata', 'CC-355L', 15.00, 355, 'ml', 'lata', null, false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Coca-Cola Light: 600ml, 1.5L
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000006', v_tenant_id, 'd0000001-0000-0000-0000-000000000002', '600ml', 'CCL-600', 18.00, 600, 'ml', 'botella PET', true, true),
    ('d0100000-0000-0000-0000-000000000007', v_tenant_id, 'd0000001-0000-0000-0000-000000000002', '1.5L', 'CCL-1500', 28.00, 1500, 'ml', 'botella PET', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Coca-Cola Zero: 600ml, 1.5L
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000008', v_tenant_id, 'd0000001-0000-0000-0000-000000000003', '600ml', 'CCZ-600', 18.00, 600, 'ml', 'botella PET', true, true),
    ('d0100000-0000-0000-0000-000000000009', v_tenant_id, 'd0000001-0000-0000-0000-000000000003', '1.5L', 'CCZ-1500', 28.00, 1500, 'ml', 'botella PET', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Sprite: 600ml, 2L
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000010', v_tenant_id, 'd0000001-0000-0000-0000-000000000004', '600ml', 'SPR-600', 17.00, 600, 'ml', 'botella PET', true, true),
    ('d0100000-0000-0000-0000-000000000011', v_tenant_id, 'd0000001-0000-0000-0000-000000000004', '2L', 'SPR-2L', 30.00, 2000, 'ml', 'botella PET', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Fanta Naranja: 600ml, 2L
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000012', v_tenant_id, 'd0000001-0000-0000-0000-000000000005', '600ml', 'FAN-600', 17.00, 600, 'ml', 'botella PET', true, true),
    ('d0100000-0000-0000-0000-000000000013', v_tenant_id, 'd0000001-0000-0000-0000-000000000005', '2L', 'FAN-2L', 30.00, 2000, 'ml', 'botella PET', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Del Valle: Durazno 1L, Manzana 1L, Durazno 250ml
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000014', v_tenant_id, 'd0000001-0000-0000-0000-000000000006', 'Durazno 1L', 'DV-DUR-1L', 28.00, 1000, 'ml', 'tetrapack', true, true),
    ('d0100000-0000-0000-0000-000000000015', v_tenant_id, 'd0000001-0000-0000-0000-000000000006', 'Manzana 1L', 'DV-MAN-1L', 28.00, 1000, 'ml', 'tetrapack', false, true),
    ('d0100000-0000-0000-0000-000000000016', v_tenant_id, 'd0000001-0000-0000-0000-000000000006', 'Durazno 250ml', 'DV-DUR-250', 12.00, 250, 'ml', 'tetrapack', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Ciel: Natural 1L, Mineralizada 600ml, Natural 500ml
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000017', v_tenant_id, 'd0000001-0000-0000-0000-000000000007', 'Natural 1L', 'CIEL-1L', 14.00, 1000, 'ml', 'botella PET', true, true),
    ('d0100000-0000-0000-0000-000000000018', v_tenant_id, 'd0000001-0000-0000-0000-000000000007', 'Mineralizada 600ml', 'CIEL-MIN-600', 12.00, 600, 'ml', 'botella PET', false, true),
    ('d0100000-0000-0000-0000-000000000019', v_tenant_id, 'd0000001-0000-0000-0000-000000000007', 'Natural 500ml', 'CIEL-500', 10.00, 500, 'ml', 'botella PET', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Powerade: 600ml, 1L
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000020', v_tenant_id, 'd0000001-0000-0000-0000-000000000008', '600ml', 'PWR-600', 22.00, 600, 'ml', 'botella PET', true, true),
    ('d0100000-0000-0000-0000-000000000021', v_tenant_id, 'd0000001-0000-0000-0000-000000000008', '1L', 'PWR-1L', 30.00, 1000, 'ml', 'botella PET', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Leche Entera: 1L, 250ml Individual, 2L
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000022', v_tenant_id, 'd0000002-0000-0000-0000-000000000001', '1L', 'LE-1L', 26.00, 1000, 'ml', 'tetrapack', true, true),
    ('d0100000-0000-0000-0000-000000000023', v_tenant_id, 'd0000002-0000-0000-0000-000000000001', '250ml Individual', 'LE-250', 12.00, 250, 'ml', 'tetrapack', false, true),
    ('d0100000-0000-0000-0000-000000000024', v_tenant_id, 'd0000002-0000-0000-0000-000000000001', '2L', 'LE-2L', 48.00, 2000, 'ml', 'tetrapack', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Leche Deslactosada: 1L, 250ml Individual
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000025', v_tenant_id, 'd0000002-0000-0000-0000-000000000002', '1L', 'LDL-1L', 29.00, 1000, 'ml', 'tetrapack', true, true),
    ('d0100000-0000-0000-0000-000000000026', v_tenant_id, 'd0000002-0000-0000-0000-000000000002', '250ml Individual', 'LDL-250', 13.00, 250, 'ml', 'tetrapack', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Yoghurt Natural: 900g, 220ml Bebible
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000027', v_tenant_id, 'd0000002-0000-0000-0000-000000000003', '900g', 'YN-900', 38.00, 900, 'g', 'envase', true, true),
    ('d0100000-0000-0000-0000-000000000028', v_tenant_id, 'd0000002-0000-0000-0000-000000000003', '220ml Bebible', 'YN-220', 14.00, 220, 'ml', 'botella', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Yoghurt Fresa: 900g, 220ml Bebible
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000029', v_tenant_id, 'd0000002-0000-0000-0000-000000000004', '900g', 'YF-900', 38.00, 900, 'g', 'envase', true, true),
    ('d0100000-0000-0000-0000-000000000030', v_tenant_id, 'd0000002-0000-0000-0000-000000000004', '220ml Bebible', 'YF-220', 14.00, 220, 'ml', 'botella', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Queso Panela: 400g
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, weight_grams, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000031', v_tenant_id, 'd0000002-0000-0000-0000-000000000005', '400g', 'QP-400', 55.00, 400, 'g', 'empaque', 400, true, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Queso Oaxaca: 400g
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, weight_grams, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000032', v_tenant_id, 'd0000002-0000-0000-0000-000000000006', '400g', 'QO-400', 62.00, 400, 'g', 'empaque', 400, true, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Crema Acida: 450ml, 200ml
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000033', v_tenant_id, 'd0000002-0000-0000-0000-000000000007', '450ml', 'CA-450', 35.00, 450, 'ml', 'envase', true, true),
    ('d0100000-0000-0000-0000-000000000034', v_tenant_id, 'd0000002-0000-0000-0000-000000000007', '200ml', 'CA-200', 22.00, 200, 'ml', 'envase', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Margarina Original: 250g, 500g
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, weight_grams, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000035', v_tenant_id, 'd0000003-0000-0000-0000-000000000001', '250g', 'MO-250', 28.00, 250, 'g', 'barra', 250, true, true),
    ('d0100000-0000-0000-0000-000000000036', v_tenant_id, 'd0000003-0000-0000-0000-000000000001', '500g', 'MO-500', 48.00, 500, 'g', 'barra', 500, false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Margarina Light: 250g
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, weight_grams, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000037', v_tenant_id, 'd0000003-0000-0000-0000-000000000002', '250g', 'ML-250', 32.00, 250, 'g', 'barra', 250, true, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Aceite Vegetal: 1L, 500ml
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000038', v_tenant_id, 'd0000003-0000-0000-0000-000000000003', '1L', 'AV-1L', 38.00, 1000, 'ml', 'botella', true, true),
    ('d0100000-0000-0000-0000-000000000039', v_tenant_id, 'd0000003-0000-0000-0000-000000000003', '500ml', 'AV-500', 22.00, 500, 'ml', 'botella', false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Aceite de Maiz: 1L
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000040', v_tenant_id, 'd0000003-0000-0000-0000-000000000004', '1L', 'AM-1L', 45.00, 1000, 'ml', 'botella', true, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- Mantequilla: 90g, 225g
  INSERT INTO product_variants (id, tenant_id, product_id, variant_name, variant_code, price, size_value, size_unit, package_type, weight_grams, is_default, is_active)
  VALUES
    ('d0100000-0000-0000-0000-000000000041', v_tenant_id, 'd0000003-0000-0000-0000-000000000005', '90g', 'MT-90', 25.00, 90, 'g', 'barra', 90, true, true),
    ('d0100000-0000-0000-0000-000000000042', v_tenant_id, 'd0000003-0000-0000-0000-000000000005', '225g', 'MT-225', 52.00, 225, 'g', 'barra', 225, false, true)
  ON CONFLICT (tenant_id, product_id, variant_code) DO NOTHING;

  -- ===== BRAND COMPETITORS =====
  INSERT INTO brand_competitors (id, tenant_id, brand_id, competitor_name, is_active, display_order)
  VALUES
    ('e0000001-0000-0000-0000-000000000001', v_tenant_id, v_brand_coca, 'PepsiCo', true, 1),
    ('e0000001-0000-0000-0000-000000000002', v_tenant_id, v_brand_coca, 'Big Cola', true, 2),
    ('e0000001-0000-0000-0000-000000000003', v_tenant_id, v_brand_lala, 'Alpura', true, 1),
    ('e0000001-0000-0000-0000-000000000004', v_tenant_id, v_brand_lala, 'Santa Clara', true, 2),
    ('e0000001-0000-0000-0000-000000000005', v_tenant_id, v_brand_iberia, 'La Gloria', true, 1),
    ('e0000001-0000-0000-0000-000000000006', v_tenant_id, v_brand_iberia, 'Primavera', true, 2)
  ON CONFLICT (id) DO NOTHING;

  -- ===== POP MATERIALS =====
  INSERT INTO brand_pop_materials (id, tenant_id, brand_id, material_name, material_category, is_active, display_order)
  VALUES
    ('f0000001-0000-0000-0000-000000000001', v_tenant_id, v_brand_coca, 'Refrigerador Coca-Cola', 'refrigerador', true, 1),
    ('f0000001-0000-0000-0000-000000000002', v_tenant_id, v_brand_coca, 'Exhibidor de Piso', 'exhibidor', true, 2),
    ('f0000001-0000-0000-0000-000000000003', v_tenant_id, v_brand_coca, 'Póster Promocional', 'poster', true, 3),
    ('f0000001-0000-0000-0000-000000000004', v_tenant_id, v_brand_coca, 'Inflable de Mostrador', 'inflable', true, 4),
    ('f0000001-0000-0000-0000-000000000005', v_tenant_id, v_brand_lala, 'Refrigerador Lala', 'refrigerador', true, 1),
    ('f0000001-0000-0000-0000-000000000006', v_tenant_id, v_brand_lala, 'Exhibidor Lácteos', 'exhibidor', true, 2),
    ('f0000001-0000-0000-0000-000000000007', v_tenant_id, v_brand_lala, 'Póster Yoghurt', 'poster', true, 3),
    ('f0000001-0000-0000-0000-000000000008', v_tenant_id, v_brand_iberia, 'Exhibidor Margarina', 'exhibidor', true, 1),
    ('f0000001-0000-0000-0000-000000000009', v_tenant_id, v_brand_iberia, 'Hielera Iberia', 'hielera', true, 2),
    ('f0000001-0000-0000-0000-000000000010', v_tenant_id, v_brand_iberia, 'Póster Aceites', 'poster', true, 3)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Layer 3: Brand configuration ✓';
END $$;

-- =============================================================================
-- LAYER 4: Clients & Assignments
-- =============================================================================

DO $$
DECLARE
  v_tenant_id UUID := 'fe0f429d-2d83-4738-af65-32c655cef656';
  v_brand_coca UUID;
  v_brand_lala UUID;
  v_brand_iberia UUID;
  v_zone_cdmx UUID;
  v_zone_mty  UUID;
  v_zone_gdl  UUID;
  v_market_trad UUID;
  v_market_mod  UUID;
  v_market_auto UUID;
  v_ct_cremeria UUID;
  v_ct_abarrotes UUID;
  v_ct_farmacia UUID;
  v_ct_minisuper UUID;
  v_cs_id UUID;
  v_profile_promotor UUID;
  v_profile_asesor   UUID;
  v_auth_cliente     UUID := 'dd000001-0000-0000-0000-000000000006';
  v_first_client_id UUID;
  i INTEGER;
BEGIN
  SELECT id INTO v_brand_coca FROM brands WHERE tenant_id = v_tenant_id AND slug = 'coca-cola';
  SELECT id INTO v_brand_lala FROM brands WHERE tenant_id = v_tenant_id AND slug = 'lala';
  SELECT id INTO v_brand_iberia FROM brands WHERE tenant_id = v_tenant_id AND slug = 'iberia';

  -- Zones
  SELECT id INTO v_zone_cdmx FROM zones WHERE tenant_id = v_tenant_id AND code = 'CDMX';
  SELECT id INTO v_zone_mty  FROM zones WHERE tenant_id = v_tenant_id AND code = 'MTY';
  SELECT id INTO v_zone_gdl  FROM zones WHERE tenant_id = v_tenant_id AND code = 'GDL';

  -- Markets (lookup existing + new)
  SELECT id INTO v_market_trad FROM markets WHERE tenant_id = v_tenant_id AND code = 'TRADICIONAL';
  IF v_market_trad IS NULL THEN
    SELECT id INTO v_market_trad FROM markets WHERE tenant_id = v_tenant_id AND name ILIKE '%tradicion%' LIMIT 1;
  END IF;
  SELECT id INTO v_market_mod  FROM markets WHERE tenant_id = v_tenant_id AND code = 'MOD';
  SELECT id INTO v_market_auto FROM markets WHERE tenant_id = v_tenant_id AND code = 'AUTO';

  -- Client types
  SELECT id INTO v_ct_cremeria FROM client_types WHERE tenant_id = v_tenant_id AND code = 'CREMERIA';
  IF v_ct_cremeria IS NULL THEN
    SELECT id INTO v_ct_cremeria FROM client_types WHERE tenant_id = v_tenant_id AND name ILIKE '%cremer%' LIMIT 1;
  END IF;
  SELECT id INTO v_ct_abarrotes FROM client_types WHERE tenant_id = v_tenant_id AND code = 'ABARROTES';
  SELECT id INTO v_ct_farmacia  FROM client_types WHERE tenant_id = v_tenant_id AND code = 'FARMACIA';
  SELECT id INTO v_ct_minisuper FROM client_types WHERE tenant_id = v_tenant_id AND code = 'MINISUPER';

  -- Commercial structure
  SELECT id INTO v_cs_id FROM commercial_structures WHERE tenant_id = v_tenant_id LIMIT 1;

  -- Profiles
  SELECT id INTO v_profile_promotor FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000004';
  SELECT id INTO v_profile_asesor   FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000005';

  -- Use CDMX as fallback if not found
  IF v_zone_cdmx IS NULL THEN
    SELECT id INTO v_zone_cdmx FROM zones WHERE tenant_id = v_tenant_id LIMIT 1;
  END IF;
  IF v_market_trad IS NULL THEN
    SELECT id INTO v_market_trad FROM markets WHERE tenant_id = v_tenant_id LIMIT 1;
  END IF;
  IF v_ct_cremeria IS NULL THEN
    SELECT id INTO v_ct_cremeria FROM client_types WHERE tenant_id = v_tenant_id LIMIT 1;
  END IF;

  -- ===== CLIENTS (47 new) =====
  -- We'll use deterministic IDs for traceability
  -- CDMX clients (20)
  FOR i IN 1..20 LOOP
    INSERT INTO clients (
      id, tenant_id, business_name, owner_name, phone, email,
      zone_id, market_id, client_type_id, commercial_structure_id,
      address_street, address_city, address_state, address_postal_code,
      latitude, longitude, status, notes
    )
    VALUES (
      ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
      v_tenant_id,
      CASE (i % 4)
        WHEN 0 THEN 'Abarrotes "La Guadalupana ' || i || '"'
        WHEN 1 THEN 'Cremería "San José ' || i || '"'
        WHEN 2 THEN 'Farmacia "Santa María ' || i || '"'
        WHEN 3 THEN 'Minisuper "El Ranchito ' || i || '"'
      END,
      'Propietario CDMX ' || i,
      '55' || lpad((10000000 + i * 1111)::text, 8, '0'),
      'cdmx' || i || '@demo.test',
      v_zone_cdmx,
      CASE WHEN i <= 12 THEN v_market_trad WHEN i <= 17 THEN v_market_mod ELSE v_market_auto END,
      CASE (i % 4)
        WHEN 0 THEN v_ct_abarrotes
        WHEN 1 THEN v_ct_cremeria
        WHEN 2 THEN v_ct_farmacia
        WHEN 3 THEN v_ct_minisuper
      END,
      v_cs_id,
      'Calle ' || i || ' #' || (100 + i),
      'Ciudad de México', 'CDMX', lpad((6000 + i)::text, 5, '0'),
      19.43 + (random() * 0.08 - 0.04),
      -99.13 + (random() * 0.08 - 0.04),
      'active',
      '[DEMO-SEED]'
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- MTY clients (15)
  FOR i IN 21..35 LOOP
    INSERT INTO clients (
      id, tenant_id, business_name, owner_name, phone, email,
      zone_id, market_id, client_type_id, commercial_structure_id,
      address_street, address_city, address_state, address_postal_code,
      latitude, longitude, status, notes
    )
    VALUES (
      ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
      v_tenant_id,
      CASE (i % 4)
        WHEN 0 THEN 'Abarrotes "El Norteño ' || i || '"'
        WHEN 1 THEN 'Cremería "La Regia ' || i || '"'
        WHEN 2 THEN 'Farmacia "Del Norte ' || i || '"'
        WHEN 3 THEN 'Minisuper "El Sultán ' || i || '"'
      END,
      'Propietario MTY ' || i,
      '81' || lpad((10000000 + i * 1111)::text, 8, '0'),
      'mty' || i || '@demo.test',
      v_zone_mty,
      CASE WHEN i <= 28 THEN v_market_trad WHEN i <= 33 THEN v_market_mod ELSE v_market_auto END,
      CASE (i % 4)
        WHEN 0 THEN v_ct_abarrotes
        WHEN 1 THEN v_ct_cremeria
        WHEN 2 THEN v_ct_farmacia
        WHEN 3 THEN v_ct_minisuper
      END,
      v_cs_id,
      'Av. Constitución ' || (200 + i),
      'Monterrey', 'Nuevo León', lpad((64000 + i)::text, 5, '0'),
      25.67 + (random() * 0.06 - 0.03),
      -100.31 + (random() * 0.06 - 0.03),
      'active',
      '[DEMO-SEED]'
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- GDL clients (12)
  FOR i IN 36..47 LOOP
    INSERT INTO clients (
      id, tenant_id, business_name, owner_name, phone, email,
      zone_id, market_id, client_type_id, commercial_structure_id,
      address_street, address_city, address_state, address_postal_code,
      latitude, longitude, status, notes
    )
    VALUES (
      ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
      v_tenant_id,
      CASE (i % 4)
        WHEN 0 THEN 'Abarrotes "El Tapatío ' || i || '"'
        WHEN 1 THEN 'Cremería "La Perla ' || i || '"'
        WHEN 2 THEN 'Farmacia "Guadalajara ' || i || '"'
        WHEN 3 THEN 'Minisuper "El Jalisciense ' || i || '"'
      END,
      'Propietario GDL ' || i,
      '33' || lpad((10000000 + i * 1111)::text, 8, '0'),
      'gdl' || i || '@demo.test',
      v_zone_gdl,
      CASE WHEN i <= 42 THEN v_market_trad ELSE v_market_mod END,
      CASE (i % 4)
        WHEN 0 THEN v_ct_abarrotes
        WHEN 1 THEN v_ct_cremeria
        WHEN 2 THEN v_ct_farmacia
        WHEN 3 THEN v_ct_minisuper
      END,
      v_cs_id,
      'Av. Juárez ' || (300 + i),
      'Guadalajara', 'Jalisco', lpad((44000 + i)::text, 5, '0'),
      20.67 + (random() * 0.06 - 0.03),
      -103.35 + (random() * 0.06 - 0.03),
      'active',
      '[DEMO-SEED]'
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- Link first client to cliente@demo user
  v_first_client_id := 'f1000000-0000-0000-0000-000000000001'::uuid;
  UPDATE clients SET user_id = v_auth_cliente WHERE id = v_first_client_id AND user_id IS NULL;

  -- ===== CLIENT BRAND MEMBERSHIPS =====
  -- Check existence before insert to avoid BEFORE INSERT trigger on re-runs
  -- All 47 new clients → Coca-Cola
  FOR i IN 1..47 LOOP
    IF NOT EXISTS (
      SELECT 1 FROM client_brand_memberships
      WHERE client_id = ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
        AND brand_id = v_brand_coca
    ) THEN
      INSERT INTO client_brand_memberships (
        tenant_id, client_id, brand_id, membership_status, is_primary_brand,
        current_tier_id
      )
      VALUES (
        v_tenant_id,
        ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
        v_brand_coca,
        'active', true,
        'b0000001-0000-0000-0000-000000000001' -- Bronce tier
      );
    END IF;
  END LOOP;

  -- First 30 → Lala
  FOR i IN 1..30 LOOP
    IF NOT EXISTS (
      SELECT 1 FROM client_brand_memberships
      WHERE client_id = ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
        AND brand_id = v_brand_lala
    ) THEN
      INSERT INTO client_brand_memberships (
        tenant_id, client_id, brand_id, membership_status
      )
      VALUES (
        v_tenant_id,
        ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
        v_brand_lala,
        'active'
      );
    END IF;
  END LOOP;

  -- First 25 → Iberia
  FOR i IN 1..25 LOOP
    IF NOT EXISTS (
      SELECT 1 FROM client_brand_memberships
      WHERE client_id = ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
        AND brand_id = v_brand_iberia
    ) THEN
      INSERT INTO client_brand_memberships (
        tenant_id, client_id, brand_id, membership_status
      )
      VALUES (
        v_tenant_id,
        ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
        v_brand_iberia,
        'active'
      );
    END IF;
  END LOOP;

  -- ===== CLIENT ASSIGNMENTS =====
  -- Promotor → 15 CDMX clients
  FOR i IN 1..15 LOOP
    INSERT INTO client_assignments (
      tenant_id, user_profile_id, client_id, is_active
    )
    VALUES (
      v_tenant_id, v_profile_promotor,
      ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
      true
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Asesor → 12 cross-zona clients
  FOR i IN 10..21 LOOP
    INSERT INTO client_assignments (
      tenant_id, user_profile_id, client_id, is_active
    )
    VALUES (
      v_tenant_id, v_profile_asesor,
      ('f1000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
      true
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Layer 4: Clients & assignments ✓';
END $$;

-- =============================================================================
-- LAYER 5: Transactional Data (Visits, Assessments, Orders)
-- =============================================================================

DO $$
DECLARE
  v_tenant_id UUID := 'fe0f429d-2d83-4738-af65-32c655cef656';
  v_brand_coca UUID;
  v_brand_lala UUID;
  v_brand_iberia UUID;
  v_profile_promotor UUID;
  v_profile_asesor   UUID;
  v_profile_brand    UUID;
  v_cs_id UUID;
  v_visit_id UUID;
  v_visit_order_id UUID;
  v_brand_id UUID;
  v_client_id UUID;
  v_promotor_id UUID;
  v_visit_date DATE;
  v_status TEXT;
  v_workflow TEXT;
  v_product_id UUID;
  v_line_total NUMERIC;
  v_subtotal NUMERIC;
  i INTEGER;
  j INTEGER;
  v_product_ids UUID[];
BEGIN
  SELECT id INTO v_brand_coca FROM brands WHERE tenant_id = v_tenant_id AND slug = 'coca-cola';
  SELECT id INTO v_brand_lala FROM brands WHERE tenant_id = v_tenant_id AND slug = 'lala';
  SELECT id INTO v_brand_iberia FROM brands WHERE tenant_id = v_tenant_id AND slug = 'iberia';
  SELECT id INTO v_profile_promotor FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000004';
  SELECT id INTO v_profile_asesor   FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000005';
  SELECT id INTO v_profile_brand    FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000002';
  SELECT id INTO v_cs_id FROM commercial_structures WHERE tenant_id = v_tenant_id LIMIT 1;

  -- ===== 100 VISITS =====
  FOR i IN 1..100 LOOP
    -- Determine brand (40 coca, 35 lala, 25 iberia)
    IF i <= 40 THEN
      v_brand_id := v_brand_coca;
    ELSIF i <= 75 THEN
      v_brand_id := v_brand_lala;
    ELSE
      v_brand_id := v_brand_iberia;
    END IF;

    -- Assign client (cycle through our 47)
    v_client_id := ('f1000000-0000-0000-0000-' || lpad(((i % 47) + 1)::text, 12, '0'))::uuid;

    -- Assign promotor/asesor
    IF i % 3 = 0 THEN
      v_promotor_id := v_profile_asesor;
    ELSE
      v_promotor_id := v_profile_promotor;
    END IF;

    -- Distribute dates: cycle across all 3 months so every brand has visits in each month
    IF i % 3 = 0 THEN
      v_visit_date := '2025-12-01'::date + (i % 28);
    ELSIF i % 3 = 1 THEN
      v_visit_date := '2026-01-01'::date + (i % 28);
    ELSE
      v_visit_date := '2026-02-01'::date + (i % 18);
    END IF;

    -- Status distribution: 70 completed, 15 in_progress, 10 planned, 5 cancelled
    IF i <= 70 THEN
      v_status := 'completed';
      v_workflow := 'completed';
    ELSIF i <= 85 THEN
      v_status := 'in_progress';
      v_workflow := 'assessment_pending';
    ELSIF i <= 95 THEN
      v_status := 'planned';
      v_workflow := 'assessment_pending';
    ELSE
      v_status := 'cancelled';
      v_workflow := 'assessment_pending';
    END IF;

    v_visit_id := ('f2000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid;

    INSERT INTO visits (
      id, tenant_id, promotor_id, client_id, brand_id,
      visit_date, visit_type, visit_status, workflow_status,
      visit_notes
    )
    VALUES (
      v_visit_id, v_tenant_id, v_promotor_id, v_client_id, v_brand_id,
      v_visit_date, 'scheduled', v_status::visit_status_enum, v_workflow::visit_workflow_status_enum,
      '[DEMO-SEED] Visita demo ' || i
    )
    ON CONFLICT (id) DO NOTHING;

    -- ===== VISIT STAGE ASSESSMENTS (for completed visits) =====
    IF v_status = 'completed' THEN
      INSERT INTO visit_stage_assessments (
        id, tenant_id, visit_id,
        pricing_audit_notes, stage1_completed_at,
        has_inventory, purchase_inventory_notes, stage2_completed_at,
        communication_compliance, pop_execution_notes, stage3_completed_at,
        all_stages_completed, completed_at
      )
      VALUES (
        ('f3000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
        v_tenant_id, v_visit_id,
        'Precios dentro del rango sugerido [DEMO-SEED]', v_visit_date::timestamptz + interval '9 hours',
        true, 'Inventario verificado [DEMO-SEED]', v_visit_date::timestamptz + interval '10 hours',
        'full', 'Material POP presente y en buen estado [DEMO-SEED]', v_visit_date::timestamptz + interval '11 hours',
        true, v_visit_date::timestamptz + interval '11 hours'
      )
      ON CONFLICT (id) DO NOTHING;

      -- ===== BRAND PRODUCT ASSESSMENTS (3-5 products per visit) =====
      -- Get product IDs for the brand
      SELECT array_agg(p.id ORDER BY p.id) INTO v_product_ids
      FROM products p
      WHERE p.brand_id = v_brand_id AND p.tenant_id = v_tenant_id AND p.is_active = true
      LIMIT 5;

      IF v_product_ids IS NOT NULL THEN
        FOR j IN 1..LEAST(array_length(v_product_ids, 1), 4) LOOP
          IF NOT EXISTS (
            SELECT 1 FROM visit_brand_product_assessments
            WHERE visit_id = v_visit_id AND product_id = v_product_ids[j]
          ) THEN
            INSERT INTO visit_brand_product_assessments (
              tenant_id, visit_id, product_id,
              is_product_present, stock_level, current_price, suggested_price,
              has_active_promotion, has_pop_material, facing_count
            )
            VALUES (
              v_tenant_id, v_visit_id, v_product_ids[j],
              (random() > 0.15), -- 85% present
              CASE WHEN random() > 0.7 THEN 'high'::stock_level_observed_enum WHEN random() > 0.3 THEN 'medium'::stock_level_observed_enum ELSE 'low'::stock_level_observed_enum END,
              (SELECT base_price FROM products WHERE id = v_product_ids[j]) * (0.95 + random() * 0.1),
              (SELECT base_price FROM products WHERE id = v_product_ids[j]),
              (random() > 0.7),
              (random() > 0.5),
              (1 + floor(random() * 4))::int
            );
          END IF;
        END LOOP;
      END IF;

      -- ===== COMPETITOR ASSESSMENTS (40% of visits) =====
      IF random() < 0.4 THEN
        INSERT INTO visit_competitor_assessments (
          tenant_id, visit_id,
          competitor_id,
          product_name_observed, observed_price,
          has_active_promotion, has_pop_material, facing_count
        )
        SELECT
          v_tenant_id, v_visit_id,
          bc.id,
          'Producto competidor observado', (15 + random() * 30)::numeric(10,2),
          (random() > 0.6), (random() > 0.5), (1 + floor(random() * 3))::int
        FROM brand_competitors bc
        WHERE bc.brand_id = v_brand_id AND bc.tenant_id = v_tenant_id
        LIMIT 2
        ON CONFLICT DO NOTHING;
      END IF;

      -- ===== POP MATERIAL CHECKS =====
      INSERT INTO visit_pop_material_checks (
        tenant_id, visit_id, pop_material_id,
        is_present, condition
      )
      SELECT
        v_tenant_id, v_visit_id, bpm.id,
        (random() > 0.2), -- 80% present
        CASE WHEN random() > 0.3 THEN 'good'::material_condition_enum ELSE 'damaged'::material_condition_enum END
      FROM brand_pop_materials bpm
      WHERE bpm.brand_id = v_brand_id AND bpm.tenant_id = v_tenant_id
      LIMIT 3
      ON CONFLICT DO NOTHING;

    END IF; -- completed visits

    -- ===== VISIT ORDERS (40 total, for visits 1-40) =====
    IF i <= 40 THEN
      v_visit_order_id := ('f4000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid;

      -- Calculate subtotal first (we'll add items after)
      v_subtotal := 0;

      INSERT INTO visit_orders (
        id, tenant_id, visit_id, client_id, promotor_id,
        order_type, order_status, order_date,
        payment_method, subtotal, discount_amount, tax_amount, total_amount,
        order_notes
      )
      VALUES (
        v_visit_order_id, v_tenant_id, v_visit_id, v_client_id, v_promotor_id,
        'immediate',
        CASE
          WHEN i <= 15 THEN 'delivered'
          WHEN i <= 25 THEN 'confirmed'
          WHEN i <= 33 THEN 'processed'
          WHEN i <= 38 THEN 'draft'
          ELSE 'cancelled'
        END::visit_order_status_enum,
        v_visit_date,
        'cash', 0, 0, 0, 0,
        '[DEMO-SEED] Pedido demo ' || i
      )
      ON CONFLICT (id) DO NOTHING;

      -- ===== VISIT ORDER ITEMS (3-5 per order) =====
      IF v_product_ids IS NOT NULL THEN
        v_subtotal := 0;
        FOR j IN 1..LEAST(array_length(v_product_ids, 1), 3 + (i % 3)) LOOP
          v_product_id := v_product_ids[j];
          v_line_total := (SELECT base_price FROM products WHERE id = v_product_id) *
                          (2 + (i % 5));

          INSERT INTO visit_order_items (
            id, tenant_id, visit_order_id, product_id,
            line_number, quantity_ordered, unit_price,
            line_subtotal, line_total, unit_type, item_source
          )
          VALUES (
            ('f5000000-' || lpad(i::text, 4, '0') || '-0000-0000-' || lpad(j::text, 12, '0'))::uuid,
            v_tenant_id, v_visit_order_id, v_product_id,
            j,
            2 + (i % 5),
            (SELECT base_price FROM products WHERE id = v_product_id),
            v_line_total, v_line_total,
            'pieza', 'catalog'
          )
          ON CONFLICT (id) DO NOTHING;

          v_subtotal := v_subtotal + v_line_total;
        END LOOP;

        -- Update visit order totals
        UPDATE visit_orders SET
          subtotal = v_subtotal,
          tax_amount = ROUND(v_subtotal * 0.16, 2),
          total_amount = ROUND(v_subtotal * 1.16, 2)
        WHERE id = v_visit_order_id AND total_amount = 0;
      END IF;
    END IF; -- visit orders

  END LOOP; -- visits loop

  RAISE NOTICE 'Layer 5: Visits, assessments & orders ✓';
END $$;

-- =============================================================================
-- LAYER 5b: Direct Orders (orders + order_items)
-- =============================================================================

DO $$
DECLARE
  v_tenant_id UUID := 'fe0f429d-2d83-4738-af65-32c655cef656';
  v_brand_coca UUID;
  v_brand_lala UUID;
  v_brand_iberia UUID;
  v_profile_asesor UUID;
  v_cs_id UUID := 'a0000004-0000-0000-0000-000000000001'; -- Directo
  v_order_id UUID;
  v_brand_id UUID;
  v_client_id UUID;
  v_order_status TEXT;
  v_payment_status TEXT;
  v_order_date DATE;
  v_source_channel TEXT;
  v_assigned_to UUID;
  v_product_ids UUID[];
  v_product_id UUID;
  v_unit_price NUMERIC;
  v_quantity INTEGER;
  v_line_subtotal NUMERIC;
  v_subtotal NUMERIC;
  v_item_idx INTEGER;
  i INTEGER;
  j INTEGER;
BEGIN
  SELECT id INTO v_brand_coca FROM brands WHERE tenant_id = v_tenant_id AND slug = 'coca-cola';
  SELECT id INTO v_brand_lala FROM brands WHERE tenant_id = v_tenant_id AND slug = 'lala';
  SELECT id INTO v_brand_iberia FROM brands WHERE tenant_id = v_tenant_id AND slug = 'iberia';
  SELECT id INTO v_profile_asesor FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000005';

  v_item_idx := 0;

  FOR i IN 1..30 LOOP
    v_order_id := ('f6000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid;

    -- Determine brand
    IF i <= 12 THEN
      v_brand_id := v_brand_coca;
    ELSIF i <= 22 THEN
      v_brand_id := v_brand_lala;
    ELSE
      v_brand_id := v_brand_iberia;
    END IF;

    -- Cycle through clients
    v_client_id := ('f1000000-0000-0000-0000-' || lpad(((i % 47) + 1)::text, 12, '0'))::uuid;

    -- Status + payment_status distribution
    IF i <= 4 THEN
      v_order_status := 'completed'; v_payment_status := 'paid';
      v_order_date := '2025-12-01'::date + (i * 5);
    ELSIF i <= 8 THEN
      v_order_status := 'delivered'; v_payment_status := 'paid';
      v_order_date := '2026-01-01'::date + ((i - 4) * 6);
    ELSIF i <= 12 THEN
      v_order_status := CASE WHEN i <= 10 THEN 'confirmed' ELSE 'submitted' END;
      v_payment_status := 'pending';
      v_order_date := '2026-02-01'::date + ((i - 8) * 3);
    ELSIF i <= 16 THEN
      v_order_status := 'completed'; v_payment_status := 'paid';
      v_order_date := '2025-12-15'::date + ((i - 12) * 7);
    ELSIF i <= 20 THEN
      v_order_status := CASE WHEN i <= 18 THEN 'delivered' ELSE 'shipped' END;
      v_payment_status := 'pending';
      v_order_date := '2026-01-10'::date + ((i - 16) * 6);
    ELSIF i <= 22 THEN
      v_order_status := 'draft'; v_payment_status := 'pending';
      v_order_date := '2026-02-10'::date + ((i - 20) * 2);
    ELSIF i <= 26 THEN
      v_order_status := CASE WHEN i <= 24 THEN 'completed' ELSE 'delivered' END;
      v_payment_status := 'paid';
      v_order_date := '2026-01-05'::date + ((i - 22) * 5);
    ELSIF i <= 28 THEN
      v_order_status := 'confirmed'; v_payment_status := 'pending';
      v_order_date := '2026-02-05'::date + ((i - 26) * 4);
    ELSIF i = 29 THEN
      v_order_status := 'submitted'; v_payment_status := 'pending';
      v_order_date := '2026-02-15'::date;
    ELSE
      v_order_status := 'cancelled'; v_payment_status := 'pending';
      v_order_date := '2026-02-01'::date;
    END IF;

    -- Source channel mix
    v_source_channel := CASE
      WHEN i % 5 = 0 THEN 'whatsapp'
      WHEN i % 5 = 1 THEN 'client_portal'
      WHEN i % 5 = 2 THEN 'phone'
      WHEN i % 5 = 3 THEN 'email'
      ELSE 'mobile_app'
    END;

    -- Assign half to asesor
    IF i % 2 = 0 THEN
      v_assigned_to := v_profile_asesor;
    ELSE
      v_assigned_to := NULL;
    END IF;

    -- Insert order with placeholder totals (updated after items)
    INSERT INTO orders (
      id, tenant_id, client_id, brand_id, order_number, order_status, order_date,
      commercial_structure_id, payment_method, payment_status,
      subtotal, tax_amount, total_amount, source_channel, assigned_to,
      priority, internal_notes
    )
    VALUES (
      v_order_id, v_tenant_id, v_client_id, v_brand_id,
      'ORD-DEMO-' || lpad(i::text, 4, '0'),
      v_order_status::order_status_enum,
      v_order_date,
      v_cs_id,
      CASE WHEN i % 3 = 0 THEN 'transfer' WHEN i % 3 = 1 THEN 'cash' ELSE 'credit' END::order_payment_method_enum,
      v_payment_status::order_payment_status_enum,
      0, 0, 0,
      v_source_channel::order_source_channel_enum,
      v_assigned_to,
      CASE WHEN i % 4 = 0 THEN 'high' ELSE 'normal' END::order_priority_enum,
      '[DEMO-SEED] Orden directa demo ' || i
    )
    ON CONFLICT (id) DO NOTHING;

    -- Get products for this brand
    SELECT array_agg(p.id ORDER BY p.id) INTO v_product_ids
    FROM products p
    WHERE p.brand_id = v_brand_id AND p.tenant_id = v_tenant_id AND p.is_active = true;

    -- Insert 3 order_items per order
    IF v_product_ids IS NOT NULL THEN
      v_subtotal := 0;
      FOR j IN 1..3 LOOP
        v_product_id := v_product_ids[((i + j - 1) % array_length(v_product_ids, 1)) + 1];
        SELECT base_price INTO v_unit_price FROM products WHERE id = v_product_id;
        v_quantity := 2 + (i % 5) + j;
        v_line_subtotal := v_unit_price * v_quantity;
        v_item_idx := v_item_idx + 1;

        INSERT INTO order_items (
          id, tenant_id, order_id, product_id, line_number,
          quantity_ordered, unit_price, line_subtotal, line_total, unit_type
        )
        VALUES (
          ('f6100000-0000-0000-0000-' || lpad(v_item_idx::text, 12, '0'))::uuid,
          v_tenant_id, v_order_id, v_product_id,
          j,
          v_quantity,
          v_unit_price,
          v_line_subtotal, v_line_subtotal,
          'pieza'
        )
        ON CONFLICT (id) DO NOTHING;

        v_subtotal := v_subtotal + v_line_subtotal;
      END LOOP;

      -- Update order totals
      UPDATE orders SET
        subtotal = v_subtotal,
        tax_amount = ROUND(v_subtotal * 0.16, 2),
        total_amount = ROUND(v_subtotal * 1.16, 2)
      WHERE id = v_order_id AND total_amount = 0;
    END IF;

  END LOOP; -- orders loop

  RAISE NOTICE 'Layer 5b: Direct orders ✓';
END $$;

-- =============================================================================
-- LAYER 6: Promotions & Surveys
-- =============================================================================

DO $$
DECLARE
  v_tenant_id UUID := 'fe0f429d-2d83-4738-af65-32c655cef656';
  v_brand_coca UUID;
  v_brand_lala UUID;
  v_brand_iberia UUID;
  v_profile_brand  UUID;
  v_profile_admin  UUID;
  v_profile_promotor UUID;
  v_profile_asesor UUID;
  v_promo_id UUID;
  v_survey_id UUID;
  v_question_id UUID;
  v_response_id UUID;
  i INTEGER;
BEGIN
  SELECT id INTO v_brand_coca FROM brands WHERE tenant_id = v_tenant_id AND slug = 'coca-cola';
  SELECT id INTO v_brand_lala FROM brands WHERE tenant_id = v_tenant_id AND slug = 'lala';
  SELECT id INTO v_brand_iberia FROM brands WHERE tenant_id = v_tenant_id AND slug = 'iberia';
  SELECT id INTO v_profile_brand FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000002';
  SELECT id INTO v_profile_admin FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000001';
  SELECT id INTO v_profile_promotor FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000004';
  SELECT id INTO v_profile_asesor FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000005';

  -- ===== PROMOTIONS =====
  -- Coca-Cola promotions
  INSERT INTO promotions (id, tenant_id, brand_id, name, description, promotion_type, status,
                          start_date, end_date, discount_percentage, discount_amount,
                          buy_quantity, get_quantity, points_multiplier, min_purchase_amount,
                          created_by, approved_by, approved_at, internal_notes)
  VALUES
    ('a1000001-0000-0000-0000-000000000001', v_tenant_id, v_brand_coca,
     'Verano Refrescante', 'Descuento 20% en refrescos de 2L y 3L',
     'discount_percentage', 'active',
     '2026-01-15', '2026-03-15', 20.00, null,
     null, null, 1.00, 100.00,
     v_profile_brand, v_profile_admin, '2026-01-14'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000001-0000-0000-0000-000000000002', v_tenant_id, v_brand_coca,
     '3x2 Sprite', 'Lleva 3 Sprite 600ml, paga 2',
     'buy_x_get_y', 'active',
     '2026-02-01', '2026-02-28', null, null,
     3, 1, 1.00, 0.00,
     v_profile_brand, v_profile_admin, '2026-01-30'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000001-0000-0000-0000-000000000003', v_tenant_id, v_brand_coca,
     'Puntos Dobles Coca-Cola', 'Duplica tus puntos en toda la línea Coca-Cola',
     'points_multiplier', 'active',
     '2026-02-01', '2026-02-28', null, null,
     null, null, 2.00, 0.00,
     v_profile_brand, v_profile_admin, '2026-01-30'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000001-0000-0000-0000-000000000004', v_tenant_id, v_brand_coca,
     'Promo Navideña Coca-Cola', 'Descuento de temporada navideña',
     'discount_percentage', 'completed',
     '2025-12-01', '2025-12-31', 15.00, null,
     null, null, 1.00, 50.00,
     v_profile_brand, v_profile_admin, '2025-11-28'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000001-0000-0000-0000-000000000005', v_tenant_id, v_brand_coca,
     'Descuento Powerade Gym', 'Para gimnasios y tiendas deportivas',
     'discount_amount', 'completed',
     '2025-12-15', '2026-01-15', null, 25.00,
     null, null, 1.00, 200.00,
     v_profile_brand, v_profile_admin, '2025-12-14'::timestamptz,
     '[DEMO-SEED]')
  ON CONFLICT (id) DO NOTHING;

  -- Lala promotions
  INSERT INTO promotions (id, tenant_id, brand_id, name, description, promotion_type, status,
                          start_date, end_date, discount_percentage, discount_amount,
                          buy_quantity, get_quantity, points_multiplier, min_purchase_amount,
                          created_by, approved_by, approved_at, internal_notes)
  VALUES
    ('a1000002-0000-0000-0000-000000000001', v_tenant_id, v_brand_lala,
     'Promo Yoghurt', 'Descuento 15% en toda la línea de yoghurt',
     'discount_percentage', 'active',
     '2026-02-01', '2026-03-01', 15.00, null,
     null, null, 1.00, 80.00,
     v_profile_brand, v_profile_admin, '2026-01-30'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000002-0000-0000-0000-000000000002', v_tenant_id, v_brand_lala,
     'Combo Lácteos', 'Compra leche + queso con descuento',
     'volume_discount', 'active',
     '2026-01-15', '2026-02-28', 12.00, null,
     null, null, 1.00, 150.00,
     v_profile_brand, v_profile_admin, '2026-01-14'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000002-0000-0000-0000-000000000003', v_tenant_id, v_brand_lala,
     'Leche Gratis', 'Compra 5 leches, lleva 1 gratis',
     'buy_x_get_y', 'completed',
     '2025-12-01', '2025-12-31', null, null,
     5, 1, 1.00, 0.00,
     v_profile_brand, v_profile_admin, '2025-11-28'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000002-0000-0000-0000-000000000004', v_tenant_id, v_brand_lala,
     'Puntos Triple Quesos', 'Triple de puntos en línea de quesos',
     'points_multiplier', 'completed',
     '2026-01-01', '2026-01-31', null, null,
     null, null, 3.00, 0.00,
     v_profile_brand, v_profile_admin, '2025-12-30'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000002-0000-0000-0000-000000000005', v_tenant_id, v_brand_lala,
     'Crema de Marzo', 'Descuento 10% en cremas para cocinar',
     'discount_percentage', 'draft',
     '2026-03-01', '2026-03-31', 10.00, null,
     null, null, 1.00, 50.00,
     v_profile_brand, null, null,
     '[DEMO-SEED]')
  ON CONFLICT (id) DO NOTHING;

  -- Iberia promotions
  INSERT INTO promotions (id, tenant_id, brand_id, name, description, promotion_type, status,
                          start_date, end_date, discount_percentage, discount_amount,
                          buy_quantity, get_quantity, points_multiplier, min_purchase_amount,
                          created_by, approved_by, approved_at, internal_notes)
  VALUES
    ('a1000003-0000-0000-0000-000000000001', v_tenant_id, v_brand_iberia,
     'Descuento Margarina', 'Descuento 10% en margarina Original',
     'discount_percentage', 'active',
     '2026-02-01', '2026-03-15', 10.00, null,
     null, null, 1.00, 60.00,
     v_profile_brand, v_profile_admin, '2026-01-30'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000003-0000-0000-0000-000000000002', v_tenant_id, v_brand_iberia,
     'Puntos Triple Mantequilla', 'Triple de puntos en mantequilla',
     'points_multiplier', 'active',
     '2026-02-01', '2026-02-28', null, null,
     null, null, 3.00, 0.00,
     v_profile_brand, v_profile_admin, '2026-01-30'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000003-0000-0000-0000-000000000003', v_tenant_id, v_brand_iberia,
     'Aceite al Costo', 'Descuento fijo $5 en aceites de 1L',
     'discount_amount', 'completed',
     '2025-12-01', '2026-01-15', null, 5.00,
     null, null, 1.00, 0.00,
     v_profile_brand, v_profile_admin, '2025-11-28'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000003-0000-0000-0000-000000000004', v_tenant_id, v_brand_iberia,
     'Combo Cocina', 'Compra margarina + aceite con regalo',
     'free_product', 'completed',
     '2026-01-01', '2026-01-31', null, null,
     null, null, 1.00, 100.00,
     v_profile_brand, v_profile_admin, '2025-12-30'::timestamptz,
     '[DEMO-SEED]'),
    ('a1000003-0000-0000-0000-000000000005', v_tenant_id, v_brand_iberia,
     'Promo Primavera Aceites', 'Descuento 15% en aceite de canola',
     'discount_percentage', 'draft',
     '2026-03-15', '2026-04-15', 15.00, null,
     null, null, 1.00, 80.00,
     v_profile_brand, null, null,
     '[DEMO-SEED]')
  ON CONFLICT (id) DO NOTHING;

  -- ===== PROMOTION RULES (1 per active promo) =====
  INSERT INTO promotion_rules (
    id, tenant_id, promotion_id, rule_type, rule_name, is_inclusion, apply_to_all,
    created_by, is_active
  )
  VALUES
    ('a2000001-0000-0000-0000-000000000001', v_tenant_id, 'a1000001-0000-0000-0000-000000000001',
     'zone', 'Todas las zonas', true, true, v_profile_brand, true),
    ('a2000001-0000-0000-0000-000000000002', v_tenant_id, 'a1000002-0000-0000-0000-000000000001',
     'zone', 'Todas las zonas', true, true, v_profile_brand, true),
    ('a2000001-0000-0000-0000-000000000003', v_tenant_id, 'a1000003-0000-0000-0000-000000000001',
     'zone', 'Todas las zonas', true, true, v_profile_brand, true)
  ON CONFLICT (id) DO NOTHING;

  -- ===== SURVEYS =====
  -- Survey 1: Satisfacción del Cliente (Coca-Cola, closed)
  INSERT INTO surveys (id, tenant_id, brand_id, title, description, survey_status,
                       target_roles, start_date, end_date, created_by, approved_by, approved_at)
  VALUES
    ('a3000001-0000-0000-0000-000000000001', v_tenant_id, v_brand_coca,
     'Satisfacción del Cliente Q4 2025', 'Encuesta de satisfacción para clientes Coca-Cola',
     'closed', '{client}', '2025-12-01', '2025-12-31',
     v_profile_brand, v_profile_admin, '2025-11-28'::timestamptz),
    ('a3000001-0000-0000-0000-000000000002', v_tenant_id, v_brand_coca,
     'Evaluación de Productos Feb 2026', 'Evaluación de productos por promotores',
     'active', '{promotor}', '2026-02-01', '2026-02-28',
     v_profile_brand, v_profile_admin, '2026-01-30'::timestamptz),
    ('a3000001-0000-0000-0000-000000000003', v_tenant_id, v_brand_lala,
     'Satisfacción Lala Ene 2026', 'Encuesta de satisfacción para clientes Lala',
     'closed', '{client}', '2026-01-01', '2026-01-31',
     v_profile_brand, v_profile_admin, '2025-12-28'::timestamptz),
    ('a3000001-0000-0000-0000-000000000004', v_tenant_id, v_brand_lala,
     'Capacitación de Campo', 'Evaluación de conocimiento de producto',
     'active', '{promotor,asesor_de_ventas}', '2026-02-01', '2026-02-28',
     v_profile_brand, v_profile_admin, '2026-01-30'::timestamptz),
    ('a3000001-0000-0000-0000-000000000005', v_tenant_id, v_brand_iberia,
     'Encuesta de Exhibición', 'Retroalimentación sobre materiales POP',
     'active', '{asesor_de_ventas}', '2026-02-01', '2026-03-15',
     v_profile_brand, v_profile_admin, '2026-01-28'::timestamptz),
    ('a3000001-0000-0000-0000-000000000006', v_tenant_id, v_brand_iberia,
     'Preferencia de Aceites', 'Preferencia de clientes en aceites',
     'closed', '{client}', '2025-12-15', '2026-01-15',
     v_profile_brand, v_profile_admin, '2025-12-14'::timestamptz),
    ('a3000001-0000-0000-0000-000000000007', v_tenant_id, v_brand_coca,
     'Satisfacción del Cliente Feb 2026', 'Encuesta de satisfacción para clientes Coca-Cola',
     'active', '{client}', '2026-02-01', '2026-02-28',
     v_profile_brand, v_profile_admin, '2026-01-28'::timestamptz)
  ON CONFLICT (id) DO NOTHING;

  -- ===== SURVEY QUESTIONS =====
  -- Survey 1 questions (3 questions)
  INSERT INTO survey_questions (id, survey_id, tenant_id, question_text, question_type, sort_order, options)
  VALUES
    ('a4000001-0000-0000-0000-000000000001', 'a3000001-0000-0000-0000-000000000001', v_tenant_id,
     '¿Qué tan satisfecho está con el servicio de entrega?', 'scale', 1, '{"min": 1, "max": 5, "labels": {"1": "Muy insatisfecho", "5": "Muy satisfecho"}}'::jsonb),
    ('a4000001-0000-0000-0000-000000000002', 'a3000001-0000-0000-0000-000000000001', v_tenant_id,
     '¿Qué producto compra con más frecuencia?', 'multiple_choice', 2, '{"choices": ["Coca-Cola 600ml", "Coca-Cola 2L", "Sprite", "Fanta", "Otro"]}'::jsonb),
    ('a4000001-0000-0000-0000-000000000003', 'a3000001-0000-0000-0000-000000000001', v_tenant_id,
     '¿Tiene algún comentario adicional?', 'text', 3, null),
    -- Survey 2 questions
    ('a4000001-0000-0000-0000-000000000004', 'a3000001-0000-0000-0000-000000000002', v_tenant_id,
     '¿Los productos estaban correctamente exhibidos?', 'yes_no', 1, null),
    ('a4000001-0000-0000-0000-000000000005', 'a3000001-0000-0000-0000-000000000002', v_tenant_id,
     '¿Cuántos productos nuevos identificó?', 'number', 2, null),
    ('a4000001-0000-0000-0000-000000000006', 'a3000001-0000-0000-0000-000000000002', v_tenant_id,
     'Evalúe la frescura del inventario', 'scale', 3, '{"min": 1, "max": 5}'::jsonb),
    -- Survey 3 questions
    ('a4000001-0000-0000-0000-000000000007', 'a3000001-0000-0000-0000-000000000003', v_tenant_id,
     '¿Recomendaría productos Lala a otros negocios?', 'yes_no', 1, null),
    ('a4000001-0000-0000-0000-000000000008', 'a3000001-0000-0000-0000-000000000003', v_tenant_id,
     '¿Cómo califica la calidad general?', 'scale', 2, '{"min": 1, "max": 5}'::jsonb),
    -- Survey 4 questions
    ('a4000001-0000-0000-0000-000000000009', 'a3000001-0000-0000-0000-000000000004', v_tenant_id,
     '¿Conoce los beneficios de la leche deslactosada Lala?', 'yes_no', 1, null),
    ('a4000001-0000-0000-0000-000000000010', 'a3000001-0000-0000-0000-000000000004', v_tenant_id,
     '¿Cuántas SKUs de Lala puede nombrar?', 'number', 2, null),
    ('a4000001-0000-0000-0000-000000000011', 'a3000001-0000-0000-0000-000000000004', v_tenant_id,
     'Describa su pitch de venta para quesos Lala', 'text', 3, null),
    -- Survey 5 questions
    ('a4000001-0000-0000-0000-000000000012', 'a3000001-0000-0000-0000-000000000005', v_tenant_id,
     '¿El material POP estaba visible?', 'yes_no', 1, null),
    ('a4000001-0000-0000-0000-000000000013', 'a3000001-0000-0000-0000-000000000005', v_tenant_id,
     'Califique la condición del exhibidor', 'scale', 2, '{"min": 1, "max": 5}'::jsonb),
    ('a4000001-0000-0000-0000-000000000014', 'a3000001-0000-0000-0000-000000000005', v_tenant_id,
     'Sugerencias para mejorar la exhibición', 'text', 3, null),
    -- Survey 6 questions
    ('a4000001-0000-0000-0000-000000000015', 'a3000001-0000-0000-0000-000000000006', v_tenant_id,
     '¿Cuál es su marca preferida de aceite?', 'multiple_choice', 1, '{"choices": ["Iberia", "1-2-3", "Capullo", "La Gloria", "Otro"]}'::jsonb),
    ('a4000001-0000-0000-0000-000000000016', 'a3000001-0000-0000-0000-000000000006', v_tenant_id,
     '¿Cuántas botellas de aceite vende a la semana?', 'number', 2, null),
    -- Survey 7 questions (active, client target)
    ('a4000001-0000-0000-0000-000000000017', 'a3000001-0000-0000-0000-000000000007', v_tenant_id,
     '¿Qué tan satisfecho está con el servicio de entrega este mes?', 'scale', 1, '{"min": 1, "max": 5, "labels": {"1": "Muy insatisfecho", "5": "Muy satisfecho"}}'::jsonb),
    ('a4000001-0000-0000-0000-000000000018', 'a3000001-0000-0000-0000-000000000007', v_tenant_id,
     '¿Qué producto le gustaría que incluyéramos en el catálogo?', 'text', 2, null),
    ('a4000001-0000-0000-0000-000000000019', 'a3000001-0000-0000-0000-000000000007', v_tenant_id,
     '¿Con qué frecuencia realiza pedidos?', 'multiple_choice', 3, '{"choices": ["Diario", "Semanal", "Quincenal", "Mensual"]}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- ===== SURVEY RESPONSES (for closed surveys) =====
  -- Responses for Survey 1 (closed, client target)
  INSERT INTO survey_responses (id, survey_id, tenant_id, respondent_id, respondent_role)
  VALUES
    ('a5000001-0000-0000-0000-000000000001', 'a3000001-0000-0000-0000-000000000001',
     v_tenant_id, v_profile_promotor, 'promotor'),
    ('a5000001-0000-0000-0000-000000000002', 'a3000001-0000-0000-0000-000000000001',
     v_tenant_id, v_profile_asesor, 'asesor_de_ventas')
  ON CONFLICT (survey_id, respondent_id) DO NOTHING;

  -- Responses for Survey 3 (closed, client target)
  INSERT INTO survey_responses (id, survey_id, tenant_id, respondent_id, respondent_role)
  VALUES
    ('a5000001-0000-0000-0000-000000000003', 'a3000001-0000-0000-0000-000000000003',
     v_tenant_id, v_profile_promotor, 'promotor')
  ON CONFLICT (survey_id, respondent_id) DO NOTHING;

  -- Responses for Survey 6 (closed)
  INSERT INTO survey_responses (id, survey_id, tenant_id, respondent_id, respondent_role)
  VALUES
    ('a5000001-0000-0000-0000-000000000004', 'a3000001-0000-0000-0000-000000000006',
     v_tenant_id, v_profile_asesor, 'asesor_de_ventas')
  ON CONFLICT (survey_id, respondent_id) DO NOTHING;

  -- ===== SURVEY ANSWERS =====
  INSERT INTO survey_answers (response_id, question_id, tenant_id, answer_scale)
  VALUES ('a5000001-0000-0000-0000-000000000001', 'a4000001-0000-0000-0000-000000000001', v_tenant_id, 4)
  ON CONFLICT (response_id, question_id) DO NOTHING;
  INSERT INTO survey_answers (response_id, question_id, tenant_id, answer_choice)
  VALUES ('a5000001-0000-0000-0000-000000000001', 'a4000001-0000-0000-0000-000000000002', v_tenant_id, 'Coca-Cola 600ml')
  ON CONFLICT (response_id, question_id) DO NOTHING;
  INSERT INTO survey_answers (response_id, question_id, tenant_id, answer_text)
  VALUES ('a5000001-0000-0000-0000-000000000001', 'a4000001-0000-0000-0000-000000000003', v_tenant_id, 'Excelente servicio')
  ON CONFLICT (response_id, question_id) DO NOTHING;

  INSERT INTO survey_answers (response_id, question_id, tenant_id, answer_scale)
  VALUES ('a5000001-0000-0000-0000-000000000002', 'a4000001-0000-0000-0000-000000000001', v_tenant_id, 5)
  ON CONFLICT (response_id, question_id) DO NOTHING;
  INSERT INTO survey_answers (response_id, question_id, tenant_id, answer_choice)
  VALUES ('a5000001-0000-0000-0000-000000000002', 'a4000001-0000-0000-0000-000000000002', v_tenant_id, 'Coca-Cola 2L')
  ON CONFLICT (response_id, question_id) DO NOTHING;

  -- Survey 3 answers
  INSERT INTO survey_answers (response_id, question_id, tenant_id, answer_boolean)
  VALUES ('a5000001-0000-0000-0000-000000000003', 'a4000001-0000-0000-0000-000000000007', v_tenant_id, true)
  ON CONFLICT (response_id, question_id) DO NOTHING;
  INSERT INTO survey_answers (response_id, question_id, tenant_id, answer_scale)
  VALUES ('a5000001-0000-0000-0000-000000000003', 'a4000001-0000-0000-0000-000000000008', v_tenant_id, 4)
  ON CONFLICT (response_id, question_id) DO NOTHING;

  -- Survey 6 answers
  INSERT INTO survey_answers (response_id, question_id, tenant_id, answer_choice)
  VALUES ('a5000001-0000-0000-0000-000000000004', 'a4000001-0000-0000-0000-000000000015', v_tenant_id, 'Iberia')
  ON CONFLICT (response_id, question_id) DO NOTHING;
  INSERT INTO survey_answers (response_id, question_id, tenant_id, answer_number)
  VALUES ('a5000001-0000-0000-0000-000000000004', 'a4000001-0000-0000-0000-000000000016', v_tenant_id, 12)
  ON CONFLICT (response_id, question_id) DO NOTHING;

  RAISE NOTICE 'Layer 6: Promotions & surveys ✓';
END $$;

-- =============================================================================
-- LAYER 7: Notifications & KPI Targets
-- =============================================================================

DO $$
DECLARE
  v_tenant_id UUID := 'fe0f429d-2d83-4738-af65-32c655cef656';
  v_brand_coca UUID;
  v_brand_lala UUID;
  v_brand_iberia UUID;
  v_profile_admin UUID;
  v_profile_brand UUID;
  v_profile_supervisor UUID;
  v_profile_promotor UUID;
  v_profile_asesor UUID;
BEGIN
  SELECT id INTO v_brand_coca FROM brands WHERE tenant_id = v_tenant_id AND slug = 'coca-cola';
  SELECT id INTO v_brand_lala FROM brands WHERE tenant_id = v_tenant_id AND slug = 'lala';
  SELECT id INTO v_brand_iberia FROM brands WHERE tenant_id = v_tenant_id AND slug = 'iberia';
  SELECT id INTO v_profile_admin FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000001';
  SELECT id INTO v_profile_brand FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000002';
  SELECT id INTO v_profile_supervisor FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000003';
  SELECT id INTO v_profile_promotor FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000004';
  SELECT id INTO v_profile_asesor FROM user_profiles WHERE user_id = 'dd000001-0000-0000-0000-000000000005';

  -- ===== NOTIFICATIONS =====
  INSERT INTO notifications (id, tenant_id, user_profile_id, title, message, notification_type, is_read)
  VALUES
    -- Admin notifications
    ('b1000001-0000-0000-0000-000000000001', v_tenant_id, v_profile_admin,
     'Promoción aprobada', 'Se aprobó "Verano Refrescante" para Coca-Cola', 'promotion_approved', true),
    ('b1000001-0000-0000-0000-000000000002', v_tenant_id, v_profile_admin,
     'Nueva encuesta pendiente', 'Encuesta "Capacitación de Campo" requiere aprobación', 'new_survey_pending', false),
    ('b1000001-0000-0000-0000-000000000003', v_tenant_id, v_profile_admin,
     'Orden creada', 'Se creó una nueva orden VOR-0001', 'order_created', true),
    -- Brand Manager notifications
    ('b1000001-0000-0000-0000-000000000004', v_tenant_id, v_profile_brand,
     'Visita completada', 'Pedro completó la visita VIS-0001', 'visit_completed', true),
    ('b1000001-0000-0000-0000-000000000005', v_tenant_id, v_profile_brand,
     'Encuesta aprobada', 'Tu encuesta "Evaluación de Productos" fue aprobada', 'survey_approved', true),
    ('b1000001-0000-0000-0000-000000000006', v_tenant_id, v_profile_brand,
     'Orden creada', 'Nueva orden VOR-0005 por $1,200.00 MXN', 'order_created', false),
    -- Supervisor notifications
    ('b1000001-0000-0000-0000-000000000007', v_tenant_id, v_profile_supervisor,
     'Visita completada', 'El promotor completó visita en zona CDMX', 'visit_completed', true),
    ('b1000001-0000-0000-0000-000000000008', v_tenant_id, v_profile_supervisor,
     'Orden creada', 'Nuevo pedido VOR-0010 en Monterrey', 'order_created', false),
    -- Promotor notifications
    ('b1000001-0000-0000-0000-000000000009', v_tenant_id, v_profile_promotor,
     'Nueva promoción', 'Promoción "3x2 Sprite" disponible para tus clientes', 'new_promotion', false),
    ('b1000001-0000-0000-0000-000000000010', v_tenant_id, v_profile_promotor,
     'Visita completada', 'Tu visita VIS-0015 fue registrada exitosamente', 'visit_completed', true),
    ('b1000001-0000-0000-0000-000000000011', v_tenant_id, v_profile_promotor,
     'Encuesta asignada', 'Tienes una nueva encuesta pendiente', 'survey_assigned', false),
    -- Asesor notifications
    ('b1000001-0000-0000-0000-000000000012', v_tenant_id, v_profile_asesor,
     'Orden creada', 'Tu pedido VOR-0020 fue registrado', 'order_created', true),
    ('b1000001-0000-0000-0000-000000000013', v_tenant_id, v_profile_asesor,
     'Nueva promoción', 'Descuento Margarina Iberia disponible', 'new_promotion', false),
    ('b1000001-0000-0000-0000-000000000014', v_tenant_id, v_profile_asesor,
     'Encuesta asignada', 'Encuesta de Exhibición pendiente de contestar', 'survey_assigned', false)
    -- Note: No client notifications — client users have no user_profile (they use clients.user_id)
  ON CONFLICT (id) DO NOTHING;

  -- ===== KPI DEFINITIONS =====
  -- The migration seeds these via CROSS JOIN with tenants, but at migration time the demo
  -- tenant may not exist yet (seed runs after). Ensure they exist for the demo tenant.
  INSERT INTO kpi_definitions (tenant_id, slug, label, description, icon, color, computation_type, is_active, display_order)
  VALUES
    (v_tenant_id, 'volume',         'Avances de Volumen',  'Suma del monto total de ordenes en el periodo',                      'TrendingUp',   'blue',   'volume',         true, 0),
    (v_tenant_id, 'reach_mix',      'Reach y Mix',         'Porcentaje de clientes visitados y diversidad de productos',         'Target',        'green',  'reach_mix',      true, 1),
    (v_tenant_id, 'assortment',     'Assortment',          'Porcentaje promedio de productos presentes por visita',              'Package',       'purple', 'assortment',     true, 2),
    (v_tenant_id, 'market_share',   'Market Share',        'Participacion de productos propios vs competencia',                  'PieChart',      'orange', 'market_share',   true, 3),
    (v_tenant_id, 'share_of_shelf', 'Share of Shelf',      'Presencia de materiales POP y ejecucion de exhibiciones',           'LayoutGrid',    'red',    'share_of_shelf', true, 4)
  ON CONFLICT (tenant_id, slug) DO NOTHING;

  -- Set default dashboard_metrics on brands so KPIs show immediately
  UPDATE brands
  SET dashboard_metrics = '["volume","reach_mix","assortment","market_share","share_of_shelf"]'::jsonb
  WHERE tenant_id = v_tenant_id
    AND dashboard_metrics IS NULL;

  -- ===== KPI TARGETS (Feb 2026) =====
  -- 5 KPIs × 3 brands = 15 targets
  INSERT INTO kpi_targets (tenant_id, brand_id, kpi_slug, period_type, period_start, period_end,
                           target_value, target_unit, notes)
  VALUES
    -- Coca-Cola
    (v_tenant_id, v_brand_coca, 'volume', 'monthly', '2026-02-01', '2026-02-28',
     150000.00, 'MXN', '[DEMO-SEED] Meta volumen Coca-Cola Feb'),
    (v_tenant_id, v_brand_coca, 'reach_mix', 'monthly', '2026-02-01', '2026-02-28',
     75.00, '%', '[DEMO-SEED] Meta reach Coca-Cola Feb'),
    (v_tenant_id, v_brand_coca, 'assortment', 'monthly', '2026-02-01', '2026-02-28',
     85.00, '%', '[DEMO-SEED] Meta assortment Coca-Cola Feb'),
    (v_tenant_id, v_brand_coca, 'market_share', 'monthly', '2026-02-01', '2026-02-28',
     65.00, '%', '[DEMO-SEED] Meta market share Coca-Cola Feb'),
    (v_tenant_id, v_brand_coca, 'share_of_shelf', 'monthly', '2026-02-01', '2026-02-28',
     70.00, '%', '[DEMO-SEED] Meta share of shelf Coca-Cola Feb'),
    -- Lala
    (v_tenant_id, v_brand_lala, 'volume', 'monthly', '2026-02-01', '2026-02-28',
     95000.00, 'MXN', '[DEMO-SEED] Meta volumen Lala Feb'),
    (v_tenant_id, v_brand_lala, 'reach_mix', 'monthly', '2026-02-01', '2026-02-28',
     60.00, '%', '[DEMO-SEED] Meta reach Lala Feb'),
    (v_tenant_id, v_brand_lala, 'assortment', 'monthly', '2026-02-01', '2026-02-28',
     80.00, '%', '[DEMO-SEED] Meta assortment Lala Feb'),
    (v_tenant_id, v_brand_lala, 'market_share', 'monthly', '2026-02-01', '2026-02-28',
     55.00, '%', '[DEMO-SEED] Meta market share Lala Feb'),
    (v_tenant_id, v_brand_lala, 'share_of_shelf', 'monthly', '2026-02-01', '2026-02-28',
     60.00, '%', '[DEMO-SEED] Meta share of shelf Lala Feb'),
    -- Iberia
    (v_tenant_id, v_brand_iberia, 'volume', 'monthly', '2026-02-01', '2026-02-28',
     65000.00, 'MXN', '[DEMO-SEED] Meta volumen Iberia Feb'),
    (v_tenant_id, v_brand_iberia, 'reach_mix', 'monthly', '2026-02-01', '2026-02-28',
     50.00, '%', '[DEMO-SEED] Meta reach Iberia Feb'),
    (v_tenant_id, v_brand_iberia, 'assortment', 'monthly', '2026-02-01', '2026-02-28',
     75.00, '%', '[DEMO-SEED] Meta assortment Iberia Feb'),
    (v_tenant_id, v_brand_iberia, 'market_share', 'monthly', '2026-02-01', '2026-02-28',
     45.00, '%', '[DEMO-SEED] Meta market share Iberia Feb'),
    (v_tenant_id, v_brand_iberia, 'share_of_shelf', 'monthly', '2026-02-01', '2026-02-28',
     50.00, '%', '[DEMO-SEED] Meta share of shelf Iberia Feb')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Layer 7: Notifications & KPI targets ✓';
END $$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
  v_tenant_id UUID := 'fe0f429d-2d83-4738-af65-32c655cef656';
  v_count BIGINT;
BEGIN
  RAISE NOTICE '==== SEED VERIFICATION ====';

  SELECT count(*) INTO v_count FROM auth.users WHERE email LIKE '%@demo.companerosenruta.com';
  RAISE NOTICE 'Auth users (demo): % (expected: 6)', v_count;

  SELECT count(*) INTO v_count FROM user_profiles WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'User profiles: % (expected: ~6+)', v_count;

  SELECT count(*) INTO v_count FROM user_roles WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'User roles: % (expected: ~6+)', v_count;

  SELECT count(*) INTO v_count FROM zones WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Zones: % (expected: ~3)', v_count;

  SELECT count(*) INTO v_count FROM clients WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Clients: % (expected: ~50)', v_count;

  SELECT count(*) INTO v_count FROM products WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Products: % (expected: ~45)', v_count;

  SELECT count(*) INTO v_count FROM client_brand_memberships WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Memberships: % (expected: ~102)', v_count;

  SELECT count(*) INTO v_count FROM visits WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Visits: % (expected: ~100)', v_count;

  SELECT count(*) INTO v_count FROM visit_stage_assessments WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Stage assessments: % (expected: ~70)', v_count;

  SELECT count(*) INTO v_count FROM visit_brand_product_assessments WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Product assessments: % (expected: ~280)', v_count;

  SELECT count(*) INTO v_count FROM visit_orders WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Visit orders: % (expected: ~40)', v_count;

  SELECT count(*) INTO v_count FROM promotions WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Promotions: % (expected: ~15)', v_count;

  SELECT count(*) INTO v_count FROM surveys WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Surveys: % (expected: ~6)', v_count;

  SELECT count(*) INTO v_count FROM notifications WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Notifications: % (expected: ~17)', v_count;

  SELECT count(*) INTO v_count FROM kpi_definitions WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'KPI definitions: % (expected: 5)', v_count;

  SELECT count(*) INTO v_count FROM kpi_targets WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'KPI targets: % (expected: ~15)', v_count;

  RAISE NOTICE '==== SEED COMPLETE ====';
END $$;

COMMIT;
