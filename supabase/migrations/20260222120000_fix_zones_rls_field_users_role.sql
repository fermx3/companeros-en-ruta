-- Fix: rls_select_zones uses deprecated 'advisor' role instead of 'promotor'
-- and is missing 'asesor_de_ventas'.
-- The 'advisor' role was renamed to 'promotor' in migration 20260207220000,
-- but the RLS consolidation phase 2 (20260221130000) copied the old name.

DROP POLICY IF EXISTS "rls_select_zones" ON public.zones;

CREATE POLICY "rls_select_zones" ON public.zones
  FOR SELECT TO public
  USING (
    (SELECT is_global_admin())
    OR (
      deleted_at IS NULL
      AND (
        -- tenant admin
        tenant_id = ANY(get_tenant_admin_tenant_ids())
        -- brand manager: zones in their brands' tenants
        OR tenant_id IN (
          SELECT b.tenant_id FROM brands b
          WHERE b.id IN (SELECT get_brand_manager_brand_ids())
            AND b.deleted_at IS NULL
        )
        -- field users: active zones in their tenant
        OR (
          is_active = true
          AND EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_profile_id = (SELECT get_user_profile_id())
              AND ur.role = ANY(ARRAY['supervisor'::user_role_type_enum, 'promotor'::user_role_type_enum, 'asesor_de_ventas'::user_role_type_enum])
              AND ur.status = 'active'::user_role_status_enum
              AND ur.deleted_at IS NULL
              AND ur.tenant_id = zones.tenant_id
          )
        )
        -- client: their assigned zone
        OR (
          is_active = true
          AND EXISTS (
            SELECT 1 FROM clients c
            WHERE c.user_id = (SELECT auth.uid())
              AND c.zone_id = zones.id
              AND c.deleted_at IS NULL
          )
        )
      )
    )
  );
