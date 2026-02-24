-- ============================================================================
-- Migration: Fix validate_visit_inventory_data() to use 'promotor' role
-- ============================================================================
-- The advisor → promotor rename (20260207220000) updated user_roles data
-- and the validate_visit_data/validate_visit_order_data functions
-- (20260210010000), but missed validate_visit_inventory_data().
-- The function still checks for role = 'advisor' which no longer exists.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.validate_visit_inventory_data() RETURNS trigger
    LANGUAGE plpgsql
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

  -- Validar que counted_by tenga rol válido (promotor or supervisor)
  select exists (
    select 1 from public.user_roles ur
    where ur.user_profile_id = new.counted_by
    and ur.role in ('promotor', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
  ) into counted_by_has_valid_role;

  if not counted_by_has_valid_role then
    raise exception 'counted_by debe tener rol "promotor" o "supervisor" activo';
  end if;

  -- Validar que counted_by pertenezca al tenant
  select distinct ur.tenant_id into counted_by_tenant_id
  from public.user_roles ur
  where ur.user_profile_id = new.counted_by
  and ur.role in ('promotor', 'supervisor')
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
      and ur.role in ('promotor', 'supervisor')
      and ur.status = 'active'
      and ur.deleted_at is null
    ) into verified_by_has_valid_role;

    if not verified_by_has_valid_role then
      raise exception 'verified_by debe tener rol "promotor" o "supervisor" activo';
    end if;

    select distinct ur.tenant_id into verified_by_tenant_id
    from public.user_roles ur
    where ur.user_profile_id = new.verified_by
    and ur.role in ('promotor', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
    limit 1;

    if verified_by_tenant_id != new.tenant_id then
      raise exception 'El verificador no pertenece al tenant especificado';
    end if;
  end if;

  -- Validar estructura de expiration_dates JSON
  if new.expiration_dates is not null then
    if jsonb_typeof(new.expiration_dates) != 'array' then
      raise exception 'expiration_dates debe ser un array JSON';
    end if;
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

-- Restore search_path setting from the security fix migration
ALTER FUNCTION public.validate_visit_inventory_data() SET search_path = '';

COMMIT;
