-- ============================================================================
-- Migration: 20260225010000_zone_assignment_sync.sql
-- Purpose:   Auto-sync client_assignments when promotors are assigned to zones
--            and when new clients are created in zones with assigned promotors.
--            Ensures explicit assignment rows for RLS (is_client_assigned_to_user).
-- ============================================================================

-- ══════════════════════════════════════════════════════════════════════════
-- FUNCTION: sync_zone_client_assignments
-- Called when a promotor_assignment's zone_id is set/changed.
-- Bulk-inserts client_assignments for all active clients in that zone.
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.sync_zone_client_assignments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _brand_id UUID;
BEGIN
    -- Only act when zone_id is set or changed
    IF TG_OP = 'INSERT' AND NEW.zone_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' AND (NEW.zone_id IS NOT DISTINCT FROM OLD.zone_id) THEN
        RETURN NEW;
    END IF;

    -- Skip if assignment is inactive or deleted
    IF NEW.is_active = false OR NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Get the brand_id for this promotor via their user_roles
    -- (promotors work within a brand context via their tenant)
    -- We use the first active brand in the tenant as default
    SELECT b.id INTO _brand_id
    FROM brands b
    WHERE b.tenant_id = NEW.tenant_id
      AND b.deleted_at IS NULL
    ORDER BY b.created_at
    LIMIT 1;

    -- If no brand found, skip (shouldn't happen in practice)
    IF _brand_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Bulk-insert client_assignments for all active clients in the zone
    -- ON CONFLICT DO NOTHING to skip existing assignments
    INSERT INTO client_assignments (
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
    FROM clients c
    WHERE c.zone_id = NEW.zone_id
      AND c.tenant_id = NEW.tenant_id
      AND c.deleted_at IS NULL
      AND c.status != 'inactive'::client_status_enum
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

ALTER FUNCTION public.sync_zone_client_assignments() OWNER TO postgres;
ALTER FUNCTION public.sync_zone_client_assignments() SET search_path = '';

-- ══════════════════════════════════════════════════════════════════════════
-- TRIGGER: on promotor_assignments INSERT or UPDATE of zone_id
-- ══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER trigger_sync_zone_client_assignments
    AFTER INSERT OR UPDATE OF zone_id
    ON public.promotor_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_zone_client_assignments();

-- ══════════════════════════════════════════════════════════════════════════
-- FUNCTION: sync_new_client_to_zone_promotors
-- Called when a new client is created with a zone_id.
-- Auto-creates client_assignments for all promotors assigned to that zone.
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.sync_new_client_to_zone_promotors()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _brand_id UUID;
BEGIN
    -- Only act if client has a zone_id
    IF NEW.zone_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- On UPDATE, only act if zone_id actually changed
    IF TG_OP = 'UPDATE' AND (NEW.zone_id IS NOT DISTINCT FROM OLD.zone_id) THEN
        RETURN NEW;
    END IF;

    -- Get the brand_id for this tenant
    SELECT b.id INTO _brand_id
    FROM brands b
    WHERE b.tenant_id = NEW.tenant_id
      AND b.deleted_at IS NULL
    ORDER BY b.created_at
    LIMIT 1;

    IF _brand_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Insert client_assignments for all active promotors in this zone
    INSERT INTO client_assignments (
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
    FROM promotor_assignments pa
    WHERE pa.zone_id = NEW.zone_id
      AND pa.tenant_id = NEW.tenant_id
      AND pa.is_active = true
      AND pa.deleted_at IS NULL
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

ALTER FUNCTION public.sync_new_client_to_zone_promotors() OWNER TO postgres;
ALTER FUNCTION public.sync_new_client_to_zone_promotors() SET search_path = '';

-- ══════════════════════════════════════════════════════════════════════════
-- TRIGGER: on clients INSERT or UPDATE of zone_id
-- ══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER trigger_sync_new_client_to_zone_promotors
    AFTER INSERT OR UPDATE OF zone_id
    ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_new_client_to_zone_promotors();
