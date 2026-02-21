-- ============================================================================
-- Migration: 20260221110000_drop_generic_fallback_rls_policies.sql
-- Purpose:   SECURITY FIX — Drop 9 generic fallback RLS policies that allow
--            any authenticated user to access ALL records in clients, orders,
--            and visits tables. These override all role-based restrictions.
--
-- Background: These policies were created in 20260207212543_remote_schema.sql
--             and never removed. Because PostgreSQL ORs all PERMISSIVE policies,
--             they effectively bypass every role-specific policy on these 3 tables.
--
-- Impact:     After this migration, only role-specific policies control access.
--             All legitimate access paths are already covered by existing policies:
--               - clients: 12 role-specific policies (admin, tenant_admin, brand_manager,
--                          field_users, clients_select_own, clients_update_own)
--               - orders:  13 role-specific policies (admin, tenant_admin, brand_manager,
--                          supervisor, promotor, asesor_ventas, client_own)
--               - visits:  12 role-specific policies (admin, tenant_admin, supervisor,
--                          promotor, client)
--
-- Rollback:   See bottom of file for rollback SQL.
-- ============================================================================

BEGIN;

-- ── clients table ──────────────────────────────────────────────────────────
-- clients_select_policy: FOR SELECT USING (deleted_at IS NULL)
--   → No tenant/user filter. Any authenticated user sees ALL non-deleted clients.
DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;

-- clients_insert_policy: FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND deleted_at IS NULL)
--   → Any authenticated user can INSERT any client record.
DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;

-- clients_update_policy: FOR UPDATE USING (auth.role() = 'authenticated' AND deleted_at IS NULL)
--   → Any authenticated user can UPDATE any client record.
DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;

-- ── orders table ───────────────────────────────────────────────────────────
-- orders_select_policy: FOR SELECT USING (deleted_at IS NULL)
--   → No tenant/user filter. Any authenticated user sees ALL non-deleted orders.
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;

-- orders_insert_policy: FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND deleted_at IS NULL)
--   → Any authenticated user can INSERT any order record.
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;

-- orders_update_policy: FOR UPDATE USING (auth.role() = 'authenticated' AND deleted_at IS NULL)
--   → Any authenticated user can UPDATE any order record.
DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;

-- ── visits table ───────────────────────────────────────────────────────────
-- visits_select_policy: FOR SELECT USING (deleted_at IS NULL)
--   → No tenant/user filter. Any authenticated user sees ALL non-deleted visits.
DROP POLICY IF EXISTS "visits_select_policy" ON public.visits;

-- visits_insert_policy: FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND deleted_at IS NULL)
--   → Any authenticated user can INSERT any visit record.
DROP POLICY IF EXISTS "visits_insert_policy" ON public.visits;

-- visits_update_policy: FOR UPDATE USING (auth.role() = 'authenticated' AND deleted_at IS NULL)
--   → Any authenticated user can UPDATE any visit record.
DROP POLICY IF EXISTS "visits_update_policy" ON public.visits;

COMMIT;

-- ============================================================================
-- ROLLBACK SQL (recreate the 9 generic fallback policies)
-- Only use if role-specific policies are proven insufficient.
-- ============================================================================
--
-- BEGIN;
--
-- CREATE POLICY "clients_select_policy" ON public.clients
--   FOR SELECT USING (deleted_at IS NULL);
-- CREATE POLICY "clients_insert_policy" ON public.clients
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND deleted_at IS NULL);
-- CREATE POLICY "clients_update_policy" ON public.clients
--   FOR UPDATE USING (auth.role() = 'authenticated' AND deleted_at IS NULL)
--   WITH CHECK (auth.role() = 'authenticated');
--
-- CREATE POLICY "orders_select_policy" ON public.orders
--   FOR SELECT USING (deleted_at IS NULL);
-- CREATE POLICY "orders_insert_policy" ON public.orders
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND deleted_at IS NULL);
-- CREATE POLICY "orders_update_policy" ON public.orders
--   FOR UPDATE USING (auth.role() = 'authenticated' AND deleted_at IS NULL)
--   WITH CHECK (auth.role() = 'authenticated');
--
-- CREATE POLICY "visits_select_policy" ON public.visits
--   FOR SELECT USING (deleted_at IS NULL);
-- CREATE POLICY "visits_insert_policy" ON public.visits
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND deleted_at IS NULL);
-- CREATE POLICY "visits_update_policy" ON public.visits
--   FOR UPDATE USING (auth.role() = 'authenticated' AND deleted_at IS NULL)
--   WITH CHECK (auth.role() = 'authenticated');
--
-- COMMIT;
