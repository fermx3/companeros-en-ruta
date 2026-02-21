-- ============================================================================
-- Migration: 20260221180000_fix_audit_logs_and_pg_trgm.sql
-- Purpose:   1. Retro-document audit_logs table (exists on remote, missing
--               from migrations)
--            2. Fix RLS initplan on audit_logs
--            3. Add missing FK indexes on audit_logs
--            4. Move pg_trgm extension to extensions schema
--
-- Verification: Supabase advisors should report 0 unindexed_foreign_keys,
--               0 auth_rls_initplan, and 0 extension_in_public after this.
-- ============================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- 1. Retro-document audit_logs table
--    Using IF NOT EXISTS since table already exists on remote.
-- ══════════════════════════════════════════════════════════════════════════

-- Enum type for audit actions (may already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action_enum') THEN
    CREATE TYPE public.audit_action_enum AS ENUM (
      'create', 'update', 'delete', 'login', 'logout', 'export', 'import'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action audit_action_enum NOT NULL,
  entity_name varchar(255),
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address varchar(45),
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (idempotent)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 2. Fix RLS initplan — replace auth.uid() with (SELECT auth.uid())
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "rls_select_audit_logs" ON public.audit_logs
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_roles r
      JOIN user_profiles p ON r.user_profile_id = p.id
      WHERE p.user_id = (SELECT auth.uid())
        AND r.role = 'admin'::user_role_type_enum
        AND r.status = 'active'::user_role_status_enum
        AND r.deleted_at IS NULL
    )
  );

-- ══════════════════════════════════════════════════════════════════════════
-- 3. Add missing FK indexes on audit_logs
-- ══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 4. Move pg_trgm extension to extensions schema
--    This resolves the extension_in_public security warning.
-- ══════════════════════════════════════════════════════════════════════════

ALTER EXTENSION pg_trgm SET SCHEMA extensions;

COMMIT;

-- ============================================================================
-- ROLLBACK:
-- DROP INDEX IF EXISTS idx_audit_logs_tenant_id;
-- DROP INDEX IF EXISTS idx_audit_logs_user_id;
-- DROP POLICY IF EXISTS "rls_select_audit_logs" ON public.audit_logs;
-- CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
--   FOR SELECT TO public USING (
--     EXISTS (SELECT 1 FROM user_roles r JOIN user_profiles p ON ...
--       WHERE p.user_id = auth.uid() AND r.role = 'admin')
--   );
-- ALTER EXTENSION pg_trgm SET SCHEMA public;
-- ============================================================================
