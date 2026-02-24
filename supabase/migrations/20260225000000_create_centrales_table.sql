-- ============================================================================
-- Migration: 20260225000000_create_centrales_table.sql
-- Purpose:   Create centrales (wholesale markets) table + clients.central_id FK
--            with public_id generator, indexes, and RLS policies
-- ============================================================================

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 1: Sequence + public_id generator
-- ══════════════════════════════════════════════════════════════════════════

CREATE SEQUENCE IF NOT EXISTS public.centrale_public_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE OR REPLACE FUNCTION public.generate_centrale_public_id() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  next_val bigint;
BEGIN
  next_val := nextval('public.centrale_public_id_seq');
  RETURN 'CEN-' || lpad(next_val::text, 4, '0');
END;
$$;

ALTER FUNCTION public.generate_centrale_public_id() OWNER TO postgres;
ALTER FUNCTION public.generate_centrale_public_id() SET search_path = '';

GRANT EXECUTE ON FUNCTION public.generate_centrale_public_id() TO anon, authenticated, service_role;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 2: Create centrales table
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.centrales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(20) NOT NULL UNIQUE DEFAULT public.generate_centrale_public_id(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    address_street TEXT,
    address_city VARCHAR(255),
    address_state VARCHAR(100),
    address_postal_code VARCHAR(20),
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT centrales_tenant_name_unique UNIQUE (name, tenant_id),
    CONSTRAINT centrales_tenant_code_unique UNIQUE (code, tenant_id),
    CONSTRAINT centrales_public_id_format CHECK (public_id ~ '^CEN-[0-9]{4}$')
);

ALTER TABLE public.centrales OWNER TO postgres;

COMMENT ON TABLE public.centrales IS 'Centrales de abasto (wholesale markets) where clients are located';

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 3: Indexes
-- ══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_centrales_tenant_id
    ON public.centrales(tenant_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_centrales_zone_id
    ON public.centrales(zone_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_centrales_is_active
    ON public.centrales(tenant_id, is_active) WHERE deleted_at IS NULL;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 4: Add central_id FK to clients
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.clients
    ADD COLUMN IF NOT EXISTS central_id UUID REFERENCES public.centrales(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clients_central_id
    ON public.clients(central_id) WHERE deleted_at IS NULL;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 5: Enable RLS
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.centrales ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 6: RLS policies (following zones pattern)
-- ══════════════════════════════════════════════════════════════════════════

-- SELECT: global admin, tenant admin, brand managers in tenant, field users in tenant, clients in central
CREATE POLICY "rls_select_centrales" ON public.centrales
    FOR SELECT TO public
    USING (
        (SELECT is_global_admin())
        OR (
            deleted_at IS NULL
            AND (
                -- tenant admin
                tenant_id = ANY(get_tenant_admin_tenant_ids())
                -- brand manager: centrales in their brands' tenants
                OR tenant_id IN (
                    SELECT b.tenant_id FROM public.brands b
                    WHERE b.id IN (SELECT get_brand_manager_brand_ids())
                      AND b.deleted_at IS NULL
                )
                -- field users: active centrales in their tenant
                OR (
                    is_active = true
                    AND EXISTS (
                        SELECT 1 FROM public.user_roles ur
                        WHERE ur.user_profile_id = (SELECT get_user_profile_id())
                          AND ur.role = ANY(ARRAY['supervisor'::user_role_type_enum, 'promotor'::user_role_type_enum, 'asesor_de_ventas'::user_role_type_enum])
                          AND ur.status = 'active'::user_role_status_enum
                          AND ur.deleted_at IS NULL
                          AND ur.tenant_id = centrales.tenant_id
                    )
                )
                -- client: their own central
                OR (
                    is_active = true
                    AND EXISTS (
                        SELECT 1 FROM public.clients c
                        WHERE c.user_id = (SELECT auth.uid())
                          AND c.central_id = centrales.id
                          AND c.deleted_at IS NULL
                    )
                )
            )
        )
    );

-- MANAGE: only global admins can insert/update/delete
CREATE POLICY "admins_manage_centrales" ON public.centrales
    FOR ALL TO public
    USING ((SELECT is_global_admin()));

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 7: Grants
-- ══════════════════════════════════════════════════════════════════════════

GRANT ALL ON TABLE public.centrales TO anon;
GRANT ALL ON TABLE public.centrales TO authenticated;
GRANT ALL ON TABLE public.centrales TO service_role;
GRANT ALL ON SEQUENCE public.centrale_public_id_seq TO anon;
GRANT ALL ON SEQUENCE public.centrale_public_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.centrale_public_id_seq TO service_role;
