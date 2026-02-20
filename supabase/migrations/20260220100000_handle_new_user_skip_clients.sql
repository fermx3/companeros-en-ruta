-- Migration: handle_new_user_skip_clients
-- Description: Skip user_profiles creation for client users (is_client=true in metadata).
-- Client users link via clients.user_id directly and should NOT have a user_profiles row.

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  default_tenant_id uuid := 'fe0f429d-2d83-4738-af65-32c655cef656'::uuid;
  tenant_id_param uuid;
  first_name_param text;
  last_name_param  text;
begin
  -- Skip profile creation for client users (they use clients.user_id directly)
  if coalesce(new.raw_user_meta_data->>'is_client', 'false') = 'true' then
    return new;
  end if;

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
