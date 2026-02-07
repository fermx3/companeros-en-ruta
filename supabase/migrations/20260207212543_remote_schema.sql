


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."advisor_experience_level_enum" AS ENUM (
    'trainee',
    'junior',
    'senior',
    'expert',
    'team_lead'
);


ALTER TYPE "public"."advisor_experience_level_enum" OWNER TO "postgres";


CREATE TYPE "public"."advisor_specialization_enum" AS ENUM (
    'retail',
    'wholesale',
    'pharma',
    'food_service',
    'convenience',
    'supermarket',
    'general'
);


ALTER TYPE "public"."advisor_specialization_enum" OWNER TO "postgres";


CREATE TYPE "public"."assessment_type_enum" AS ENUM (
    'product',
    'package',
    'price',
    'display',
    'competition'
);


ALTER TYPE "public"."assessment_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."brand_status_enum" AS ENUM (
    'active',
    'inactive',
    'draft'
);


ALTER TYPE "public"."brand_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."campaign_status_enum" AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'active',
    'paused',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."campaign_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."campaign_type_enum" AS ENUM (
    'product_launch',
    'seasonal',
    'promotional',
    'awareness',
    'loyalty',
    'competitive',
    'retention'
);


ALTER TYPE "public"."campaign_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."client_approval_enum" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'not_required'
);


ALTER TYPE "public"."client_approval_enum" OWNER TO "postgres";


CREATE TYPE "public"."client_status_enum" AS ENUM (
    'active',
    'inactive',
    'suspended',
    'prospect'
);


ALTER TYPE "public"."client_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."client_type_category_enum" AS ENUM (
    'retail',
    'wholesale',
    'institutional',
    'online',
    'hybrid'
);


ALTER TYPE "public"."client_type_category_enum" OWNER TO "postgres";


CREATE TYPE "public"."commercial_structure_type_enum" AS ENUM (
    'direct',
    'distributor',
    'wholesaler',
    'retailer',
    'hybrid'
);


ALTER TYPE "public"."commercial_structure_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."communication_current_status_enum" AS ENUM (
    'not_present',
    'present_good',
    'present_damaged',
    'present_outdated',
    'installed_today'
);


ALTER TYPE "public"."communication_current_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."communication_material_type_enum" AS ENUM (
    'poster',
    'banner',
    'wobbler',
    'display',
    'refrigerator',
    'cooler',
    'shelf_talker',
    'floor_graphic',
    'window_cling',
    'promotional_stand'
);


ALTER TYPE "public"."communication_material_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."communication_planned_action_enum" AS ENUM (
    'install_new',
    'replace_existing',
    'repair',
    'remove',
    'relocate',
    'no_action'
);


ALTER TYPE "public"."communication_planned_action_enum" OWNER TO "postgres";


CREATE TYPE "public"."count_accuracy_enum" AS ENUM (
    'exact',
    'estimated',
    'partial'
);


ALTER TYPE "public"."count_accuracy_enum" OWNER TO "postgres";


CREATE TYPE "public"."display_quality_enum" AS ENUM (
    'excellent',
    'good',
    'fair',
    'poor',
    'none'
);


ALTER TYPE "public"."display_quality_enum" OWNER TO "postgres";


CREATE TYPE "public"."location_in_store_enum" AS ENUM (
    'shelf',
    'storage',
    'display',
    'refrigerator',
    'freezer',
    'counter'
);


ALTER TYPE "public"."location_in_store_enum" OWNER TO "postgres";


CREATE TYPE "public"."membership_status_enum" AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending',
    'rejected'
);


ALTER TYPE "public"."membership_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."order_item_status_enum" AS ENUM (
    'pending',
    'confirmed',
    'out_of_stock',
    'substituted',
    'delivered',
    'returned'
);


ALTER TYPE "public"."order_item_status_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."order_item_status_enum" IS 'Estados del ciclo de vida de un item de pedido';



CREATE TYPE "public"."order_item_unit_type_enum" AS ENUM (
    'pieza',
    'kg',
    'litro',
    'caja',
    'paquete'
);


ALTER TYPE "public"."order_item_unit_type_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."order_item_unit_type_enum" IS 'Tipos de unidad de medida para items de pedido';



CREATE TYPE "public"."order_payment_method_enum" AS ENUM (
    'cash',
    'transfer',
    'credit',
    'check',
    'card',
    'points'
);


ALTER TYPE "public"."order_payment_method_enum" OWNER TO "postgres";


CREATE TYPE "public"."order_payment_status_enum" AS ENUM (
    'pending',
    'paid',
    'partial',
    'failed',
    'refunded'
);


ALTER TYPE "public"."order_payment_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."order_priority_enum" AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


ALTER TYPE "public"."order_priority_enum" OWNER TO "postgres";


CREATE TYPE "public"."order_source_channel_enum" AS ENUM (
    'client_portal',
    'mobile_app',
    'whatsapp',
    'phone',
    'email'
);


ALTER TYPE "public"."order_source_channel_enum" OWNER TO "postgres";


CREATE TYPE "public"."order_status_enum" AS ENUM (
    'draft',
    'submitted',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
    'returned'
);


ALTER TYPE "public"."order_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."order_type_enum" AS ENUM (
    'standard',
    'express',
    'scheduled',
    'recurring',
    'sample'
);


ALTER TYPE "public"."order_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."package_condition_enum" AS ENUM (
    'excellent',
    'good',
    'fair',
    'poor',
    'damaged'
);


ALTER TYPE "public"."package_condition_enum" OWNER TO "postgres";


CREATE TYPE "public"."points_source_type_enum" AS ENUM (
    'purchase',
    'visit',
    'campaign',
    'referral',
    'bonus',
    'manual',
    'expiration',
    'redemption'
);


ALTER TYPE "public"."points_source_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."points_transaction_type_enum" AS ENUM (
    'earned',
    'redeemed',
    'expired',
    'adjusted',
    'bonus',
    'penalty',
    'transferred'
);


ALTER TYPE "public"."points_transaction_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."product_unit_type_enum" AS ENUM (
    'pieza',
    'kg',
    'litro',
    'caja',
    'paquete'
);


ALTER TYPE "public"."product_unit_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."product_variant_size_unit_enum" AS ENUM (
    'ml',
    'g',
    'kg',
    'l',
    'unidades'
);


ALTER TYPE "public"."product_variant_size_unit_enum" OWNER TO "postgres";


CREATE TYPE "public"."promotion_order_type_enum" AS ENUM (
    'independent_order',
    'visit_order'
);


ALTER TYPE "public"."promotion_order_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."promotion_redemption_status_enum" AS ENUM (
    'applied',
    'pending_validation',
    'validated',
    'rejected',
    'reversed'
);


ALTER TYPE "public"."promotion_redemption_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."promotion_rule_type_enum" AS ENUM (
    'zone',
    'state',
    'market_type',
    'commercial_structure',
    'client_type',
    'specific_client',
    'product',
    'category',
    'tier',
    'custom'
);


ALTER TYPE "public"."promotion_rule_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."promotion_status_enum" AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'active',
    'paused',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."promotion_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."promotion_type_applied_enum" AS ENUM (
    'discount_percentage',
    'discount_amount',
    'buy_x_get_y',
    'free_product',
    'volume_discount',
    'points_multiplier',
    'tier_bonus'
);


ALTER TYPE "public"."promotion_type_applied_enum" OWNER TO "postgres";


CREATE TYPE "public"."promotion_type_enum" AS ENUM (
    'discount_percentage',
    'discount_amount',
    'buy_x_get_y',
    'free_product',
    'volume_discount',
    'tier_bonus',
    'cashback',
    'points_multiplier'
);


ALTER TYPE "public"."promotion_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."redemption_status_enum" AS ENUM (
    'pending',
    'confirmed',
    'applied',
    'expired',
    'cancelled'
);


ALTER TYPE "public"."redemption_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."restock_priority_enum" AS ENUM (
    'urgent',
    'high',
    'medium',
    'low'
);


ALTER TYPE "public"."restock_priority_enum" OWNER TO "postgres";


CREATE TYPE "public"."reward_type_enum" AS ENUM (
    'discount_percentage',
    'discount_amount',
    'free_product',
    'free_shipping',
    'exclusive_access',
    'service_upgrade',
    'cashback',
    'gift'
);


ALTER TYPE "public"."reward_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."rfc_person_type_enum" AS ENUM (
    'fisica',
    'moral'
);


ALTER TYPE "public"."rfc_person_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."rotation_quality_enum" AS ENUM (
    'excellent',
    'good',
    'fair',
    'poor'
);


ALTER TYPE "public"."rotation_quality_enum" OWNER TO "postgres";


CREATE TYPE "public"."shelf_position_enum" AS ENUM (
    'eye_level',
    'top_shelf',
    'middle_shelf',
    'bottom_shelf',
    'end_cap',
    'floor_display'
);


ALTER TYPE "public"."shelf_position_enum" OWNER TO "postgres";


CREATE TYPE "public"."status" AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending_approval'
);


ALTER TYPE "public"."status" OWNER TO "postgres";


CREATE TYPE "public"."stock_level_enum" AS ENUM (
    'out_of_stock',
    'low',
    'adequate',
    'high',
    'overstocked'
);


ALTER TYPE "public"."stock_level_enum" OWNER TO "postgres";


CREATE TYPE "public"."subscription_plan" AS ENUM (
    'base',
    'pro',
    'enterprise'
);


ALTER TYPE "public"."subscription_plan" OWNER TO "postgres";


CREATE TYPE "public"."tenant_status_enum" AS ENUM (
    'active',
    'suspended',
    'trial'
);


ALTER TYPE "public"."tenant_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."tenant_subscription_plan_enum" AS ENUM (
    'base',
    'pro',
    'enterprise'
);


ALTER TYPE "public"."tenant_subscription_plan_enum" OWNER TO "postgres";


CREATE TYPE "public"."tier_assigned_by" AS ENUM (
    'system',
    'manual',
    'external_sync'
);


ALTER TYPE "public"."tier_assigned_by" OWNER TO "postgres";


CREATE TYPE "public"."tier_assignment_type_enum" AS ENUM (
    'manual',
    'automatic',
    'initial',
    'promotion',
    'demotion',
    'correction'
);


ALTER TYPE "public"."tier_assignment_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."tier_recalculation_frequency" AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'manual'
);


ALTER TYPE "public"."tier_recalculation_frequency" OWNER TO "postgres";


CREATE TYPE "public"."tier_system_type" AS ENUM (
    'points_based',
    'purchase_based',
    'manual',
    'external_api'
);


ALTER TYPE "public"."tier_system_type" OWNER TO "postgres";


CREATE TYPE "public"."user_profile_status_enum" AS ENUM (
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE "public"."user_profile_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_scope_enum" AS ENUM (
    'global',
    'tenant',
    'brand'
);


ALTER TYPE "public"."user_role_scope_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_status_enum" AS ENUM (
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE "public"."user_role_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_type" AS ENUM (
    'admin',
    'brand_manager',
    'supervisor',
    'advisor',
    'market_analyst',
    'client'
);


ALTER TYPE "public"."user_role_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role_type_enum" AS ENUM (
    'admin',
    'brand_manager',
    'supervisor',
    'advisor',
    'market_analyst'
);


ALTER TYPE "public"."user_role_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."visit_order_item_delivery_preference_enum" AS ENUM (
    'immediate',
    'scheduled',
    'next_visit'
);


ALTER TYPE "public"."visit_order_item_delivery_preference_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."visit_order_item_delivery_preference_enum" IS 'Preferencia de entrega del item';



CREATE TYPE "public"."visit_order_item_priority_enum" AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


ALTER TYPE "public"."visit_order_item_priority_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."visit_order_item_priority_enum" IS 'Nivel de prioridad del item';



CREATE TYPE "public"."visit_order_item_source_enum" AS ENUM (
    'catalog',
    'special_order',
    'sample',
    'demo'
);


ALTER TYPE "public"."visit_order_item_source_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."visit_order_item_source_enum" IS 'Origen del item en pedido de visita';



CREATE TYPE "public"."visit_order_item_unit_type_enum" AS ENUM (
    'pieza',
    'kg',
    'litro',
    'caja',
    'paquete'
);


ALTER TYPE "public"."visit_order_item_unit_type_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."visit_order_item_unit_type_enum" IS 'Tipos de unidad de medida para items de pedido de visita';



CREATE TYPE "public"."visit_order_payment_method_enum" AS ENUM (
    'cash',
    'transfer',
    'credit',
    'check',
    'card'
);


ALTER TYPE "public"."visit_order_payment_method_enum" OWNER TO "postgres";


CREATE TYPE "public"."visit_order_status_enum" AS ENUM (
    'draft',
    'confirmed',
    'processed',
    'delivered',
    'cancelled'
);


ALTER TYPE "public"."visit_order_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."visit_order_type_enum" AS ENUM (
    'immediate',
    'scheduled',
    'quote',
    'sample'
);


ALTER TYPE "public"."visit_order_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."visit_status_enum" AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
);


ALTER TYPE "public"."visit_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."visit_type_enum" AS ENUM (
    'scheduled',
    'spontaneous',
    'follow_up',
    'emergency'
);


ALTER TYPE "public"."visit_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."visit_workflow_status_enum" AS ENUM (
    'assessment_pending',
    'inventory_pending',
    'purchase_pending',
    'communication_pending',
    'completed'
);


ALTER TYPE "public"."visit_workflow_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."zone_type_enum" AS ENUM (
    'country',
    'region',
    'state',
    'city',
    'district',
    'custom'
);


ALTER TYPE "public"."zone_type_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_generate_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.order_number is null or trim(new.order_number) = '' then
    new.order_number := public.generate_order_number(new.brand_id, new.order_date);
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."auto_generate_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_current_margin"("product_cost" numeric, "product_base_price" numeric) RETURNS numeric
    LANGUAGE "sql" IMMUTABLE
    AS $$
  select case 
    when product_cost is null or product_cost = 0 or product_base_price is null or product_base_price = 0 
    then null
    else ((product_base_price - product_cost) / product_base_price)
  end;
$$;


ALTER FUNCTION "public"."calculate_current_margin"("product_cost" numeric, "product_base_price" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric DEFAULT 0, "p_tax_rate" numeric DEFAULT 0) RETURNS TABLE("line_subtotal" numeric, "line_discount_amount" numeric, "tax_amount" numeric, "line_total" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_subtotal DECIMAL(12,2);
    v_discount DECIMAL(12,2);
    v_tax DECIMAL(10,2);
    v_total DECIMAL(12,2);
BEGIN
    -- Calcular subtotal
    v_subtotal := p_quantity * p_unit_price;
    
    -- Calcular descuento
    v_discount := ROUND(v_subtotal * (p_discount_percentage / 100), 2);
    
    -- Calcular impuesto sobre el monto después del descuento
    v_tax := ROUND((v_subtotal - v_discount) * p_tax_rate, 2);
    
    -- Calcular total
    v_total := v_subtotal - v_discount + v_tax;
    
    RETURN QUERY SELECT v_subtotal, v_discount, v_tax, v_total;
END;
$$;


ALTER FUNCTION "public"."calculate_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) IS 'Calcula subtotal, descuento, impuesto y total de un item';



CREATE OR REPLACE FUNCTION "public"."calculate_order_total"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.total_amount := new.subtotal - new.discount_amount + new.tax_amount + new.shipping_cost;
  
  if new.total_amount < 0 then
    raise exception 'El total del pedido no puede ser negativo. Subtotal: %, Descuento: %, Impuestos: %, Envío: %', 
      new.subtotal, new.discount_amount, new.tax_amount, new.shipping_cost;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."calculate_order_total"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_points_balance"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  DECLARE
    previous_balance decimal(12,2);
  BEGIN
    -- Obtener el balance más reciente
    SELECT balance_after INTO previous_balance
    FROM public.points_transactions
    WHERE client_brand_membership_id = NEW.client_brand_membership_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND deleted_at IS NULL
    ORDER BY created_at DESC, id DESC
    LIMIT 1;

    -- Si no hay transacciones previas, usar 0
    IF previous_balance IS NULL THEN
      previous_balance := 0;
    END IF;

    -- Solo calcular si balance_after no fue proporcionado
    IF NEW.balance_after IS NULL THEN
      NEW.balance_after := previous_balance + NEW.points;
    END IF;

    -- Validar balance no negativo
    IF NEW.balance_after < 0 THEN
      RAISE EXCEPTION 'El balance no puede ser negativo';
    END IF;

    RETURN NEW;
  END;
  $$;


ALTER FUNCTION "public"."calculate_points_balance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_price_variance"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Calcular price_variance_percent automáticamente si ambos precios están presentes
  if new.current_price is not null and new.suggested_price is not null and new.suggested_price > 0 then
    new.price_variance_percent := ((new.current_price - new.suggested_price) / new.suggested_price) * 100;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."calculate_price_variance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_promotion_rule_reach"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  calculated_reach integer := 0;
  query_text text;
  where_conditions text[] := array[]::text[];
  zone_ids text[];
  market_ids text[];
  client_type_ids text[];
  client_ids text[];
begin
  if TG_OP = 'INSERT' or (TG_OP = 'UPDATE' and (
    old.target_zones is distinct from new.target_zones or
    old.target_markets is distinct from new.target_markets or
    old.target_client_types is distinct from new.target_client_types or
    old.target_clients is distinct from new.target_clients
  )) then
    
    -- Construir condiciones WHERE basadas en los targets
    
    -- Condiciones de zonas
    if new.target_zones is not null then
      if new.target_zones->'included' != '[]'::jsonb then
        select array_agg(jsonb_array_elements_text(new.target_zones->'included')) into zone_ids;
        where_conditions := array_append(where_conditions, 
          format('c.zone_id = ANY(ARRAY[%s]::uuid[])', 
            array_to_string(array(select '''' || unnest(zone_ids) || ''''), ',')));
      end if;
    end if;
    
    -- Condiciones de mercados
    if new.target_markets is not null then
      if new.target_markets->'included' != '[]'::jsonb then
        select array_agg(jsonb_array_elements_text(new.target_markets->'included')) into market_ids;
        where_conditions := array_append(where_conditions, 
          format('c.market_id = ANY(ARRAY[%s]::uuid[])', 
            array_to_string(array(select '''' || unnest(market_ids) || ''''), ',')));
      end if;
    end if;
    
    -- Condiciones de tipos de cliente
    if new.target_client_types is not null then
      if new.target_client_types->'included' != '[]'::jsonb then
        select array_agg(jsonb_array_elements_text(new.target_client_types->'included')) into client_type_ids;
        where_conditions := array_append(where_conditions, 
          format('c.client_type_id = ANY(ARRAY[%s]::uuid[])', 
            array_to_string(array(select '''' || unnest(client_type_ids) || ''''), ',')));
      end if;
    end if;
    
    -- Condiciones de clientes específicos
    if new.target_clients is not null then
      if new.target_clients->'included' != '[]'::jsonb then
        select array_agg(jsonb_array_elements_text(new.target_clients->'included')) into client_ids;
        where_conditions := array_append(where_conditions, 
          format('c.id = ANY(ARRAY[%s]::uuid[])', 
            array_to_string(array(select '''' || unnest(client_ids) || ''''), ',')));
      end if;
    end if;
    
    -- Si no hay condiciones específicas y apply_to_all = true, contar todos los clientes del tenant
    if array_length(where_conditions, 1) is null and new.apply_to_all = true then
      execute format('SELECT COUNT(*) FROM public.clients c WHERE c.tenant_id = %L AND c.deleted_at IS NULL', new.tenant_id) into calculated_reach;
    elsif array_length(where_conditions, 1) > 0 then
      -- Construir y ejecutar query dinámico
      query_text := format('SELECT COUNT(*) FROM public.clients c WHERE c.tenant_id = %L AND c.deleted_at IS NULL AND %s',
        new.tenant_id, array_to_string(where_conditions, ' AND '));
      
      begin
        execute query_text into calculated_reach;
      exception when others then
        -- Si hay error en el query, establecer reach como null y continuar
        calculated_reach := null;
      end;
    end if;
    
    new.estimated_reach := calculated_reach;
    new.last_calculated_at := now();
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."calculate_promotion_rule_reach"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_visit_duration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Calcular duration_minutes automáticamente si check_in_time y check_out_time están presentes
  if new.check_in_time is not null and new.check_out_time is not null then
    new.duration_minutes := extract(epoch from (new.check_out_time - new.check_in_time)) / 60;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."calculate_visit_duration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_visit_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric DEFAULT 0, "p_tax_rate" numeric DEFAULT 0) RETURNS TABLE("line_subtotal" numeric, "line_discount_amount" numeric, "tax_amount" numeric, "line_total" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_subtotal DECIMAL(12,2);
    v_discount DECIMAL(12,2);
    v_tax DECIMAL(10,2);
    v_total DECIMAL(12,2);
BEGIN
    -- Calcular subtotal
    v_subtotal := p_quantity * p_unit_price;
    
    -- Calcular descuento
    v_discount := ROUND(v_subtotal * (p_discount_percentage / 100), 2);
    
    -- Calcular impuesto sobre el monto después del descuento
    v_tax := ROUND((v_subtotal - v_discount) * p_tax_rate, 2);
    
    -- Calcular total
    v_total := v_subtotal - v_discount + v_tax;
    
    RETURN QUERY SELECT v_subtotal, v_discount, v_tax, v_total;
END;
$$;


ALTER FUNCTION "public"."calculate_visit_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_visit_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) IS 'Calcula subtotal, descuento, impuesto y total de un item de visita';



CREATE OR REPLACE FUNCTION "public"."cascade_brand_role_soft_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if old.deleted_at is null and new.deleted_at is not null then
    update public.user_roles 
    set deleted_at = new.deleted_at 
    where brand_id = new.id and deleted_at is null;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."cascade_brand_role_soft_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cascade_tenant_soft_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if old.deleted_at is null and new.deleted_at is not null then
    update public.brands 
    set deleted_at = new.deleted_at 
    where tenant_id = new.id and deleted_at is null;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."cascade_tenant_soft_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_manager_hierarchy"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  current_manager_id uuid;
  depth integer := 0;
  max_depth integer := 50; -- Prevenir loops infinitos
begin
  if new.manager_id is null then
    return new;
  end if;
  
  current_manager_id := new.manager_id;
  
  -- Revisar hacia arriba en la jerarquía
  while current_manager_id is not null and depth < max_depth loop
    -- Si encontramos el ID del usuario siendo actualizado, hay un ciclo
    if current_manager_id = new.id then
      raise exception 'Ciclo detectado en jerarquía organizacional. Usuario no puede ser manager de su superior.';
    end if;
    
    -- Obtener el siguiente manager en la jerarquía
    select manager_id into current_manager_id
    from public.user_profiles
    where id = current_manager_id and deleted_at is null;
    
    depth := depth + 1;
  end loop;
  
  -- Si llegamos al límite, probablemente hay un ciclo
  if depth >= max_depth then
    raise exception 'Jerarquía organizacional demasiado profunda o ciclo detectado.';
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."check_manager_hierarchy"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_visit"("p_visit_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    visit_exists BOOLEAN;
    has_assessment BOOLEAN;
    result JSON;
BEGIN
    -- Verificar que la visita existe y pertenece al usuario
    SELECT EXISTS(
        SELECT 1 FROM visits 
        WHERE id = p_visit_id 
        AND asesor_id = auth.uid()
        AND tenant_id = get_current_tenant_id()
        AND status = 'in_progress'
    ) INTO visit_exists;

    IF NOT visit_exists THEN
        RETURN json_build_object('success', false, 'error', 'Visit not found or already completed');
    END IF;

    -- Verificar que tiene al menos un assessment (obligatorio)
    SELECT EXISTS(
        SELECT 1 FROM visit_assessments 
        WHERE visit_id = p_visit_id 
        AND tenant_id = get_current_tenant_id()
    ) INTO has_assessment;

    IF NOT has_assessment THEN
        RETURN json_build_object('success', false, 'error', 'Visit must have at least one product assessment');
    END IF;

    -- Completar la visita
    UPDATE visits 
    SET 
        status = 'completed',
        end_time = NOW(),
        updated_at = NOW()
    WHERE id = p_visit_id;

    -- Retornar resultado
    SELECT json_build_object(
        'success', true,
        'visit_id', p_visit_id,
        'completed_at', NOW(),
        'status', 'completed'
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."complete_visit"("p_visit_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."complete_visit"("p_visit_id" "uuid") IS 'Marca una visita como completada después de validar que tiene assessment';



CREATE OR REPLACE FUNCTION "public"."create_purchase_with_promotions"("p_visit_id" "uuid", "p_items" "jsonb", "p_payment_method" character varying, "p_invoice_number" character varying DEFAULT NULL::character varying, "p_invoice_photo_url" "text" DEFAULT NULL::"text", "p_apply_promotions" boolean DEFAULT true) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
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
    -- Verificar que la visita existe y pertenece al usuario
    SELECT v.*, c.id as client_id, c.business_name, b.id as brand_id, b.name as brand_name
    INTO visit_data
    FROM visits v
    INNER JOIN clients c ON c.id = v.client_id
    INNER JOIN brands b ON b.id = v.brand_id
    WHERE v.id = p_visit_id 
    AND v.asesor_id = auth.uid()
    AND v.tenant_id = get_current_tenant_id();

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Visit not found or access denied');
    END IF;

    -- Procesar cada item de compra
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
            get_current_tenant_id(),
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

    -- Aplicar promociones si se solicita
    IF p_apply_promotions THEN
        FOR promo_record IN 
            SELECT * FROM get_applicable_promotions(visit_data.client_id, visit_data.brand_id, total_amount)
            WHERE is_applicable = true
            ORDER BY estimated_discount DESC
        LOOP
            -- Crear redención de promoción
            INSERT INTO promotion_redemptions (
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
                get_current_tenant_id(),
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
            
            -- Solo aplicar la mejor promoción por ahora (no stackable)
            EXIT;
        END LOOP;
    END IF;

    -- Construir resultado
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


ALTER FUNCTION "public"."create_purchase_with_promotions"("p_visit_id" "uuid", "p_items" "jsonb", "p_payment_method" character varying, "p_invoice_number" character varying, "p_invoice_photo_url" "text", "p_apply_promotions" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_purchase_with_promotions"("p_visit_id" "uuid", "p_items" "jsonb", "p_payment_method" character varying, "p_invoice_number" character varying, "p_invoice_photo_url" "text", "p_apply_promotions" boolean) IS 'Crea compras en una visita y aplica promociones automáticamente';



CREATE OR REPLACE FUNCTION "public"."create_redemption_points_transaction"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  new_transaction_id uuid;
  reward_points_cost decimal(10,2);
  reward_name varchar(255);
begin
  if TG_OP = 'INSERT' then
    -- Obtener información de la recompensa
    select points_cost, name into reward_points_cost, reward_name
    from public.rewards where id = new.reward_id;
    
    -- Crear transacción de puntos negativa
    insert into public.points_transactions (
      tenant_id,
      client_brand_membership_id,
      transaction_type,
      points,
      transaction_date,
      source_type,
      source_id,
      source_description
    ) values (
      new.tenant_id,
      new.client_brand_membership_id,
      'redeemed',
      -reward_points_cost,
      new.redemption_date,
      'redemption',
      new.public_id,
      'Canje de recompensa: ' || reward_name
    ) returning id into new_transaction_id;
    
    -- Actualizar el registro con la transacción creada
    new.points_transaction_id := new_transaction_id;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."create_redemption_points_transaction"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expire_user_roles"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update public.user_roles
  set status = 'inactive', updated_at = now()
  where expires_at <= now()
  and status = 'active'
  and deleted_at is null;
end;
$$;


ALTER FUNCTION "public"."expire_user_roles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expire_user_roles_batch"("batch_size" integer DEFAULT 10) RETURNS TABLE("expired_count" integer, "expired_role_ids" "uuid"[], "execution_time_ms" integer)
    LANGUAGE "plpgsql"
    AS $$
declare
  expired_ids uuid[];
  count_expired integer := 0;
  total_expired integer := 0;
  start_time timestamp := clock_timestamp();
  batch_count integer := 0;
  max_batches integer := 10; -- Límite para evitar bloqueos largos
begin
  -- Procesar en batches para evitar bloqueos largos
  loop
    -- Obtener batch de IDs a expirar
    select array_agg(id) into expired_ids
    from (
      select id
      from public.user_roles
      where expires_at <= now()
      and status = 'active'
      and deleted_at is null
      order by expires_at
      limit batch_size
    ) batch_roles;
    
    -- Si no hay más roles que expirar, salir del loop
    exit when expired_ids is null or array_length(expired_ids, 1) = 0;
    
    -- Actualizar batch actual
    update public.user_roles
    set 
      status = 'inactive', 
      updated_at = now()
    where id = any(expired_ids);
    
    get diagnostics count_expired = row_count;
    total_expired := total_expired + count_expired;
    batch_count := batch_count + 1;
    
    -- Límite de seguridad para evitar loops infinitos
    exit when batch_count >= max_batches;
    
    -- Pequeña pausa entre batches para evitar saturar la DB
    perform pg_sleep(0.01);
  end loop;
  
  -- Retornar estadísticas
  return query select 
    total_expired,
    coalesce(expired_ids, array[]::uuid[]),
    extract(milliseconds from clock_timestamp() - start_time)::integer;
end;
$$;


ALTER FUNCTION "public"."expire_user_roles_batch"("batch_size" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expire_user_roles_manual"() RETURNS TABLE("total_expired" integer, "execution_time_ms" integer, "affected_users" integer, "affected_tenants" integer)
    LANGUAGE "plpgsql"
    AS $$
declare
  result_record record;
  user_count integer;
  tenant_count integer;
begin
  -- Contar usuarios y tenants afectados antes de la operación
  select count(distinct user_profile_id), count(distinct tenant_id)
  into user_count, tenant_count
  from public.user_roles
  where expires_at <= now()
    and status = 'active'
    and deleted_at is null;
  
  -- Ejecutar expiración
  select * into result_record
  from public.expire_user_roles_batch(5000);
  
  return query select 
    result_record.expired_count,
    result_record.execution_time_ms,
    user_count,
    tenant_count;
end;
$$;


ALTER FUNCTION "public"."expire_user_roles_manual"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_advisor_assignment_public_id"() RETURNS character varying
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'AA-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM advisor_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;


ALTER FUNCTION "public"."generate_advisor_assignment_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_advisor_client_assignment_public_id"() RETURNS character varying
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'ACA-' || LPAD(counter::TEXT, 5, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM advisor_client_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;


ALTER FUNCTION "public"."generate_advisor_client_assignment_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_brand_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.brand_public_id_seq');
  return 'BRD-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_brand_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_campaign_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.campaign_public_id_seq');
  return 'CAM-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_campaign_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_client_brand_membership_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.client_brand_membership_public_id_seq');
  return 'CBM-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_client_brand_membership_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_client_invoice_data_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.client_invoice_data_public_id_seq');
  return 'CID-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_client_invoice_data_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_client_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.client_public_id_seq');
  return 'CLI-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_client_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_client_tier_assignment_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.client_tier_assignment_public_id_seq');
  return 'CTA-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_client_tier_assignment_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_client_type_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.client_type_public_id_seq');
  return 'CTY-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_client_type_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_commercial_structure_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.commercial_structure_public_id_seq');
  return 'CST-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_commercial_structure_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_market_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.market_public_id_seq');
  return 'MKT-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_market_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_order_item_public_id"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    next_val := nextval('public.order_item_public_id_seq');
    RETURN 'ORI-' || lpad(next_val::text, 4, '0');
END;
$$;


ALTER FUNCTION "public"."generate_order_item_public_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_order_item_public_id"() IS 'Genera public_id con formato ORI-XXXX para order_items';



CREATE OR REPLACE FUNCTION "public"."generate_order_number"("brand_id" "uuid", "order_date" "date") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  brand_code varchar(10);
  date_part text;
  sequence_part text;
  sequence_num integer;
  result text;
begin
  -- Obtener código de la marca
  select code into brand_code
  from public.brands where id = brand_id and deleted_at is null;
  
  if brand_code is null then
    raise exception 'Marca no encontrada';
  end if;
  
  -- Formatear fecha como YYYYMMDD
  date_part := to_char(order_date, 'YYYYMMDD');
  
  -- Obtener siguiente número de secuencia para esta marca y fecha
  select coalesce(max(
    substring(order_number from length(brand_code || '-' || date_part || '-') + 1)::integer
  ), 0) + 1 into sequence_num
  from public.orders
  where order_number like brand_code || '-' || date_part || '-%'
  and deleted_at is null;
  
  -- Formatear secuencia con padding
  sequence_part := lpad(sequence_num::text, 3, '0');
  
  result := brand_code || '-' || date_part || '-' || sequence_part;
  
  -- Verificar unicidad
  while exists (select 1 from public.orders where order_number = result and deleted_at is null) loop
    sequence_num := sequence_num + 1;
    sequence_part := lpad(sequence_num::text, 3, '0');
    result := brand_code || '-' || date_part || '-' || sequence_part;
  end loop;
  
  return result;
end;
$$;


ALTER FUNCTION "public"."generate_order_number"("brand_id" "uuid", "order_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_order_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.order_public_id_seq');
  return 'ORD-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_order_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_point_transaction_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN generate_public_id('point_transaction');
END;
$$;


ALTER FUNCTION "public"."generate_point_transaction_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_points_transaction_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.points_transaction_public_id_seq');
  return 'PTX-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_points_transaction_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_product_category_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.product_category_public_id_seq');
  return 'PCG-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_product_category_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_product_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.product_public_id_seq');
  return 'PRD-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_product_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_product_variant_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.product_variant_public_id_seq');
  return 'PRV-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_product_variant_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_promotion_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.promotion_public_id_seq');
  return 'PRM-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_promotion_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_promotion_redemption_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.promotion_redemption_public_id_seq');
  return 'PRD-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_promotion_redemption_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_promotion_rule_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.promotion_rule_public_id_seq');
  return 'PRR-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_promotion_rule_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_public_id"("entity_type" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    next_id INTEGER;
    prefix TEXT;
    sequence_name TEXT;
BEGIN
    -- Map entity types to prefixes and sequences
    CASE entity_type
        WHEN 'tenant' THEN 
            prefix := 'TEN-';
            sequence_name := 'tenant_public_id_seq';
        WHEN 'brand' THEN 
            prefix := 'BRD-';
            sequence_name := 'brand_public_id_seq';
        WHEN 'client' THEN 
            prefix := 'CLI-';
            sequence_name := 'client_public_id_seq';
        WHEN 'campaign' THEN 
            prefix := 'CAM-';
            sequence_name := 'campaign_public_id_seq';
        WHEN 'promotion' THEN 
            prefix := 'PRM-';
            sequence_name := 'promotion_public_id_seq';
        WHEN 'order' THEN 
            prefix := 'ORD-';
            sequence_name := 'order_public_id_seq';
        WHEN 'visit' THEN 
            prefix := 'VIS-';
            sequence_name := 'visit_public_id_seq';
        WHEN 'point_transaction' THEN 
            prefix := 'PTX-';
            sequence_name := 'point_transaction_public_id_seq';
        WHEN 'reward' THEN 
            prefix := 'RWD-';
            sequence_name := 'reward_public_id_seq';
        WHEN 'product' THEN 
            prefix := 'PRD-';
            sequence_name := 'product_public_id_seq';
        WHEN 'reward_redemption' THEN 
            prefix := 'RRD-';
            sequence_name := 'reward_redemption_public_id_seq';
        WHEN 'promotion_redemption' THEN 
            prefix := 'PRR-';
            sequence_name := 'promotion_redemption_public_id_seq';
        ELSE
            RAISE EXCEPTION 'Unsupported entity type: %', entity_type;
    END CASE;

    -- Get next sequence value
    EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_id;
    
    -- Return formatted public_id
    RETURN prefix || LPAD(next_id::TEXT, 4, '0');
END;
$$;


ALTER FUNCTION "public"."generate_public_id"("entity_type" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_public_id"("entity_type" "text") IS 'Universal function to generate public_id values for any entity type with proper prefixes';



CREATE OR REPLACE FUNCTION "public"."generate_redemption_code"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  code_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := 'RWD-';
  i integer;
begin
  -- Generar 8 caracteres aleatorios
  for i in 1..8 loop
    result := result || substr(code_chars, floor(random() * length(code_chars) + 1)::integer, 1);
  end loop;
  
  -- Verificar unicidad
  while exists (select 1 from public.reward_redemptions where redemption_code = result) loop
    result := 'RWD-';
    for i in 1..8 loop
      result := result || substr(code_chars, floor(random() * length(code_chars) + 1)::integer, 1);
    end loop;
  end loop;
  
  return result;
end;
$$;


ALTER FUNCTION "public"."generate_redemption_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_reward_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.reward_public_id_seq');
  return 'RWD-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_reward_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_reward_redemption_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.reward_redemption_public_id_seq');
  return 'RRD-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_reward_redemption_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_tenant_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.tenant_public_id_seq');
  return 'TEN-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_tenant_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_tier_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.tier_public_id_seq');
  return 'TIR-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_tier_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_user_profile_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.user_profile_public_id_seq');
  return 'USR-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_user_profile_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_visit_assessment_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.visit_assessment_public_id_seq');
  return 'VAS-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_visit_assessment_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_visit_communication_plan_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.visit_communication_plan_public_id_seq');
  return 'VCP-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_visit_communication_plan_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_visit_inventory_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.visit_inventory_public_id_seq');
  return 'VIN-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_visit_inventory_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_visit_order_item_public_id"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    next_val := nextval('public.visit_order_item_public_id_seq');
    RETURN 'VOI-' || lpad(next_val::text, 4, '0');
END;
$$;


ALTER FUNCTION "public"."generate_visit_order_item_public_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_visit_order_item_public_id"() IS 'Genera public_id con formato VOI-XXXX para visit_order_items';



CREATE OR REPLACE FUNCTION "public"."generate_visit_order_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.visit_order_public_id_seq');
  return 'VOR-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_visit_order_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_visit_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.visit_public_id_seq');
  return 'VIS-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_visit_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_zone_public_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  next_val bigint;
begin
  next_val := nextval('public.zone_public_id_seq');
  return 'ZON-' || lpad(next_val::text, 4, '0');
end;
$$;


ALTER FUNCTION "public"."generate_zone_public_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_applicable_promotions"("p_client_id" "uuid", "p_brand_id" "uuid", "p_purchase_amount" numeric DEFAULT NULL::numeric) RETURNS TABLE("promotion_id" "uuid", "promotion_code" character varying, "promotion_name" character varying, "promotion_type" character varying, "promotion_value" numeric, "minimum_purchase_amount" numeric, "maximum_discount_amount" numeric, "is_applicable" boolean, "estimated_discount" numeric, "start_date" "date", "end_date" "date")
    LANGUAGE "plpgsql" SECURITY DEFINER
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
                (p_purchase_amount * p.promotion_value) -- Puntos extras
            ELSE 0
        END as estimated_discount,
        p.start_date,
        p.end_date
    FROM promotions p
    WHERE p.brand_id = p_brand_id
    AND p.is_active = true
    AND p.approval_status = 'approved'
    AND CURRENT_DATE BETWEEN p.start_date AND p.end_date
    AND p.tenant_id = get_current_tenant_id()
    AND (
        -- Sin segmentación = aplica a todos
        NOT EXISTS (SELECT 1 FROM promotion_segments ps WHERE ps.promotion_id = p.id)
        OR 
        -- Tiene segmentación que incluye al cliente
        EXISTS (
            SELECT 1 FROM promotion_segments ps
            INNER JOIN clients c ON c.id = p_client_id
            WHERE ps.promotion_id = p.id
            AND ps.tenant_id = get_current_tenant_id()
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


ALTER FUNCTION "public"."get_applicable_promotions"("p_client_id" "uuid", "p_brand_id" "uuid", "p_purchase_amount" numeric) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_applicable_promotions"("p_client_id" "uuid", "p_brand_id" "uuid", "p_purchase_amount" numeric) IS 'Obtiene promociones aplicables a un cliente específico con cálculo de descuento estimado';



CREATE OR REPLACE FUNCTION "public"."get_current_tenant_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT tenant_id 
        FROM users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$;


ALTER FUNCTION "public"."get_current_tenant_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_next_order_item_line_number"("p_order_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    max_line INTEGER;
BEGIN
    SELECT COALESCE(MAX(line_number), 0) INTO max_line
    FROM public.order_items
    WHERE order_id = p_order_id
    AND deleted_at IS NULL;
    
    RETURN max_line + 1;
END;
$$;


ALTER FUNCTION "public"."get_next_order_item_line_number"("p_order_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_next_order_item_line_number"("p_order_id" "uuid") IS 'Obtiene el siguiente número de línea disponible para un pedido';



CREATE OR REPLACE FUNCTION "public"."get_next_visit_order_item_line_number"("p_visit_order_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    max_line INTEGER;
BEGIN
    SELECT COALESCE(MAX(line_number), 0) INTO max_line
    FROM public.visit_order_items
    WHERE visit_order_id = p_visit_order_id
    AND deleted_at IS NULL;
    
    RETURN max_line + 1;
END;
$$;


ALTER FUNCTION "public"."get_next_visit_order_item_line_number"("p_visit_order_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_next_visit_order_item_line_number"("p_visit_order_id" "uuid") IS 'Obtiene el siguiente número de línea disponible para un pedido de visita';



CREATE OR REPLACE FUNCTION "public"."get_role_expiration_stats"() RETURNS TABLE("expires_in_hours" integer, "role_count" bigint, "role_types" "text"[])
    LANGUAGE "sql"
    AS $$
  select 
    case 
      when expires_at <= now() then 0
      when expires_at <= now() + interval '1 hour' then 1
      when expires_at <= now() + interval '6 hours' then 6
      when expires_at <= now() + interval '24 hours' then 24
      when expires_at <= now() + interval '72 hours' then 72
      else 168 -- 1 week
    end as expires_in_hours,
    count(*) as role_count,
    array_agg(distinct role::text) as role_types
  from public.user_roles
  where status = 'active'
    and expires_at is not null
    and deleted_at is null
    and expires_at <= now() + interval '1 week'
  group by 1
  order by 1;
$$;


ALTER FUNCTION "public"."get_role_expiration_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_role_system_health"() RETURNS TABLE("total_roles" bigint, "active_roles" bigint, "expired_roles" bigint, "roles_expiring_today" bigint, "avg_query_time_ms" numeric)
    LANGUAGE "sql"
    AS $$
  with stats as (
    select 
      count(*) as total,
      count(*) filter (where status = 'active' and deleted_at is null) as active,
      count(*) filter (where status = 'inactive' and expires_at <= now()) as expired,
      count(*) filter (where status = 'active' and expires_at between now() and now() + interval '24 hours') as expiring_today
    from public.user_roles
  )
  select 
    s.total,
    s.active,
    s.expired,
    s.expiring_today,
    0.0 as avg_query_time_ms -- Placeholder para métricas futuras
  from stats s;
$$;


ALTER FUNCTION "public"."get_role_system_health"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  default_tenant_id uuid := 'fe0f429d-2d83-4738-af65-32c655cef656'::uuid;
  tenant_id_param uuid;
  first_name_param text;
  last_name_param  text;
begin
  -- tenant_id desde metadata (si viene vacío => null)
  tenant_id_param := nullif(new.raw_user_meta_data->>'tenant_id', '')::uuid;

  -- fallback a default tenant (opción 3)
  tenant_id_param := coalesce(tenant_id_param, default_tenant_id);

  -- validar que tenant existe (opción 1, pero aplicado al valor final)
  if not exists (select 1 from public.tenants t where t.id = tenant_id_param) then
    raise exception 'Invalid tenant_id (resolved): %', tenant_id_param;
  end if;

  -- nombres desde metadata
  first_name_param := nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), '');
  last_name_param  := nullif(trim(coalesce(new.raw_user_meta_data->>'last_name',  '')), '');

  -- fallbacks para NOT NULL
  if first_name_param is null then first_name_param := 'User'; end if;
  if last_name_param  is null then last_name_param  := 'Pending'; end if;

  insert into public.user_profiles (
    user_id,
    tenant_id,
    email,
    first_name,
    last_name,
    status,
    created_at,
    updated_at
  ) values (
    new.id,
    tenant_id_param,
    new.email,
    first_name_param,
    last_name_param,
    'active',
    now(),
    now()
  )
  on conflict (user_id) do update
    set email = excluded.email,
        tenant_id = excluded.tenant_id,
        updated_at = now();

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_promotion_rule_toggles"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Limpiar campos target específicos cuando apply_to_all = true según rule_type
  if new.apply_to_all = true then
    case new.rule_type
      when 'zone' then
        new.target_zones := jsonb_build_object('apply_to_all', true, 'included', '[]'::jsonb, 'excluded', '[]'::jsonb);
      when 'state' then
        new.target_states := jsonb_build_object('apply_to_all', true, 'included', '[]'::jsonb, 'excluded', '[]'::jsonb);
      when 'market_type' then
        new.target_markets := jsonb_build_object('apply_to_all', true, 'included', '[]'::jsonb, 'excluded', '[]'::jsonb);
      when 'commercial_structure' then
        new.target_commercial_structures := jsonb_build_object('apply_to_all', true, 'included', '[]'::jsonb, 'excluded', '[]'::jsonb);
      when 'client_type' then
        new.target_client_types := jsonb_build_object('apply_to_all', true, 'included', '[]'::jsonb, 'excluded', '[]'::jsonb);
      when 'specific_client' then
        new.target_clients := jsonb_build_object('apply_to_all', true, 'included', '[]'::jsonb, 'excluded', '[]'::jsonb);
      when 'product' then
        new.target_products := jsonb_build_object('apply_to_all', true, 'included', '[]'::jsonb, 'excluded', '[]'::jsonb);
      when 'category' then
        new.target_categories := jsonb_build_object('apply_to_all', true, 'included', '[]'::jsonb, 'excluded', '[]'::jsonb);
      when 'tier' then
        new.target_tiers := jsonb_build_object('apply_to_all', true, 'included', '[]'::jsonb, 'excluded', '[]'::jsonb);
    end case;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_promotion_rule_toggles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_role_active"("role_status" "public"."user_role_status_enum", "expires_at" timestamp with time zone, "deleted_at" timestamp with time zone) RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    AS $$
  select role_status = 'active' 
    and deleted_at is null 
    and (expires_at is null or expires_at > now());
$$;


ALTER FUNCTION "public"."is_role_active"("role_status" "public"."user_role_status_enum", "expires_at" timestamp with time zone, "deleted_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_transaction_reversed"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.reversal_of is not null then
    -- Marcar la transacción original como reversada
    update public.points_transactions
    set reversed_by = new.id, updated_at = now()
    where id = new.reversal_of;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."mark_transaction_reversed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_public_id_sequence"("entity_type" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    table_name TEXT;
    sequence_name TEXT;
    max_number INTEGER := 0;
    prefix TEXT;
    current_max_public_id TEXT;
BEGIN
    -- Map entity types to table and sequence names
    CASE entity_type
        WHEN 'tenant' THEN 
            table_name := 'tenants';
            sequence_name := 'tenant_public_id_seq';
            prefix := 'TEN-';
        WHEN 'brand' THEN 
            table_name := 'brands';
            sequence_name := 'brand_public_id_seq';
            prefix := 'BRD-';
        WHEN 'client' THEN 
            table_name := 'clients';
            sequence_name := 'client_public_id_seq';
            prefix := 'CLI-';
        -- Add other cases as needed
        ELSE
            RAISE EXCEPTION 'Unsupported entity type: %', entity_type;
    END CASE;

    -- Get the maximum existing public_id number for this entity type
    EXECUTE format(
        'SELECT public_id FROM %I WHERE public_id LIKE %L ORDER BY public_id DESC LIMIT 1',
        table_name, prefix || '%'
    ) INTO current_max_public_id;

    IF current_max_public_id IS NOT NULL THEN
        max_number := SUBSTRING(current_max_public_id FROM '[0-9]+$')::INTEGER;
    END IF;

    -- Reset sequence to start after the maximum existing number
    EXECUTE format('SELECT setval(%L, %s)', sequence_name, max_number + 1);
    
    RAISE NOTICE 'Reset % sequence to start at %', sequence_name, max_number + 1;
END;
$_$;


ALTER FUNCTION "public"."reset_public_id_sequence"("entity_type" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."reset_public_id_sequence"("entity_type" "text") IS 'Resets a sequence to continue from the highest existing public_id number';



CREATE OR REPLACE FUNCTION "public"."sync_client_email"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Sincronizar cuando se actualiza auth.users.email
  if TG_TABLE_NAME = 'users' then
    if old.email != new.email then
      update public.clients 
      set email = new.email, updated_at = now()
      where user_id = new.id and email != new.email;
    end if;
    return new;
  end if;
  
  -- Sincronizar cuando se actualiza clients.email
  if TG_TABLE_NAME = 'clients' then
    if new.user_id is not null and (old.email is distinct from new.email) then
      update auth.users
      set email = new.email
      where id = new.user_id and email != new.email;
    end if;
    return new;
  end if;
  
  return null;
end;
$$;


ALTER FUNCTION "public"."sync_client_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_user_profile_email"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Sincronizar cuando se actualiza auth.users.email
  if TG_TABLE_NAME = 'users' then
    -- Solo actualizar si el email realmente cambió
    if old.email != new.email then
      update public.user_profiles 
      set email = new.email, updated_at = now()
      where user_id = new.id and email != new.email;
    end if;
    return new;
  end if;
  
  -- Sincronizar cuando se actualiza user_profiles.email
  if TG_TABLE_NAME = 'user_profiles' then
    -- Solo actualizar si el email realmente cambió
    if old.email != new.email then
      update auth.users
      set email = new.email
      where id = new.user_id and email != new.email;
    end if;
    return new;
  end if;
  
  return null;
end;
$$;


ALTER FUNCTION "public"."sync_user_profile_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_campaign_budget_spent"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    if new.campaign_id is not null then
      update public.campaigns
      set budget_spent = (
        select coalesce(sum(budget_spent), 0)
        from public.promotions
        where campaign_id = new.campaign_id
        and deleted_at is null
      ), updated_at = now()
      where id = new.campaign_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.campaign_id is not null then
      update public.campaigns
      set budget_spent = (
        select coalesce(sum(budget_spent), 0)
        from public.promotions
        where campaign_id = old.campaign_id
        and deleted_at is null
      ), updated_at = now()
      where id = old.campaign_id;
    end if;
  end if;
  
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_campaign_budget_spent"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_membership_current_tier"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Si es INSERT o UPDATE y is_current = true, actualizar la membresía
  if TG_OP = 'INSERT' or (TG_OP = 'UPDATE' and new.is_current = true) then
    if new.is_current = true then
      update public.client_brand_memberships
      set current_tier_id = new.tier_id, updated_at = now()
      where id = new.client_brand_membership_id;
    end if;
  end if;
  
  -- Si es DELETE y era current, buscar la asignación anterior más reciente
  if TG_OP = 'DELETE' and old.is_current = true then
    declare
      previous_tier_assignment_id uuid;
    begin
      -- Buscar la asignación más reciente que no sea la eliminada
      select id into previous_tier_assignment_id
      from public.client_tier_assignments
      where client_brand_membership_id = old.client_brand_membership_id
      and id != old.id
      and deleted_at is null
      order by effective_from desc, created_at desc
      limit 1;
      
      if previous_tier_assignment_id is not null then
        -- Marcar la asignación anterior como current
        update public.client_tier_assignments
        set is_current = true, updated_at = now()
        where id = previous_tier_assignment_id;
        
        -- Actualizar la membresía con el tier anterior
        update public.client_brand_memberships cbm
        set current_tier_id = cta.tier_id, updated_at = now()
        from public.client_tier_assignments cta
        where cbm.id = old.client_brand_membership_id
        and cta.id = previous_tier_assignment_id;
      else
        -- No hay asignaciones anteriores, establecer tier por defecto
        update public.client_brand_memberships cbm
        set current_tier_id = t.id, updated_at = now()
        from public.tiers t
        join public.client_brand_memberships cbm_inner on cbm_inner.brand_id = t.brand_id
        where cbm.id = cbm_inner.id
        and cbm_inner.id = old.client_brand_membership_id
        and t.is_default = true
        and t.deleted_at is null;
      end if;
    end;
  end if;
  
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_membership_current_tier"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_membership_points"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  current_balance decimal(12,2);
  current_lifetime decimal(12,2);
begin
  if TG_OP = 'INSERT' then
    -- Actualizar points_balance y lifetime_points en la membresía
    select points_balance, lifetime_points 
    into current_balance, current_lifetime
    from public.client_brand_memberships
    where id = new.client_brand_membership_id;
    
    -- Actualizar balance actual
    update public.client_brand_memberships
    set 
      points_balance = new.balance_after,
      lifetime_points = case 
        when new.transaction_type in ('earned', 'bonus') then current_lifetime + abs(new.points)
        else current_lifetime 
      end,
      last_points_earned_date = case 
        when new.transaction_type in ('earned', 'bonus') then new.transaction_date
        else last_points_earned_date 
      end,
      updated_at = now()
    where id = new.client_brand_membership_id;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."update_membership_points"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_order_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_order_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_order_totals_from_items"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_order_id UUID;
    v_subtotal DECIMAL(12,2);
    v_discount DECIMAL(12,2);
    v_tax DECIMAL(10,2);
    v_total DECIMAL(12,2);
BEGIN
    -- Determinar el order_id afectado
    IF TG_OP = 'DELETE' THEN
        v_order_id := OLD.order_id;
    ELSE
        v_order_id := NEW.order_id;
    END IF;
    
    -- Calcular totales agregados de todos los items activos
    SELECT 
        COALESCE(SUM(line_subtotal), 0),
        COALESCE(SUM(line_discount_amount), 0),
        COALESCE(SUM(tax_amount), 0),
        COALESCE(SUM(line_total), 0)
    INTO v_subtotal, v_discount, v_tax, v_total
    FROM public.order_items
    WHERE order_id = v_order_id
    AND deleted_at IS NULL;
    
    -- Actualizar el pedido padre
    UPDATE public.orders
    SET 
        subtotal = v_subtotal,
        discount_amount = v_discount,
        tax_amount = v_tax,
        total_amount = v_total,
        updated_at = now()
    WHERE id = v_order_id
    AND deleted_at IS NULL;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION "public"."update_order_totals_from_items"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_promotion_usage"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if TG_OP = 'INSERT' then
    update public.promotions
    set usage_count_total = usage_count_total + 1,
        budget_spent = budget_spent + new.applied_discount_amount,
        updated_at = now()
    where id = new.promotion_id;
  elsif TG_OP = 'DELETE' then
    update public.promotions
    set usage_count_total = greatest(0, usage_count_total - 1),
        budget_spent = greatest(0, budget_spent - old.applied_discount_amount),
        updated_at = now()
    where id = old.promotion_id;
  elsif TG_OP = 'UPDATE' then
    -- Actualizar solo si cambió el monto aplicado o el estado afecta el conteo
    if old.applied_discount_amount != new.applied_discount_amount or
       (old.redemption_status != 'reversed' and new.redemption_status = 'reversed') or
       (old.redemption_status = 'reversed' and new.redemption_status != 'reversed') then
      
      declare
        usage_delta integer := 0;
        budget_delta decimal(10,2) := 0;
      begin
        -- Calcular cambios en usage
        if old.redemption_status != 'reversed' and new.redemption_status = 'reversed' then
          usage_delta := -1;
        elsif old.redemption_status = 'reversed' and new.redemption_status != 'reversed' then
          usage_delta := 1;
        end if;
        
        -- Calcular cambios en budget
        if new.redemption_status = 'reversed' then
          budget_delta := -old.applied_discount_amount;
        elsif old.redemption_status = 'reversed' then
          budget_delta := new.applied_discount_amount;
        else
          budget_delta := new.applied_discount_amount - old.applied_discount_amount;
        end if;
        
        update public.promotions
        set usage_count_total = greatest(0, usage_count_total + usage_delta),
            budget_spent = greatest(0, budget_spent + budget_delta),
            updated_at = now()
        where id = new.promotion_id;
      end;
    end if;
  end if;
  
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_promotion_usage"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_reward_usage_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if TG_OP = 'INSERT' then
    update public.rewards
    set usage_count_total = usage_count_total + 1, updated_at = now()
    where id = new.reward_id;
  elsif TG_OP = 'DELETE' then
    update public.rewards
    set usage_count_total = greatest(0, usage_count_total - 1), updated_at = now()
    where id = old.reward_id;
  end if;
  
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_reward_usage_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_visit_assessment"("p_visit_id" "uuid", "p_assessment_data" "jsonb") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    visit_exists BOOLEAN;
    assessment_record JSONB;
    inserted_count INTEGER := 0;
    current_tenant_id UUID;
    result JSON;
BEGIN
    -- Obtener tenant_id del usuario actual
    SELECT tenant_id INTO current_tenant_id FROM users WHERE id = auth.uid();
    
    -- Verificar que la visita existe y pertenece al usuario
    SELECT EXISTS(
        SELECT 1 FROM visits 
        WHERE id = p_visit_id 
        AND asesor_id = auth.uid()
        AND tenant_id = current_tenant_id
    ) INTO visit_exists;

    IF NOT visit_exists THEN
        RETURN json_build_object('success', false, 'error', 'Visit not found or access denied');
    END IF;

    -- Procesar cada producto en el assessment
    FOR assessment_record IN SELECT * FROM jsonb_array_elements(p_assessment_data->'products')
    LOOP
        -- Insertar o actualizar assessment
        INSERT INTO visit_assessments (
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

    -- Retornar resultado
    SELECT json_build_object(
        'success', true,
        'visit_id', p_visit_id,
        'assessments_processed', inserted_count,
        'updated_at', NOW()
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."update_visit_assessment"("p_visit_id" "uuid", "p_assessment_data" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_visit_assessment"("p_visit_id" "uuid", "p_assessment_data" "jsonb") IS 'Actualiza el assessment de productos para una visita específica';



CREATE OR REPLACE FUNCTION "public"."update_visit_order_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_visit_order_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_visit_order_totals_from_items"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_visit_order_id UUID;
    v_subtotal DECIMAL(12,2);
    v_discount DECIMAL(12,2);
    v_tax DECIMAL(10,2);
    v_total DECIMAL(12,2);
BEGIN
    -- Determinar el visit_order_id afectado
    IF TG_OP = 'DELETE' THEN
        v_visit_order_id := OLD.visit_order_id;
    ELSE
        v_visit_order_id := NEW.visit_order_id;
    END IF;
    
    -- Calcular totales agregados de todos los items activos
    SELECT 
        COALESCE(SUM(line_subtotal), 0),
        COALESCE(SUM(line_discount_amount), 0),
        COALESCE(SUM(tax_amount), 0),
        COALESCE(SUM(line_total), 0)
    INTO v_subtotal, v_discount, v_tax, v_total
    FROM public.visit_order_items
    WHERE visit_order_id = v_visit_order_id
    AND deleted_at IS NULL;
    
    -- Actualizar el pedido de visita padre
    UPDATE public.visit_orders
    SET 
        subtotal = v_subtotal,
        discount_amount = v_discount,
        tax_amount = v_tax,
        total_amount = v_total,
        updated_at = now()
    WHERE id = v_visit_order_id
    AND deleted_at IS NULL;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION "public"."update_visit_order_totals_from_items"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_visit_workflow_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  visit_workflow_status text;
  assessment_count integer;
begin
  -- Obtener el workflow_status actual de la visita
  select workflow_status into visit_workflow_status
  from public.visits 
  where id = coalesce(new.visit_id, old.visit_id) 
  and deleted_at is null;
  
  if visit_workflow_status is null then
    return coalesce(new, old);
  end if;
  
  -- Contar assessments activos para esta visita
  select count(*) into assessment_count
  from public.visit_assessments
  where visit_id = coalesce(new.visit_id, old.visit_id)
  and deleted_at is null;
  
  -- Si es INSERT y es el primer assessment, cambiar de assessment_pending
  if TG_OP = 'INSERT' then
    if visit_workflow_status = 'assessment_pending' and assessment_count > 0 then
      update public.visits 
      set workflow_status = 'inventory_pending', updated_at = now()
      where id = new.visit_id;
    end if;
  end if;
  
  -- Si es DELETE y no quedan assessments, regresar a assessment_pending
  if TG_OP = 'DELETE' then
    if assessment_count = 0 then
      update public.visits 
      set workflow_status = 'assessment_pending', updated_at = now()
      where id = old.visit_id;
    end if;
  end if;
  
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_visit_workflow_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_visit_workflow_status_communication"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  visit_workflow_status text;
  communication_plan_count integer;
begin
  -- Obtener el workflow_status actual de la visita
  select workflow_status into visit_workflow_status
  from public.visits 
  where id = coalesce(new.visit_id, old.visit_id) 
  and deleted_at is null;
  
  if visit_workflow_status is null then
    return coalesce(new, old);
  end if;
  
  -- Contar planes de comunicación activos para esta visita
  select count(*) into communication_plan_count
  from public.visit_communication_plans
  where visit_id = coalesce(new.visit_id, old.visit_id)
  and deleted_at is null;
  
  -- Si es INSERT y el workflow está en communication_pending, cambiar a completed
  if TG_OP = 'INSERT' then
    if visit_workflow_status = 'communication_pending' and communication_plan_count > 0 then
      update public.visits 
      set workflow_status = 'completed', updated_at = now()
      where id = new.visit_id;
    end if;
  end if;
  
  -- Si es DELETE y no quedan planes y estaba en completed, regresar a communication_pending
  if TG_OP = 'DELETE' then
    if communication_plan_count = 0 and visit_workflow_status = 'completed' then
      update public.visits 
      set workflow_status = 'communication_pending', updated_at = now()
      where id = old.visit_id;
    end if;
  end if;
  
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_visit_workflow_status_communication"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_visit_workflow_status_inventory"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  visit_workflow_status text;
  inventory_count integer;
begin
  -- Obtener el workflow_status actual de la visita
  select workflow_status into visit_workflow_status
  from public.visits 
  where id = coalesce(new.visit_id, old.visit_id) 
  and deleted_at is null;
  
  if visit_workflow_status is null then
    return coalesce(new, old);
  end if;
  
  -- Contar inventarios activos para esta visita
  select count(*) into inventory_count
  from public.visit_inventories
  where visit_id = coalesce(new.visit_id, old.visit_id)
  and deleted_at is null;
  
  -- Si es INSERT y el workflow está en inventory_pending, cambiar a purchase_pending
  if TG_OP = 'INSERT' then
    if visit_workflow_status = 'inventory_pending' and inventory_count > 0 then
      update public.visits 
      set workflow_status = 'purchase_pending', updated_at = now()
      where id = new.visit_id;
    end if;
  end if;
  
  -- Si es DELETE y no quedan inventarios y estaba en purchase_pending, regresar a inventory_pending
  if TG_OP = 'DELETE' then
    if inventory_count = 0 and visit_workflow_status in ('purchase_pending', 'communication_pending') then
      update public.visits 
      set workflow_status = 'inventory_pending', updated_at = now()
      where id = old.visit_id;
    end if;
  end if;
  
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_visit_workflow_status_inventory"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_visit_workflow_status_orders"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  visit_workflow_status text;
  order_count integer;
begin
  -- Obtener el workflow_status actual de la visita
  select workflow_status into visit_workflow_status
  from public.visits 
  where id = coalesce(new.visit_id, old.visit_id) 
  and deleted_at is null;
  
  if visit_workflow_status is null then
    return coalesce(new, old);
  end if;
  
  -- Contar órdenes activas para esta visita
  select count(*) into order_count
  from public.visit_orders
  where visit_id = coalesce(new.visit_id, old.visit_id)
  and deleted_at is null;
  
  -- Si es INSERT y el workflow está en purchase_pending, cambiar a communication_pending
  if TG_OP = 'INSERT' then
    if visit_workflow_status = 'purchase_pending' and order_count > 0 then
      update public.visits 
      set workflow_status = 'communication_pending', updated_at = now()
      where id = new.visit_id;
    end if;
  end if;
  
  -- Si es DELETE y no quedan órdenes y estaba en communication_pending, regresar a purchase_pending
  if TG_OP = 'DELETE' then
    if order_count = 0 and visit_workflow_status = 'communication_pending' then
      update public.visits 
      set workflow_status = 'purchase_pending', updated_at = now()
      where id = old.visit_id;
    end if;
  end if;
  
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_visit_workflow_status_orders"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_role"("role_name" "public"."user_role_type", "brand_uuid" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.tenant_id = get_current_tenant_id()
        AND ur.role = role_name
        AND ur.is_active = true
        AND (brand_uuid IS NULL OR ur.brand_id = brand_uuid)
    );
END;
$$;


ALTER FUNCTION "public"."user_has_role"("role_name" "public"."user_role_type", "brand_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_campaign_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  brand_tenant_id uuid;
  created_by_tenant_id uuid;
  approved_by_tenant_id uuid;
  created_by_has_valid_role boolean := false;
  approved_by_has_valid_role boolean := false;
begin
  -- Validar que brand_id pertenezca al mismo tenant
  select tenant_id into brand_tenant_id
  from public.brands where id = new.brand_id and deleted_at is null;
  
  if brand_tenant_id is null then
    raise exception 'Marca no existe o está eliminada';
  end if;
  
  if brand_tenant_id != new.tenant_id then
    raise exception 'La marca no pertenece al tenant especificado';
  end if;
  
  -- Validar que created_by tenga rol brand_manager
  select exists (
    select 1 from public.user_roles ur
    where ur.user_profile_id = new.created_by
    and ur.role = 'brand_manager'
    and ur.status = 'active'
    and ur.deleted_at is null
  ) into created_by_has_valid_role;
  
  if not created_by_has_valid_role then
    raise exception 'created_by debe tener rol "brand_manager" activo';
  end if;
  
  select distinct ur.tenant_id into created_by_tenant_id
  from public.user_roles ur
  where ur.user_profile_id = new.created_by
  and ur.role = 'brand_manager'
  and ur.status = 'active'
  and ur.deleted_at is null
  and ur.tenant_id = new.tenant_id
  limit 1;
  
  if created_by_tenant_id != new.tenant_id then
    raise exception 'El creador no pertenece al tenant especificado';
  end if;
  
  -- Validar approved_by si no es null
  if new.approved_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.approved_by
      and ur.role in ('admin', 'supervisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into approved_by_has_valid_role;
    
    if not approved_by_has_valid_role then
      raise exception 'approved_by debe tener rol "admin" o "supervisor" activo';
    end if;
    
    select distinct ur.tenant_id into approved_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.approved_by
    and ur.role in ('admin', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
    and (ur.scope = 'global' or ur.tenant_id = new.tenant_id)
    limit 1;
    
    if approved_by_tenant_id is null and not exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.approved_by
      and ur.role = 'admin'
      and ur.scope = 'global'
      and ur.status = 'active'
      and ur.deleted_at is null
    ) then
      raise exception 'El aprobador no tiene permisos para este tenant';
    end if;
  end if;
  
  -- Validar aprobación requerida
  if new.status = 'approved' and new.approved_by is null then
    raise exception 'approved_by es obligatorio cuando status = approved';
  end if;
  
  -- Validar template name
  if new.is_template = true and (new.template_name is null or trim(new.template_name) = '') then
    raise exception 'template_name es obligatorio cuando is_template = true';
  end if;
  
  -- Validar fechas
  if new.end_date <= new.start_date then
    raise exception 'end_date debe ser posterior a start_date';
  end if;
  
  -- Validar presupuesto
  if new.budget_total is not null and new.budget_spent > new.budget_total then
    raise exception 'budget_spent no puede exceder budget_total';
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_campaign_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_client_brand_membership_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  client_tenant_id uuid;
  brand_tenant_id uuid;
begin
  -- Validar que client_id y brand_id sean consistentes con tenant_id
  select tenant_id into client_tenant_id
  from public.clients where id = new.client_id and deleted_at is null;
  
  select tenant_id into brand_tenant_id
  from public.brands where id = new.brand_id and deleted_at is null;
  
  if client_tenant_id is null then
    raise exception 'Cliente no existe o está eliminado';
  end if;
  
  if brand_tenant_id is null then
    raise exception 'Marca no existe o está eliminada';
  end if;
  
  if brand_tenant_id != new.tenant_id then
    raise exception 'La marca seleccionada no pertenece al tenant especificado';
  end if;
  
  -- Nota: No validamos client_tenant_id = tenant_id porque un cliente puede tener membresías en diferentes tenants
  
  -- Validar relación de puntos
  if new.points_balance > new.lifetime_points then
    raise exception 'points_balance (%) no puede ser mayor que lifetime_points (%)', 
      new.points_balance, new.lifetime_points;
  end if;
  
  -- Validar JSON structures
  if new.membership_preferences is not null then
    if jsonb_typeof(new.membership_preferences) != 'object' then
      raise exception 'membership_preferences debe ser un objeto JSON';
    end if;
  end if;
  
  if new.communication_preferences is not null then
    if jsonb_typeof(new.communication_preferences) != 'object' then
      raise exception 'communication_preferences debe ser un objeto JSON';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_client_brand_membership_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_client_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
declare
  zone_tenant_id uuid;
  market_tenant_id uuid;
  client_type_tenant_id uuid;
  commercial_structure_tenant_id uuid;
begin
  -- Validar que todas las referencias pertenezcan al mismo tenant
  select tenant_id into zone_tenant_id
  from public.zones where id = new.zone_id and deleted_at is null;
  
  select tenant_id into market_tenant_id
  from public.markets where id = new.market_id and deleted_at is null;
  
  select tenant_id into client_type_tenant_id
  from public.client_types where id = new.client_type_id and deleted_at is null;
  
  select tenant_id into commercial_structure_tenant_id
  from public.commercial_structures where id = new.commercial_structure_id and deleted_at is null;
  
  if zone_tenant_id != new.tenant_id then
    raise exception 'La zona seleccionada no pertenece al tenant';
  end if;
  
  if market_tenant_id != new.tenant_id then
    raise exception 'El mercado seleccionado no pertenece al tenant';
  end if;
  
  if client_type_tenant_id != new.tenant_id then
    raise exception 'El tipo de cliente seleccionado no pertenece al tenant';
  end if;
  
  if commercial_structure_tenant_id != new.tenant_id then
    raise exception 'La estructura comercial seleccionada no pertenece al tenant';
  end if;
  
  -- Validar formato de email
  if new.email is not null and new.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
    raise exception 'email debe tener un formato válido';
  end if;
  
  -- Heredar email de auth.users si user_id no es null y email está vacío
  if new.user_id is not null and new.email is null then
    select email into new.email from auth.users where id = new.user_id;
  end if;
  
  -- Validar frecuencias de herencia
  if new.visit_frequency_days is not null and new.assessment_frequency_days is not null then
    if new.assessment_frequency_days < new.visit_frequency_days then
      raise exception 'assessment_frequency_days debe ser mayor o igual que visit_frequency_days';
    end if;
  end if;
  
  -- Validar coordenadas usando la sintaxis correcta
  if new.coordinates is not null then
    if new.coordinates[0] < -180 or new.coordinates[0] > 180 then
      raise exception 'Longitud debe estar entre -180 y 180';
    end if;
    if new.coordinates[1] < -90 or new.coordinates[1] > 90 then
      raise exception 'Latitud debe estar entre -90 y 90';
    end if;
  end if;
  
  return new;
end;
$_$;


ALTER FUNCTION "public"."validate_client_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_client_invoice_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
declare
  client_tenant_id uuid;
begin
  -- Validar que client_id pertenezca al mismo tenant
  select tenant_id into client_tenant_id
  from public.clients where id = new.client_id and deleted_at is null;
  
  if client_tenant_id is null then
    raise exception 'Cliente no existe o está eliminado';
  end if;
  
  if client_tenant_id != new.tenant_id then
    raise exception 'El cliente no pertenece al tenant especificado';
  end if;
  
  -- Validar RFC según tipo de persona
  if new.person_type = 'fisica' then
    if not (new.rfc ~ '^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$' and length(new.rfc) = 13) then
      raise exception 'RFC de persona física debe tener formato: 4 letras + 6 números + 3 caracteres (13 total)';
    end if;
  elsif new.person_type = 'moral' then
    if not (new.rfc ~ '^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$' and length(new.rfc) = 12) then
      raise exception 'RFC de persona moral debe tener formato: 3 letras + 6 números + 3 caracteres (12 total)';
    end if;
  end if;
  
  -- Validar código postal mexicano
  if new.address_postal_code !~ '^[0-9]{5}$' then
    raise exception 'Código postal debe ser de 5 dígitos numéricos';
  end if;
  
  -- Validar formato de email
  if new.email_invoice is not null and new.email_invoice !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
    raise exception 'email_invoice debe tener un formato válido';
  end if;
  
  -- Validar códigos SAT específicos
  if new.cfdi_use not in ('G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'P01', 'S01', 'CP01', 'CN01') then
    raise exception 'cfdi_use debe ser un código SAT válido';
  end if;
  
  if new.payment_form not in ('01', '02', '03', '04', '05', '06', '08', '12', '13', '14', '15', '17', '23', '24', '25', '26', '27', '28', '29', '30', '99') then
    raise exception 'payment_form debe ser un código SAT válido';
  end if;
  
  if new.payment_method not in ('PUE', 'PPD') then
    raise exception 'payment_method debe ser PUE o PPD';
  end if;
  
  return new;
end;
$_$;


ALTER FUNCTION "public"."validate_client_invoice_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_client_tier_assignment_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  membership_tenant_id uuid;
  membership_brand_id uuid;
  tier_brand_id uuid;
  previous_tier_brand_id uuid;
  assigned_by_tenant_id uuid;
  assigned_by_has_valid_role boolean := false;
begin
  -- Obtener información de la membresía
  select cbm.tenant_id, cbm.brand_id into membership_tenant_id, membership_brand_id
  from public.client_brand_memberships cbm
  where cbm.id = new.client_brand_membership_id and cbm.deleted_at is null;
  
  if membership_tenant_id is null then
    raise exception 'Membresía de cliente no existe o está eliminada';
  end if;
  
  if membership_tenant_id != new.tenant_id then
    raise exception 'La membresía no pertenece al tenant especificado';
  end if;
  
  -- Validar que tier_id pertenezca a la misma marca que la membresía
  select brand_id into tier_brand_id
  from public.tiers where id = new.tier_id and deleted_at is null;
  
  if tier_brand_id is null then
    raise exception 'Tier no existe o está eliminado';
  end if;
  
  if tier_brand_id != membership_brand_id then
    raise exception 'El tier no pertenece a la misma marca que la membresía';
  end if;
  
  -- Validar previous_tier_id si no es null
  if new.previous_tier_id is not null then
    select brand_id into previous_tier_brand_id
    from public.tiers where id = new.previous_tier_id and deleted_at is null;
    
    if previous_tier_brand_id is null then
      raise exception 'Tier anterior no existe o está eliminado';
    end if;
    
    if previous_tier_brand_id != membership_brand_id then
      raise exception 'El tier anterior no pertenece a la misma marca que la membresía';
    end if;
  end if;
  
  -- Validar assigned_by cuando assignment_type = 'manual'
  if new.assignment_type = 'manual' then
    if new.assigned_by is null then
      raise exception 'assigned_by es obligatorio cuando assignment_type = manual';
    end if;
    
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.assigned_by
      and ur.role in ('admin', 'supervisor', 'brand_manager')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into assigned_by_has_valid_role;
    
    if not assigned_by_has_valid_role then
      raise exception 'assigned_by debe tener rol "admin", "supervisor" o "brand_manager" activo';
    end if;
    
    -- Validar que assigned_by pertenezca al tenant
    select distinct ur.tenant_id into assigned_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.assigned_by
    and ur.role in ('admin', 'supervisor', 'brand_manager')
    and ur.status = 'active'
    and ur.deleted_at is null
    and ur.tenant_id = new.tenant_id
    limit 1;
    
    if assigned_by_tenant_id != new.tenant_id then
      raise exception 'El asignador no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar fechas
  if new.effective_until is not null and new.effective_from > new.effective_until then
    raise exception 'effective_from debe ser anterior o igual a effective_until';
  end if;
  
  if new.evaluation_period_start is not null and new.evaluation_period_end is not null then
    if new.evaluation_period_start >= new.evaluation_period_end then
      raise exception 'evaluation_period_start debe ser anterior a evaluation_period_end';
    end if;
  end if;
  
  -- Validar estructura de metadata JSON
  if new.metadata is not null then
    if jsonb_typeof(new.metadata) != 'object' then
      raise exception 'metadata debe ser un objeto JSON';
    end if;
    
    -- Validar estructura de qualification_details si existe
    if new.metadata ? 'qualification_details' then
      if jsonb_typeof(new.metadata->'qualification_details') != 'object' then
        raise exception 'metadata.qualification_details debe ser un objeto';
      end if;
    end if;
    
    -- Validar estructura de performance_metrics si existe
    if new.metadata ? 'performance_metrics' then
      if jsonb_typeof(new.metadata->'performance_metrics') != 'object' then
        raise exception 'metadata.performance_metrics debe ser un objeto';
      end if;
    end if;
    
    -- Validar estructura de additional_factors si existe
    if new.metadata ? 'additional_factors' then
      if jsonb_typeof(new.metadata->'additional_factors') != 'object' then
        raise exception 'metadata.additional_factors debe ser un objeto';
      end if;
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_client_tier_assignment_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_client_type_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
begin
  -- Validar formato de code (mayúsculas, sin espacios, máximo 10 caracteres)
  if new.code !~ '^[A-Z]{1,10}$' then
    raise exception 'code debe ser de 1-10 caracteres en mayúsculas sin espacios';
  end if;
  
  -- Validar que assessment_frequency_days >= default_visit_frequency_days
  if new.assessment_frequency_days < new.default_visit_frequency_days then
    raise exception 'assessment_frequency_days (%) debe ser mayor o igual que default_visit_frequency_days (%)', 
      new.assessment_frequency_days, new.default_visit_frequency_days;
  end if;
  
  -- Validar characteristics JSON
  if new.characteristics is not null then
    if jsonb_typeof(new.characteristics) != 'object' then
      raise exception 'characteristics debe ser un objeto JSON';
    end if;
  end if;
  
  -- Validar kpi_targets JSON
  if new.kpi_targets is not null then
    if jsonb_typeof(new.kpi_targets) != 'object' then
      raise exception 'kpi_targets debe ser un objeto JSON';
    end if;
  end if;
  
  return new;
end;
$_$;


ALTER FUNCTION "public"."validate_client_type_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_commercial_structure_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
declare
  zone_item jsonb;
  market_item jsonb;
  zone_exists boolean;
  market_exists boolean;
begin
  -- Validar formato de code (mayúsculas, sin espacios, máximo 5 caracteres)
  if new.code !~ '^[A-Z]{1,5}$' then
    raise exception 'code debe ser de 1-5 caracteres en mayúsculas sin espacios';
  end if;
  
  -- Validar formato de email
  if new.contact_email is not null and new.contact_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
    raise exception 'contact_email debe tener un formato válido';
  end if;
  
  -- Validar coverage_zones JSON y que existan en la tabla zones
  if new.coverage_zones is not null then
    if jsonb_typeof(new.coverage_zones) != 'array' then
      raise exception 'coverage_zones debe ser un array JSON';
    end if;
    
    for zone_item in select * from jsonb_array_elements(new.coverage_zones) loop
      if jsonb_typeof(zone_item) != 'string' then
        raise exception 'Todos los elementos en coverage_zones deben ser strings';
      end if;
      
      -- Verificar que la zona existe y pertenece al mismo tenant
      select exists(
        select 1 from public.zones z 
        where z.id = (zone_item #>> '{}')::uuid 
        and z.tenant_id = new.tenant_id 
        and z.deleted_at is null
      ) into zone_exists;
      
      if not zone_exists then
        raise exception 'La zona % no existe o no pertenece al tenant', zone_item #>> '{}';
      end if;
    end loop;
  end if;
  
  -- Validar supported_markets JSON y que existan en la tabla markets
  if new.supported_markets is not null then
    if jsonb_typeof(new.supported_markets) != 'array' then
      raise exception 'supported_markets debe ser un array JSON';
    end if;
    
    for market_item in select * from jsonb_array_elements(new.supported_markets) loop
      if jsonb_typeof(market_item) != 'string' then
        raise exception 'Todos los elementos en supported_markets deben ser strings';
      end if;
      
      -- Verificar que el mercado existe y pertenece al mismo tenant
      select exists(
        select 1 from public.markets m 
        where m.id = (market_item #>> '{}')::uuid 
        and m.tenant_id = new.tenant_id 
        and m.deleted_at is null
      ) into market_exists;
      
      if not market_exists then
        raise exception 'El mercado % no existe o no pertenece al tenant', market_item #>> '{}';
      end if;
    end loop;
  end if;
  
  -- Validar commission_structure JSON
  if new.commission_structure is not null then
    if jsonb_typeof(new.commission_structure) != 'object' then
      raise exception 'commission_structure debe ser un objeto JSON';
    end if;
  end if;
  
  return new;
end;
$_$;


ALTER FUNCTION "public"."validate_commercial_structure_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_current_tier_assignment_unique"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.is_current = true then
    -- Desmarcar otras asignaciones como current para la misma membresía
    update public.client_tier_assignments
    set is_current = false, updated_at = now()
    where client_brand_membership_id = new.client_brand_membership_id
    and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    and is_current = true
    and deleted_at is null;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_current_tier_assignment_unique"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_default_tier_unique"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.is_default = true then
    -- Desmarcar otros tiers como default para la misma marca
    update public.tiers
    set is_default = false, updated_at = now()
    where brand_id = new.brand_id
    and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    and is_default = true
    and deleted_at is null;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_default_tier_unique"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_default_variant_unique"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.is_default = true then
    -- Verificar si ya existe otra variante por defecto para el mismo producto
    if exists (
      select 1 from public.product_variants
      where product_id = new.product_id
      and is_default = true
      and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and deleted_at is null
    ) then
      raise exception 'Producto ya tiene una variante por defecto. Solo se permite una variante por defecto por producto.';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_default_variant_unique"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_market_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
begin
  -- Validar que si hay target_volume_min y target_volume_max, min < max
  if new.target_volume_min is not null and new.target_volume_max is not null then
    if new.target_volume_min >= new.target_volume_max then
      raise exception 'target_volume_min debe ser menor que target_volume_max';
    end if;
  end if;
  
  -- Validar formato de code (mayúsculas, sin espacios, máximo 5 caracteres)
  if new.code !~ '^[A-Z]{1,5}$' then
    raise exception 'code debe ser de 1-5 caracteres en mayúsculas sin espacios';
  end if;
  
  return new;
end;
$_$;


ALTER FUNCTION "public"."validate_market_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_order_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  client_tenant_id uuid;
  brand_tenant_id uuid;
  commercial_structure_tenant_id uuid;
  invoice_data_client_id uuid;
  assigned_to_tenant_id uuid;
  cancelled_by_tenant_id uuid;
  assigned_to_has_valid_role boolean := false;
  cancelled_by_has_valid_role boolean := false;
begin
  -- Validar que client_id pertenezca al mismo tenant
  select tenant_id into client_tenant_id
  from public.clients where id = new.client_id and deleted_at is null;
  
  if client_tenant_id is null then
    raise exception 'Cliente no existe o está eliminado';
  end if;
  
  if client_tenant_id != new.tenant_id then
    raise exception 'El cliente no pertenece al tenant especificado';
  end if;
  
  -- Validar que brand_id pertenezca al mismo tenant
  select tenant_id into brand_tenant_id
  from public.brands where id = new.brand_id and deleted_at is null;
  
  if brand_tenant_id is null then
    raise exception 'Marca no existe o está eliminada';
  end if;
  
  if brand_tenant_id != new.tenant_id then
    raise exception 'La marca no pertenece al tenant especificado';
  end if;
  
  -- Validar que commercial_structure_id pertenezca al mismo tenant
  select tenant_id into commercial_structure_tenant_id
  from public.commercial_structures where id = new.commercial_structure_id and deleted_at is null;
  
  if commercial_structure_tenant_id is null then
    raise exception 'Estructura comercial no existe o está eliminada';
  end if;
  
  if commercial_structure_tenant_id != new.tenant_id then
    raise exception 'La estructura comercial no pertenece al tenant especificado';
  end if;
  
  -- Validar client_invoice_data_id si no es null
  if new.client_invoice_data_id is not null then
    select client_id into invoice_data_client_id
    from public.client_invoice_data where id = new.client_invoice_data_id and deleted_at is null;
    
    if invoice_data_client_id is null then
      raise exception 'Datos de facturación no existen o están eliminados';
    end if;
    
    if invoice_data_client_id != new.client_id then
      raise exception 'Los datos de facturación no pertenecen al cliente especificado';
    end if;
  end if;
  
  -- Validar assigned_to si no es null
  if new.assigned_to is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.assigned_to
      and ur.role in ('advisor', 'supervisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into assigned_to_has_valid_role;
    
    if not assigned_to_has_valid_role then
      raise exception 'assigned_to debe tener rol "advisor" o "supervisor" activo';
    end if;
    
    select distinct ur.tenant_id into assigned_to_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.assigned_to
    and ur.role in ('advisor', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
    and ur.tenant_id = new.tenant_id
    limit 1;
    
    if assigned_to_tenant_id != new.tenant_id then
      raise exception 'El usuario asignado no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar cancelled_by si no es null
  if new.cancelled_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.cancelled_by
      and ur.role in ('admin', 'supervisor', 'advisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into cancelled_by_has_valid_role;
    
    if not cancelled_by_has_valid_role then
      raise exception 'cancelled_by debe tener rol válido activo';
    end if;
    
    select distinct ur.tenant_id into cancelled_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.cancelled_by
    and ur.role in ('admin', 'supervisor', 'advisor')
    and ur.status = 'active'
    and ur.deleted_at is null
    and (ur.scope = 'global' or ur.tenant_id = new.tenant_id)
    limit 1;
    
    if cancelled_by_tenant_id is null and not exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.cancelled_by
      and ur.role = 'admin'
      and ur.scope = 'global'
      and ur.status = 'active'
      and ur.deleted_at is null
    ) then
      raise exception 'El cancelador no tiene permisos para este tenant';
    end if;
  end if;
  
  -- Validar facturación requerida
  if new.invoice_required = true and new.client_invoice_data_id is null then
    raise exception 'client_invoice_data_id es obligatorio cuando invoice_required = true';
  end if;
  
  -- Validar cancelación
  if new.order_status = 'cancelled' and (new.cancellation_reason is null or trim(new.cancellation_reason) = '') then
    raise exception 'cancellation_reason es obligatorio cuando order_status = cancelled';
  end if;
  
  -- Validar fechas de entrega en secuencia lógica
  if new.requested_delivery_date is not null and new.requested_delivery_date <= new.order_date then
    raise exception 'requested_delivery_date debe ser posterior a order_date';
  end if;
  
  if new.confirmed_delivery_date is not null then
    if new.confirmed_delivery_date < new.order_date then
      raise exception 'confirmed_delivery_date debe ser posterior o igual a order_date';
    end if;
    
    if new.requested_delivery_date is not null and new.confirmed_delivery_date > (new.requested_delivery_date + interval '30 days') then
      raise exception 'confirmed_delivery_date debe estar dentro de 30 días de requested_delivery_date';
    end if;
  end if;
  
  if new.actual_delivery_date is not null and new.actual_delivery_date < new.order_date then
    raise exception 'actual_delivery_date debe ser posterior o igual a order_date';
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_order_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_order_item_calculations"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    expected_subtotal DECIMAL(12,2);
    expected_line_total DECIMAL(12,2);
BEGIN
    -- Calcular subtotal esperado
    expected_subtotal := NEW.quantity_ordered * NEW.unit_price;
    
    -- Validar subtotal (con tolerancia de 0.01 por redondeos)
    IF ABS(NEW.line_subtotal - expected_subtotal) > 0.01 THEN
        RAISE EXCEPTION 'line_subtotal (%) does not match quantity_ordered × unit_price (%)',
            NEW.line_subtotal, expected_subtotal;
    END IF;
    
    -- Calcular total esperado (subtotal - descuento + impuesto)
    expected_line_total := NEW.line_subtotal - NEW.line_discount_amount + NEW.tax_amount;
    
    -- Validar line_total (con tolerancia de 0.01 por redondeos)
    IF ABS(NEW.line_total - expected_line_total) > 0.01 THEN
        RAISE EXCEPTION 'line_total (%) does not match subtotal - discount + tax (%)',
            NEW.line_total, expected_line_total;
    END IF;
    
    -- Validar que el descuento no exceda el subtotal
    IF NEW.line_discount_amount > NEW.line_subtotal THEN
        RAISE EXCEPTION 'line_discount_amount (%) cannot exceed line_subtotal (%)',
            NEW.line_discount_amount, NEW.line_subtotal;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_order_item_calculations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_order_item_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Validar que metadata sea un objeto JSON válido
    IF NEW.metadata IS NOT NULL AND jsonb_typeof(NEW.metadata) != 'object' THEN
        RAISE EXCEPTION 'metadata must be a JSON object, got %', jsonb_typeof(NEW.metadata);
    END IF;
    
    -- Validar estructura de procurement si existe
    IF NEW.metadata ? 'procurement' THEN
        IF jsonb_typeof(NEW.metadata->'procurement') != 'object' THEN
            RAISE EXCEPTION 'metadata.procurement must be an object';
        END IF;
    END IF;
    
    -- Validar estructura de storage_requirements si existe
    IF NEW.metadata ? 'storage_requirements' THEN
        IF jsonb_typeof(NEW.metadata->'storage_requirements') != 'object' THEN
            RAISE EXCEPTION 'metadata.storage_requirements must be an object';
        END IF;
    END IF;
    
    -- Validar estructura de nutritional_info si existe
    IF NEW.metadata ? 'nutritional_info' THEN
        IF jsonb_typeof(NEW.metadata->'nutritional_info') != 'object' THEN
            RAISE EXCEPTION 'metadata.nutritional_info must be an object';
        END IF;
    END IF;
    
    -- Validar estructura de client_preferences si existe
    IF NEW.metadata ? 'client_preferences' THEN
        IF jsonb_typeof(NEW.metadata->'client_preferences') != 'object' THEN
            RAISE EXCEPTION 'metadata.client_preferences must be an object';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_order_item_metadata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_order_item_tenant_consistency"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    order_tenant_id UUID;
    product_tenant_id UUID;
    variant_product_id UUID;
    substitute_variant_product_id UUID;
BEGIN
    -- Validar que el order pertenece al mismo tenant
    SELECT tenant_id INTO order_tenant_id
    FROM public.orders
    WHERE id = NEW.order_id AND deleted_at IS NULL;
    
    IF order_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Order % not found or deleted', NEW.order_id;
    END IF;
    
    IF order_tenant_id != NEW.tenant_id THEN
        RAISE EXCEPTION 'Tenant mismatch: order belongs to tenant %, item specifies tenant %',
            order_tenant_id, NEW.tenant_id;
    END IF;
    
    -- Validar que el producto pertenece al mismo tenant
    SELECT tenant_id INTO product_tenant_id
    FROM public.products
    WHERE id = NEW.product_id AND deleted_at IS NULL;
    
    IF product_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Product % not found or deleted', NEW.product_id;
    END IF;
    
    IF product_tenant_id != NEW.tenant_id THEN
        RAISE EXCEPTION 'Tenant mismatch: product belongs to tenant %, item specifies tenant %',
            product_tenant_id, NEW.tenant_id;
    END IF;
    
    -- Validar que la variante pertenece al producto especificado
    IF NEW.product_variant_id IS NOT NULL THEN
        SELECT product_id INTO variant_product_id
        FROM public.product_variants
        WHERE id = NEW.product_variant_id AND deleted_at IS NULL;
        
        IF variant_product_id IS NULL THEN
            RAISE EXCEPTION 'Product variant % not found or deleted', NEW.product_variant_id;
        END IF;
        
        IF variant_product_id != NEW.product_id THEN
            RAISE EXCEPTION 'Variant % does not belong to product %',
                NEW.product_variant_id, NEW.product_id;
        END IF;
    END IF;
    
    -- Validar que la variante sustituta pertenece al producto sustituto
    IF NEW.substitute_variant_id IS NOT NULL AND NEW.substitute_product_id IS NOT NULL THEN
        SELECT product_id INTO substitute_variant_product_id
        FROM public.product_variants
        WHERE id = NEW.substitute_variant_id AND deleted_at IS NULL;
        
        IF substitute_variant_product_id IS NULL THEN
            RAISE EXCEPTION 'Substitute variant % not found or deleted', NEW.substitute_variant_id;
        END IF;
        
        IF substitute_variant_product_id != NEW.substitute_product_id THEN
            RAISE EXCEPTION 'Substitute variant % does not belong to substitute product %',
                NEW.substitute_variant_id, NEW.substitute_product_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_order_item_tenant_consistency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_points_transaction_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  membership_tenant_id uuid;
  processed_by_tenant_id uuid;
  approved_by_tenant_id uuid;
  processed_by_has_valid_role boolean := false;
  approved_by_has_valid_role boolean := false;
  reversal_transaction_points decimal(10,2);
  reversal_already_reversed boolean := false;
begin
  -- Validar que client_brand_membership_id pertenezca al tenant
  select tenant_id into membership_tenant_id
  from public.client_brand_memberships
  where id = new.client_brand_membership_id and deleted_at is null;
  
  if membership_tenant_id is null then
    raise exception 'Membresía de cliente no existe o está eliminada';
  end if;
  
  if membership_tenant_id != new.tenant_id then
    raise exception 'La membresía no pertenece al tenant especificado';
  end if;
  
  -- Validar processed_by si no es null
  if new.processed_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.processed_by
      and ur.role in ('admin', 'supervisor', 'brand_manager', 'advisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into processed_by_has_valid_role;
    
    if not processed_by_has_valid_role then
      raise exception 'processed_by debe tener rol válido activo';
    end if;
    
    select distinct ur.tenant_id into processed_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.processed_by
    and ur.role in ('admin', 'supervisor', 'brand_manager', 'advisor')
    and ur.status = 'active'
    and ur.deleted_at is null
    and ur.tenant_id = new.tenant_id
    limit 1;
    
    if processed_by_tenant_id != new.tenant_id then
      raise exception 'El procesador no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar approved_by si no es null
  if new.approved_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.approved_by
      and ur.role in ('admin', 'supervisor', 'brand_manager')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into approved_by_has_valid_role;
    
    if not approved_by_has_valid_role then
      raise exception 'approved_by debe tener rol de aprobación válido activo';
    end if;
    
    select distinct ur.tenant_id into approved_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.approved_by
    and ur.role in ('admin', 'supervisor', 'brand_manager')
    and ur.status = 'active'
    and ur.deleted_at is null
    and ur.tenant_id = new.tenant_id
    limit 1;
    
    if approved_by_tenant_id != new.tenant_id then
      raise exception 'El aprobador no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar aprobación requerida
  if new.approval_required = true and new.approved_by is null then
    raise exception 'approved_by es obligatorio cuando approval_required = true';
  end if;
  
  -- Validar fechas
  if new.transaction_date > current_date then
    raise exception 'transaction_date no puede ser futuro';
  end if;
  
  if new.expiration_date is not null and new.expiration_date <= new.transaction_date then
    raise exception 'expiration_date debe ser posterior a transaction_date';
  end if;
  
  if new.expired_date is not null and new.expiration_date is not null and new.expired_date < new.expiration_date then
    raise exception 'expired_date debe ser posterior o igual a expiration_date';
  end if;
  
  -- Validar reversas
  if new.reversal_of is not null then
    -- Verificar que la transacción a reversar existe y tiene puntos opuestos
    select points into reversal_transaction_points
    from public.points_transactions
    where id = new.reversal_of and deleted_at is null;
    
    if reversal_transaction_points is null then
      raise exception 'La transacción a reversar no existe o está eliminada';
    end if;
    
    if new.points != (-1 * reversal_transaction_points) then
      raise exception 'Los puntos de reversa deben ser exactamente opuestos a la transacción original';
    end if;
    
    -- Verificar que la transacción no ha sido reversada antes
    select exists (
      select 1 from public.points_transactions
      where reversal_of = new.reversal_of
      and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and deleted_at is null
    ) into reversal_already_reversed;
    
    if reversal_already_reversed then
      raise exception 'La transacción ya ha sido reversada anteriormente';
    end if;
  end if;
  
  -- Validar que no se puede reversar a sí misma
  if new.reversal_of = new.id or new.reversed_by = new.id then
    raise exception 'Una transacción no puede ser reversa de sí misma';
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_points_transaction_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_preferred_invoice_data_unique"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.is_preferred = true then
    -- Desmarcar otros registros como preferidos para el mismo cliente
    update public.client_invoice_data
    set is_preferred = false, updated_at = now()
    where client_id = new.client_id
    and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    and is_preferred = true
    and deleted_at is null;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_preferred_invoice_data_unique"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_primary_brand_unique"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.is_primary_brand = true then
    -- Verificar si ya existe otra membresía primaria para el mismo cliente
    if exists (
      select 1 from public.client_brand_memberships
      where client_id = new.client_id
      and is_primary_brand = true
      and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and deleted_at is null
    ) then
      raise exception 'Cliente ya tiene una marca primaria asignada. Solo se permite una marca primaria por cliente.';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_primary_brand_unique"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_product_category_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
declare
  parent_level integer;
  parent_tenant_id uuid;
  parent_brand_id uuid;
  brand_tenant_id uuid;
  current_category_id uuid;
  depth integer := 0;
  max_depth integer := 10;
begin
  -- Validar que brand_id pertenezca al mismo tenant si no es null
  if new.brand_id is not null then
    select tenant_id into brand_tenant_id
    from public.brands
    where id = new.brand_id and deleted_at is null;
    
    if brand_tenant_id is null then
      raise exception 'Marca no existe o está eliminada';
    end if;
    
    if brand_tenant_id != new.tenant_id then
      raise exception 'La marca seleccionada no pertenece al tenant';
    end if;
  end if;
  
  -- Validar jerarquía si hay parent_category_id
  if new.parent_category_id is not null then
    select category_level, tenant_id, brand_id into parent_level, parent_tenant_id, parent_brand_id
    from public.product_categories
    where id = new.parent_category_id and deleted_at is null;
    
    if parent_level is null then
      raise exception 'Categoría padre no existe o está eliminada';
    end if;
    
    -- Validar que la categoría padre pertenezca al mismo tenant
    if parent_tenant_id != new.tenant_id then
      raise exception 'Categoría padre debe pertenecer al mismo tenant';
    end if;
    
    -- Validar consistencia de brand: si padre tiene brand específico, hijo debe tener el mismo o null
    if parent_brand_id is not null and new.brand_id is not null and parent_brand_id != new.brand_id then
      raise exception 'Si la categoría padre tiene una marca específica, la subcategoría debe tener la misma marca o ser global (null)';
    end if;
    
    -- Validar que category_level sea consistente (padre + 1)
    if new.category_level != (parent_level + 1) then
      raise exception 'category_level debe ser % (parent_level + 1), pero se proporcionó %', 
        parent_level + 1, new.category_level;
    end if;
    
    -- Prevenir ciclos en la jerarquía
    current_category_id := new.parent_category_id;
    while current_category_id is not null and depth < max_depth loop
      if current_category_id = new.id then
        raise exception 'Ciclo detectado en jerarquía de categorías';
      end if;
      
      select parent_category_id into current_category_id
      from public.product_categories
      where id = current_category_id and deleted_at is null;
      
      depth := depth + 1;
    end loop;
    
    if depth >= max_depth then
      raise exception 'Jerarquía de categorías demasiado profunda';
    end if;
  else
    -- Si no hay padre, debe ser level 1
    if new.category_level != 1 then
      raise exception 'Categorías sin padre deben tener category_level = 1';
    end if;
  end if;
  
  -- Validar formato de color hex
  if new.color_hex is not null and new.color_hex !~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' then
    raise exception 'color_hex debe tener formato hex válido (#RGB o #RRGGBB)';
  end if;
  
  -- Validar characteristics JSON
  if new.characteristics is not null then
    if jsonb_typeof(new.characteristics) != 'object' then
      raise exception 'characteristics debe ser un objeto JSON';
    end if;
  end if;
  
  return new;
end;
$_$;


ALTER FUNCTION "public"."validate_product_category_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_product_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  brand_tenant_id uuid;
  category_tenant_id uuid;
  category_brand_id uuid;
begin
  -- Validar que brand_id pertenezca al mismo tenant
  select tenant_id into brand_tenant_id
  from public.brands where id = new.brand_id and deleted_at is null;
  
  if brand_tenant_id is null then
    raise exception 'Marca no existe o está eliminada';
  end if;
  
  if brand_tenant_id != new.tenant_id then
    raise exception 'La marca seleccionada no pertenece al tenant';
  end if;
  
  -- Validar que category_id sea compatible con brand_id
  select tenant_id, brand_id into category_tenant_id, category_brand_id
  from public.product_categories where id = new.category_id and deleted_at is null;
  
  if category_tenant_id is null then
    raise exception 'Categoría no existe o está eliminada';
  end if;
  
  if category_tenant_id != new.tenant_id then
    raise exception 'La categoría seleccionada no pertenece al tenant';
  end if;
  
  -- La categoría debe ser específica de la marca o global del tenant
  if category_brand_id is not null and category_brand_id != new.brand_id then
    raise exception 'La categoría debe ser específica de la marca o global del tenant';
  end if;
  
  -- Validar relaciones de stock
  if new.maximum_stock is not null and new.minimum_stock > new.maximum_stock then
    raise exception 'minimum_stock (%) no puede ser mayor que maximum_stock (%)', 
      new.minimum_stock, new.maximum_stock;
  end if;
  
  -- Validar fechas
  if new.launch_date is not null and new.discontinue_date is not null then
    if new.launch_date >= new.discontinue_date then
      raise exception 'launch_date debe ser anterior a discontinue_date';
    end if;
  end if;
  
  -- Validar estructuras JSON
  if new.dimensions is not null then
    if jsonb_typeof(new.dimensions) != 'object' then
      raise exception 'dimensions debe ser un objeto JSON';
    end if;
  end if;
  
  if new.specifications is not null then
    if jsonb_typeof(new.specifications) != 'object' then
      raise exception 'specifications debe ser un objeto JSON';
    end if;
  end if;
  
  if new.gallery_urls is not null then
    if jsonb_typeof(new.gallery_urls) != 'array' then
      raise exception 'gallery_urls debe ser un array JSON';
    end if;
  end if;
  
  if new.marketing_tags is not null then
    if jsonb_typeof(new.marketing_tags) != 'array' then
      raise exception 'marketing_tags debe ser un array JSON';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_product_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_product_variant_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  product_tenant_id uuid;
begin
  -- Validar que product_id pertenezca al mismo tenant
  select tenant_id into product_tenant_id
  from public.products where id = new.product_id and deleted_at is null;
  
  if product_tenant_id is null then
    raise exception 'Producto no existe o está eliminado';
  end if;
  
  if product_tenant_id != new.tenant_id then
    raise exception 'El producto seleccionado no pertenece al tenant';
  end if;
  
  -- Validar fechas
  if new.launch_date is not null and new.discontinue_date is not null then
    if new.launch_date >= new.discontinue_date then
      raise exception 'launch_date debe ser anterior a discontinue_date';
    end if;
  end if;
  
  -- Validar estructuras JSON
  if new.dimensions is not null then
    if jsonb_typeof(new.dimensions) != 'object' then
      raise exception 'dimensions debe ser un objeto JSON';
    end if;
  end if;
  
  if new.case_dimensions is not null then
    if jsonb_typeof(new.case_dimensions) != 'object' then
      raise exception 'case_dimensions debe ser un objeto JSON';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_product_variant_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_promotion_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  brand_tenant_id uuid;
  campaign_tenant_id uuid;
  created_by_tenant_id uuid;
  approved_by_tenant_id uuid;
  created_by_has_valid_role boolean := false;
  approved_by_has_valid_role boolean := false;
begin
  -- Validar que brand_id pertenezca al mismo tenant
  select tenant_id into brand_tenant_id
  from public.brands where id = new.brand_id and deleted_at is null;
  
  if brand_tenant_id is null then
    raise exception 'Marca no existe o está eliminada';
  end if;
  
  if brand_tenant_id != new.tenant_id then
    raise exception 'La marca no pertenece al tenant especificado';
  end if;
  
  -- Validar campaign_id si no es null
  if new.campaign_id is not null then
    select tenant_id into campaign_tenant_id
    from public.campaigns where id = new.campaign_id and deleted_at is null;
    
    if campaign_tenant_id is null then
      raise exception 'Campaña no existe o está eliminada';
    end if;
    
    if campaign_tenant_id != new.tenant_id then
      raise exception 'La campaña no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar que created_by tenga rol brand_manager
  select exists (
    select 1 from public.user_roles ur
    where ur.user_profile_id = new.created_by
    and ur.role = 'brand_manager'
    and ur.status = 'active'
    and ur.deleted_at is null
  ) into created_by_has_valid_role;
  
  if not created_by_has_valid_role then
    raise exception 'created_by debe tener rol "brand_manager" activo';
  end if;
  
  select distinct ur.tenant_id into created_by_tenant_id
  from public.user_roles ur
  where ur.user_profile_id = new.created_by
  and ur.role = 'brand_manager'
  and ur.status = 'active'
  and ur.deleted_at is null
  and ur.tenant_id = new.tenant_id
  limit 1;
  
  if created_by_tenant_id != new.tenant_id then
    raise exception 'El creador no pertenece al tenant especificado';
  end if;
  
  -- Validar approved_by si no es null
  if new.approved_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.approved_by
      and ur.role in ('admin', 'supervisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into approved_by_has_valid_role;
    
    if not approved_by_has_valid_role then
      raise exception 'approved_by debe tener rol "admin" o "supervisor" activo';
    end if;
    
    select distinct ur.tenant_id into approved_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.approved_by
    and ur.role in ('admin', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
    and (ur.scope = 'global' or ur.tenant_id = new.tenant_id)
    limit 1;
    
    if approved_by_tenant_id is null and not exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.approved_by
      and ur.role = 'admin'
      and ur.scope = 'global'
      and ur.status = 'active'
      and ur.deleted_at is null
    ) then
      raise exception 'El aprobador no tiene permisos para este tenant';
    end if;
  end if;
  
  -- Validar aprobación requerida
  if new.status = 'approved' and new.approved_by is null then
    raise exception 'approved_by es obligatorio cuando status = approved';
  end if;
  
  -- Validar código promocional requerido
  if new.requires_code = true and (new.promo_code is null or trim(new.promo_code) = '') then
    raise exception 'promo_code es obligatorio cuando requires_code = true';
  end if;
  
  -- Validar fechas
  if new.end_date <= new.start_date then
    raise exception 'end_date debe ser posterior a start_date';
  end if;
  
  if new.start_time is not null and new.end_time is not null and new.end_time <= new.start_time then
    raise exception 'end_time debe ser posterior a start_time';
  end if;
  
  -- Validar presupuesto
  if new.budget_allocated is not null and new.budget_spent > new.budget_allocated then
    raise exception 'budget_spent no puede exceder budget_allocated';
  end if;
  
  -- Validar campos requeridos según promotion_type
  case new.promotion_type
    when 'discount_percentage' then
      if new.discount_percentage is null then
        raise exception 'discount_percentage es requerido para promotion_type "discount_percentage"';
      end if;
      
    when 'discount_amount' then
      if new.discount_amount is null then
        raise exception 'discount_amount es requerido para promotion_type "discount_amount"';
      end if;
      
    when 'buy_x_get_y' then
      if new.buy_quantity is null or new.get_quantity is null then
        raise exception 'buy_quantity y get_quantity son requeridos para promotion_type "buy_x_get_y"';
      end if;
      
    when 'volume_discount' then
      if new.discount_percentage is null and new.discount_amount is null then
        raise exception 'discount_percentage o discount_amount es requerido para promotion_type "volume_discount"';
      end if;
      
    when 'points_multiplier' then
      if new.points_multiplier <= 1.00 then
        raise exception 'points_multiplier debe ser mayor que 1.00 para promotion_type "points_multiplier"';
      end if;
      
    when 'cashback' then
      if new.discount_amount is null and new.discount_percentage is null then
        raise exception 'discount_amount o discount_percentage es requerido para promotion_type "cashback"';
      end if;
      
    else
      -- Para otros tipos no hay validaciones adicionales por ahora
  end case;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_promotion_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_promotion_redemption_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  membership_tenant_id uuid;
  promotion_tenant_id uuid;
  promotion_type_db text;
  applied_by_tenant_id uuid;
  validated_by_tenant_id uuid;
  reversed_by_tenant_id uuid;
  applied_by_has_valid_role boolean := false;
  validated_by_has_valid_role boolean := false;
  reversed_by_has_valid_role boolean := false;
  order_exists boolean := false;
begin
  -- Validar que client_brand_membership_id pertenezca al tenant
  select tenant_id into membership_tenant_id
  from public.client_brand_memberships
  where id = new.client_brand_membership_id and deleted_at is null;
  
  if membership_tenant_id is null then
    raise exception 'Membresía de cliente no existe o está eliminada';
  end if;
  
  if membership_tenant_id != new.tenant_id then
    raise exception 'La membresía no pertenece al tenant especificado';
  end if;
  
  -- Validar que promotion_id pertenezca al tenant y obtener su tipo
  select tenant_id, promotion_type into promotion_tenant_id, promotion_type_db
  from public.promotions where id = new.promotion_id and deleted_at is null;
  
  if promotion_tenant_id is null then
    raise exception 'Promoción no existe o está eliminada';
  end if;
  
  if promotion_tenant_id != new.tenant_id then
    raise exception 'La promoción no pertenece al tenant especificado';
  end if;
  
  -- Validar que promotion_type_applied coincida con el tipo de la promoción
  if promotion_type_db::text != new.promotion_type_applied::text then
    raise exception 'promotion_type_applied (%) no coincide con el tipo de promoción (%) en la base de datos', 
      new.promotion_type_applied, promotion_type_db;
  end if;
  
  -- Validar que order_id exista según order_type
  if new.order_type = 'independent_order' then
    select exists (
      select 1 from public.orders
      where public_id = new.order_id and tenant_id = new.tenant_id and deleted_at is null
    ) into order_exists;
  elsif new.order_type = 'visit_order' then
    select exists (
      select 1 from public.visit_orders
      where public_id = new.order_id and tenant_id = new.tenant_id and deleted_at is null
    ) into order_exists;
  end if;
  
  if not order_exists then
    raise exception 'Pedido con ID % no existe en la tabla correspondiente al tipo %', new.order_id, new.order_type;
  end if;
  
  -- Validar applied_by si no es null
  if new.applied_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.applied_by
      and ur.role in ('advisor', 'supervisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into applied_by_has_valid_role;
    
    if not applied_by_has_valid_role then
      raise exception 'applied_by debe tener rol "advisor" o "supervisor" activo';
    end if;
    
    select distinct ur.tenant_id into applied_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.applied_by
    and ur.role in ('advisor', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
    and ur.tenant_id = new.tenant_id
    limit 1;
    
    if applied_by_tenant_id != new.tenant_id then
      raise exception 'El aplicador no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar validated_by si no es null
  if new.validated_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.validated_by
      and ur.role in ('supervisor', 'admin')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into validated_by_has_valid_role;
    
    if not validated_by_has_valid_role then
      raise exception 'validated_by debe tener rol "supervisor" o "admin" activo';
    end if;
    
    select distinct ur.tenant_id into validated_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.validated_by
    and ur.role in ('supervisor', 'admin')
    and ur.status = 'active'
    and ur.deleted_at is null
    and (ur.scope = 'global' or ur.tenant_id = new.tenant_id)
    limit 1;
    
    if validated_by_tenant_id is null and not exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.validated_by
      and ur.role = 'admin'
      and ur.scope = 'global'
      and ur.status = 'active'
      and ur.deleted_at is null
    ) then
      raise exception 'El validador no tiene permisos para este tenant';
    end if;
  end if;
  
  -- Validar reversed_by si no es null
  if new.reversed_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.reversed_by
      and ur.role in ('supervisor', 'admin')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into reversed_by_has_valid_role;
    
    if not reversed_by_has_valid_role then
      raise exception 'reversed_by debe tener rol "supervisor" o "admin" activo';
    end if;
    
    select distinct ur.tenant_id into reversed_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.reversed_by
    and ur.role in ('supervisor', 'admin')
    and ur.status = 'active'
    and ur.deleted_at is null
    and (ur.scope = 'global' or ur.tenant_id = new.tenant_id)
    limit 1;
    
    if reversed_by_tenant_id is null and not exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.reversed_by
      and ur.role = 'admin'
      and ur.scope = 'global'
      and ur.status = 'active'
      and ur.deleted_at is null
    ) then
      raise exception 'El reversor no tiene permisos para este tenant';
    end if;
  end if;
  
  -- Validar validated_by obligatorio
  if new.validation_required = true and new.redemption_status = 'validated' and new.validated_by is null then
    raise exception 'validated_by es obligatorio cuando validation_required = true y redemption_status = validated';
  end if;
  
  -- Validar reversal_reason obligatorio
  if new.redemption_status = 'reversed' and (new.reversal_reason is null or trim(new.reversal_reason) = '') then
    raise exception 'reversal_reason es obligatorio cuando redemption_status = reversed';
  end if;
  
  -- Validar estructuras JSON específicas
  if new.rules_validation is not null then
    if jsonb_typeof(new.rules_validation) != 'object' then
      raise exception 'rules_validation debe ser un objeto JSON';
    end if;
    
    -- Validar estructura de segment_rules_met si existe
    if new.rules_validation ? 'segment_rules_met' then
      if jsonb_typeof(new.rules_validation->'segment_rules_met') != 'object' then
        raise exception 'rules_validation.segment_rules_met debe ser un objeto';
      end if;
    end if;
    
    -- Validar estructura de usage_limits si existe
    if new.rules_validation ? 'usage_limits' then
      if jsonb_typeof(new.rules_validation->'usage_limits') != 'object' then
        raise exception 'rules_validation.usage_limits debe ser un objeto';
      end if;
    end if;
  end if;
  
  -- Validar metadata según promotion_type_applied
  if new.metadata is not null then
    if jsonb_typeof(new.metadata) != 'object' then
      raise exception 'metadata debe ser un objeto JSON';
    end if;
    
    case new.promotion_type_applied
      when 'discount_percentage', 'discount_amount' then
        if new.metadata ? 'discount_details' then
          if jsonb_typeof(new.metadata->'discount_details') != 'object' then
            raise exception 'metadata.discount_details debe ser un objeto para promociones de descuento';
          end if;
        end if;
        
      when 'buy_x_get_y' then
        if new.metadata ? 'bxgy_details' then
          if jsonb_typeof(new.metadata->'bxgy_details') != 'object' then
            raise exception 'metadata.bxgy_details debe ser un objeto para promociones buy_x_get_y';
          end if;
        end if;
        
      when 'points_multiplier' then
        if new.metadata ? 'points_details' then
          if jsonb_typeof(new.metadata->'points_details') != 'object' then
            raise exception 'metadata.points_details debe ser un objeto para promociones de multiplicador de puntos';
          end if;
        end if;
    end case;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_promotion_redemption_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_promotion_rule_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  promotion_tenant_id uuid;
  created_by_tenant_id uuid;
  created_by_has_valid_role boolean := false;
  target_field jsonb;
  included_ids jsonb;
  excluded_ids jsonb;
  id_item text;
begin
  -- Validar que promotion_id pertenezca al mismo tenant
  select tenant_id into promotion_tenant_id
  from public.promotions where id = new.promotion_id and deleted_at is null;
  
  if promotion_tenant_id is null then
    raise exception 'Promoción no existe o está eliminada';
  end if;
  
  if promotion_tenant_id != new.tenant_id then
    raise exception 'La promoción no pertenece al tenant especificado';
  end if;
  
  -- Validar que created_by tenga rol brand_manager
  select exists (
    select 1 from public.user_roles ur
    where ur.user_profile_id = new.created_by
    and ur.role = 'brand_manager'
    and ur.status = 'active'
    and ur.deleted_at is null
  ) into created_by_has_valid_role;
  
  if not created_by_has_valid_role then
    raise exception 'created_by debe tener rol "brand_manager" activo';
  end if;
  
  select distinct ur.tenant_id into created_by_tenant_id
  from public.user_roles ur
  where ur.user_profile_id = new.created_by
  and ur.role = 'brand_manager'
  and ur.status = 'active'
  and ur.deleted_at is null
  and ur.tenant_id = new.tenant_id
  limit 1;
  
  if created_by_tenant_id != new.tenant_id then
    raise exception 'El creador no pertenece al tenant especificado';
  end if;
  
  -- Validar fechas efectivas
  if new.effective_until is not null and new.effective_from is not null and new.effective_until <= new.effective_from then
    raise exception 'effective_until debe ser posterior a effective_from';
  end if;
  
  -- Validar alcances
  if new.estimated_reach is not null and new.estimated_reach < 0 then
    raise exception 'estimated_reach debe ser mayor o igual que 0';
  end if;
  
  if new.actual_reach is not null and new.actual_reach < 0 then
    raise exception 'actual_reach debe ser mayor o igual que 0';
  end if;
  
  -- Validar que al menos un campo target tenga contenido cuando apply_to_all = false
  if new.apply_to_all = false then
    if coalesce(
      new.target_zones, new.target_states, new.target_markets, 
      new.target_commercial_structures, new.target_client_types, 
      new.target_clients, new.target_products, new.target_categories, 
      new.target_tiers, new.custom_conditions
    ) is null then
      raise exception 'Al menos un campo target debe tener contenido cuando apply_to_all = false';
    end if;
  end if;
  
  -- Validar estructura específica de campos target
  -- Validar target_zones
  if new.target_zones is not null then
    if not (new.target_zones ? 'apply_to_all' and new.target_zones ? 'included' and new.target_zones ? 'excluded') then
      raise exception 'target_zones debe tener estructura: {apply_to_all, included, excluded}';
    end if;
    
    if jsonb_typeof(new.target_zones->'included') != 'array' or jsonb_typeof(new.target_zones->'excluded') != 'array' then
      raise exception 'target_zones.included y target_zones.excluded deben ser arrays';
    end if;
    
    -- Validar que los zone_ids existan
    if new.target_zones->'included' != '[]'::jsonb then
      for id_item in select jsonb_array_elements_text(new.target_zones->'included')
      loop
        if not exists (select 1 from public.zones where id::text = id_item and tenant_id = new.tenant_id and deleted_at is null) then
          raise exception 'Zone ID % no existe en el tenant especificado', id_item;
        end if;
      end loop;
    end if;
  end if;
  
  -- Validar target_markets
  if new.target_markets is not null then
    if not (new.target_markets ? 'apply_to_all' and new.target_markets ? 'included' and new.target_markets ? 'excluded') then
      raise exception 'target_markets debe tener estructura: {apply_to_all, included, excluded}';
    end if;
    
    if jsonb_typeof(new.target_markets->'included') != 'array' or jsonb_typeof(new.target_markets->'excluded') != 'array' then
      raise exception 'target_markets.included y target_markets.excluded deben ser arrays';
    end if;
    
    -- Validar que los market_ids existan
    if new.target_markets->'included' != '[]'::jsonb then
      for id_item in select jsonb_array_elements_text(new.target_markets->'included')
      loop
        if not exists (select 1 from public.markets where id::text = id_item and tenant_id = new.tenant_id and deleted_at is null) then
          raise exception 'Market ID % no existe en el tenant especificado', id_item;
        end if;
      end loop;
    end if;
  end if;
  
  -- Validar target_client_types
  if new.target_client_types is not null then
    if not (new.target_client_types ? 'apply_to_all' and new.target_client_types ? 'included' and new.target_client_types ? 'excluded') then
      raise exception 'target_client_types debe tener estructura: {apply_to_all, included, excluded}';
    end if;
    
    if jsonb_typeof(new.target_client_types->'included') != 'array' or jsonb_typeof(new.target_client_types->'excluded') != 'array' then
      raise exception 'target_client_types.included y target_client_types.excluded deben ser arrays';
    end if;
    
    -- Validar que los client_type_ids existan
    if new.target_client_types->'included' != '[]'::jsonb then
      for id_item in select jsonb_array_elements_text(new.target_client_types->'included')
      loop
        if not exists (select 1 from public.client_types where id::text = id_item and tenant_id = new.tenant_id and deleted_at is null) then
          raise exception 'Client Type ID % no existe en el tenant especificado', id_item;
        end if;
      end loop;
    end if;
  end if;
  
  -- Validar target_clients
  if new.target_clients is not null then
    if not (new.target_clients ? 'apply_to_all' and new.target_clients ? 'included' and new.target_clients ? 'excluded') then
      raise exception 'target_clients debe tener estructura: {apply_to_all, included, excluded}';
    end if;
    
    if jsonb_typeof(new.target_clients->'included') != 'array' or jsonb_typeof(new.target_clients->'excluded') != 'array' then
      raise exception 'target_clients.included y target_clients.excluded deben ser arrays';
    end if;
    
    -- Validar que los client_ids existan
    if new.target_clients->'included' != '[]'::jsonb then
      for id_item in select jsonb_array_elements_text(new.target_clients->'included')
      loop
        if not exists (select 1 from public.clients where id::text = id_item and tenant_id = new.tenant_id and deleted_at is null) then
          raise exception 'Client ID % no existe en el tenant especificado', id_item;
        end if;
      end loop;
    end if;
  end if;
  
  -- Validar custom_conditions
  if new.custom_conditions is not null then
    if not (new.custom_conditions ? 'conditions' and new.custom_conditions ? 'logic') then
      raise exception 'custom_conditions debe tener estructura: {conditions, logic}';
    end if;
    
    if jsonb_typeof(new.custom_conditions->'conditions') != 'array' then
      raise exception 'custom_conditions.conditions debe ser un array';
    end if;
    
    if not (new.custom_conditions->>'logic' in ('AND', 'OR')) then
      raise exception 'custom_conditions.logic debe ser "AND" o "OR"';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_promotion_rule_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_public_id"("public_id_value" "text", "entity_type" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    expected_prefix TEXT;
BEGIN
    CASE entity_type
        WHEN 'tenant' THEN expected_prefix := 'TEN-';
        WHEN 'brand' THEN expected_prefix := 'BRD-';
        WHEN 'client' THEN expected_prefix := 'CLI-';
        WHEN 'campaign' THEN expected_prefix := 'CAM-';
        WHEN 'promotion' THEN expected_prefix := 'PRM-';
        WHEN 'order' THEN expected_prefix := 'ORD-';
        WHEN 'visit' THEN expected_prefix := 'VIS-';
        WHEN 'point_transaction' THEN expected_prefix := 'PTX-';
        WHEN 'reward' THEN expected_prefix := 'RWD-';
        WHEN 'product' THEN expected_prefix := 'PRD-';
        WHEN 'reward_redemption' THEN expected_prefix := 'RRD-';
        WHEN 'promotion_redemption' THEN expected_prefix := 'PRR-';
        ELSE RETURN FALSE;
    END CASE;

    -- Check if format matches: PREFIX-NNNN
    RETURN public_id_value ~ ('^' || expected_prefix || '[0-9]{4}$');
END;
$_$;


ALTER FUNCTION "public"."validate_public_id"("public_id_value" "text", "entity_type" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."validate_public_id"("public_id_value" "text", "entity_type" "text") IS 'Validates that a public_id matches the expected format for an entity type';



CREATE OR REPLACE FUNCTION "public"."validate_reward_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  brand_tenant_id uuid;
  product_tenant_id uuid;
  variant_product_id uuid;
begin
  -- Validar que brand_id pertenezca al mismo tenant
  select tenant_id into brand_tenant_id
  from public.brands where id = new.brand_id and deleted_at is null;
  
  if brand_tenant_id is null then
    raise exception 'Marca no existe o está eliminada';
  end if;
  
  if brand_tenant_id != new.tenant_id then
    raise exception 'La marca no pertenece al tenant especificado';
  end if;
  
  -- Validar product_id si no es null
  if new.product_id is not null then
    select tenant_id into product_tenant_id
    from public.products where id = new.product_id and deleted_at is null;
    
    if product_tenant_id is null then
      raise exception 'Producto no existe o está eliminado';
    end if;
    
    if product_tenant_id != new.tenant_id then
      raise exception 'El producto no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar que product_variant_id pertenezca al product_id especificado
  if new.product_variant_id is not null then
    if new.product_id is null then
      raise exception 'product_id es requerido cuando se especifica product_variant_id';
    end if;
    
    select product_id into variant_product_id
    from public.product_variants where id = new.product_variant_id and deleted_at is null;
    
    if variant_product_id is null then
      raise exception 'Variante de producto no existe o está eliminada';
    end if;
    
    if variant_product_id != new.product_id then
      raise exception 'La variante de producto no pertenece al producto especificado';
    end if;
  end if;
  
  -- Validar fechas
  if new.valid_until is not null and new.valid_from >= new.valid_until then
    raise exception 'valid_from debe ser anterior a valid_until';
  end if;
  
  -- Validar usage_count vs limit
  if new.usage_limit_total is not null and new.usage_count_total > new.usage_limit_total then
    raise exception 'usage_count_total no puede exceder usage_limit_total';
  end if;
  
  -- Validar campos requeridos según reward_type
  case new.reward_type
    when 'discount_percentage' then
      if new.discount_percentage is null then
        raise exception 'discount_percentage es requerido para reward_type "discount_percentage"';
      end if;
      
    when 'discount_amount' then
      if new.discount_amount is null then
        raise exception 'discount_amount es requerido para reward_type "discount_amount"';
      end if;
      
    when 'free_product' then
      if new.product_id is null then
        raise exception 'product_id es requerido para reward_type "free_product"';
      end if;
      
    when 'cashback' then
      if new.discount_amount is null and new.discount_percentage is null then
        raise exception 'discount_amount o discount_percentage es requerido para reward_type "cashback"';
      end if;
      
    else
      -- Para otros tipos no hay validaciones adicionales por ahora
  end case;
  
  -- Validar estructura de tier_requirements si existe
  if new.tier_requirements is not null then
    if jsonb_typeof(new.tier_requirements) != 'object' then
      raise exception 'tier_requirements debe ser un objeto JSON';
    end if;
  end if;
  
  -- Validar estructura de applicable_products si existe
  if new.applicable_products is not null then
    if jsonb_typeof(new.applicable_products) != 'array' then
      raise exception 'applicable_products debe ser un array JSON';
    end if;
  end if;
  
  -- Validar estructura de applicable_categories si existe
  if new.applicable_categories is not null then
    if jsonb_typeof(new.applicable_categories) != 'array' then
      raise exception 'applicable_categories debe ser un array JSON';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_reward_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_reward_redemption_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  membership_tenant_id uuid;
  reward_tenant_id uuid;
  transaction_tenant_id uuid;
  redeemed_by_tenant_id uuid;
  validated_by_tenant_id uuid;
  cancelled_by_tenant_id uuid;
  redeemed_by_has_valid_role boolean := false;
  validated_by_has_valid_role boolean := false;
  cancelled_by_has_valid_role boolean := false;
begin
  -- Validar que client_brand_membership_id pertenezca al tenant
  select tenant_id into membership_tenant_id
  from public.client_brand_memberships
  where id = new.client_brand_membership_id and deleted_at is null;
  
  if membership_tenant_id is null then
    raise exception 'Membresía de cliente no existe o está eliminada';
  end if;
  
  if membership_tenant_id != new.tenant_id then
    raise exception 'La membresía no pertenece al tenant especificado';
  end if;
  
  -- Validar que reward_id pertenezca al tenant
  select tenant_id into reward_tenant_id
  from public.rewards where id = new.reward_id and deleted_at is null;
  
  if reward_tenant_id is null then
    raise exception 'Recompensa no existe o está eliminada';
  end if;
  
  if reward_tenant_id != new.tenant_id then
    raise exception 'La recompensa no pertenece al tenant especificado';
  end if;
  
  -- Validar que points_transaction_id pertenezca al tenant
  select tenant_id into transaction_tenant_id
  from public.points_transactions
  where id = new.points_transaction_id and deleted_at is null;
  
  if transaction_tenant_id is null then
    raise exception 'Transacción de puntos no existe o está eliminada';
  end if;
  
  if transaction_tenant_id != new.tenant_id then
    raise exception 'La transacción de puntos no pertenece al tenant especificado';
  end if;
  
  -- Validar redeemed_by si no es null
  if new.redeemed_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.redeemed_by
      and ur.role in ('admin', 'supervisor', 'brand_manager', 'advisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into redeemed_by_has_valid_role;
    
    if not redeemed_by_has_valid_role then
      raise exception 'redeemed_by debe tener rol válido activo';
    end if;
    
    select distinct ur.tenant_id into redeemed_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.redeemed_by
    and ur.role in ('admin', 'supervisor', 'brand_manager', 'advisor')
    and ur.status = 'active'
    and ur.deleted_at is null
    and ur.tenant_id = new.tenant_id
    limit 1;
    
    if redeemed_by_tenant_id != new.tenant_id then
      raise exception 'El procesador del canje no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar validated_by si no es null
  if new.validated_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.validated_by
      and ur.role in ('admin', 'supervisor', 'brand_manager')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into validated_by_has_valid_role;
    
    if not validated_by_has_valid_role then
      raise exception 'validated_by debe tener rol de validación activo';
    end if;
    
    select distinct ur.tenant_id into validated_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.validated_by
    and ur.role in ('admin', 'supervisor', 'brand_manager')
    and ur.status = 'active'
    and ur.deleted_at is null
    and ur.tenant_id = new.tenant_id
    limit 1;
    
    if validated_by_tenant_id != new.tenant_id then
      raise exception 'El validador no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar cancelled_by si no es null
  if new.cancelled_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.cancelled_by
      and ur.role in ('admin', 'supervisor', 'brand_manager')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into cancelled_by_has_valid_role;
    
    if not cancelled_by_has_valid_role then
      raise exception 'cancelled_by debe tener rol de cancelación activo';
    end if;
    
    select distinct ur.tenant_id into cancelled_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.cancelled_by
    and ur.role in ('admin', 'supervisor', 'brand_manager')
    and ur.status = 'active'
    and ur.deleted_at is null
    and ur.tenant_id = new.tenant_id
    limit 1;
    
    if cancelled_by_tenant_id != new.tenant_id then
      raise exception 'El cancelador no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar estado de cancelación
  if new.redemption_status = 'cancelled' and new.cancelled_by is null then
    raise exception 'cancelled_by es obligatorio cuando redemption_status = cancelled';
  end if;
  
  -- Validar fechas
  if new.expiration_date is not null and new.expiration_date <= new.redemption_date then
    raise exception 'expiration_date debe ser posterior a redemption_date';
  end if;
  
  if new.used_date is not null then
    if new.used_date < new.redemption_date then
      raise exception 'used_date debe ser posterior o igual a redemption_date';
    end if;
    
    if new.expiration_date is not null and new.used_date > new.expiration_date then
      raise exception 'used_date debe ser anterior o igual a expiration_date';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_reward_redemption_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_role_expiration_on_critical_ops"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Solo aplicar validación en operaciones críticas (INSERT/UPDATE de status)
  if TG_OP = 'INSERT' or (TG_OP = 'UPDATE' and (
    old.status != new.status or 
    old.expires_at != new.expires_at or 
    old.expires_at != new.expires_at
  )) then
    
    -- Si el rol debería estar expirado pero está marcado como activo
    if new.status = 'active' 
       and new.expires_at is not null 
       and new.expires_at <= now() then
      
      -- Auto-corregir en lugar de fallar
      new.status = 'inactive';
      new.updated_at = now();
      
      -- Log para auditoría (opcional)
      insert into public.audit_log (
        table_name, 
        operation, 
        record_id, 
        old_data, 
        new_data, 
        user_id, 
        occurred_at
      ) values (
        'user_roles',
        'auto_expire',
        new.id,
        row_to_json(old),
        row_to_json(new),
        coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        now()
      );
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_role_expiration_on_critical_ops"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_single_primary_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.is_primary = true then
    -- Verificar si ya existe otro rol primario para el mismo usuario
    if exists (
      select 1 from public.user_roles
      where user_profile_id = new.user_profile_id
      and is_primary = true
      and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and deleted_at is null
    ) then
      raise exception 'Usuario ya tiene un rol primario asignado. Solo se permite un rol primario por usuario.';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_single_primary_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_tier_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
declare
  brand_tenant_id uuid;
  benefit_item jsonb;
begin
  -- Validar que brand_id pertenezca al mismo tenant
  select tenant_id into brand_tenant_id
  from public.brands where id = new.brand_id and deleted_at is null;
  
  if brand_tenant_id is null then
    raise exception 'Marca no existe o está eliminada';
  end if;
  
  if brand_tenant_id != new.tenant_id then
    raise exception 'La marca no pertenece al tenant especificado';
  end if;
  
  -- Validar color hex
  if new.tier_color is not null and new.tier_color !~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' then
    raise exception 'tier_color debe tener formato hex válido (#RRGGBB o #RGB)';
  end if;
  
  -- Validar estructura de benefits JSON
  if new.benefits is not null then
    if jsonb_typeof(new.benefits) != 'array' then
      raise exception 'benefits debe ser un array JSON';
    end if;
    
    for benefit_item in select jsonb_array_elements(new.benefits)
    loop
      if not (benefit_item ? 'type' and benefit_item ? 'description') then
        raise exception 'Cada benefit debe tener al menos "type" y "description"';
      end if;
      
      if not (benefit_item->>'type' in ('discount', 'free_delivery', 'priority_support', 'exclusive_products', 'bonus_points', 'early_access', 'custom_service')) then
        raise exception 'Benefit type debe ser válido: discount, free_delivery, priority_support, exclusive_products, bonus_points, early_access, custom_service';
      end if;
    end loop;
  end if;
  
  -- Validar estructura de requirements JSON
  if new.requirements is not null then
    if jsonb_typeof(new.requirements) != 'object' then
      raise exception 'requirements debe ser un objeto JSON';
    end if;
  end if;
  
  -- Validar estructura de auto_assignment_rules JSON
  if new.auto_assignment_rules is not null then
    if jsonb_typeof(new.auto_assignment_rules) != 'object' then
      raise exception 'auto_assignment_rules debe ser un objeto JSON';
    end if;
    
    if new.auto_assignment_rules ? 'rules' and jsonb_typeof(new.auto_assignment_rules->'rules') != 'array' then
      raise exception 'auto_assignment_rules.rules debe ser un array';
    end if;
  end if;
  
  return new;
end;
$_$;


ALTER FUNCTION "public"."validate_tier_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_visit_assessment_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  visit_tenant_id uuid;
  product_tenant_id uuid;
  variant_product_id uuid;
  competitor_item jsonb;
  promotional_item jsonb;
  action_item jsonb;
begin
  -- Validar que visit_id pertenezca al mismo tenant
  select tenant_id into visit_tenant_id
  from public.visits where id = new.visit_id and deleted_at is null;
  
  if visit_tenant_id is null then
    raise exception 'Visita no existe o está eliminada';
  end if;
  
  if visit_tenant_id != new.tenant_id then
    raise exception 'La visita no pertenece al tenant especificado';
  end if;
  
  -- Validar que product_id pertenezca al mismo tenant
  select tenant_id into product_tenant_id
  from public.products where id = new.product_id and deleted_at is null;
  
  if product_tenant_id is null then
    raise exception 'Producto no existe o está eliminado';
  end if;
  
  if product_tenant_id != new.tenant_id then
    raise exception 'El producto no pertenece al tenant especificado';
  end if;
  
  -- Validar que product_variant_id pertenezca al product_id especificado
  if new.product_variant_id is not null then
    select product_id into variant_product_id
    from public.product_variants where id = new.product_variant_id and deleted_at is null;
    
    if variant_product_id is null then
      raise exception 'Variante de producto no existe o está eliminada';
    end if;
    
    if variant_product_id != new.product_id then
      raise exception 'La variante de producto no pertenece al producto especificado';
    end if;
  end if;
  
  -- Validar estructura de competitor_products JSON
  if new.competitor_products is not null then
    if jsonb_typeof(new.competitor_products) != 'array' then
      raise exception 'competitor_products debe ser un array JSON';
    end if;
    
    for competitor_item in select jsonb_array_elements(new.competitor_products)
    loop
      if not (competitor_item ? 'brand' and competitor_item ? 'product') then
        raise exception 'Cada competitor_product debe tener al menos "brand" y "product"';
      end if;
      
      if competitor_item ? 'price' and (competitor_item->>'price')::numeric <= 0 then
        raise exception 'El precio del competidor debe ser mayor que 0';
      end if;
      
      if competitor_item ? 'shelf_position' then
        if not (competitor_item->>'shelf_position' in ('eye_level', 'top_shelf', 'middle_shelf', 'bottom_shelf', 'end_cap', 'floor_display')) then
          raise exception 'shelf_position del competidor debe ser válido';
        end if;
      end if;
    end loop;
  end if;
  
  -- Validar estructura de competitor_prices JSON
  if new.competitor_prices is not null then
    if jsonb_typeof(new.competitor_prices) != 'object' then
      raise exception 'competitor_prices debe ser un objeto JSON';
    end if;
  end if;
  
  -- Validar estructura de promotional_materials JSON
  if new.promotional_materials is not null then
    if jsonb_typeof(new.promotional_materials) != 'array' then
      raise exception 'promotional_materials debe ser un array JSON';
    end if;
    
    for promotional_item in select jsonb_array_elements(new.promotional_materials)
    loop
      if not (promotional_item ? 'type' and promotional_item ? 'condition') then
        raise exception 'Cada promotional_material debe tener al menos "type" y "condition"';
      end if;
      
      if promotional_item ? 'condition' then
        if not (promotional_item->>'condition' in ('excellent', 'good', 'fair', 'poor')) then
          raise exception 'condition del material promocional debe ser válido';
        end if;
      end if;
    end loop;
  end if;
  
  -- Validar estructura de recommended_actions JSON
  if new.recommended_actions is not null then
    if jsonb_typeof(new.recommended_actions) != 'array' then
      raise exception 'recommended_actions debe ser un array JSON';
    end if;
    
    for action_item in select jsonb_array_elements(new.recommended_actions)
    loop
      if not (action_item ? 'action' and action_item ? 'priority') then
        raise exception 'Cada recommended_action debe tener al menos "action" y "priority"';
      end if;
      
      if action_item ? 'priority' then
        if not (action_item->>'priority' in ('low', 'medium', 'high', 'urgent')) then
          raise exception 'priority de la acción debe ser: low, medium, high, o urgent';
        end if;
      end if;
    end loop;
  end if;
  
  -- Validar estructura de photo_evidence_urls JSON
  if new.photo_evidence_urls is not null then
    if jsonb_typeof(new.photo_evidence_urls) != 'array' then
      raise exception 'photo_evidence_urls debe ser un array JSON';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_visit_assessment_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_visit_communication_plan_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  visit_tenant_id uuid;
  brand_tenant_id uuid;
  installed_by_tenant_id uuid;
  installed_by_has_valid_role boolean := false;
  photo_item jsonb;
begin
  -- Validar que visit_id pertenezca al mismo tenant
  select tenant_id into visit_tenant_id
  from public.visits where id = new.visit_id and deleted_at is null;
  
  if visit_tenant_id is null then
    raise exception 'Visita no existe o está eliminada';
  end if;
  
  if visit_tenant_id != new.tenant_id then
    raise exception 'La visita no pertenece al tenant especificado';
  end if;
  
  -- Validar que brand_id pertenezca al mismo tenant
  select tenant_id into brand_tenant_id
  from public.brands where id = new.brand_id and deleted_at is null;
  
  if brand_tenant_id is null then
    raise exception 'Marca no existe o está eliminada';
  end if;
  
  if brand_tenant_id != new.tenant_id then
    raise exception 'La marca no pertenece al tenant especificado';
  end if;
  
  -- Validar installed_by si no es null
  if new.installed_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.installed_by
      and ur.role in ('advisor', 'supervisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into installed_by_has_valid_role;
    
    if not installed_by_has_valid_role then
      raise exception 'installed_by debe tener rol "advisor" o "supervisor" activo';
    end if;
    
    select distinct ur.tenant_id into installed_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.installed_by
    and ur.role in ('advisor', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
    limit 1;
    
    if installed_by_tenant_id != new.tenant_id then
      raise exception 'El instalador no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar campaign_id si no es null (cuando exista la tabla campaigns)
  -- TODO: Agregar validación cuando se cree la tabla campaigns
  -- if new.campaign_id is not null then
  --   select brand_id into campaign_brand_id
  --   from public.campaigns where id = new.campaign_id and deleted_at is null;
  --   
  --   if campaign_brand_id != new.brand_id then
  --     raise exception 'La campaña no pertenece a la marca especificada';
  --   end if;
  -- end if;
  
  -- Validar fechas
  if new.installation_date_planned is not null and new.installation_date_actual is not null then
    if new.installation_date_actual < new.installation_date_planned then
      raise exception 'installation_date_actual debe ser posterior o igual a installation_date_planned';
    end if;
  end if;
  
  if new.follow_up_date is not null and new.follow_up_date <= current_date then
    raise exception 'follow_up_date debe ser posterior a la fecha actual';
  end if;
  
  -- Validar estructura de campaign_duration JSON
  if new.campaign_duration is not null then
    if jsonb_typeof(new.campaign_duration) != 'object' then
      raise exception 'campaign_duration debe ser un objeto JSON';
    end if;
    
    -- Validar fechas en campaign_duration si existen
    if new.campaign_duration ? 'start_date' and new.campaign_duration ? 'end_date' then
      if (new.campaign_duration->>'start_date')::date >= (new.campaign_duration->>'end_date')::date then
        raise exception 'start_date debe ser anterior a end_date en campaign_duration';
      end if;
    end if;
  end if;
  
  -- Validar estructura de photo_before_urls JSON
  if new.photo_before_urls is not null then
    if jsonb_typeof(new.photo_before_urls) != 'array' then
      raise exception 'photo_before_urls debe ser un array JSON';
    end if;
    
    for photo_item in select jsonb_array_elements(new.photo_before_urls)
    loop
      if not (photo_item ? 'url' and photo_item ? 'description') then
        raise exception 'Cada photo_before debe tener al menos "url" y "description"';
      end if;
    end loop;
  end if;
  
  -- Validar estructura de photo_after_urls JSON
  if new.photo_after_urls is not null then
    if jsonb_typeof(new.photo_after_urls) != 'array' then
      raise exception 'photo_after_urls debe ser un array JSON';
    end if;
    
    for photo_item in select jsonb_array_elements(new.photo_after_urls)
    loop
      if not (photo_item ? 'url' and photo_item ? 'description') then
        raise exception 'Cada photo_after debe tener al menos "url" y "description"';
      end if;
    end loop;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_visit_communication_plan_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_visit_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  advisor_tenant_id uuid;
  client_tenant_id uuid;
  advisor_has_valid_role boolean := false;
begin
  -- Validar que advisor_id tenga rol 'advisor' o 'supervisor'
  select exists (
    select 1 from public.user_roles ur
    where ur.user_profile_id = new.advisor_id
    and ur.role in ('advisor', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
  ) into advisor_has_valid_role;
  
  if not advisor_has_valid_role then
    raise exception 'advisor_id debe tener rol "advisor" o "supervisor" activo';
  end if;
  
  -- Obtener tenant_id del advisor
  select distinct ur.tenant_id into advisor_tenant_id
  from public.user_roles ur
  where ur.user_profile_id = new.advisor_id
  and ur.role in ('advisor', 'supervisor')
  and ur.status = 'active'
  and ur.deleted_at is null
  limit 1;
  
  -- Obtener tenant_id del client
  select tenant_id into client_tenant_id
  from public.clients where id = new.client_id and deleted_at is null;
  
  if client_tenant_id is null then
    raise exception 'Cliente no existe o está eliminado';
  end if;
  
  if advisor_tenant_id is null then
    raise exception 'Asesor no tiene roles activos';
  end if;
  
  if advisor_tenant_id != new.tenant_id then
    raise exception 'El asesor no pertenece al tenant especificado';
  end if;
  
  if client_tenant_id != new.tenant_id then
    raise exception 'El cliente no pertenece al tenant especificado';
  end if;
  
  -- Validar fechas y horarios
  if new.visit_time_start is not null and new.visit_time_end is not null then
    if new.visit_time_start >= new.visit_time_end then
      raise exception 'visit_time_start debe ser anterior a visit_time_end';
    end if;
  end if;
  
  if new.check_in_time is not null and new.check_out_time is not null then
    if new.check_in_time >= new.check_out_time then
      raise exception 'check_in_time debe ser anterior a check_out_time';
    end if;
  end if;
  
  if new.next_visit_date is not null and new.next_visit_date <= new.visit_date then
    raise exception 'next_visit_date debe ser posterior a visit_date';
  end if;
  
  -- Validar coordenadas
  if new.location_coordinates is not null then
    if new.location_coordinates[0] < -180 or new.location_coordinates[0] > 180 then
      raise exception 'Longitud debe estar entre -180 y 180';
    end if;
    if new.location_coordinates[1] < -90 or new.location_coordinates[1] > 90 then
      raise exception 'Latitud debe estar entre -90 y 90';
    end if;
  end if;
  
  -- Validar estructura JSON de visit_attachments
  if new.visit_attachments is not null then
    if jsonb_typeof(new.visit_attachments) != 'array' then
      raise exception 'visit_attachments debe ser un array JSON';
    end if;
    
    -- Validar estructura de cada elemento del array
    if jsonb_array_length(new.visit_attachments) > 0 then
      declare
        attachment jsonb;
      begin
        for attachment in select jsonb_array_elements(new.visit_attachments)
        loop
          if not (attachment ? 'type' and attachment ? 'url') then
            raise exception 'Cada attachment debe tener al menos "type" y "url"';
          end if;
          
          if not (attachment->>'type' in ('photo', 'document', 'video', 'audio')) then
            raise exception 'Attachment type debe ser: photo, document, video, o audio';
          end if;
        end loop;
      end;
    end if;
  end if;
  
  -- Validar estructura JSON de metadata
  if new.metadata is not null then
    if jsonb_typeof(new.metadata) != 'object' then
      raise exception 'metadata debe ser un objeto JSON';
    end if;
    
    -- Validar campos específicos si existen
    if new.metadata ? 'transportation_used' then
      if not (new.metadata->>'transportation_used' in ('car', 'motorcycle', 'public', 'walking')) then
        raise exception 'transportation_used debe ser: car, motorcycle, public, o walking';
      end if;
    end if;
    
    if new.metadata ? 'competitor_activity' then
      if not (new.metadata->>'competitor_activity' in ('high', 'medium', 'low')) then
        raise exception 'competitor_activity debe ser: high, medium, o low';
      end if;
    end if;
    
    if new.metadata ? 'client_mood' then
      if not (new.metadata->>'client_mood' in ('positive', 'neutral', 'negative')) then
        raise exception 'client_mood debe ser: positive, neutral, o negative';
      end if;
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_visit_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_visit_inventory_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  visit_tenant_id uuid;
  product_tenant_id uuid;
  variant_product_id uuid;
  counted_by_has_valid_role boolean := false;
  verified_by_has_valid_role boolean := false;
  expiration_item jsonb;
  counted_by_tenant_id uuid;
  verified_by_tenant_id uuid;
begin
  -- Validar que visit_id pertenezca al mismo tenant
  select tenant_id into visit_tenant_id
  from public.visits where id = new.visit_id and deleted_at is null;
  
  if visit_tenant_id is null then
    raise exception 'Visita no existe o está eliminada';
  end if;
  
  if visit_tenant_id != new.tenant_id then
    raise exception 'La visita no pertenece al tenant especificado';
  end if;
  
  -- Validar que product_id pertenezca al mismo tenant
  select tenant_id into product_tenant_id
  from public.products where id = new.product_id and deleted_at is null;
  
  if product_tenant_id is null then
    raise exception 'Producto no existe o está eliminado';
  end if;
  
  if product_tenant_id != new.tenant_id then
    raise exception 'El producto no pertenece al tenant especificado';
  end if;
  
  -- Validar que product_variant_id pertenezca al product_id especificado
  if new.product_variant_id is not null then
    select product_id into variant_product_id
    from public.product_variants where id = new.product_variant_id and deleted_at is null;
    
    if variant_product_id is null then
      raise exception 'Variante de producto no existe o está eliminada';
    end if;
    
    if variant_product_id != new.product_id then
      raise exception 'La variante de producto no pertenece al producto especificado';
    end if;
  end if;
  
  -- Validar que counted_by tenga rol válido
  select exists (
    select 1 from public.user_roles ur
    where ur.user_profile_id = new.counted_by
    and ur.role in ('advisor', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
  ) into counted_by_has_valid_role;
  
  if not counted_by_has_valid_role then
    raise exception 'counted_by debe tener rol "advisor" o "supervisor" activo';
  end if;
  
  -- Validar que counted_by pertenezca al tenant
  select distinct ur.tenant_id into counted_by_tenant_id
  from public.user_roles ur
  where ur.user_profile_id = new.counted_by
  and ur.role in ('advisor', 'supervisor')
  and ur.status = 'active'
  and ur.deleted_at is null
  limit 1;
  
  if counted_by_tenant_id != new.tenant_id then
    raise exception 'El contador no pertenece al tenant especificado';
  end if;
  
  -- Validar que verified_by tenga rol válido si no es null
  if new.verified_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.verified_by
      and ur.role = 'supervisor'
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into verified_by_has_valid_role;
    
    if not verified_by_has_valid_role then
      raise exception 'verified_by debe tener rol "supervisor" activo';
    end if;
    
    -- Validar que verified_by pertenezca al tenant
    select distinct ur.tenant_id into verified_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.verified_by
    and ur.role = 'supervisor'
    and ur.status = 'active'
    and ur.deleted_at is null
    limit 1;
    
    if verified_by_tenant_id != new.tenant_id then
      raise exception 'El verificador no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar fechas de entrega
  if new.last_delivery_date is not null and new.next_delivery_expected is not null then
    if new.last_delivery_date >= new.next_delivery_expected then
      raise exception 'next_delivery_expected debe ser posterior a last_delivery_date';
    end if;
  end if;
  
  -- Validar estructura de expiration_dates JSON
  if new.expiration_dates is not null then
    if jsonb_typeof(new.expiration_dates) != 'array' then
      raise exception 'expiration_dates debe ser un array JSON';
    end if;
    
    for expiration_item in select jsonb_array_elements(new.expiration_dates)
    loop
      if not (expiration_item ? 'date' and expiration_item ? 'quantity') then
        raise exception 'Cada expiration_date debe tener al menos "date" y "quantity"';
      end if;
      
      if (expiration_item->>'quantity')::integer <= 0 then
        raise exception 'La cantidad en expiration_date debe ser mayor que 0';
      end if;
    end loop;
  end if;
  
  -- Validar estructura de batch_numbers JSON
  if new.batch_numbers is not null then
    if jsonb_typeof(new.batch_numbers) != 'array' then
      raise exception 'batch_numbers debe ser un array JSON';
    end if;
  end if;
  
  -- Validar estructura de storage_conditions JSON
  if new.storage_conditions is not null then
    if jsonb_typeof(new.storage_conditions) != 'object' then
      raise exception 'storage_conditions debe ser un objeto JSON';
    end if;
    
    -- Validar campos específicos si existen
    if new.storage_conditions ? 'temperature' then
      if not (new.storage_conditions->>'temperature' in ('adequate', 'too_hot', 'too_cold')) then
        raise exception 'temperature debe ser: adequate, too_hot, o too_cold';
      end if;
    end if;
    
    if new.storage_conditions ? 'humidity' then
      if not (new.storage_conditions->>'humidity' in ('adequate', 'too_humid', 'too_dry')) then
        raise exception 'humidity debe ser: adequate, too_humid, o too_dry';
      end if;
    end if;
    
    if new.storage_conditions ? 'lighting' then
      if not (new.storage_conditions->>'lighting' in ('adequate', 'too_bright', 'too_dark')) then
        raise exception 'lighting debe ser: adequate, too_bright, o too_dark';
      end if;
    end if;
    
    if new.storage_conditions ? 'cleanliness' then
      if not (new.storage_conditions->>'cleanliness' in ('excellent', 'good', 'fair', 'poor')) then
        raise exception 'cleanliness debe ser: excellent, good, fair, o poor';
      end if;
    end if;
    
    if new.storage_conditions ? 'organization' then
      if not (new.storage_conditions->>'organization' in ('excellent', 'good', 'fair', 'poor')) then
        raise exception 'organization debe ser: excellent, good, fair, o poor';
      end if;
    end if;
    
    if new.storage_conditions ? 'damage_risk' then
      if not (new.storage_conditions->>'damage_risk' in ('low', 'medium', 'high')) then
        raise exception 'damage_risk debe ser: low, medium, o high';
      end if;
    end if;
  end if;
  
  -- Validar estructura de photo_evidence_urls JSON
  if new.photo_evidence_urls is not null then
    if jsonb_typeof(new.photo_evidence_urls) != 'array' then
      raise exception 'photo_evidence_urls debe ser un array JSON';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_visit_inventory_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_visit_order_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  visit_tenant_id uuid;
  advisor_tenant_id uuid;
  approved_by_tenant_id uuid;
  invoice_data_client_id uuid;
  advisor_has_valid_role boolean := false;
  approved_by_has_valid_role boolean := false;
  attachment_item jsonb;
begin
  -- Validar que visit_id pertenezca al mismo tenant
  select tenant_id into visit_tenant_id
  from public.visits where id = new.visit_id and deleted_at is null;
  
  if visit_tenant_id is null then
    raise exception 'Visita no existe o está eliminada';
  end if;
  
  if visit_tenant_id != new.tenant_id then
    raise exception 'La visita no pertenece al tenant especificado';
  end if;
  
  -- Validar que advisor_id tenga rol válido y pertenezca al tenant
  select exists (
    select 1 from public.user_roles ur
    where ur.user_profile_id = new.advisor_id
    and ur.role in ('advisor', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
  ) into advisor_has_valid_role;
  
  if not advisor_has_valid_role then
    raise exception 'advisor_id debe tener rol "advisor" o "supervisor" activo';
  end if;
  
  select distinct ur.tenant_id into advisor_tenant_id
  from public.user_roles ur
  where ur.user_profile_id = new.advisor_id
  and ur.role in ('advisor', 'supervisor')
  and ur.status = 'active'
  and ur.deleted_at is null
  limit 1;
  
  if advisor_tenant_id != new.tenant_id then
    raise exception 'El asesor no pertenece al tenant especificado';
  end if;
  
  -- Validar approved_by si no es null
  if new.approved_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.approved_by
      and ur.role = 'supervisor'
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into approved_by_has_valid_role;
    
    if not approved_by_has_valid_role then
      raise exception 'approved_by debe tener rol "supervisor" activo';
    end if;
    
    select distinct ur.tenant_id into approved_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.approved_by
    and ur.role = 'supervisor'
    and ur.status = 'active'
    and ur.deleted_at is null
    limit 1;
    
    if approved_by_tenant_id != new.tenant_id then
      raise exception 'El aprobador no pertenece al tenant especificado';
    end if;
  end if;
  
  -- Validar client_invoice_data_id si no es null
  if new.client_invoice_data_id is not null then
    select client_id into invoice_data_client_id
    from public.client_invoice_data 
    where id = new.client_invoice_data_id and deleted_at is null;
    
    if invoice_data_client_id is null then
      raise exception 'Los datos de facturación no existen o están eliminados';
    end if;
    
    if invoice_data_client_id != new.client_id then
      raise exception 'Los datos de facturación no pertenecen al cliente especificado';
    end if;
  end if;
  
  -- Validar aprobación requerida
  if new.requires_approval = true and new.order_status != 'draft' then
    if new.approved_by is null or new.approved_at is null then
      raise exception 'approved_by y approved_at son obligatorios cuando requires_approval = true y order_status != draft';
    end if;
  end if;
  
  -- Validar facturación requerida
  if new.invoice_required = true and new.client_invoice_data_id is null then
    raise exception 'client_invoice_data_id es obligatorio cuando invoice_required = true';
  end if;
  
  -- Validar fechas
  if new.delivery_date is not null and new.delivery_date < new.order_date then
    raise exception 'delivery_date debe ser posterior o igual a order_date';
  end if;
  
  -- Validar cálculo de total
  if new.total_amount != (new.subtotal - new.discount_amount + new.tax_amount) then
    raise exception 'total_amount debe ser igual a subtotal - discount_amount + tax_amount';
  end if;
  
  -- Validar estructura de order_attachments JSON
  if new.order_attachments is not null then
    if jsonb_typeof(new.order_attachments) != 'array' then
      raise exception 'order_attachments debe ser un array JSON';
    end if;
    
    for attachment_item in select jsonb_array_elements(new.order_attachments)
    loop
      if not (attachment_item ? 'type' and attachment_item ? 'url') then
        raise exception 'Cada attachment debe tener al menos "type" y "url"';
      end if;
      
      if not (attachment_item->>'type' in ('receipt', 'signature', 'photo', 'document', 'invoice')) then
        raise exception 'Attachment type debe ser: receipt, signature, photo, document, o invoice';
      end if;
    end loop;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_visit_order_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_visit_order_item_calculations"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    calc_quantity INTEGER;
    expected_subtotal DECIMAL(12,2);
    expected_line_total DECIMAL(12,2);
BEGIN
    -- Usar quantity_confirmed si existe, sino quantity_ordered
    calc_quantity := COALESCE(NEW.quantity_confirmed, NEW.quantity_ordered);
    
    -- Calcular subtotal esperado
    expected_subtotal := calc_quantity * NEW.unit_price;
    
    -- Validar subtotal (con tolerancia de 0.01 por redondeos)
    IF ABS(NEW.line_subtotal - expected_subtotal) > 0.01 THEN
        RAISE EXCEPTION 'line_subtotal (%) does not match quantity × unit_price (%)',
            NEW.line_subtotal, expected_subtotal;
    END IF;
    
    -- Calcular total esperado (subtotal - descuento + impuesto)
    expected_line_total := NEW.line_subtotal - NEW.line_discount_amount + NEW.tax_amount;
    
    -- Validar line_total (con tolerancia de 0.01 por redondeos)
    IF ABS(NEW.line_total - expected_line_total) > 0.01 THEN
        RAISE EXCEPTION 'line_total (%) does not match subtotal - discount + tax (%)',
            NEW.line_total, expected_line_total;
    END IF;
    
    -- Validar que el descuento no exceda el subtotal
    IF NEW.line_discount_amount > NEW.line_subtotal THEN
        RAISE EXCEPTION 'line_discount_amount (%) cannot exceed line_subtotal (%)',
            NEW.line_discount_amount, NEW.line_subtotal;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_visit_order_item_calculations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_visit_order_item_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Validar que metadata sea un objeto JSON válido
    IF NEW.metadata IS NOT NULL AND jsonb_typeof(NEW.metadata) != 'object' THEN
        RAISE EXCEPTION 'metadata must be a JSON object, got %', jsonb_typeof(NEW.metadata);
    END IF;
    
    -- Validar estructura de inventory_check si existe
    IF NEW.metadata ? 'inventory_check' THEN
        IF jsonb_typeof(NEW.metadata->'inventory_check') != 'object' THEN
            RAISE EXCEPTION 'metadata.inventory_check must be an object';
        END IF;
    END IF;
    
    -- Validar estructura de negotiation_details si existe
    IF NEW.metadata ? 'negotiation_details' THEN
        IF jsonb_typeof(NEW.metadata->'negotiation_details') != 'object' THEN
            RAISE EXCEPTION 'metadata.negotiation_details must be an object';
        END IF;
    END IF;
    
    -- Validar estructura de delivery_logistics si existe
    IF NEW.metadata ? 'delivery_logistics' THEN
        IF jsonb_typeof(NEW.metadata->'delivery_logistics') != 'object' THEN
            RAISE EXCEPTION 'metadata.delivery_logistics must be an object';
        END IF;
    END IF;
    
    -- Validar estructura de sales_context si existe
    IF NEW.metadata ? 'sales_context' THEN
        IF jsonb_typeof(NEW.metadata->'sales_context') != 'object' THEN
            RAISE EXCEPTION 'metadata.sales_context must be an object';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_visit_order_item_metadata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_visit_order_item_tenant_consistency"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    visit_order_tenant_id UUID;
    product_tenant_id UUID;
    variant_product_id UUID;
BEGIN
    -- Validar que el visit_order pertenece al mismo tenant
    SELECT tenant_id INTO visit_order_tenant_id
    FROM public.visit_orders
    WHERE id = NEW.visit_order_id AND deleted_at IS NULL;
    
    IF visit_order_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Visit order % not found or deleted', NEW.visit_order_id;
    END IF;
    
    IF visit_order_tenant_id != NEW.tenant_id THEN
        RAISE EXCEPTION 'Tenant mismatch: visit_order belongs to tenant %, item specifies tenant %',
            visit_order_tenant_id, NEW.tenant_id;
    END IF;
    
    -- Validar que el producto pertenece al mismo tenant
    SELECT tenant_id INTO product_tenant_id
    FROM public.products
    WHERE id = NEW.product_id AND deleted_at IS NULL;
    
    IF product_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Product % not found or deleted', NEW.product_id;
    END IF;
    
    IF product_tenant_id != NEW.tenant_id THEN
        RAISE EXCEPTION 'Tenant mismatch: product belongs to tenant %, item specifies tenant %',
            product_tenant_id, NEW.tenant_id;
    END IF;
    
    -- Validar que la variante pertenece al producto especificado
    IF NEW.product_variant_id IS NOT NULL THEN
        SELECT product_id INTO variant_product_id
        FROM public.product_variants
        WHERE id = NEW.product_variant_id AND deleted_at IS NULL;
        
        IF variant_product_id IS NULL THEN
            RAISE EXCEPTION 'Product variant % not found or deleted', NEW.product_variant_id;
        END IF;
        
        IF variant_product_id != NEW.product_id THEN
            RAISE EXCEPTION 'Variant % does not belong to product %',
                NEW.product_variant_id, NEW.product_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_visit_order_item_tenant_consistency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_zone_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  parent_type public.zone_type_enum;
  parent_tenant_id uuid;
  current_zone_id uuid;
  depth integer := 0;
  max_depth integer := 20;
  city_item jsonb;
  postal_item jsonb;
begin
  -- Validar formato de cities JSON
  if new.cities is not null then
    if jsonb_typeof(new.cities) != 'array' then
      raise exception 'cities debe ser un array JSON';
    end if;
    
    for city_item in select * from jsonb_array_elements(new.cities) loop
      if jsonb_typeof(city_item) != 'string' then
        raise exception 'Todos los elementos en cities deben ser strings';
      end if;
    end loop;
  end if;
  
  -- Validar formato de postal_codes JSON
  if new.postal_codes is not null then
    if jsonb_typeof(new.postal_codes) != 'array' then
      raise exception 'postal_codes debe ser un array JSON';
    end if;
    
    for postal_item in select * from jsonb_array_elements(new.postal_codes) loop
      if jsonb_typeof(postal_item) != 'string' then
        raise exception 'Todos los elementos en postal_codes deben ser strings';
      end if;
    end loop;
  end if;
  
  -- Validar formato de coordinates JSON
  if new.coordinates is not null then
    if jsonb_typeof(new.coordinates) != 'object' then
      raise exception 'coordinates debe ser un objeto JSON';
    end if;
    
    if not (new.coordinates ? 'type') then
      raise exception 'coordinates debe tener una propiedad "type"';
    end if;
    
    if new.coordinates->>'type' = 'polygon' then
      if not (new.coordinates ? 'coordinates') then
        raise exception 'coordinates de tipo polygon debe tener una propiedad "coordinates"';
      end if;
      if jsonb_typeof(new.coordinates->'coordinates') != 'array' then
        raise exception 'coordinates.coordinates debe ser un array para tipo polygon';
      end if;
    elsif new.coordinates->>'type' = 'circle' then
      if not (new.coordinates ? 'center' and new.coordinates ? 'radius_km') then
        raise exception 'coordinates de tipo circle debe tener propiedades "center" y "radius_km"';
      end if;
      if jsonb_typeof(new.coordinates->'center') != 'array' then
        raise exception 'coordinates.center debe ser un array para tipo circle';
      end if;
      if jsonb_typeof(new.coordinates->'radius_km') != 'number' then
        raise exception 'coordinates.radius_km debe ser un número para tipo circle';
      end if;
    else
      raise exception 'coordinates.type debe ser "polygon" o "circle"';
    end if;
  end if;
  
  -- Validar jerarquía de zonas si hay parent_zone_id
  if new.parent_zone_id is not null then
    -- Obtener información de la zona padre
    select zone_type, tenant_id 
    into parent_type, parent_tenant_id
    from public.zones
    where id = new.parent_zone_id and deleted_at is null;
    
    if parent_type is null then
      raise exception 'Zona padre no existe o está eliminada';
    end if;
    
    -- Validar que la zona padre pertenece al mismo tenant
    if parent_tenant_id != new.tenant_id then
      raise exception 'Zona padre debe pertenecer al mismo tenant';
    end if;
    
    -- Validar jerarquía de tipos según el orden: country > region > state > city > district > custom
    if not (
      (new.zone_type = 'region' and parent_type = 'country') or
      (new.zone_type = 'state' and parent_type in ('country', 'region')) or
      (new.zone_type = 'city' and parent_type in ('country', 'region', 'state')) or
      (new.zone_type = 'district' and parent_type in ('country', 'region', 'state', 'city')) or
      (new.zone_type = 'custom' and parent_type in ('country', 'region', 'state', 'city', 'district'))
    ) then
      raise exception 'Jerarquía de zona inválida: % no puede ser hijo de %', new.zone_type, parent_type;
    end if;
    
    -- Prevenir ciclos en la jerarquía
    current_zone_id := new.parent_zone_id;
    while current_zone_id is not null and depth < max_depth loop
      if current_zone_id = new.id then
        raise exception 'Ciclo detectado en jerarquía de zonas';
      end if;
      
      select parent_zone_id into current_zone_id
      from public.zones
      where id = current_zone_id and deleted_at is null;
      
      depth := depth + 1;
    end loop;
    
    if depth >= max_depth then
      raise exception 'Jerarquía de zonas demasiado profunda';
    end if;
  end if;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."validate_zone_data"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_brand_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "logo_url" character varying(500),
    "brand_color_primary" character varying(7),
    "brand_color_secondary" character varying(7),
    "contact_email" character varying(255),
    "contact_phone" character varying(20),
    "website" character varying(255),
    "status" "public"."brand_status_enum" DEFAULT 'draft'::"public"."brand_status_enum",
    "settings" "jsonb",
    "dashboard_metrics" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "brands_color_primary_check" CHECK ((("brand_color_primary" IS NULL) OR (("brand_color_primary")::"text" ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'::"text"))),
    CONSTRAINT "brands_color_secondary_check" CHECK ((("brand_color_secondary" IS NULL) OR (("brand_color_secondary")::"text" ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'::"text"))),
    CONSTRAINT "brands_dashboard_metrics_check" CHECK ((("dashboard_metrics" IS NULL) OR (("jsonb_typeof"("dashboard_metrics") = 'array'::"text") AND ("jsonb_array_length"("dashboard_metrics") <= 5)))),
    CONSTRAINT "brands_public_id_format_check" CHECK ((("public_id")::"text" ~ '^BRD-[0-9]{4}$'::"text")),
    CONSTRAINT "brands_slug_format_check" CHECK (((("slug")::"text" ~ '^[a-z0-9]+([a-z0-9\-]*[a-z0-9])?$'::"text") AND ("length"(("slug")::"text") >= 2)))
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


COMMENT ON TABLE "public"."brands" IS 'Marcas por tenant';



COMMENT ON COLUMN "public"."brands"."name" IS 'nombre de la marca';



COMMENT ON COLUMN "public"."brands"."slug" IS 'para subdominios: sprite.ruta-perfectapp.com';



COMMENT ON COLUMN "public"."brands"."logo_url" IS 'URL del logo en Supabase Storage';



COMMENT ON COLUMN "public"."brands"."brand_color_primary" IS 'color hex para white-label';



COMMENT ON COLUMN "public"."brands"."brand_color_secondary" IS 'color hex para white-label';



COMMENT ON COLUMN "public"."brands"."settings" IS 'configuraciones específicas de la marca';



CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_tenant_public_id"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "email" character varying(255),
    "phone" character varying(20),
    "address" "text",
    "country" character varying(2) DEFAULT 'MX'::character varying,
    "timezone" character varying(50) DEFAULT 'America/Mexico_City'::character varying,
    "status" "public"."tenant_status_enum" DEFAULT 'trial'::"public"."tenant_status_enum",
    "subscription_plan" "public"."tenant_subscription_plan_enum" DEFAULT 'base'::"public"."tenant_subscription_plan_enum",
    "trial_ends_at" timestamp with time zone,
    "settings" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "tenants_country_length_check" CHECK (("length"(("country")::"text") = 2)),
    CONSTRAINT "tenants_public_id_format_check" CHECK ((("public_id")::"text" ~ '^TEN-[0-9]+$'::"text")),
    CONSTRAINT "tenants_slug_format_check" CHECK (((("slug")::"text" ~ '^[a-z0-9]+([a-z0-9\-]*[a-z0-9])?$'::"text") AND ("length"(("slug")::"text") >= 2)))
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


COMMENT ON TABLE "public"."tenants" IS 'Holdings/clientes corporativos';



COMMENT ON COLUMN "public"."tenants"."name" IS 'nombre del tenant';



COMMENT ON COLUMN "public"."tenants"."slug" IS 'para subdominios: cocacola.ruta-perfectapp.com';



COMMENT ON COLUMN "public"."tenants"."email" IS 'email de contacto principal';



COMMENT ON COLUMN "public"."tenants"."settings" IS 'configuraciones específicas del tenant';



CREATE OR REPLACE VIEW "public"."active_brands" AS
 SELECT "b"."id",
    "b"."public_id",
    "b"."tenant_id",
    "b"."name",
    "b"."slug",
    "b"."description",
    "b"."logo_url",
    "b"."brand_color_primary",
    "b"."brand_color_secondary",
    "b"."contact_email",
    "b"."contact_phone",
    "b"."website",
    "b"."status",
    "b"."settings",
    "b"."dashboard_metrics",
    "b"."created_at",
    "b"."updated_at",
    "b"."deleted_at"
   FROM ("public"."brands" "b"
     JOIN "public"."tenants" "t" ON (("b"."tenant_id" = "t"."id")))
  WHERE (("b"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL));


ALTER VIEW "public"."active_brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_campaign_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "campaign_type" "public"."campaign_type_enum" NOT NULL,
    "status" "public"."campaign_status_enum" DEFAULT 'draft'::"public"."campaign_status_enum",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "budget_total" numeric(12,2),
    "budget_spent" numeric(12,2) DEFAULT 0.00,
    "target_audience" "jsonb",
    "campaign_objectives" "jsonb",
    "key_messages" "jsonb",
    "channels" "jsonb",
    "geographic_scope" "jsonb",
    "created_by" "uuid" NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "approval_notes" "text",
    "launch_ready" boolean DEFAULT false,
    "launch_checklist" "jsonb",
    "performance_metrics" "jsonb",
    "roi_target" numeric(5,2),
    "roi_actual" numeric(5,2),
    "campaign_tags" "jsonb",
    "competitive_context" "text",
    "success_criteria" "jsonb",
    "post_campaign_analysis" "text",
    "lessons_learned" "text",
    "attachments" "jsonb",
    "is_template" boolean DEFAULT false,
    "template_name" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "campaigns_attachments_check" CHECK ((("attachments" IS NULL) OR ("jsonb_typeof"("attachments") = 'array'::"text"))),
    CONSTRAINT "campaigns_budget_spent_check" CHECK (("budget_spent" >= (0)::numeric)),
    CONSTRAINT "campaigns_budget_spent_vs_total_check" CHECK ((("budget_total" IS NULL) OR ("budget_spent" <= "budget_total"))),
    CONSTRAINT "campaigns_campaign_objectives_check" CHECK ((("campaign_objectives" IS NULL) OR ("jsonb_typeof"("campaign_objectives") = 'object'::"text"))),
    CONSTRAINT "campaigns_campaign_tags_check" CHECK ((("campaign_tags" IS NULL) OR ("jsonb_typeof"("campaign_tags") = 'array'::"text"))),
    CONSTRAINT "campaigns_channels_check" CHECK ((("channels" IS NULL) OR ("jsonb_typeof"("channels") = 'object'::"text"))),
    CONSTRAINT "campaigns_end_date_check" CHECK (("end_date" > "start_date")),
    CONSTRAINT "campaigns_geographic_scope_check" CHECK ((("geographic_scope" IS NULL) OR ("jsonb_typeof"("geographic_scope") = 'object'::"text"))),
    CONSTRAINT "campaigns_key_messages_check" CHECK ((("key_messages" IS NULL) OR ("jsonb_typeof"("key_messages") = ANY (ARRAY['array'::"text", 'object'::"text"])))),
    CONSTRAINT "campaigns_launch_checklist_check" CHECK ((("launch_checklist" IS NULL) OR ("jsonb_typeof"("launch_checklist") = 'object'::"text"))),
    CONSTRAINT "campaigns_performance_metrics_check" CHECK ((("performance_metrics" IS NULL) OR ("jsonb_typeof"("performance_metrics") = 'object'::"text"))),
    CONSTRAINT "campaigns_public_id_format_check" CHECK ((("public_id")::"text" ~ '^CAM-[0-9]{4}$'::"text")),
    CONSTRAINT "campaigns_roi_actual_check" CHECK ((("roi_actual" IS NULL) OR ("roi_actual" > (0)::numeric))),
    CONSTRAINT "campaigns_roi_target_check" CHECK ((("roi_target" IS NULL) OR ("roi_target" > (0)::numeric))),
    CONSTRAINT "campaigns_success_criteria_check" CHECK ((("success_criteria" IS NULL) OR ("jsonb_typeof"("success_criteria") = 'object'::"text"))),
    CONSTRAINT "campaigns_target_audience_check" CHECK ((("target_audience" IS NULL) OR ("jsonb_typeof"("target_audience") = 'object'::"text")))
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


COMMENT ON TABLE "public"."campaigns" IS 'Campañas de marketing por marca';



COMMENT ON COLUMN "public"."campaigns"."name" IS 'ej: "Verano 2025", "Lanzamiento Sprite Zero", "Back to School"';



COMMENT ON COLUMN "public"."campaigns"."description" IS 'descripción detallada de la campaña';



COMMENT ON COLUMN "public"."campaigns"."start_date" IS 'fecha de inicio de la campaña';



COMMENT ON COLUMN "public"."campaigns"."end_date" IS 'fecha de finalización de la campaña';



COMMENT ON COLUMN "public"."campaigns"."budget_total" IS 'presupuesto total asignado';



COMMENT ON COLUMN "public"."campaigns"."budget_spent" IS 'presupuesto gastado hasta el momento';



COMMENT ON COLUMN "public"."campaigns"."target_audience" IS 'definición de audiencia objetivo';



COMMENT ON COLUMN "public"."campaigns"."campaign_objectives" IS 'objetivos específicos y KPIs';



COMMENT ON COLUMN "public"."campaigns"."key_messages" IS 'mensajes clave de la campaña';



COMMENT ON COLUMN "public"."campaigns"."channels" IS 'canales de comunicación utilizados';



COMMENT ON COLUMN "public"."campaigns"."geographic_scope" IS 'zonas geográficas donde aplica';



COMMENT ON COLUMN "public"."campaigns"."created_by" IS 'brand manager que creó';



COMMENT ON COLUMN "public"."campaigns"."approved_by" IS 'administrador que aprobó';



COMMENT ON COLUMN "public"."campaigns"."approved_at" IS 'momento de aprobación';



COMMENT ON COLUMN "public"."campaigns"."approval_notes" IS 'notas sobre la aprobación';



COMMENT ON COLUMN "public"."campaigns"."launch_ready" IS 'si está lista para lanzar';



COMMENT ON COLUMN "public"."campaigns"."launch_checklist" IS 'checklist de elementos para lanzamiento';



COMMENT ON COLUMN "public"."campaigns"."performance_metrics" IS 'métricas de rendimiento calculadas';



COMMENT ON COLUMN "public"."campaigns"."roi_target" IS 'ROI objetivo como decimal: 1.50 = 150%';



COMMENT ON COLUMN "public"."campaigns"."roi_actual" IS 'ROI real calculado';



COMMENT ON COLUMN "public"."campaigns"."campaign_tags" IS 'tags para categorización y búsqueda';



COMMENT ON COLUMN "public"."campaigns"."competitive_context" IS 'contexto competitivo y diferenciadores';



COMMENT ON COLUMN "public"."campaigns"."success_criteria" IS 'criterios específicos de éxito';



COMMENT ON COLUMN "public"."campaigns"."post_campaign_analysis" IS 'análisis post-campaña';



COMMENT ON COLUMN "public"."campaigns"."lessons_learned" IS 'aprendizajes para futuras campañas';



COMMENT ON COLUMN "public"."campaigns"."attachments" IS 'documentos, creativos, assets de la campaña';



COMMENT ON COLUMN "public"."campaigns"."is_template" IS 'si puede usarse como plantilla';



COMMENT ON COLUMN "public"."campaigns"."template_name" IS 'nombre para uso como plantilla';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_user_profile_public_id"() NOT NULL,
    "employee_code" character varying(50),
    "first_name" character varying(100) NOT NULL,
    "last_name" character varying(100) NOT NULL,
    "email" character varying(255) NOT NULL,
    "phone" character varying(20),
    "avatar_url" character varying(500),
    "position" character varying(100),
    "department" character varying(100),
    "hire_date" "date",
    "manager_id" "uuid",
    "status" "public"."user_profile_status_enum" DEFAULT 'active'::"public"."user_profile_status_enum",
    "preferences" "jsonb",
    "last_login_at" timestamp with time zone,
    "timezone" character varying(50) DEFAULT 'America/Mexico_City'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "tenant_id" "uuid" DEFAULT 'fe0f429d-2d83-4738-af65-32c655cef656'::"uuid" NOT NULL,
    CONSTRAINT "user_profiles_manager_self_check" CHECK (("manager_id" <> "id")),
    CONSTRAINT "user_profiles_public_id_format_check" CHECK ((("public_id")::"text" ~ '^USR-[0-9]{4}$'::"text"))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_profiles" IS 'Perfiles de usuarios del sistema';



COMMENT ON COLUMN "public"."user_profiles"."employee_code" IS 'código de empleado interno';



COMMENT ON COLUMN "public"."user_profiles"."email" IS 'sincronizado con auth.users.email';



COMMENT ON COLUMN "public"."user_profiles"."avatar_url" IS 'URL de avatar en Supabase Storage';



COMMENT ON COLUMN "public"."user_profiles"."position" IS 'cargo/posición en la empresa';



COMMENT ON COLUMN "public"."user_profiles"."manager_id" IS 'supervisor directo';



COMMENT ON COLUMN "public"."user_profiles"."preferences" IS 'preferencias de usuario: idioma, tema, notificaciones';



CREATE OR REPLACE VIEW "public"."active_campaigns" AS
 SELECT "c"."id",
    "c"."public_id",
    "c"."tenant_id",
    "c"."brand_id",
    "c"."name",
    "c"."description",
    "c"."campaign_type",
    "c"."status",
    "c"."start_date",
    "c"."end_date",
    "c"."budget_total",
    "c"."budget_spent",
    "c"."target_audience",
    "c"."campaign_objectives",
    "c"."key_messages",
    "c"."channels",
    "c"."geographic_scope",
    "c"."created_by",
    "c"."approved_by",
    "c"."approved_at",
    "c"."approval_notes",
    "c"."launch_ready",
    "c"."launch_checklist",
    "c"."performance_metrics",
    "c"."roi_target",
    "c"."roi_actual",
    "c"."campaign_tags",
    "c"."competitive_context",
    "c"."success_criteria",
    "c"."post_campaign_analysis",
    "c"."lessons_learned",
    "c"."attachments",
    "c"."is_template",
    "c"."template_name",
    "c"."created_at",
    "c"."updated_at",
    "c"."deleted_at",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "up_created"."first_name" AS "created_by_first_name",
    "up_created"."last_name" AS "created_by_last_name",
    "up_approved"."first_name" AS "approved_by_first_name",
    "up_approved"."last_name" AS "approved_by_last_name",
    "tn"."name" AS "tenant_name",
        CASE
            WHEN ("c"."status" = 'cancelled'::"public"."campaign_status_enum") THEN 'cancelled'::"text"
            WHEN ("c"."status" = 'completed'::"public"."campaign_status_enum") THEN 'completed'::"text"
            WHEN (("c"."end_date" < CURRENT_DATE) AND ("c"."status" = 'active'::"public"."campaign_status_enum")) THEN 'expired'::"text"
            WHEN (("c"."start_date" > CURRENT_DATE) AND ("c"."status" = 'active'::"public"."campaign_status_enum")) THEN 'scheduled'::"text"
            WHEN (("c"."status" = 'active'::"public"."campaign_status_enum") AND ("c"."start_date" <= CURRENT_DATE) AND ("c"."end_date" >= CURRENT_DATE)) THEN 'running'::"text"
            ELSE ("c"."status")::"text"
        END AS "campaign_display_status",
    ("c"."end_date" - "c"."start_date") AS "campaign_duration_days",
        CASE
            WHEN ("c"."start_date" <= CURRENT_DATE) THEN (CURRENT_DATE - "c"."start_date")
            ELSE NULL::integer
        END AS "days_since_start",
        CASE
            WHEN ("c"."end_date" >= CURRENT_DATE) THEN ("c"."end_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_end",
        CASE
            WHEN ("c"."start_date" > CURRENT_DATE) THEN (0)::numeric
            WHEN ("c"."end_date" < CURRENT_DATE) THEN (100)::numeric
            ELSE ((((CURRENT_DATE - "c"."start_date"))::numeric / (("c"."end_date" - "c"."start_date"))::numeric) * (100)::numeric)
        END AS "campaign_progress_percentage",
        CASE
            WHEN (("c"."budget_total" IS NOT NULL) AND ("c"."budget_total" > (0)::numeric)) THEN (("c"."budget_spent" / "c"."budget_total") * (100)::numeric)
            ELSE NULL::numeric
        END AS "budget_utilization_percentage",
        CASE
            WHEN ("c"."budget_total" IS NOT NULL) THEN ("c"."budget_total" - "c"."budget_spent")
            ELSE NULL::numeric
        END AS "budget_remaining",
        CASE
            WHEN (("c"."roi_target" IS NOT NULL) AND ("c"."roi_actual" IS NOT NULL)) THEN ("c"."roi_actual" - "c"."roi_target")
            ELSE NULL::numeric
        END AS "roi_variance",
        CASE
            WHEN ("c"."attachments" IS NOT NULL) THEN "jsonb_array_length"("c"."attachments")
            ELSE 0
        END AS "attachments_count",
        CASE
            WHEN ("c"."campaign_tags" IS NOT NULL) THEN "jsonb_array_length"("c"."campaign_tags")
            ELSE 0
        END AS "tags_count"
   FROM (((("public"."campaigns" "c"
     JOIN "public"."brands" "b" ON (("c"."brand_id" = "b"."id")))
     JOIN "public"."user_profiles" "up_created" ON (("c"."created_by" = "up_created"."id")))
     LEFT JOIN "public"."user_profiles" "up_approved" ON (("c"."approved_by" = "up_approved"."id")))
     JOIN "public"."tenants" "tn" ON (("c"."tenant_id" = "tn"."id")))
  WHERE (("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("up_created"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "c"."start_date" DESC, "c"."created_at" DESC;


ALTER VIEW "public"."active_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_brand_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_client_brand_membership_public_id"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "membership_status" "public"."membership_status_enum" DEFAULT 'pending'::"public"."membership_status_enum",
    "joined_date" "date",
    "approved_by" "uuid",
    "approved_date" "date",
    "current_tier_id" "uuid",
    "lifetime_points" numeric(12,2) DEFAULT 0.00,
    "points_balance" numeric(10,2) DEFAULT 0.00,
    "last_purchase_date" "date",
    "last_points_earned_date" "date",
    "membership_preferences" "jsonb",
    "terms_accepted_date" timestamp with time zone,
    "terms_version" character varying(20),
    "is_primary_brand" boolean DEFAULT false,
    "communication_preferences" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "client_brand_memberships_communication_preferences_check" CHECK ((("communication_preferences" IS NULL) OR ("jsonb_typeof"("communication_preferences") = 'object'::"text"))),
    CONSTRAINT "client_brand_memberships_lifetime_points_check" CHECK (("lifetime_points" >= (0)::numeric)),
    CONSTRAINT "client_brand_memberships_membership_preferences_check" CHECK ((("membership_preferences" IS NULL) OR ("jsonb_typeof"("membership_preferences") = 'object'::"text"))),
    CONSTRAINT "client_brand_memberships_points_balance_check" CHECK (("points_balance" >= (0)::numeric)),
    CONSTRAINT "client_brand_memberships_points_relationship_check" CHECK (("points_balance" <= "lifetime_points")),
    CONSTRAINT "client_brand_memberships_public_id_format_check" CHECK ((("public_id")::"text" ~ '^CBM-[0-9]{4}$'::"text"))
);


ALTER TABLE "public"."client_brand_memberships" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_brand_memberships" IS 'Permite que un cliente tenga beneficios en múltiples marcas';



COMMENT ON COLUMN "public"."client_brand_memberships"."joined_date" IS 'fecha de alta en la marca';



COMMENT ON COLUMN "public"."client_brand_memberships"."approved_by" IS 'quién aprobó la membresía';



COMMENT ON COLUMN "public"."client_brand_memberships"."current_tier_id" IS 'tier actual en esta marca';



COMMENT ON COLUMN "public"."client_brand_memberships"."lifetime_points" IS 'puntos totales ganados históricos - nunca se reduce';



COMMENT ON COLUMN "public"."client_brand_memberships"."points_balance" IS 'puntos disponibles para canje';



COMMENT ON COLUMN "public"."client_brand_memberships"."last_purchase_date" IS 'última compra en esta marca';



COMMENT ON COLUMN "public"."client_brand_memberships"."membership_preferences" IS 'preferencias específicas por marca';



COMMENT ON COLUMN "public"."client_brand_memberships"."terms_accepted_date" IS 'cuándo aceptó términos y condiciones';



COMMENT ON COLUMN "public"."client_brand_memberships"."terms_version" IS 'versión de términos aceptada';



COMMENT ON COLUMN "public"."client_brand_memberships"."is_primary_brand" IS 'marca principal del cliente';



COMMENT ON COLUMN "public"."client_brand_memberships"."communication_preferences" IS 'preferencias de comunicación por marca';



CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_client_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "business_name" character varying(255) NOT NULL,
    "legal_name" character varying(255),
    "owner_name" character varying(255) NOT NULL,
    "email" character varying(255),
    "phone" character varying(20),
    "whatsapp" character varying(20),
    "tax_id" character varying(50),
    "zone_id" "uuid" NOT NULL,
    "market_id" "uuid" NOT NULL,
    "client_type_id" "uuid" NOT NULL,
    "commercial_structure_id" "uuid" NOT NULL,
    "address_street" "text" NOT NULL,
    "address_neighborhood" character varying(255),
    "address_city" character varying(255) NOT NULL,
    "address_state" character varying(100) NOT NULL,
    "address_postal_code" character varying(20),
    "address_country" character varying(2) DEFAULT 'MX'::character varying,
    "coordinates" "point",
    "visit_frequency_days" integer,
    "assessment_frequency_days" integer,
    "payment_terms" character varying(100),
    "minimum_order" numeric(12,2),
    "credit_limit" numeric(12,2) DEFAULT 0.00,
    "status" "public"."client_status_enum" DEFAULT 'prospect'::"public"."client_status_enum",
    "registration_date" "date",
    "last_visit_date" "date",
    "notes" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    CONSTRAINT "clients_address_country_check" CHECK ((("address_country")::"text" ~ '^[A-Z]{2}$'::"text")),
    CONSTRAINT "clients_assessment_frequency_check" CHECK ((("assessment_frequency_days" IS NULL) OR ("assessment_frequency_days" > 0))),
    CONSTRAINT "clients_coordinates_check" CHECK ((("coordinates" IS NULL) OR ((("coordinates"[0] >= ('-180'::integer)::double precision) AND ("coordinates"[0] <= (180)::double precision)) AND (("coordinates"[1] >= ('-90'::integer)::double precision) AND ("coordinates"[1] <= (90)::double precision))))),
    CONSTRAINT "clients_credit_limit_check" CHECK (("credit_limit" >= (0)::numeric)),
    CONSTRAINT "clients_dates_check" CHECK ((("registration_date" IS NULL) OR ("last_visit_date" IS NULL) OR ("registration_date" <= "last_visit_date"))),
    CONSTRAINT "clients_email_format_check" CHECK ((("email" IS NULL) OR (("email")::"text" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text"))),
    CONSTRAINT "clients_minimum_order_check" CHECK ((("minimum_order" IS NULL) OR ("minimum_order" > (0)::numeric))),
    CONSTRAINT "clients_public_id_format_check" CHECK ((("public_id")::"text" ~ '^CLI-[0-9]{4}$'::"text")),
    CONSTRAINT "clients_visit_frequency_check" CHECK ((("visit_frequency_days" IS NULL) OR ("visit_frequency_days" > 0)))
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


COMMENT ON TABLE "public"."clients" IS 'Puntos de venta/tiendas que visitan los asesores';



COMMENT ON COLUMN "public"."clients"."visit_frequency_days" IS 'null = usa client_types.default_visit_frequency_days';



COMMENT ON COLUMN "public"."clients"."assessment_frequency_days" IS 'null = usa client_types.assessment_frequency_days';



COMMENT ON COLUMN "public"."clients"."payment_terms" IS 'null = usa commercial_structures.payment_terms';



COMMENT ON COLUMN "public"."clients"."minimum_order" IS 'null = usa commercial_structures.minimum_order';



COMMENT ON COLUMN "public"."clients"."metadata" IS 'Características físicas del punto de venta, Horarios y operación, Competencia y contexto comercial,  Preferencias específicas del cliente';



COMMENT ON COLUMN "public"."clients"."latitude" IS 'GPS latitude of client store location';



COMMENT ON COLUMN "public"."clients"."longitude" IS 'GPS longitude of client store location';



CREATE OR REPLACE VIEW "public"."active_client_brand_memberships" AS
 SELECT "cbm"."id",
    "cbm"."public_id",
    "cbm"."client_id",
    "cbm"."brand_id",
    "cbm"."tenant_id",
    "cbm"."membership_status",
    "cbm"."joined_date",
    "cbm"."approved_by",
    "cbm"."approved_date",
    "cbm"."current_tier_id",
    "cbm"."lifetime_points",
    "cbm"."points_balance",
    "cbm"."last_purchase_date",
    "cbm"."last_points_earned_date",
    "cbm"."membership_preferences",
    "cbm"."terms_accepted_date",
    "cbm"."terms_version",
    "cbm"."is_primary_brand",
    "cbm"."communication_preferences",
    "cbm"."created_at",
    "cbm"."updated_at",
    "cbm"."deleted_at",
    "c"."business_name" AS "client_business_name",
    "c"."owner_name" AS "client_owner_name",
    "c"."email" AS "client_email",
    "c"."status" AS "client_status",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "b"."status" AS "brand_status",
    "t"."name" AS "tenant_name",
    "t"."slug" AS "tenant_slug",
    "up"."first_name" AS "approved_by_first_name",
    "up"."last_name" AS "approved_by_last_name",
        CASE
            WHEN ("cbm"."lifetime_points" > (0)::numeric) THEN (("cbm"."points_balance" / "cbm"."lifetime_points") * (100)::numeric)
            ELSE (0)::numeric
        END AS "points_utilization_rate",
        CASE
            WHEN ("cbm"."last_purchase_date" IS NOT NULL) THEN (CURRENT_DATE - "cbm"."last_purchase_date")
            ELSE NULL::integer
        END AS "days_since_last_purchase",
        CASE
            WHEN ("cbm"."joined_date" IS NOT NULL) THEN (CURRENT_DATE - "cbm"."joined_date")
            ELSE NULL::integer
        END AS "membership_days"
   FROM (((("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     JOIN "public"."tenants" "t" ON (("cbm"."tenant_id" = "t"."id")))
     LEFT JOIN "public"."user_profiles" "up" ON (("cbm"."approved_by" = "up"."id")))
  WHERE (("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  ORDER BY "cbm"."tenant_id", "cbm"."brand_id", "cbm"."joined_date" DESC;


ALTER VIEW "public"."active_client_brand_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_invoice_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_client_invoice_data_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "person_type" "public"."rfc_person_type_enum" NOT NULL,
    "invoice_name" character varying(255) NOT NULL,
    "rfc" character varying(15) NOT NULL,
    "business_name" character varying(255) NOT NULL,
    "address_street" "text",
    "address_neighborhood" character varying(255),
    "address_city" character varying(255),
    "address_state" character varying(100),
    "address_postal_code" character varying(10) NOT NULL,
    "address_country" character varying(2) DEFAULT 'MX'::character varying,
    "cfdi_use" character varying(10) DEFAULT 'G03'::character varying,
    "payment_form" character varying(10) DEFAULT '01'::character varying,
    "payment_method" character varying(10) DEFAULT 'PUE'::character varying,
    "email_invoice" character varying(255),
    "is_preferred" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "tax_regime" character varying(100),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "client_invoice_data_address_country_check" CHECK ((("address_country")::"text" ~ '^[A-Z]{2}$'::"text")),
    CONSTRAINT "client_invoice_data_cfdi_use_check" CHECK ((("cfdi_use")::"text" = ANY ((ARRAY['G01'::character varying, 'G02'::character varying, 'G03'::character varying, 'I01'::character varying, 'I02'::character varying, 'I03'::character varying, 'I04'::character varying, 'I05'::character varying, 'I06'::character varying, 'I07'::character varying, 'I08'::character varying, 'D01'::character varying, 'D02'::character varying, 'D03'::character varying, 'D04'::character varying, 'D05'::character varying, 'D06'::character varying, 'D07'::character varying, 'D08'::character varying, 'D09'::character varying, 'D10'::character varying, 'P01'::character varying, 'S01'::character varying, 'CP01'::character varying, 'CN01'::character varying])::"text"[]))),
    CONSTRAINT "client_invoice_data_email_format_check" CHECK ((("email_invoice" IS NULL) OR (("email_invoice")::"text" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text"))),
    CONSTRAINT "client_invoice_data_payment_form_check" CHECK ((("payment_form")::"text" = ANY ((ARRAY['01'::character varying, '02'::character varying, '03'::character varying, '04'::character varying, '05'::character varying, '06'::character varying, '08'::character varying, '12'::character varying, '13'::character varying, '14'::character varying, '15'::character varying, '17'::character varying, '23'::character varying, '24'::character varying, '25'::character varying, '26'::character varying, '27'::character varying, '28'::character varying, '29'::character varying, '30'::character varying, '99'::character varying])::"text"[]))),
    CONSTRAINT "client_invoice_data_payment_method_check" CHECK ((("payment_method")::"text" = ANY ((ARRAY['PUE'::character varying, 'PPD'::character varying])::"text"[]))),
    CONSTRAINT "client_invoice_data_postal_code_check" CHECK ((("address_postal_code")::"text" ~ '^[0-9]{5}$'::"text")),
    CONSTRAINT "client_invoice_data_public_id_format_check" CHECK ((("public_id")::"text" ~ '^CID-[0-9]{4}$'::"text")),
    CONSTRAINT "client_invoice_data_rfc_format_check" CHECK (((("person_type" = 'fisica'::"public"."rfc_person_type_enum") AND (("rfc")::"text" ~ '^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$'::"text") AND ("length"(("rfc")::"text") = 13)) OR (("person_type" = 'moral'::"public"."rfc_person_type_enum") AND (("rfc")::"text" ~ '^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$'::"text") AND ("length"(("rfc")::"text") = 12))))
);


ALTER TABLE "public"."client_invoice_data" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_invoice_data" IS 'almacena los datos de facturación de los clientes';



COMMENT ON COLUMN "public"."client_invoice_data"."invoice_name" IS 'nombre descriptivo: "Matriz", "Sucursal Norte"';



COMMENT ON COLUMN "public"."client_invoice_data"."business_name" IS 'razón social';



COMMENT ON COLUMN "public"."client_invoice_data"."email_invoice" IS 'email para envío de facturas';



COMMENT ON COLUMN "public"."client_invoice_data"."notes" IS 'observaciones sobre estos datos fiscales';



CREATE OR REPLACE VIEW "public"."active_client_invoice_data" AS
 SELECT "cid"."id",
    "cid"."public_id",
    "cid"."tenant_id",
    "cid"."client_id",
    "cid"."person_type",
    "cid"."invoice_name",
    "cid"."rfc",
    "cid"."business_name",
    "cid"."address_street",
    "cid"."address_neighborhood",
    "cid"."address_city",
    "cid"."address_state",
    "cid"."address_postal_code",
    "cid"."address_country",
    "cid"."cfdi_use",
    "cid"."payment_form",
    "cid"."payment_method",
    "cid"."email_invoice",
    "cid"."is_preferred",
    "cid"."is_active",
    "cid"."tax_regime",
    "cid"."notes",
    "cid"."created_at",
    "cid"."updated_at",
    "cid"."deleted_at",
    "c"."business_name" AS "client_business_name",
    "c"."owner_name" AS "client_owner_name",
    "c"."email" AS "client_email",
    "t"."name" AS "tenant_name",
        CASE
            WHEN ("cid"."person_type" = 'fisica'::"public"."rfc_person_type_enum") THEN 'Persona Física'::"text"
            WHEN ("cid"."person_type" = 'moral'::"public"."rfc_person_type_enum") THEN 'Persona Moral'::"text"
            ELSE 'No definido'::"text"
        END AS "person_type_description",
    "concat_ws"(', '::"text", "cid"."address_street", "cid"."address_neighborhood", "cid"."address_city", "cid"."address_state", ('CP '::"text" || ("cid"."address_postal_code")::"text"),
        CASE
            WHEN (("cid"."address_country")::"text" <> 'MX'::"text") THEN "cid"."address_country"
            ELSE NULL::character varying
        END) AS "full_address",
        CASE
            WHEN (("cid"."cfdi_use")::"text" = 'G01'::"text") THEN 'Adquisición de mercancías'::character varying
            WHEN (("cid"."cfdi_use")::"text" = 'G02'::"text") THEN 'Devoluciones, descuentos o bonificaciones'::character varying
            WHEN (("cid"."cfdi_use")::"text" = 'G03'::"text") THEN 'Gastos en general'::character varying
            WHEN (("cid"."cfdi_use")::"text" = 'I01'::"text") THEN 'Construcciones'::character varying
            WHEN (("cid"."cfdi_use")::"text" = 'I02'::"text") THEN 'Mobilario y equipo de oficina por inversiones'::character varying
            WHEN (("cid"."cfdi_use")::"text" = 'P01'::"text") THEN 'Por definir'::character varying
            ELSE "cid"."cfdi_use"
        END AS "cfdi_use_description",
        CASE
            WHEN (("cid"."payment_form")::"text" = '01'::"text") THEN 'Efectivo'::character varying
            WHEN (("cid"."payment_form")::"text" = '02'::"text") THEN 'Cheque nominativo'::character varying
            WHEN (("cid"."payment_form")::"text" = '03'::"text") THEN 'Transferencia electrónica de fondos'::character varying
            WHEN (("cid"."payment_form")::"text" = '04'::"text") THEN 'Tarjeta de crédito'::character varying
            WHEN (("cid"."payment_form")::"text" = '28'::"text") THEN 'Tarjeta de débito'::character varying
            WHEN (("cid"."payment_form")::"text" = '99'::"text") THEN 'Por definir'::character varying
            ELSE "cid"."payment_form"
        END AS "payment_form_description",
        CASE
            WHEN (("cid"."payment_method")::"text" = 'PUE'::"text") THEN 'Pago en una sola exhibición'::character varying
            WHEN (("cid"."payment_method")::"text" = 'PPD'::"text") THEN 'Pago en parcialidades o diferido'::character varying
            ELSE "cid"."payment_method"
        END AS "payment_method_description"
   FROM (("public"."client_invoice_data" "cid"
     JOIN "public"."clients" "c" ON (("cid"."client_id" = "c"."id")))
     JOIN "public"."tenants" "t" ON (("cid"."tenant_id" = "t"."id")))
  WHERE (("cid"."deleted_at" IS NULL) AND ("cid"."is_active" = true) AND ("c"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  ORDER BY "cid"."client_id", "cid"."is_preferred" DESC, "cid"."invoice_name";


ALTER VIEW "public"."active_client_invoice_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_tier_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_client_tier_assignment_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "client_brand_membership_id" "uuid" NOT NULL,
    "tier_id" "uuid" NOT NULL,
    "assignment_type" "public"."tier_assignment_type_enum" NOT NULL,
    "assigned_by" "uuid",
    "assigned_date" "date" NOT NULL,
    "effective_from" "date" NOT NULL,
    "effective_until" "date",
    "previous_tier_id" "uuid",
    "reason" "text",
    "points_at_assignment" numeric(12,2),
    "visits_at_assignment" integer,
    "purchases_at_assignment" integer,
    "purchase_amount_at_assignment" numeric(12,2),
    "evaluation_period_start" "date",
    "evaluation_period_end" "date",
    "is_current" boolean DEFAULT true,
    "auto_assignment_rule_id" "uuid",
    "notification_sent" boolean DEFAULT false,
    "notification_sent_at" timestamp with time zone,
    "client_acknowledgment" boolean DEFAULT false,
    "benefits_activated" boolean DEFAULT true,
    "assignment_notes" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "client_tier_assignments_effective_dates_check" CHECK ((("effective_until" IS NULL) OR ("effective_from" <= "effective_until"))),
    CONSTRAINT "client_tier_assignments_evaluation_period_check" CHECK ((("evaluation_period_start" IS NULL) OR ("evaluation_period_end" IS NULL) OR ("evaluation_period_start" < "evaluation_period_end"))),
    CONSTRAINT "client_tier_assignments_metadata_check" CHECK ((("metadata" IS NULL) OR ("jsonb_typeof"("metadata") = 'object'::"text"))),
    CONSTRAINT "client_tier_assignments_points_at_assignment_check" CHECK ((("points_at_assignment" IS NULL) OR ("points_at_assignment" >= (0)::numeric))),
    CONSTRAINT "client_tier_assignments_public_id_format_check" CHECK ((("public_id")::"text" ~ '^CTA-[0-9]{4}$'::"text")),
    CONSTRAINT "client_tier_assignments_purchase_amount_at_assignment_check" CHECK ((("purchase_amount_at_assignment" IS NULL) OR ("purchase_amount_at_assignment" >= (0)::numeric))),
    CONSTRAINT "client_tier_assignments_purchases_at_assignment_check" CHECK ((("purchases_at_assignment" IS NULL) OR ("purchases_at_assignment" >= 0))),
    CONSTRAINT "client_tier_assignments_visits_at_assignment_check" CHECK ((("visits_at_assignment" IS NULL) OR ("visits_at_assignment" >= 0)))
);


ALTER TABLE "public"."client_tier_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tier_assignments" IS 'Qué tier tiene cada cliente en cada marca';



COMMENT ON COLUMN "public"."client_tier_assignments"."assigned_by" IS 'quién asignó el tier manualmente';



COMMENT ON COLUMN "public"."client_tier_assignments"."assigned_date" IS 'fecha de asignación del tier';



COMMENT ON COLUMN "public"."client_tier_assignments"."effective_from" IS 'fecha desde que es efectivo el tier';



COMMENT ON COLUMN "public"."client_tier_assignments"."effective_until" IS 'fecha hasta que es efectivo, null = indefinido';



COMMENT ON COLUMN "public"."client_tier_assignments"."previous_tier_id" IS 'tier anterior del cliente';



COMMENT ON COLUMN "public"."client_tier_assignments"."reason" IS 'razón del cambio de tier';



COMMENT ON COLUMN "public"."client_tier_assignments"."points_at_assignment" IS 'puntos que tenía el cliente al momento de asignación';



COMMENT ON COLUMN "public"."client_tier_assignments"."visits_at_assignment" IS 'visitas que tenía al momento de asignación';



COMMENT ON COLUMN "public"."client_tier_assignments"."purchases_at_assignment" IS 'compras que tenía al momento de asignación';



COMMENT ON COLUMN "public"."client_tier_assignments"."purchase_amount_at_assignment" IS 'monto total de compras al momento de asignación';



COMMENT ON COLUMN "public"."client_tier_assignments"."evaluation_period_start" IS 'inicio del período evaluado para esta asignación';



COMMENT ON COLUMN "public"."client_tier_assignments"."evaluation_period_end" IS 'fin del período evaluado para esta asignación';



COMMENT ON COLUMN "public"."client_tier_assignments"."is_current" IS 'si es la asignación actual vigente';



COMMENT ON COLUMN "public"."client_tier_assignments"."auto_assignment_rule_id" IS 'referencia a regla automática que ejecutó el cambio';



COMMENT ON COLUMN "public"."client_tier_assignments"."notification_sent" IS 'si se notificó al cliente del cambio';



COMMENT ON COLUMN "public"."client_tier_assignments"."client_acknowledgment" IS 'si el cliente reconoció el cambio';



COMMENT ON COLUMN "public"."client_tier_assignments"."benefits_activated" IS 'si los beneficios están activos';



COMMENT ON COLUMN "public"."client_tier_assignments"."assignment_notes" IS 'notas adicionales sobre la asignación';



COMMENT ON COLUMN "public"."client_tier_assignments"."metadata" IS 'datos adicionales para análisis';



CREATE TABLE IF NOT EXISTS "public"."tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_tier_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "code" character varying(50) NOT NULL,
    "description" "text",
    "tier_level" integer NOT NULL,
    "min_points_required" numeric(12,2) NOT NULL,
    "min_visits_required" integer DEFAULT 0,
    "min_purchases_required" integer DEFAULT 0,
    "min_purchase_amount" numeric(12,2) DEFAULT 0.00,
    "evaluation_period_months" integer DEFAULT 12,
    "points_multiplier" numeric(5,2) DEFAULT 1.00,
    "discount_percentage" numeric(5,2) DEFAULT 0.00,
    "benefits" "jsonb",
    "requirements" "jsonb",
    "tier_color" character varying(7),
    "tier_icon_url" character varying(500),
    "badge_image_url" character varying(500),
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "auto_assignment_enabled" boolean DEFAULT false,
    "auto_assignment_rules" "jsonb",
    "retention_period_months" integer DEFAULT 12,
    "downgrade_enabled" boolean DEFAULT true,
    "upgrade_notification" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "tiers_auto_assignment_rules_check" CHECK ((("auto_assignment_rules" IS NULL) OR ("jsonb_typeof"("auto_assignment_rules") = 'object'::"text"))),
    CONSTRAINT "tiers_benefits_check" CHECK ((("benefits" IS NULL) OR ("jsonb_typeof"("benefits") = 'array'::"text"))),
    CONSTRAINT "tiers_discount_percentage_check" CHECK ((("discount_percentage" >= 0.00) AND ("discount_percentage" <= 100.00))),
    CONSTRAINT "tiers_evaluation_period_months_check" CHECK (("evaluation_period_months" > 0)),
    CONSTRAINT "tiers_min_points_required_check" CHECK (("min_points_required" >= (0)::numeric)),
    CONSTRAINT "tiers_min_purchase_amount_check" CHECK (("min_purchase_amount" >= (0)::numeric)),
    CONSTRAINT "tiers_min_purchases_required_check" CHECK (("min_purchases_required" >= 0)),
    CONSTRAINT "tiers_min_visits_required_check" CHECK (("min_visits_required" >= 0)),
    CONSTRAINT "tiers_points_multiplier_check" CHECK (("points_multiplier" > (0)::numeric)),
    CONSTRAINT "tiers_public_id_format_check" CHECK ((("public_id")::"text" ~ '^TIR-[0-9]{4}$'::"text")),
    CONSTRAINT "tiers_requirements_check" CHECK ((("requirements" IS NULL) OR ("jsonb_typeof"("requirements") = 'object'::"text"))),
    CONSTRAINT "tiers_retention_period_months_check" CHECK (("retention_period_months" > 0)),
    CONSTRAINT "tiers_tier_color_format_check" CHECK ((("tier_color" IS NULL) OR (("tier_color")::"text" ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'::"text"))),
    CONSTRAINT "tiers_tier_level_check" CHECK (("tier_level" > 0))
);


ALTER TABLE "public"."tiers" OWNER TO "postgres";


COMMENT ON TABLE "public"."tiers" IS 'define los niveles de fidelización por marca';



COMMENT ON COLUMN "public"."tiers"."name" IS 'ej: "Bronce", "Plata", "Oro", "Diamante"';



COMMENT ON COLUMN "public"."tiers"."code" IS 'código corto: "BRONZE", "SILVER", "GOLD", "DIAMOND"';



COMMENT ON COLUMN "public"."tiers"."description" IS 'descripción del tier y sus beneficios';



COMMENT ON COLUMN "public"."tiers"."tier_level" IS 'nivel jerárquico: 1=básico, 2=intermedio, etc.';



COMMENT ON COLUMN "public"."tiers"."min_points_required" IS 'puntos mínimos para calificar';



COMMENT ON COLUMN "public"."tiers"."min_visits_required" IS 'visitas mínimas para calificar';



COMMENT ON COLUMN "public"."tiers"."min_purchases_required" IS 'compras mínimas para calificar';



COMMENT ON COLUMN "public"."tiers"."min_purchase_amount" IS 'monto mínimo de compras';



COMMENT ON COLUMN "public"."tiers"."evaluation_period_months" IS 'período de evaluación en meses';



COMMENT ON COLUMN "public"."tiers"."points_multiplier" IS 'multiplicador de puntos para este tier';



COMMENT ON COLUMN "public"."tiers"."discount_percentage" IS 'descuento automático por tier';



COMMENT ON COLUMN "public"."tiers"."benefits" IS 'lista de beneficios específicos del tier';



COMMENT ON COLUMN "public"."tiers"."requirements" IS 'requisitos adicionales para mantener el tier';



COMMENT ON COLUMN "public"."tiers"."tier_color" IS 'color hex para UI: #FFD700 para oro';



COMMENT ON COLUMN "public"."tiers"."tier_icon_url" IS 'URL del ícono del tier';



COMMENT ON COLUMN "public"."tiers"."badge_image_url" IS 'URL de la imagen del badge';



COMMENT ON COLUMN "public"."tiers"."is_default" IS 'tier por defecto para nuevos miembros?';



COMMENT ON COLUMN "public"."tiers"."auto_assignment_enabled" IS 'permite asignación automática futura';



COMMENT ON COLUMN "public"."tiers"."auto_assignment_rules" IS 'reglas para asignación automática';



COMMENT ON COLUMN "public"."tiers"."retention_period_months" IS 'meses para mantener tier sin actividad';



COMMENT ON COLUMN "public"."tiers"."downgrade_enabled" IS 'permite degradar tier';



COMMENT ON COLUMN "public"."tiers"."upgrade_notification" IS 'notificar al subir tier';



CREATE OR REPLACE VIEW "public"."active_client_tier_assignments" AS
 SELECT "cta"."id",
    "cta"."public_id",
    "cta"."tenant_id",
    "cta"."client_brand_membership_id",
    "cta"."tier_id",
    "cta"."assignment_type",
    "cta"."assigned_by",
    "cta"."assigned_date",
    "cta"."effective_from",
    "cta"."effective_until",
    "cta"."previous_tier_id",
    "cta"."reason",
    "cta"."points_at_assignment",
    "cta"."visits_at_assignment",
    "cta"."purchases_at_assignment",
    "cta"."purchase_amount_at_assignment",
    "cta"."evaluation_period_start",
    "cta"."evaluation_period_end",
    "cta"."is_current",
    "cta"."auto_assignment_rule_id",
    "cta"."notification_sent",
    "cta"."notification_sent_at",
    "cta"."client_acknowledgment",
    "cta"."benefits_activated",
    "cta"."assignment_notes",
    "cta"."metadata",
    "cta"."created_at",
    "cta"."updated_at",
    "cta"."deleted_at",
    "cbm"."client_id",
    "cbm"."brand_id",
    "cbm"."membership_status",
    "cbm"."joined_date",
    "cbm"."lifetime_points",
    "cbm"."points_balance",
    "c"."business_name" AS "client_business_name",
    "c"."owner_name" AS "client_owner_name",
    "b"."name" AS "brand_name",
    "t"."name" AS "tier_name",
    "t"."tier_level",
    "t"."points_multiplier",
    "t"."discount_percentage",
    "pt"."name" AS "previous_tier_name",
    "pt"."tier_level" AS "previous_tier_level",
    "up_assigned"."first_name" AS "assigned_by_first_name",
    "up_assigned"."last_name" AS "assigned_by_last_name",
    "tn"."name" AS "tenant_name",
        CASE
            WHEN ("cta"."effective_until" IS NOT NULL) THEN ("cta"."effective_until" - "cta"."effective_from")
            ELSE (CURRENT_DATE - "cta"."effective_from")
        END AS "assignment_duration_days",
        CASE
            WHEN (("cta"."effective_until" IS NOT NULL) AND ("cta"."effective_until" < CURRENT_DATE)) THEN 'expired'::"text"
            WHEN ("cta"."is_current" = true) THEN 'current'::"text"
            WHEN ("cta"."effective_from" > CURRENT_DATE) THEN 'future'::"text"
            ELSE 'historical'::"text"
        END AS "assignment_status",
        CASE
            WHEN ("cta"."previous_tier_id" IS NULL) THEN 'initial'::"text"
            WHEN ("t"."tier_level" > "pt"."tier_level") THEN 'promotion'::"text"
            WHEN ("t"."tier_level" < "pt"."tier_level") THEN 'demotion'::"text"
            ELSE 'lateral'::"text"
        END AS "tier_movement_type",
    (CURRENT_DATE - "cta"."assigned_date") AS "days_since_assignment",
        CASE
            WHEN (("cta"."notification_sent" = true) AND ("cta"."client_acknowledgment" = true)) THEN 'acknowledged'::"text"
            WHEN ("cta"."notification_sent" = true) THEN 'sent_pending'::"text"
            ELSE 'not_sent'::"text"
        END AS "notification_status"
   FROM ((((((("public"."client_tier_assignments" "cta"
     JOIN "public"."client_brand_memberships" "cbm" ON (("cta"."client_brand_membership_id" = "cbm"."id")))
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     JOIN "public"."tiers" "t" ON (("cta"."tier_id" = "t"."id")))
     LEFT JOIN "public"."tiers" "pt" ON (("cta"."previous_tier_id" = "pt"."id")))
     LEFT JOIN "public"."user_profiles" "up_assigned" ON (("cta"."assigned_by" = "up_assigned"."id")))
     JOIN "public"."tenants" "tn" ON (("cta"."tenant_id" = "tn"."id")))
  WHERE (("cta"."deleted_at" IS NULL) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "cta"."effective_from" DESC, "cta"."created_at" DESC;


ALTER VIEW "public"."active_client_tier_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_client_type_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "code" character varying(50) NOT NULL,
    "category" "public"."client_type_category_enum" NOT NULL,
    "description" "text",
    "requires_assessment" boolean DEFAULT true,
    "requires_inventory" boolean DEFAULT false,
    "assessment_frequency_days" integer DEFAULT 30,
    "default_visit_frequency_days" integer DEFAULT 15,
    "characteristics" "jsonb",
    "kpi_targets" "jsonb",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "client_types_assessment_frequency_check" CHECK (("assessment_frequency_days" > 0)),
    CONSTRAINT "client_types_characteristics_check" CHECK ((("characteristics" IS NULL) OR ("jsonb_typeof"("characteristics") = 'object'::"text"))),
    CONSTRAINT "client_types_code_format_check" CHECK (((("code")::"text" ~ '^[A-Z]{1,10}$'::"text") AND (("code")::"text" !~ ' '::"text"))),
    CONSTRAINT "client_types_frequency_relationship_check" CHECK (("assessment_frequency_days" >= "default_visit_frequency_days")),
    CONSTRAINT "client_types_kpi_targets_check" CHECK ((("kpi_targets" IS NULL) OR ("jsonb_typeof"("kpi_targets") = 'object'::"text"))),
    CONSTRAINT "client_types_public_id_format_check" CHECK ((("public_id")::"text" ~ '^CTY-[0-9]{4}$'::"text")),
    CONSTRAINT "client_types_visit_frequency_check" CHECK (("default_visit_frequency_days" > 0))
);


ALTER TABLE "public"."client_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_types" IS 'Tipos de cliente';



COMMENT ON COLUMN "public"."client_types"."name" IS 'ej: "Tienda de Barrio", "Supermercado", "Farmacia", "Conveniencia"';



COMMENT ON COLUMN "public"."client_types"."code" IS 'código corto: "BARRIO", "SUPER", "FARM", "CONV"';



COMMENT ON COLUMN "public"."client_types"."assessment_frequency_days" IS 'cada cuánto hacer assessment';



COMMENT ON COLUMN "public"."client_types"."default_visit_frequency_days" IS 'frecuencia recomendada de visitas';



COMMENT ON COLUMN "public"."client_types"."characteristics" IS 'características físicas y operativas del punto de venta';



COMMENT ON COLUMN "public"."client_types"."kpi_targets" IS 'KPIs y métricas objetivo por tipo de cliente';



CREATE TABLE IF NOT EXISTS "public"."markets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_market_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "code" character varying(50) NOT NULL,
    "description" "text",
    "characteristics" "jsonb",
    "target_volume_min" numeric(12,2),
    "target_volume_max" numeric(12,2),
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "markets_characteristics_check" CHECK ((("characteristics" IS NULL) OR ("jsonb_typeof"("characteristics") = 'object'::"text"))),
    CONSTRAINT "markets_code_format_check" CHECK (((("code")::"text" ~ '^[A-Z]{1,5}$'::"text") AND (("code")::"text" !~ ' '::"text"))),
    CONSTRAINT "markets_public_id_format_check" CHECK ((("public_id")::"text" ~ '^MKT-[0-9]{4}$'::"text")),
    CONSTRAINT "markets_volume_range_check" CHECK (((("target_volume_min" IS NULL) AND ("target_volume_max" IS NULL)) OR (("target_volume_min" IS NOT NULL) AND ("target_volume_max" IS NOT NULL) AND ("target_volume_min" < "target_volume_max")) OR (("target_volume_min" IS NULL) AND ("target_volume_max" IS NOT NULL)) OR (("target_volume_min" IS NOT NULL) AND ("target_volume_max" IS NULL))))
);


ALTER TABLE "public"."markets" OWNER TO "postgres";


COMMENT ON TABLE "public"."markets" IS 'Tipos de mercado';



COMMENT ON COLUMN "public"."markets"."name" IS 'ej: "Tradicional", "Moderno", "Conveniencia", "Farmacia"';



COMMENT ON COLUMN "public"."markets"."code" IS 'código corto: "TRAD", "MOD", "CONV", "FARM"';



COMMENT ON COLUMN "public"."markets"."characteristics" IS 'características específicas del mercado';



COMMENT ON COLUMN "public"."markets"."target_volume_min" IS 'volumen mínimo esperado';



COMMENT ON COLUMN "public"."markets"."target_volume_max" IS 'volumen máximo esperado';



CREATE TABLE IF NOT EXISTS "public"."zones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_zone_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "code" character varying(50) NOT NULL,
    "description" "text",
    "country" character varying(2) DEFAULT 'MX'::character varying,
    "state" character varying(100),
    "cities" "jsonb",
    "postal_codes" "jsonb",
    "coordinates" "jsonb",
    "parent_zone_id" "uuid",
    "zone_type" "public"."zone_type_enum" NOT NULL,
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "zones_cities_basic_check" CHECK ((("cities" IS NULL) OR ("jsonb_typeof"("cities") = 'array'::"text"))),
    CONSTRAINT "zones_coordinates_basic_check" CHECK ((("coordinates" IS NULL) OR (("jsonb_typeof"("coordinates") = 'object'::"text") AND ("coordinates" ? 'type'::"text")))),
    CONSTRAINT "zones_country_iso_check" CHECK ((("country")::"text" ~ '^[A-Z]{2}$'::"text")),
    CONSTRAINT "zones_parent_self_check" CHECK (("parent_zone_id" <> "id")),
    CONSTRAINT "zones_postal_codes_basic_check" CHECK ((("postal_codes" IS NULL) OR ("jsonb_typeof"("postal_codes") = 'array'::"text"))),
    CONSTRAINT "zones_public_id_format_check" CHECK ((("public_id")::"text" ~ '^ZON-[0-9]{4}$'::"text"))
);


ALTER TABLE "public"."zones" OWNER TO "postgres";


COMMENT ON TABLE "public"."zones" IS 'Zonas geográficas';



COMMENT ON COLUMN "public"."zones"."name" IS 'ej: "Zona Norte", "CDMX Centro", "Guadalajara Metropolitana"';



COMMENT ON COLUMN "public"."zones"."code" IS 'código corto: "NORTE", "CDMX-C", "GDL-METRO"';



COMMENT ON COLUMN "public"."zones"."state" IS 'estado/provincia';



COMMENT ON COLUMN "public"."zones"."cities" IS 'array de ciudades incluidas en la zona';



COMMENT ON COLUMN "public"."zones"."postal_codes" IS 'array de códigos postales incluidos';



COMMENT ON COLUMN "public"."zones"."coordinates" IS 'polígono geográfico o centro + radio';



COMMENT ON COLUMN "public"."zones"."parent_zone_id" IS 'para jerarquías: país > región > ciudad';



CREATE OR REPLACE VIEW "public"."active_client_types" AS
 SELECT "ct"."id",
    "ct"."public_id",
    "ct"."tenant_id",
    "ct"."name",
    "ct"."code",
    "ct"."category",
    "ct"."description",
    "ct"."requires_assessment",
    "ct"."requires_inventory",
    "ct"."assessment_frequency_days",
    "ct"."default_visit_frequency_days",
    "ct"."characteristics",
    "ct"."kpi_targets",
    "ct"."is_active",
    "ct"."sort_order",
    "ct"."created_at",
    "ct"."updated_at",
    "ct"."deleted_at",
    "t"."name" AS "tenant_name",
    "t"."slug" AS "tenant_slug",
    ( SELECT ("count"(*))::integer AS "count"
           FROM "public"."clients" "c"
          WHERE (("c"."client_type_id" = "ct"."id") AND ("c"."deleted_at" IS NULL))) AS "total_client_count",
    ( SELECT ("count"(*))::integer AS "count"
           FROM "public"."clients" "c"
          WHERE (("c"."client_type_id" = "ct"."id") AND ("c"."status" = 'active'::"public"."client_status_enum") AND ("c"."deleted_at" IS NULL))) AS "active_client_count",
    ( SELECT ("count"(*))::integer AS "count"
           FROM "public"."clients" "c"
          WHERE (("c"."client_type_id" = "ct"."id") AND ("c"."status" = 'prospect'::"public"."client_status_enum") AND ("c"."deleted_at" IS NULL))) AS "prospect_client_count",
    ( SELECT "jsonb_agg"("jsonb_build_object"('zone_id', "z"."id", 'zone_name', "z"."name", 'client_count', "zone_counts"."client_count")) AS "jsonb_agg"
           FROM (( SELECT "c"."zone_id",
                    "count"(*) AS "client_count"
                   FROM "public"."clients" "c"
                  WHERE (("c"."client_type_id" = "ct"."id") AND ("c"."deleted_at" IS NULL))
                  GROUP BY "c"."zone_id") "zone_counts"
             JOIN "public"."zones" "z" ON (("zone_counts"."zone_id" = "z"."id")))
          WHERE ("z"."deleted_at" IS NULL)) AS "zone_distribution",
    ( SELECT "jsonb_agg"("jsonb_build_object"('market_id', "m"."id", 'market_name', "m"."name", 'client_count', "market_counts"."client_count")) AS "jsonb_agg"
           FROM (( SELECT "c"."market_id",
                    "count"(*) AS "client_count"
                   FROM "public"."clients" "c"
                  WHERE (("c"."client_type_id" = "ct"."id") AND ("c"."deleted_at" IS NULL))
                  GROUP BY "c"."market_id") "market_counts"
             JOIN "public"."markets" "m" ON (("market_counts"."market_id" = "m"."id")))
          WHERE ("m"."deleted_at" IS NULL)) AS "market_distribution",
    ( SELECT ("avg"(COALESCE("c"."visit_frequency_days", "ct"."default_visit_frequency_days")))::numeric(5,2) AS "avg"
           FROM "public"."clients" "c"
          WHERE (("c"."client_type_id" = "ct"."id") AND ("c"."status" = 'active'::"public"."client_status_enum") AND ("c"."deleted_at" IS NULL))) AS "avg_effective_visit_frequency",
    ( SELECT ("avg"(COALESCE("c"."assessment_frequency_days", "ct"."assessment_frequency_days")))::numeric(5,2) AS "avg"
           FROM "public"."clients" "c"
          WHERE (("c"."client_type_id" = "ct"."id") AND ("c"."status" = 'active'::"public"."client_status_enum") AND ("c"."deleted_at" IS NULL))) AS "avg_effective_assessment_frequency",
    0 AS "avg_monthly_visits",
    0.0 AS "avg_assessment_compliance_rate",
    0.0 AS "avg_satisfaction_score"
   FROM ("public"."client_types" "ct"
     JOIN "public"."tenants" "t" ON (("ct"."tenant_id" = "t"."id")))
  WHERE (("ct"."deleted_at" IS NULL) AND ("ct"."is_active" = true) AND ("t"."deleted_at" IS NULL))
  ORDER BY "ct"."tenant_id", "ct"."sort_order", "ct"."name";


ALTER VIEW "public"."active_client_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."commercial_structures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_commercial_structure_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "code" character varying(50) NOT NULL,
    "structure_type" "public"."commercial_structure_type_enum" NOT NULL,
    "description" "text",
    "contact_company" character varying(255),
    "contact_name" character varying(255),
    "contact_email" character varying(255),
    "contact_phone" character varying(20),
    "coverage_zones" "jsonb",
    "supported_markets" "jsonb",
    "payment_terms" character varying(100),
    "minimum_order" numeric(12,2),
    "delivery_time_days" integer,
    "commission_structure" "jsonb",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "commercial_structures_code_format_check" CHECK (((("code")::"text" ~ '^[A-Z]{1,5}$'::"text") AND (("code")::"text" !~ ' '::"text"))),
    CONSTRAINT "commercial_structures_commission_structure_check" CHECK ((("commission_structure" IS NULL) OR ("jsonb_typeof"("commission_structure") = 'object'::"text"))),
    CONSTRAINT "commercial_structures_coverage_zones_check" CHECK ((("coverage_zones" IS NULL) OR ("jsonb_typeof"("coverage_zones") = 'array'::"text"))),
    CONSTRAINT "commercial_structures_delivery_time_check" CHECK ((("delivery_time_days" IS NULL) OR ("delivery_time_days" > 0))),
    CONSTRAINT "commercial_structures_email_format_check" CHECK ((("contact_email" IS NULL) OR (("contact_email")::"text" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text"))),
    CONSTRAINT "commercial_structures_minimum_order_check" CHECK ((("minimum_order" IS NULL) OR ("minimum_order" > (0)::numeric))),
    CONSTRAINT "commercial_structures_public_id_format_check" CHECK ((("public_id")::"text" ~ '^CST-[0-9]{4}$'::"text")),
    CONSTRAINT "commercial_structures_supported_markets_check" CHECK ((("supported_markets" IS NULL) OR ("jsonb_typeof"("supported_markets") = 'array'::"text")))
);


ALTER TABLE "public"."commercial_structures" OWNER TO "postgres";


COMMENT ON TABLE "public"."commercial_structures" IS 'Estructuras comerciales (incluye RTM)';



COMMENT ON COLUMN "public"."commercial_structures"."name" IS 'ej: "Distribución Directa", "Mayorista Regional", "Canal Tradicional"';



COMMENT ON COLUMN "public"."commercial_structures"."code" IS 'código corto: "DIRECT", "MAYOR", "TRAD"';



COMMENT ON COLUMN "public"."commercial_structures"."contact_company" IS 'empresa del distribuidor/mayorista';



COMMENT ON COLUMN "public"."commercial_structures"."coverage_zones" IS 'array de zone_ids que cubre';



COMMENT ON COLUMN "public"."commercial_structures"."supported_markets" IS 'array de market_ids que atiende';



COMMENT ON COLUMN "public"."commercial_structures"."payment_terms" IS 'ej: "30 días", "Contado", "60 días"';



COMMENT ON COLUMN "public"."commercial_structures"."minimum_order" IS 'pedido mínimo requerido';



COMMENT ON COLUMN "public"."commercial_structures"."delivery_time_days" IS 'tiempo de entrega en días';



COMMENT ON COLUMN "public"."commercial_structures"."commission_structure" IS 'estructura de comisiones';



CREATE OR REPLACE VIEW "public"."active_commercial_structures" AS
 SELECT "cs"."id",
    "cs"."public_id",
    "cs"."tenant_id",
    "cs"."name",
    "cs"."code",
    "cs"."structure_type",
    "cs"."description",
    "cs"."contact_company",
    "cs"."contact_name",
    "cs"."contact_email",
    "cs"."contact_phone",
    "cs"."coverage_zones",
    "cs"."supported_markets",
    "cs"."payment_terms",
    "cs"."minimum_order",
    "cs"."delivery_time_days",
    "cs"."commission_structure",
    "cs"."is_active",
    "cs"."sort_order",
    "cs"."created_at",
    "cs"."updated_at",
    "cs"."deleted_at",
    "t"."name" AS "tenant_name",
    ( SELECT ("count"(*))::integer AS "count"
           FROM "public"."clients" "c"
          WHERE (("c"."commercial_structure_id" = "cs"."id") AND ("c"."deleted_at" IS NULL))) AS "client_count",
    ( SELECT "jsonb_agg"("jsonb_build_object"('zone_id', "z"."id", 'zone_name', "z"."name", 'zone_code', "z"."code")) AS "jsonb_agg"
           FROM "public"."zones" "z"
          WHERE (("cs"."coverage_zones" ? ("z"."id")::"text") AND ("z"."deleted_at" IS NULL))) AS "coverage_zones_details",
    ( SELECT "jsonb_agg"("jsonb_build_object"('market_id', "m"."id", 'market_name', "m"."name", 'market_code', "m"."code")) AS "jsonb_agg"
           FROM "public"."markets" "m"
          WHERE (("cs"."supported_markets" ? ("m"."id")::"text") AND ("m"."deleted_at" IS NULL))) AS "supported_markets_details"
   FROM ("public"."commercial_structures" "cs"
     JOIN "public"."tenants" "t" ON (("cs"."tenant_id" = "t"."id")))
  WHERE (("cs"."deleted_at" IS NULL) AND ("cs"."is_active" = true) AND ("t"."deleted_at" IS NULL))
  ORDER BY "cs"."tenant_id", "cs"."sort_order", "cs"."name";


ALTER VIEW "public"."active_commercial_structures" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_markets" AS
 SELECT "m"."id",
    "m"."public_id",
    "m"."tenant_id",
    "m"."name",
    "m"."code",
    "m"."description",
    "m"."characteristics",
    "m"."target_volume_min",
    "m"."target_volume_max",
    "m"."is_active",
    "m"."sort_order",
    "m"."created_at",
    "m"."updated_at",
    "m"."deleted_at",
    "t"."name" AS "tenant_name",
    "t"."slug" AS "tenant_slug",
    ( SELECT ("count"(*))::integer AS "count"
           FROM "public"."clients" "c"
          WHERE (("c"."market_id" = "m"."id") AND ("c"."deleted_at" IS NULL))) AS "total_client_count",
    ( SELECT ("count"(*))::integer AS "count"
           FROM "public"."clients" "c"
          WHERE (("c"."market_id" = "m"."id") AND ("c"."status" = 'active'::"public"."client_status_enum") AND ("c"."deleted_at" IS NULL))) AS "active_client_count",
    ( SELECT ("count"(*))::integer AS "count"
           FROM "public"."clients" "c"
          WHERE (("c"."market_id" = "m"."id") AND ("c"."status" = 'prospect'::"public"."client_status_enum") AND ("c"."deleted_at" IS NULL))) AS "prospect_client_count",
    ( SELECT "jsonb_agg"("jsonb_build_object"('zone_id', "z"."id", 'zone_name', "z"."name", 'zone_code', "z"."code", 'client_count', "zone_counts"."client_count")) AS "jsonb_agg"
           FROM (( SELECT "c"."zone_id",
                    "count"(*) AS "client_count"
                   FROM "public"."clients" "c"
                  WHERE (("c"."market_id" = "m"."id") AND ("c"."deleted_at" IS NULL))
                  GROUP BY "c"."zone_id") "zone_counts"
             JOIN "public"."zones" "z" ON (("zone_counts"."zone_id" = "z"."id")))
          WHERE ("z"."deleted_at" IS NULL)) AS "zone_distribution",
    ( SELECT "jsonb_agg"("jsonb_build_object"('client_type_id', "ct"."id", 'client_type_name', "ct"."name", 'client_type_code', "ct"."code", 'client_count', "type_counts"."client_count")) AS "jsonb_agg"
           FROM (( SELECT "c"."client_type_id",
                    "count"(*) AS "client_count"
                   FROM "public"."clients" "c"
                  WHERE (("c"."market_id" = "m"."id") AND ("c"."deleted_at" IS NULL))
                  GROUP BY "c"."client_type_id") "type_counts"
             JOIN "public"."client_types" "ct" ON (("type_counts"."client_type_id" = "ct"."id")))
          WHERE ("ct"."deleted_at" IS NULL)) AS "client_type_distribution",
    ( SELECT "jsonb_agg"("jsonb_build_object"('commercial_structure_id', "cs"."id", 'structure_name', "cs"."name", 'structure_type', "cs"."structure_type", 'client_count', "structure_counts"."client_count")) AS "jsonb_agg"
           FROM (( SELECT "c"."commercial_structure_id",
                    "count"(*) AS "client_count"
                   FROM "public"."clients" "c"
                  WHERE (("c"."market_id" = "m"."id") AND ("c"."deleted_at" IS NULL))
                  GROUP BY "c"."commercial_structure_id") "structure_counts"
             JOIN "public"."commercial_structures" "cs" ON (("structure_counts"."commercial_structure_id" = "cs"."id")))
          WHERE ("cs"."deleted_at" IS NULL)) AS "commercial_structure_distribution",
    ( SELECT ("avg"("c"."credit_limit"))::numeric(12,2) AS "avg"
           FROM "public"."clients" "c"
          WHERE (("c"."market_id" = "m"."id") AND ("c"."status" = 'active'::"public"."client_status_enum") AND ("c"."deleted_at" IS NULL))) AS "avg_client_credit_limit",
    ( SELECT "min"("c"."registration_date") AS "min"
           FROM "public"."clients" "c"
          WHERE (("c"."market_id" = "m"."id") AND ("c"."deleted_at" IS NULL))) AS "first_client_registered",
    ( SELECT "max"("c"."registration_date") AS "max"
           FROM "public"."clients" "c"
          WHERE (("c"."market_id" = "m"."id") AND ("c"."deleted_at" IS NULL))) AS "last_client_registered",
    ( SELECT "max"("c"."last_visit_date") AS "max"
           FROM "public"."clients" "c"
          WHERE (("c"."market_id" = "m"."id") AND ("c"."deleted_at" IS NULL))) AS "last_visit_recorded"
   FROM ("public"."markets" "m"
     JOIN "public"."tenants" "t" ON (("m"."tenant_id" = "t"."id")))
  WHERE (("m"."deleted_at" IS NULL) AND ("m"."is_active" = true) AND ("t"."deleted_at" IS NULL))
  ORDER BY "m"."tenant_id", "m"."sort_order", "m"."name";


ALTER VIEW "public"."active_markets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_order_item_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_variant_id" "uuid",
    "line_number" integer NOT NULL,
    "quantity_ordered" integer NOT NULL,
    "quantity_confirmed" integer,
    "quantity_delivered" integer DEFAULT 0,
    "unit_price" numeric(10,2) NOT NULL,
    "unit_cost" numeric(10,2),
    "line_subtotal" numeric(12,2) NOT NULL,
    "line_discount_amount" numeric(12,2) DEFAULT 0.00,
    "line_discount_percentage" numeric(5,2) DEFAULT 0.00,
    "line_total" numeric(12,2) NOT NULL,
    "tax_rate" numeric(5,4) DEFAULT 0.0000,
    "tax_amount" numeric(10,2) DEFAULT 0.00,
    "unit_type" "public"."order_item_unit_type_enum" NOT NULL,
    "weight_per_unit_grams" numeric(8,2),
    "volume_per_unit_ml" numeric(8,2),
    "expiration_date_requested" "date",
    "batch_number" character varying(100),
    "expiration_date_delivered" "date",
    "item_status" "public"."order_item_status_enum" DEFAULT 'pending'::"public"."order_item_status_enum",
    "substitution_reason" "text",
    "substitute_product_id" "uuid",
    "substitute_variant_id" "uuid",
    "delivery_notes" "text",
    "quality_rating" integer,
    "quality_notes" "text",
    "return_reason" "text",
    "returned_quantity" integer DEFAULT 0,
    "refund_amount" numeric(10,2) DEFAULT 0.00,
    "commission_rate" numeric(5,4),
    "commission_amount" numeric(10,2),
    "promotion_applied" boolean DEFAULT false,
    "free_item" boolean DEFAULT false,
    "item_notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_order_items_delivered_le_confirmed" CHECK ((("quantity_confirmed" IS NULL) OR ("quantity_delivered" <= "quantity_confirmed"))),
    CONSTRAINT "chk_order_items_discount_percentage_range" CHECK ((("line_discount_percentage" >= 0.00) AND ("line_discount_percentage" <= 100.00))),
    CONSTRAINT "chk_order_items_line_discount_amount_non_negative" CHECK (("line_discount_amount" >= (0)::numeric)),
    CONSTRAINT "chk_order_items_line_number_positive" CHECK (("line_number" > 0)),
    CONSTRAINT "chk_order_items_line_subtotal_non_negative" CHECK (("line_subtotal" >= (0)::numeric)),
    CONSTRAINT "chk_order_items_line_total_non_negative" CHECK (("line_total" >= (0)::numeric)),
    CONSTRAINT "chk_order_items_public_id_format" CHECK ((("public_id")::"text" ~ '^ORI-[0-9]{4,}$'::"text")),
    CONSTRAINT "chk_order_items_quality_rating_range" CHECK ((("quality_rating" IS NULL) OR (("quality_rating" >= 1) AND ("quality_rating" <= 5)))),
    CONSTRAINT "chk_order_items_quantity_confirmed_non_negative" CHECK ((("quantity_confirmed" IS NULL) OR ("quantity_confirmed" >= 0))),
    CONSTRAINT "chk_order_items_quantity_delivered_non_negative" CHECK (("quantity_delivered" >= 0)),
    CONSTRAINT "chk_order_items_quantity_ordered_positive" CHECK (("quantity_ordered" > 0)),
    CONSTRAINT "chk_order_items_refund_non_negative" CHECK (("refund_amount" >= (0)::numeric)),
    CONSTRAINT "chk_order_items_returned_le_delivered" CHECK (("returned_quantity" <= "quantity_delivered")),
    CONSTRAINT "chk_order_items_returned_quantity_non_negative" CHECK (("returned_quantity" >= 0)),
    CONSTRAINT "chk_order_items_substitute_variant_requires_product" CHECK ((("substitute_variant_id" IS NULL) OR ("substitute_product_id" IS NOT NULL))),
    CONSTRAINT "chk_order_items_tax_rate_non_negative" CHECK (("tax_rate" >= (0)::numeric)),
    CONSTRAINT "chk_order_items_unit_price_non_negative" CHECK (("unit_price" >= (0)::numeric))
);

ALTER TABLE ONLY "public"."order_items" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_items" IS 'Items específicos de los pedidos independientes realizados por clientes desde portal';



COMMENT ON COLUMN "public"."order_items"."id" IS 'Identificador único interno (UUID)';



COMMENT ON COLUMN "public"."order_items"."public_id" IS 'Identificador público legible (ORI-XXXX)';



COMMENT ON COLUMN "public"."order_items"."tenant_id" IS 'Referencia al tenant (multi-tenant isolation)';



COMMENT ON COLUMN "public"."order_items"."order_id" IS 'Referencia al pedido padre';



COMMENT ON COLUMN "public"."order_items"."product_id" IS 'Referencia al producto';



COMMENT ON COLUMN "public"."order_items"."product_variant_id" IS 'Referencia a la variante específica del producto';



COMMENT ON COLUMN "public"."order_items"."line_number" IS 'Número de línea secuencial dentro del pedido';



COMMENT ON COLUMN "public"."order_items"."quantity_ordered" IS 'Cantidad solicitada por el cliente';



COMMENT ON COLUMN "public"."order_items"."quantity_confirmed" IS 'Cantidad confirmada disponible por el proveedor';



COMMENT ON COLUMN "public"."order_items"."quantity_delivered" IS 'Cantidad realmente entregada al cliente';



COMMENT ON COLUMN "public"."order_items"."unit_price" IS 'Precio unitario capturado al momento del pedido';



COMMENT ON COLUMN "public"."order_items"."unit_cost" IS 'Costo unitario para cálculos de margen';



COMMENT ON COLUMN "public"."order_items"."line_subtotal" IS 'Subtotal de la línea (quantity_ordered × unit_price)';



COMMENT ON COLUMN "public"."order_items"."line_discount_amount" IS 'Monto de descuento aplicado a esta línea';



COMMENT ON COLUMN "public"."order_items"."line_discount_percentage" IS 'Porcentaje de descuento aplicado';



COMMENT ON COLUMN "public"."order_items"."line_total" IS 'Total final de la línea después de descuentos e impuestos';



COMMENT ON COLUMN "public"."order_items"."tax_rate" IS 'Tasa de impuesto aplicable (ej: 0.16 para 16%)';



COMMENT ON COLUMN "public"."order_items"."tax_amount" IS 'Monto de impuesto calculado para esta línea';



COMMENT ON COLUMN "public"."order_items"."unit_type" IS 'Tipo de unidad de medida';



COMMENT ON COLUMN "public"."order_items"."weight_per_unit_grams" IS 'Peso por unidad en gramos';



COMMENT ON COLUMN "public"."order_items"."volume_per_unit_ml" IS 'Volumen por unidad en mililitros';



COMMENT ON COLUMN "public"."order_items"."expiration_date_requested" IS 'Fecha de caducidad mínima solicitada por el cliente';



COMMENT ON COLUMN "public"."order_items"."batch_number" IS 'Número de lote del producto entregado';



COMMENT ON COLUMN "public"."order_items"."expiration_date_delivered" IS 'Fecha de caducidad del producto entregado';



COMMENT ON COLUMN "public"."order_items"."item_status" IS 'Estado actual del item en el flujo del pedido';



COMMENT ON COLUMN "public"."order_items"."substitution_reason" IS 'Razón por la cual se sustituyó el producto';



COMMENT ON COLUMN "public"."order_items"."substitute_product_id" IS 'Producto sustituto cuando el original no está disponible';



COMMENT ON COLUMN "public"."order_items"."substitute_variant_id" IS 'Variante del producto sustituto';



COMMENT ON COLUMN "public"."order_items"."delivery_notes" IS 'Notas específicas para la entrega de este item';



COMMENT ON COLUMN "public"."order_items"."quality_rating" IS 'Calificación de calidad del producto (1-5 estrellas)';



COMMENT ON COLUMN "public"."order_items"."quality_notes" IS 'Observaciones detalladas sobre la calidad';



COMMENT ON COLUMN "public"."order_items"."return_reason" IS 'Razón de devolución del item';



COMMENT ON COLUMN "public"."order_items"."returned_quantity" IS 'Cantidad de unidades devueltas';



COMMENT ON COLUMN "public"."order_items"."refund_amount" IS 'Monto reembolsado por devolución';



COMMENT ON COLUMN "public"."order_items"."commission_rate" IS 'Tasa de comisión para el asesor (ej: 0.05 para 5%)';



COMMENT ON COLUMN "public"."order_items"."commission_amount" IS 'Monto de comisión calculada';



COMMENT ON COLUMN "public"."order_items"."promotion_applied" IS 'Indica si este item tiene promociones aplicadas';



COMMENT ON COLUMN "public"."order_items"."free_item" IS 'Indica si es un item gratuito por promoción';



COMMENT ON COLUMN "public"."order_items"."item_notes" IS 'Notas adicionales específicas del item';



COMMENT ON COLUMN "public"."order_items"."metadata" IS 'Datos adicionales en formato JSON flexible';



COMMENT ON COLUMN "public"."order_items"."created_at" IS 'Fecha y hora de creación del registro';



COMMENT ON COLUMN "public"."order_items"."updated_at" IS 'Fecha y hora de última actualización';



COMMENT ON COLUMN "public"."order_items"."deleted_at" IS 'Fecha y hora de eliminación lógica (soft delete)';



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_order_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "order_number" character varying(100) NOT NULL,
    "order_type" "public"."order_type_enum" DEFAULT 'standard'::"public"."order_type_enum",
    "order_status" "public"."order_status_enum" DEFAULT 'draft'::"public"."order_status_enum",
    "order_date" "date" NOT NULL,
    "requested_delivery_date" "date",
    "confirmed_delivery_date" "date",
    "actual_delivery_date" "date",
    "delivery_time_slot" character varying(50),
    "delivery_address" "text",
    "delivery_instructions" "text",
    "commercial_structure_id" "uuid" NOT NULL,
    "payment_method" "public"."order_payment_method_enum" DEFAULT 'cash'::"public"."order_payment_method_enum",
    "payment_status" "public"."order_payment_status_enum" DEFAULT 'pending'::"public"."order_payment_status_enum",
    "payment_terms" character varying(100),
    "subtotal" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "discount_amount" numeric(12,2) DEFAULT 0.00,
    "tax_amount" numeric(12,2) DEFAULT 0.00,
    "shipping_cost" numeric(10,2) DEFAULT 0.00,
    "total_amount" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "currency" character varying(3) DEFAULT 'MXN'::character varying,
    "priority" "public"."order_priority_enum" DEFAULT 'normal'::"public"."order_priority_enum",
    "source_channel" "public"."order_source_channel_enum" DEFAULT 'client_portal'::"public"."order_source_channel_enum",
    "invoice_required" boolean DEFAULT false,
    "client_invoice_data_id" "uuid",
    "assigned_to" "uuid",
    "internal_notes" "text",
    "client_notes" "text",
    "tracking_number" character varying(100),
    "estimated_delivery_time" interval,
    "cancellation_reason" "text",
    "cancelled_by" "uuid",
    "cancelled_at" timestamp with time zone,
    "order_attachments" "jsonb",
    "delivery_confirmation" "jsonb",
    "customer_rating" integer,
    "customer_feedback" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "orders_actual_delivery_date_check" CHECK ((("actual_delivery_date" IS NULL) OR ("actual_delivery_date" >= "order_date"))),
    CONSTRAINT "orders_confirmed_delivery_date_check" CHECK ((("confirmed_delivery_date" IS NULL) OR ("confirmed_delivery_date" >= "order_date"))),
    CONSTRAINT "orders_customer_rating_check" CHECK ((("customer_rating" >= 1) AND ("customer_rating" <= 5))),
    CONSTRAINT "orders_delivery_confirmation_check" CHECK ((("delivery_confirmation" IS NULL) OR ("jsonb_typeof"("delivery_confirmation") = 'object'::"text"))),
    CONSTRAINT "orders_discount_amount_check" CHECK (("discount_amount" >= (0)::numeric)),
    CONSTRAINT "orders_metadata_check" CHECK ((("metadata" IS NULL) OR ("jsonb_typeof"("metadata") = 'object'::"text"))),
    CONSTRAINT "orders_order_attachments_check" CHECK ((("order_attachments" IS NULL) OR ("jsonb_typeof"("order_attachments") = 'array'::"text"))),
    CONSTRAINT "orders_public_id_format_check" CHECK ((("public_id")::"text" ~ '^ORD-[0-9]{4}$'::"text")),
    CONSTRAINT "orders_requested_delivery_date_check" CHECK ((("requested_delivery_date" IS NULL) OR ("requested_delivery_date" > "order_date"))),
    CONSTRAINT "orders_shipping_cost_check" CHECK (("shipping_cost" >= (0)::numeric)),
    CONSTRAINT "orders_subtotal_check" CHECK (("subtotal" >= (0)::numeric)),
    CONSTRAINT "orders_tax_amount_check" CHECK (("tax_amount" >= (0)::numeric)),
    CONSTRAINT "orders_total_amount_check" CHECK (("total_amount" >= (0)::numeric))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON TABLE "public"."orders" IS 'Pedidos que hace el cliente desde su portal';



COMMENT ON COLUMN "public"."orders"."client_id" IS 'cliente que realiza el pedido';



COMMENT ON COLUMN "public"."orders"."brand_id" IS 'marca del pedido';



COMMENT ON COLUMN "public"."orders"."delivery_time_slot" IS 'horario de entrega: "09:00-12:00", "14:00-17:00"';



COMMENT ON COLUMN "public"."orders"."delivery_address" IS 'dirección de entrega, por defecto la del cliente';



COMMENT ON COLUMN "public"."orders"."commercial_structure_id" IS 'proveedor/distribuidor';



COMMENT ON COLUMN "public"."orders"."assigned_to" IS 'asesor asignado para seguimiento';



COMMENT ON COLUMN "public"."orders"."order_attachments" IS 'evidencias, comprobantes, fotos';



COMMENT ON COLUMN "public"."orders"."delivery_confirmation" IS 'confirmación de entrega con firma/foto';



COMMENT ON COLUMN "public"."orders"."customer_rating" IS 'customer_rating >= 1 AND customer_rating <= 5';



COMMENT ON COLUMN "public"."orders"."metadata" IS 'datos adicionales del pedido';



CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_product_variant_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "variant_name" character varying(255) NOT NULL,
    "variant_code" character varying(100) NOT NULL,
    "barcode" character varying(50),
    "price" numeric(10,2) NOT NULL,
    "cost" numeric(10,2),
    "size_value" numeric(8,2) NOT NULL,
    "size_unit" "public"."product_variant_size_unit_enum" NOT NULL,
    "package_type" character varying(100),
    "package_material" character varying(100),
    "weight_grams" numeric(8,2),
    "dimensions" "jsonb",
    "units_per_case" integer,
    "case_dimensions" "jsonb",
    "case_weight_kg" numeric(8,2),
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "launch_date" "date",
    "discontinue_date" "date",
    "variant_image_url" character varying(500),
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "product_variants_case_dimensions_check" CHECK ((("case_dimensions" IS NULL) OR ("jsonb_typeof"("case_dimensions") = 'object'::"text"))),
    CONSTRAINT "product_variants_case_weight_check" CHECK ((("case_weight_kg" IS NULL) OR ("case_weight_kg" > (0)::numeric))),
    CONSTRAINT "product_variants_cost_check" CHECK ((("cost" IS NULL) OR ("cost" > (0)::numeric))),
    CONSTRAINT "product_variants_dates_check" CHECK ((("launch_date" IS NULL) OR ("discontinue_date" IS NULL) OR ("launch_date" < "discontinue_date"))),
    CONSTRAINT "product_variants_dimensions_check" CHECK ((("dimensions" IS NULL) OR ("jsonb_typeof"("dimensions") = 'object'::"text"))),
    CONSTRAINT "product_variants_price_check" CHECK (("price" > (0)::numeric)),
    CONSTRAINT "product_variants_public_id_format_check" CHECK ((("public_id")::"text" ~ '^PRV-[0-9]{4}$'::"text")),
    CONSTRAINT "product_variants_size_value_check" CHECK (("size_value" > (0)::numeric)),
    CONSTRAINT "product_variants_units_per_case_check" CHECK ((("units_per_case" IS NULL) OR ("units_per_case" > 0)))
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_variants" IS 'Presentaciones (90g, 225g, 500g de un mismo producto)';



COMMENT ON COLUMN "public"."product_variants"."variant_name" IS 'ej: "355ml Lata", "600ml Botella", "90g Individual"';



COMMENT ON COLUMN "public"."product_variants"."variant_code" IS 'SKU específico: "CC-ORIG-355-LATA", "SPR-LIMA-600-BOT"';



COMMENT ON COLUMN "public"."product_variants"."barcode" IS 'código de barras específico de la variante';



COMMENT ON COLUMN "public"."product_variants"."price" IS 'precio específico de esta variante';



COMMENT ON COLUMN "public"."product_variants"."cost" IS 'costo específico de esta variante';



COMMENT ON COLUMN "public"."product_variants"."size_value" IS 'valor numérico: 355, 600, 90';



COMMENT ON COLUMN "public"."product_variants"."size_unit" IS 'unidad de medida';



COMMENT ON COLUMN "public"."product_variants"."package_type" IS 'tipo de empaque: "Lata", "Botella PET", "Bolsa", "Caja"';



COMMENT ON COLUMN "public"."product_variants"."package_material" IS 'material: "Aluminio", "PET", "Polipropileno"';



COMMENT ON COLUMN "public"."product_variants"."weight_grams" IS 'peso total con empaque';



COMMENT ON COLUMN "public"."product_variants"."dimensions" IS 'dimensiones específicas de la variante';



COMMENT ON COLUMN "public"."product_variants"."units_per_case" IS 'unidades por caja/bulto';



COMMENT ON COLUMN "public"."product_variants"."case_dimensions" IS 'dimensiones de la caja';



COMMENT ON COLUMN "public"."product_variants"."case_weight_kg" IS 'peso de la caja completa';



COMMENT ON COLUMN "public"."product_variants"."variant_image_url" IS 'imagen específica de la variante';



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_product_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "code" character varying(100) NOT NULL,
    "description" "text",
    "barcode" character varying(50),
    "base_price" numeric(10,2) NOT NULL,
    "cost" numeric(10,2),
    "margin_target" numeric(5,4),
    "unit_type" "public"."product_unit_type_enum" DEFAULT 'pieza'::"public"."product_unit_type_enum",
    "weight_grams" numeric(8,2),
    "volume_ml" numeric(8,2),
    "dimensions" "jsonb",
    "requires_refrigeration" boolean DEFAULT false,
    "shelf_life_days" integer,
    "minimum_stock" integer DEFAULT 0,
    "maximum_stock" integer,
    "is_active" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "launch_date" "date",
    "discontinue_date" "date",
    "product_image_url" character varying(500),
    "gallery_urls" "jsonb",
    "specifications" "jsonb",
    "marketing_tags" "jsonb",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "products_base_price_check" CHECK (("base_price" > (0)::numeric)),
    CONSTRAINT "products_cost_check" CHECK ((("cost" IS NULL) OR ("cost" > (0)::numeric))),
    CONSTRAINT "products_dates_check" CHECK ((("launch_date" IS NULL) OR ("discontinue_date" IS NULL) OR ("launch_date" < "discontinue_date"))),
    CONSTRAINT "products_dimensions_check" CHECK ((("dimensions" IS NULL) OR ("jsonb_typeof"("dimensions") = 'object'::"text"))),
    CONSTRAINT "products_gallery_urls_check" CHECK ((("gallery_urls" IS NULL) OR ("jsonb_typeof"("gallery_urls") = 'array'::"text"))),
    CONSTRAINT "products_margin_target_check" CHECK ((("margin_target" IS NULL) OR (("margin_target" >= 0.0000) AND ("margin_target" <= 1.0000)))),
    CONSTRAINT "products_marketing_tags_check" CHECK ((("marketing_tags" IS NULL) OR ("jsonb_typeof"("marketing_tags") = 'array'::"text"))),
    CONSTRAINT "products_maximum_stock_check" CHECK ((("maximum_stock" IS NULL) OR ("maximum_stock" > 0))),
    CONSTRAINT "products_minimum_stock_check" CHECK (("minimum_stock" >= 0)),
    CONSTRAINT "products_public_id_format_check" CHECK ((("public_id")::"text" ~ '^PRD-[0-9]{4}$'::"text")),
    CONSTRAINT "products_shelf_life_check" CHECK ((("shelf_life_days" IS NULL) OR ("shelf_life_days" > 0))),
    CONSTRAINT "products_specifications_check" CHECK ((("specifications" IS NULL) OR ("jsonb_typeof"("specifications") = 'object'::"text"))),
    CONSTRAINT "products_stock_relationship_check" CHECK ((("maximum_stock" IS NULL) OR ("minimum_stock" <= "maximum_stock")))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON TABLE "public"."products" IS 'Catálogo específico por marca';



COMMENT ON COLUMN "public"."products"."name" IS 'ej: "Coca-Cola Original", "Sprite Lima-Limón"';



COMMENT ON COLUMN "public"."products"."code" IS 'SKU interno: "CC-ORIG-355", "SPR-LIMA-600"';



COMMENT ON COLUMN "public"."products"."base_price" IS 'precio base de referencia';



COMMENT ON COLUMN "public"."products"."cost" IS 'costo para calcular márgenes';



COMMENT ON COLUMN "public"."products"."margin_target" IS 'margen objetivo: 0.15 = 15%';



COMMENT ON COLUMN "public"."products"."weight_grams" IS 'peso en gramos para logística';



COMMENT ON COLUMN "public"."products"."volume_ml" IS 'volumen en ml cuando aplique';



COMMENT ON COLUMN "public"."products"."dimensions" IS 'dimensiones del producto';



COMMENT ON COLUMN "public"."products"."minimum_stock" IS 'stock mínimo recomendado';



COMMENT ON COLUMN "public"."products"."maximum_stock" IS 'stock máximo recomendado';



COMMENT ON COLUMN "public"."products"."product_image_url" IS 'imagen principal en Supabase Storage';



COMMENT ON COLUMN "public"."products"."gallery_urls" IS 'array de URLs de imágenes adicionales';



COMMENT ON COLUMN "public"."products"."specifications" IS 'especificaciones técnicas del producto';



COMMENT ON COLUMN "public"."products"."marketing_tags" IS 'array de tags para marketing';



CREATE OR REPLACE VIEW "public"."active_order_items" AS
 SELECT "oi"."id",
    "oi"."public_id",
    "oi"."tenant_id",
    "oi"."order_id",
    "oi"."product_id",
    "oi"."product_variant_id",
    "oi"."line_number",
    "oi"."quantity_ordered",
    "oi"."quantity_confirmed",
    "oi"."quantity_delivered",
    "oi"."unit_price",
    "oi"."unit_cost",
    "oi"."line_subtotal",
    "oi"."line_discount_amount",
    "oi"."line_discount_percentage",
    "oi"."line_total",
    "oi"."tax_rate",
    "oi"."tax_amount",
    "oi"."unit_type",
    "oi"."weight_per_unit_grams",
    "oi"."volume_per_unit_ml",
    "oi"."expiration_date_requested",
    "oi"."batch_number",
    "oi"."expiration_date_delivered",
    "oi"."item_status",
    "oi"."substitution_reason",
    "oi"."substitute_product_id",
    "oi"."substitute_variant_id",
    "oi"."delivery_notes",
    "oi"."quality_rating",
    "oi"."quality_notes",
    "oi"."return_reason",
    "oi"."returned_quantity",
    "oi"."refund_amount",
    "oi"."commission_rate",
    "oi"."commission_amount",
    "oi"."promotion_applied",
    "oi"."free_item",
    "oi"."item_notes",
    "oi"."metadata",
    "oi"."created_at",
    "oi"."updated_at",
    "oi"."deleted_at",
    "o"."order_number",
    "o"."order_status" AS "parent_order_status",
    "o"."client_id",
    "o"."brand_id" AS "order_brand_id",
    "p"."name" AS "product_name",
    "p"."code" AS "product_code",
    "pv"."variant_name",
    "pv"."variant_code"
   FROM ((("public"."order_items" "oi"
     JOIN "public"."orders" "o" ON (("o"."id" = "oi"."order_id")))
     JOIN "public"."products" "p" ON (("p"."id" = "oi"."product_id")))
     LEFT JOIN "public"."product_variants" "pv" ON (("pv"."id" = "oi"."product_variant_id")))
  WHERE (("oi"."deleted_at" IS NULL) AND ("o"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL) AND (("pv"."deleted_at" IS NULL) OR ("pv"."id" IS NULL)));


ALTER VIEW "public"."active_order_items" OWNER TO "postgres";


COMMENT ON VIEW "public"."active_order_items" IS 'Vista de items de pedido activos con información de producto';



CREATE OR REPLACE VIEW "public"."active_orders" AS
 SELECT "o"."id",
    "o"."public_id",
    "o"."tenant_id",
    "o"."client_id",
    "o"."brand_id",
    "o"."order_number",
    "o"."order_type",
    "o"."order_status",
    "o"."order_date",
    "o"."requested_delivery_date",
    "o"."confirmed_delivery_date",
    "o"."actual_delivery_date",
    "o"."delivery_time_slot",
    "o"."delivery_address",
    "o"."delivery_instructions",
    "o"."commercial_structure_id",
    "o"."payment_method",
    "o"."payment_status",
    "o"."payment_terms",
    "o"."subtotal",
    "o"."discount_amount",
    "o"."tax_amount",
    "o"."shipping_cost",
    "o"."total_amount",
    "o"."currency",
    "o"."priority",
    "o"."source_channel",
    "o"."invoice_required",
    "o"."client_invoice_data_id",
    "o"."assigned_to",
    "o"."internal_notes",
    "o"."client_notes",
    "o"."tracking_number",
    "o"."estimated_delivery_time",
    "o"."cancellation_reason",
    "o"."cancelled_by",
    "o"."cancelled_at",
    "o"."order_attachments",
    "o"."delivery_confirmation",
    "o"."customer_rating",
    "o"."customer_feedback",
    "o"."metadata",
    "o"."created_at",
    "o"."updated_at",
    "o"."deleted_at",
    "c"."business_name" AS "client_business_name",
    "c"."owner_name" AS "client_owner_name",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "cs"."name" AS "commercial_structure_name",
    "cs"."structure_type",
    "cid"."invoice_name",
    "up_assigned"."first_name" AS "assigned_to_first_name",
    "up_assigned"."last_name" AS "assigned_to_last_name",
    "up_cancelled"."first_name" AS "cancelled_by_first_name",
    "up_cancelled"."last_name" AS "cancelled_by_last_name",
    "tn"."name" AS "tenant_name",
        CASE
            WHEN ("o"."order_status" = 'cancelled'::"public"."order_status_enum") THEN 'cancelled'::"text"
            WHEN ("o"."order_status" = 'returned'::"public"."order_status_enum") THEN 'returned'::"text"
            WHEN ("o"."order_status" = 'completed'::"public"."order_status_enum") THEN 'completed'::"text"
            WHEN (("o"."order_status" = 'delivered'::"public"."order_status_enum") AND ("o"."actual_delivery_date" IS NOT NULL)) THEN 'delivered'::"text"
            WHEN ("o"."order_status" = 'shipped'::"public"."order_status_enum") THEN 'in_transit'::"text"
            WHEN ("o"."order_status" = 'processing'::"public"."order_status_enum") THEN 'processing'::"text"
            WHEN ("o"."order_status" = 'confirmed'::"public"."order_status_enum") THEN 'confirmed'::"text"
            WHEN ("o"."order_status" = 'submitted'::"public"."order_status_enum") THEN 'pending_confirmation'::"text"
            ELSE 'draft'::"text"
        END AS "order_display_status",
    (CURRENT_DATE - "o"."order_date") AS "days_since_order",
        CASE
            WHEN ("o"."requested_delivery_date" IS NOT NULL) THEN ("o"."requested_delivery_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_requested_delivery",
        CASE
            WHEN ("o"."confirmed_delivery_date" IS NOT NULL) THEN ("o"."confirmed_delivery_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_confirmed_delivery",
        CASE
            WHEN ("o"."actual_delivery_date" IS NOT NULL) THEN 'delivered'::"text"
            WHEN (("o"."confirmed_delivery_date" IS NOT NULL) AND ("o"."confirmed_delivery_date" < CURRENT_DATE)) THEN 'overdue'::"text"
            WHEN (("o"."requested_delivery_date" IS NOT NULL) AND ("o"."requested_delivery_date" < CURRENT_DATE)) THEN 'delayed'::"text"
            WHEN ("o"."order_status" = ANY (ARRAY['shipped'::"public"."order_status_enum", 'processing'::"public"."order_status_enum"])) THEN 'on_schedule'::"text"
            ELSE 'pending'::"text"
        END AS "delivery_status",
        CASE
            WHEN ("o"."subtotal" > (0)::numeric) THEN (("o"."discount_amount" / "o"."subtotal") * (100)::numeric)
            ELSE (0)::numeric
        END AS "discount_percentage",
    ("o"."total_amount" - "o"."shipping_cost") AS "revenue_amount",
        CASE
            WHEN ("o"."actual_delivery_date" IS NOT NULL) THEN ("o"."actual_delivery_date" - "o"."order_date")
            ELSE NULL::integer
        END AS "processing_days",
        CASE
            WHEN (("o"."customer_rating" IS NOT NULL) AND ("o"."customer_rating" >= 4)) THEN 'satisfied'::"text"
            WHEN (("o"."customer_rating" IS NOT NULL) AND ("o"."customer_rating" >= 3)) THEN 'neutral'::"text"
            WHEN ("o"."customer_rating" IS NOT NULL) THEN 'unsatisfied'::"text"
            ELSE 'not_rated'::"text"
        END AS "satisfaction_level"
   FROM ((((((("public"."orders" "o"
     JOIN "public"."clients" "c" ON (("o"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("o"."brand_id" = "b"."id")))
     JOIN "public"."commercial_structures" "cs" ON (("o"."commercial_structure_id" = "cs"."id")))
     LEFT JOIN "public"."client_invoice_data" "cid" ON (("o"."client_invoice_data_id" = "cid"."id")))
     LEFT JOIN "public"."user_profiles" "up_assigned" ON (("o"."assigned_to" = "up_assigned"."id")))
     LEFT JOIN "public"."user_profiles" "up_cancelled" ON (("o"."cancelled_by" = "up_cancelled"."id")))
     JOIN "public"."tenants" "tn" ON (("o"."tenant_id" = "tn"."id")))
  WHERE (("o"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("cs"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "o"."order_date" DESC, "o"."created_at" DESC;


ALTER VIEW "public"."active_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."points_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_points_transaction_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "client_brand_membership_id" "uuid" NOT NULL,
    "transaction_type" "public"."points_transaction_type_enum" NOT NULL,
    "points" numeric(10,2) NOT NULL,
    "transaction_date" "date" NOT NULL,
    "source_type" "public"."points_source_type_enum" NOT NULL,
    "source_id" character varying(100),
    "source_description" "text",
    "points_rule_id" "uuid",
    "multiplier_applied" numeric(5,2) DEFAULT 1.00,
    "base_points" numeric(10,2),
    "expiration_date" "date",
    "is_expired" boolean DEFAULT false,
    "expired_date" "date",
    "balance_after" numeric(12,2) NOT NULL,
    "processed_by" "uuid",
    "approval_required" boolean DEFAULT false,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "reversal_of" "uuid",
    "reversed_by" "uuid",
    "campaign_id" "uuid",
    "promotion_id" "uuid",
    "notes" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "points_transactions_balance_after_check" CHECK (("balance_after" >= (0)::numeric)),
    CONSTRAINT "points_transactions_expiration_date_check" CHECK ((("expiration_date" IS NULL) OR ("expiration_date" > "transaction_date"))),
    CONSTRAINT "points_transactions_expired_date_check" CHECK ((("expired_date" IS NULL) OR ("expiration_date" IS NULL) OR ("expired_date" >= "expiration_date"))),
    CONSTRAINT "points_transactions_metadata_check" CHECK ((("metadata" IS NULL) OR ("jsonb_typeof"("metadata") = 'object'::"text"))),
    CONSTRAINT "points_transactions_multiplier_applied_check" CHECK (("multiplier_applied" > (0)::numeric)),
    CONSTRAINT "points_transactions_points_not_zero_check" CHECK (("points" <> (0)::numeric)),
    CONSTRAINT "points_transactions_public_id_format_check" CHECK ((("public_id")::"text" ~ '^PTX-[0-9]{4}$'::"text")),
    CONSTRAINT "points_transactions_reversal_not_self_check" CHECK (("reversal_of" <> "id")),
    CONSTRAINT "points_transactions_reversed_by_not_self_check" CHECK (("reversed_by" <> "id")),
    CONSTRAINT "points_transactions_transaction_date_check" CHECK (("transaction_date" <= CURRENT_DATE))
);


ALTER TABLE "public"."points_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."points_transactions" IS 'registra todas las transacciones de puntos (ganados y gastados) para cada membresía de cliente por marca';



COMMENT ON COLUMN "public"."points_transactions"."points" IS 'cantidad de puntos, positiva para ganar, negativa para gastar';



COMMENT ON COLUMN "public"."points_transactions"."transaction_date" IS 'fecha de la transacción';



COMMENT ON COLUMN "public"."points_transactions"."source_id" IS 'ID de la fuente: visit_order_id, campaign_id, etc.';



COMMENT ON COLUMN "public"."points_transactions"."source_description" IS 'descripción legible de la fuente';



COMMENT ON COLUMN "public"."points_transactions"."points_rule_id" IS 'referencia a la regla que generó los puntos';



COMMENT ON COLUMN "public"."points_transactions"."multiplier_applied" IS 'multiplicador aplicado por tier u otro factor';



COMMENT ON COLUMN "public"."points_transactions"."base_points" IS 'puntos base antes de multiplicadores';



COMMENT ON COLUMN "public"."points_transactions"."expiration_date" IS 'fecha de expiración de estos puntos';



COMMENT ON COLUMN "public"."points_transactions"."is_expired" IS 'si estos puntos ya expiraron';



COMMENT ON COLUMN "public"."points_transactions"."expired_date" IS 'fecha real de expiración';



COMMENT ON COLUMN "public"."points_transactions"."balance_after" IS 'balance total después de esta transacción';



COMMENT ON COLUMN "public"."points_transactions"."processed_by" IS 'quién procesó la transacción';



COMMENT ON COLUMN "public"."points_transactions"."approval_required" IS 'si requiere aprobación';



COMMENT ON COLUMN "public"."points_transactions"."approved_by" IS 'quién aprobó la transacción';



COMMENT ON COLUMN "public"."points_transactions"."approved_at" IS 'momento de aprobación';



COMMENT ON COLUMN "public"."points_transactions"."reversal_of" IS 'si es reversa de otra transacción';



COMMENT ON COLUMN "public"."points_transactions"."reversed_by" IS 'si esta transacción fue reversada';



COMMENT ON COLUMN "public"."points_transactions"."campaign_id" IS 'campaña asociada si aplica';



COMMENT ON COLUMN "public"."points_transactions"."promotion_id" IS 'promoción asociada si aplica';



COMMENT ON COLUMN "public"."points_transactions"."notes" IS 'notas adicionales sobre la transacción';



COMMENT ON COLUMN "public"."points_transactions"."metadata" IS 'datos adicionales específicos por tipo de transacción';



CREATE OR REPLACE VIEW "public"."active_points_transactions" AS
 SELECT "pt"."id",
    "pt"."public_id",
    "pt"."tenant_id",
    "pt"."client_brand_membership_id",
    "pt"."transaction_type",
    "pt"."points",
    "pt"."transaction_date",
    "pt"."source_type",
    "pt"."source_id",
    "pt"."source_description",
    "pt"."points_rule_id",
    "pt"."multiplier_applied",
    "pt"."base_points",
    "pt"."expiration_date",
    "pt"."is_expired",
    "pt"."expired_date",
    "pt"."balance_after",
    "pt"."processed_by",
    "pt"."approval_required",
    "pt"."approved_by",
    "pt"."approved_at",
    "pt"."reversal_of",
    "pt"."reversed_by",
    "pt"."campaign_id",
    "pt"."promotion_id",
    "pt"."notes",
    "pt"."metadata",
    "pt"."created_at",
    "pt"."updated_at",
    "pt"."deleted_at",
    "cbm"."client_id",
    "cbm"."brand_id",
    "cbm"."membership_status",
    "c"."business_name" AS "client_business_name",
    "c"."owner_name" AS "client_owner_name",
    "b"."name" AS "brand_name",
    "up_processed"."first_name" AS "processed_by_first_name",
    "up_processed"."last_name" AS "processed_by_last_name",
    "up_approved"."first_name" AS "approved_by_first_name",
    "up_approved"."last_name" AS "approved_by_last_name",
    "pt_reversal"."public_id" AS "reversal_of_public_id",
    "pt_reversed"."public_id" AS "reversed_by_public_id",
    "tn"."name" AS "tenant_name",
        CASE
            WHEN ("pt"."reversed_by" IS NOT NULL) THEN 'reversed'::"text"
            WHEN ("pt"."reversal_of" IS NOT NULL) THEN 'reversal'::"text"
            WHEN (("pt"."approval_required" = true) AND ("pt"."approved_by" IS NULL)) THEN 'pending_approval'::"text"
            WHEN ("pt"."is_expired" = true) THEN 'expired'::"text"
            ELSE 'active'::"text"
        END AS "transaction_status",
        CASE
            WHEN (("pt"."expiration_date" IS NOT NULL) AND ("pt"."is_expired" = false)) THEN ("pt"."expiration_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_expiration",
    (CURRENT_DATE - "pt"."transaction_date") AS "days_since_transaction",
        CASE
            WHEN ("pt"."points" > (0)::numeric) THEN 'credit'::"text"
            WHEN ("pt"."points" < (0)::numeric) THEN 'debit'::"text"
            ELSE 'neutral'::"text"
        END AS "points_classification",
    "abs"("pt"."points") AS "points_absolute",
        CASE
            WHEN (("pt"."base_points" IS NOT NULL) AND ("pt"."base_points" > (0)::numeric)) THEN ("pt"."points" / "pt"."base_points")
            ELSE "pt"."multiplier_applied"
        END AS "effective_multiplier"
   FROM (((((((("public"."points_transactions" "pt"
     JOIN "public"."client_brand_memberships" "cbm" ON (("pt"."client_brand_membership_id" = "cbm"."id")))
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     LEFT JOIN "public"."user_profiles" "up_processed" ON (("pt"."processed_by" = "up_processed"."id")))
     LEFT JOIN "public"."user_profiles" "up_approved" ON (("pt"."approved_by" = "up_approved"."id")))
     LEFT JOIN "public"."points_transactions" "pt_reversal" ON (("pt"."reversal_of" = "pt_reversal"."id")))
     LEFT JOIN "public"."points_transactions" "pt_reversed" ON (("pt"."reversed_by" = "pt_reversed"."id")))
     JOIN "public"."tenants" "tn" ON (("pt"."tenant_id" = "tn"."id")))
  WHERE (("pt"."deleted_at" IS NULL) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "pt"."transaction_date" DESC, "pt"."created_at" DESC;


ALTER VIEW "public"."active_points_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_product_category_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "brand_id" "uuid",
    "name" character varying(255) NOT NULL,
    "code" character varying(50) NOT NULL,
    "description" "text",
    "parent_category_id" "uuid",
    "category_level" integer DEFAULT 1,
    "icon_url" character varying(500),
    "color_hex" character varying(7),
    "characteristics" "jsonb",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "product_categories_category_level_check" CHECK ((("category_level" >= 1) AND ("category_level" <= 5))),
    CONSTRAINT "product_categories_characteristics_check" CHECK ((("characteristics" IS NULL) OR ("jsonb_typeof"("characteristics") = 'object'::"text"))),
    CONSTRAINT "product_categories_color_hex_check" CHECK ((("color_hex" IS NULL) OR (("color_hex")::"text" ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'::"text"))),
    CONSTRAINT "product_categories_parent_self_check" CHECK (("parent_category_id" <> "id")),
    CONSTRAINT "product_categories_public_id_format_check" CHECK ((("public_id")::"text" ~ '^PCG-[0-9]{4}$'::"text"))
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_categories" IS 'Categorías (bebidas, snacks, lácteos)';



COMMENT ON COLUMN "public"."product_categories"."name" IS 'ej: "Bebidas", "Bebidas Carbonatadas", "Snacks"';



COMMENT ON COLUMN "public"."product_categories"."code" IS 'código corto: "BEB", "BEB-CARB", "SNACKS"';



COMMENT ON COLUMN "public"."product_categories"."parent_category_id" IS 'para jerarquías';



COMMENT ON COLUMN "public"."product_categories"."category_level" IS '1=principal, 2=subcategoría, etc.';



COMMENT ON COLUMN "public"."product_categories"."icon_url" IS 'URL de icono en Supabase Storage';



COMMENT ON COLUMN "public"."product_categories"."color_hex" IS 'color asociado para UI';



COMMENT ON COLUMN "public"."product_categories"."characteristics" IS 'características específicas de la categoría';



CREATE OR REPLACE VIEW "public"."active_product_categories" AS
 WITH RECURSIVE "category_hierarchy" AS (
         SELECT "pc"."id",
            "pc"."public_id",
            "pc"."tenant_id",
            "pc"."brand_id",
            "pc"."name",
            "pc"."code",
            "pc"."description",
            "pc"."parent_category_id",
            "pc"."category_level",
            "pc"."icon_url",
            "pc"."color_hex",
            "pc"."characteristics",
            "pc"."is_active",
            "pc"."sort_order",
            "pc"."created_at",
            "pc"."updated_at",
            "pc"."deleted_at",
            ("pc"."name")::"text" AS "full_path",
            0 AS "level_depth"
           FROM "public"."product_categories" "pc"
          WHERE (("pc"."parent_category_id" IS NULL) AND ("pc"."deleted_at" IS NULL) AND ("pc"."is_active" = true))
        UNION ALL
         SELECT "pc"."id",
            "pc"."public_id",
            "pc"."tenant_id",
            "pc"."brand_id",
            "pc"."name",
            "pc"."code",
            "pc"."description",
            "pc"."parent_category_id",
            "pc"."category_level",
            "pc"."icon_url",
            "pc"."color_hex",
            "pc"."characteristics",
            "pc"."is_active",
            "pc"."sort_order",
            "pc"."created_at",
            "pc"."updated_at",
            "pc"."deleted_at",
            (("ch_1"."full_path" || ' > '::"text") || ("pc"."name")::"text") AS "full_path",
            ("ch_1"."level_depth" + 1) AS "level_depth"
           FROM ("public"."product_categories" "pc"
             JOIN "category_hierarchy" "ch_1" ON (("pc"."parent_category_id" = "ch_1"."id")))
          WHERE (("pc"."deleted_at" IS NULL) AND ("pc"."is_active" = true))
        )
 SELECT "ch"."id",
    "ch"."public_id",
    "ch"."tenant_id",
    "ch"."brand_id",
    "ch"."name",
    "ch"."code",
    "ch"."description",
    "ch"."parent_category_id",
    "ch"."category_level",
    "ch"."icon_url",
    "ch"."color_hex",
    "ch"."characteristics",
    "ch"."is_active",
    "ch"."sort_order",
    "ch"."created_at",
    "ch"."updated_at",
    "ch"."deleted_at",
    "ch"."full_path",
    "ch"."level_depth",
    "t"."name" AS "tenant_name",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    0 AS "product_count"
   FROM (("category_hierarchy" "ch"
     JOIN "public"."tenants" "t" ON (("ch"."tenant_id" = "t"."id")))
     LEFT JOIN "public"."brands" "b" ON (("ch"."brand_id" = "b"."id")))
  WHERE (("t"."deleted_at" IS NULL) AND (("b"."id" IS NULL) OR ("b"."deleted_at" IS NULL)))
  ORDER BY "ch"."tenant_id", "ch"."brand_id", "ch"."level_depth", "ch"."sort_order", "ch"."name";


ALTER VIEW "public"."active_product_categories" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_product_variants" AS
 SELECT "pv"."id",
    "pv"."public_id",
    "pv"."tenant_id",
    "pv"."product_id",
    "pv"."variant_name",
    "pv"."variant_code",
    "pv"."barcode",
    "pv"."price",
    "pv"."cost",
    "pv"."size_value",
    "pv"."size_unit",
    "pv"."package_type",
    "pv"."package_material",
    "pv"."weight_grams",
    "pv"."dimensions",
    "pv"."units_per_case",
    "pv"."case_dimensions",
    "pv"."case_weight_kg",
    "pv"."is_default",
    "pv"."is_active",
    "pv"."launch_date",
    "pv"."discontinue_date",
    "pv"."variant_image_url",
    "pv"."sort_order",
    "pv"."created_at",
    "pv"."updated_at",
    "pv"."deleted_at",
    "p"."name" AS "product_name",
    "p"."code" AS "product_code",
    "p"."base_price" AS "product_base_price",
    "p"."unit_type" AS "product_unit_type",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "pc"."name" AS "category_name",
    "pc"."code" AS "category_code",
    "t"."name" AS "tenant_name",
    "public"."calculate_current_margin"("pv"."cost", "pv"."price") AS "variant_margin",
        CASE
            WHEN ("p"."base_price" > (0)::numeric) THEN ((("pv"."price" - "p"."base_price") / "p"."base_price") * (100)::numeric)
            ELSE (0)::numeric
        END AS "price_vs_base_percent",
        CASE
            WHEN ("pv"."size_value" > (0)::numeric) THEN ("pv"."price" / "pv"."size_value")
            ELSE NULL::numeric
        END AS "price_per_unit",
        CASE
            WHEN (("pv"."discontinue_date" IS NOT NULL) AND ("pv"."discontinue_date" <= CURRENT_DATE)) THEN 'discontinued'::"text"
            WHEN (("pv"."launch_date" IS NOT NULL) AND ("pv"."launch_date" > CURRENT_DATE)) THEN 'upcoming'::"text"
            WHEN ("pv"."is_active" = false) THEN 'inactive'::"text"
            WHEN ("p"."is_active" = false) THEN 'product_inactive'::"text"
            ELSE 'active'::"text"
        END AS "variant_status",
    "concat"("pv"."size_value", "pv"."size_unit",
        CASE
            WHEN ("pv"."package_type" IS NOT NULL) THEN (' '::"text" || ("pv"."package_type")::"text")
            ELSE ''::"text"
        END) AS "full_package_description"
   FROM (((("public"."product_variants" "pv"
     JOIN "public"."products" "p" ON (("pv"."product_id" = "p"."id")))
     JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     JOIN "public"."product_categories" "pc" ON (("p"."category_id" = "pc"."id")))
     JOIN "public"."tenants" "t" ON (("pv"."tenant_id" = "t"."id")))
  WHERE (("pv"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("pc"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  ORDER BY "pv"."tenant_id", "b"."name", "p"."name", "pv"."sort_order", "pv"."size_value";


ALTER VIEW "public"."active_product_variants" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_products" AS
 SELECT "p"."id",
    "p"."public_id",
    "p"."tenant_id",
    "p"."brand_id",
    "p"."category_id",
    "p"."name",
    "p"."code",
    "p"."description",
    "p"."barcode",
    "p"."base_price",
    "p"."cost",
    "p"."margin_target",
    "p"."unit_type",
    "p"."weight_grams",
    "p"."volume_ml",
    "p"."dimensions",
    "p"."requires_refrigeration",
    "p"."shelf_life_days",
    "p"."minimum_stock",
    "p"."maximum_stock",
    "p"."is_active",
    "p"."is_featured",
    "p"."launch_date",
    "p"."discontinue_date",
    "p"."product_image_url",
    "p"."gallery_urls",
    "p"."specifications",
    "p"."marketing_tags",
    "p"."sort_order",
    "p"."created_at",
    "p"."updated_at",
    "p"."deleted_at",
    "t"."name" AS "tenant_name",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "pc"."name" AS "category_name",
    "pc"."code" AS "category_code",
    "pc"."full_path" AS "category_full_path",
    "public"."calculate_current_margin"("p"."cost", "p"."base_price") AS "current_margin",
        CASE
            WHEN (("p"."margin_target" IS NOT NULL) AND ("p"."cost" IS NOT NULL) AND ("p"."base_price" > (0)::numeric)) THEN ("p"."margin_target" - "public"."calculate_current_margin"("p"."cost", "p"."base_price"))
            ELSE NULL::numeric
        END AS "margin_gap",
        CASE
            WHEN (("p"."discontinue_date" IS NOT NULL) AND ("p"."discontinue_date" <= CURRENT_DATE)) THEN 'discontinued'::"text"
            WHEN (("p"."launch_date" IS NOT NULL) AND ("p"."launch_date" > CURRENT_DATE)) THEN 'upcoming'::"text"
            WHEN ("p"."is_active" = false) THEN 'inactive'::"text"
            ELSE 'active'::"text"
        END AS "product_status",
        CASE
            WHEN ("p"."discontinue_date" IS NOT NULL) THEN ("p"."discontinue_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_discontinuation",
        CASE
            WHEN ("p"."launch_date" IS NOT NULL) THEN (CURRENT_DATE - "p"."launch_date")
            ELSE NULL::integer
        END AS "days_since_launch"
   FROM ((("public"."products" "p"
     JOIN "public"."tenants" "t" ON (("p"."tenant_id" = "t"."id")))
     JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     JOIN "public"."active_product_categories" "pc" ON (("p"."category_id" = "pc"."id")))
  WHERE (("p"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL))
  ORDER BY "p"."tenant_id", "p"."brand_id", "pc"."category_level", "p"."sort_order", "p"."name";


ALTER VIEW "public"."active_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promotion_redemptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_promotion_redemption_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "client_brand_membership_id" "uuid" NOT NULL,
    "promotion_id" "uuid" NOT NULL,
    "order_type" "public"."promotion_order_type_enum" NOT NULL,
    "order_id" character varying(100) NOT NULL,
    "redemption_date" "date" NOT NULL,
    "redemption_status" "public"."promotion_redemption_status_enum" DEFAULT 'applied'::"public"."promotion_redemption_status_enum",
    "promotion_type_applied" "public"."promotion_type_applied_enum" NOT NULL,
    "original_promotion_value" numeric(10,2),
    "applied_discount_amount" numeric(10,2) DEFAULT 0.00,
    "applied_percentage" numeric(5,2),
    "free_items_quantity" integer DEFAULT 0,
    "points_multiplier_applied" numeric(5,2) DEFAULT 1.00,
    "bonus_points_awarded" numeric(10,2) DEFAULT 0.00,
    "order_subtotal_at_application" numeric(12,2),
    "minimum_met" boolean DEFAULT true,
    "maximum_discount_reached" boolean DEFAULT false,
    "rules_validation" "jsonb",
    "auto_applied" boolean DEFAULT false,
    "applied_by" "uuid",
    "validation_required" boolean DEFAULT false,
    "validated_by" "uuid",
    "validated_at" timestamp with time zone,
    "reversal_reason" "text",
    "reversed_by" "uuid",
    "reversed_at" timestamp with time zone,
    "client_notification_sent" boolean DEFAULT false,
    "internal_notes" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "promotion_redemptions_applied_discount_amount_check" CHECK (("applied_discount_amount" >= (0)::numeric)),
    CONSTRAINT "promotion_redemptions_applied_percentage_check" CHECK ((("applied_percentage" IS NULL) OR (("applied_percentage" >= 0.00) AND ("applied_percentage" <= 100.00)))),
    CONSTRAINT "promotion_redemptions_bonus_points_awarded_check" CHECK (("bonus_points_awarded" >= (0)::numeric)),
    CONSTRAINT "promotion_redemptions_free_items_quantity_check" CHECK (("free_items_quantity" >= 0)),
    CONSTRAINT "promotion_redemptions_metadata_check" CHECK ((("metadata" IS NULL) OR ("jsonb_typeof"("metadata") = 'object'::"text"))),
    CONSTRAINT "promotion_redemptions_order_subtotal_at_application_check" CHECK ((("order_subtotal_at_application" IS NULL) OR ("order_subtotal_at_application" > (0)::numeric))),
    CONSTRAINT "promotion_redemptions_original_promotion_value_check" CHECK ((("original_promotion_value" IS NULL) OR ("original_promotion_value" >= (0)::numeric))),
    CONSTRAINT "promotion_redemptions_points_multiplier_applied_check" CHECK (("points_multiplier_applied" > (0)::numeric)),
    CONSTRAINT "promotion_redemptions_public_id_format_check" CHECK ((("public_id")::"text" ~ '^PRD-[0-9]{4}$'::"text")),
    CONSTRAINT "promotion_redemptions_rules_validation_check" CHECK ((("rules_validation" IS NULL) OR ("jsonb_typeof"("rules_validation") = 'object'::"text")))
);


ALTER TABLE "public"."promotion_redemptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotion_redemptions" IS 'Tracking de quién usó qué promoción';



COMMENT ON COLUMN "public"."promotion_redemptions"."order_type" IS 'tipo de pedido donde se aplicó';



COMMENT ON COLUMN "public"."promotion_redemptions"."order_id" IS 'ID del pedido: order.public_id o visit_order.public_id';



COMMENT ON COLUMN "public"."promotion_redemptions"."applied_by" IS 'asesor que aplicó manualmente';



COMMENT ON COLUMN "public"."promotion_redemptions"."validation_required" IS 'si requiere validación posterior';



COMMENT ON COLUMN "public"."promotion_redemptions"."validated_by" IS 'supervisor que validó';



COMMENT ON COLUMN "public"."promotion_redemptions"."metadata" IS 'datos adicionales específicos por tipo de promoción';



CREATE TABLE IF NOT EXISTS "public"."promotions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_promotion_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "campaign_id" "uuid",
    "name" character varying(255) NOT NULL,
    "description" "text",
    "promotion_type" "public"."promotion_type_enum" NOT NULL,
    "status" "public"."promotion_status_enum" DEFAULT 'draft'::"public"."promotion_status_enum",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "days_of_week" "jsonb",
    "discount_percentage" numeric(5,2),
    "discount_amount" numeric(10,2),
    "min_purchase_amount" numeric(10,2) DEFAULT 0.00,
    "max_discount_amount" numeric(10,2),
    "buy_quantity" integer,
    "get_quantity" integer,
    "points_multiplier" numeric(5,2) DEFAULT 1.00,
    "usage_limit_per_client" integer,
    "usage_limit_total" integer,
    "usage_count_total" integer DEFAULT 0,
    "budget_allocated" numeric(12,2),
    "budget_spent" numeric(12,2) DEFAULT 0.00,
    "priority" integer DEFAULT 0,
    "stackable" boolean DEFAULT false,
    "auto_apply" boolean DEFAULT false,
    "requires_code" boolean DEFAULT false,
    "promo_code" character varying(100),
    "created_by" "uuid" NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "approval_notes" "text",
    "performance_metrics" "jsonb",
    "creative_assets" "jsonb",
    "terms_and_conditions" "text",
    "internal_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "promotions_budget_allocated_check" CHECK ((("budget_allocated" IS NULL) OR ("budget_allocated" >= (0)::numeric))),
    CONSTRAINT "promotions_budget_spent_check" CHECK (("budget_spent" >= (0)::numeric)),
    CONSTRAINT "promotions_budget_spent_vs_allocated_check" CHECK ((("budget_allocated" IS NULL) OR ("budget_spent" <= "budget_allocated"))),
    CONSTRAINT "promotions_buy_quantity_check" CHECK ((("buy_quantity" IS NULL) OR ("buy_quantity" > 0))),
    CONSTRAINT "promotions_creative_assets_check" CHECK ((("creative_assets" IS NULL) OR ("jsonb_typeof"("creative_assets") = 'array'::"text"))),
    CONSTRAINT "promotions_days_of_week_check" CHECK ((("days_of_week" IS NULL) OR ("jsonb_typeof"("days_of_week") = 'array'::"text"))),
    CONSTRAINT "promotions_discount_amount_check" CHECK ((("discount_amount" IS NULL) OR ("discount_amount" > (0)::numeric))),
    CONSTRAINT "promotions_discount_percentage_check" CHECK ((("discount_percentage" IS NULL) OR (("discount_percentage" >= 0.01) AND ("discount_percentage" <= 100.00)))),
    CONSTRAINT "promotions_end_date_check" CHECK (("end_date" > "start_date")),
    CONSTRAINT "promotions_end_time_check" CHECK ((("start_time" IS NULL) OR ("end_time" IS NULL) OR ("end_time" > "start_time"))),
    CONSTRAINT "promotions_get_quantity_check" CHECK ((("get_quantity" IS NULL) OR ("get_quantity" > 0))),
    CONSTRAINT "promotions_max_discount_amount_check" CHECK ((("max_discount_amount" IS NULL) OR ("max_discount_amount" > (0)::numeric))),
    CONSTRAINT "promotions_min_purchase_amount_check" CHECK (("min_purchase_amount" >= (0)::numeric)),
    CONSTRAINT "promotions_performance_metrics_check" CHECK ((("performance_metrics" IS NULL) OR ("jsonb_typeof"("performance_metrics") = 'object'::"text"))),
    CONSTRAINT "promotions_points_multiplier_check" CHECK (("points_multiplier" > (0)::numeric)),
    CONSTRAINT "promotions_public_id_format_check" CHECK ((("public_id")::"text" ~ '^PRM-[0-9]{4}$'::"text")),
    CONSTRAINT "promotions_usage_count_total_check" CHECK (("usage_count_total" >= 0)),
    CONSTRAINT "promotions_usage_limit_per_client_check" CHECK ((("usage_limit_per_client" IS NULL) OR ("usage_limit_per_client" > 0))),
    CONSTRAINT "promotions_usage_limit_total_check" CHECK ((("usage_limit_total" IS NULL) OR ("usage_limit_total" > 0)))
);


ALTER TABLE "public"."promotions" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotions" IS 'Promociones específicas con condiciones';



COMMENT ON COLUMN "public"."promotions"."campaign_id" IS 'campaña padre, puede ser null para promociones independientes';



COMMENT ON COLUMN "public"."promotions"."name" IS 'ej: "2x1 en Coca-Cola", "20% Descuento Tiendas VIP"';



COMMENT ON COLUMN "public"."promotions"."description" IS 'descripción detallada de la promoción';



COMMENT ON COLUMN "public"."promotions"."days_of_week" IS 'días de la semana cuando aplica';



COMMENT ON COLUMN "public"."promotions"."discount_percentage" IS 'porcentaje de descuento cuando aplique';



COMMENT ON COLUMN "public"."promotions"."discount_amount" IS 'monto fijo de descuento cuando aplique';



COMMENT ON COLUMN "public"."promotions"."min_purchase_amount" IS 'compra mínima para activar';



COMMENT ON COLUMN "public"."promotions"."max_discount_amount" IS 'límite máximo de descuento';



COMMENT ON COLUMN "public"."promotions"."buy_quantity" IS 'cantidad a comprar en promociones buy_x_get_y';



COMMENT ON COLUMN "public"."promotions"."get_quantity" IS 'cantidad gratuita en promociones buy_x_get_y';



COMMENT ON COLUMN "public"."promotions"."points_multiplier" IS 'multiplicador de puntos';



COMMENT ON COLUMN "public"."promotions"."priority" IS 'prioridad cuando hay múltiples promociones aplicables';



COMMENT ON COLUMN "public"."promotions"."stackable" IS 'si puede combinarse con otras promociones';



COMMENT ON COLUMN "public"."promotions"."created_by" IS 'brand manager que creó';



COMMENT ON COLUMN "public"."promotions"."approved_by" IS 'administrador que aprobó';



COMMENT ON COLUMN "public"."promotions"."creative_assets" IS 'assets creativos de la promoción';



COMMENT ON COLUMN "public"."promotions"."internal_notes" IS 'notas internas del equipo';



CREATE OR REPLACE VIEW "public"."active_promotion_redemptions" AS
 SELECT "pr"."id",
    "pr"."public_id",
    "pr"."tenant_id",
    "pr"."client_brand_membership_id",
    "pr"."promotion_id",
    "pr"."order_type",
    "pr"."order_id",
    "pr"."redemption_date",
    "pr"."redemption_status",
    "pr"."promotion_type_applied",
    "pr"."original_promotion_value",
    "pr"."applied_discount_amount",
    "pr"."applied_percentage",
    "pr"."free_items_quantity",
    "pr"."points_multiplier_applied",
    "pr"."bonus_points_awarded",
    "pr"."order_subtotal_at_application",
    "pr"."minimum_met",
    "pr"."maximum_discount_reached",
    "pr"."rules_validation",
    "pr"."auto_applied",
    "pr"."applied_by",
    "pr"."validation_required",
    "pr"."validated_by",
    "pr"."validated_at",
    "pr"."reversal_reason",
    "pr"."reversed_by",
    "pr"."reversed_at",
    "pr"."client_notification_sent",
    "pr"."internal_notes",
    "pr"."metadata",
    "pr"."created_at",
    "pr"."updated_at",
    "pr"."deleted_at",
    "cbm"."client_id",
    "cbm"."brand_id",
    "c"."business_name" AS "client_business_name",
    "c"."owner_name" AS "client_owner_name",
    "b"."name" AS "brand_name",
    "p"."name" AS "promotion_name",
    "p"."promotion_type",
    "p"."status" AS "promotion_status",
    "up_applied"."first_name" AS "applied_by_first_name",
    "up_applied"."last_name" AS "applied_by_last_name",
    "up_validated"."first_name" AS "validated_by_first_name",
    "up_validated"."last_name" AS "validated_by_last_name",
    "up_reversed"."first_name" AS "reversed_by_first_name",
    "up_reversed"."last_name" AS "reversed_by_last_name",
    "tn"."name" AS "tenant_name",
        CASE
            WHEN ("pr"."redemption_status" = 'reversed'::"public"."promotion_redemption_status_enum") THEN 'reversed'::"text"
            WHEN ("pr"."redemption_status" = 'rejected'::"public"."promotion_redemption_status_enum") THEN 'rejected'::"text"
            WHEN ("pr"."redemption_status" = 'validated'::"public"."promotion_redemption_status_enum") THEN 'validated'::"text"
            WHEN ("pr"."redemption_status" = 'pending_validation'::"public"."promotion_redemption_status_enum") THEN 'pending_validation'::"text"
            ELSE 'applied'::"text"
        END AS "redemption_display_status",
    (CURRENT_DATE - "pr"."redemption_date") AS "days_since_redemption",
        CASE
            WHEN ("pr"."order_subtotal_at_application" > (0)::numeric) THEN (("pr"."applied_discount_amount" / "pr"."order_subtotal_at_application") * (100)::numeric)
            ELSE (0)::numeric
        END AS "discount_percentage_effective",
    ("pr"."applied_discount_amount" + "pr"."bonus_points_awarded") AS "total_benefit_value",
        CASE
            WHEN ("pr"."auto_applied" = true) THEN 'automatic'::"text"
            WHEN ("pr"."applied_by" IS NOT NULL) THEN 'manual'::"text"
            ELSE 'system'::"text"
        END AS "application_type",
        CASE
            WHEN ("pr"."validation_required" = false) THEN 'not_required'::"text"
            WHEN ("pr"."validated_by" IS NOT NULL) THEN 'completed'::"text"
            WHEN ("pr"."redemption_status" = 'pending_validation'::"public"."promotion_redemption_status_enum") THEN 'pending'::"text"
            ELSE 'not_validated'::"text"
        END AS "validation_status",
        CASE
            WHEN ("pr"."order_type" = 'independent_order'::"public"."promotion_order_type_enum") THEN 'Portal Cliente'::"text"
            WHEN ("pr"."order_type" = 'visit_order'::"public"."promotion_order_type_enum") THEN 'Visita Asesor'::"text"
            ELSE 'Desconocido'::"text"
        END AS "order_source_description"
   FROM (((((((("public"."promotion_redemptions" "pr"
     JOIN "public"."client_brand_memberships" "cbm" ON (("pr"."client_brand_membership_id" = "cbm"."id")))
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     JOIN "public"."promotions" "p" ON (("pr"."promotion_id" = "p"."id")))
     LEFT JOIN "public"."user_profiles" "up_applied" ON (("pr"."applied_by" = "up_applied"."id")))
     LEFT JOIN "public"."user_profiles" "up_validated" ON (("pr"."validated_by" = "up_validated"."id")))
     LEFT JOIN "public"."user_profiles" "up_reversed" ON (("pr"."reversed_by" = "up_reversed"."id")))
     JOIN "public"."tenants" "tn" ON (("pr"."tenant_id" = "tn"."id")))
  WHERE (("pr"."deleted_at" IS NULL) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "pr"."redemption_date" DESC, "pr"."created_at" DESC;


ALTER VIEW "public"."active_promotion_redemptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promotion_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_promotion_rule_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "promotion_id" "uuid" NOT NULL,
    "rule_type" "public"."promotion_rule_type_enum" NOT NULL,
    "rule_name" character varying(255) NOT NULL,
    "is_inclusion" boolean DEFAULT true,
    "apply_to_all" boolean DEFAULT false,
    "target_zones" "jsonb",
    "target_states" "jsonb",
    "target_markets" "jsonb",
    "target_commercial_structures" "jsonb",
    "target_client_types" "jsonb",
    "target_clients" "jsonb",
    "target_products" "jsonb",
    "target_categories" "jsonb",
    "target_tiers" "jsonb",
    "custom_conditions" "jsonb",
    "effective_from" "date",
    "effective_until" "date",
    "priority" integer DEFAULT 0,
    "estimated_reach" integer,
    "actual_reach" integer,
    "rule_description" "text",
    "validation_query" "text",
    "is_active" boolean DEFAULT true,
    "created_by" "uuid" NOT NULL,
    "last_calculated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "promotion_rules_actual_reach_check" CHECK ((("actual_reach" IS NULL) OR ("actual_reach" >= 0))),
    CONSTRAINT "promotion_rules_custom_conditions_check" CHECK ((("custom_conditions" IS NULL) OR ("jsonb_typeof"("custom_conditions") = 'object'::"text"))),
    CONSTRAINT "promotion_rules_effective_dates_check" CHECK ((("effective_until" IS NULL) OR ("effective_from" IS NULL) OR ("effective_until" > "effective_from"))),
    CONSTRAINT "promotion_rules_estimated_reach_check" CHECK ((("estimated_reach" IS NULL) OR ("estimated_reach" >= 0))),
    CONSTRAINT "promotion_rules_public_id_format_check" CHECK ((("public_id")::"text" ~ '^PRR-[0-9]{4}$'::"text")),
    CONSTRAINT "promotion_rules_target_categories_check" CHECK ((("target_categories" IS NULL) OR ("jsonb_typeof"("target_categories") = 'object'::"text"))),
    CONSTRAINT "promotion_rules_target_client_types_check" CHECK ((("target_client_types" IS NULL) OR ("jsonb_typeof"("target_client_types") = 'object'::"text"))),
    CONSTRAINT "promotion_rules_target_clients_check" CHECK ((("target_clients" IS NULL) OR ("jsonb_typeof"("target_clients") = 'object'::"text"))),
    CONSTRAINT "promotion_rules_target_commercial_structures_check" CHECK ((("target_commercial_structures" IS NULL) OR ("jsonb_typeof"("target_commercial_structures") = 'object'::"text"))),
    CONSTRAINT "promotion_rules_target_markets_check" CHECK ((("target_markets" IS NULL) OR ("jsonb_typeof"("target_markets") = 'object'::"text"))),
    CONSTRAINT "promotion_rules_target_products_check" CHECK ((("target_products" IS NULL) OR ("jsonb_typeof"("target_products") = 'object'::"text"))),
    CONSTRAINT "promotion_rules_target_states_check" CHECK ((("target_states" IS NULL) OR ("jsonb_typeof"("target_states") = 'object'::"text"))),
    CONSTRAINT "promotion_rules_target_tiers_check" CHECK ((("target_tiers" IS NULL) OR ("jsonb_typeof"("target_tiers") = 'object'::"text"))),
    CONSTRAINT "promotion_rules_target_zones_check" CHECK ((("target_zones" IS NULL) OR ("jsonb_typeof"("target_zones") = 'object'::"text")))
);


ALTER TABLE "public"."promotion_rules" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotion_rules" IS 'Segmentación (solo zona norte, solo tier oro, etc.)';



COMMENT ON COLUMN "public"."promotion_rules"."rule_name" IS 'nombre descriptivo de la regla';



COMMENT ON COLUMN "public"."promotion_rules"."is_inclusion" IS 'true = incluir, false = excluir';



COMMENT ON COLUMN "public"."promotion_rules"."apply_to_all" IS 'toggle "Aplicar a todos" por campo específico';



COMMENT ON COLUMN "public"."promotion_rules"."target_zones" IS 'array de zone_ids incluidos/excluidos';



COMMENT ON COLUMN "public"."promotion_rules"."target_states" IS 'array de estados incluidos/excluidos';



COMMENT ON COLUMN "public"."promotion_rules"."target_markets" IS 'array de market_ids incluidos/excluidos';



COMMENT ON COLUMN "public"."promotion_rules"."target_commercial_structures" IS 'array de commercial_structure_ids';



COMMENT ON COLUMN "public"."promotion_rules"."target_client_types" IS 'array de client_type_ids';



COMMENT ON COLUMN "public"."promotion_rules"."target_clients" IS 'array de client_ids específicos';



COMMENT ON COLUMN "public"."promotion_rules"."target_products" IS 'array de product_ids';



COMMENT ON COLUMN "public"."promotion_rules"."target_categories" IS 'array de category_ids';



COMMENT ON COLUMN "public"."promotion_rules"."target_tiers" IS 'array de tier_ids';



COMMENT ON COLUMN "public"."promotion_rules"."priority" IS 'prioridad cuando hay múltiples reglas';



COMMENT ON COLUMN "public"."promotion_rules"."rule_description" IS 'descripción legible de la regla';



COMMENT ON COLUMN "public"."promotion_rules"."validation_query" IS 'query SQL para validar la regla';



COMMENT ON COLUMN "public"."promotion_rules"."last_calculated_at" IS 'última vez que se calculó el alcance';



CREATE OR REPLACE VIEW "public"."active_promotion_rules" AS
 SELECT "pr"."id",
    "pr"."public_id",
    "pr"."tenant_id",
    "pr"."promotion_id",
    "pr"."rule_type",
    "pr"."rule_name",
    "pr"."is_inclusion",
    "pr"."apply_to_all",
    "pr"."target_zones",
    "pr"."target_states",
    "pr"."target_markets",
    "pr"."target_commercial_structures",
    "pr"."target_client_types",
    "pr"."target_clients",
    "pr"."target_products",
    "pr"."target_categories",
    "pr"."target_tiers",
    "pr"."custom_conditions",
    "pr"."effective_from",
    "pr"."effective_until",
    "pr"."priority",
    "pr"."estimated_reach",
    "pr"."actual_reach",
    "pr"."rule_description",
    "pr"."validation_query",
    "pr"."is_active",
    "pr"."created_by",
    "pr"."last_calculated_at",
    "pr"."created_at",
    "pr"."updated_at",
    "pr"."deleted_at",
    "p"."name" AS "promotion_name",
    "p"."promotion_type",
    "p"."status" AS "promotion_status",
    "b"."name" AS "brand_name",
    "up_created"."first_name" AS "created_by_first_name",
    "up_created"."last_name" AS "created_by_last_name",
    "tn"."name" AS "tenant_name",
        CASE
            WHEN ("pr"."is_active" = false) THEN 'inactive'::"text"
            WHEN (("pr"."effective_until" IS NOT NULL) AND ("pr"."effective_until" < CURRENT_DATE)) THEN 'expired'::"text"
            WHEN (("pr"."effective_from" IS NOT NULL) AND ("pr"."effective_from" > CURRENT_DATE)) THEN 'scheduled'::"text"
            ELSE 'active'::"text"
        END AS "rule_display_status",
        CASE
            WHEN (("pr"."estimated_reach" IS NOT NULL) AND ("pr"."actual_reach" IS NOT NULL) AND ("pr"."estimated_reach" > 0)) THEN ((("pr"."actual_reach")::numeric / ("pr"."estimated_reach")::numeric) * (100)::numeric)
            ELSE NULL::numeric
        END AS "reach_accuracy_percentage",
        CASE
            WHEN ("pr"."effective_until" IS NOT NULL) THEN ("pr"."effective_until" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_expiration",
        CASE
            WHEN (("pr"."effective_from" IS NOT NULL) AND ("pr"."effective_from" > CURRENT_DATE)) THEN ("pr"."effective_from" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_activation",
        CASE
            WHEN ("pr"."apply_to_all" = true) THEN 'all_clients'::"text"
            WHEN (("pr"."target_clients" IS NOT NULL) AND (("pr"."target_clients" -> 'included'::"text") <> '[]'::"jsonb")) THEN 'specific_clients'::"text"
            WHEN (("pr"."target_zones" IS NOT NULL) OR ("pr"."target_markets" IS NOT NULL) OR ("pr"."target_client_types" IS NOT NULL)) THEN 'segmented'::"text"
            WHEN ("pr"."custom_conditions" IS NOT NULL) THEN 'custom'::"text"
            ELSE 'undefined'::"text"
        END AS "segmentation_type"
   FROM (((("public"."promotion_rules" "pr"
     JOIN "public"."promotions" "p" ON (("pr"."promotion_id" = "p"."id")))
     JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     JOIN "public"."user_profiles" "up_created" ON (("pr"."created_by" = "up_created"."id")))
     JOIN "public"."tenants" "tn" ON (("pr"."tenant_id" = "tn"."id")))
  WHERE (("pr"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("up_created"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "pr"."priority" DESC, "pr"."created_at" DESC;


ALTER VIEW "public"."active_promotion_rules" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_promotions" AS
 SELECT "p"."id",
    "p"."public_id",
    "p"."tenant_id",
    "p"."brand_id",
    "p"."campaign_id",
    "p"."name",
    "p"."description",
    "p"."promotion_type",
    "p"."status",
    "p"."start_date",
    "p"."end_date",
    "p"."start_time",
    "p"."end_time",
    "p"."days_of_week",
    "p"."discount_percentage",
    "p"."discount_amount",
    "p"."min_purchase_amount",
    "p"."max_discount_amount",
    "p"."buy_quantity",
    "p"."get_quantity",
    "p"."points_multiplier",
    "p"."usage_limit_per_client",
    "p"."usage_limit_total",
    "p"."usage_count_total",
    "p"."budget_allocated",
    "p"."budget_spent",
    "p"."priority",
    "p"."stackable",
    "p"."auto_apply",
    "p"."requires_code",
    "p"."promo_code",
    "p"."created_by",
    "p"."approved_by",
    "p"."approved_at",
    "p"."approval_notes",
    "p"."performance_metrics",
    "p"."creative_assets",
    "p"."terms_and_conditions",
    "p"."internal_notes",
    "p"."created_at",
    "p"."updated_at",
    "p"."deleted_at",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "c"."name" AS "campaign_name",
    "c"."campaign_type",
    "up_created"."first_name" AS "created_by_first_name",
    "up_created"."last_name" AS "created_by_last_name",
    "up_approved"."first_name" AS "approved_by_first_name",
    "up_approved"."last_name" AS "approved_by_last_name",
    "tn"."name" AS "tenant_name",
        CASE
            WHEN ("p"."status" = 'cancelled'::"public"."promotion_status_enum") THEN 'cancelled'::"text"
            WHEN ("p"."status" = 'completed'::"public"."promotion_status_enum") THEN 'completed'::"text"
            WHEN (("p"."end_date" < CURRENT_DATE) AND ("p"."status" = 'active'::"public"."promotion_status_enum")) THEN 'expired'::"text"
            WHEN (("p"."start_date" > CURRENT_DATE) AND ("p"."status" = 'active'::"public"."promotion_status_enum")) THEN 'scheduled'::"text"
            WHEN (("p"."status" = 'active'::"public"."promotion_status_enum") AND ("p"."start_date" <= CURRENT_DATE) AND ("p"."end_date" >= CURRENT_DATE)) THEN 'running'::"text"
            ELSE ("p"."status")::"text"
        END AS "promotion_display_status",
    ("p"."end_date" - "p"."start_date") AS "promotion_duration_days",
        CASE
            WHEN ("p"."end_date" >= CURRENT_DATE) THEN ("p"."end_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_end",
        CASE
            WHEN ("p"."start_date" > CURRENT_DATE) THEN (0)::numeric
            WHEN ("p"."end_date" < CURRENT_DATE) THEN (100)::numeric
            ELSE ((((CURRENT_DATE - "p"."start_date"))::numeric / (("p"."end_date" - "p"."start_date"))::numeric) * (100)::numeric)
        END AS "promotion_progress_percentage",
        CASE
            WHEN (("p"."usage_limit_total" IS NOT NULL) AND ("p"."usage_limit_total" > 0)) THEN ((("p"."usage_count_total")::numeric / ("p"."usage_limit_total")::numeric) * (100)::numeric)
            ELSE NULL::numeric
        END AS "usage_percentage",
        CASE
            WHEN ("p"."usage_limit_total" IS NOT NULL) THEN ("p"."usage_limit_total" - "p"."usage_count_total")
            ELSE NULL::integer
        END AS "remaining_usage",
        CASE
            WHEN (("p"."budget_allocated" IS NOT NULL) AND ("p"."budget_allocated" > (0)::numeric)) THEN (("p"."budget_spent" / "p"."budget_allocated") * (100)::numeric)
            ELSE NULL::numeric
        END AS "budget_utilization_percentage",
        CASE
            WHEN ("p"."budget_allocated" IS NOT NULL) THEN ("p"."budget_allocated" - "p"."budget_spent")
            ELSE NULL::numeric
        END AS "budget_remaining",
        CASE
            WHEN ("p"."days_of_week" IS NULL) THEN true
            WHEN ("p"."days_of_week" ? 'all'::"text") THEN true
            ELSE ("p"."days_of_week" ? "lower"("to_char"((CURRENT_DATE)::timestamp with time zone, 'day'::"text")))
        END AS "valid_today",
        CASE
            WHEN (("p"."start_time" IS NULL) OR ("p"."end_time" IS NULL)) THEN true
            ELSE ((CURRENT_TIME >= ("p"."start_time")::time with time zone) AND (CURRENT_TIME <= ("p"."end_time")::time with time zone))
        END AS "valid_now"
   FROM ((((("public"."promotions" "p"
     JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     LEFT JOIN "public"."campaigns" "c" ON (("p"."campaign_id" = "c"."id")))
     JOIN "public"."user_profiles" "up_created" ON (("p"."created_by" = "up_created"."id")))
     LEFT JOIN "public"."user_profiles" "up_approved" ON (("p"."approved_by" = "up_approved"."id")))
     JOIN "public"."tenants" "tn" ON (("p"."tenant_id" = "tn"."id")))
  WHERE (("p"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("up_created"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "p"."priority" DESC, "p"."start_date" DESC, "p"."created_at" DESC;


ALTER VIEW "public"."active_promotions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reward_redemptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_reward_redemption_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "client_brand_membership_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "points_transaction_id" "uuid" NOT NULL,
    "redemption_date" "date" NOT NULL,
    "redemption_status" "public"."redemption_status_enum" DEFAULT 'pending'::"public"."redemption_status_enum",
    "applied_to_order_id" character varying(100),
    "applied_amount" numeric(10,2),
    "original_reward_value" numeric(10,2) NOT NULL,
    "expiration_date" "date",
    "used_date" "date",
    "redemption_code" character varying(100) DEFAULT "public"."generate_redemption_code"() NOT NULL,
    "redeemed_by" "uuid",
    "validated_by" "uuid",
    "validation_notes" "text",
    "client_notes" "text",
    "cancellation_reason" "text",
    "cancelled_by" "uuid",
    "cancelled_at" timestamp with time zone,
    "refund_transaction_id" "uuid",
    "notification_sent" boolean DEFAULT false,
    "notification_sent_at" timestamp with time zone,
    "usage_instructions" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "reward_redemptions_applied_amount_check" CHECK ((("applied_amount" IS NULL) OR ("applied_amount" > (0)::numeric))),
    CONSTRAINT "reward_redemptions_expiration_date_check" CHECK ((("expiration_date" IS NULL) OR ("expiration_date" > "redemption_date"))),
    CONSTRAINT "reward_redemptions_metadata_check" CHECK ((("metadata" IS NULL) OR ("jsonb_typeof"("metadata") = 'object'::"text"))),
    CONSTRAINT "reward_redemptions_original_reward_value_check" CHECK (("original_reward_value" > (0)::numeric)),
    CONSTRAINT "reward_redemptions_public_id_format_check" CHECK ((("public_id")::"text" ~ '^RRD-[0-9]{4}$'::"text")),
    CONSTRAINT "reward_redemptions_used_date_check" CHECK ((("used_date" IS NULL) OR ("used_date" >= "redemption_date"))),
    CONSTRAINT "reward_redemptions_used_date_expiration_check" CHECK ((("used_date" IS NULL) OR ("expiration_date" IS NULL) OR ("used_date" <= "expiration_date")))
);


ALTER TABLE "public"."reward_redemptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."reward_redemptions" IS 'registra todos los canjes de recompensas realizados por los clientes';



COMMENT ON COLUMN "public"."reward_redemptions"."points_transaction_id" IS 'transacción de descuento de puntos';



COMMENT ON COLUMN "public"."reward_redemptions"."redemption_date" IS 'fecha del canje';



COMMENT ON COLUMN "public"."reward_redemptions"."applied_to_order_id" IS 'ID del pedido donde se aplicó la recompensa';



COMMENT ON COLUMN "public"."reward_redemptions"."applied_amount" IS 'monto real aplicado como descuento/beneficio';



COMMENT ON COLUMN "public"."reward_redemptions"."original_reward_value" IS 'valor original de la recompensa al momento del canje';



COMMENT ON COLUMN "public"."reward_redemptions"."expiration_date" IS 'fecha límite para usar la recompensa canjeada';



COMMENT ON COLUMN "public"."reward_redemptions"."used_date" IS 'fecha real de uso de la recompensa';



COMMENT ON COLUMN "public"."reward_redemptions"."redemption_code" IS 'código único para el canje';



COMMENT ON COLUMN "public"."reward_redemptions"."redeemed_by" IS 'asesor que procesó el canje';



COMMENT ON COLUMN "public"."reward_redemptions"."validated_by" IS 'quien validó la aplicación';



COMMENT ON COLUMN "public"."reward_redemptions"."validation_notes" IS 'notas sobre la validación/aplicación';



COMMENT ON COLUMN "public"."reward_redemptions"."client_notes" IS 'notas del cliente sobre el canje';



COMMENT ON COLUMN "public"."reward_redemptions"."cancellation_reason" IS 'razón de cancelación si aplica';



COMMENT ON COLUMN "public"."reward_redemptions"."cancelled_by" IS 'quien canceló el canje';



COMMENT ON COLUMN "public"."reward_redemptions"."cancelled_at" IS 'momento de cancelación';



COMMENT ON COLUMN "public"."reward_redemptions"."refund_transaction_id" IS 'reembolso de puntos si fue cancelado';



COMMENT ON COLUMN "public"."reward_redemptions"."notification_sent" IS 'si se notificó al cliente';



COMMENT ON COLUMN "public"."reward_redemptions"."usage_instructions" IS 'instrucciones específicas para usar esta redención';



COMMENT ON COLUMN "public"."reward_redemptions"."metadata" IS 'datos adicionales específicos del canje';



CREATE TABLE IF NOT EXISTS "public"."rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_reward_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "reward_type" "public"."reward_type_enum" NOT NULL,
    "points_cost" numeric(10,2) NOT NULL,
    "monetary_value" numeric(10,2),
    "discount_percentage" numeric(5,2),
    "discount_amount" numeric(10,2),
    "product_id" "uuid",
    "product_variant_id" "uuid",
    "min_purchase_amount" numeric(10,2) DEFAULT 0.00,
    "max_discount_amount" numeric(10,2),
    "usage_limit_per_client" integer,
    "usage_limit_total" integer,
    "usage_count_total" integer DEFAULT 0,
    "valid_from" "date" NOT NULL,
    "valid_until" "date",
    "tier_requirements" "jsonb",
    "applicable_products" "jsonb",
    "applicable_categories" "jsonb",
    "redemption_instructions" "text",
    "terms_and_conditions" "text",
    "reward_image_url" character varying(500),
    "is_featured" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "auto_apply" boolean DEFAULT false,
    "notification_message" "text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "promotion_id" "uuid",
    CONSTRAINT "rewards_applicable_categories_check" CHECK ((("applicable_categories" IS NULL) OR ("jsonb_typeof"("applicable_categories") = 'array'::"text"))),
    CONSTRAINT "rewards_applicable_products_check" CHECK ((("applicable_products" IS NULL) OR ("jsonb_typeof"("applicable_products") = 'array'::"text"))),
    CONSTRAINT "rewards_discount_amount_check" CHECK ((("discount_amount" IS NULL) OR ("discount_amount" > (0)::numeric))),
    CONSTRAINT "rewards_discount_percentage_check" CHECK ((("discount_percentage" IS NULL) OR (("discount_percentage" >= 0.01) AND ("discount_percentage" <= 100.00)))),
    CONSTRAINT "rewards_max_discount_amount_check" CHECK ((("max_discount_amount" IS NULL) OR ("max_discount_amount" > (0)::numeric))),
    CONSTRAINT "rewards_min_purchase_amount_check" CHECK (("min_purchase_amount" >= (0)::numeric)),
    CONSTRAINT "rewards_monetary_value_check" CHECK ((("monetary_value" IS NULL) OR ("monetary_value" > (0)::numeric))),
    CONSTRAINT "rewards_points_cost_check" CHECK (("points_cost" > (0)::numeric)),
    CONSTRAINT "rewards_public_id_format_check" CHECK ((("public_id")::"text" ~ '^RWD-[0-9]{4}$'::"text")),
    CONSTRAINT "rewards_tier_requirements_check" CHECK ((("tier_requirements" IS NULL) OR ("jsonb_typeof"("tier_requirements") = 'object'::"text"))),
    CONSTRAINT "rewards_usage_count_total_check" CHECK (("usage_count_total" >= 0)),
    CONSTRAINT "rewards_usage_count_vs_limit_check" CHECK ((("usage_limit_total" IS NULL) OR ("usage_count_total" <= "usage_limit_total"))),
    CONSTRAINT "rewards_usage_limit_per_client_check" CHECK ((("usage_limit_per_client" IS NULL) OR ("usage_limit_per_client" > 0))),
    CONSTRAINT "rewards_usage_limit_total_check" CHECK ((("usage_limit_total" IS NULL) OR ("usage_limit_total" > 0))),
    CONSTRAINT "rewards_valid_dates_check" CHECK ((("valid_until" IS NULL) OR ("valid_from" < "valid_until")))
);


ALTER TABLE "public"."rewards" OWNER TO "postgres";


COMMENT ON TABLE "public"."rewards" IS 'define el catálogo de recompensas canjeables por puntos para cada marca';



COMMENT ON COLUMN "public"."rewards"."name" IS 'ej: "Descuento 10%", "Coca-Cola 600ml Gratis", "Entrega Gratuita"';



COMMENT ON COLUMN "public"."rewards"."description" IS 'descripción detallada de la recompensa';



COMMENT ON COLUMN "public"."rewards"."points_cost" IS 'costo en puntos para canjear';



COMMENT ON COLUMN "public"."rewards"."monetary_value" IS 'valor monetario equivalente';



COMMENT ON COLUMN "public"."rewards"."discount_percentage" IS 'porcentaje de descuento cuando aplique';



COMMENT ON COLUMN "public"."rewards"."discount_amount" IS 'monto fijo de descuento cuando aplique';



COMMENT ON COLUMN "public"."rewards"."product_id" IS 'producto específico cuando es free_product';



COMMENT ON COLUMN "public"."rewards"."product_variant_id" IS 'variante específica cuando aplique';



COMMENT ON COLUMN "public"."rewards"."min_purchase_amount" IS 'compra mínima para aplicar la recompensa';



COMMENT ON COLUMN "public"."rewards"."max_discount_amount" IS 'límite máximo de descuento';



COMMENT ON COLUMN "public"."rewards"."usage_limit_per_client" IS 'límite de usos por cliente';



COMMENT ON COLUMN "public"."rewards"."usage_limit_total" IS 'límite total de usos de esta recompensa';



COMMENT ON COLUMN "public"."rewards"."usage_count_total" IS 'conteo actual de usos';



COMMENT ON COLUMN "public"."rewards"."valid_from" IS 'fecha desde que es válida';



COMMENT ON COLUMN "public"."rewards"."valid_until" IS 'fecha hasta que es válida, null = sin expiración';



COMMENT ON COLUMN "public"."rewards"."tier_requirements" IS 'tiers mínimos requeridos para acceder';



COMMENT ON COLUMN "public"."rewards"."applicable_products" IS 'productos específicos donde aplica la recompensa';



COMMENT ON COLUMN "public"."rewards"."applicable_categories" IS 'categorías donde aplica la recompensa';



COMMENT ON COLUMN "public"."rewards"."redemption_instructions" IS 'instrucciones para canjear la recompensa';



COMMENT ON COLUMN "public"."rewards"."terms_and_conditions" IS 'términos y condiciones del canje';



COMMENT ON COLUMN "public"."rewards"."reward_image_url" IS 'imagen de la recompensa';



COMMENT ON COLUMN "public"."rewards"."is_featured" IS 'recompensa destacada?';



COMMENT ON COLUMN "public"."rewards"."auto_apply" IS 'si se aplica automáticamente al cumplir condiciones';



COMMENT ON COLUMN "public"."rewards"."notification_message" IS 'mensaje al cliente cuando canjea';



CREATE OR REPLACE VIEW "public"."active_reward_redemptions" AS
 SELECT "rr"."id",
    "rr"."public_id",
    "rr"."tenant_id",
    "rr"."client_brand_membership_id",
    "rr"."reward_id",
    "rr"."points_transaction_id",
    "rr"."redemption_date",
    "rr"."redemption_status",
    "rr"."applied_to_order_id",
    "rr"."applied_amount",
    "rr"."original_reward_value",
    "rr"."expiration_date",
    "rr"."used_date",
    "rr"."redemption_code",
    "rr"."redeemed_by",
    "rr"."validated_by",
    "rr"."validation_notes",
    "rr"."client_notes",
    "rr"."cancellation_reason",
    "rr"."cancelled_by",
    "rr"."cancelled_at",
    "rr"."refund_transaction_id",
    "rr"."notification_sent",
    "rr"."notification_sent_at",
    "rr"."usage_instructions",
    "rr"."metadata",
    "rr"."created_at",
    "rr"."updated_at",
    "rr"."deleted_at",
    "cbm"."client_id",
    "cbm"."brand_id",
    "cbm"."membership_status",
    "c"."business_name" AS "client_business_name",
    "c"."owner_name" AS "client_owner_name",
    "b"."name" AS "brand_name",
    "r"."name" AS "reward_name",
    "r"."reward_type",
    "r"."points_cost" AS "reward_points_cost",
    "up_redeemed"."first_name" AS "redeemed_by_first_name",
    "up_redeemed"."last_name" AS "redeemed_by_last_name",
    "up_validated"."first_name" AS "validated_by_first_name",
    "up_validated"."last_name" AS "validated_by_last_name",
    "up_cancelled"."first_name" AS "cancelled_by_first_name",
    "up_cancelled"."last_name" AS "cancelled_by_last_name",
    "pt"."points" AS "points_deducted",
    "pt_refund"."points" AS "points_refunded",
    "tn"."name" AS "tenant_name",
        CASE
            WHEN ("rr"."redemption_status" = 'cancelled'::"public"."redemption_status_enum") THEN 'cancelled'::"text"
            WHEN (("rr"."expiration_date" IS NOT NULL) AND ("rr"."expiration_date" < CURRENT_DATE) AND ("rr"."redemption_status" <> 'applied'::"public"."redemption_status_enum")) THEN 'expired'::"text"
            WHEN ("rr"."redemption_status" = 'applied'::"public"."redemption_status_enum") THEN 'completed'::"text"
            WHEN ("rr"."redemption_status" = 'confirmed'::"public"."redemption_status_enum") THEN 'ready_to_use'::"text"
            ELSE 'pending'::"text"
        END AS "redemption_display_status",
        CASE
            WHEN (("rr"."expiration_date" IS NOT NULL) AND ("rr"."redemption_status" <> ALL (ARRAY['applied'::"public"."redemption_status_enum", 'cancelled'::"public"."redemption_status_enum"]))) THEN ("rr"."expiration_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_expiration",
    (CURRENT_DATE - "rr"."redemption_date") AS "days_since_redemption",
        CASE
            WHEN ("rr"."used_date" IS NOT NULL) THEN ("rr"."used_date" - "rr"."redemption_date")
            ELSE NULL::integer
        END AS "days_to_use",
        CASE
            WHEN (("rr"."applied_amount" IS NOT NULL) AND ("rr"."original_reward_value" > (0)::numeric)) THEN (("rr"."applied_amount" / "rr"."original_reward_value") * (100)::numeric)
            ELSE NULL::numeric
        END AS "value_utilization_percentage",
        CASE
            WHEN ("rr"."applied_amount" IS NOT NULL) THEN "rr"."applied_amount"
            WHEN ("rr"."redemption_status" = 'applied'::"public"."redemption_status_enum") THEN "rr"."original_reward_value"
            ELSE NULL::numeric
        END AS "actual_savings"
   FROM (((((((((("public"."reward_redemptions" "rr"
     JOIN "public"."client_brand_memberships" "cbm" ON (("rr"."client_brand_membership_id" = "cbm"."id")))
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     JOIN "public"."rewards" "r" ON (("rr"."reward_id" = "r"."id")))
     JOIN "public"."points_transactions" "pt" ON (("rr"."points_transaction_id" = "pt"."id")))
     LEFT JOIN "public"."points_transactions" "pt_refund" ON (("rr"."refund_transaction_id" = "pt_refund"."id")))
     LEFT JOIN "public"."user_profiles" "up_redeemed" ON (("rr"."redeemed_by" = "up_redeemed"."id")))
     LEFT JOIN "public"."user_profiles" "up_validated" ON (("rr"."validated_by" = "up_validated"."id")))
     LEFT JOIN "public"."user_profiles" "up_cancelled" ON (("rr"."cancelled_by" = "up_cancelled"."id")))
     JOIN "public"."tenants" "tn" ON (("rr"."tenant_id" = "tn"."id")))
  WHERE (("rr"."deleted_at" IS NULL) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("r"."deleted_at" IS NULL) AND ("pt"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "rr"."redemption_date" DESC, "rr"."created_at" DESC;


ALTER VIEW "public"."active_reward_redemptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_rewards" AS
 SELECT "r"."id",
    "r"."public_id",
    "r"."tenant_id",
    "r"."brand_id",
    "r"."name",
    "r"."description",
    "r"."reward_type",
    "r"."points_cost",
    "r"."monetary_value",
    "r"."discount_percentage",
    "r"."discount_amount",
    "r"."product_id",
    "r"."product_variant_id",
    "r"."min_purchase_amount",
    "r"."max_discount_amount",
    "r"."usage_limit_per_client",
    "r"."usage_limit_total",
    "r"."usage_count_total",
    "r"."valid_from",
    "r"."valid_until",
    "r"."tier_requirements",
    "r"."applicable_products",
    "r"."applicable_categories",
    "r"."redemption_instructions",
    "r"."terms_and_conditions",
    "r"."reward_image_url",
    "r"."is_featured",
    "r"."is_active",
    "r"."auto_apply",
    "r"."notification_message",
    "r"."sort_order",
    "r"."created_at",
    "r"."updated_at",
    "r"."deleted_at",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "p"."name" AS "product_name",
    "p"."code" AS "product_code",
    "pv"."variant_name",
    "pv"."variant_code",
    "tn"."name" AS "tenant_name",
        CASE
            WHEN (("r"."valid_until" IS NOT NULL) AND ("r"."valid_until" < CURRENT_DATE)) THEN 'expired'::"text"
            WHEN ("r"."valid_from" > CURRENT_DATE) THEN 'upcoming'::"text"
            WHEN ("r"."is_active" = false) THEN 'inactive'::"text"
            WHEN (("r"."usage_limit_total" IS NOT NULL) AND ("r"."usage_count_total" >= "r"."usage_limit_total")) THEN 'sold_out'::"text"
            ELSE 'available'::"text"
        END AS "reward_status",
        CASE
            WHEN ("r"."valid_until" IS NOT NULL) THEN ("r"."valid_until" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_expiration",
        CASE
            WHEN ("r"."valid_from" > CURRENT_DATE) THEN ("r"."valid_from" - CURRENT_DATE)
            ELSE 0
        END AS "days_until_activation",
        CASE
            WHEN ("r"."usage_limit_total" IS NOT NULL) THEN ("r"."usage_limit_total" - "r"."usage_count_total")
            ELSE NULL::integer
        END AS "remaining_usage",
        CASE
            WHEN (("r"."usage_limit_total" IS NOT NULL) AND ("r"."usage_limit_total" > 0)) THEN ((("r"."usage_count_total")::numeric / ("r"."usage_limit_total")::numeric) * (100)::numeric)
            ELSE NULL::numeric
        END AS "usage_percentage",
        CASE
            WHEN (("r"."monetary_value" IS NOT NULL) AND ("r"."points_cost" > (0)::numeric)) THEN ("r"."monetary_value" / "r"."points_cost")
            ELSE NULL::numeric
        END AS "value_per_point",
        CASE
            WHEN ("r"."points_cost" <= (100)::numeric) THEN 'low_cost'::"text"
            WHEN ("r"."points_cost" <= (500)::numeric) THEN 'medium_cost'::"text"
            WHEN ("r"."points_cost" <= (1000)::numeric) THEN 'high_cost'::"text"
            ELSE 'premium'::"text"
        END AS "cost_category",
        CASE
            WHEN ("r"."tier_requirements" IS NOT NULL) THEN 'tier_restricted'::"text"
            WHEN (("r"."applicable_products" IS NOT NULL) OR ("r"."applicable_categories" IS NOT NULL)) THEN 'product_restricted'::"text"
            ELSE 'unrestricted'::"text"
        END AS "restriction_type"
   FROM (((("public"."rewards" "r"
     JOIN "public"."brands" "b" ON (("r"."brand_id" = "b"."id")))
     JOIN "public"."tenants" "tn" ON (("r"."tenant_id" = "tn"."id")))
     LEFT JOIN "public"."products" "p" ON (("r"."product_id" = "p"."id")))
     LEFT JOIN "public"."product_variants" "pv" ON (("r"."product_variant_id" = "pv"."id")))
  WHERE (("r"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "r"."is_featured" DESC, "r"."sort_order", "r"."points_cost";


ALTER VIEW "public"."active_rewards" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_tenants" AS
 SELECT "id",
    "public_id",
    "name",
    "slug",
    "email",
    "phone",
    "address",
    "country",
    "timezone",
    "status",
    "subscription_plan",
    "trial_ends_at",
    "settings",
    "created_at",
    "updated_at",
    "deleted_at"
   FROM "public"."tenants"
  WHERE ("deleted_at" IS NULL);


ALTER VIEW "public"."active_tenants" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_tiers" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::character varying(20) AS "public_id",
    NULL::"uuid" AS "tenant_id",
    NULL::"uuid" AS "brand_id",
    NULL::character varying(255) AS "name",
    NULL::character varying(50) AS "code",
    NULL::"text" AS "description",
    NULL::integer AS "tier_level",
    NULL::numeric(12,2) AS "min_points_required",
    NULL::integer AS "min_visits_required",
    NULL::integer AS "min_purchases_required",
    NULL::numeric(12,2) AS "min_purchase_amount",
    NULL::integer AS "evaluation_period_months",
    NULL::numeric(5,2) AS "points_multiplier",
    NULL::numeric(5,2) AS "discount_percentage",
    NULL::"jsonb" AS "benefits",
    NULL::"jsonb" AS "requirements",
    NULL::character varying(7) AS "tier_color",
    NULL::character varying(500) AS "tier_icon_url",
    NULL::character varying(500) AS "badge_image_url",
    NULL::boolean AS "is_default",
    NULL::boolean AS "is_active",
    NULL::boolean AS "auto_assignment_enabled",
    NULL::"jsonb" AS "auto_assignment_rules",
    NULL::integer AS "retention_period_months",
    NULL::boolean AS "downgrade_enabled",
    NULL::boolean AS "upgrade_notification",
    NULL::integer AS "sort_order",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::timestamp with time zone AS "deleted_at",
    NULL::character varying(255) AS "brand_name",
    NULL::character varying(100) AS "brand_slug",
    NULL::character varying(255) AS "tenant_name",
    NULL::bigint AS "total_members",
    NULL::bigint AS "active_members",
    NULL::numeric AS "previous_tier_min_points",
    NULL::numeric AS "next_tier_min_points",
    NULL::integer AS "benefits_count",
    NULL::"text" AS "tier_status",
    NULL::character varying AS "display_color",
    NULL::"text" AS "tier_value_level";


ALTER VIEW "public"."active_tiers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_user_profiles" AS
 SELECT "id",
    "user_id",
    "public_id",
    "employee_code",
    "first_name",
    "last_name",
    "email",
    "phone",
    "avatar_url",
    "position",
    "department",
    "hire_date",
    "manager_id",
    "status",
    "preferences",
    "last_login_at",
    "timezone",
    "created_at",
    "updated_at",
    "deleted_at"
   FROM "public"."user_profiles"
  WHERE ("deleted_at" IS NULL);


ALTER VIEW "public"."active_user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_profile_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "brand_id" "uuid",
    "role" "public"."user_role_type_enum" NOT NULL,
    "scope" "public"."user_role_scope_enum" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "status" "public"."user_role_status_enum" DEFAULT 'active'::"public"."user_role_status_enum",
    "permissions" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "user_roles_admin_scope_check" CHECK (((("role" = 'admin'::"public"."user_role_type_enum") AND ("scope" = ANY (ARRAY['global'::"public"."user_role_scope_enum", 'tenant'::"public"."user_role_scope_enum"]))) OR ("role" <> 'admin'::"public"."user_role_type_enum"))),
    CONSTRAINT "user_roles_brand_manager_scope_check" CHECK (((("role" = 'brand_manager'::"public"."user_role_type_enum") AND ("scope" = 'brand'::"public"."user_role_scope_enum")) OR ("role" <> 'brand_manager'::"public"."user_role_type_enum"))),
    CONSTRAINT "user_roles_brand_scope_check" CHECK (((("scope" = 'brand'::"public"."user_role_scope_enum") AND ("brand_id" IS NOT NULL)) OR (("scope" = ANY (ARRAY['global'::"public"."user_role_scope_enum", 'tenant'::"public"."user_role_scope_enum"])) AND ("brand_id" IS NULL)))),
    CONSTRAINT "user_roles_non_global_scope_check" CHECK (((("role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("scope" = ANY (ARRAY['tenant'::"public"."user_role_scope_enum", 'brand'::"public"."user_role_scope_enum"]))) OR ("role" <> ALL (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"]))))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_roles" IS 'Roles múltiples por usuario';



COMMENT ON COLUMN "public"."user_roles"."brand_id" IS 'null para roles globales/tenant';



COMMENT ON COLUMN "public"."user_roles"."is_primary" IS 'es rol principal del usuario?';



COMMENT ON COLUMN "public"."user_roles"."granted_by" IS 'quién otorgó el rol';



COMMENT ON COLUMN "public"."user_roles"."expires_at" IS 'para roles temporales';



COMMENT ON COLUMN "public"."user_roles"."permissions" IS 'permisos específicos adicionales';



CREATE OR REPLACE VIEW "public"."active_user_roles" AS
 SELECT "ur"."id",
    "ur"."user_profile_id",
    "ur"."tenant_id",
    "ur"."brand_id",
    "ur"."role",
    "ur"."scope",
    "ur"."is_primary",
    "ur"."granted_by",
    "ur"."granted_at",
    "ur"."expires_at",
    "ur"."status",
    "ur"."permissions",
    "ur"."created_at",
    "ur"."updated_at",
    "ur"."deleted_at",
    "public"."is_role_active"("ur"."status", "ur"."expires_at", "ur"."deleted_at") AS "is_currently_active"
   FROM ((("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
     JOIN "public"."tenants" "t" ON (("ur"."tenant_id" = "t"."id")))
     LEFT JOIN "public"."brands" "b" ON (("ur"."brand_id" = "b"."id")))
  WHERE (("up"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL) AND (("ur"."brand_id" IS NULL) OR ("b"."deleted_at" IS NULL)) AND "public"."is_role_active"("ur"."status", "ur"."expires_at", "ur"."deleted_at"));


ALTER VIEW "public"."active_user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visit_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_visit_assessment_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "visit_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_variant_id" "uuid",
    "assessment_type" "public"."assessment_type_enum" NOT NULL,
    "is_present" boolean NOT NULL,
    "stock_level" "public"."stock_level_enum",
    "stock_quantity" integer,
    "current_price" numeric(10,2),
    "suggested_price" numeric(10,2),
    "price_variance_percent" numeric(5,2),
    "package_condition" "public"."package_condition_enum",
    "expiration_date" "date",
    "shelf_position" "public"."shelf_position_enum",
    "shelf_space_cm" integer,
    "facing_count" integer,
    "competitor_present" boolean DEFAULT false,
    "competitor_products" "jsonb",
    "competitor_prices" "jsonb",
    "display_quality" "public"."display_quality_enum",
    "promotional_materials" "jsonb",
    "assessment_notes" "text",
    "photo_evidence_urls" "jsonb",
    "requires_action" boolean DEFAULT false,
    "recommended_actions" "jsonb",
    "assessment_score" numeric(3,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "visit_assessments_assessment_score_check" CHECK ((("assessment_score" >= 0.0) AND ("assessment_score" <= 10.0))),
    CONSTRAINT "visit_assessments_competitor_prices_check" CHECK ((("competitor_prices" IS NULL) OR ("jsonb_typeof"("competitor_prices") = 'object'::"text"))),
    CONSTRAINT "visit_assessments_competitor_products_check" CHECK ((("competitor_products" IS NULL) OR ("jsonb_typeof"("competitor_products") = 'array'::"text"))),
    CONSTRAINT "visit_assessments_current_price_check" CHECK ((("current_price" IS NULL) OR ("current_price" > (0)::numeric))),
    CONSTRAINT "visit_assessments_facing_count_check" CHECK ((("facing_count" IS NULL) OR ("facing_count" > 0))),
    CONSTRAINT "visit_assessments_photo_evidence_urls_check" CHECK ((("photo_evidence_urls" IS NULL) OR ("jsonb_typeof"("photo_evidence_urls") = 'array'::"text"))),
    CONSTRAINT "visit_assessments_promotional_materials_check" CHECK ((("promotional_materials" IS NULL) OR ("jsonb_typeof"("promotional_materials") = 'array'::"text"))),
    CONSTRAINT "visit_assessments_public_id_format_check" CHECK ((("public_id")::"text" ~ '^VAS-[0-9]{4}$'::"text")),
    CONSTRAINT "visit_assessments_recommended_actions_check" CHECK ((("recommended_actions" IS NULL) OR ("jsonb_typeof"("recommended_actions") = 'array'::"text"))),
    CONSTRAINT "visit_assessments_shelf_space_check" CHECK ((("shelf_space_cm" IS NULL) OR ("shelf_space_cm" > 0))),
    CONSTRAINT "visit_assessments_stock_quantity_check" CHECK ((("stock_quantity" IS NULL) OR ("stock_quantity" >= 0))),
    CONSTRAINT "visit_assessments_suggested_price_check" CHECK ((("suggested_price" IS NULL) OR ("suggested_price" > (0)::numeric)))
);


ALTER TABLE "public"."visit_assessments" OWNER TO "postgres";


COMMENT ON TABLE "public"."visit_assessments" IS 'Evaluación obligatoria de productos/empaques/precios';



COMMENT ON COLUMN "public"."visit_assessments"."product_variant_id" IS 'variante específica evaluada';



COMMENT ON COLUMN "public"."visit_assessments"."is_present" IS '¿está presente en el punto de venta?';



COMMENT ON COLUMN "public"."visit_assessments"."stock_quantity" IS 'cantidad exacta si se conoce';



COMMENT ON COLUMN "public"."visit_assessments"."current_price" IS 'precio actual en el punto de venta';



COMMENT ON COLUMN "public"."visit_assessments"."suggested_price" IS 'precio sugerido por la marca';



COMMENT ON COLUMN "public"."visit_assessments"."price_variance_percent" IS 'diferencia porcentual del precio';



COMMENT ON COLUMN "public"."visit_assessments"."expiration_date" IS 'fecha de caducidad más próxima encontrada';



COMMENT ON COLUMN "public"."visit_assessments"."shelf_space_cm" IS 'espacio en centímetros en anaquel';



COMMENT ON COLUMN "public"."visit_assessments"."facing_count" IS 'número de frentes del producto';



COMMENT ON COLUMN "public"."visit_assessments"."competitor_products" IS 'array de productos competidores presentes';



COMMENT ON COLUMN "public"."visit_assessments"."competitor_prices" IS 'precios de la competencia';



COMMENT ON COLUMN "public"."visit_assessments"."promotional_materials" IS 'materiales promocionales presentes';



COMMENT ON COLUMN "public"."visit_assessments"."assessment_notes" IS 'observaciones específicas del assessment';



COMMENT ON COLUMN "public"."visit_assessments"."photo_evidence_urls" IS 'array de URLs de fotos como evidencia';



COMMENT ON COLUMN "public"."visit_assessments"."recommended_actions" IS 'array de acciones recomendadas';



CREATE TABLE IF NOT EXISTS "public"."visits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_visit_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "advisor_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "visit_date" "date" NOT NULL,
    "visit_time_start" time without time zone,
    "visit_time_end" time without time zone,
    "visit_type" "public"."visit_type_enum" DEFAULT 'scheduled'::"public"."visit_type_enum",
    "visit_status" "public"."visit_status_enum" DEFAULT 'planned'::"public"."visit_status_enum",
    "workflow_status" "public"."visit_workflow_status_enum" DEFAULT 'assessment_pending'::"public"."visit_workflow_status_enum",
    "location_coordinates" "point",
    "check_in_time" timestamp with time zone,
    "check_out_time" timestamp with time zone,
    "duration_minutes" integer,
    "visit_objective" "text",
    "visit_notes" "text",
    "next_visit_date" "date",
    "client_satisfaction_rating" integer,
    "advisor_notes" "text",
    "supervisor_notes" "text",
    "requires_follow_up" boolean DEFAULT false,
    "follow_up_reason" "text",
    "weather_conditions" character varying(100),
    "visit_attachments" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "brand_id" "uuid",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    CONSTRAINT "visits_attachments_check" CHECK ((("visit_attachments" IS NULL) OR ("jsonb_typeof"("visit_attachments") = 'array'::"text"))),
    CONSTRAINT "visits_checkin_order_check" CHECK ((("check_in_time" IS NULL) OR ("check_out_time" IS NULL) OR ("check_in_time" < "check_out_time"))),
    CONSTRAINT "visits_client_satisfaction_rating_check" CHECK ((("client_satisfaction_rating" >= 1) AND ("client_satisfaction_rating" <= 5))),
    CONSTRAINT "visits_coordinates_check" CHECK ((("location_coordinates" IS NULL) OR ((("location_coordinates"[0] >= ('-180'::integer)::double precision) AND ("location_coordinates"[0] <= (180)::double precision)) AND (("location_coordinates"[1] >= ('-90'::integer)::double precision) AND ("location_coordinates"[1] <= (90)::double precision))))),
    CONSTRAINT "visits_duration_check" CHECK ((("duration_minutes" IS NULL) OR ("duration_minutes" > 0))),
    CONSTRAINT "visits_metadata_check" CHECK ((("metadata" IS NULL) OR ("jsonb_typeof"("metadata") = 'object'::"text"))),
    CONSTRAINT "visits_next_visit_date_check" CHECK ((("next_visit_date" IS NULL) OR ("next_visit_date" > "visit_date"))),
    CONSTRAINT "visits_public_id_format_check" CHECK ((("public_id")::"text" ~ '^VIS-[0-9]{4}$'::"text")),
    CONSTRAINT "visits_time_order_check" CHECK ((("visit_time_start" IS NULL) OR ("visit_time_end" IS NULL) OR ("visit_time_start" < "visit_time_end")))
);


ALTER TABLE "public"."visits" OWNER TO "postgres";


COMMENT ON TABLE "public"."visits" IS 'Registro de cada visita del asesor al cliente';



COMMENT ON COLUMN "public"."visits"."advisor_id" IS 'asesor que realiza la visita';



COMMENT ON COLUMN "public"."visits"."client_id" IS 'cliente visitado';



COMMENT ON COLUMN "public"."visits"."visit_date" IS 'fecha programada/real de la visita';



COMMENT ON COLUMN "public"."visits"."visit_time_start" IS 'Horario planificado/programado de la visita';



COMMENT ON COLUMN "public"."visits"."visit_time_end" IS 'Horario planificado/programado de la visita';



COMMENT ON COLUMN "public"."visits"."location_coordinates" IS 'coordenadas GPS del check-in';



COMMENT ON COLUMN "public"."visits"."check_in_time" IS 'momento del check-in';



COMMENT ON COLUMN "public"."visits"."check_out_time" IS 'momento del check-out';



COMMENT ON COLUMN "public"."visits"."duration_minutes" IS 'duración calculada de la visita';



COMMENT ON COLUMN "public"."visits"."visit_objective" IS 'objetivo específico de esta visita';



COMMENT ON COLUMN "public"."visits"."visit_notes" IS 'notas generales de la visita';



COMMENT ON COLUMN "public"."visits"."next_visit_date" IS 'fecha sugerida para próxima visita';



COMMENT ON COLUMN "public"."visits"."advisor_notes" IS 'observaciones privadas del asesor';



COMMENT ON COLUMN "public"."visits"."supervisor_notes" IS 'notas del supervisor si revisa la visita';



COMMENT ON COLUMN "public"."visits"."weather_conditions" IS 'condiciones climáticas durante la visita';



COMMENT ON COLUMN "public"."visits"."visit_attachments" IS 'array de URLs de archivos adjuntos';



COMMENT ON COLUMN "public"."visits"."metadata" IS 'datos adicionales específicos';



CREATE OR REPLACE VIEW "public"."active_visit_assessments" AS
 SELECT "va"."id",
    "va"."public_id",
    "va"."tenant_id",
    "va"."visit_id",
    "va"."product_id",
    "va"."product_variant_id",
    "va"."assessment_type",
    "va"."is_present",
    "va"."stock_level",
    "va"."stock_quantity",
    "va"."current_price",
    "va"."suggested_price",
    "va"."price_variance_percent",
    "va"."package_condition",
    "va"."expiration_date",
    "va"."shelf_position",
    "va"."shelf_space_cm",
    "va"."facing_count",
    "va"."competitor_present",
    "va"."competitor_products",
    "va"."competitor_prices",
    "va"."display_quality",
    "va"."promotional_materials",
    "va"."assessment_notes",
    "va"."photo_evidence_urls",
    "va"."requires_action",
    "va"."recommended_actions",
    "va"."assessment_score",
    "va"."created_at",
    "va"."updated_at",
    "va"."deleted_at",
    "v"."visit_date",
    "v"."visit_status",
    "v"."workflow_status" AS "visit_workflow_status",
    "up"."first_name" AS "advisor_first_name",
    "up"."last_name" AS "advisor_last_name",
    "c"."business_name" AS "client_business_name",
    "p"."name" AS "product_name",
    "p"."code" AS "product_code",
    "pv"."variant_name",
    "pv"."variant_code",
    "b"."name" AS "brand_name",
    "t"."name" AS "tenant_name",
        CASE
            WHEN (("va"."suggested_price" IS NOT NULL) AND ("va"."suggested_price" > (0)::numeric) AND ("va"."current_price" IS NOT NULL)) THEN ((("va"."current_price" - "va"."suggested_price") / "va"."suggested_price") * (100)::numeric)
            ELSE "va"."price_variance_percent"
        END AS "calculated_price_variance",
        CASE
            WHEN ("va"."is_present" = false) THEN 'out_of_stock'::"text"
            WHEN ("va"."requires_action" = true) THEN 'action_required'::"text"
            WHEN ("va"."assessment_score" >= 8.0) THEN 'excellent'::"text"
            WHEN ("va"."assessment_score" >= 6.0) THEN 'good'::"text"
            WHEN ("va"."assessment_score" >= 4.0) THEN 'needs_improvement'::"text"
            WHEN ("va"."assessment_score" < 4.0) THEN 'poor'::"text"
            ELSE 'not_scored'::"text"
        END AS "assessment_status",
        CASE
            WHEN ("va"."competitor_present" = true) THEN "jsonb_array_length"(COALESCE("va"."competitor_products", '[]'::"jsonb"))
            ELSE 0
        END AS "competitor_count"
   FROM ((((((("public"."visit_assessments" "va"
     JOIN "public"."visits" "v" ON (("va"."visit_id" = "v"."id")))
     JOIN "public"."user_profiles" "up" ON (("v"."advisor_id" = "up"."id")))
     JOIN "public"."clients" "c" ON (("v"."client_id" = "c"."id")))
     JOIN "public"."products" "p" ON (("va"."product_id" = "p"."id")))
     JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     JOIN "public"."tenants" "t" ON (("va"."tenant_id" = "t"."id")))
     LEFT JOIN "public"."product_variants" "pv" ON (("va"."product_variant_id" = "pv"."id")))
  WHERE (("va"."deleted_at" IS NULL) AND ("v"."deleted_at" IS NULL) AND ("up"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  ORDER BY "va"."created_at" DESC;


ALTER VIEW "public"."active_visit_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visit_communication_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_visit_communication_plan_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "visit_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "material_type" "public"."communication_material_type_enum" NOT NULL,
    "material_name" character varying(255) NOT NULL,
    "material_description" "text",
    "current_status" "public"."communication_current_status_enum" NOT NULL,
    "planned_action" "public"."communication_planned_action_enum" NOT NULL,
    "installation_location" character varying(255),
    "material_size" character varying(100),
    "quantity_current" integer DEFAULT 0,
    "quantity_planned" integer DEFAULT 0,
    "installation_date_planned" "date",
    "installation_date_actual" "date",
    "installed_by" "uuid",
    "material_cost" numeric(8,2),
    "installation_cost" numeric(8,2),
    "campaign_id" "uuid",
    "campaign_duration" "jsonb",
    "target_audience" character varying(255),
    "key_message" "text",
    "client_approval" "public"."client_approval_enum" DEFAULT 'not_required'::"public"."client_approval_enum",
    "client_approval_notes" "text",
    "material_condition_notes" "text",
    "effectiveness_rating" integer,
    "photo_before_urls" "jsonb",
    "photo_after_urls" "jsonb",
    "implementation_notes" "text",
    "follow_up_required" boolean DEFAULT false,
    "follow_up_date" "date",
    "follow_up_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "visit_communication_plans_campaign_duration_check" CHECK ((("campaign_duration" IS NULL) OR ("jsonb_typeof"("campaign_duration") = 'object'::"text"))),
    CONSTRAINT "visit_communication_plans_effectiveness_rating_check" CHECK ((("effectiveness_rating" >= 1) AND ("effectiveness_rating" <= 5))),
    CONSTRAINT "visit_communication_plans_follow_up_date_check" CHECK ((("follow_up_date" IS NULL) OR ("follow_up_date" > "created_at"))),
    CONSTRAINT "visit_communication_plans_installation_cost_check" CHECK ((("installation_cost" IS NULL) OR ("installation_cost" >= (0)::numeric))),
    CONSTRAINT "visit_communication_plans_installation_dates_check" CHECK ((("installation_date_planned" IS NULL) OR ("installation_date_actual" IS NULL) OR ("installation_date_actual" >= "installation_date_planned"))),
    CONSTRAINT "visit_communication_plans_material_cost_check" CHECK ((("material_cost" IS NULL) OR ("material_cost" >= (0)::numeric))),
    CONSTRAINT "visit_communication_plans_photo_after_urls_check" CHECK ((("photo_after_urls" IS NULL) OR ("jsonb_typeof"("photo_after_urls") = 'array'::"text"))),
    CONSTRAINT "visit_communication_plans_photo_before_urls_check" CHECK ((("photo_before_urls" IS NULL) OR ("jsonb_typeof"("photo_before_urls") = 'array'::"text"))),
    CONSTRAINT "visit_communication_plans_public_id_format_check" CHECK ((("public_id")::"text" ~ '^VCP-[0-9]{4}$'::"text")),
    CONSTRAINT "visit_communication_plans_quantity_current_check" CHECK (("quantity_current" >= 0)),
    CONSTRAINT "visit_communication_plans_quantity_planned_check" CHECK (("quantity_planned" >= 0))
);


ALTER TABLE "public"."visit_communication_plans" OWNER TO "postgres";


COMMENT ON TABLE "public"."visit_communication_plans" IS 'Planes de comunicación e implementación';



COMMENT ON COLUMN "public"."visit_communication_plans"."brand_id" IS 'marca para la cual se planifica';



COMMENT ON COLUMN "public"."visit_communication_plans"."material_name" IS 'nombre específico del material';



COMMENT ON COLUMN "public"."visit_communication_plans"."material_description" IS 'descripción detallada del material';



COMMENT ON COLUMN "public"."visit_communication_plans"."installation_location" IS 'ubicación específica: "entrada principal", "caja registradora"';



COMMENT ON COLUMN "public"."visit_communication_plans"."material_size" IS 'dimensiones del material: "60x90cm", "A4"';



COMMENT ON COLUMN "public"."visit_communication_plans"."quantity_current" IS 'cantidad actual instalada';



COMMENT ON COLUMN "public"."visit_communication_plans"."quantity_planned" IS 'cantidad planificada a instalar';



COMMENT ON COLUMN "public"."visit_communication_plans"."installation_date_planned" IS 'fecha planificada para instalación';



COMMENT ON COLUMN "public"."visit_communication_plans"."installation_date_actual" IS 'fecha real de instalación';



COMMENT ON COLUMN "public"."visit_communication_plans"."installed_by" IS 'quién instaló el material';



COMMENT ON COLUMN "public"."visit_communication_plans"."material_cost" IS 'costo del material';



COMMENT ON COLUMN "public"."visit_communication_plans"."installation_cost" IS 'costo de instalación';



COMMENT ON COLUMN "public"."visit_communication_plans"."campaign_id" IS 'campaña asociada al material';



COMMENT ON COLUMN "public"."visit_communication_plans"."campaign_duration" IS 'duración de la campaña/material';



COMMENT ON COLUMN "public"."visit_communication_plans"."target_audience" IS 'audiencia objetivo del material';



COMMENT ON COLUMN "public"."visit_communication_plans"."key_message" IS 'mensaje clave del material';



COMMENT ON COLUMN "public"."visit_communication_plans"."client_approval_notes" IS 'comentarios del cliente sobre la aprobación';



COMMENT ON COLUMN "public"."visit_communication_plans"."material_condition_notes" IS 'observaciones sobre el estado actual';



COMMENT ON COLUMN "public"."visit_communication_plans"."photo_before_urls" IS 'fotos antes de la implementación';



COMMENT ON COLUMN "public"."visit_communication_plans"."photo_after_urls" IS 'fotos después de la implementación';



COMMENT ON COLUMN "public"."visit_communication_plans"."implementation_notes" IS 'notas sobre la implementación';



COMMENT ON COLUMN "public"."visit_communication_plans"."follow_up_date" IS 'fecha para seguimiento';



COMMENT ON COLUMN "public"."visit_communication_plans"."follow_up_reason" IS 'razón del seguimiento';



CREATE OR REPLACE VIEW "public"."active_visit_communication_plans" AS
 SELECT "vcp"."id",
    "vcp"."public_id",
    "vcp"."tenant_id",
    "vcp"."visit_id",
    "vcp"."brand_id",
    "vcp"."material_type",
    "vcp"."material_name",
    "vcp"."material_description",
    "vcp"."current_status",
    "vcp"."planned_action",
    "vcp"."installation_location",
    "vcp"."material_size",
    "vcp"."quantity_current",
    "vcp"."quantity_planned",
    "vcp"."installation_date_planned",
    "vcp"."installation_date_actual",
    "vcp"."installed_by",
    "vcp"."material_cost",
    "vcp"."installation_cost",
    "vcp"."campaign_id",
    "vcp"."campaign_duration",
    "vcp"."target_audience",
    "vcp"."key_message",
    "vcp"."client_approval",
    "vcp"."client_approval_notes",
    "vcp"."material_condition_notes",
    "vcp"."effectiveness_rating",
    "vcp"."photo_before_urls",
    "vcp"."photo_after_urls",
    "vcp"."implementation_notes",
    "vcp"."follow_up_required",
    "vcp"."follow_up_date",
    "vcp"."follow_up_reason",
    "vcp"."created_at",
    "vcp"."updated_at",
    "vcp"."deleted_at",
    "v"."visit_date",
    "v"."visit_status",
    "v"."workflow_status" AS "visit_workflow_status",
    "up_advisor"."first_name" AS "visit_advisor_first_name",
    "up_advisor"."last_name" AS "visit_advisor_last_name",
    "up_installer"."first_name" AS "installed_by_first_name",
    "up_installer"."last_name" AS "installed_by_last_name",
    "c"."business_name" AS "client_business_name",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "t"."name" AS "tenant_name",
        CASE
            WHEN ("vcp"."installation_date_actual" IS NOT NULL) THEN 'installed'::"text"
            WHEN ("vcp"."client_approval" = 'rejected'::"public"."client_approval_enum") THEN 'rejected'::"text"
            WHEN ("vcp"."client_approval" = 'pending'::"public"."client_approval_enum") THEN 'pending_approval'::"text"
            WHEN (("vcp"."installation_date_planned" IS NOT NULL) AND ("vcp"."installation_date_planned" < CURRENT_DATE)) THEN 'overdue'::"text"
            WHEN ("vcp"."planned_action" = 'no_action'::"public"."communication_planned_action_enum") THEN 'no_action_planned'::"text"
            ELSE 'planned'::"text"
        END AS "plan_status",
        CASE
            WHEN (("vcp"."campaign_duration" IS NOT NULL) AND ("vcp"."campaign_duration" ? 'end_date'::"text")) THEN (("vcp"."campaign_duration" ->> 'end_date'::"text"))::"date"
            ELSE NULL::"date"
        END AS "campaign_end_date",
        CASE
            WHEN ("vcp"."follow_up_date" IS NOT NULL) THEN ("vcp"."follow_up_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_follow_up",
    (COALESCE("vcp"."material_cost", (0)::numeric) + COALESCE("vcp"."installation_cost", (0)::numeric)) AS "total_cost",
        CASE
            WHEN ("vcp"."photo_before_urls" IS NOT NULL) THEN "jsonb_array_length"("vcp"."photo_before_urls")
            ELSE 0
        END AS "photo_before_count",
        CASE
            WHEN ("vcp"."photo_after_urls" IS NOT NULL) THEN "jsonb_array_length"("vcp"."photo_after_urls")
            ELSE 0
        END AS "photo_after_count",
        CASE
            WHEN (("vcp"."effectiveness_rating" IS NOT NULL) AND ("vcp"."effectiveness_rating" >= 4)) THEN 'high_effectiveness'::"text"
            WHEN (("vcp"."effectiveness_rating" IS NOT NULL) AND ("vcp"."effectiveness_rating" >= 3)) THEN 'medium_effectiveness'::"text"
            WHEN ("vcp"."effectiveness_rating" IS NOT NULL) THEN 'low_effectiveness'::"text"
            ELSE 'not_rated'::"text"
        END AS "effectiveness_category"
   FROM (((((("public"."visit_communication_plans" "vcp"
     JOIN "public"."visits" "v" ON (("vcp"."visit_id" = "v"."id")))
     JOIN "public"."user_profiles" "up_advisor" ON (("v"."advisor_id" = "up_advisor"."id")))
     LEFT JOIN "public"."user_profiles" "up_installer" ON (("vcp"."installed_by" = "up_installer"."id")))
     JOIN "public"."clients" "c" ON (("v"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("vcp"."brand_id" = "b"."id")))
     JOIN "public"."tenants" "t" ON (("vcp"."tenant_id" = "t"."id")))
  WHERE (("vcp"."deleted_at" IS NULL) AND ("v"."deleted_at" IS NULL) AND ("up_advisor"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  ORDER BY "vcp"."created_at" DESC;


ALTER VIEW "public"."active_visit_communication_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visit_inventories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_visit_inventory_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "visit_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_variant_id" "uuid",
    "current_stock" integer NOT NULL,
    "unit_type" "public"."product_unit_type_enum" NOT NULL,
    "location_in_store" "public"."location_in_store_enum" DEFAULT 'shelf'::"public"."location_in_store_enum",
    "expiration_dates" "jsonb",
    "batch_numbers" "jsonb",
    "condition_notes" "text",
    "restock_needed" boolean DEFAULT false,
    "restock_quantity" integer,
    "restock_priority" "public"."restock_priority_enum",
    "last_delivery_date" "date",
    "next_delivery_expected" "date",
    "rotation_quality" "public"."rotation_quality_enum",
    "storage_conditions" "jsonb",
    "photo_evidence_urls" "jsonb",
    "notes" "text",
    "counted_by" "uuid" NOT NULL,
    "verified_by" "uuid",
    "count_accuracy" "public"."count_accuracy_enum" DEFAULT 'exact'::"public"."count_accuracy_enum",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "visit_inventories_batch_numbers_check" CHECK ((("batch_numbers" IS NULL) OR ("jsonb_typeof"("batch_numbers") = 'array'::"text"))),
    CONSTRAINT "visit_inventories_current_stock_check" CHECK (("current_stock" >= 0)),
    CONSTRAINT "visit_inventories_delivery_dates_check" CHECK ((("last_delivery_date" IS NULL) OR ("next_delivery_expected" IS NULL) OR ("last_delivery_date" < "next_delivery_expected"))),
    CONSTRAINT "visit_inventories_expiration_dates_check" CHECK ((("expiration_dates" IS NULL) OR ("jsonb_typeof"("expiration_dates") = 'array'::"text"))),
    CONSTRAINT "visit_inventories_photo_evidence_urls_check" CHECK ((("photo_evidence_urls" IS NULL) OR ("jsonb_typeof"("photo_evidence_urls") = 'array'::"text"))),
    CONSTRAINT "visit_inventories_public_id_format_check" CHECK ((("public_id")::"text" ~ '^VIN-[0-9]{4}$'::"text")),
    CONSTRAINT "visit_inventories_restock_quantity_check" CHECK ((("restock_quantity" IS NULL) OR ("restock_quantity" > 0))),
    CONSTRAINT "visit_inventories_storage_conditions_check" CHECK ((("storage_conditions" IS NULL) OR ("jsonb_typeof"("storage_conditions") = 'object'::"text")))
);


ALTER TABLE "public"."visit_inventories" OWNER TO "postgres";


COMMENT ON TABLE "public"."visit_inventories" IS 'Inventario opcional durante la visita';



COMMENT ON COLUMN "public"."visit_inventories"."product_variant_id" IS 'variante específica inventariada';



COMMENT ON COLUMN "public"."visit_inventories"."current_stock" IS 'cantidad actual en punto de venta';



COMMENT ON COLUMN "public"."visit_inventories"."expiration_dates" IS 'array de fechas de caducidad encontradas';



COMMENT ON COLUMN "public"."visit_inventories"."batch_numbers" IS 'array de números de lote encontrados';



COMMENT ON COLUMN "public"."visit_inventories"."condition_notes" IS 'observaciones sobre el estado del inventario';



COMMENT ON COLUMN "public"."visit_inventories"."restock_quantity" IS 'cantidad sugerida para reposición';



COMMENT ON COLUMN "public"."visit_inventories"."last_delivery_date" IS 'última fecha de entrega según el cliente';



COMMENT ON COLUMN "public"."visit_inventories"."next_delivery_expected" IS 'próxima entrega esperada';



COMMENT ON COLUMN "public"."visit_inventories"."storage_conditions" IS 'condiciones de almacenamiento observadas';



COMMENT ON COLUMN "public"."visit_inventories"."photo_evidence_urls" IS 'array de URLs de fotos del inventario';



COMMENT ON COLUMN "public"."visit_inventories"."notes" IS 'notas adicionales del inventario';



COMMENT ON COLUMN "public"."visit_inventories"."counted_by" IS 'quién hizo el conteo';



COMMENT ON COLUMN "public"."visit_inventories"."verified_by" IS 'quién verificó el conteo';



CREATE OR REPLACE VIEW "public"."active_visit_inventories" AS
 SELECT "vi"."id",
    "vi"."public_id",
    "vi"."tenant_id",
    "vi"."visit_id",
    "vi"."product_id",
    "vi"."product_variant_id",
    "vi"."current_stock",
    "vi"."unit_type",
    "vi"."location_in_store",
    "vi"."expiration_dates",
    "vi"."batch_numbers",
    "vi"."condition_notes",
    "vi"."restock_needed",
    "vi"."restock_quantity",
    "vi"."restock_priority",
    "vi"."last_delivery_date",
    "vi"."next_delivery_expected",
    "vi"."rotation_quality",
    "vi"."storage_conditions",
    "vi"."photo_evidence_urls",
    "vi"."notes",
    "vi"."counted_by",
    "vi"."verified_by",
    "vi"."count_accuracy",
    "vi"."created_at",
    "vi"."updated_at",
    "vi"."deleted_at",
    "v"."visit_date",
    "v"."visit_status",
    "v"."workflow_status" AS "visit_workflow_status",
    "up_counter"."first_name" AS "counted_by_first_name",
    "up_counter"."last_name" AS "counted_by_last_name",
    "up_verifier"."first_name" AS "verified_by_first_name",
    "up_verifier"."last_name" AS "verified_by_last_name",
    "c"."business_name" AS "client_business_name",
    "p"."name" AS "product_name",
    "p"."code" AS "product_code",
    "p"."minimum_stock" AS "product_minimum_stock",
    "p"."maximum_stock" AS "product_maximum_stock",
    "pv"."variant_name",
    "pv"."variant_code",
    "b"."name" AS "brand_name",
    "t"."name" AS "tenant_name",
        CASE
            WHEN (("p"."minimum_stock" IS NOT NULL) AND ("vi"."current_stock" < "p"."minimum_stock")) THEN 'below_minimum'::"text"
            WHEN (("p"."maximum_stock" IS NOT NULL) AND ("vi"."current_stock" > "p"."maximum_stock")) THEN 'above_maximum'::"text"
            ELSE 'normal'::"text"
        END AS "stock_status_vs_product_limits",
        CASE
            WHEN (("vi"."restock_needed" = true) AND ("vi"."restock_priority" = 'urgent'::"public"."restock_priority_enum")) THEN 'urgent_restock'::"text"
            WHEN (("vi"."restock_needed" = true) AND ("vi"."restock_priority" = 'high'::"public"."restock_priority_enum")) THEN 'high_priority_restock'::"text"
            WHEN ("vi"."restock_needed" = true) THEN 'restock_needed'::"text"
            WHEN ("vi"."current_stock" = 0) THEN 'out_of_stock'::"text"
            ELSE 'adequate'::"text"
        END AS "restock_status",
        CASE
            WHEN ("vi"."verified_by" IS NOT NULL) THEN 'verified'::"text"
            WHEN ("vi"."count_accuracy" = 'exact'::"public"."count_accuracy_enum") THEN 'exact_unverified'::"text"
            WHEN ("vi"."count_accuracy" = 'estimated'::"public"."count_accuracy_enum") THEN 'estimated'::"text"
            ELSE 'partial'::"text"
        END AS "count_verification_status",
        CASE
            WHEN (("vi"."expiration_dates" IS NOT NULL) AND ("jsonb_array_length"("vi"."expiration_dates") > 0)) THEN ( SELECT "min"((("exp_item"."value" ->> 'date'::"text"))::"date") AS "min"
               FROM "jsonb_array_elements"("vi"."expiration_dates") "exp_item"("value"))
            ELSE NULL::"date"
        END AS "nearest_expiration_date"
   FROM (((((((("public"."visit_inventories" "vi"
     JOIN "public"."visits" "v" ON (("vi"."visit_id" = "v"."id")))
     JOIN "public"."user_profiles" "up_counter" ON (("vi"."counted_by" = "up_counter"."id")))
     LEFT JOIN "public"."user_profiles" "up_verifier" ON (("vi"."verified_by" = "up_verifier"."id")))
     JOIN "public"."clients" "c" ON (("v"."client_id" = "c"."id")))
     JOIN "public"."products" "p" ON (("vi"."product_id" = "p"."id")))
     JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     JOIN "public"."tenants" "t" ON (("vi"."tenant_id" = "t"."id")))
     LEFT JOIN "public"."product_variants" "pv" ON (("vi"."product_variant_id" = "pv"."id")))
  WHERE (("vi"."deleted_at" IS NULL) AND ("v"."deleted_at" IS NULL) AND ("up_counter"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  ORDER BY "vi"."created_at" DESC;


ALTER VIEW "public"."active_visit_inventories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visit_order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_visit_order_item_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "visit_order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_variant_id" "uuid",
    "line_number" integer NOT NULL,
    "quantity_ordered" integer NOT NULL,
    "quantity_available" integer,
    "quantity_confirmed" integer,
    "unit_price" numeric(10,2) NOT NULL,
    "suggested_price" numeric(10,2),
    "unit_cost" numeric(10,2),
    "line_subtotal" numeric(12,2) NOT NULL,
    "line_discount_amount" numeric(12,2) DEFAULT 0.00,
    "line_discount_percentage" numeric(5,2) DEFAULT 0.00,
    "line_total" numeric(12,2) NOT NULL,
    "tax_rate" numeric(5,4) DEFAULT 0.0000,
    "tax_amount" numeric(10,2) DEFAULT 0.00,
    "unit_type" "public"."visit_order_item_unit_type_enum" NOT NULL,
    "item_source" "public"."visit_order_item_source_enum" DEFAULT 'catalog'::"public"."visit_order_item_source_enum",
    "price_negotiated" boolean DEFAULT false,
    "original_price" numeric(10,2),
    "negotiation_reason" "text",
    "advisor_notes" "text",
    "client_notes" "text",
    "delivery_preference" "public"."visit_order_item_delivery_preference_enum" DEFAULT 'immediate'::"public"."visit_order_item_delivery_preference_enum",
    "delivery_date_requested" "date",
    "item_priority" "public"."visit_order_item_priority_enum" DEFAULT 'normal'::"public"."visit_order_item_priority_enum",
    "item_urgency_notes" "text",
    "quality_requirements" "text",
    "requires_approval" boolean DEFAULT false,
    "approved_by" "uuid",
    "approval_notes" "text",
    "promotion_manually_applied" boolean DEFAULT false,
    "promotion_suggested_by_system" boolean DEFAULT false,
    "free_item_reason" "text",
    "sample_item" boolean DEFAULT false,
    "commission_rate" numeric(5,4),
    "commission_amount" numeric(10,2),
    "cross_sell_item" boolean DEFAULT false,
    "upsell_item" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_visit_order_items_approval_consistency" CHECK ((("requires_approval" = false) OR ("approved_by" IS NOT NULL) OR ("quantity_confirmed" IS NULL) OR ("quantity_confirmed" = 0))),
    CONSTRAINT "chk_visit_order_items_confirmed_le_available" CHECK ((("quantity_available" IS NULL) OR ("quantity_confirmed" IS NULL) OR ("quantity_confirmed" <= "quantity_available"))),
    CONSTRAINT "chk_visit_order_items_discount_percentage_range" CHECK ((("line_discount_percentage" >= 0.00) AND ("line_discount_percentage" <= 100.00))),
    CONSTRAINT "chk_visit_order_items_line_discount_amount_non_negative" CHECK (("line_discount_amount" >= (0)::numeric)),
    CONSTRAINT "chk_visit_order_items_line_number_positive" CHECK (("line_number" > 0)),
    CONSTRAINT "chk_visit_order_items_line_subtotal_non_negative" CHECK (("line_subtotal" >= (0)::numeric)),
    CONSTRAINT "chk_visit_order_items_line_total_non_negative" CHECK (("line_total" >= (0)::numeric)),
    CONSTRAINT "chk_visit_order_items_original_price_positive" CHECK ((("original_price" IS NULL) OR ("original_price" > (0)::numeric))),
    CONSTRAINT "chk_visit_order_items_public_id_format" CHECK ((("public_id")::"text" ~ '^VOI-[0-9]{4,}$'::"text")),
    CONSTRAINT "chk_visit_order_items_quantity_available_non_negative" CHECK ((("quantity_available" IS NULL) OR ("quantity_available" >= 0))),
    CONSTRAINT "chk_visit_order_items_quantity_confirmed_non_negative" CHECK ((("quantity_confirmed" IS NULL) OR ("quantity_confirmed" >= 0))),
    CONSTRAINT "chk_visit_order_items_quantity_ordered_positive" CHECK (("quantity_ordered" > 0)),
    CONSTRAINT "chk_visit_order_items_suggested_price_positive" CHECK ((("suggested_price" IS NULL) OR ("suggested_price" > (0)::numeric))),
    CONSTRAINT "chk_visit_order_items_tax_rate_non_negative" CHECK (("tax_rate" >= (0)::numeric)),
    CONSTRAINT "chk_visit_order_items_unit_price_positive" CHECK (("unit_price" >= (0)::numeric))
);

ALTER TABLE ONLY "public"."visit_order_items" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."visit_order_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."visit_order_items" IS 'Items de pedidos generados durante visitas de asesores en campo';



COMMENT ON COLUMN "public"."visit_order_items"."id" IS 'Identificador único interno (UUID)';



COMMENT ON COLUMN "public"."visit_order_items"."public_id" IS 'Identificador público legible (VOI-XXXX)';



COMMENT ON COLUMN "public"."visit_order_items"."tenant_id" IS 'Referencia al tenant (multi-tenant isolation)';



COMMENT ON COLUMN "public"."visit_order_items"."visit_order_id" IS 'Referencia al pedido de visita padre';



COMMENT ON COLUMN "public"."visit_order_items"."product_id" IS 'Referencia al producto';



COMMENT ON COLUMN "public"."visit_order_items"."product_variant_id" IS 'Referencia a la variante específica del producto';



COMMENT ON COLUMN "public"."visit_order_items"."line_number" IS 'Número de línea secuencial dentro del pedido';



COMMENT ON COLUMN "public"."visit_order_items"."quantity_ordered" IS 'Cantidad solicitada por el cliente';



COMMENT ON COLUMN "public"."visit_order_items"."quantity_available" IS 'Cantidad disponible según inventario del asesor';



COMMENT ON COLUMN "public"."visit_order_items"."quantity_confirmed" IS 'Cantidad final confirmada para entrega';



COMMENT ON COLUMN "public"."visit_order_items"."unit_price" IS 'Precio unitario negociado en campo';



COMMENT ON COLUMN "public"."visit_order_items"."suggested_price" IS 'Precio sugerido por la marca';



COMMENT ON COLUMN "public"."visit_order_items"."unit_cost" IS 'Costo unitario para cálculos de margen';



COMMENT ON COLUMN "public"."visit_order_items"."line_subtotal" IS 'Subtotal de la línea antes de descuentos';



COMMENT ON COLUMN "public"."visit_order_items"."line_discount_amount" IS 'Monto de descuento aplicado manualmente';



COMMENT ON COLUMN "public"."visit_order_items"."line_discount_percentage" IS 'Porcentaje de descuento aplicado';



COMMENT ON COLUMN "public"."visit_order_items"."line_total" IS 'Total final de la línea después de descuentos e impuestos';



COMMENT ON COLUMN "public"."visit_order_items"."tax_rate" IS 'Tasa de impuesto aplicable';



COMMENT ON COLUMN "public"."visit_order_items"."tax_amount" IS 'Monto de impuesto calculado';



COMMENT ON COLUMN "public"."visit_order_items"."unit_type" IS 'Tipo de unidad de medida';



COMMENT ON COLUMN "public"."visit_order_items"."item_source" IS 'Origen del item (catálogo, especial, muestra, demo)';



COMMENT ON COLUMN "public"."visit_order_items"."price_negotiated" IS 'Indica si el precio fue negociado en campo';



COMMENT ON COLUMN "public"."visit_order_items"."original_price" IS 'Precio original antes de negociación';



COMMENT ON COLUMN "public"."visit_order_items"."negotiation_reason" IS 'Razón documentada de la negociación de precio';



COMMENT ON COLUMN "public"."visit_order_items"."advisor_notes" IS 'Observaciones del asesor sobre este item';



COMMENT ON COLUMN "public"."visit_order_items"."client_notes" IS 'Observaciones del cliente sobre este item';



COMMENT ON COLUMN "public"."visit_order_items"."delivery_preference" IS 'Preferencia de entrega del item';



COMMENT ON COLUMN "public"."visit_order_items"."delivery_date_requested" IS 'Fecha específica solicitada para entrega';



COMMENT ON COLUMN "public"."visit_order_items"."item_priority" IS 'Nivel de prioridad del item';



COMMENT ON COLUMN "public"."visit_order_items"."item_urgency_notes" IS 'Notas sobre urgencia de entrega';



COMMENT ON COLUMN "public"."visit_order_items"."quality_requirements" IS 'Requisitos específicos de calidad solicitados';



COMMENT ON COLUMN "public"."visit_order_items"."requires_approval" IS 'Indica si requiere aprobación del supervisor';



COMMENT ON COLUMN "public"."visit_order_items"."approved_by" IS 'Supervisor que aprobó el item';



COMMENT ON COLUMN "public"."visit_order_items"."approval_notes" IS 'Notas de aprobación o rechazo';



COMMENT ON COLUMN "public"."visit_order_items"."promotion_manually_applied" IS 'Indica si el asesor aplicó promoción manualmente';



COMMENT ON COLUMN "public"."visit_order_items"."promotion_suggested_by_system" IS 'Indica si el sistema sugirió una promoción';



COMMENT ON COLUMN "public"."visit_order_items"."free_item_reason" IS 'Razón del item gratuito (muestra, promoción, cortesía)';



COMMENT ON COLUMN "public"."visit_order_items"."sample_item" IS 'Indica si es un item de muestra gratuita';



COMMENT ON COLUMN "public"."visit_order_items"."commission_rate" IS 'Tasa de comisión específica para este item';



COMMENT ON COLUMN "public"."visit_order_items"."commission_amount" IS 'Monto de comisión calculada para el asesor';



COMMENT ON COLUMN "public"."visit_order_items"."cross_sell_item" IS 'Indica si fue agregado como venta cruzada';



COMMENT ON COLUMN "public"."visit_order_items"."upsell_item" IS 'Indica si fue agregado como venta adicional';



COMMENT ON COLUMN "public"."visit_order_items"."metadata" IS 'Datos adicionales en formato JSON flexible';



COMMENT ON COLUMN "public"."visit_order_items"."created_at" IS 'Fecha y hora de creación del registro';



COMMENT ON COLUMN "public"."visit_order_items"."updated_at" IS 'Fecha y hora de última actualización';



COMMENT ON COLUMN "public"."visit_order_items"."deleted_at" IS 'Fecha y hora de eliminación lógica (soft delete)';



CREATE TABLE IF NOT EXISTS "public"."visit_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying(20) DEFAULT "public"."generate_visit_order_public_id"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "visit_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "advisor_id" "uuid" NOT NULL,
    "order_number" character varying(100),
    "order_type" "public"."visit_order_type_enum" DEFAULT 'immediate'::"public"."visit_order_type_enum",
    "order_status" "public"."visit_order_status_enum" DEFAULT 'draft'::"public"."visit_order_status_enum",
    "order_date" "date" NOT NULL,
    "delivery_date" "date",
    "delivery_address" "text",
    "payment_method" "public"."visit_order_payment_method_enum" DEFAULT 'cash'::"public"."visit_order_payment_method_enum",
    "payment_terms" character varying(100),
    "subtotal" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "discount_amount" numeric(12,2) DEFAULT 0.00,
    "tax_amount" numeric(12,2) DEFAULT 0.00,
    "total_amount" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "currency" character varying(3) DEFAULT 'MXN'::character varying,
    "exchange_rate" numeric(10,4) DEFAULT 1.0000,
    "requires_approval" boolean DEFAULT false,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "invoice_required" boolean DEFAULT false,
    "client_invoice_data_id" "uuid",
    "delivery_instructions" "text",
    "order_notes" "text",
    "external_order_id" character varying(100),
    "commission_rate" numeric(5,4),
    "commission_amount" numeric(10,2),
    "order_attachments" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "visit_orders_commission_rate_check" CHECK ((("commission_rate" IS NULL) OR (("commission_rate" >= 0.0000) AND ("commission_rate" <= 1.0000)))),
    CONSTRAINT "visit_orders_delivery_date_check" CHECK ((("delivery_date" IS NULL) OR ("delivery_date" >= "order_date"))),
    CONSTRAINT "visit_orders_discount_amount_check" CHECK (("discount_amount" >= (0)::numeric)),
    CONSTRAINT "visit_orders_exchange_rate_check" CHECK (("exchange_rate" > (0)::numeric)),
    CONSTRAINT "visit_orders_order_attachments_check" CHECK ((("order_attachments" IS NULL) OR ("jsonb_typeof"("order_attachments") = 'array'::"text"))),
    CONSTRAINT "visit_orders_public_id_format_check" CHECK ((("public_id")::"text" ~ '^VOR-[0-9]{4}$'::"text")),
    CONSTRAINT "visit_orders_subtotal_check" CHECK (("subtotal" >= (0)::numeric)),
    CONSTRAINT "visit_orders_tax_amount_check" CHECK (("tax_amount" >= (0)::numeric)),
    CONSTRAINT "visit_orders_total_amount_check" CHECK (("total_amount" >= (0)::numeric)),
    CONSTRAINT "visit_orders_total_calculation_check" CHECK (("total_amount" = (("subtotal" - "discount_amount") + "tax_amount")))
);


ALTER TABLE "public"."visit_orders" OWNER TO "postgres";


COMMENT ON TABLE "public"."visit_orders" IS 'Compras realizadas durante la visita';



COMMENT ON COLUMN "public"."visit_orders"."client_id" IS 'cliente que realiza la compra';



COMMENT ON COLUMN "public"."visit_orders"."advisor_id" IS 'asesor que registra la compra';



COMMENT ON COLUMN "public"."visit_orders"."order_number" IS 'número de orden del sistema externo si aplica';



COMMENT ON COLUMN "public"."visit_orders"."order_date" IS 'fecha de la compra/pedido';



COMMENT ON COLUMN "public"."visit_orders"."delivery_date" IS 'fecha programada de entrega';



COMMENT ON COLUMN "public"."visit_orders"."delivery_address" IS 'dirección de entrega si es diferente al cliente';



COMMENT ON COLUMN "public"."visit_orders"."payment_terms" IS 'términos específicos de pago';



COMMENT ON COLUMN "public"."visit_orders"."subtotal" IS 'subtotal antes de promociones';



COMMENT ON COLUMN "public"."visit_orders"."discount_amount" IS 'descuentos aplicados';



COMMENT ON COLUMN "public"."visit_orders"."requires_approval" IS 'si requiere aprobación del supervisor';



COMMENT ON COLUMN "public"."visit_orders"."approved_by" IS 'supervisor que aprobó';



COMMENT ON COLUMN "public"."visit_orders"."approved_at" IS 'momento de aprobación';



COMMENT ON COLUMN "public"."visit_orders"."client_invoice_data_id" IS 'datos de facturación seleccionados';



COMMENT ON COLUMN "public"."visit_orders"."delivery_instructions" IS 'instrucciones específicas de entrega';



COMMENT ON COLUMN "public"."visit_orders"."order_notes" IS 'notas del pedido';



COMMENT ON COLUMN "public"."visit_orders"."external_order_id" IS 'ID en sistema externo como ERP';



COMMENT ON COLUMN "public"."visit_orders"."commission_rate" IS 'tasa de comisión aplicable';



COMMENT ON COLUMN "public"."visit_orders"."commission_amount" IS 'comisión calculada para el asesor';



COMMENT ON COLUMN "public"."visit_orders"."order_attachments" IS 'evidencias como tickets, fotos';



CREATE OR REPLACE VIEW "public"."active_visit_order_items" AS
 SELECT "voi"."id",
    "voi"."public_id",
    "voi"."tenant_id",
    "voi"."visit_order_id",
    "voi"."product_id",
    "voi"."product_variant_id",
    "voi"."line_number",
    "voi"."quantity_ordered",
    "voi"."quantity_available",
    "voi"."quantity_confirmed",
    "voi"."unit_price",
    "voi"."suggested_price",
    "voi"."unit_cost",
    "voi"."line_subtotal",
    "voi"."line_discount_amount",
    "voi"."line_discount_percentage",
    "voi"."line_total",
    "voi"."tax_rate",
    "voi"."tax_amount",
    "voi"."unit_type",
    "voi"."item_source",
    "voi"."price_negotiated",
    "voi"."original_price",
    "voi"."negotiation_reason",
    "voi"."advisor_notes",
    "voi"."client_notes",
    "voi"."delivery_preference",
    "voi"."delivery_date_requested",
    "voi"."item_priority",
    "voi"."item_urgency_notes",
    "voi"."quality_requirements",
    "voi"."requires_approval",
    "voi"."approved_by",
    "voi"."approval_notes",
    "voi"."promotion_manually_applied",
    "voi"."promotion_suggested_by_system",
    "voi"."free_item_reason",
    "voi"."sample_item",
    "voi"."commission_rate",
    "voi"."commission_amount",
    "voi"."cross_sell_item",
    "voi"."upsell_item",
    "voi"."metadata",
    "voi"."created_at",
    "voi"."updated_at",
    "voi"."deleted_at",
    "vo"."order_number" AS "visit_order_number",
    "vo"."order_status" AS "parent_order_status",
    "vo"."client_id",
    "vo"."advisor_id",
    "v"."public_id" AS "visit_public_id",
    "p"."name" AS "product_name",
    "p"."code" AS "product_code",
    "pv"."variant_name",
    "pv"."variant_code"
   FROM (((("public"."visit_order_items" "voi"
     JOIN "public"."visit_orders" "vo" ON (("vo"."id" = "voi"."visit_order_id")))
     JOIN "public"."visits" "v" ON (("v"."id" = "vo"."visit_id")))
     JOIN "public"."products" "p" ON (("p"."id" = "voi"."product_id")))
     LEFT JOIN "public"."product_variants" "pv" ON (("pv"."id" = "voi"."product_variant_id")))
  WHERE (("voi"."deleted_at" IS NULL) AND ("vo"."deleted_at" IS NULL) AND ("v"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL) AND (("pv"."deleted_at" IS NULL) OR ("pv"."id" IS NULL)));


ALTER VIEW "public"."active_visit_order_items" OWNER TO "postgres";


COMMENT ON VIEW "public"."active_visit_order_items" IS 'Vista de items de pedido de visita activos con información de producto y visita';



CREATE OR REPLACE VIEW "public"."active_visit_orders" AS
 SELECT "vo"."id",
    "vo"."public_id",
    "vo"."tenant_id",
    "vo"."visit_id",
    "vo"."client_id",
    "vo"."advisor_id",
    "vo"."order_number",
    "vo"."order_type",
    "vo"."order_status",
    "vo"."order_date",
    "vo"."delivery_date",
    "vo"."delivery_address",
    "vo"."payment_method",
    "vo"."payment_terms",
    "vo"."subtotal",
    "vo"."discount_amount",
    "vo"."tax_amount",
    "vo"."total_amount",
    "vo"."currency",
    "vo"."exchange_rate",
    "vo"."requires_approval",
    "vo"."approved_by",
    "vo"."approved_at",
    "vo"."invoice_required",
    "vo"."client_invoice_data_id",
    "vo"."delivery_instructions",
    "vo"."order_notes",
    "vo"."external_order_id",
    "vo"."commission_rate",
    "vo"."commission_amount",
    "vo"."order_attachments",
    "vo"."created_at",
    "vo"."updated_at",
    "vo"."deleted_at",
    "v"."visit_date",
    "v"."visit_status",
    "v"."workflow_status" AS "visit_workflow_status",
    "up_advisor"."first_name" AS "advisor_first_name",
    "up_advisor"."last_name" AS "advisor_last_name",
    "up_approver"."first_name" AS "approved_by_first_name",
    "up_approver"."last_name" AS "approved_by_last_name",
    "c"."business_name" AS "client_business_name",
    "c"."owner_name" AS "client_owner_name",
    "cid"."business_name" AS "invoice_business_name",
    "cid"."rfc" AS "invoice_rfc",
    "t"."name" AS "tenant_name",
        CASE
            WHEN ("vo"."order_status" = 'delivered'::"public"."visit_order_status_enum") THEN 'completed'::"text"
            WHEN ("vo"."order_status" = 'cancelled'::"public"."visit_order_status_enum") THEN 'cancelled'::"text"
            WHEN (("vo"."requires_approval" = true) AND ("vo"."approved_by" IS NULL)) THEN 'pending_approval'::"text"
            WHEN (("vo"."delivery_date" IS NOT NULL) AND ("vo"."delivery_date" < CURRENT_DATE) AND ("vo"."order_status" = ANY (ARRAY['confirmed'::"public"."visit_order_status_enum", 'processed'::"public"."visit_order_status_enum"]))) THEN 'overdue'::"text"
            ELSE ("vo"."order_status")::"text"
        END AS "order_display_status",
        CASE
            WHEN ("vo"."delivery_date" IS NOT NULL) THEN ("vo"."delivery_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_delivery",
        CASE
            WHEN (("vo"."commission_rate" IS NOT NULL) AND ("vo"."subtotal" > (0)::numeric)) THEN ("vo"."subtotal" * "vo"."commission_rate")
            ELSE "vo"."commission_amount"
        END AS "calculated_commission",
        CASE
            WHEN ("vo"."order_attachments" IS NOT NULL) THEN "jsonb_array_length"("vo"."order_attachments")
            ELSE 0
        END AS "attachment_count",
        CASE
            WHEN ((("vo"."currency")::"text" <> 'MXN'::"text") AND ("vo"."exchange_rate" <> 1.0000)) THEN ("vo"."total_amount" * "vo"."exchange_rate")
            ELSE "vo"."total_amount"
        END AS "total_amount_mxn"
   FROM (((((("public"."visit_orders" "vo"
     JOIN "public"."visits" "v" ON (("vo"."visit_id" = "v"."id")))
     JOIN "public"."user_profiles" "up_advisor" ON (("vo"."advisor_id" = "up_advisor"."id")))
     LEFT JOIN "public"."user_profiles" "up_approver" ON (("vo"."approved_by" = "up_approver"."id")))
     JOIN "public"."clients" "c" ON (("vo"."client_id" = "c"."id")))
     LEFT JOIN "public"."client_invoice_data" "cid" ON (("vo"."client_invoice_data_id" = "cid"."id")))
     JOIN "public"."tenants" "t" ON (("vo"."tenant_id" = "t"."id")))
  WHERE (("vo"."deleted_at" IS NULL) AND ("v"."deleted_at" IS NULL) AND ("up_advisor"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  ORDER BY "vo"."created_at" DESC;


ALTER VIEW "public"."active_visit_orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_visits" AS
 SELECT "v"."id",
    "v"."public_id",
    "v"."tenant_id",
    "v"."advisor_id",
    "v"."client_id",
    "v"."visit_date",
    "v"."visit_time_start",
    "v"."visit_time_end",
    "v"."visit_type",
    "v"."visit_status",
    "v"."workflow_status",
    "v"."location_coordinates",
    "v"."check_in_time",
    "v"."check_out_time",
    "v"."duration_minutes",
    "v"."visit_objective",
    "v"."visit_notes",
    "v"."next_visit_date",
    "v"."client_satisfaction_rating",
    "v"."advisor_notes",
    "v"."supervisor_notes",
    "v"."requires_follow_up",
    "v"."follow_up_reason",
    "v"."weather_conditions",
    "v"."visit_attachments",
    "v"."metadata",
    "v"."created_at",
    "v"."updated_at",
    "v"."deleted_at",
    "t"."name" AS "tenant_name",
    "up"."first_name" AS "advisor_first_name",
    "up"."last_name" AS "advisor_last_name",
    "up"."email" AS "advisor_email",
    "c"."business_name" AS "client_business_name",
    "c"."owner_name" AS "client_owner_name",
    "z"."name" AS "client_zone_name",
    "m"."name" AS "client_market_name",
    "sup"."first_name" AS "supervisor_first_name",
    "sup"."last_name" AS "supervisor_last_name",
        CASE
            WHEN (("v"."check_in_time" IS NOT NULL) AND ("v"."check_out_time" IS NULL)) THEN (EXTRACT(epoch FROM ("now"() - "v"."check_in_time")) / (60)::numeric)
            ELSE ("v"."duration_minutes")::numeric
        END AS "effective_duration_minutes",
        CASE
            WHEN (("v"."visit_status" = 'completed'::"public"."visit_status_enum") AND ("v"."workflow_status" = 'completed'::"public"."visit_workflow_status_enum")) THEN 'fully_completed'::"text"
            WHEN (("v"."visit_status" = 'completed'::"public"."visit_status_enum") AND ("v"."workflow_status" <> 'completed'::"public"."visit_workflow_status_enum")) THEN 'visit_completed_workflow_pending'::"text"
            WHEN ("v"."visit_status" = 'in_progress'::"public"."visit_status_enum") THEN 'in_progress'::"text"
            WHEN (("v"."visit_date" < CURRENT_DATE) AND ("v"."visit_status" = 'planned'::"public"."visit_status_enum")) THEN 'overdue'::"text"
            ELSE ("v"."visit_status")::"text"
        END AS "overall_status",
    (CURRENT_DATE - "v"."visit_date") AS "days_since_visit",
        CASE
            WHEN ("v"."next_visit_date" IS NOT NULL) THEN ("v"."next_visit_date" - CURRENT_DATE)
            ELSE NULL::integer
        END AS "days_until_next_visit"
   FROM (((((("public"."visits" "v"
     JOIN "public"."tenants" "t" ON (("v"."tenant_id" = "t"."id")))
     JOIN "public"."user_profiles" "up" ON (("v"."advisor_id" = "up"."id")))
     JOIN "public"."clients" "c" ON (("v"."client_id" = "c"."id")))
     JOIN "public"."zones" "z" ON (("c"."zone_id" = "z"."id")))
     JOIN "public"."markets" "m" ON (("c"."market_id" = "m"."id")))
     LEFT JOIN "public"."user_profiles" "sup" ON (("up"."manager_id" = "sup"."id")))
  WHERE (("v"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL) AND ("up"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))
  ORDER BY "v"."visit_date" DESC, "v"."created_at" DESC;


ALTER VIEW "public"."active_visits" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_zones" AS
 WITH RECURSIVE "zone_hierarchy" AS (
         SELECT "z"."id",
            "z"."public_id",
            "z"."tenant_id",
            "z"."name",
            "z"."code",
            "z"."description",
            "z"."country",
            "z"."state",
            "z"."cities",
            "z"."postal_codes",
            "z"."coordinates",
            "z"."parent_zone_id",
            "z"."zone_type",
            "z"."is_active",
            "z"."sort_order",
            "z"."created_at",
            "z"."updated_at",
            "z"."deleted_at",
            ("z"."name")::"text" AS "full_path",
            0 AS "level"
           FROM "public"."zones" "z"
          WHERE (("z"."parent_zone_id" IS NULL) AND ("z"."deleted_at" IS NULL) AND ("z"."is_active" = true))
        UNION ALL
         SELECT "z"."id",
            "z"."public_id",
            "z"."tenant_id",
            "z"."name",
            "z"."code",
            "z"."description",
            "z"."country",
            "z"."state",
            "z"."cities",
            "z"."postal_codes",
            "z"."coordinates",
            "z"."parent_zone_id",
            "z"."zone_type",
            "z"."is_active",
            "z"."sort_order",
            "z"."created_at",
            "z"."updated_at",
            "z"."deleted_at",
            (("zh_1"."full_path" || ' > '::"text") || ("z"."name")::"text") AS "full_path",
            ("zh_1"."level" + 1) AS "level"
           FROM ("public"."zones" "z"
             JOIN "zone_hierarchy" "zh_1" ON (("z"."parent_zone_id" = "zh_1"."id")))
          WHERE (("z"."deleted_at" IS NULL) AND ("z"."is_active" = true))
        )
 SELECT "zh"."id",
    "zh"."public_id",
    "zh"."tenant_id",
    "zh"."name",
    "zh"."code",
    "zh"."description",
    "zh"."country",
    "zh"."state",
    "zh"."cities",
    "zh"."postal_codes",
    "zh"."coordinates",
    "zh"."parent_zone_id",
    "zh"."zone_type",
    "zh"."is_active",
    "zh"."sort_order",
    "zh"."created_at",
    "zh"."updated_at",
    "zh"."deleted_at",
    "zh"."full_path",
    "zh"."level",
    "t"."name" AS "tenant_name"
   FROM ("zone_hierarchy" "zh"
     JOIN "public"."tenants" "t" ON (("zh"."tenant_id" = "t"."id")))
  WHERE ("t"."deleted_at" IS NULL)
  ORDER BY "zh"."tenant_id", "zh"."level", "zh"."sort_order", "zh"."name";


ALTER VIEW "public"."active_zones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."advisor_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying DEFAULT "public"."generate_advisor_assignment_public_id"() NOT NULL,
    "user_profile_id" "uuid" NOT NULL,
    "zone_id" "uuid",
    "specialization" "public"."advisor_specialization_enum" DEFAULT 'general'::"public"."advisor_specialization_enum" NOT NULL,
    "experience_level" "public"."advisor_experience_level_enum" DEFAULT 'junior'::"public"."advisor_experience_level_enum" NOT NULL,
    "monthly_quota" integer DEFAULT 0,
    "performance_rating" numeric(3,1),
    "is_active" boolean DEFAULT true,
    "assigned_by" "uuid",
    "assigned_date" "date" DEFAULT CURRENT_DATE,
    "tenant_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "advisor_assignments_performance_rating_check" CHECK ((("performance_rating" >= (0)::numeric) AND ("performance_rating" <= (100)::numeric))),
    CONSTRAINT "valid_rating" CHECK ((("performance_rating" IS NULL) OR (("performance_rating" >= (0)::numeric) AND ("performance_rating" <= (100)::numeric))))
);


ALTER TABLE "public"."advisor_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."advisor_assignments" IS 'Advisor-specific information: assigned zone, specialization and metrics';



CREATE TABLE IF NOT EXISTS "public"."advisor_client_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_id" character varying DEFAULT "public"."generate_advisor_client_assignment_public_id"() NOT NULL,
    "advisor_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "assignment_type" character varying DEFAULT 'primary'::character varying,
    "assigned_by" "uuid",
    "assigned_date" "date" DEFAULT CURRENT_DATE,
    "is_active" boolean DEFAULT true,
    "priority" integer DEFAULT 1,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "advisor_client_assignments_assignment_type_check" CHECK ((("assignment_type")::"text" = ANY ((ARRAY['primary'::character varying, 'support'::character varying, 'temporary'::character varying])::"text"[]))),
    CONSTRAINT "advisor_client_assignments_priority_check" CHECK ((("priority" >= 1) AND ("priority" <= 5)))
);


ALTER TABLE "public"."advisor_client_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."advisor_client_assignments" IS 'Assignment of specific clients to advisors';



CREATE OR REPLACE VIEW "public"."brand_membership_stats" AS
 SELECT "b"."tenant_id",
    "b"."id" AS "brand_id",
    "b"."name" AS "brand_name",
    "b"."public_id" AS "brand_public_id",
    "t"."name" AS "tenant_name",
    "count"("cbm"."id") AS "total_memberships",
    "count"("cbm"."id") FILTER (WHERE ("cbm"."membership_status" = 'active'::"public"."membership_status_enum")) AS "active_memberships",
    "count"("cbm"."id") FILTER (WHERE ("cbm"."membership_status" = 'pending'::"public"."membership_status_enum")) AS "pending_memberships",
    "count"("cbm"."id") FILTER (WHERE ("cbm"."membership_status" = 'suspended'::"public"."membership_status_enum")) AS "suspended_memberships",
    "count"("cbm"."id") FILTER (WHERE ("cbm"."membership_status" = 'inactive'::"public"."membership_status_enum")) AS "inactive_memberships",
    "count"("cbm"."id") FILTER (WHERE ("cbm"."membership_status" = 'rejected'::"public"."membership_status_enum")) AS "rejected_memberships",
    "count"("cbm"."id") FILTER (WHERE ("cbm"."is_primary_brand" = true)) AS "primary_brand_memberships",
    ("avg"("cbm"."lifetime_points"))::numeric(12,2) AS "avg_lifetime_points",
    ("avg"("cbm"."points_balance"))::numeric(10,2) AS "avg_points_balance",
    ("sum"("cbm"."lifetime_points"))::numeric(15,2) AS "total_lifetime_points",
    ("sum"("cbm"."points_balance"))::numeric(15,2) AS "total_points_balance",
    "min"("cbm"."joined_date") AS "first_membership_date",
    "max"("cbm"."joined_date") AS "last_membership_date",
    "max"("cbm"."last_purchase_date") AS "last_purchase_recorded"
   FROM (("public"."brands" "b"
     JOIN "public"."tenants" "t" ON (("b"."tenant_id" = "t"."id")))
     LEFT JOIN "public"."client_brand_memberships" "cbm" ON ((("b"."id" = "cbm"."brand_id") AND ("cbm"."deleted_at" IS NULL))))
  WHERE (("b"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  GROUP BY "b"."tenant_id", "b"."id", "b"."name", "b"."public_id", "t"."name"
  ORDER BY "b"."tenant_id", "b"."name";


ALTER VIEW "public"."brand_membership_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."brand_product_stats" AS
 SELECT "b"."tenant_id",
    "b"."id" AS "brand_id",
    "b"."name" AS "brand_name",
    "b"."public_id" AS "brand_public_id",
    "count"("p"."id") AS "total_products",
    "count"("p"."id") FILTER (WHERE ("p"."is_active" = true)) AS "active_products",
    "count"("p"."id") FILTER (WHERE ("p"."is_featured" = true)) AS "featured_products",
    "count"("p"."id") FILTER (WHERE (("p"."discontinue_date" IS NOT NULL) AND ("p"."discontinue_date" <= CURRENT_DATE))) AS "discontinued_products",
    "count"("p"."id") FILTER (WHERE (("p"."launch_date" IS NOT NULL) AND ("p"."launch_date" > CURRENT_DATE))) AS "upcoming_products",
    "count"("p"."id") FILTER (WHERE ("p"."requires_refrigeration" = true)) AS "refrigerated_products",
    "count"(DISTINCT "p"."category_id") AS "categories_used",
    ("avg"("p"."base_price"))::numeric(10,2) AS "avg_base_price",
    "min"("p"."base_price") AS "min_base_price",
    "max"("p"."base_price") AS "max_base_price",
    ("avg"("public"."calculate_current_margin"("p"."cost", "p"."base_price")))::numeric(5,4) AS "avg_current_margin",
    ("avg"("p"."margin_target"))::numeric(5,4) AS "avg_target_margin",
    "count"("p"."id") FILTER (WHERE ("p"."cost" IS NOT NULL)) AS "products_with_cost_data",
    "count"("p"."id") FILTER (WHERE ("p"."barcode" IS NOT NULL)) AS "products_with_barcode"
   FROM ("public"."brands" "b"
     LEFT JOIN "public"."products" "p" ON ((("b"."id" = "p"."brand_id") AND ("p"."deleted_at" IS NULL))))
  WHERE ("b"."deleted_at" IS NULL)
  GROUP BY "b"."tenant_id", "b"."id", "b"."name", "b"."public_id"
  ORDER BY "b"."tenant_id", "b"."name";


ALTER VIEW "public"."brand_product_stats" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."brand_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."brand_public_id_seq" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."brand_tier_member_distribution" AS
 SELECT "b"."id" AS "brand_id",
    "b"."name" AS "brand_name",
    "t"."id" AS "tier_id",
    "t"."name" AS "tier_name",
    "t"."tier_level",
    "count"("cbm"."id") FILTER (WHERE (("cbm"."deleted_at" IS NULL) AND ("cbm"."membership_status" = 'active'::"public"."membership_status_enum"))) AS "active_members",
    "count"("cbm"."id") FILTER (WHERE ("cbm"."deleted_at" IS NULL)) AS "total_members"
   FROM (("public"."brands" "b"
     LEFT JOIN "public"."tiers" "t" ON ((("b"."id" = "t"."brand_id") AND ("t"."deleted_at" IS NULL))))
     LEFT JOIN "public"."client_brand_memberships" "cbm" ON (("t"."id" = "cbm"."current_tier_id")))
  WHERE ("b"."deleted_at" IS NULL)
  GROUP BY "b"."id", "b"."name", "t"."id", "t"."name", "t"."tier_level"
 HAVING ("count"("t"."id") > 0)
  ORDER BY "b"."name", "t"."tier_level";


ALTER VIEW "public"."brand_tier_member_distribution" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."brand_tier_stats" AS
 SELECT "b"."id" AS "brand_id",
    "b"."name" AS "brand_name",
    "tn"."name" AS "tenant_name",
    "count"("t"."id") AS "total_tiers",
    "count"("t"."id") FILTER (WHERE ("t"."is_active" = true)) AS "active_tiers",
    "count"("t"."id") FILTER (WHERE ("t"."auto_assignment_enabled" = true)) AS "auto_assignment_tiers",
    "min"("t"."min_points_required") AS "lowest_tier_points",
    "max"("t"."min_points_required") AS "highest_tier_points",
    ("avg"("t"."points_multiplier"))::numeric(5,2) AS "avg_points_multiplier",
    ("avg"("t"."discount_percentage"))::numeric(5,2) AS "avg_discount_percentage",
    "count"("cbm"."id") FILTER (WHERE (("cbm"."deleted_at" IS NULL) AND ("cbm"."membership_status" = 'active'::"public"."membership_status_enum"))) AS "total_active_members"
   FROM ((("public"."brands" "b"
     JOIN "public"."tenants" "tn" ON (("b"."tenant_id" = "tn"."id")))
     LEFT JOIN "public"."tiers" "t" ON ((("b"."id" = "t"."brand_id") AND ("t"."deleted_at" IS NULL))))
     LEFT JOIN "public"."client_brand_memberships" "cbm" ON (("t"."id" = "cbm"."current_tier_id")))
  WHERE (("b"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  GROUP BY "b"."id", "b"."name", "tn"."name"
  ORDER BY "b"."name";


ALTER VIEW "public"."brand_tier_stats" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."campaign_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."campaign_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."client_brand_membership_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."client_brand_membership_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."client_invoice_data_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."client_invoice_data_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."client_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."client_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."client_tier_assignment_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."client_tier_assignment_public_id_seq" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."client_type_kpi_analysis" AS
SELECT
    NULL::"uuid" AS "tenant_id",
    NULL::"uuid" AS "client_type_id",
    NULL::character varying(20) AS "client_type_public_id",
    NULL::character varying(255) AS "client_type_name",
    NULL::character varying(50) AS "client_type_code",
    NULL::"public"."client_type_category_enum" AS "category",
    NULL::boolean AS "requires_assessment",
    NULL::boolean AS "requires_inventory",
    NULL::character varying(255) AS "tenant_name",
    NULL::"jsonb" AS "kpi_targets",
    NULL::numeric AS "target_monthly_visits",
    NULL::numeric AS "target_conversion_rate",
    NULL::numeric AS "target_satisfaction_score",
    NULL::numeric AS "target_assessment_compliance",
    NULL::numeric AS "target_inventory_accuracy",
    NULL::numeric AS "target_average_order_value",
    NULL::bigint AS "total_clients",
    NULL::bigint AS "active_clients",
    NULL::bigint AS "prospect_clients",
    NULL::bigint AS "suspended_clients",
    NULL::bigint AS "inactive_clients",
    NULL::numeric(5,2) AS "avg_effective_visit_frequency",
    NULL::numeric(5,2) AS "avg_effective_assessment_frequency",
    NULL::numeric(12,2) AS "avg_credit_limit",
    NULL::bigint AS "zones_covered",
    NULL::bigint AS "markets_covered",
    NULL::bigint AS "commercial_structures_used",
    NULL::"date" AS "first_client_registered",
    NULL::"date" AS "last_client_registered",
    NULL::"date" AS "last_visit_recorded",
    NULL::numeric AS "actual_monthly_visits",
    NULL::numeric AS "actual_conversion_rate",
    NULL::numeric AS "actual_satisfaction_score",
    NULL::numeric AS "actual_assessment_compliance",
    NULL::numeric AS "actual_inventory_accuracy",
    NULL::numeric AS "actual_average_order_value",
    NULL::numeric AS "monthly_visits_gap",
    NULL::numeric AS "conversion_rate_gap";


ALTER VIEW "public"."client_type_kpi_analysis" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."client_type_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."client_type_public_id_seq" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."client_type_tenant_summary" AS
 SELECT "t"."id" AS "tenant_id",
    "t"."name" AS "tenant_name",
    "t"."public_id" AS "tenant_public_id",
    "count"("ct"."id") AS "total_client_types",
    "count"("ct"."id") FILTER (WHERE ("ct"."is_active" = true)) AS "active_client_types",
    "sum"("client_counts"."total_clients") AS "total_clients_across_types",
    "sum"("client_counts"."active_clients") AS "active_clients_across_types",
    ("avg"("ct"."default_visit_frequency_days"))::numeric(5,2) AS "avg_default_visit_frequency",
    ("avg"("ct"."assessment_frequency_days"))::numeric(5,2) AS "avg_assessment_frequency",
    "count"("ct"."id") FILTER (WHERE ("ct"."category" = 'retail'::"public"."client_type_category_enum")) AS "retail_types",
    "count"("ct"."id") FILTER (WHERE ("ct"."category" = 'wholesale'::"public"."client_type_category_enum")) AS "wholesale_types",
    "count"("ct"."id") FILTER (WHERE ("ct"."category" = 'institutional'::"public"."client_type_category_enum")) AS "institutional_types",
    "count"("ct"."id") FILTER (WHERE ("ct"."category" = 'online'::"public"."client_type_category_enum")) AS "online_types",
    "count"("ct"."id") FILTER (WHERE ("ct"."category" = 'hybrid'::"public"."client_type_category_enum")) AS "hybrid_types",
    "count"("ct"."id") FILTER (WHERE ("ct"."requires_assessment" = true)) AS "types_requiring_assessment",
    "count"("ct"."id") FILTER (WHERE ("ct"."requires_inventory" = true)) AS "types_requiring_inventory"
   FROM (("public"."tenants" "t"
     LEFT JOIN "public"."client_types" "ct" ON ((("t"."id" = "ct"."tenant_id") AND ("ct"."deleted_at" IS NULL))))
     LEFT JOIN ( SELECT "clients"."client_type_id",
            "count"(*) AS "total_clients",
            "count"(*) FILTER (WHERE ("clients"."status" = 'active'::"public"."client_status_enum")) AS "active_clients"
           FROM "public"."clients"
          WHERE ("clients"."deleted_at" IS NULL)
          GROUP BY "clients"."client_type_id") "client_counts" ON (("ct"."id" = "client_counts"."client_type_id")))
  WHERE ("t"."deleted_at" IS NULL)
  GROUP BY "t"."id", "t"."name", "t"."public_id"
  ORDER BY "t"."name";


ALTER VIEW "public"."client_type_tenant_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."clients_with_inherited_values" AS
 SELECT "c"."id",
    "c"."public_id",
    "c"."tenant_id",
    "c"."user_id",
    "c"."business_name",
    "c"."legal_name",
    "c"."owner_name",
    "c"."email",
    "c"."phone",
    "c"."whatsapp",
    "c"."tax_id",
    "c"."zone_id",
    "c"."market_id",
    "c"."client_type_id",
    "c"."commercial_structure_id",
    "c"."address_street",
    "c"."address_neighborhood",
    "c"."address_city",
    "c"."address_state",
    "c"."address_postal_code",
    "c"."address_country",
    "c"."coordinates",
    "c"."visit_frequency_days",
    "c"."assessment_frequency_days",
    "c"."payment_terms",
    "c"."minimum_order",
    "c"."credit_limit",
    "c"."status",
    "c"."registration_date",
    "c"."last_visit_date",
    "c"."notes",
    "c"."metadata",
    "c"."created_at",
    "c"."updated_at",
    "c"."deleted_at",
    "t"."name" AS "tenant_name",
    "z"."name" AS "zone_name",
    "z"."code" AS "zone_code",
    "m"."name" AS "market_name",
    "m"."code" AS "market_code",
    "ct"."name" AS "client_type_name",
    "ct"."code" AS "client_type_code",
    "cs"."name" AS "commercial_structure_name",
    "cs"."code" AS "commercial_structure_code",
    COALESCE("c"."visit_frequency_days", "ct"."default_visit_frequency_days") AS "effective_visit_frequency_days",
    COALESCE("c"."assessment_frequency_days", "ct"."assessment_frequency_days") AS "effective_assessment_frequency_days",
    COALESCE("c"."payment_terms", "cs"."payment_terms") AS "effective_payment_terms",
    COALESCE("c"."minimum_order", "cs"."minimum_order") AS "effective_minimum_order",
    ("c"."visit_frequency_days" IS NULL) AS "inherits_visit_frequency",
    ("c"."assessment_frequency_days" IS NULL) AS "inherits_assessment_frequency",
    ("c"."payment_terms" IS NULL) AS "inherits_payment_terms",
    ("c"."minimum_order" IS NULL) AS "inherits_minimum_order"
   FROM ((((("public"."clients" "c"
     JOIN "public"."tenants" "t" ON (("c"."tenant_id" = "t"."id")))
     JOIN "public"."zones" "z" ON (("c"."zone_id" = "z"."id")))
     JOIN "public"."markets" "m" ON (("c"."market_id" = "m"."id")))
     JOIN "public"."client_types" "ct" ON (("c"."client_type_id" = "ct"."id")))
     JOIN "public"."commercial_structures" "cs" ON (("c"."commercial_structure_id" = "cs"."id")))
  WHERE (("c"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL) AND ("z"."deleted_at" IS NULL) AND ("m"."deleted_at" IS NULL) AND ("ct"."deleted_at" IS NULL) AND ("cs"."deleted_at" IS NULL))
  ORDER BY "c"."tenant_id", "c"."business_name";


ALTER VIEW "public"."clients_with_inherited_values" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."commercial_structure_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."commercial_structure_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."market_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."market_public_id_seq" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."market_stats" AS
 SELECT "m"."tenant_id",
    "m"."id" AS "market_id",
    "m"."public_id" AS "market_public_id",
    "m"."name" AS "market_name",
    "m"."code" AS "market_code",
    "m"."target_volume_min",
    "m"."target_volume_max",
    "m"."characteristics",
    "t"."name" AS "tenant_name",
    "count"("c"."id") AS "total_clients",
    "count"("c"."id") FILTER (WHERE ("c"."status" = 'active'::"public"."client_status_enum")) AS "active_clients",
    "count"("c"."id") FILTER (WHERE ("c"."status" = 'prospect'::"public"."client_status_enum")) AS "prospect_clients",
    "count"("c"."id") FILTER (WHERE ("c"."status" = 'suspended'::"public"."client_status_enum")) AS "suspended_clients",
    "count"("c"."id") FILTER (WHERE ("c"."status" = 'inactive'::"public"."client_status_enum")) AS "inactive_clients",
    "count"(DISTINCT "c"."zone_id") AS "zones_covered",
    "count"(DISTINCT "c"."client_type_id") AS "client_types_present",
    "count"(DISTINCT "c"."commercial_structure_id") AS "commercial_structures_used",
    ("avg"("c"."credit_limit"))::numeric(12,2) AS "avg_credit_limit",
    ("avg"(COALESCE(("c"."visit_frequency_days")::numeric, "ct_avg"."avg_visit_freq")))::numeric(5,2) AS "avg_effective_visit_frequency",
    ("avg"(COALESCE(("c"."assessment_frequency_days")::numeric, "ct_avg"."avg_assess_freq")))::numeric(5,2) AS "avg_effective_assessment_frequency",
        CASE
            WHEN (("m"."target_volume_min" IS NOT NULL) AND ("m"."target_volume_max" IS NOT NULL)) THEN ("m"."target_volume_max" - "m"."target_volume_min")
            ELSE NULL::numeric
        END AS "target_volume_range",
        CASE
            WHEN (("m"."target_volume_min" IS NOT NULL) AND ("m"."target_volume_max" IS NOT NULL)) THEN (("m"."target_volume_min" + "m"."target_volume_max") / (2)::numeric)
            ELSE NULL::numeric
        END AS "target_volume_midpoint",
    "min"("c"."registration_date") AS "first_client_registered",
    "max"("c"."registration_date") AS "last_client_registered",
    "max"("c"."last_visit_date") AS "last_visit_recorded",
    (0)::numeric AS "actual_monthly_volume",
    (0)::numeric AS "actual_average_order_value",
    0 AS "total_visits_this_month",
    0 AS "total_assessments_this_month",
    0.0 AS "visit_compliance_rate",
    0.0 AS "assessment_compliance_rate",
        CASE
            WHEN ("m"."target_volume_min" IS NOT NULL) THEN GREATEST((0)::numeric, ("m"."target_volume_min" - (0)::numeric))
            ELSE NULL::numeric
        END AS "volume_gap_to_min_target",
        CASE
            WHEN ("m"."target_volume_max" IS NOT NULL) THEN GREATEST((0)::numeric, ((0)::numeric - "m"."target_volume_max"))
            ELSE NULL::numeric
        END AS "volume_excess_over_max_target"
   FROM ((("public"."markets" "m"
     JOIN "public"."tenants" "t" ON (("m"."tenant_id" = "t"."id")))
     LEFT JOIN "public"."clients" "c" ON ((("m"."id" = "c"."market_id") AND ("c"."deleted_at" IS NULL))))
     LEFT JOIN ( SELECT "m_inner"."id" AS "market_id",
            ("avg"("ct"."default_visit_frequency_days"))::numeric(5,2) AS "avg_visit_freq",
            ("avg"("ct"."assessment_frequency_days"))::numeric(5,2) AS "avg_assess_freq"
           FROM (("public"."markets" "m_inner"
             JOIN "public"."clients" "c_inner" ON ((("m_inner"."id" = "c_inner"."market_id") AND ("c_inner"."deleted_at" IS NULL))))
             JOIN "public"."client_types" "ct" ON ((("c_inner"."client_type_id" = "ct"."id") AND ("ct"."deleted_at" IS NULL))))
          GROUP BY "m_inner"."id") "ct_avg" ON (("m"."id" = "ct_avg"."market_id")))
  WHERE (("m"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  GROUP BY "m"."tenant_id", "m"."id", "m"."public_id", "m"."name", "m"."code", "m"."target_volume_min", "m"."target_volume_max", "m"."characteristics", "m"."sort_order", "t"."name", "ct_avg"."avg_visit_freq", "ct_avg"."avg_assess_freq"
  ORDER BY "m"."tenant_id", "m"."sort_order", "m"."name";


ALTER VIEW "public"."market_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."market_tenant_summary" AS
 SELECT "t"."id" AS "tenant_id",
    "t"."name" AS "tenant_name",
    "t"."public_id" AS "tenant_public_id",
    "count"("m"."id") AS "total_markets",
    "count"("m"."id") FILTER (WHERE ("m"."is_active" = true)) AS "active_markets",
    "sum"("client_counts"."total_clients") AS "total_clients_across_markets",
    "sum"("client_counts"."active_clients") AS "active_clients_across_markets",
    ("avg"("m"."target_volume_min"))::numeric(12,2) AS "avg_target_volume_min",
    ("avg"("m"."target_volume_max"))::numeric(12,2) AS "avg_target_volume_max",
    "min"("m"."target_volume_min") AS "min_target_volume_across_markets",
    "max"("m"."target_volume_max") AS "max_target_volume_across_markets",
    "count"(DISTINCT "client_geo"."zone_id") AS "total_zones_covered",
    "count"(DISTINCT "client_geo"."client_type_id") AS "total_client_types_present"
   FROM ((("public"."tenants" "t"
     LEFT JOIN "public"."markets" "m" ON ((("t"."id" = "m"."tenant_id") AND ("m"."deleted_at" IS NULL))))
     LEFT JOIN ( SELECT "clients"."market_id",
            "count"(*) AS "total_clients",
            "count"(*) FILTER (WHERE ("clients"."status" = 'active'::"public"."client_status_enum")) AS "active_clients"
           FROM "public"."clients"
          WHERE ("clients"."deleted_at" IS NULL)
          GROUP BY "clients"."market_id") "client_counts" ON (("m"."id" = "client_counts"."market_id")))
     LEFT JOIN ( SELECT "c"."market_id",
            "c"."zone_id",
            "c"."client_type_id"
           FROM "public"."clients" "c"
          WHERE ("c"."deleted_at" IS NULL)
          GROUP BY "c"."market_id", "c"."zone_id", "c"."client_type_id") "client_geo" ON (("m"."id" = "client_geo"."market_id")))
  WHERE ("t"."deleted_at" IS NULL)
  GROUP BY "t"."id", "t"."name", "t"."public_id"
  ORDER BY "t"."name";


ALTER VIEW "public"."market_tenant_summary" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_item_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_item_public_id_seq" OWNER TO "postgres";


COMMENT ON SEQUENCE "public"."order_item_public_id_seq" IS 'Secuencia para generar public_id de order_items (ORI-XXXX)';



CREATE SEQUENCE IF NOT EXISTS "public"."order_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."point_transaction_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."point_transaction_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."points_transaction_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."points_transaction_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."product_category_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."product_category_public_id_seq" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."product_category_stats" AS
 SELECT "t"."id" AS "tenant_id",
    "t"."name" AS "tenant_name",
    "b"."id" AS "brand_id",
    "b"."name" AS "brand_name",
    "count"("pc"."id") AS "total_categories",
    "count"("pc"."id") FILTER (WHERE ("pc"."is_active" = true)) AS "active_categories",
    "count"("pc"."id") FILTER (WHERE ("pc"."category_level" = 1)) AS "root_categories",
    "count"("pc"."id") FILTER (WHERE ("pc"."category_level" = 2)) AS "level_2_categories",
    "count"("pc"."id") FILTER (WHERE ("pc"."category_level" = 3)) AS "level_3_categories",
    "count"("pc"."id") FILTER (WHERE ("pc"."category_level" = 4)) AS "level_4_categories",
    "count"("pc"."id") FILTER (WHERE ("pc"."category_level" = 5)) AS "level_5_categories",
    "max"("pc"."category_level") AS "max_level_depth",
    "count"("pc"."id") FILTER (WHERE ("pc"."brand_id" IS NULL)) AS "global_categories",
    "count"("pc"."id") FILTER (WHERE ("pc"."brand_id" IS NOT NULL)) AS "brand_specific_categories"
   FROM (("public"."tenants" "t"
     LEFT JOIN "public"."brands" "b" ON ((("t"."id" = "b"."tenant_id") AND ("b"."deleted_at" IS NULL))))
     LEFT JOIN "public"."product_categories" "pc" ON ((((("pc"."tenant_id" = "t"."id") AND ("pc"."brand_id" = "b"."id")) OR (("pc"."tenant_id" = "t"."id") AND ("pc"."brand_id" IS NULL))) AND ("pc"."deleted_at" IS NULL))))
  WHERE ("t"."deleted_at" IS NULL)
  GROUP BY "t"."id", "t"."name", "b"."id", "b"."name"
  ORDER BY "t"."name", "b"."name" NULLS FIRST;


ALTER VIEW "public"."product_category_stats" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."product_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."product_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."product_variant_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."product_variant_public_id_seq" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."product_variant_stats" AS
 SELECT "p"."tenant_id",
    "p"."id" AS "product_id",
    "p"."name" AS "product_name",
    "p"."code" AS "product_code",
    "b"."name" AS "brand_name",
    "count"("pv"."id") AS "total_variants",
    "count"("pv"."id") FILTER (WHERE ("pv"."is_active" = true)) AS "active_variants",
    "count"("pv"."id") FILTER (WHERE ("pv"."is_default" = true)) AS "default_variants",
    "count"("pv"."id") FILTER (WHERE (("pv"."discontinue_date" IS NOT NULL) AND ("pv"."discontinue_date" <= CURRENT_DATE))) AS "discontinued_variants",
    "count"("pv"."id") FILTER (WHERE (("pv"."launch_date" IS NOT NULL) AND ("pv"."launch_date" > CURRENT_DATE))) AS "upcoming_variants",
    "count"(DISTINCT "pv"."size_unit") AS "size_units_used",
    "count"(DISTINCT "pv"."package_type") AS "package_types_used",
    "min"("pv"."price") AS "min_variant_price",
    "max"("pv"."price") AS "max_variant_price",
    ("avg"("pv"."price"))::numeric(10,2) AS "avg_variant_price",
    "min"("pv"."size_value") AS "min_size_value",
    "max"("pv"."size_value") AS "max_size_value",
    ("avg"("pv"."size_value"))::numeric(8,2) AS "avg_size_value",
    ("avg"("public"."calculate_current_margin"("pv"."cost", "pv"."price")))::numeric(5,4) AS "avg_variant_margin",
    "count"("pv"."id") FILTER (WHERE ("pv"."cost" IS NOT NULL)) AS "variants_with_cost_data",
    "count"("pv"."id") FILTER (WHERE ("pv"."barcode" IS NOT NULL)) AS "variants_with_barcode"
   FROM (("public"."products" "p"
     JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     LEFT JOIN "public"."product_variants" "pv" ON ((("p"."id" = "pv"."product_id") AND ("pv"."deleted_at" IS NULL))))
  WHERE (("p"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL))
  GROUP BY "p"."tenant_id", "p"."id", "p"."name", "p"."code", "b"."name"
  ORDER BY "p"."tenant_id", "b"."name", "p"."name";


ALTER VIEW "public"."product_variant_stats" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."promotion_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."promotion_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."promotion_redemption_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."promotion_redemption_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."promotion_rule_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."promotion_rule_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."reward_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."reward_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."reward_redemption_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."reward_redemption_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tenant_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tenant_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tier_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tier_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_profile_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_profile_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."visit_assessment_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."visit_assessment_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."visit_communication_plan_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."visit_communication_plan_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."visit_inventory_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."visit_inventory_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."visit_order_item_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."visit_order_item_public_id_seq" OWNER TO "postgres";


COMMENT ON SEQUENCE "public"."visit_order_item_public_id_seq" IS 'Secuencia para generar public_id de visit_order_items (VOI-XXXX)';



CREATE SEQUENCE IF NOT EXISTS "public"."visit_order_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."visit_order_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."visit_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."visit_public_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."zone_public_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."zone_public_id_seq" OWNER TO "postgres";


ALTER TABLE ONLY "public"."advisor_assignments"
    ADD CONSTRAINT "advisor_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."advisor_client_assignments"
    ADD CONSTRAINT "advisor_client_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."client_brand_memberships"
    ADD CONSTRAINT "client_brand_memberships_client_brand_unique" UNIQUE ("client_id", "brand_id");



ALTER TABLE ONLY "public"."client_brand_memberships"
    ADD CONSTRAINT "client_brand_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_brand_memberships"
    ADD CONSTRAINT "client_brand_memberships_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."client_invoice_data"
    ADD CONSTRAINT "client_invoice_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_invoice_data"
    ADD CONSTRAINT "client_invoice_data_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."client_tier_assignments"
    ADD CONSTRAINT "client_tier_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tier_assignments"
    ADD CONSTRAINT "client_tier_assignments_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."client_types"
    ADD CONSTRAINT "client_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_types"
    ADD CONSTRAINT "client_types_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."client_types"
    ADD CONSTRAINT "client_types_tenant_code_unique" UNIQUE ("tenant_id", "code");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."commercial_structures"
    ADD CONSTRAINT "commercial_structures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."commercial_structures"
    ADD CONSTRAINT "commercial_structures_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."commercial_structures"
    ADD CONSTRAINT "commercial_structures_tenant_code_unique" UNIQUE ("tenant_id", "code");



ALTER TABLE ONLY "public"."markets"
    ADD CONSTRAINT "markets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."markets"
    ADD CONSTRAINT "markets_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."markets"
    ADD CONSTRAINT "markets_tenant_code_unique" UNIQUE ("tenant_id", "code");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."points_transactions"
    ADD CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."points_transactions"
    ADD CONSTRAINT "points_transactions_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_tenant_brand_code_unique" UNIQUE ("tenant_id", "brand_id", "code");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_tenant_product_code_unique" UNIQUE ("tenant_id", "product_id", "variant_code");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_tenant_brand_code_unique" UNIQUE ("tenant_id", "brand_id", "code");



ALTER TABLE ONLY "public"."promotion_redemptions"
    ADD CONSTRAINT "promotion_redemptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotion_redemptions"
    ADD CONSTRAINT "promotion_redemptions_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."promotion_rules"
    ADD CONSTRAINT "promotion_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotion_rules"
    ADD CONSTRAINT "promotion_rules_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_redemption_code_key" UNIQUE ("redemption_code");



ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."tiers"
    ADD CONSTRAINT "tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tiers"
    ADD CONSTRAINT "tiers_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."tiers"
    ADD CONSTRAINT "tiers_tenant_brand_code_unique" UNIQUE ("tenant_id", "brand_id", "code");



ALTER TABLE ONLY "public"."tiers"
    ADD CONSTRAINT "tiers_tenant_brand_level_unique" UNIQUE ("tenant_id", "brand_id", "tier_level");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_employee_code_key" UNIQUE ("employee_code");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_unique_assignment" UNIQUE ("user_profile_id", "tenant_id", "brand_id", "role");



ALTER TABLE ONLY "public"."visit_assessments"
    ADD CONSTRAINT "visit_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visit_assessments"
    ADD CONSTRAINT "visit_assessments_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."visit_communication_plans"
    ADD CONSTRAINT "visit_communication_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visit_communication_plans"
    ADD CONSTRAINT "visit_communication_plans_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."visit_inventories"
    ADD CONSTRAINT "visit_inventories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visit_inventories"
    ADD CONSTRAINT "visit_inventories_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."visit_inventories"
    ADD CONSTRAINT "visit_inventories_visit_product_variant_location_unique" UNIQUE ("visit_id", "product_id", "product_variant_id", "location_in_store");



ALTER TABLE ONLY "public"."visit_order_items"
    ADD CONSTRAINT "visit_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visit_order_items"
    ADD CONSTRAINT "visit_order_items_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."visit_orders"
    ADD CONSTRAINT "visit_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visit_orders"
    ADD CONSTRAINT "visit_orders_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."zones"
    ADD CONSTRAINT "zones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."zones"
    ADD CONSTRAINT "zones_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."zones"
    ADD CONSTRAINT "zones_tenant_code_unique" UNIQUE ("tenant_id", "code");



CREATE INDEX "idx_advisor_assignments_is_active" ON "public"."advisor_assignments" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_advisor_assignments_tenant_id" ON "public"."advisor_assignments" USING "btree" ("tenant_id");



CREATE INDEX "idx_advisor_assignments_user_profile_id" ON "public"."advisor_assignments" USING "btree" ("user_profile_id");



CREATE INDEX "idx_advisor_assignments_zone_id" ON "public"."advisor_assignments" USING "btree" ("zone_id");



CREATE INDEX "idx_advisor_client_assignments_advisor_id" ON "public"."advisor_client_assignments" USING "btree" ("advisor_id");



CREATE INDEX "idx_advisor_client_assignments_brand_id" ON "public"."advisor_client_assignments" USING "btree" ("brand_id");



CREATE INDEX "idx_advisor_client_assignments_client_id" ON "public"."advisor_client_assignments" USING "btree" ("client_id");



CREATE INDEX "idx_advisor_client_assignments_is_active" ON "public"."advisor_client_assignments" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_advisor_client_assignments_tenant_id" ON "public"."advisor_client_assignments" USING "btree" ("tenant_id");



CREATE INDEX "idx_brands_deleted_at" ON "public"."brands" USING "btree" ("deleted_at");



CREATE INDEX "idx_brands_public_id" ON "public"."brands" USING "btree" ("public_id");



CREATE INDEX "idx_brands_slug" ON "public"."brands" USING "btree" ("slug");



CREATE INDEX "idx_brands_status" ON "public"."brands" USING "btree" ("status");



CREATE INDEX "idx_brands_tenant_id" ON "public"."brands" USING "btree" ("tenant_id");



CREATE INDEX "idx_campaigns_approved_by" ON "public"."campaigns" USING "btree" ("approved_by");



CREATE INDEX "idx_campaigns_brand_id" ON "public"."campaigns" USING "btree" ("brand_id");



CREATE INDEX "idx_campaigns_campaign_objectives_gin" ON "public"."campaigns" USING "gin" ("campaign_objectives");



CREATE INDEX "idx_campaigns_campaign_tags_gin" ON "public"."campaigns" USING "gin" ("campaign_tags");



CREATE INDEX "idx_campaigns_campaign_type" ON "public"."campaigns" USING "btree" ("campaign_type");



CREATE INDEX "idx_campaigns_channels_gin" ON "public"."campaigns" USING "gin" ("channels");



CREATE INDEX "idx_campaigns_created_at" ON "public"."campaigns" USING "btree" ("created_at");



CREATE INDEX "idx_campaigns_created_by" ON "public"."campaigns" USING "btree" ("created_by");



CREATE INDEX "idx_campaigns_deleted_at" ON "public"."campaigns" USING "btree" ("deleted_at");



CREATE INDEX "idx_campaigns_end_date" ON "public"."campaigns" USING "btree" ("end_date");



CREATE INDEX "idx_campaigns_geographic_scope_gin" ON "public"."campaigns" USING "gin" ("geographic_scope");



CREATE INDEX "idx_campaigns_is_template" ON "public"."campaigns" USING "btree" ("is_template");



CREATE INDEX "idx_campaigns_launch_ready" ON "public"."campaigns" USING "btree" ("launch_ready");



CREATE INDEX "idx_campaigns_performance_metrics_gin" ON "public"."campaigns" USING "gin" ("performance_metrics");



CREATE INDEX "idx_campaigns_public_id" ON "public"."campaigns" USING "btree" ("public_id");



CREATE INDEX "idx_campaigns_start_date" ON "public"."campaigns" USING "btree" ("start_date");



CREATE INDEX "idx_campaigns_status" ON "public"."campaigns" USING "btree" ("status");



CREATE INDEX "idx_campaigns_target_audience_gin" ON "public"."campaigns" USING "gin" ("target_audience");



CREATE INDEX "idx_campaigns_template_name" ON "public"."campaigns" USING "btree" ("template_name");



CREATE INDEX "idx_campaigns_tenant_id" ON "public"."campaigns" USING "btree" ("tenant_id");



CREATE INDEX "idx_client_brand_memberships_approved_by" ON "public"."client_brand_memberships" USING "btree" ("approved_by");



CREATE INDEX "idx_client_brand_memberships_brand_id" ON "public"."client_brand_memberships" USING "btree" ("brand_id");



CREATE INDEX "idx_client_brand_memberships_client_id" ON "public"."client_brand_memberships" USING "btree" ("client_id");



CREATE INDEX "idx_client_brand_memberships_communication_preferences_gin" ON "public"."client_brand_memberships" USING "gin" ("communication_preferences");



CREATE INDEX "idx_client_brand_memberships_current_tier_id" ON "public"."client_brand_memberships" USING "btree" ("current_tier_id");



CREATE INDEX "idx_client_brand_memberships_deleted_at" ON "public"."client_brand_memberships" USING "btree" ("deleted_at");



CREATE INDEX "idx_client_brand_memberships_is_primary_brand" ON "public"."client_brand_memberships" USING "btree" ("is_primary_brand");



CREATE INDEX "idx_client_brand_memberships_joined_date" ON "public"."client_brand_memberships" USING "btree" ("joined_date");



CREATE INDEX "idx_client_brand_memberships_last_purchase_date" ON "public"."client_brand_memberships" USING "btree" ("last_purchase_date");



CREATE INDEX "idx_client_brand_memberships_membership_preferences_gin" ON "public"."client_brand_memberships" USING "gin" ("membership_preferences");



CREATE INDEX "idx_client_brand_memberships_membership_status" ON "public"."client_brand_memberships" USING "btree" ("membership_status");



CREATE INDEX "idx_client_brand_memberships_public_id" ON "public"."client_brand_memberships" USING "btree" ("public_id");



CREATE INDEX "idx_client_brand_memberships_tenant_id" ON "public"."client_brand_memberships" USING "btree" ("tenant_id");



CREATE INDEX "idx_client_invoice_data_client_id" ON "public"."client_invoice_data" USING "btree" ("client_id");



CREATE INDEX "idx_client_invoice_data_deleted_at" ON "public"."client_invoice_data" USING "btree" ("deleted_at");



CREATE INDEX "idx_client_invoice_data_is_active" ON "public"."client_invoice_data" USING "btree" ("is_active");



CREATE INDEX "idx_client_invoice_data_is_preferred" ON "public"."client_invoice_data" USING "btree" ("is_preferred");



CREATE INDEX "idx_client_invoice_data_person_type" ON "public"."client_invoice_data" USING "btree" ("person_type");



CREATE INDEX "idx_client_invoice_data_public_id" ON "public"."client_invoice_data" USING "btree" ("public_id");



CREATE INDEX "idx_client_invoice_data_rfc" ON "public"."client_invoice_data" USING "btree" ("rfc");



CREATE INDEX "idx_client_invoice_data_tenant_id" ON "public"."client_invoice_data" USING "btree" ("tenant_id");



CREATE INDEX "idx_client_tier_assignments_assigned_by" ON "public"."client_tier_assignments" USING "btree" ("assigned_by");



CREATE INDEX "idx_client_tier_assignments_assigned_date" ON "public"."client_tier_assignments" USING "btree" ("assigned_date");



CREATE INDEX "idx_client_tier_assignments_assignment_type" ON "public"."client_tier_assignments" USING "btree" ("assignment_type");



CREATE INDEX "idx_client_tier_assignments_benefits_activated" ON "public"."client_tier_assignments" USING "btree" ("benefits_activated");



CREATE INDEX "idx_client_tier_assignments_client_brand_membership_id" ON "public"."client_tier_assignments" USING "btree" ("client_brand_membership_id");



CREATE INDEX "idx_client_tier_assignments_created_at" ON "public"."client_tier_assignments" USING "btree" ("created_at");



CREATE INDEX "idx_client_tier_assignments_deleted_at" ON "public"."client_tier_assignments" USING "btree" ("deleted_at");



CREATE INDEX "idx_client_tier_assignments_effective_from" ON "public"."client_tier_assignments" USING "btree" ("effective_from");



CREATE INDEX "idx_client_tier_assignments_effective_until" ON "public"."client_tier_assignments" USING "btree" ("effective_until");



CREATE INDEX "idx_client_tier_assignments_is_current" ON "public"."client_tier_assignments" USING "btree" ("is_current");



CREATE INDEX "idx_client_tier_assignments_metadata_gin" ON "public"."client_tier_assignments" USING "gin" ("metadata");



CREATE INDEX "idx_client_tier_assignments_notification_sent" ON "public"."client_tier_assignments" USING "btree" ("notification_sent");



CREATE INDEX "idx_client_tier_assignments_previous_tier_id" ON "public"."client_tier_assignments" USING "btree" ("previous_tier_id");



CREATE INDEX "idx_client_tier_assignments_public_id" ON "public"."client_tier_assignments" USING "btree" ("public_id");



CREATE INDEX "idx_client_tier_assignments_tenant_id" ON "public"."client_tier_assignments" USING "btree" ("tenant_id");



CREATE INDEX "idx_client_tier_assignments_tier_id" ON "public"."client_tier_assignments" USING "btree" ("tier_id");



CREATE INDEX "idx_client_types_category" ON "public"."client_types" USING "btree" ("category");



CREATE INDEX "idx_client_types_characteristics_gin" ON "public"."client_types" USING "gin" ("characteristics");



CREATE INDEX "idx_client_types_code" ON "public"."client_types" USING "btree" ("code");



CREATE INDEX "idx_client_types_deleted_at" ON "public"."client_types" USING "btree" ("deleted_at");



CREATE INDEX "idx_client_types_is_active" ON "public"."client_types" USING "btree" ("is_active");



CREATE INDEX "idx_client_types_kpi_targets_gin" ON "public"."client_types" USING "gin" ("kpi_targets");



CREATE INDEX "idx_client_types_public_id" ON "public"."client_types" USING "btree" ("public_id");



CREATE INDEX "idx_client_types_requires_assessment" ON "public"."client_types" USING "btree" ("requires_assessment");



CREATE INDEX "idx_client_types_requires_inventory" ON "public"."client_types" USING "btree" ("requires_inventory");



CREATE INDEX "idx_client_types_sort_order" ON "public"."client_types" USING "btree" ("tenant_id", "sort_order");



CREATE INDEX "idx_client_types_tenant_id" ON "public"."client_types" USING "btree" ("tenant_id");



CREATE INDEX "idx_clients_address_city" ON "public"."clients" USING "btree" ("address_city");



CREATE INDEX "idx_clients_address_state" ON "public"."clients" USING "btree" ("address_state");



CREATE INDEX "idx_clients_business_name" ON "public"."clients" USING "btree" ("business_name");



CREATE INDEX "idx_clients_client_type_id" ON "public"."clients" USING "btree" ("client_type_id");



CREATE INDEX "idx_clients_commercial_structure_id" ON "public"."clients" USING "btree" ("commercial_structure_id");



CREATE INDEX "idx_clients_coordinates_gist" ON "public"."clients" USING "gist" ("coordinates");



CREATE INDEX "idx_clients_deleted_at" ON "public"."clients" USING "btree" ("deleted_at");



CREATE INDEX "idx_clients_email" ON "public"."clients" USING "btree" ("email");



CREATE INDEX "idx_clients_last_visit_date" ON "public"."clients" USING "btree" ("last_visit_date");



CREATE INDEX "idx_clients_market_id" ON "public"."clients" USING "btree" ("market_id");



CREATE INDEX "idx_clients_metadata_gin" ON "public"."clients" USING "gin" ("metadata");



CREATE INDEX "idx_clients_public_id" ON "public"."clients" USING "btree" ("public_id");



CREATE INDEX "idx_clients_registration_date" ON "public"."clients" USING "btree" ("registration_date");



CREATE INDEX "idx_clients_status" ON "public"."clients" USING "btree" ("status");



CREATE INDEX "idx_clients_tenant_id" ON "public"."clients" USING "btree" ("tenant_id");



CREATE INDEX "idx_clients_user_id" ON "public"."clients" USING "btree" ("user_id");



CREATE INDEX "idx_clients_zone_id" ON "public"."clients" USING "btree" ("zone_id");



CREATE INDEX "idx_commercial_structures_code" ON "public"."commercial_structures" USING "btree" ("code");



CREATE INDEX "idx_commercial_structures_commission_structure_gin" ON "public"."commercial_structures" USING "gin" ("commission_structure");



CREATE INDEX "idx_commercial_structures_coverage_zones_gin" ON "public"."commercial_structures" USING "gin" ("coverage_zones");



CREATE INDEX "idx_commercial_structures_deleted_at" ON "public"."commercial_structures" USING "btree" ("deleted_at");



CREATE INDEX "idx_commercial_structures_is_active" ON "public"."commercial_structures" USING "btree" ("is_active");



CREATE INDEX "idx_commercial_structures_public_id" ON "public"."commercial_structures" USING "btree" ("public_id");



CREATE INDEX "idx_commercial_structures_sort_order" ON "public"."commercial_structures" USING "btree" ("tenant_id", "sort_order");



CREATE INDEX "idx_commercial_structures_structure_type" ON "public"."commercial_structures" USING "btree" ("structure_type");



CREATE INDEX "idx_commercial_structures_supported_markets_gin" ON "public"."commercial_structures" USING "gin" ("supported_markets");



CREATE INDEX "idx_commercial_structures_tenant_id" ON "public"."commercial_structures" USING "btree" ("tenant_id");



CREATE INDEX "idx_markets_characteristics_gin" ON "public"."markets" USING "gin" ("characteristics");



CREATE INDEX "idx_markets_code" ON "public"."markets" USING "btree" ("code");



CREATE INDEX "idx_markets_deleted_at" ON "public"."markets" USING "btree" ("deleted_at");



CREATE INDEX "idx_markets_is_active" ON "public"."markets" USING "btree" ("is_active");



CREATE INDEX "idx_markets_public_id" ON "public"."markets" USING "btree" ("public_id");



CREATE INDEX "idx_markets_sort_order" ON "public"."markets" USING "btree" ("tenant_id", "sort_order");



CREATE INDEX "idx_markets_tenant_id" ON "public"."markets" USING "btree" ("tenant_id");



CREATE INDEX "idx_order_items_deleted_at" ON "public"."order_items" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);



CREATE INDEX "idx_order_items_free_items" ON "public"."order_items" USING "btree" ("order_id") WHERE (("deleted_at" IS NULL) AND ("free_item" = true));



CREATE INDEX "idx_order_items_metadata" ON "public"."order_items" USING "gin" ("metadata");



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);



CREATE UNIQUE INDEX "idx_order_items_order_line_unique" ON "public"."order_items" USING "btree" ("order_id", "line_number") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_order_items_product_id" ON "public"."order_items" USING "btree" ("product_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_order_items_product_variant_id" ON "public"."order_items" USING "btree" ("product_variant_id") WHERE (("deleted_at" IS NULL) AND ("product_variant_id" IS NOT NULL));



CREATE INDEX "idx_order_items_promotions" ON "public"."order_items" USING "btree" ("order_id") WHERE (("deleted_at" IS NULL) AND ("promotion_applied" = true));



CREATE INDEX "idx_order_items_public_id" ON "public"."order_items" USING "btree" ("public_id");



CREATE INDEX "idx_order_items_returns" ON "public"."order_items" USING "btree" ("order_id") WHERE (("deleted_at" IS NULL) AND ("returned_quantity" > 0));



CREATE INDEX "idx_order_items_status" ON "public"."order_items" USING "btree" ("item_status") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_order_items_substitutions" ON "public"."order_items" USING "btree" ("substitute_product_id") WHERE (("deleted_at" IS NULL) AND ("substitute_product_id" IS NOT NULL));



CREATE INDEX "idx_order_items_tenant_id" ON "public"."order_items" USING "btree" ("tenant_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_orders_actual_delivery_date" ON "public"."orders" USING "btree" ("actual_delivery_date");



CREATE INDEX "idx_orders_assigned_to" ON "public"."orders" USING "btree" ("assigned_to");



CREATE INDEX "idx_orders_brand_id" ON "public"."orders" USING "btree" ("brand_id");



CREATE INDEX "idx_orders_cancelled_by" ON "public"."orders" USING "btree" ("cancelled_by");



CREATE INDEX "idx_orders_client_id" ON "public"."orders" USING "btree" ("client_id");



CREATE INDEX "idx_orders_client_invoice_data_id" ON "public"."orders" USING "btree" ("client_invoice_data_id");



CREATE INDEX "idx_orders_commercial_structure_id" ON "public"."orders" USING "btree" ("commercial_structure_id");



CREATE INDEX "idx_orders_confirmed_delivery_date" ON "public"."orders" USING "btree" ("confirmed_delivery_date");



CREATE INDEX "idx_orders_created_at" ON "public"."orders" USING "btree" ("created_at");



CREATE INDEX "idx_orders_deleted_at" ON "public"."orders" USING "btree" ("deleted_at");



CREATE INDEX "idx_orders_delivery_confirmation_gin" ON "public"."orders" USING "gin" ("delivery_confirmation");



CREATE INDEX "idx_orders_invoice_required" ON "public"."orders" USING "btree" ("invoice_required");



CREATE INDEX "idx_orders_metadata_gin" ON "public"."orders" USING "gin" ("metadata");



CREATE INDEX "idx_orders_order_attachments_gin" ON "public"."orders" USING "gin" ("order_attachments");



CREATE INDEX "idx_orders_order_date" ON "public"."orders" USING "btree" ("order_date");



CREATE INDEX "idx_orders_order_number" ON "public"."orders" USING "btree" ("order_number");



CREATE INDEX "idx_orders_order_status" ON "public"."orders" USING "btree" ("order_status");



CREATE INDEX "idx_orders_order_type" ON "public"."orders" USING "btree" ("order_type");



CREATE INDEX "idx_orders_payment_method" ON "public"."orders" USING "btree" ("payment_method");



CREATE INDEX "idx_orders_payment_status" ON "public"."orders" USING "btree" ("payment_status");



CREATE INDEX "idx_orders_priority" ON "public"."orders" USING "btree" ("priority");



CREATE INDEX "idx_orders_public_id" ON "public"."orders" USING "btree" ("public_id");



CREATE INDEX "idx_orders_requested_delivery_date" ON "public"."orders" USING "btree" ("requested_delivery_date");



CREATE INDEX "idx_orders_source_channel" ON "public"."orders" USING "btree" ("source_channel");



CREATE INDEX "idx_orders_tenant_id" ON "public"."orders" USING "btree" ("tenant_id");



CREATE INDEX "idx_orders_tracking_number" ON "public"."orders" USING "btree" ("tracking_number");



CREATE INDEX "idx_points_transactions_approval_required" ON "public"."points_transactions" USING "btree" ("approval_required");



CREATE INDEX "idx_points_transactions_approved_by" ON "public"."points_transactions" USING "btree" ("approved_by");



CREATE INDEX "idx_points_transactions_balance_calc" ON "public"."points_transactions" USING "btree" ("client_brand_membership_id", "created_at");



CREATE INDEX "idx_points_transactions_campaign_id" ON "public"."points_transactions" USING "btree" ("campaign_id");



CREATE INDEX "idx_points_transactions_client_brand_membership_id" ON "public"."points_transactions" USING "btree" ("client_brand_membership_id");



CREATE INDEX "idx_points_transactions_created_at" ON "public"."points_transactions" USING "btree" ("created_at");



CREATE INDEX "idx_points_transactions_deleted_at" ON "public"."points_transactions" USING "btree" ("deleted_at");



CREATE INDEX "idx_points_transactions_expiration_date" ON "public"."points_transactions" USING "btree" ("expiration_date");



CREATE INDEX "idx_points_transactions_is_expired" ON "public"."points_transactions" USING "btree" ("is_expired");



CREATE INDEX "idx_points_transactions_membership_date" ON "public"."points_transactions" USING "btree" ("client_brand_membership_id", "transaction_date" DESC);



CREATE INDEX "idx_points_transactions_metadata_gin" ON "public"."points_transactions" USING "gin" ("metadata");



CREATE INDEX "idx_points_transactions_processed_by" ON "public"."points_transactions" USING "btree" ("processed_by");



CREATE INDEX "idx_points_transactions_promotion_id" ON "public"."points_transactions" USING "btree" ("promotion_id");



CREATE INDEX "idx_points_transactions_public_id" ON "public"."points_transactions" USING "btree" ("public_id");



CREATE INDEX "idx_points_transactions_reversal_of" ON "public"."points_transactions" USING "btree" ("reversal_of");



CREATE INDEX "idx_points_transactions_reversed_by" ON "public"."points_transactions" USING "btree" ("reversed_by");



CREATE INDEX "idx_points_transactions_source_type" ON "public"."points_transactions" USING "btree" ("source_type");



CREATE INDEX "idx_points_transactions_tenant_id" ON "public"."points_transactions" USING "btree" ("tenant_id");



CREATE INDEX "idx_points_transactions_transaction_date" ON "public"."points_transactions" USING "btree" ("transaction_date");



CREATE INDEX "idx_points_transactions_transaction_type" ON "public"."points_transactions" USING "btree" ("transaction_type");



CREATE INDEX "idx_product_categories_brand_id" ON "public"."product_categories" USING "btree" ("brand_id");



CREATE INDEX "idx_product_categories_category_level" ON "public"."product_categories" USING "btree" ("category_level");



CREATE INDEX "idx_product_categories_characteristics_gin" ON "public"."product_categories" USING "gin" ("characteristics");



CREATE INDEX "idx_product_categories_code" ON "public"."product_categories" USING "btree" ("code");



CREATE INDEX "idx_product_categories_deleted_at" ON "public"."product_categories" USING "btree" ("deleted_at");



CREATE INDEX "idx_product_categories_is_active" ON "public"."product_categories" USING "btree" ("is_active");



CREATE INDEX "idx_product_categories_parent_category_id" ON "public"."product_categories" USING "btree" ("parent_category_id");



CREATE INDEX "idx_product_categories_public_id" ON "public"."product_categories" USING "btree" ("public_id");



CREATE INDEX "idx_product_categories_sort_order" ON "public"."product_categories" USING "btree" ("tenant_id", "brand_id", "sort_order");



CREATE INDEX "idx_product_categories_tenant_id" ON "public"."product_categories" USING "btree" ("tenant_id");



CREATE INDEX "idx_product_variants_barcode" ON "public"."product_variants" USING "btree" ("barcode");



CREATE INDEX "idx_product_variants_case_dimensions_gin" ON "public"."product_variants" USING "gin" ("case_dimensions");



CREATE INDEX "idx_product_variants_deleted_at" ON "public"."product_variants" USING "btree" ("deleted_at");



CREATE INDEX "idx_product_variants_dimensions_gin" ON "public"."product_variants" USING "gin" ("dimensions");



CREATE INDEX "idx_product_variants_discontinue_date" ON "public"."product_variants" USING "btree" ("discontinue_date");



CREATE INDEX "idx_product_variants_is_active" ON "public"."product_variants" USING "btree" ("is_active");



CREATE INDEX "idx_product_variants_is_default" ON "public"."product_variants" USING "btree" ("is_default");



CREATE INDEX "idx_product_variants_launch_date" ON "public"."product_variants" USING "btree" ("launch_date");



CREATE INDEX "idx_product_variants_product_id" ON "public"."product_variants" USING "btree" ("product_id");



CREATE INDEX "idx_product_variants_public_id" ON "public"."product_variants" USING "btree" ("public_id");



CREATE INDEX "idx_product_variants_size_unit" ON "public"."product_variants" USING "btree" ("size_unit");



CREATE INDEX "idx_product_variants_size_value" ON "public"."product_variants" USING "btree" ("size_value");



CREATE INDEX "idx_product_variants_sort_order" ON "public"."product_variants" USING "btree" ("product_id", "sort_order");



CREATE INDEX "idx_product_variants_tenant_id" ON "public"."product_variants" USING "btree" ("tenant_id");



CREATE INDEX "idx_product_variants_variant_code" ON "public"."product_variants" USING "btree" ("variant_code");



CREATE INDEX "idx_products_barcode" ON "public"."products" USING "btree" ("barcode");



CREATE INDEX "idx_products_brand_id" ON "public"."products" USING "btree" ("brand_id");



CREATE INDEX "idx_products_category_id" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "idx_products_code" ON "public"."products" USING "btree" ("code");



CREATE INDEX "idx_products_deleted_at" ON "public"."products" USING "btree" ("deleted_at");



CREATE INDEX "idx_products_dimensions_gin" ON "public"."products" USING "gin" ("dimensions");



CREATE INDEX "idx_products_discontinue_date" ON "public"."products" USING "btree" ("discontinue_date");



CREATE INDEX "idx_products_gallery_urls_gin" ON "public"."products" USING "gin" ("gallery_urls");



CREATE INDEX "idx_products_is_active" ON "public"."products" USING "btree" ("is_active");



CREATE INDEX "idx_products_is_featured" ON "public"."products" USING "btree" ("is_featured");



CREATE INDEX "idx_products_launch_date" ON "public"."products" USING "btree" ("launch_date");



CREATE INDEX "idx_products_marketing_tags_gin" ON "public"."products" USING "gin" ("marketing_tags");



CREATE INDEX "idx_products_name" ON "public"."products" USING "btree" ("name");



CREATE INDEX "idx_products_public_id" ON "public"."products" USING "btree" ("public_id");



CREATE INDEX "idx_products_sort_order" ON "public"."products" USING "btree" ("tenant_id", "brand_id", "sort_order");



CREATE INDEX "idx_products_specifications_gin" ON "public"."products" USING "gin" ("specifications");



CREATE INDEX "idx_products_tenant_id" ON "public"."products" USING "btree" ("tenant_id");



CREATE INDEX "idx_promotion_redemptions_applied_by" ON "public"."promotion_redemptions" USING "btree" ("applied_by");



CREATE INDEX "idx_promotion_redemptions_auto_applied" ON "public"."promotion_redemptions" USING "btree" ("auto_applied");



CREATE INDEX "idx_promotion_redemptions_client_brand_membership_id" ON "public"."promotion_redemptions" USING "btree" ("client_brand_membership_id");



CREATE INDEX "idx_promotion_redemptions_client_notification_sent" ON "public"."promotion_redemptions" USING "btree" ("client_notification_sent");



CREATE INDEX "idx_promotion_redemptions_created_at" ON "public"."promotion_redemptions" USING "btree" ("created_at");



CREATE INDEX "idx_promotion_redemptions_deleted_at" ON "public"."promotion_redemptions" USING "btree" ("deleted_at");



CREATE INDEX "idx_promotion_redemptions_metadata_gin" ON "public"."promotion_redemptions" USING "gin" ("metadata");



CREATE INDEX "idx_promotion_redemptions_order_type_id" ON "public"."promotion_redemptions" USING "btree" ("order_type", "order_id");



CREATE INDEX "idx_promotion_redemptions_promotion_id" ON "public"."promotion_redemptions" USING "btree" ("promotion_id");



CREATE INDEX "idx_promotion_redemptions_promotion_type_applied" ON "public"."promotion_redemptions" USING "btree" ("promotion_type_applied");



CREATE INDEX "idx_promotion_redemptions_public_id" ON "public"."promotion_redemptions" USING "btree" ("public_id");



CREATE INDEX "idx_promotion_redemptions_redemption_date" ON "public"."promotion_redemptions" USING "btree" ("redemption_date");



CREATE INDEX "idx_promotion_redemptions_redemption_status" ON "public"."promotion_redemptions" USING "btree" ("redemption_status");



CREATE INDEX "idx_promotion_redemptions_reversed_by" ON "public"."promotion_redemptions" USING "btree" ("reversed_by");



CREATE INDEX "idx_promotion_redemptions_rules_validation_gin" ON "public"."promotion_redemptions" USING "gin" ("rules_validation");



CREATE INDEX "idx_promotion_redemptions_tenant_id" ON "public"."promotion_redemptions" USING "btree" ("tenant_id");



CREATE INDEX "idx_promotion_redemptions_validated_by" ON "public"."promotion_redemptions" USING "btree" ("validated_by");



CREATE INDEX "idx_promotion_redemptions_validation_required" ON "public"."promotion_redemptions" USING "btree" ("validation_required");



CREATE INDEX "idx_promotion_rules_apply_to_all" ON "public"."promotion_rules" USING "btree" ("apply_to_all");



CREATE INDEX "idx_promotion_rules_created_at" ON "public"."promotion_rules" USING "btree" ("created_at");



CREATE INDEX "idx_promotion_rules_created_by" ON "public"."promotion_rules" USING "btree" ("created_by");



CREATE INDEX "idx_promotion_rules_custom_conditions_gin" ON "public"."promotion_rules" USING "gin" ("custom_conditions");



CREATE INDEX "idx_promotion_rules_deleted_at" ON "public"."promotion_rules" USING "btree" ("deleted_at");



CREATE INDEX "idx_promotion_rules_effective_from" ON "public"."promotion_rules" USING "btree" ("effective_from");



CREATE INDEX "idx_promotion_rules_effective_until" ON "public"."promotion_rules" USING "btree" ("effective_until");



CREATE INDEX "idx_promotion_rules_is_active" ON "public"."promotion_rules" USING "btree" ("is_active");



CREATE INDEX "idx_promotion_rules_is_inclusion" ON "public"."promotion_rules" USING "btree" ("is_inclusion");



CREATE INDEX "idx_promotion_rules_priority" ON "public"."promotion_rules" USING "btree" ("priority");



CREATE INDEX "idx_promotion_rules_promotion_id" ON "public"."promotion_rules" USING "btree" ("promotion_id");



CREATE INDEX "idx_promotion_rules_public_id" ON "public"."promotion_rules" USING "btree" ("public_id");



CREATE INDEX "idx_promotion_rules_rule_type" ON "public"."promotion_rules" USING "btree" ("rule_type");



CREATE INDEX "idx_promotion_rules_target_categories_gin" ON "public"."promotion_rules" USING "gin" ("target_categories");



CREATE INDEX "idx_promotion_rules_target_client_types_gin" ON "public"."promotion_rules" USING "gin" ("target_client_types");



CREATE INDEX "idx_promotion_rules_target_clients_gin" ON "public"."promotion_rules" USING "gin" ("target_clients");



CREATE INDEX "idx_promotion_rules_target_commercial_structures_gin" ON "public"."promotion_rules" USING "gin" ("target_commercial_structures");



CREATE INDEX "idx_promotion_rules_target_markets_gin" ON "public"."promotion_rules" USING "gin" ("target_markets");



CREATE INDEX "idx_promotion_rules_target_products_gin" ON "public"."promotion_rules" USING "gin" ("target_products");



CREATE INDEX "idx_promotion_rules_target_states_gin" ON "public"."promotion_rules" USING "gin" ("target_states");



CREATE INDEX "idx_promotion_rules_target_tiers_gin" ON "public"."promotion_rules" USING "gin" ("target_tiers");



CREATE INDEX "idx_promotion_rules_target_zones_gin" ON "public"."promotion_rules" USING "gin" ("target_zones");



CREATE INDEX "idx_promotion_rules_tenant_id" ON "public"."promotion_rules" USING "btree" ("tenant_id");



CREATE INDEX "idx_promotions_approved_by" ON "public"."promotions" USING "btree" ("approved_by");



CREATE INDEX "idx_promotions_auto_apply" ON "public"."promotions" USING "btree" ("auto_apply");



CREATE INDEX "idx_promotions_brand_id" ON "public"."promotions" USING "btree" ("brand_id");



CREATE INDEX "idx_promotions_campaign_id" ON "public"."promotions" USING "btree" ("campaign_id");



CREATE INDEX "idx_promotions_created_at" ON "public"."promotions" USING "btree" ("created_at");



CREATE INDEX "idx_promotions_created_by" ON "public"."promotions" USING "btree" ("created_by");



CREATE INDEX "idx_promotions_creative_assets_gin" ON "public"."promotions" USING "gin" ("creative_assets");



CREATE INDEX "idx_promotions_days_of_week_gin" ON "public"."promotions" USING "gin" ("days_of_week");



CREATE INDEX "idx_promotions_deleted_at" ON "public"."promotions" USING "btree" ("deleted_at");



CREATE INDEX "idx_promotions_end_date" ON "public"."promotions" USING "btree" ("end_date");



CREATE INDEX "idx_promotions_performance_metrics_gin" ON "public"."promotions" USING "gin" ("performance_metrics");



CREATE INDEX "idx_promotions_priority" ON "public"."promotions" USING "btree" ("priority");



CREATE INDEX "idx_promotions_promo_code" ON "public"."promotions" USING "btree" ("promo_code");



CREATE INDEX "idx_promotions_promotion_type" ON "public"."promotions" USING "btree" ("promotion_type");



CREATE INDEX "idx_promotions_public_id" ON "public"."promotions" USING "btree" ("public_id");



CREATE INDEX "idx_promotions_requires_code" ON "public"."promotions" USING "btree" ("requires_code");



CREATE INDEX "idx_promotions_stackable" ON "public"."promotions" USING "btree" ("stackable");



CREATE INDEX "idx_promotions_start_date" ON "public"."promotions" USING "btree" ("start_date");



CREATE INDEX "idx_promotions_status" ON "public"."promotions" USING "btree" ("status");



CREATE INDEX "idx_promotions_tenant_id" ON "public"."promotions" USING "btree" ("tenant_id");



CREATE INDEX "idx_promotions_usage_count_total" ON "public"."promotions" USING "btree" ("usage_count_total");



CREATE INDEX "idx_reward_redemptions_applied_to_order_id" ON "public"."reward_redemptions" USING "btree" ("applied_to_order_id");



CREATE INDEX "idx_reward_redemptions_cancelled_by" ON "public"."reward_redemptions" USING "btree" ("cancelled_by");



CREATE INDEX "idx_reward_redemptions_client_brand_membership_id" ON "public"."reward_redemptions" USING "btree" ("client_brand_membership_id");



CREATE INDEX "idx_reward_redemptions_created_at" ON "public"."reward_redemptions" USING "btree" ("created_at");



CREATE INDEX "idx_reward_redemptions_deleted_at" ON "public"."reward_redemptions" USING "btree" ("deleted_at");



CREATE INDEX "idx_reward_redemptions_expiration_date" ON "public"."reward_redemptions" USING "btree" ("expiration_date");



CREATE INDEX "idx_reward_redemptions_metadata_gin" ON "public"."reward_redemptions" USING "gin" ("metadata");



CREATE INDEX "idx_reward_redemptions_notification_sent" ON "public"."reward_redemptions" USING "btree" ("notification_sent");



CREATE INDEX "idx_reward_redemptions_points_transaction_id" ON "public"."reward_redemptions" USING "btree" ("points_transaction_id");



CREATE INDEX "idx_reward_redemptions_public_id" ON "public"."reward_redemptions" USING "btree" ("public_id");



CREATE INDEX "idx_reward_redemptions_redeemed_by" ON "public"."reward_redemptions" USING "btree" ("redeemed_by");



CREATE INDEX "idx_reward_redemptions_redemption_code" ON "public"."reward_redemptions" USING "btree" ("redemption_code");



CREATE INDEX "idx_reward_redemptions_redemption_date" ON "public"."reward_redemptions" USING "btree" ("redemption_date");



CREATE INDEX "idx_reward_redemptions_redemption_status" ON "public"."reward_redemptions" USING "btree" ("redemption_status");



CREATE INDEX "idx_reward_redemptions_refund_transaction_id" ON "public"."reward_redemptions" USING "btree" ("refund_transaction_id");



CREATE INDEX "idx_reward_redemptions_reward_id" ON "public"."reward_redemptions" USING "btree" ("reward_id");



CREATE INDEX "idx_reward_redemptions_tenant_id" ON "public"."reward_redemptions" USING "btree" ("tenant_id");



CREATE INDEX "idx_reward_redemptions_used_date" ON "public"."reward_redemptions" USING "btree" ("used_date");



CREATE INDEX "idx_reward_redemptions_validated_by" ON "public"."reward_redemptions" USING "btree" ("validated_by");



CREATE INDEX "idx_rewards_applicable_categories_gin" ON "public"."rewards" USING "gin" ("applicable_categories");



CREATE INDEX "idx_rewards_applicable_products_gin" ON "public"."rewards" USING "gin" ("applicable_products");



CREATE INDEX "idx_rewards_auto_apply" ON "public"."rewards" USING "btree" ("auto_apply");



CREATE INDEX "idx_rewards_brand_id" ON "public"."rewards" USING "btree" ("brand_id");



CREATE INDEX "idx_rewards_created_at" ON "public"."rewards" USING "btree" ("created_at");



CREATE INDEX "idx_rewards_deleted_at" ON "public"."rewards" USING "btree" ("deleted_at");



CREATE INDEX "idx_rewards_is_active" ON "public"."rewards" USING "btree" ("is_active");



CREATE INDEX "idx_rewards_is_featured" ON "public"."rewards" USING "btree" ("is_featured");



CREATE INDEX "idx_rewards_points_cost" ON "public"."rewards" USING "btree" ("points_cost");



CREATE INDEX "idx_rewards_product_id" ON "public"."rewards" USING "btree" ("product_id");



CREATE INDEX "idx_rewards_product_variant_id" ON "public"."rewards" USING "btree" ("product_variant_id");



CREATE INDEX "idx_rewards_promotion_id" ON "public"."rewards" USING "btree" ("promotion_id");



CREATE INDEX "idx_rewards_public_id" ON "public"."rewards" USING "btree" ("public_id");



CREATE INDEX "idx_rewards_reward_type" ON "public"."rewards" USING "btree" ("reward_type");



CREATE INDEX "idx_rewards_sort_order" ON "public"."rewards" USING "btree" ("sort_order");



CREATE INDEX "idx_rewards_tenant_id" ON "public"."rewards" USING "btree" ("tenant_id");



CREATE INDEX "idx_rewards_tier_requirements_gin" ON "public"."rewards" USING "gin" ("tier_requirements");



CREATE INDEX "idx_rewards_usage_count_total" ON "public"."rewards" USING "btree" ("usage_count_total");



CREATE INDEX "idx_rewards_valid_from" ON "public"."rewards" USING "btree" ("valid_from");



CREATE INDEX "idx_rewards_valid_until" ON "public"."rewards" USING "btree" ("valid_until");



CREATE INDEX "idx_tenants_deleted_at" ON "public"."tenants" USING "btree" ("deleted_at");



CREATE INDEX "idx_tenants_public_id" ON "public"."tenants" USING "btree" ("public_id");



CREATE INDEX "idx_tenants_slug" ON "public"."tenants" USING "btree" ("slug");



CREATE INDEX "idx_tenants_status" ON "public"."tenants" USING "btree" ("status");



CREATE INDEX "idx_tiers_auto_assignment_enabled" ON "public"."tiers" USING "btree" ("auto_assignment_enabled");



CREATE INDEX "idx_tiers_auto_assignment_rules_gin" ON "public"."tiers" USING "gin" ("auto_assignment_rules");



CREATE INDEX "idx_tiers_benefits_gin" ON "public"."tiers" USING "gin" ("benefits");



CREATE INDEX "idx_tiers_brand_id" ON "public"."tiers" USING "btree" ("brand_id");



CREATE INDEX "idx_tiers_code" ON "public"."tiers" USING "btree" ("code");



CREATE INDEX "idx_tiers_deleted_at" ON "public"."tiers" USING "btree" ("deleted_at");



CREATE INDEX "idx_tiers_is_active" ON "public"."tiers" USING "btree" ("is_active");



CREATE INDEX "idx_tiers_is_default" ON "public"."tiers" USING "btree" ("is_default");



CREATE INDEX "idx_tiers_min_points_required" ON "public"."tiers" USING "btree" ("min_points_required");



CREATE INDEX "idx_tiers_public_id" ON "public"."tiers" USING "btree" ("public_id");



CREATE INDEX "idx_tiers_requirements_gin" ON "public"."tiers" USING "gin" ("requirements");



CREATE INDEX "idx_tiers_sort_order" ON "public"."tiers" USING "btree" ("sort_order");



CREATE INDEX "idx_tiers_tenant_id" ON "public"."tiers" USING "btree" ("tenant_id");



CREATE INDEX "idx_tiers_tier_level" ON "public"."tiers" USING "btree" ("tier_level");



CREATE INDEX "idx_user_profiles_deleted_at" ON "public"."user_profiles" USING "btree" ("deleted_at");



CREATE INDEX "idx_user_profiles_email" ON "public"."user_profiles" USING "btree" ("email");



CREATE INDEX "idx_user_profiles_employee_code" ON "public"."user_profiles" USING "btree" ("employee_code");



CREATE INDEX "idx_user_profiles_manager_id" ON "public"."user_profiles" USING "btree" ("manager_id");



CREATE INDEX "idx_user_profiles_public_id" ON "public"."user_profiles" USING "btree" ("public_id");



CREATE INDEX "idx_user_profiles_status" ON "public"."user_profiles" USING "btree" ("status");



CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_user_roles_active_lookup" ON "public"."user_roles" USING "btree" ("user_profile_id", "tenant_id", "brand_id", "status") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_user_roles_brand_id" ON "public"."user_roles" USING "btree" ("brand_id");



CREATE INDEX "idx_user_roles_deleted_at" ON "public"."user_roles" USING "btree" ("deleted_at");



CREATE INDEX "idx_user_roles_expiration_active" ON "public"."user_roles" USING "btree" ("expires_at", "status") WHERE (("status" = 'active'::"public"."user_role_status_enum") AND ("expires_at" IS NOT NULL) AND ("deleted_at" IS NULL));



CREATE INDEX "idx_user_roles_expires_at" ON "public"."user_roles" USING "btree" ("expires_at");



CREATE INDEX "idx_user_roles_is_primary" ON "public"."user_roles" USING "btree" ("is_primary");



CREATE INDEX "idx_user_roles_role" ON "public"."user_roles" USING "btree" ("role");



CREATE INDEX "idx_user_roles_scope" ON "public"."user_roles" USING "btree" ("scope");



CREATE INDEX "idx_user_roles_status" ON "public"."user_roles" USING "btree" ("status");



CREATE INDEX "idx_user_roles_tenant_id" ON "public"."user_roles" USING "btree" ("tenant_id");



CREATE INDEX "idx_user_roles_user_profile_id" ON "public"."user_roles" USING "btree" ("user_profile_id");



CREATE INDEX "idx_visit_assessments_assessment_type" ON "public"."visit_assessments" USING "btree" ("assessment_type");



CREATE INDEX "idx_visit_assessments_competitor_present" ON "public"."visit_assessments" USING "btree" ("competitor_present");



CREATE INDEX "idx_visit_assessments_competitor_prices_gin" ON "public"."visit_assessments" USING "gin" ("competitor_prices");



CREATE INDEX "idx_visit_assessments_competitor_products_gin" ON "public"."visit_assessments" USING "gin" ("competitor_products");



CREATE INDEX "idx_visit_assessments_created_at" ON "public"."visit_assessments" USING "btree" ("created_at");



CREATE INDEX "idx_visit_assessments_deleted_at" ON "public"."visit_assessments" USING "btree" ("deleted_at");



CREATE INDEX "idx_visit_assessments_is_present" ON "public"."visit_assessments" USING "btree" ("is_present");



CREATE INDEX "idx_visit_assessments_product_id" ON "public"."visit_assessments" USING "btree" ("product_id");



CREATE INDEX "idx_visit_assessments_product_variant_id" ON "public"."visit_assessments" USING "btree" ("product_variant_id");



CREATE INDEX "idx_visit_assessments_promotional_materials_gin" ON "public"."visit_assessments" USING "gin" ("promotional_materials");



CREATE INDEX "idx_visit_assessments_public_id" ON "public"."visit_assessments" USING "btree" ("public_id");



CREATE INDEX "idx_visit_assessments_recommended_actions_gin" ON "public"."visit_assessments" USING "gin" ("recommended_actions");



CREATE INDEX "idx_visit_assessments_requires_action" ON "public"."visit_assessments" USING "btree" ("requires_action");



CREATE INDEX "idx_visit_assessments_stock_level" ON "public"."visit_assessments" USING "btree" ("stock_level");



CREATE INDEX "idx_visit_assessments_tenant_id" ON "public"."visit_assessments" USING "btree" ("tenant_id");



CREATE INDEX "idx_visit_assessments_visit_id" ON "public"."visit_assessments" USING "btree" ("visit_id");



CREATE INDEX "idx_visit_communication_plans_brand_id" ON "public"."visit_communication_plans" USING "btree" ("brand_id");



CREATE INDEX "idx_visit_communication_plans_campaign_duration_gin" ON "public"."visit_communication_plans" USING "gin" ("campaign_duration");



CREATE INDEX "idx_visit_communication_plans_campaign_id" ON "public"."visit_communication_plans" USING "btree" ("campaign_id");



CREATE INDEX "idx_visit_communication_plans_client_approval" ON "public"."visit_communication_plans" USING "btree" ("client_approval");



CREATE INDEX "idx_visit_communication_plans_created_at" ON "public"."visit_communication_plans" USING "btree" ("created_at");



CREATE INDEX "idx_visit_communication_plans_current_status" ON "public"."visit_communication_plans" USING "btree" ("current_status");



CREATE INDEX "idx_visit_communication_plans_deleted_at" ON "public"."visit_communication_plans" USING "btree" ("deleted_at");



CREATE INDEX "idx_visit_communication_plans_follow_up_date" ON "public"."visit_communication_plans" USING "btree" ("follow_up_date");



CREATE INDEX "idx_visit_communication_plans_follow_up_required" ON "public"."visit_communication_plans" USING "btree" ("follow_up_required");



CREATE INDEX "idx_visit_communication_plans_installation_date_actual" ON "public"."visit_communication_plans" USING "btree" ("installation_date_actual");



CREATE INDEX "idx_visit_communication_plans_installation_date_planned" ON "public"."visit_communication_plans" USING "btree" ("installation_date_planned");



CREATE INDEX "idx_visit_communication_plans_installed_by" ON "public"."visit_communication_plans" USING "btree" ("installed_by");



CREATE INDEX "idx_visit_communication_plans_material_type" ON "public"."visit_communication_plans" USING "btree" ("material_type");



CREATE INDEX "idx_visit_communication_plans_photo_after_urls_gin" ON "public"."visit_communication_plans" USING "gin" ("photo_after_urls");



CREATE INDEX "idx_visit_communication_plans_photo_before_urls_gin" ON "public"."visit_communication_plans" USING "gin" ("photo_before_urls");



CREATE INDEX "idx_visit_communication_plans_planned_action" ON "public"."visit_communication_plans" USING "btree" ("planned_action");



CREATE INDEX "idx_visit_communication_plans_public_id" ON "public"."visit_communication_plans" USING "btree" ("public_id");



CREATE INDEX "idx_visit_communication_plans_tenant_id" ON "public"."visit_communication_plans" USING "btree" ("tenant_id");



CREATE INDEX "idx_visit_communication_plans_visit_id" ON "public"."visit_communication_plans" USING "btree" ("visit_id");



CREATE INDEX "idx_visit_inventories_batch_numbers_gin" ON "public"."visit_inventories" USING "gin" ("batch_numbers");



CREATE INDEX "idx_visit_inventories_counted_by" ON "public"."visit_inventories" USING "btree" ("counted_by");



CREATE INDEX "idx_visit_inventories_created_at" ON "public"."visit_inventories" USING "btree" ("created_at");



CREATE INDEX "idx_visit_inventories_current_stock" ON "public"."visit_inventories" USING "btree" ("current_stock");



CREATE INDEX "idx_visit_inventories_deleted_at" ON "public"."visit_inventories" USING "btree" ("deleted_at");



CREATE INDEX "idx_visit_inventories_expiration_dates_gin" ON "public"."visit_inventories" USING "gin" ("expiration_dates");



CREATE INDEX "idx_visit_inventories_location_in_store" ON "public"."visit_inventories" USING "btree" ("location_in_store");



CREATE INDEX "idx_visit_inventories_product_id" ON "public"."visit_inventories" USING "btree" ("product_id");



CREATE INDEX "idx_visit_inventories_product_variant_id" ON "public"."visit_inventories" USING "btree" ("product_variant_id");



CREATE INDEX "idx_visit_inventories_public_id" ON "public"."visit_inventories" USING "btree" ("public_id");



CREATE INDEX "idx_visit_inventories_restock_needed" ON "public"."visit_inventories" USING "btree" ("restock_needed");



CREATE INDEX "idx_visit_inventories_restock_priority" ON "public"."visit_inventories" USING "btree" ("restock_priority");



CREATE INDEX "idx_visit_inventories_storage_conditions_gin" ON "public"."visit_inventories" USING "gin" ("storage_conditions");



CREATE INDEX "idx_visit_inventories_tenant_id" ON "public"."visit_inventories" USING "btree" ("tenant_id");



CREATE INDEX "idx_visit_inventories_verified_by" ON "public"."visit_inventories" USING "btree" ("verified_by");



CREATE INDEX "idx_visit_inventories_visit_id" ON "public"."visit_inventories" USING "btree" ("visit_id");



CREATE INDEX "idx_visit_order_items_deleted_at" ON "public"."visit_order_items" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);



CREATE INDEX "idx_visit_order_items_metadata" ON "public"."visit_order_items" USING "gin" ("metadata");



CREATE INDEX "idx_visit_order_items_negotiated" ON "public"."visit_order_items" USING "btree" ("visit_order_id") WHERE (("deleted_at" IS NULL) AND ("price_negotiated" = true));



CREATE UNIQUE INDEX "idx_visit_order_items_order_line_unique" ON "public"."visit_order_items" USING "btree" ("visit_order_id", "line_number") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_visit_order_items_priority" ON "public"."visit_order_items" USING "btree" ("item_priority") WHERE (("deleted_at" IS NULL) AND ("item_priority" = ANY (ARRAY['high'::"public"."visit_order_item_priority_enum", 'urgent'::"public"."visit_order_item_priority_enum"])));



CREATE INDEX "idx_visit_order_items_product_id" ON "public"."visit_order_items" USING "btree" ("product_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_visit_order_items_product_variant_id" ON "public"."visit_order_items" USING "btree" ("product_variant_id") WHERE (("deleted_at" IS NULL) AND ("product_variant_id" IS NOT NULL));



CREATE INDEX "idx_visit_order_items_public_id" ON "public"."visit_order_items" USING "btree" ("public_id");



CREATE INDEX "idx_visit_order_items_requires_approval" ON "public"."visit_order_items" USING "btree" ("visit_order_id") WHERE (("deleted_at" IS NULL) AND ("requires_approval" = true) AND ("approved_by" IS NULL));



CREATE INDEX "idx_visit_order_items_sales_techniques" ON "public"."visit_order_items" USING "btree" ("visit_order_id") WHERE (("deleted_at" IS NULL) AND (("cross_sell_item" = true) OR ("upsell_item" = true)));



CREATE INDEX "idx_visit_order_items_samples" ON "public"."visit_order_items" USING "btree" ("visit_order_id") WHERE (("deleted_at" IS NULL) AND ("sample_item" = true));



CREATE INDEX "idx_visit_order_items_source" ON "public"."visit_order_items" USING "btree" ("item_source") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_visit_order_items_tenant_id" ON "public"."visit_order_items" USING "btree" ("tenant_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_visit_order_items_visit_order_id" ON "public"."visit_order_items" USING "btree" ("visit_order_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_visit_orders_advisor_id" ON "public"."visit_orders" USING "btree" ("advisor_id");



CREATE INDEX "idx_visit_orders_approved_by" ON "public"."visit_orders" USING "btree" ("approved_by");



CREATE INDEX "idx_visit_orders_attachments_gin" ON "public"."visit_orders" USING "gin" ("order_attachments");



CREATE INDEX "idx_visit_orders_client_id" ON "public"."visit_orders" USING "btree" ("client_id");



CREATE INDEX "idx_visit_orders_client_invoice_data_id" ON "public"."visit_orders" USING "btree" ("client_invoice_data_id");



CREATE INDEX "idx_visit_orders_created_at" ON "public"."visit_orders" USING "btree" ("created_at");



CREATE INDEX "idx_visit_orders_deleted_at" ON "public"."visit_orders" USING "btree" ("deleted_at");



CREATE INDEX "idx_visit_orders_delivery_date" ON "public"."visit_orders" USING "btree" ("delivery_date");



CREATE INDEX "idx_visit_orders_external_order_id" ON "public"."visit_orders" USING "btree" ("external_order_id");



CREATE INDEX "idx_visit_orders_invoice_required" ON "public"."visit_orders" USING "btree" ("invoice_required");



CREATE INDEX "idx_visit_orders_order_date" ON "public"."visit_orders" USING "btree" ("order_date");



CREATE INDEX "idx_visit_orders_order_number" ON "public"."visit_orders" USING "btree" ("order_number");



CREATE INDEX "idx_visit_orders_order_status" ON "public"."visit_orders" USING "btree" ("order_status");



CREATE INDEX "idx_visit_orders_order_type" ON "public"."visit_orders" USING "btree" ("order_type");



CREATE INDEX "idx_visit_orders_public_id" ON "public"."visit_orders" USING "btree" ("public_id");



CREATE INDEX "idx_visit_orders_requires_approval" ON "public"."visit_orders" USING "btree" ("requires_approval");



CREATE INDEX "idx_visit_orders_tenant_id" ON "public"."visit_orders" USING "btree" ("tenant_id");



CREATE INDEX "idx_visit_orders_visit_id" ON "public"."visit_orders" USING "btree" ("visit_id");



CREATE INDEX "idx_visits_advisor_id" ON "public"."visits" USING "btree" ("advisor_id");



CREATE INDEX "idx_visits_attachments_gin" ON "public"."visits" USING "gin" ("visit_attachments");



CREATE INDEX "idx_visits_brand_id" ON "public"."visits" USING "btree" ("brand_id");



CREATE INDEX "idx_visits_check_in_time" ON "public"."visits" USING "btree" ("check_in_time");



CREATE INDEX "idx_visits_client_id" ON "public"."visits" USING "btree" ("client_id");



CREATE INDEX "idx_visits_coordinates_gist" ON "public"."visits" USING "gist" ("location_coordinates");



CREATE INDEX "idx_visits_deleted_at" ON "public"."visits" USING "btree" ("deleted_at");



CREATE INDEX "idx_visits_metadata_gin" ON "public"."visits" USING "gin" ("metadata");



CREATE INDEX "idx_visits_next_visit_date" ON "public"."visits" USING "btree" ("next_visit_date");



CREATE INDEX "idx_visits_public_id" ON "public"."visits" USING "btree" ("public_id");



CREATE INDEX "idx_visits_requires_follow_up" ON "public"."visits" USING "btree" ("requires_follow_up");



CREATE INDEX "idx_visits_tenant_id" ON "public"."visits" USING "btree" ("tenant_id");



CREATE INDEX "idx_visits_visit_date" ON "public"."visits" USING "btree" ("visit_date");



CREATE INDEX "idx_visits_visit_status" ON "public"."visits" USING "btree" ("visit_status");



CREATE INDEX "idx_visits_visit_type" ON "public"."visits" USING "btree" ("visit_type");



CREATE INDEX "idx_visits_workflow_status" ON "public"."visits" USING "btree" ("workflow_status");



CREATE INDEX "idx_zones_cities_gin" ON "public"."zones" USING "gin" ("cities");



CREATE INDEX "idx_zones_code" ON "public"."zones" USING "btree" ("code");



CREATE INDEX "idx_zones_coordinates_gin" ON "public"."zones" USING "gin" ("coordinates");



CREATE INDEX "idx_zones_country_state" ON "public"."zones" USING "btree" ("country", "state");



CREATE INDEX "idx_zones_deleted_at" ON "public"."zones" USING "btree" ("deleted_at");



CREATE INDEX "idx_zones_is_active" ON "public"."zones" USING "btree" ("is_active");



CREATE INDEX "idx_zones_parent_zone_id" ON "public"."zones" USING "btree" ("parent_zone_id");



CREATE INDEX "idx_zones_postal_codes_gin" ON "public"."zones" USING "gin" ("postal_codes");



CREATE INDEX "idx_zones_public_id" ON "public"."zones" USING "btree" ("public_id");



CREATE INDEX "idx_zones_sort_order" ON "public"."zones" USING "btree" ("tenant_id", "sort_order");



CREATE INDEX "idx_zones_tenant_id" ON "public"."zones" USING "btree" ("tenant_id");



CREATE INDEX "idx_zones_zone_type" ON "public"."zones" USING "btree" ("zone_type");



CREATE UNIQUE INDEX "unique_active_advisor_client_assignment" ON "public"."advisor_client_assignments" USING "btree" ("advisor_id", "client_id", "brand_id") WHERE (("deleted_at" IS NULL) AND ("is_active" = true));



CREATE UNIQUE INDEX "unique_advisor_zone_assignment" ON "public"."advisor_assignments" USING "btree" ("user_profile_id", "zone_id") WHERE ("deleted_at" IS NULL);



CREATE OR REPLACE VIEW "public"."active_tiers" AS
 SELECT "t"."id",
    "t"."public_id",
    "t"."tenant_id",
    "t"."brand_id",
    "t"."name",
    "t"."code",
    "t"."description",
    "t"."tier_level",
    "t"."min_points_required",
    "t"."min_visits_required",
    "t"."min_purchases_required",
    "t"."min_purchase_amount",
    "t"."evaluation_period_months",
    "t"."points_multiplier",
    "t"."discount_percentage",
    "t"."benefits",
    "t"."requirements",
    "t"."tier_color",
    "t"."tier_icon_url",
    "t"."badge_image_url",
    "t"."is_default",
    "t"."is_active",
    "t"."auto_assignment_enabled",
    "t"."auto_assignment_rules",
    "t"."retention_period_months",
    "t"."downgrade_enabled",
    "t"."upgrade_notification",
    "t"."sort_order",
    "t"."created_at",
    "t"."updated_at",
    "t"."deleted_at",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "tn"."name" AS "tenant_name",
    "count"("cbm"."id") FILTER (WHERE ("cbm"."deleted_at" IS NULL)) AS "total_members",
    "count"("cbm"."id") FILTER (WHERE (("cbm"."deleted_at" IS NULL) AND ("cbm"."membership_status" = 'active'::"public"."membership_status_enum"))) AS "active_members",
    "lag"("t"."min_points_required") OVER (PARTITION BY "t"."brand_id" ORDER BY "t"."tier_level") AS "previous_tier_min_points",
    "lead"("t"."min_points_required") OVER (PARTITION BY "t"."brand_id" ORDER BY "t"."tier_level") AS "next_tier_min_points",
        CASE
            WHEN ("t"."benefits" IS NOT NULL) THEN "jsonb_array_length"("t"."benefits")
            ELSE 0
        END AS "benefits_count",
        CASE
            WHEN ("t"."is_default" = true) THEN 'default'::"text"
            WHEN ("t"."is_active" = false) THEN 'inactive'::"text"
            WHEN ("t"."auto_assignment_enabled" = true) THEN 'auto_assignment'::"text"
            ELSE 'manual_assignment'::"text"
        END AS "tier_status",
    COALESCE("t"."tier_color", '#6B7280'::character varying) AS "display_color",
        CASE
            WHEN (("t"."points_multiplier" > 1.50) AND ("t"."discount_percentage" > 5.00)) THEN 'high_value'::"text"
            WHEN (("t"."points_multiplier" > 1.25) OR ("t"."discount_percentage" > 2.50)) THEN 'medium_value'::"text"
            ELSE 'basic_value'::"text"
        END AS "tier_value_level"
   FROM ((("public"."tiers" "t"
     JOIN "public"."brands" "b" ON (("t"."brand_id" = "b"."id")))
     JOIN "public"."tenants" "tn" ON (("t"."tenant_id" = "tn"."id")))
     LEFT JOIN "public"."client_brand_memberships" "cbm" ON (("t"."id" = "cbm"."current_tier_id")))
  WHERE (("t"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  GROUP BY "t"."id", "t"."public_id", "t"."tenant_id", "t"."brand_id", "t"."name", "t"."code", "t"."description", "t"."tier_level", "t"."min_points_required", "t"."min_visits_required", "t"."min_purchases_required", "t"."min_purchase_amount", "t"."evaluation_period_months", "t"."points_multiplier", "t"."discount_percentage", "t"."benefits", "t"."requirements", "t"."tier_color", "t"."tier_icon_url", "t"."badge_image_url", "t"."is_default", "t"."is_active", "t"."auto_assignment_enabled", "t"."auto_assignment_rules", "t"."retention_period_months", "t"."downgrade_enabled", "t"."upgrade_notification", "t"."sort_order", "t"."created_at", "t"."updated_at", "b"."name", "b"."slug", "tn"."name"
  ORDER BY "t"."brand_id", "t"."tier_level";



CREATE OR REPLACE VIEW "public"."client_type_kpi_analysis" AS
 SELECT "ct"."tenant_id",
    "ct"."id" AS "client_type_id",
    "ct"."public_id" AS "client_type_public_id",
    "ct"."name" AS "client_type_name",
    "ct"."code" AS "client_type_code",
    "ct"."category",
    "ct"."requires_assessment",
    "ct"."requires_inventory",
    "t"."name" AS "tenant_name",
    "ct"."kpi_targets",
    (("ct"."kpi_targets" ->> 'monthly_visit_target'::"text"))::numeric AS "target_monthly_visits",
    (("ct"."kpi_targets" ->> 'conversion_rate_target'::"text"))::numeric AS "target_conversion_rate",
    (("ct"."kpi_targets" ->> 'satisfaction_score_target'::"text"))::numeric AS "target_satisfaction_score",
    (("ct"."kpi_targets" ->> 'assessment_compliance_target'::"text"))::numeric AS "target_assessment_compliance",
    (("ct"."kpi_targets" ->> 'inventory_accuracy_target'::"text"))::numeric AS "target_inventory_accuracy",
    (("ct"."kpi_targets" ->> 'average_order_value_target'::"text"))::numeric AS "target_average_order_value",
    "count"("c"."id") AS "total_clients",
    "count"("c"."id") FILTER (WHERE ("c"."status" = 'active'::"public"."client_status_enum")) AS "active_clients",
    "count"("c"."id") FILTER (WHERE ("c"."status" = 'prospect'::"public"."client_status_enum")) AS "prospect_clients",
    "count"("c"."id") FILTER (WHERE ("c"."status" = 'suspended'::"public"."client_status_enum")) AS "suspended_clients",
    "count"("c"."id") FILTER (WHERE ("c"."status" = 'inactive'::"public"."client_status_enum")) AS "inactive_clients",
    ("avg"(COALESCE("c"."visit_frequency_days", "ct"."default_visit_frequency_days")))::numeric(5,2) AS "avg_effective_visit_frequency",
    ("avg"(COALESCE("c"."assessment_frequency_days", "ct"."assessment_frequency_days")))::numeric(5,2) AS "avg_effective_assessment_frequency",
    ("avg"("c"."credit_limit"))::numeric(12,2) AS "avg_credit_limit",
    "count"(DISTINCT "c"."zone_id") AS "zones_covered",
    "count"(DISTINCT "c"."market_id") AS "markets_covered",
    "count"(DISTINCT "c"."commercial_structure_id") AS "commercial_structures_used",
    "min"("c"."registration_date") AS "first_client_registered",
    "max"("c"."registration_date") AS "last_client_registered",
    "max"("c"."last_visit_date") AS "last_visit_recorded",
    (0)::numeric AS "actual_monthly_visits",
    0.0 AS "actual_conversion_rate",
    0.0 AS "actual_satisfaction_score",
    0.0 AS "actual_assessment_compliance",
    0.0 AS "actual_inventory_accuracy",
    0.0 AS "actual_average_order_value",
        CASE
            WHEN ((("ct"."kpi_targets" ->> 'monthly_visit_target'::"text"))::numeric IS NOT NULL) THEN ((("ct"."kpi_targets" ->> 'monthly_visit_target'::"text"))::numeric - (0)::numeric)
            ELSE NULL::numeric
        END AS "monthly_visits_gap",
        CASE
            WHEN ((("ct"."kpi_targets" ->> 'conversion_rate_target'::"text"))::numeric IS NOT NULL) THEN ((("ct"."kpi_targets" ->> 'conversion_rate_target'::"text"))::numeric - 0.0)
            ELSE NULL::numeric
        END AS "conversion_rate_gap"
   FROM (("public"."client_types" "ct"
     JOIN "public"."tenants" "t" ON (("ct"."tenant_id" = "t"."id")))
     LEFT JOIN "public"."clients" "c" ON ((("ct"."id" = "c"."client_type_id") AND ("c"."deleted_at" IS NULL))))
  WHERE (("ct"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  GROUP BY "ct"."tenant_id", "ct"."id", "ct"."public_id", "ct"."name", "ct"."code", "ct"."category", "ct"."requires_assessment", "ct"."requires_inventory", "ct"."default_visit_frequency_days", "ct"."assessment_frequency_days", "ct"."kpi_targets", "t"."name"
  ORDER BY "ct"."tenant_id", "ct"."sort_order", "ct"."name";



CREATE OR REPLACE TRIGGER "set_updated_at_advisor_assignments" BEFORE UPDATE ON "public"."advisor_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_advisor_client_assignments" BEFORE UPDATE ON "public"."advisor_client_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_order_items_update_order_totals" AFTER INSERT OR DELETE OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_order_totals_from_items"();



CREATE OR REPLACE TRIGGER "trg_order_items_updated_at" BEFORE UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_order_items_updated_at"();



CREATE OR REPLACE TRIGGER "trg_order_items_validate_calculations" BEFORE INSERT OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."validate_order_item_calculations"();



CREATE OR REPLACE TRIGGER "trg_order_items_validate_metadata" BEFORE INSERT OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."validate_order_item_metadata"();



CREATE OR REPLACE TRIGGER "trg_order_items_validate_tenant" BEFORE INSERT OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."validate_order_item_tenant_consistency"();



CREATE OR REPLACE TRIGGER "trg_visit_order_items_update_order_totals" AFTER INSERT OR DELETE OR UPDATE ON "public"."visit_order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_visit_order_totals_from_items"();



CREATE OR REPLACE TRIGGER "trg_visit_order_items_updated_at" BEFORE UPDATE ON "public"."visit_order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_visit_order_items_updated_at"();



CREATE OR REPLACE TRIGGER "trg_visit_order_items_validate_calculations" BEFORE INSERT OR UPDATE ON "public"."visit_order_items" FOR EACH ROW EXECUTE FUNCTION "public"."validate_visit_order_item_calculations"();



CREATE OR REPLACE TRIGGER "trg_visit_order_items_validate_metadata" BEFORE INSERT OR UPDATE ON "public"."visit_order_items" FOR EACH ROW EXECUTE FUNCTION "public"."validate_visit_order_item_metadata"();



CREATE OR REPLACE TRIGGER "trg_visit_order_items_validate_tenant" BEFORE INSERT OR UPDATE ON "public"."visit_order_items" FOR EACH ROW EXECUTE FUNCTION "public"."validate_visit_order_item_tenant_consistency"();



CREATE OR REPLACE TRIGGER "trigger_auto_generate_order_number" BEFORE INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."auto_generate_order_number"();



CREATE OR REPLACE TRIGGER "trigger_brand_role_soft_delete_cascade" AFTER UPDATE ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_brand_role_soft_delete"();



CREATE OR REPLACE TRIGGER "trigger_brands_updated_at" BEFORE UPDATE ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_calculate_order_total" BEFORE INSERT OR UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_order_total"();



CREATE OR REPLACE TRIGGER "trigger_calculate_points_balance" BEFORE INSERT ON "public"."points_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_points_balance"();



CREATE OR REPLACE TRIGGER "trigger_calculate_price_variance" BEFORE INSERT OR UPDATE ON "public"."visit_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_price_variance"();



CREATE OR REPLACE TRIGGER "trigger_calculate_promotion_rule_reach" BEFORE INSERT OR UPDATE ON "public"."promotion_rules" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_promotion_rule_reach"();



CREATE OR REPLACE TRIGGER "trigger_calculate_visit_duration" BEFORE INSERT OR UPDATE ON "public"."visits" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_visit_duration"();



CREATE OR REPLACE TRIGGER "trigger_campaigns_updated_at" BEFORE UPDATE ON "public"."campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_check_manager_hierarchy" BEFORE INSERT OR UPDATE OF "manager_id" ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."check_manager_hierarchy"();



CREATE OR REPLACE TRIGGER "trigger_client_brand_memberships_updated_at" BEFORE UPDATE ON "public"."client_brand_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_client_invoice_data_updated_at" BEFORE UPDATE ON "public"."client_invoice_data" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_client_tier_assignments_updated_at" BEFORE UPDATE ON "public"."client_tier_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_client_types_updated_at" BEFORE UPDATE ON "public"."client_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_clients_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_commercial_structures_updated_at" BEFORE UPDATE ON "public"."commercial_structures" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_create_redemption_points_transaction" BEFORE INSERT ON "public"."reward_redemptions" FOR EACH ROW WHEN (("new"."points_transaction_id" IS NULL)) EXECUTE FUNCTION "public"."create_redemption_points_transaction"();



CREATE OR REPLACE TRIGGER "trigger_handle_promotion_rule_toggles" BEFORE INSERT OR UPDATE ON "public"."promotion_rules" FOR EACH ROW EXECUTE FUNCTION "public"."handle_promotion_rule_toggles"();



CREATE OR REPLACE TRIGGER "trigger_mark_transaction_reversed" AFTER INSERT ON "public"."points_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."mark_transaction_reversed"();



CREATE OR REPLACE TRIGGER "trigger_markets_updated_at" BEFORE UPDATE ON "public"."markets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_points_transactions_updated_at" BEFORE UPDATE ON "public"."points_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_product_categories_updated_at" BEFORE UPDATE ON "public"."product_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_product_variants_updated_at" BEFORE UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_promotion_redemptions_updated_at" BEFORE UPDATE ON "public"."promotion_redemptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_promotion_rules_updated_at" BEFORE UPDATE ON "public"."promotion_rules" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_promotions_updated_at" BEFORE UPDATE ON "public"."promotions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_reward_redemptions_updated_at" BEFORE UPDATE ON "public"."reward_redemptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_rewards_updated_at" BEFORE UPDATE ON "public"."rewards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_sync_email_from_clients_to_auth" AFTER UPDATE OF "email" ON "public"."clients" FOR EACH ROW WHEN ((("old"."email")::"text" IS DISTINCT FROM ("new"."email")::"text")) EXECUTE FUNCTION "public"."sync_client_email"();



CREATE OR REPLACE TRIGGER "trigger_sync_email_from_profile" AFTER UPDATE OF "email" ON "public"."user_profiles" FOR EACH ROW WHEN ((("old"."email")::"text" IS DISTINCT FROM ("new"."email")::"text")) EXECUTE FUNCTION "public"."sync_user_profile_email"();



CREATE OR REPLACE TRIGGER "trigger_tenant_soft_delete_cascade" AFTER UPDATE ON "public"."tenants" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_tenant_soft_delete"();



CREATE OR REPLACE TRIGGER "trigger_tenants_updated_at" BEFORE UPDATE ON "public"."tenants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_tiers_updated_at" BEFORE UPDATE ON "public"."tiers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_campaign_budget_spent" AFTER INSERT OR DELETE OR UPDATE ON "public"."promotions" FOR EACH ROW EXECUTE FUNCTION "public"."update_campaign_budget_spent"();



CREATE OR REPLACE TRIGGER "trigger_update_membership_current_tier" AFTER INSERT OR DELETE OR UPDATE ON "public"."client_tier_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."update_membership_current_tier"();



CREATE OR REPLACE TRIGGER "trigger_update_membership_points" AFTER INSERT ON "public"."points_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_membership_points"();



CREATE OR REPLACE TRIGGER "trigger_update_promotion_usage" AFTER INSERT OR DELETE OR UPDATE ON "public"."promotion_redemptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_promotion_usage"();



CREATE OR REPLACE TRIGGER "trigger_update_reward_usage_count" AFTER INSERT OR DELETE ON "public"."reward_redemptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_reward_usage_count"();



CREATE OR REPLACE TRIGGER "trigger_update_visit_workflow_status" AFTER INSERT OR DELETE ON "public"."visit_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_visit_workflow_status"();



CREATE OR REPLACE TRIGGER "trigger_update_visit_workflow_status_communication" AFTER INSERT OR DELETE ON "public"."visit_communication_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_visit_workflow_status_communication"();



CREATE OR REPLACE TRIGGER "trigger_update_visit_workflow_status_inventory" AFTER INSERT OR DELETE ON "public"."visit_inventories" FOR EACH ROW EXECUTE FUNCTION "public"."update_visit_workflow_status_inventory"();



CREATE OR REPLACE TRIGGER "trigger_update_visit_workflow_status_orders" AFTER INSERT OR DELETE ON "public"."visit_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_visit_workflow_status_orders"();



CREATE OR REPLACE TRIGGER "trigger_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_user_roles_updated_at" BEFORE UPDATE ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_validate_campaign_data" BEFORE INSERT OR UPDATE ON "public"."campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."validate_campaign_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_client_brand_membership_data" BEFORE INSERT OR UPDATE ON "public"."client_brand_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."validate_client_brand_membership_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_client_data" BEFORE INSERT OR UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."validate_client_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_client_invoice_data" BEFORE INSERT OR UPDATE ON "public"."client_invoice_data" FOR EACH ROW EXECUTE FUNCTION "public"."validate_client_invoice_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_client_tier_assignment_data" BEFORE INSERT OR UPDATE ON "public"."client_tier_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."validate_client_tier_assignment_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_client_type_data" BEFORE INSERT OR UPDATE ON "public"."client_types" FOR EACH ROW EXECUTE FUNCTION "public"."validate_client_type_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_commercial_structure_data" BEFORE INSERT OR UPDATE ON "public"."commercial_structures" FOR EACH ROW EXECUTE FUNCTION "public"."validate_commercial_structure_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_current_tier_assignment_unique" BEFORE INSERT OR UPDATE ON "public"."client_tier_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."validate_current_tier_assignment_unique"();



CREATE OR REPLACE TRIGGER "trigger_validate_default_tier_unique" BEFORE INSERT OR UPDATE ON "public"."tiers" FOR EACH ROW EXECUTE FUNCTION "public"."validate_default_tier_unique"();



CREATE OR REPLACE TRIGGER "trigger_validate_default_variant_unique" BEFORE INSERT OR UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."validate_default_variant_unique"();



CREATE OR REPLACE TRIGGER "trigger_validate_market_data" BEFORE INSERT OR UPDATE ON "public"."markets" FOR EACH ROW EXECUTE FUNCTION "public"."validate_market_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_order_data" BEFORE INSERT OR UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."validate_order_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_points_transaction_data" BEFORE INSERT OR UPDATE ON "public"."points_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."validate_points_transaction_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_preferred_invoice_data_unique" BEFORE INSERT OR UPDATE ON "public"."client_invoice_data" FOR EACH ROW EXECUTE FUNCTION "public"."validate_preferred_invoice_data_unique"();



CREATE OR REPLACE TRIGGER "trigger_validate_primary_brand_unique" BEFORE INSERT OR UPDATE ON "public"."client_brand_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."validate_primary_brand_unique"();



CREATE OR REPLACE TRIGGER "trigger_validate_product_category_data" BEFORE INSERT OR UPDATE ON "public"."product_categories" FOR EACH ROW EXECUTE FUNCTION "public"."validate_product_category_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_product_data" BEFORE INSERT OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."validate_product_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_product_variant_data" BEFORE INSERT OR UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."validate_product_variant_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_promotion_data" BEFORE INSERT OR UPDATE ON "public"."promotions" FOR EACH ROW EXECUTE FUNCTION "public"."validate_promotion_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_promotion_redemption_data" BEFORE INSERT OR UPDATE ON "public"."promotion_redemptions" FOR EACH ROW EXECUTE FUNCTION "public"."validate_promotion_redemption_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_promotion_rule_data" BEFORE INSERT OR UPDATE ON "public"."promotion_rules" FOR EACH ROW EXECUTE FUNCTION "public"."validate_promotion_rule_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_reward_data" BEFORE INSERT OR UPDATE ON "public"."rewards" FOR EACH ROW EXECUTE FUNCTION "public"."validate_reward_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_reward_redemption_data" BEFORE INSERT OR UPDATE ON "public"."reward_redemptions" FOR EACH ROW EXECUTE FUNCTION "public"."validate_reward_redemption_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_role_expiration_critical" BEFORE INSERT OR UPDATE OF "status", "expires_at" ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."validate_role_expiration_on_critical_ops"();



CREATE OR REPLACE TRIGGER "trigger_validate_single_primary_role" BEFORE INSERT OR UPDATE ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."validate_single_primary_role"();



CREATE OR REPLACE TRIGGER "trigger_validate_tier_data" BEFORE INSERT OR UPDATE ON "public"."tiers" FOR EACH ROW EXECUTE FUNCTION "public"."validate_tier_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_visit_assessment_data" BEFORE INSERT OR UPDATE ON "public"."visit_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."validate_visit_assessment_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_visit_communication_plan_data" BEFORE INSERT OR UPDATE ON "public"."visit_communication_plans" FOR EACH ROW EXECUTE FUNCTION "public"."validate_visit_communication_plan_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_visit_data" BEFORE INSERT OR UPDATE ON "public"."visits" FOR EACH ROW EXECUTE FUNCTION "public"."validate_visit_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_visit_inventory_data" BEFORE INSERT OR UPDATE ON "public"."visit_inventories" FOR EACH ROW EXECUTE FUNCTION "public"."validate_visit_inventory_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_visit_order_data" BEFORE INSERT OR UPDATE ON "public"."visit_orders" FOR EACH ROW EXECUTE FUNCTION "public"."validate_visit_order_data"();



CREATE OR REPLACE TRIGGER "trigger_validate_zone_data" BEFORE INSERT OR UPDATE ON "public"."zones" FOR EACH ROW EXECUTE FUNCTION "public"."validate_zone_data"();



CREATE OR REPLACE TRIGGER "trigger_visit_assessments_updated_at" BEFORE UPDATE ON "public"."visit_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_visit_communication_plans_updated_at" BEFORE UPDATE ON "public"."visit_communication_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_visit_inventories_updated_at" BEFORE UPDATE ON "public"."visit_inventories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_visit_orders_updated_at" BEFORE UPDATE ON "public"."visit_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_visits_updated_at" BEFORE UPDATE ON "public"."visits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_zones_updated_at" BEFORE UPDATE ON "public"."zones" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."advisor_assignments"
    ADD CONSTRAINT "advisor_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."advisor_assignments"
    ADD CONSTRAINT "advisor_assignments_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advisor_assignments"
    ADD CONSTRAINT "advisor_assignments_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."advisor_client_assignments"
    ADD CONSTRAINT "advisor_client_assignments_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advisor_client_assignments"
    ADD CONSTRAINT "advisor_client_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."advisor_client_assignments"
    ADD CONSTRAINT "advisor_client_assignments_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advisor_client_assignments"
    ADD CONSTRAINT "advisor_client_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advisor_client_assignments"
    ADD CONSTRAINT "advisor_client_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_brand_memberships"
    ADD CONSTRAINT "client_brand_memberships_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."client_brand_memberships"
    ADD CONSTRAINT "client_brand_memberships_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_brand_memberships"
    ADD CONSTRAINT "client_brand_memberships_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_brand_memberships"
    ADD CONSTRAINT "client_brand_memberships_current_tier_id_fkey" FOREIGN KEY ("current_tier_id") REFERENCES "public"."tiers"("id");



ALTER TABLE ONLY "public"."client_brand_memberships"
    ADD CONSTRAINT "client_brand_memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_invoice_data"
    ADD CONSTRAINT "client_invoice_data_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_invoice_data"
    ADD CONSTRAINT "client_invoice_data_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tier_assignments"
    ADD CONSTRAINT "client_tier_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."client_tier_assignments"
    ADD CONSTRAINT "client_tier_assignments_client_brand_membership_id_fkey" FOREIGN KEY ("client_brand_membership_id") REFERENCES "public"."client_brand_memberships"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tier_assignments"
    ADD CONSTRAINT "client_tier_assignments_previous_tier_id_fkey" FOREIGN KEY ("previous_tier_id") REFERENCES "public"."tiers"("id");



ALTER TABLE ONLY "public"."client_tier_assignments"
    ADD CONSTRAINT "client_tier_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tier_assignments"
    ADD CONSTRAINT "client_tier_assignments_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id");



ALTER TABLE ONLY "public"."client_types"
    ADD CONSTRAINT "client_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_client_type_id_fkey" FOREIGN KEY ("client_type_id") REFERENCES "public"."client_types"("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_commercial_structure_id_fkey" FOREIGN KEY ("commercial_structure_id") REFERENCES "public"."commercial_structures"("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id");



ALTER TABLE ONLY "public"."commercial_structures"
    ADD CONSTRAINT "commercial_structures_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "fk_order_items_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "fk_order_items_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "fk_order_items_product_variant" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "fk_order_items_substitute_product" FOREIGN KEY ("substitute_product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "fk_order_items_substitute_variant" FOREIGN KEY ("substitute_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "fk_order_items_tenant" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_order_items"
    ADD CONSTRAINT "fk_visit_order_items_approved_by" FOREIGN KEY ("approved_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."visit_order_items"
    ADD CONSTRAINT "fk_visit_order_items_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."visit_order_items"
    ADD CONSTRAINT "fk_visit_order_items_product_variant" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."visit_order_items"
    ADD CONSTRAINT "fk_visit_order_items_tenant" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_order_items"
    ADD CONSTRAINT "fk_visit_order_items_visit_order" FOREIGN KEY ("visit_order_id") REFERENCES "public"."visit_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."markets"
    ADD CONSTRAINT "markets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_client_invoice_data_id_fkey" FOREIGN KEY ("client_invoice_data_id") REFERENCES "public"."client_invoice_data"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_commercial_structure_id_fkey" FOREIGN KEY ("commercial_structure_id") REFERENCES "public"."commercial_structures"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."points_transactions"
    ADD CONSTRAINT "points_transactions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."points_transactions"
    ADD CONSTRAINT "points_transactions_client_brand_membership_id_fkey" FOREIGN KEY ("client_brand_membership_id") REFERENCES "public"."client_brand_memberships"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."points_transactions"
    ADD CONSTRAINT "points_transactions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."points_transactions"
    ADD CONSTRAINT "points_transactions_reversal_of_fkey" FOREIGN KEY ("reversal_of") REFERENCES "public"."points_transactions"("id");



ALTER TABLE ONLY "public"."points_transactions"
    ADD CONSTRAINT "points_transactions_reversed_by_fkey" FOREIGN KEY ("reversed_by") REFERENCES "public"."points_transactions"("id");



ALTER TABLE ONLY "public"."points_transactions"
    ADD CONSTRAINT "points_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "public"."product_categories"("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotion_redemptions"
    ADD CONSTRAINT "promotion_redemptions_applied_by_fkey" FOREIGN KEY ("applied_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."promotion_redemptions"
    ADD CONSTRAINT "promotion_redemptions_client_brand_membership_id_fkey" FOREIGN KEY ("client_brand_membership_id") REFERENCES "public"."client_brand_memberships"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotion_redemptions"
    ADD CONSTRAINT "promotion_redemptions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id");



ALTER TABLE ONLY "public"."promotion_redemptions"
    ADD CONSTRAINT "promotion_redemptions_reversed_by_fkey" FOREIGN KEY ("reversed_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."promotion_redemptions"
    ADD CONSTRAINT "promotion_redemptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotion_redemptions"
    ADD CONSTRAINT "promotion_redemptions_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."promotion_rules"
    ADD CONSTRAINT "promotion_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."promotion_rules"
    ADD CONSTRAINT "promotion_rules_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotion_rules"
    ADD CONSTRAINT "promotion_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_client_brand_membership_id_fkey" FOREIGN KEY ("client_brand_membership_id") REFERENCES "public"."client_brand_memberships"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_points_transaction_id_fkey" FOREIGN KEY ("points_transaction_id") REFERENCES "public"."points_transactions"("id");



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_redeemed_by_fkey" FOREIGN KEY ("redeemed_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_refund_transaction_id_fkey" FOREIGN KEY ("refund_transaction_id") REFERENCES "public"."points_transactions"("id");



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id");



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reward_redemptions"
    ADD CONSTRAINT "reward_redemptions_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");



ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id");



ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tiers"
    ADD CONSTRAINT "tiers_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tiers"
    ADD CONSTRAINT "tiers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."user_profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_assessments"
    ADD CONSTRAINT "visit_assessments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."visit_assessments"
    ADD CONSTRAINT "visit_assessments_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");



ALTER TABLE ONLY "public"."visit_assessments"
    ADD CONSTRAINT "visit_assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_assessments"
    ADD CONSTRAINT "visit_assessments_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_communication_plans"
    ADD CONSTRAINT "visit_communication_plans_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id");



ALTER TABLE ONLY "public"."visit_communication_plans"
    ADD CONSTRAINT "visit_communication_plans_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id");



ALTER TABLE ONLY "public"."visit_communication_plans"
    ADD CONSTRAINT "visit_communication_plans_installed_by_fkey" FOREIGN KEY ("installed_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."visit_communication_plans"
    ADD CONSTRAINT "visit_communication_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_communication_plans"
    ADD CONSTRAINT "visit_communication_plans_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_inventories"
    ADD CONSTRAINT "visit_inventories_counted_by_fkey" FOREIGN KEY ("counted_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."visit_inventories"
    ADD CONSTRAINT "visit_inventories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."visit_inventories"
    ADD CONSTRAINT "visit_inventories_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");



ALTER TABLE ONLY "public"."visit_inventories"
    ADD CONSTRAINT "visit_inventories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_inventories"
    ADD CONSTRAINT "visit_inventories_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."visit_inventories"
    ADD CONSTRAINT "visit_inventories_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_orders"
    ADD CONSTRAINT "visit_orders_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."visit_orders"
    ADD CONSTRAINT "visit_orders_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."visit_orders"
    ADD CONSTRAINT "visit_orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."visit_orders"
    ADD CONSTRAINT "visit_orders_client_invoice_data_id_fkey" FOREIGN KEY ("client_invoice_data_id") REFERENCES "public"."client_invoice_data"("id");



ALTER TABLE ONLY "public"."visit_orders"
    ADD CONSTRAINT "visit_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_orders"
    ADD CONSTRAINT "visit_orders_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id");



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."zones"
    ADD CONSTRAINT "zones_parent_zone_id_fkey" FOREIGN KEY ("parent_zone_id") REFERENCES "public"."zones"("id");



ALTER TABLE ONLY "public"."zones"
    ADD CONSTRAINT "zones_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



CREATE POLICY "Admin and brand managers can manage advisor assignments" ON "public"."advisor_assignments" USING (("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['admin'::"public"."user_role_type_enum", 'brand_manager'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum")))));



CREATE POLICY "Admin and brand managers can manage client assignments" ON "public"."advisor_client_assignments" USING (("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['admin'::"public"."user_role_type_enum", 'brand_manager'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum")))));



CREATE POLICY "Advisors can view their assigned clients" ON "public"."advisor_client_assignments" FOR SELECT USING (("advisor_id" IN ( SELECT "up"."id"
   FROM "public"."user_profiles" "up"
  WHERE ("up"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow DELETE on brands for same tenant" ON "public"."brands" FOR DELETE TO "authenticated" USING ((("tenant_id")::"text" = ("auth"."jwt"() ->> 'tenant_id'::"text")));



CREATE POLICY "Allow UPDATE on brands for same tenant" ON "public"."brands" FOR UPDATE TO "authenticated" USING ((("tenant_id")::"text" = ("auth"."jwt"() ->> 'tenant_id'::"text"))) WITH CHECK ((("tenant_id")::"text" = ("auth"."jwt"() ->> 'tenant_id'::"text")));



CREATE POLICY "Users can view advisor assignments in their tenant" ON "public"."advisor_assignments" FOR SELECT USING (("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE ("up"."user_id" = "auth"."uid"()))));



CREATE POLICY "admins_delete_campaigns" ON "public"."campaigns" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_client_brand_memberships" ON "public"."client_brand_memberships" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_client_invoice_data" ON "public"."client_invoice_data" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_client_tier_assignments" ON "public"."client_tier_assignments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_client_types" ON "public"."client_types" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_clients" ON "public"."clients" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_commercial_structures" ON "public"."commercial_structures" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_markets" ON "public"."markets" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_product_categories" ON "public"."product_categories" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_product_variants" ON "public"."product_variants" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_products" ON "public"."products" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_promotion_rules" ON "public"."promotion_rules" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_promotions" ON "public"."promotions" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_rewards" ON "public"."rewards" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_tenants" ON "public"."tenants" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_tiers" ON "public"."tiers" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_user_roles" ON "public"."user_roles" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_visit_assessments" ON "public"."visit_assessments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_visit_communication_plans" ON "public"."visit_communication_plans" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_visit_inventories" ON "public"."visit_inventories" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_visit_orders" ON "public"."visit_orders" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_visits" ON "public"."visits" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_delete_zones" ON "public"."zones" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_campaigns" ON "public"."campaigns" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_client_brand_memberships" ON "public"."client_brand_memberships" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_client_invoice_data" ON "public"."client_invoice_data" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_client_tier_assignments" ON "public"."client_tier_assignments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_client_types" ON "public"."client_types" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_clients" ON "public"."clients" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_commercial_structures" ON "public"."commercial_structures" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_markets" ON "public"."markets" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_orders" ON "public"."orders" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_points_transactions" ON "public"."points_transactions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_product_categories" ON "public"."product_categories" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_product_variants" ON "public"."product_variants" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_products" ON "public"."products" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_promotion_redemptions" ON "public"."promotion_redemptions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_promotion_rules" ON "public"."promotion_rules" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_promotions" ON "public"."promotions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_reward_redemptions" ON "public"."reward_redemptions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_rewards" ON "public"."rewards" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_tenants" ON "public"."tenants" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_tiers" ON "public"."tiers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_user_roles" ON "public"."user_roles" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_visit_assessments" ON "public"."visit_assessments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_visit_communication_plans" ON "public"."visit_communication_plans" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_visit_inventories" ON "public"."visit_inventories" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_visit_orders" ON "public"."visit_orders" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_visits" ON "public"."visits" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_insert_zones" ON "public"."zones" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_campaigns" ON "public"."campaigns" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_client_brand_memberships" ON "public"."client_brand_memberships" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_client_invoice_data" ON "public"."client_invoice_data" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_client_tier_assignments" ON "public"."client_tier_assignments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_client_types" ON "public"."client_types" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_clients" ON "public"."clients" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_commercial_structures" ON "public"."commercial_structures" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_markets" ON "public"."markets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_orders" ON "public"."orders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_points_transactions" ON "public"."points_transactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_product_categories" ON "public"."product_categories" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_product_variants" ON "public"."product_variants" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_products" ON "public"."products" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_promotion_redemptions" ON "public"."promotion_redemptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_promotion_rules" ON "public"."promotion_rules" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_promotions" ON "public"."promotions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_reward_redemptions" ON "public"."reward_redemptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_rewards" ON "public"."rewards" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_tenants" ON "public"."tenants" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_tiers" ON "public"."tiers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_user_roles" ON "public"."user_roles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_visit_assessments" ON "public"."visit_assessments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_visit_communication_plans" ON "public"."visit_communication_plans" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_visit_inventories" ON "public"."visit_inventories" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_visit_orders" ON "public"."visit_orders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_visits" ON "public"."visits" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_select_zones" ON "public"."zones" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_campaigns" ON "public"."campaigns" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_client_brand_memberships" ON "public"."client_brand_memberships" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_client_invoice_data" ON "public"."client_invoice_data" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_client_tier_assignments" ON "public"."client_tier_assignments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_client_types" ON "public"."client_types" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_clients" ON "public"."clients" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_commercial_structures" ON "public"."commercial_structures" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_markets" ON "public"."markets" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_orders" ON "public"."orders" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_points_transactions" ON "public"."points_transactions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_product_categories" ON "public"."product_categories" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_product_variants" ON "public"."product_variants" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_products" ON "public"."products" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_promotion_redemptions" ON "public"."promotion_redemptions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_promotion_rules" ON "public"."promotion_rules" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_promotions" ON "public"."promotions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_reward_redemptions" ON "public"."reward_redemptions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_rewards" ON "public"."rewards" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_tenants" ON "public"."tenants" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_tiers" ON "public"."tiers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_user_roles" ON "public"."user_roles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_visit_assessments" ON "public"."visit_assessments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_visit_communication_plans" ON "public"."visit_communication_plans" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_visit_inventories" ON "public"."visit_inventories" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_visit_orders" ON "public"."visit_orders" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_visits" ON "public"."visits" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "admins_update_zones" ON "public"."zones" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'global'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



ALTER TABLE "public"."advisor_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."advisor_client_assignments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "advisors_manage_visit_assessments" ON "public"."visit_assessments" USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_manage_visit_communication_plans" ON "public"."visit_communication_plans" USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_manage_visit_inventories" ON "public"."visit_inventories" USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_manage_visit_orders" ON "public"."visit_orders" USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_manage_visits" ON "public"."visits" USING ((("deleted_at" IS NULL) AND ("advisor_id" IN ( SELECT "ur"."user_profile_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_select_client_tier_assignments" ON "public"."client_tier_assignments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
                  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'advisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_select_orders" ON "public"."orders" FOR SELECT USING ((("deleted_at" IS NULL) AND (("assigned_to" IN ( SELECT "ur"."user_profile_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'advisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) OR ("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
                  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'advisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("c"."deleted_at" IS NULL)))))));



CREATE POLICY "advisors_select_points_transactions" ON "public"."points_transactions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
                  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'advisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_select_promotion_redemptions" ON "public"."promotion_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("applied_by" IN ( SELECT "ur"."user_profile_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'advisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_select_reward_redemptions" ON "public"."reward_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
                  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'advisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_select_visit_assessments" ON "public"."visit_assessments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_select_visit_communication_plans" ON "public"."visit_communication_plans" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_select_visit_inventories" ON "public"."visit_inventories" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_select_visit_orders" ON "public"."visit_orders" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "advisors_select_visits" ON "public"."visits" FOR SELECT USING ((("deleted_at" IS NULL) AND ("advisor_id" IN ( SELECT "ur"."user_profile_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['advisor'::"public"."user_role_type_enum", 'supervisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_campaigns" ON "public"."campaigns" USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_client_brand_memberships" ON "public"."client_brand_memberships" USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_client_tier_assignments" ON "public"."client_tier_assignments" USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM "public"."client_brand_memberships" "cbm"
  WHERE (("cbm"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_points_transactions" ON "public"."points_transactions" USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM "public"."client_brand_memberships" "cbm"
  WHERE (("cbm"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_product_categories" ON "public"."product_categories" USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_product_variants" ON "public"."product_variants" USING ((("deleted_at" IS NULL) AND ("product_id" IN ( SELECT "p"."id"
   FROM "public"."products" "p"
  WHERE (("p"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_products" ON "public"."products" USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_promotion_rules" ON "public"."promotion_rules" USING ((("deleted_at" IS NULL) AND ("promotion_id" IN ( SELECT "p"."id"
   FROM "public"."promotions" "p"
  WHERE (("p"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_promotions" ON "public"."promotions" USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_reward_redemptions" ON "public"."reward_redemptions" USING ((("deleted_at" IS NULL) AND ("reward_id" IN ( SELECT "r"."id"
   FROM "public"."rewards" "r"
  WHERE (("r"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("r"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_rewards" ON "public"."rewards" USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_roles" ON "public"."user_roles" USING ((("deleted_at" IS NULL) AND ("role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_tiers" ON "public"."tiers" USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_manage_visit_communication_plans" ON "public"."visit_communication_plans" USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_campaigns" ON "public"."campaigns" FOR SELECT USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_client_brand_memberships" ON "public"."client_brand_memberships" FOR SELECT USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_client_invoice_data" ON "public"."client_invoice_data" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "cbm"."client_id"
   FROM "public"."client_brand_memberships" "cbm"
  WHERE (("cbm"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_client_tier_assignments" ON "public"."client_tier_assignments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM "public"."client_brand_memberships" "cbm"
  WHERE (("cbm"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_client_types" ON "public"."client_types" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "b"."tenant_id"
   FROM (("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
     JOIN "public"."brands" "b" ON (("ur"."brand_id" = "b"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_clients" ON "public"."clients" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "b"."tenant_id"
   FROM (("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
     JOIN "public"."brands" "b" ON (("ur"."brand_id" = "b"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_commercial_structures" ON "public"."commercial_structures" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "b"."tenant_id"
   FROM (("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
     JOIN "public"."brands" "b" ON (("ur"."brand_id" = "b"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_markets" ON "public"."markets" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "b"."tenant_id"
   FROM (("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
     JOIN "public"."brands" "b" ON (("ur"."brand_id" = "b"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_orders" ON "public"."orders" FOR SELECT USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_points_transactions" ON "public"."points_transactions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM "public"."client_brand_memberships" "cbm"
  WHERE (("cbm"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_product_categories" ON "public"."product_categories" FOR SELECT USING ((("deleted_at" IS NULL) AND (("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) OR (("brand_id" IS NULL) AND ("tenant_id" IN ( SELECT "b"."tenant_id"
   FROM (("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
     JOIN "public"."brands" "b" ON (("ur"."brand_id" = "b"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL))))))));



CREATE POLICY "brand_managers_select_product_variants" ON "public"."product_variants" FOR SELECT USING ((("deleted_at" IS NULL) AND ("product_id" IN ( SELECT "p"."id"
   FROM "public"."products" "p"
  WHERE (("p"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_products" ON "public"."products" FOR SELECT USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_promotion_redemptions" ON "public"."promotion_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("promotion_id" IN ( SELECT "p"."id"
   FROM "public"."promotions" "p"
  WHERE (("p"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_promotion_rules" ON "public"."promotion_rules" FOR SELECT USING ((("deleted_at" IS NULL) AND ("promotion_id" IN ( SELECT "p"."id"
   FROM "public"."promotions" "p"
  WHERE (("p"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_promotions" ON "public"."promotions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_reward_redemptions" ON "public"."reward_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("reward_id" IN ( SELECT "r"."id"
   FROM "public"."rewards" "r"
  WHERE (("r"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("r"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_rewards" ON "public"."rewards" FOR SELECT USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_tenants" ON "public"."tenants" FOR SELECT USING ((("deleted_at" IS NULL) AND ("id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_tiers" ON "public"."tiers" FOR SELECT USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_visit_assessments" ON "public"."visit_assessments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("product_id" IN ( SELECT "p"."id"
   FROM "public"."products" "p"
  WHERE (("p"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_visit_communication_plans" ON "public"."visit_communication_plans" FOR SELECT USING ((("deleted_at" IS NULL) AND ("brand_id" IN ( SELECT "ur"."brand_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_visit_inventories" ON "public"."visit_inventories" FOR SELECT USING ((("deleted_at" IS NULL) AND ("product_id" IN ( SELECT "p"."id"
   FROM "public"."products" "p"
  WHERE (("p"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_visits" ON "public"."visits" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "cbm"."client_id"
   FROM "public"."client_brand_memberships" "cbm"
  WHERE (("cbm"."brand_id" IN ( SELECT "ur"."brand_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL))))));



CREATE POLICY "brand_managers_select_zones" ON "public"."zones" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "b"."tenant_id"
   FROM (("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
     JOIN "public"."brands" "b" ON (("ur"."brand_id" = "b"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL))))));



ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "brands_public_read" ON "public"."brands" FOR SELECT TO "anon" USING (("deleted_at" IS NULL));



CREATE POLICY "brands_tenant_access" ON "public"."brands" TO "authenticated" USING (("tenant_id" = 'fe0f429d-2d83-4738-af65-32c655cef656'::"uuid")) WITH CHECK (("tenant_id" = 'fe0f429d-2d83-4738-af65-32c655cef656'::"uuid"));



ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_brand_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_invoice_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tier_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clients_can_read_own_memberships" ON "public"."client_brand_memberships" FOR SELECT TO "authenticated" USING (("client_id" IN ( SELECT "clients"."id"
   FROM "public"."clients"
  WHERE (("clients"."user_id" = "auth"."uid"()) AND ("clients"."deleted_at" IS NULL)))));



CREATE POLICY "clients_can_request_membership" ON "public"."client_brand_memberships" FOR INSERT TO "authenticated" WITH CHECK ((("client_id" IN ( SELECT "clients"."id"
   FROM "public"."clients"
  WHERE (("clients"."user_id" = "auth"."uid"()) AND ("clients"."deleted_at" IS NULL)))) AND ("membership_status" = 'pending'::"public"."membership_status_enum") AND ("brand_id" IN ( SELECT "b"."id"
   FROM ("public"."brands" "b"
     JOIN "public"."clients" "c" ON (("c"."tenant_id" = "b"."tenant_id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("b"."status" = 'active'::"public"."brand_status_enum"))))));



CREATE POLICY "clients_insert_own_orders" ON "public"."orders" FOR INSERT WITH CHECK (("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL)))));



CREATE POLICY "clients_insert_policy" ON "public"."clients" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("deleted_at" IS NULL)));



CREATE POLICY "clients_manage_own_invoice_data" ON "public"."client_invoice_data" USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_assigned_client_type" ON "public"."client_types" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND (EXISTS ( SELECT 1
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."client_type_id" = "client_types"."id") AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_assigned_commercial_structure" ON "public"."commercial_structures" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND (EXISTS ( SELECT 1
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."commercial_structure_id" = "commercial_structures"."id") AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_assigned_market" ON "public"."markets" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND (EXISTS ( SELECT 1
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."market_id" = "markets"."id") AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_own_invoice_data" ON "public"."client_invoice_data" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_own_memberships" ON "public"."client_brand_memberships" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_own_orders" ON "public"."orders" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_own_points_transactions" ON "public"."points_transactions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_own_profile" ON "public"."clients" FOR SELECT USING ((("deleted_at" IS NULL) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "clients_select_own_promotion_redemptions" ON "public"."promotion_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_own_reward_redemptions" ON "public"."reward_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_own_tier_assignments" ON "public"."client_tier_assignments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_policy" ON "public"."clients" FOR SELECT USING (("deleted_at" IS NULL));



CREATE POLICY "clients_select_product_categories" ON "public"."product_categories" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND (("brand_id" IN ( SELECT "cbm"."brand_id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."membership_status" = 'active'::"public"."membership_status_enum") AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))) OR (("brand_id" IS NULL) AND ("tenant_id" IN ( SELECT "cbm"."tenant_id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."membership_status" = 'active'::"public"."membership_status_enum") AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))))));



CREATE POLICY "clients_select_product_variants" ON "public"."product_variants" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("product_id" IN ( SELECT "p"."id"
   FROM "public"."products" "p"
  WHERE (("p"."brand_id" IN ( SELECT "cbm"."brand_id"
           FROM ("public"."client_brand_memberships" "cbm"
             JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
          WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."membership_status" = 'active'::"public"."membership_status_enum") AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL) AND ("p"."is_active" = true))))));



CREATE POLICY "clients_select_products" ON "public"."products" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("brand_id" IN ( SELECT "cbm"."brand_id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."membership_status" = 'active'::"public"."membership_status_enum") AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_rewards" ON "public"."rewards" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND (("valid_until" IS NULL) OR ("valid_until" >= CURRENT_DATE)) AND ("valid_from" <= CURRENT_DATE) AND (("usage_limit_total" IS NULL) OR ("usage_count_total" < "usage_limit_total")) AND ("brand_id" IN ( SELECT "cbm"."brand_id"
   FROM (("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."tiers" "t" ON (("cbm"."current_tier_id" = "t"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."membership_status" = 'active'::"public"."membership_status_enum") AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND (("rewards"."tier_requirements" IS NULL) OR (((NOT ("rewards"."tier_requirements" ? 'min_tier_level'::"text")) OR ("t"."tier_level" >= (("rewards"."tier_requirements" ->> 'min_tier_level'::"text"))::integer)) AND ((NOT ("rewards"."tier_requirements" ? 'allowed_tiers'::"text")) OR (("rewards"."tier_requirements" -> 'allowed_tiers'::"text") ? ("t"."code")::"text")) AND ((NOT ("rewards"."tier_requirements" ? 'exclusive_to_tier'::"text")) OR (("rewards"."tier_requirements" ->> 'exclusive_to_tier'::"text") = ("t"."code")::"text")))))))));



CREATE POLICY "clients_select_tiers" ON "public"."tiers" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("brand_id" IN ( SELECT "cbm"."brand_id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("cbm"."membership_status" = 'active'::"public"."membership_status_enum") AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_visit_assessments" ON "public"."visit_assessments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."client_id" IN ( SELECT "c"."id"
           FROM "public"."clients" "c"
          WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_visit_communication_plans" ON "public"."visit_communication_plans" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."client_id" IN ( SELECT "c"."id"
           FROM "public"."clients" "c"
          WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_visit_inventories" ON "public"."visit_inventories" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."client_id" IN ( SELECT "c"."id"
           FROM "public"."clients" "c"
          WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_visit_orders" ON "public"."visit_orders" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."client_id" IN ( SELECT "c"."id"
           FROM "public"."clients" "c"
          WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "clients_select_visits" ON "public"."visits" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_tenant_access" ON "public"."clients" TO "authenticated" USING (("tenant_id" = 'fe0f429d-2d83-4738-af65-32c655cef656'::"uuid")) WITH CHECK (("tenant_id" = 'fe0f429d-2d83-4738-af65-32c655cef656'::"uuid"));



CREATE POLICY "clients_update_own_draft_orders" ON "public"."orders" FOR UPDATE USING ((("deleted_at" IS NULL) AND ("order_status" = 'draft'::"public"."order_status_enum") AND ("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_update_own_memberships" ON "public"."client_brand_memberships" FOR UPDATE USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "clients_update_own_profile" ON "public"."clients" FOR UPDATE USING ((("deleted_at" IS NULL) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "clients_update_policy" ON "public"."clients" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("deleted_at" IS NULL))) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."commercial_structures" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "field_users_manage_client_invoice_data" ON "public"."client_invoice_data" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_assigned_zones" ON "public"."zones" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND (EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("ur"."tenant_id" = "zones"."tenant_id"))))));



CREATE POLICY "field_users_select_campaigns" ON "public"."campaigns" FOR SELECT USING ((("deleted_at" IS NULL) AND ("status" = 'active'::"public"."campaign_status_enum") AND ("start_date" <= CURRENT_DATE) AND ("end_date" >= CURRENT_DATE) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_client_brand_memberships" ON "public"."client_brand_memberships" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "c"."id"
   FROM (("public"."clients" "c"
     JOIN "public"."user_roles" "ur" ON (("c"."tenant_id" = "ur"."tenant_id")))
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_client_invoice_data" ON "public"."client_invoice_data" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_client_types" ON "public"."client_types" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_clients" ON "public"."clients" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_commercial_structures" ON "public"."commercial_structures" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_markets" ON "public"."markets" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_product_categories" ON "public"."product_categories" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ((("brand_id" IS NOT NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))) OR (("brand_id" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))))));



CREATE POLICY "field_users_select_product_variants" ON "public"."product_variants" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("product_id" IN ( SELECT "p"."id"
   FROM "public"."products" "p"
  WHERE (("p"."tenant_id" IN ( SELECT "ur"."tenant_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL) AND ("p"."is_active" = true))))));



CREATE POLICY "field_users_select_products" ON "public"."products" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_promotion_rules" ON "public"."promotion_rules" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("promotion_id" IN ( SELECT "p"."id"
   FROM "public"."promotions" "p"
  WHERE (("p"."status" = 'active'::"public"."promotion_status_enum") AND ("p"."start_date" <= CURRENT_DATE) AND ("p"."end_date" >= CURRENT_DATE) AND ("p"."tenant_id" IN ( SELECT "ur"."tenant_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
          WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("p"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_promotions" ON "public"."promotions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("status" = 'active'::"public"."promotion_status_enum") AND ("start_date" <= CURRENT_DATE) AND ("end_date" >= CURRENT_DATE) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_rewards" ON "public"."rewards" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND (("valid_until" IS NULL) OR ("valid_until" >= CURRENT_DATE)) AND ("valid_from" <= CURRENT_DATE) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_tenants" ON "public"."tenants" FOR SELECT USING ((("deleted_at" IS NULL) AND ("id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "field_users_select_tiers" ON "public"."tiers" FOR SELECT USING ((("deleted_at" IS NULL) AND ("is_active" = true) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['supervisor'::"public"."user_role_type_enum", 'advisor'::"public"."user_role_type_enum", 'market_analyst'::"public"."user_role_type_enum"])) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



ALTER TABLE "public"."markets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "orders_insert_policy" ON "public"."orders" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("deleted_at" IS NULL)));



CREATE POLICY "orders_select_policy" ON "public"."orders" FOR SELECT USING (("deleted_at" IS NULL));



CREATE POLICY "orders_update_policy" ON "public"."orders" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("deleted_at" IS NULL))) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."points_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "policy_order_items_admin_all" ON "public"."order_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."tenant_id" IS NULL) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."tenant_id" IS NULL) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "policy_order_items_advisor" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((("order_id" IN ( SELECT "o"."id"
   FROM "public"."orders" "o"
  WHERE (("o"."assigned_to" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("o"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



CREATE POLICY "policy_order_items_brand_manager" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((("product_id" IN ( SELECT "p"."id"
   FROM ("public"."products" "p"
     JOIN "public"."user_roles" "ur" ON (("ur"."brand_id" = "p"."brand_id")))
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



CREATE POLICY "policy_order_items_client_delete" ON "public"."order_items" FOR DELETE TO "authenticated" USING ((("order_id" IN ( SELECT "o"."id"
   FROM ("public"."orders" "o"
     JOIN "public"."clients" "c" ON (("c"."id" = "o"."client_id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("o"."order_status" = 'draft'::"public"."order_status_enum") AND ("o"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



CREATE POLICY "policy_order_items_client_insert" ON "public"."order_items" FOR INSERT TO "authenticated" WITH CHECK (("order_id" IN ( SELECT "o"."id"
   FROM ("public"."orders" "o"
     JOIN "public"."clients" "c" ON (("c"."id" = "o"."client_id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("o"."order_status" = 'draft'::"public"."order_status_enum") AND ("o"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))));



CREATE POLICY "policy_order_items_client_select" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((("order_id" IN ( SELECT "o"."id"
   FROM ("public"."orders" "o"
     JOIN "public"."clients" "c" ON (("c"."id" = "o"."client_id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("o"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



CREATE POLICY "policy_order_items_client_update" ON "public"."order_items" FOR UPDATE TO "authenticated" USING ((("order_id" IN ( SELECT "o"."id"
   FROM ("public"."orders" "o"
     JOIN "public"."clients" "c" ON (("c"."id" = "o"."client_id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("o"."order_status" = 'draft'::"public"."order_status_enum") AND ("o"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL))) WITH CHECK (("order_id" IN ( SELECT "o"."id"
   FROM ("public"."orders" "o"
     JOIN "public"."clients" "c" ON (("c"."id" = "o"."client_id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("o"."order_status" = 'draft'::"public"."order_status_enum") AND ("o"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))));



CREATE POLICY "policy_order_items_supervisor" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((("order_id" IN ( SELECT "o"."id"
   FROM ("public"."orders" "o"
     JOIN "public"."clients" "c" ON (("c"."id" = "o"."client_id")))
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
                   FROM "public"."user_profiles" "up"
                  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                           FROM ("public"."user_roles" "ur"
                             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("o"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



CREATE POLICY "policy_order_items_tenant_admin" ON "public"."order_items" TO "authenticated" USING (("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."tenant_id" IS NOT NULL) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))) WITH CHECK (("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."tenant_id" IS NOT NULL) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "policy_visit_order_items_admin_all" ON "public"."visit_order_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."tenant_id" IS NULL) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."tenant_id" IS NULL) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



CREATE POLICY "policy_visit_order_items_advisor_delete" ON "public"."visit_order_items" FOR DELETE TO "authenticated" USING ((("visit_order_id" IN ( SELECT "vo"."id"
   FROM "public"."visit_orders" "vo"
  WHERE (("vo"."advisor_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("vo"."order_status" = 'draft'::"public"."visit_order_status_enum") AND ("vo"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



CREATE POLICY "policy_visit_order_items_advisor_insert" ON "public"."visit_order_items" FOR INSERT TO "authenticated" WITH CHECK (("visit_order_id" IN ( SELECT "vo"."id"
   FROM "public"."visit_orders" "vo"
  WHERE (("vo"."advisor_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("vo"."deleted_at" IS NULL)))));



CREATE POLICY "policy_visit_order_items_advisor_select" ON "public"."visit_order_items" FOR SELECT TO "authenticated" USING ((("visit_order_id" IN ( SELECT "vo"."id"
   FROM "public"."visit_orders" "vo"
  WHERE (("vo"."advisor_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("vo"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



CREATE POLICY "policy_visit_order_items_advisor_update" ON "public"."visit_order_items" FOR UPDATE TO "authenticated" USING ((("visit_order_id" IN ( SELECT "vo"."id"
   FROM "public"."visit_orders" "vo"
  WHERE (("vo"."advisor_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("vo"."order_status" = ANY (ARRAY['draft'::"public"."visit_order_status_enum", 'confirmed'::"public"."visit_order_status_enum"])) AND ("vo"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL))) WITH CHECK (("visit_order_id" IN ( SELECT "vo"."id"
   FROM "public"."visit_orders" "vo"
  WHERE (("vo"."advisor_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("vo"."order_status" = ANY (ARRAY['draft'::"public"."visit_order_status_enum", 'confirmed'::"public"."visit_order_status_enum"])) AND ("vo"."deleted_at" IS NULL)))));



CREATE POLICY "policy_visit_order_items_brand_manager" ON "public"."visit_order_items" FOR SELECT TO "authenticated" USING ((("product_id" IN ( SELECT "p"."id"
   FROM ("public"."products" "p"
     JOIN "public"."user_roles" "ur" ON (("ur"."brand_id" = "p"."brand_id")))
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'brand_manager'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



CREATE POLICY "policy_visit_order_items_client_select" ON "public"."visit_order_items" FOR SELECT TO "authenticated" USING ((("visit_order_id" IN ( SELECT "vo"."id"
   FROM ("public"."visit_orders" "vo"
     JOIN "public"."clients" "c" ON (("c"."id" = "vo"."client_id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("vo"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



CREATE POLICY "policy_visit_order_items_supervisor" ON "public"."visit_order_items" TO "authenticated" USING ((("visit_order_id" IN ( SELECT "vo"."id"
   FROM "public"."visit_orders" "vo"
  WHERE (("vo"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("vo"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL))) WITH CHECK (("visit_order_id" IN ( SELECT "vo"."id"
   FROM "public"."visit_orders" "vo"
  WHERE (("vo"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("vo"."deleted_at" IS NULL)))));



CREATE POLICY "policy_visit_order_items_tenant_admin" ON "public"."visit_order_items" TO "authenticated" USING (("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."tenant_id" IS NOT NULL) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))) WITH CHECK (("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_profile_id" = ( SELECT "user_profiles"."id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."deleted_at" IS NULL)))) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."tenant_id" IS NOT NULL) AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))));



ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotion_redemptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotion_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reward_redemptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rewards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "supervisors_manage_client_tier_assignments" ON "public"."client_tier_assignments" USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
                   FROM "public"."user_profiles" "up"
                  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                           FROM ("public"."user_roles" "ur"
                             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_manage_visit_assessments" ON "public"."visit_assessments" USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_manage_visit_communication_plans" ON "public"."visit_communication_plans" USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_manage_visit_inventories" ON "public"."visit_inventories" USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_manage_visit_orders" ON "public"."visit_orders" USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_manage_visits" ON "public"."visits" USING ((("deleted_at" IS NULL) AND ("advisor_id" IN ( SELECT "up"."id"
   FROM "public"."user_profiles" "up"
  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_select_client_tier_assignments" ON "public"."client_tier_assignments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
                   FROM "public"."user_profiles" "up"
                  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                           FROM ("public"."user_roles" "ur"
                             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_select_orders" ON "public"."orders" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_id" IN ( SELECT "c"."id"
   FROM "public"."clients" "c"
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
                   FROM "public"."user_profiles" "up"
                  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                           FROM ("public"."user_roles" "ur"
                             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_select_points_transactions" ON "public"."points_transactions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
                   FROM "public"."user_profiles" "up"
                  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                           FROM ("public"."user_roles" "ur"
                             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_select_promotion_redemptions" ON "public"."promotion_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND (("applied_by" IN ( SELECT "up"."id"
   FROM "public"."user_profiles" "up"
  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) OR ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
                   FROM "public"."user_profiles" "up"
                  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                           FROM ("public"."user_roles" "ur"
                             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL)))))));



CREATE POLICY "supervisors_select_reward_redemptions" ON "public"."reward_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("client_brand_membership_id" IN ( SELECT "cbm"."id"
   FROM ("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
  WHERE (("c"."id" IN ( SELECT DISTINCT "v"."client_id"
           FROM "public"."visits" "v"
          WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
                   FROM "public"."user_profiles" "up"
                  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                           FROM ("public"."user_roles" "ur"
                             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL)))) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_select_subordinate_roles" ON "public"."user_roles" FOR SELECT USING ((("deleted_at" IS NULL) AND ("user_profile_id" IN ( SELECT "up"."id"
   FROM "public"."user_profiles" "up"
  WHERE ("up"."manager_id" IN ( SELECT "supervisor_profile"."id"
           FROM "public"."user_profiles" "supervisor_profile"
          WHERE ("supervisor_profile"."user_id" = "auth"."uid"())))))));



CREATE POLICY "supervisors_select_visit_assessments" ON "public"."visit_assessments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_select_visit_communication_plans" ON "public"."visit_communication_plans" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_select_visit_inventories" ON "public"."visit_inventories" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_select_visit_orders" ON "public"."visit_orders" FOR SELECT USING ((("deleted_at" IS NULL) AND ("visit_id" IN ( SELECT "v"."id"
   FROM "public"."visits" "v"
  WHERE (("v"."advisor_id" IN ( SELECT "up"."id"
           FROM "public"."user_profiles" "up"
          WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
                   FROM ("public"."user_roles" "ur"
                     JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
                  WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL)))) AND ("v"."deleted_at" IS NULL))))));



CREATE POLICY "supervisors_select_visits" ON "public"."visits" FOR SELECT USING ((("deleted_at" IS NULL) AND ("advisor_id" IN ( SELECT "up"."id"
   FROM "public"."user_profiles" "up"
  WHERE (("up"."manager_id" IN ( SELECT "ur"."user_profile_id"
           FROM ("public"."user_roles" "ur"
             JOIN "public"."user_profiles" "up_mgr" ON (("ur"."user_profile_id" = "up_mgr"."id")))
          WHERE (("up_mgr"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'supervisor'::"public"."user_role_type_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL)))) AND ("up"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_campaigns" ON "public"."campaigns" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_client_brand_memberships" ON "public"."client_brand_memberships" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_client_invoice_data" ON "public"."client_invoice_data" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_client_tier_assignments" ON "public"."client_tier_assignments" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_client_types" ON "public"."client_types" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_clients" ON "public"."clients" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_commercial_structures" ON "public"."commercial_structures" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_markets" ON "public"."markets" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_orders" ON "public"."orders" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_points_transactions" ON "public"."points_transactions" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_product_categories" ON "public"."product_categories" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_product_variants" ON "public"."product_variants" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_products" ON "public"."products" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_promotion_redemptions" ON "public"."promotion_redemptions" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_promotion_rules" ON "public"."promotion_rules" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_promotions" ON "public"."promotions" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_reward_redemptions" ON "public"."reward_redemptions" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_rewards" ON "public"."rewards" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_tiers" ON "public"."tiers" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_visit_assessments" ON "public"."visit_assessments" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_visit_communication_plans" ON "public"."visit_communication_plans" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_visit_inventories" ON "public"."visit_inventories" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_visit_orders" ON "public"."visit_orders" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_visits" ON "public"."visits" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_manage_zones" ON "public"."zones" USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_campaigns" ON "public"."campaigns" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_client_brand_memberships" ON "public"."client_brand_memberships" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_client_invoice_data" ON "public"."client_invoice_data" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_client_tier_assignments" ON "public"."client_tier_assignments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_client_types" ON "public"."client_types" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_clients" ON "public"."clients" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_commercial_structures" ON "public"."commercial_structures" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_markets" ON "public"."markets" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_orders" ON "public"."orders" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_points_transactions" ON "public"."points_transactions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_product_categories" ON "public"."product_categories" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_product_variants" ON "public"."product_variants" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_products" ON "public"."products" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_promotion_redemptions" ON "public"."promotion_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_promotion_rules" ON "public"."promotion_rules" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_promotions" ON "public"."promotions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_reward_redemptions" ON "public"."reward_redemptions" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_rewards" ON "public"."rewards" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_tenants" ON "public"."tenants" FOR SELECT USING ((("deleted_at" IS NULL) AND ("id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_tiers" ON "public"."tiers" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_visit_assessments" ON "public"."visit_assessments" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_visit_communication_plans" ON "public"."visit_communication_plans" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_visit_inventories" ON "public"."visit_inventories" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_visit_orders" ON "public"."visit_orders" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_visits" ON "public"."visits" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



CREATE POLICY "tenant_admins_select_zones" ON "public"."zones" FOR SELECT USING ((("deleted_at" IS NULL) AND ("tenant_id" IN ( SELECT "ur"."tenant_id"
   FROM ("public"."user_roles" "ur"
     JOIN "public"."user_profiles" "up" ON (("ur"."user_profile_id" = "up"."id")))
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_type_enum") AND ("ur"."scope" = 'tenant'::"public"."user_role_scope_enum") AND ("ur"."status" = 'active'::"public"."user_role_status_enum") AND ("ur"."deleted_at" IS NULL))))));



ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_profiles_tenant_access" ON "public"."user_profiles" TO "authenticated" USING (("tenant_id" = 'fe0f429d-2d83-4738-af65-32c655cef656'::"uuid")) WITH CHECK (("tenant_id" = 'fe0f429d-2d83-4738-af65-32c655cef656'::"uuid"));



CREATE POLICY "users_select_own_roles" ON "public"."user_roles" FOR SELECT USING ((("deleted_at" IS NULL) AND ("user_profile_id" IN ( SELECT "up"."id"
   FROM "public"."user_profiles" "up"
  WHERE ("up"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."visit_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visit_communication_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visit_inventories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visit_order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visit_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "visits_insert_policy" ON "public"."visits" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("deleted_at" IS NULL)));



CREATE POLICY "visits_select_policy" ON "public"."visits" FOR SELECT USING (("deleted_at" IS NULL));



CREATE POLICY "visits_update_policy" ON "public"."visits" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("deleted_at" IS NULL))) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."zones" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."auto_generate_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_generate_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_generate_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_current_margin"("product_cost" numeric, "product_base_price" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_current_margin"("product_cost" numeric, "product_base_price" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_current_margin"("product_cost" numeric, "product_base_price" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_order_total"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_order_total"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_order_total"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_points_balance"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_points_balance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_points_balance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_price_variance"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_price_variance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_price_variance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_promotion_rule_reach"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_promotion_rule_reach"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_promotion_rule_reach"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_visit_duration"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_visit_duration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_visit_duration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_visit_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_visit_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_visit_order_item_totals"("p_quantity" integer, "p_unit_price" numeric, "p_discount_percentage" numeric, "p_tax_rate" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."cascade_brand_role_soft_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."cascade_brand_role_soft_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cascade_brand_role_soft_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cascade_tenant_soft_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."cascade_tenant_soft_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cascade_tenant_soft_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_manager_hierarchy"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_manager_hierarchy"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_manager_hierarchy"() TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_visit"("p_visit_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_visit"("p_visit_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_visit"("p_visit_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_purchase_with_promotions"("p_visit_id" "uuid", "p_items" "jsonb", "p_payment_method" character varying, "p_invoice_number" character varying, "p_invoice_photo_url" "text", "p_apply_promotions" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."create_purchase_with_promotions"("p_visit_id" "uuid", "p_items" "jsonb", "p_payment_method" character varying, "p_invoice_number" character varying, "p_invoice_photo_url" "text", "p_apply_promotions" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_purchase_with_promotions"("p_visit_id" "uuid", "p_items" "jsonb", "p_payment_method" character varying, "p_invoice_number" character varying, "p_invoice_photo_url" "text", "p_apply_promotions" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_redemption_points_transaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_redemption_points_transaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_redemption_points_transaction"() TO "service_role";



GRANT ALL ON FUNCTION "public"."expire_user_roles"() TO "anon";
GRANT ALL ON FUNCTION "public"."expire_user_roles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."expire_user_roles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."expire_user_roles_batch"("batch_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."expire_user_roles_batch"("batch_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."expire_user_roles_batch"("batch_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."expire_user_roles_manual"() TO "anon";
GRANT ALL ON FUNCTION "public"."expire_user_roles_manual"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."expire_user_roles_manual"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_advisor_assignment_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_advisor_assignment_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_advisor_assignment_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_advisor_client_assignment_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_advisor_client_assignment_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_advisor_client_assignment_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_brand_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_brand_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_brand_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_campaign_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_campaign_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_campaign_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_client_brand_membership_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_client_brand_membership_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_client_brand_membership_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_client_invoice_data_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_client_invoice_data_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_client_invoice_data_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_client_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_client_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_client_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_client_tier_assignment_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_client_tier_assignment_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_client_tier_assignment_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_client_type_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_client_type_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_client_type_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_commercial_structure_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_commercial_structure_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_commercial_structure_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_market_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_market_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_market_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_item_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_item_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_item_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_number"("brand_id" "uuid", "order_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_number"("brand_id" "uuid", "order_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_number"("brand_id" "uuid", "order_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_point_transaction_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_point_transaction_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_point_transaction_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_points_transaction_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_points_transaction_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_points_transaction_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_product_category_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_product_category_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_product_category_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_product_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_product_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_product_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_product_variant_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_product_variant_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_product_variant_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_promotion_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_promotion_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_promotion_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_promotion_redemption_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_promotion_redemption_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_promotion_redemption_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_promotion_rule_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_promotion_rule_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_promotion_rule_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_public_id"("entity_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_public_id"("entity_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_public_id"("entity_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_redemption_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_redemption_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_redemption_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_reward_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_reward_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_reward_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_reward_redemption_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_reward_redemption_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_reward_redemption_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_tenant_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_tenant_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_tenant_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_tier_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_tier_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_tier_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_user_profile_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_user_profile_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_user_profile_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_visit_assessment_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_visit_assessment_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_visit_assessment_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_visit_communication_plan_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_visit_communication_plan_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_visit_communication_plan_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_visit_inventory_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_visit_inventory_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_visit_inventory_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_visit_order_item_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_visit_order_item_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_visit_order_item_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_visit_order_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_visit_order_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_visit_order_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_visit_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_visit_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_visit_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_zone_public_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_zone_public_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_zone_public_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_applicable_promotions"("p_client_id" "uuid", "p_brand_id" "uuid", "p_purchase_amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."get_applicable_promotions"("p_client_id" "uuid", "p_brand_id" "uuid", "p_purchase_amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_applicable_promotions"("p_client_id" "uuid", "p_brand_id" "uuid", "p_purchase_amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_tenant_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_tenant_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_tenant_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_next_order_item_line_number"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_next_order_item_line_number"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_next_order_item_line_number"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_next_visit_order_item_line_number"("p_visit_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_next_visit_order_item_line_number"("p_visit_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_next_visit_order_item_line_number"("p_visit_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_role_expiration_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_role_expiration_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_role_expiration_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_role_system_health"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_role_system_health"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_role_system_health"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_promotion_rule_toggles"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_promotion_rule_toggles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_promotion_rule_toggles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_role_active"("role_status" "public"."user_role_status_enum", "expires_at" timestamp with time zone, "deleted_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."is_role_active"("role_status" "public"."user_role_status_enum", "expires_at" timestamp with time zone, "deleted_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_role_active"("role_status" "public"."user_role_status_enum", "expires_at" timestamp with time zone, "deleted_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_transaction_reversed"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_transaction_reversed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_transaction_reversed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_public_id_sequence"("entity_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reset_public_id_sequence"("entity_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_public_id_sequence"("entity_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_client_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_client_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_client_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_profile_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_profile_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_profile_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_campaign_budget_spent"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_campaign_budget_spent"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_campaign_budget_spent"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_membership_current_tier"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_membership_current_tier"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_membership_current_tier"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_membership_points"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_membership_points"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_membership_points"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_totals_from_items"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_totals_from_items"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_totals_from_items"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_promotion_usage"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_promotion_usage"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_promotion_usage"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reward_usage_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_reward_usage_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reward_usage_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_visit_assessment"("p_visit_id" "uuid", "p_assessment_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_visit_assessment"("p_visit_id" "uuid", "p_assessment_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_visit_assessment"("p_visit_id" "uuid", "p_assessment_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_visit_order_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_visit_order_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_visit_order_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_visit_order_totals_from_items"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_visit_order_totals_from_items"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_visit_order_totals_from_items"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_visit_workflow_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_visit_workflow_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_visit_workflow_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_visit_workflow_status_communication"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_visit_workflow_status_communication"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_visit_workflow_status_communication"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_visit_workflow_status_inventory"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_visit_workflow_status_inventory"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_visit_workflow_status_inventory"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_visit_workflow_status_orders"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_visit_workflow_status_orders"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_visit_workflow_status_orders"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_role"("role_name" "public"."user_role_type", "brand_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_role"("role_name" "public"."user_role_type", "brand_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_role"("role_name" "public"."user_role_type", "brand_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_campaign_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_campaign_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_campaign_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_client_brand_membership_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_client_brand_membership_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_client_brand_membership_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_client_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_client_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_client_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_client_invoice_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_client_invoice_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_client_invoice_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_client_tier_assignment_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_client_tier_assignment_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_client_tier_assignment_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_client_type_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_client_type_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_client_type_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_commercial_structure_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_commercial_structure_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_commercial_structure_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_current_tier_assignment_unique"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_current_tier_assignment_unique"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_current_tier_assignment_unique"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_default_tier_unique"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_default_tier_unique"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_default_tier_unique"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_default_variant_unique"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_default_variant_unique"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_default_variant_unique"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_market_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_market_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_market_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_order_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_order_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_order_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_order_item_calculations"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_order_item_calculations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_order_item_calculations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_order_item_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_order_item_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_order_item_metadata"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_order_item_tenant_consistency"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_order_item_tenant_consistency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_order_item_tenant_consistency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_points_transaction_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_points_transaction_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_points_transaction_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_preferred_invoice_data_unique"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_preferred_invoice_data_unique"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_preferred_invoice_data_unique"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_primary_brand_unique"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_primary_brand_unique"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_primary_brand_unique"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_product_category_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_product_category_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_product_category_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_product_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_product_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_product_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_product_variant_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_product_variant_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_product_variant_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_promotion_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_promotion_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_promotion_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_promotion_redemption_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_promotion_redemption_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_promotion_redemption_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_promotion_rule_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_promotion_rule_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_promotion_rule_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_public_id"("public_id_value" "text", "entity_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_public_id"("public_id_value" "text", "entity_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_public_id"("public_id_value" "text", "entity_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_reward_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_reward_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_reward_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_reward_redemption_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_reward_redemption_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_reward_redemption_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_role_expiration_on_critical_ops"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_role_expiration_on_critical_ops"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_role_expiration_on_critical_ops"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_single_primary_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_single_primary_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_single_primary_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_tier_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_tier_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_tier_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_visit_assessment_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_visit_assessment_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_visit_assessment_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_visit_communication_plan_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_visit_communication_plan_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_visit_communication_plan_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_visit_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_visit_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_visit_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_visit_inventory_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_visit_inventory_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_visit_inventory_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_visit_order_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_visit_order_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_visit_order_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_visit_order_item_calculations"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_visit_order_item_calculations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_visit_order_item_calculations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_visit_order_item_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_visit_order_item_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_visit_order_item_metadata"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_visit_order_item_tenant_consistency"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_visit_order_item_tenant_consistency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_visit_order_item_tenant_consistency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_zone_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_zone_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_zone_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";
























GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."active_brands" TO "anon";
GRANT ALL ON TABLE "public"."active_brands" TO "authenticated";
GRANT ALL ON TABLE "public"."active_brands" TO "service_role";



GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."active_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."active_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."active_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."client_brand_memberships" TO "anon";
GRANT ALL ON TABLE "public"."client_brand_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."client_brand_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."active_client_brand_memberships" TO "anon";
GRANT ALL ON TABLE "public"."active_client_brand_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."active_client_brand_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."client_invoice_data" TO "anon";
GRANT ALL ON TABLE "public"."client_invoice_data" TO "authenticated";
GRANT ALL ON TABLE "public"."client_invoice_data" TO "service_role";



GRANT ALL ON TABLE "public"."active_client_invoice_data" TO "anon";
GRANT ALL ON TABLE "public"."active_client_invoice_data" TO "authenticated";
GRANT ALL ON TABLE "public"."active_client_invoice_data" TO "service_role";



GRANT ALL ON TABLE "public"."client_tier_assignments" TO "anon";
GRANT ALL ON TABLE "public"."client_tier_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tier_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."tiers" TO "anon";
GRANT ALL ON TABLE "public"."tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."tiers" TO "service_role";



GRANT ALL ON TABLE "public"."active_client_tier_assignments" TO "anon";
GRANT ALL ON TABLE "public"."active_client_tier_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."active_client_tier_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."client_types" TO "anon";
GRANT ALL ON TABLE "public"."client_types" TO "authenticated";
GRANT ALL ON TABLE "public"."client_types" TO "service_role";



GRANT ALL ON TABLE "public"."markets" TO "anon";
GRANT ALL ON TABLE "public"."markets" TO "authenticated";
GRANT ALL ON TABLE "public"."markets" TO "service_role";



GRANT ALL ON TABLE "public"."zones" TO "anon";
GRANT ALL ON TABLE "public"."zones" TO "authenticated";
GRANT ALL ON TABLE "public"."zones" TO "service_role";



GRANT ALL ON TABLE "public"."active_client_types" TO "anon";
GRANT ALL ON TABLE "public"."active_client_types" TO "authenticated";
GRANT ALL ON TABLE "public"."active_client_types" TO "service_role";



GRANT ALL ON TABLE "public"."commercial_structures" TO "anon";
GRANT ALL ON TABLE "public"."commercial_structures" TO "authenticated";
GRANT ALL ON TABLE "public"."commercial_structures" TO "service_role";



GRANT ALL ON TABLE "public"."active_commercial_structures" TO "anon";
GRANT ALL ON TABLE "public"."active_commercial_structures" TO "authenticated";
GRANT ALL ON TABLE "public"."active_commercial_structures" TO "service_role";



GRANT ALL ON TABLE "public"."active_markets" TO "anon";
GRANT ALL ON TABLE "public"."active_markets" TO "authenticated";
GRANT ALL ON TABLE "public"."active_markets" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."active_order_items" TO "anon";
GRANT ALL ON TABLE "public"."active_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."active_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."active_orders" TO "anon";
GRANT ALL ON TABLE "public"."active_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."active_orders" TO "service_role";



GRANT ALL ON TABLE "public"."points_transactions" TO "anon";
GRANT ALL ON TABLE "public"."points_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."points_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."active_points_transactions" TO "anon";
GRANT ALL ON TABLE "public"."active_points_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."active_points_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."product_categories" TO "anon";
GRANT ALL ON TABLE "public"."product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."product_categories" TO "service_role";



GRANT ALL ON TABLE "public"."active_product_categories" TO "anon";
GRANT ALL ON TABLE "public"."active_product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."active_product_categories" TO "service_role";



GRANT ALL ON TABLE "public"."active_product_variants" TO "anon";
GRANT ALL ON TABLE "public"."active_product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."active_product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."active_products" TO "anon";
GRANT ALL ON TABLE "public"."active_products" TO "authenticated";
GRANT ALL ON TABLE "public"."active_products" TO "service_role";



GRANT ALL ON TABLE "public"."promotion_redemptions" TO "anon";
GRANT ALL ON TABLE "public"."promotion_redemptions" TO "authenticated";
GRANT ALL ON TABLE "public"."promotion_redemptions" TO "service_role";



GRANT ALL ON TABLE "public"."promotions" TO "anon";
GRANT ALL ON TABLE "public"."promotions" TO "authenticated";
GRANT ALL ON TABLE "public"."promotions" TO "service_role";



GRANT ALL ON TABLE "public"."active_promotion_redemptions" TO "anon";
GRANT ALL ON TABLE "public"."active_promotion_redemptions" TO "authenticated";
GRANT ALL ON TABLE "public"."active_promotion_redemptions" TO "service_role";



GRANT ALL ON TABLE "public"."promotion_rules" TO "anon";
GRANT ALL ON TABLE "public"."promotion_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."promotion_rules" TO "service_role";



GRANT ALL ON TABLE "public"."active_promotion_rules" TO "anon";
GRANT ALL ON TABLE "public"."active_promotion_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."active_promotion_rules" TO "service_role";



GRANT ALL ON TABLE "public"."active_promotions" TO "anon";
GRANT ALL ON TABLE "public"."active_promotions" TO "authenticated";
GRANT ALL ON TABLE "public"."active_promotions" TO "service_role";



GRANT ALL ON TABLE "public"."reward_redemptions" TO "anon";
GRANT ALL ON TABLE "public"."reward_redemptions" TO "authenticated";
GRANT ALL ON TABLE "public"."reward_redemptions" TO "service_role";



GRANT ALL ON TABLE "public"."rewards" TO "anon";
GRANT ALL ON TABLE "public"."rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."rewards" TO "service_role";



GRANT ALL ON TABLE "public"."active_reward_redemptions" TO "anon";
GRANT ALL ON TABLE "public"."active_reward_redemptions" TO "authenticated";
GRANT ALL ON TABLE "public"."active_reward_redemptions" TO "service_role";



GRANT ALL ON TABLE "public"."active_rewards" TO "anon";
GRANT ALL ON TABLE "public"."active_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."active_rewards" TO "service_role";



GRANT ALL ON TABLE "public"."active_tenants" TO "anon";
GRANT ALL ON TABLE "public"."active_tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."active_tenants" TO "service_role";



GRANT ALL ON TABLE "public"."active_tiers" TO "anon";
GRANT ALL ON TABLE "public"."active_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."active_tiers" TO "service_role";



GRANT ALL ON TABLE "public"."active_user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."active_user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."active_user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."active_user_roles" TO "anon";
GRANT ALL ON TABLE "public"."active_user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."active_user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."visit_assessments" TO "anon";
GRANT ALL ON TABLE "public"."visit_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."visit_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."visits" TO "anon";
GRANT ALL ON TABLE "public"."visits" TO "authenticated";
GRANT ALL ON TABLE "public"."visits" TO "service_role";



GRANT ALL ON TABLE "public"."active_visit_assessments" TO "anon";
GRANT ALL ON TABLE "public"."active_visit_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."active_visit_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."visit_communication_plans" TO "anon";
GRANT ALL ON TABLE "public"."visit_communication_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."visit_communication_plans" TO "service_role";



GRANT ALL ON TABLE "public"."active_visit_communication_plans" TO "anon";
GRANT ALL ON TABLE "public"."active_visit_communication_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."active_visit_communication_plans" TO "service_role";



GRANT ALL ON TABLE "public"."visit_inventories" TO "anon";
GRANT ALL ON TABLE "public"."visit_inventories" TO "authenticated";
GRANT ALL ON TABLE "public"."visit_inventories" TO "service_role";



GRANT ALL ON TABLE "public"."active_visit_inventories" TO "anon";
GRANT ALL ON TABLE "public"."active_visit_inventories" TO "authenticated";
GRANT ALL ON TABLE "public"."active_visit_inventories" TO "service_role";



GRANT ALL ON TABLE "public"."visit_order_items" TO "anon";
GRANT ALL ON TABLE "public"."visit_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."visit_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."visit_orders" TO "anon";
GRANT ALL ON TABLE "public"."visit_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."visit_orders" TO "service_role";



GRANT ALL ON TABLE "public"."active_visit_order_items" TO "anon";
GRANT ALL ON TABLE "public"."active_visit_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."active_visit_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."active_visit_orders" TO "anon";
GRANT ALL ON TABLE "public"."active_visit_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."active_visit_orders" TO "service_role";



GRANT ALL ON TABLE "public"."active_visits" TO "anon";
GRANT ALL ON TABLE "public"."active_visits" TO "authenticated";
GRANT ALL ON TABLE "public"."active_visits" TO "service_role";



GRANT ALL ON TABLE "public"."active_zones" TO "anon";
GRANT ALL ON TABLE "public"."active_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."active_zones" TO "service_role";



GRANT ALL ON TABLE "public"."advisor_assignments" TO "anon";
GRANT ALL ON TABLE "public"."advisor_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."advisor_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."advisor_client_assignments" TO "anon";
GRANT ALL ON TABLE "public"."advisor_client_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."advisor_client_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."brand_membership_stats" TO "anon";
GRANT ALL ON TABLE "public"."brand_membership_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_membership_stats" TO "service_role";



GRANT ALL ON TABLE "public"."brand_product_stats" TO "anon";
GRANT ALL ON TABLE "public"."brand_product_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_product_stats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."brand_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."brand_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."brand_public_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."brand_tier_member_distribution" TO "anon";
GRANT ALL ON TABLE "public"."brand_tier_member_distribution" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_tier_member_distribution" TO "service_role";



GRANT ALL ON TABLE "public"."brand_tier_stats" TO "anon";
GRANT ALL ON TABLE "public"."brand_tier_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_tier_stats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."campaign_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."campaign_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."campaign_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."client_brand_membership_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."client_brand_membership_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."client_brand_membership_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."client_invoice_data_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."client_invoice_data_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."client_invoice_data_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."client_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."client_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."client_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."client_tier_assignment_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."client_tier_assignment_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."client_tier_assignment_public_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."client_type_kpi_analysis" TO "anon";
GRANT ALL ON TABLE "public"."client_type_kpi_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."client_type_kpi_analysis" TO "service_role";



GRANT ALL ON SEQUENCE "public"."client_type_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."client_type_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."client_type_public_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."client_type_tenant_summary" TO "anon";
GRANT ALL ON TABLE "public"."client_type_tenant_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."client_type_tenant_summary" TO "service_role";



GRANT ALL ON TABLE "public"."clients_with_inherited_values" TO "anon";
GRANT ALL ON TABLE "public"."clients_with_inherited_values" TO "authenticated";
GRANT ALL ON TABLE "public"."clients_with_inherited_values" TO "service_role";



GRANT ALL ON SEQUENCE "public"."commercial_structure_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."commercial_structure_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."commercial_structure_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."market_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."market_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."market_public_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."market_stats" TO "anon";
GRANT ALL ON TABLE "public"."market_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."market_stats" TO "service_role";



GRANT ALL ON TABLE "public"."market_tenant_summary" TO "anon";
GRANT ALL ON TABLE "public"."market_tenant_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."market_tenant_summary" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_item_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_item_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_item_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."point_transaction_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."point_transaction_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."point_transaction_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."points_transaction_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."points_transaction_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."points_transaction_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_category_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_category_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_category_public_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_category_stats" TO "anon";
GRANT ALL ON TABLE "public"."product_category_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."product_category_stats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_variant_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_variant_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_variant_public_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_variant_stats" TO "anon";
GRANT ALL ON TABLE "public"."product_variant_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variant_stats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."promotion_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."promotion_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."promotion_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."promotion_redemption_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."promotion_redemption_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."promotion_redemption_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."promotion_rule_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."promotion_rule_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."promotion_rule_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reward_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reward_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reward_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reward_redemption_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reward_redemption_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reward_redemption_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tenant_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tenant_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tenant_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tier_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tier_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tier_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_profile_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_profile_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_profile_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."visit_assessment_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."visit_assessment_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."visit_assessment_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."visit_communication_plan_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."visit_communication_plan_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."visit_communication_plan_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."visit_inventory_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."visit_inventory_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."visit_inventory_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."visit_order_item_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."visit_order_item_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."visit_order_item_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."visit_order_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."visit_order_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."visit_order_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."visit_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."visit_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."visit_public_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."zone_public_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."zone_public_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."zone_public_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

alter table "public"."advisor_client_assignments" drop constraint "advisor_client_assignments_assignment_type_check";

alter table "public"."client_invoice_data" drop constraint "client_invoice_data_cfdi_use_check";

alter table "public"."client_invoice_data" drop constraint "client_invoice_data_payment_form_check";

alter table "public"."client_invoice_data" drop constraint "client_invoice_data_payment_method_check";

alter table "public"."clients" drop constraint "clients_coordinates_check";

alter table "public"."visits" drop constraint "visits_coordinates_check";

alter table "public"."advisor_client_assignments" add constraint "advisor_client_assignments_assignment_type_check" CHECK (((assignment_type)::text = ANY ((ARRAY['primary'::character varying, 'support'::character varying, 'temporary'::character varying])::text[]))) not valid;

alter table "public"."advisor_client_assignments" validate constraint "advisor_client_assignments_assignment_type_check";

alter table "public"."client_invoice_data" add constraint "client_invoice_data_cfdi_use_check" CHECK (((cfdi_use)::text = ANY ((ARRAY['G01'::character varying, 'G02'::character varying, 'G03'::character varying, 'I01'::character varying, 'I02'::character varying, 'I03'::character varying, 'I04'::character varying, 'I05'::character varying, 'I06'::character varying, 'I07'::character varying, 'I08'::character varying, 'D01'::character varying, 'D02'::character varying, 'D03'::character varying, 'D04'::character varying, 'D05'::character varying, 'D06'::character varying, 'D07'::character varying, 'D08'::character varying, 'D09'::character varying, 'D10'::character varying, 'P01'::character varying, 'S01'::character varying, 'CP01'::character varying, 'CN01'::character varying])::text[]))) not valid;

alter table "public"."client_invoice_data" validate constraint "client_invoice_data_cfdi_use_check";

alter table "public"."client_invoice_data" add constraint "client_invoice_data_payment_form_check" CHECK (((payment_form)::text = ANY ((ARRAY['01'::character varying, '02'::character varying, '03'::character varying, '04'::character varying, '05'::character varying, '06'::character varying, '08'::character varying, '12'::character varying, '13'::character varying, '14'::character varying, '15'::character varying, '17'::character varying, '23'::character varying, '24'::character varying, '25'::character varying, '26'::character varying, '27'::character varying, '28'::character varying, '29'::character varying, '30'::character varying, '99'::character varying])::text[]))) not valid;

alter table "public"."client_invoice_data" validate constraint "client_invoice_data_payment_form_check";

alter table "public"."client_invoice_data" add constraint "client_invoice_data_payment_method_check" CHECK (((payment_method)::text = ANY ((ARRAY['PUE'::character varying, 'PPD'::character varying])::text[]))) not valid;

alter table "public"."client_invoice_data" validate constraint "client_invoice_data_payment_method_check";

alter table "public"."clients" add constraint "clients_coordinates_check" CHECK (((coordinates IS NULL) OR (((coordinates[0] >= ('-180'::integer)::double precision) AND (coordinates[0] <= (180)::double precision)) AND ((coordinates[1] >= ('-90'::integer)::double precision) AND (coordinates[1] <= (90)::double precision))))) not valid;

alter table "public"."clients" validate constraint "clients_coordinates_check";

alter table "public"."visits" add constraint "visits_coordinates_check" CHECK (((location_coordinates IS NULL) OR (((location_coordinates[0] >= ('-180'::integer)::double precision) AND (location_coordinates[0] <= (180)::double precision)) AND ((location_coordinates[1] >= ('-90'::integer)::double precision) AND (location_coordinates[1] <= (90)::double precision))))) not valid;

alter table "public"."visits" validate constraint "visits_coordinates_check";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trigger_sync_email_from_auth AFTER UPDATE OF email ON auth.users FOR EACH ROW WHEN (((old.email)::text IS DISTINCT FROM (new.email)::text)) EXECUTE FUNCTION public.sync_user_profile_email();

CREATE TRIGGER trigger_sync_email_from_auth_to_clients AFTER UPDATE OF email ON auth.users FOR EACH ROW WHEN (((old.email)::text IS DISTINCT FROM (new.email)::text)) EXECUTE FUNCTION public.sync_client_email();


