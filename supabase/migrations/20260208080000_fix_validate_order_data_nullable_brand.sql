-- ============================================================================
-- Migration: Fix validate_order_data to allow nullable brand_id
-- ============================================================================
-- The validate_order_data trigger was requiring brand_id to be NOT NULL.
-- For asesor_de_ventas (who work for distributors, not brands), brand_id
-- can be NULL. This migration updates the trigger to:
-- 1. Allow NULL brand_id
-- 2. Include 'promotor' and 'asesor_de_ventas' in valid roles for assigned_to
-- ============================================================================

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

  -- Validar que brand_id pertenezca al mismo tenant (solo si no es NULL)
  if new.brand_id is not null then
    select tenant_id into brand_tenant_id
    from public.brands where id = new.brand_id and deleted_at is null;

    if brand_tenant_id is null then
      raise exception 'Marca no existe o está eliminada';
    end if;

    if brand_tenant_id != new.tenant_id then
      raise exception 'La marca no pertenece al tenant especificado';
    end if;
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
      and ur.role in ('advisor', 'promotor', 'asesor_de_ventas', 'supervisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into assigned_to_has_valid_role;

    if not assigned_to_has_valid_role then
      raise exception 'assigned_to debe tener rol válido (promotor, asesor_de_ventas, o supervisor) activo';
    end if;

    select distinct ur.tenant_id into assigned_to_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.assigned_to
    and ur.status = 'active'
    and ur.deleted_at is null
    limit 1;

    if assigned_to_tenant_id is null or assigned_to_tenant_id != new.tenant_id then
      raise exception 'assigned_to no pertenece al tenant especificado';
    end if;
  end if;

  -- Validar cancelled_by si no es null
  if new.cancelled_by is not null then
    select exists (
      select 1 from public.user_roles ur
      where ur.user_profile_id = new.cancelled_by
      and ur.role in ('admin', 'supervisor', 'brand_manager', 'promotor', 'asesor_de_ventas')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into cancelled_by_has_valid_role;

    if not cancelled_by_has_valid_role then
      raise exception 'cancelled_by debe tener rol válido activo';
    end if;

    select distinct ur.tenant_id into cancelled_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.cancelled_by
    and ur.status = 'active'
    and ur.deleted_at is null
    limit 1;

    if cancelled_by_tenant_id is null or cancelled_by_tenant_id != new.tenant_id then
      raise exception 'cancelled_by no pertenece al tenant especificado';
    end if;
  end if;

  return new;
end;
$$;
