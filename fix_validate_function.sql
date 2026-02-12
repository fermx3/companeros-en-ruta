-- Quick fix para ejecutar directamente en la base de datos local
-- Actualiza las funciones validate para usar promotor_id en lugar de advisor_id

-- Función validate_visit_data
CREATE OR REPLACE FUNCTION public.validate_visit_data() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  promotor_tenant_id uuid;
  client_tenant_id uuid;
  promotor_has_valid_role boolean := false;
begin
  -- Validar que promotor_id tenga rol 'promotor' o 'supervisor'
  select exists (
    select 1 from public.user_roles ur
    where ur.user_profile_id = new.promotor_id
    and ur.role in ('promotor', 'supervisor')
    and ur.status = 'active'
    and ur.deleted_at is null
  ) into promotor_has_valid_role;

  if not promotor_has_valid_role then
    raise exception 'promotor_id debe tener rol "promotor" o "supervisor" activo';
  end if;

  -- Obtener tenant_id del promotor
  select distinct ur.tenant_id into promotor_tenant_id
  from public.user_roles ur
  where ur.user_profile_id = new.promotor_id
  and ur.role in ('promotor', 'supervisor')
  and ur.status = 'active'
  and ur.deleted_at is null
  limit 1;

  -- Obtener tenant_id del client
  select tenant_id into client_tenant_id
  from public.clients where id = new.client_id and deleted_at is null;

  if client_tenant_id is null then
    raise exception 'Cliente no existe o está eliminado';
  end if;

  if promotor_tenant_id is null then
    raise exception 'Promotor no tiene roles activos';
  end if;

  if promotor_tenant_id != new.tenant_id then
    raise exception 'El promotor no pertenece al tenant especificado';
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
  end if;

  return new;
end;
$$;
