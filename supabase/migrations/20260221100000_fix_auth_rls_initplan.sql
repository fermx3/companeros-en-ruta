-- Migration: 20260221100000_fix_auth_rls_initplan.sql
-- Purpose: Rewrite all RLS policies to wrap bare auth.uid() calls in (SELECT auth.uid())
-- This forces PostgreSQL to evaluate auth.uid() once as an InitPlan (subquery),
-- rather than re-evaluating it for every row. This is a significant performance
-- optimization for RLS policies, especially on large tables.
--
-- Total policies rewritten: 327 (325 auth.uid() + 2 auth.jwt())
--
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

BEGIN;

-- Policy 1/325: brand_communication_plan_activities.plan_activities_tenant_isolation
DROP POLICY IF EXISTS "plan_activities_tenant_isolation" ON public.brand_communication_plan_activities;
CREATE POLICY "plan_activities_tenant_isolation"
  ON public.brand_communication_plan_activities
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((communication_plan_id IN ( SELECT bcp.id
   FROM (brand_communication_plans bcp
     JOIN user_profiles up ON ((bcp.tenant_id = up.tenant_id)))
  WHERE (up.user_id = (SELECT auth.uid())))))
  WITH CHECK ((communication_plan_id IN ( SELECT bcp.id
   FROM (brand_communication_plans bcp
     JOIN user_profiles up ON ((bcp.tenant_id = up.tenant_id)))
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 2/325: brand_communication_plan_materials.plan_materials_tenant_isolation
DROP POLICY IF EXISTS "plan_materials_tenant_isolation" ON public.brand_communication_plan_materials;
CREATE POLICY "plan_materials_tenant_isolation"
  ON public.brand_communication_plan_materials
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((communication_plan_id IN ( SELECT bcp.id
   FROM (brand_communication_plans bcp
     JOIN user_profiles up ON ((bcp.tenant_id = up.tenant_id)))
  WHERE (up.user_id = (SELECT auth.uid())))))
  WITH CHECK ((communication_plan_id IN ( SELECT bcp.id
   FROM (brand_communication_plans bcp
     JOIN user_profiles up ON ((bcp.tenant_id = up.tenant_id)))
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 3/325: brand_communication_plans.communication_plans_tenant_isolation
DROP POLICY IF EXISTS "communication_plans_tenant_isolation" ON public.brand_communication_plans;
CREATE POLICY "communication_plans_tenant_isolation"
  ON public.brand_communication_plans
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 4/325: brand_competitor_product_sizes.brand_competitor_product_sizes_tenant_isolation
DROP POLICY IF EXISTS "brand_competitor_product_sizes_tenant_isolation" ON public.brand_competitor_product_sizes;
CREATE POLICY "brand_competitor_product_sizes_tenant_isolation"
  ON public.brand_competitor_product_sizes
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((competitor_product_id IN ( SELECT bcp.id
   FROM (brand_competitor_products bcp
     JOIN user_profiles up ON ((bcp.tenant_id = up.tenant_id)))
  WHERE (up.user_id = (SELECT auth.uid())))))
  WITH CHECK ((competitor_product_id IN ( SELECT bcp.id
   FROM (brand_competitor_products bcp
     JOIN user_profiles up ON ((bcp.tenant_id = up.tenant_id)))
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 5/325: brand_competitor_products.brand_competitor_products_tenant_isolation
DROP POLICY IF EXISTS "brand_competitor_products_tenant_isolation" ON public.brand_competitor_products;
CREATE POLICY "brand_competitor_products_tenant_isolation"
  ON public.brand_competitor_products
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 6/325: brand_competitors.brand_competitors_tenant_isolation
DROP POLICY IF EXISTS "brand_competitors_tenant_isolation" ON public.brand_competitors;
CREATE POLICY "brand_competitors_tenant_isolation"
  ON public.brand_competitors
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 7/325: brand_exhibitions.exhibitions_tenant_isolation
DROP POLICY IF EXISTS "exhibitions_tenant_isolation" ON public.brand_exhibitions;
CREATE POLICY "exhibitions_tenant_isolation"
  ON public.brand_exhibitions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 8/325: brand_pop_materials.pop_materials_brand_tenant_isolation
DROP POLICY IF EXISTS "pop_materials_brand_tenant_isolation" ON public.brand_pop_materials;
CREATE POLICY "pop_materials_brand_tenant_isolation"
  ON public.brand_pop_materials
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((is_system_template = true) OR (tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid()))))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 9/325: campaigns.admins_delete_campaigns
DROP POLICY IF EXISTS "admins_delete_campaigns" ON public.campaigns;
CREATE POLICY "admins_delete_campaigns"
  ON public.campaigns
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 10/325: campaigns.admins_insert_campaigns
DROP POLICY IF EXISTS "admins_insert_campaigns" ON public.campaigns;
CREATE POLICY "admins_insert_campaigns"
  ON public.campaigns
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 11/325: campaigns.admins_select_campaigns
DROP POLICY IF EXISTS "admins_select_campaigns" ON public.campaigns;
CREATE POLICY "admins_select_campaigns"
  ON public.campaigns
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 12/325: campaigns.admins_update_campaigns
DROP POLICY IF EXISTS "admins_update_campaigns" ON public.campaigns;
CREATE POLICY "admins_update_campaigns"
  ON public.campaigns
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 13/325: campaigns.brand_managers_manage_campaigns
DROP POLICY IF EXISTS "brand_managers_manage_campaigns" ON public.campaigns;
CREATE POLICY "brand_managers_manage_campaigns"
  ON public.campaigns
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 14/325: campaigns.brand_managers_select_campaigns
DROP POLICY IF EXISTS "brand_managers_select_campaigns" ON public.campaigns;
CREATE POLICY "brand_managers_select_campaigns"
  ON public.campaigns
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 15/325: campaigns.field_users_select_campaigns
DROP POLICY IF EXISTS "field_users_select_campaigns" ON public.campaigns;
CREATE POLICY "field_users_select_campaigns"
  ON public.campaigns
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (status = 'active'::campaign_status_enum) AND (start_date <= CURRENT_DATE) AND (end_date >= CURRENT_DATE) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 16/325: campaigns.tenant_admins_manage_campaigns
DROP POLICY IF EXISTS "tenant_admins_manage_campaigns" ON public.campaigns;
CREATE POLICY "tenant_admins_manage_campaigns"
  ON public.campaigns
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 17/325: campaigns.tenant_admins_select_campaigns
DROP POLICY IF EXISTS "tenant_admins_select_campaigns" ON public.campaigns;
CREATE POLICY "tenant_admins_select_campaigns"
  ON public.campaigns
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 18/325: client_assignments.admins_manage_client_assignments
DROP POLICY IF EXISTS "admins_manage_client_assignments" ON public.client_assignments;
CREATE POLICY "admins_manage_client_assignments"
  ON public.client_assignments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['admin'::user_role_type_enum, 'brand_manager'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 19/325: client_assignments.users_view_own_client_assignments
DROP POLICY IF EXISTS "users_view_own_client_assignments" ON public.client_assignments;
CREATE POLICY "users_view_own_client_assignments"
  ON public.client_assignments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((user_profile_id IN ( SELECT up.id
   FROM user_profiles up
  WHERE ((up.user_id = (SELECT auth.uid())) AND (up.deleted_at IS NULL)))));

-- Policy 20/325: client_brand_memberships.admins_delete_client_brand_memberships
DROP POLICY IF EXISTS "admins_delete_client_brand_memberships" ON public.client_brand_memberships;
CREATE POLICY "admins_delete_client_brand_memberships"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 21/325: client_brand_memberships.admins_insert_client_brand_memberships
DROP POLICY IF EXISTS "admins_insert_client_brand_memberships" ON public.client_brand_memberships;
CREATE POLICY "admins_insert_client_brand_memberships"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 22/325: client_brand_memberships.admins_select_client_brand_memberships
DROP POLICY IF EXISTS "admins_select_client_brand_memberships" ON public.client_brand_memberships;
CREATE POLICY "admins_select_client_brand_memberships"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 23/325: client_brand_memberships.admins_update_client_brand_memberships
DROP POLICY IF EXISTS "admins_update_client_brand_memberships" ON public.client_brand_memberships;
CREATE POLICY "admins_update_client_brand_memberships"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 24/325: client_brand_memberships.clients_can_read_own_memberships
DROP POLICY IF EXISTS "clients_can_read_own_memberships" ON public.client_brand_memberships;
CREATE POLICY "clients_can_read_own_memberships"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((client_id IN ( SELECT clients.id
   FROM clients
  WHERE ((clients.user_id = (SELECT auth.uid())) AND (clients.deleted_at IS NULL)))));

-- Policy 25/325: client_brand_memberships.clients_can_request_membership
DROP POLICY IF EXISTS "clients_can_request_membership" ON public.client_brand_memberships;
CREATE POLICY "clients_can_request_membership"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (((client_id IN ( SELECT clients.id
   FROM clients
  WHERE ((clients.user_id = (SELECT auth.uid())) AND (clients.deleted_at IS NULL)))) AND (membership_status = 'pending'::membership_status_enum) AND (brand_id IN ( SELECT b.id
   FROM (brands b
     JOIN clients c ON ((c.tenant_id = b.tenant_id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL) AND (b.deleted_at IS NULL) AND (b.status = 'active'::brand_status_enum))))));

-- Policy 26/325: client_brand_memberships.clients_select_own_memberships
DROP POLICY IF EXISTS "clients_select_own_memberships" ON public.client_brand_memberships;
CREATE POLICY "clients_select_own_memberships"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_id IN ( SELECT c.id
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL))))));

-- Policy 27/325: client_brand_memberships.clients_update_own_memberships
DROP POLICY IF EXISTS "clients_update_own_memberships" ON public.client_brand_memberships;
CREATE POLICY "clients_update_own_memberships"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((deleted_at IS NULL) AND (client_id IN ( SELECT c.id
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL))))));

-- Policy 28/325: client_brand_memberships.tenant_admins_manage_client_brand_memberships
DROP POLICY IF EXISTS "tenant_admins_manage_client_brand_memberships" ON public.client_brand_memberships;
CREATE POLICY "tenant_admins_manage_client_brand_memberships"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 29/325: client_brand_memberships.tenant_admins_select_client_brand_memberships
DROP POLICY IF EXISTS "tenant_admins_select_client_brand_memberships" ON public.client_brand_memberships;
CREATE POLICY "tenant_admins_select_client_brand_memberships"
  ON public.client_brand_memberships
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 30/325: client_invoice_data.admins_delete_client_invoice_data
DROP POLICY IF EXISTS "admins_delete_client_invoice_data" ON public.client_invoice_data;
CREATE POLICY "admins_delete_client_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 31/325: client_invoice_data.admins_insert_client_invoice_data
DROP POLICY IF EXISTS "admins_insert_client_invoice_data" ON public.client_invoice_data;
CREATE POLICY "admins_insert_client_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 32/325: client_invoice_data.admins_select_client_invoice_data
DROP POLICY IF EXISTS "admins_select_client_invoice_data" ON public.client_invoice_data;
CREATE POLICY "admins_select_client_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 33/325: client_invoice_data.admins_update_client_invoice_data
DROP POLICY IF EXISTS "admins_update_client_invoice_data" ON public.client_invoice_data;
CREATE POLICY "admins_update_client_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 34/325: client_invoice_data.clients_manage_own_invoice_data
DROP POLICY IF EXISTS "clients_manage_own_invoice_data" ON public.client_invoice_data;
CREATE POLICY "clients_manage_own_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (client_id IN ( SELECT c.id
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL))))));

-- Policy 35/325: client_invoice_data.clients_select_own_invoice_data
DROP POLICY IF EXISTS "clients_select_own_invoice_data" ON public.client_invoice_data;
CREATE POLICY "clients_select_own_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_id IN ( SELECT c.id
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL))))));

-- Policy 36/325: client_invoice_data.field_users_manage_client_invoice_data
DROP POLICY IF EXISTS "field_users_manage_client_invoice_data" ON public.client_invoice_data;
CREATE POLICY "field_users_manage_client_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 37/325: client_invoice_data.field_users_select_client_invoice_data
DROP POLICY IF EXISTS "field_users_select_client_invoice_data" ON public.client_invoice_data;
CREATE POLICY "field_users_select_client_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 38/325: client_invoice_data.tenant_admins_manage_client_invoice_data
DROP POLICY IF EXISTS "tenant_admins_manage_client_invoice_data" ON public.client_invoice_data;
CREATE POLICY "tenant_admins_manage_client_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 39/325: client_invoice_data.tenant_admins_select_client_invoice_data
DROP POLICY IF EXISTS "tenant_admins_select_client_invoice_data" ON public.client_invoice_data;
CREATE POLICY "tenant_admins_select_client_invoice_data"
  ON public.client_invoice_data
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 40/325: client_tier_assignments.admins_delete_client_tier_assignments
DROP POLICY IF EXISTS "admins_delete_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "admins_delete_client_tier_assignments"
  ON public.client_tier_assignments
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 41/325: client_tier_assignments.admins_insert_client_tier_assignments
DROP POLICY IF EXISTS "admins_insert_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "admins_insert_client_tier_assignments"
  ON public.client_tier_assignments
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 42/325: client_tier_assignments.admins_select_client_tier_assignments
DROP POLICY IF EXISTS "admins_select_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "admins_select_client_tier_assignments"
  ON public.client_tier_assignments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 43/325: client_tier_assignments.admins_update_client_tier_assignments
DROP POLICY IF EXISTS "admins_update_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "admins_update_client_tier_assignments"
  ON public.client_tier_assignments
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 44/325: client_tier_assignments.clients_select_own_tier_assignments
DROP POLICY IF EXISTS "clients_select_own_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "clients_select_own_tier_assignments"
  ON public.client_tier_assignments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_brand_membership_id IN ( SELECT cbm.id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))));

-- Policy 45/325: client_tier_assignments.promotors_select_client_tier_assignments
DROP POLICY IF EXISTS "promotors_select_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "promotors_select_client_tier_assignments"
  ON public.client_tier_assignments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_brand_membership_id IN ( SELECT cbm.id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.id IN ( SELECT DISTINCT v.client_id
           FROM visits v
          WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
                  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'promotor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL)))) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))));

-- Policy 46/325: client_tier_assignments.tenant_admins_manage_client_tier_assignments
DROP POLICY IF EXISTS "tenant_admins_manage_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "tenant_admins_manage_client_tier_assignments"
  ON public.client_tier_assignments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 47/325: client_tier_assignments.tenant_admins_select_client_tier_assignments
DROP POLICY IF EXISTS "tenant_admins_select_client_tier_assignments" ON public.client_tier_assignments;
CREATE POLICY "tenant_admins_select_client_tier_assignments"
  ON public.client_tier_assignments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 48/325: client_types.admins_delete_client_types
DROP POLICY IF EXISTS "admins_delete_client_types" ON public.client_types;
CREATE POLICY "admins_delete_client_types"
  ON public.client_types
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 49/325: client_types.admins_insert_client_types
DROP POLICY IF EXISTS "admins_insert_client_types" ON public.client_types;
CREATE POLICY "admins_insert_client_types"
  ON public.client_types
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 50/325: client_types.admins_select_client_types
DROP POLICY IF EXISTS "admins_select_client_types" ON public.client_types;
CREATE POLICY "admins_select_client_types"
  ON public.client_types
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 51/325: client_types.admins_update_client_types
DROP POLICY IF EXISTS "admins_update_client_types" ON public.client_types;
CREATE POLICY "admins_update_client_types"
  ON public.client_types
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 52/325: client_types.brand_managers_select_client_types
DROP POLICY IF EXISTS "brand_managers_select_client_types" ON public.client_types;
CREATE POLICY "brand_managers_select_client_types"
  ON public.client_types
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT b.tenant_id
   FROM ((user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
     JOIN brands b ON ((ur.brand_id = b.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL) AND (b.deleted_at IS NULL))))));

-- Policy 53/325: client_types.clients_select_assigned_client_type
DROP POLICY IF EXISTS "clients_select_assigned_client_type" ON public.client_types;
CREATE POLICY "clients_select_assigned_client_type"
  ON public.client_types
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (EXISTS ( SELECT 1
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.client_type_id = client_types.id) AND (c.deleted_at IS NULL))))));

-- Policy 54/325: client_types.field_users_select_client_types
DROP POLICY IF EXISTS "field_users_select_client_types" ON public.client_types;
CREATE POLICY "field_users_select_client_types"
  ON public.client_types
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 55/325: client_types.tenant_admins_manage_client_types
DROP POLICY IF EXISTS "tenant_admins_manage_client_types" ON public.client_types;
CREATE POLICY "tenant_admins_manage_client_types"
  ON public.client_types
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 56/325: client_types.tenant_admins_select_client_types
DROP POLICY IF EXISTS "tenant_admins_select_client_types" ON public.client_types;
CREATE POLICY "tenant_admins_select_client_types"
  ON public.client_types
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 57/325: clients.admins_delete_clients
DROP POLICY IF EXISTS "admins_delete_clients" ON public.clients;
CREATE POLICY "admins_delete_clients"
  ON public.clients
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 58/325: clients.admins_insert_clients
DROP POLICY IF EXISTS "admins_insert_clients" ON public.clients;
CREATE POLICY "admins_insert_clients"
  ON public.clients
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 59/325: clients.admins_select_clients
DROP POLICY IF EXISTS "admins_select_clients" ON public.clients;
CREATE POLICY "admins_select_clients"
  ON public.clients
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 60/325: clients.admins_update_clients
DROP POLICY IF EXISTS "admins_update_clients" ON public.clients;
CREATE POLICY "admins_update_clients"
  ON public.clients
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 61/325: clients.brand_managers_select_clients
DROP POLICY IF EXISTS "brand_managers_select_clients" ON public.clients;
CREATE POLICY "brand_managers_select_clients"
  ON public.clients
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT b.tenant_id
   FROM ((user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
     JOIN brands b ON ((ur.brand_id = b.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL) AND (b.deleted_at IS NULL))))));

-- Policy 62/325: clients.clients_select_own_profile
DROP POLICY IF EXISTS "clients_select_own_profile" ON public.clients;
CREATE POLICY "clients_select_own_profile"
  ON public.clients
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (user_id = (SELECT auth.uid()))));

-- Policy 63/325: clients.clients_update_own_profile
DROP POLICY IF EXISTS "clients_update_own_profile" ON public.clients;
CREATE POLICY "clients_update_own_profile"
  ON public.clients
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((deleted_at IS NULL) AND (user_id = (SELECT auth.uid()))));

-- Policy 64/325: clients.field_users_select_clients
DROP POLICY IF EXISTS "field_users_select_clients" ON public.clients;
CREATE POLICY "field_users_select_clients"
  ON public.clients
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 65/325: clients.tenant_admins_manage_clients
DROP POLICY IF EXISTS "tenant_admins_manage_clients" ON public.clients;
CREATE POLICY "tenant_admins_manage_clients"
  ON public.clients
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 66/325: clients.tenant_admins_select_clients
DROP POLICY IF EXISTS "tenant_admins_select_clients" ON public.clients;
CREATE POLICY "tenant_admins_select_clients"
  ON public.clients
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 67/325: commercial_structures.admins_delete_commercial_structures
DROP POLICY IF EXISTS "admins_delete_commercial_structures" ON public.commercial_structures;
CREATE POLICY "admins_delete_commercial_structures"
  ON public.commercial_structures
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 68/325: commercial_structures.admins_insert_commercial_structures
DROP POLICY IF EXISTS "admins_insert_commercial_structures" ON public.commercial_structures;
CREATE POLICY "admins_insert_commercial_structures"
  ON public.commercial_structures
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 69/325: commercial_structures.admins_select_commercial_structures
DROP POLICY IF EXISTS "admins_select_commercial_structures" ON public.commercial_structures;
CREATE POLICY "admins_select_commercial_structures"
  ON public.commercial_structures
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 70/325: commercial_structures.admins_update_commercial_structures
DROP POLICY IF EXISTS "admins_update_commercial_structures" ON public.commercial_structures;
CREATE POLICY "admins_update_commercial_structures"
  ON public.commercial_structures
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 71/325: commercial_structures.brand_managers_select_commercial_structures
DROP POLICY IF EXISTS "brand_managers_select_commercial_structures" ON public.commercial_structures;
CREATE POLICY "brand_managers_select_commercial_structures"
  ON public.commercial_structures
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT b.tenant_id
   FROM ((user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
     JOIN brands b ON ((ur.brand_id = b.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL) AND (b.deleted_at IS NULL))))));

-- Policy 72/325: commercial_structures.clients_select_assigned_commercial_structure
DROP POLICY IF EXISTS "clients_select_assigned_commercial_structure" ON public.commercial_structures;
CREATE POLICY "clients_select_assigned_commercial_structure"
  ON public.commercial_structures
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (EXISTS ( SELECT 1
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.commercial_structure_id = commercial_structures.id) AND (c.deleted_at IS NULL))))));

-- Policy 73/325: commercial_structures.field_users_select_commercial_structures
DROP POLICY IF EXISTS "field_users_select_commercial_structures" ON public.commercial_structures;
CREATE POLICY "field_users_select_commercial_structures"
  ON public.commercial_structures
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 74/325: commercial_structures.tenant_admins_manage_commercial_structures
DROP POLICY IF EXISTS "tenant_admins_manage_commercial_structures" ON public.commercial_structures;
CREATE POLICY "tenant_admins_manage_commercial_structures"
  ON public.commercial_structures
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 75/325: commercial_structures.tenant_admins_select_commercial_structures
DROP POLICY IF EXISTS "tenant_admins_select_commercial_structures" ON public.commercial_structures;
CREATE POLICY "tenant_admins_select_commercial_structures"
  ON public.commercial_structures
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 76/325: distributors.admins_manage_distributors
DROP POLICY IF EXISTS "admins_manage_distributors" ON public.distributors;
CREATE POLICY "admins_manage_distributors"
  ON public.distributors
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 77/325: distributors.asesor_ventas_select_own_distributor
DROP POLICY IF EXISTS "asesor_ventas_select_own_distributor" ON public.distributors;
CREATE POLICY "asesor_ventas_select_own_distributor"
  ON public.distributors
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (id IN ( SELECT up.distributor_id
   FROM user_profiles up
  WHERE ((up.user_id = (SELECT auth.uid())) AND (up.deleted_at IS NULL))))));

-- Policy 78/325: distributors.brand_managers_select_distributors
DROP POLICY IF EXISTS "brand_managers_select_distributors" ON public.distributors;
CREATE POLICY "brand_managers_select_distributors"
  ON public.distributors
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['brand_manager'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 79/325: kpi_definitions.kpi_definitions_tenant_isolation
DROP POLICY IF EXISTS "kpi_definitions_tenant_isolation" ON public.kpi_definitions;
CREATE POLICY "kpi_definitions_tenant_isolation"
  ON public.kpi_definitions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT up.tenant_id
   FROM user_profiles up
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 80/325: kpi_targets.kpi_targets_tenant_isolation
DROP POLICY IF EXISTS "kpi_targets_tenant_isolation" ON public.kpi_targets;
CREATE POLICY "kpi_targets_tenant_isolation"
  ON public.kpi_targets
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT up.tenant_id
   FROM user_profiles up
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 81/325: markets.admins_delete_markets
DROP POLICY IF EXISTS "admins_delete_markets" ON public.markets;
CREATE POLICY "admins_delete_markets"
  ON public.markets
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 82/325: markets.admins_insert_markets
DROP POLICY IF EXISTS "admins_insert_markets" ON public.markets;
CREATE POLICY "admins_insert_markets"
  ON public.markets
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 83/325: markets.admins_select_markets
DROP POLICY IF EXISTS "admins_select_markets" ON public.markets;
CREATE POLICY "admins_select_markets"
  ON public.markets
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 84/325: markets.admins_update_markets
DROP POLICY IF EXISTS "admins_update_markets" ON public.markets;
CREATE POLICY "admins_update_markets"
  ON public.markets
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 85/325: markets.brand_managers_select_markets
DROP POLICY IF EXISTS "brand_managers_select_markets" ON public.markets;
CREATE POLICY "brand_managers_select_markets"
  ON public.markets
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT b.tenant_id
   FROM ((user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
     JOIN brands b ON ((ur.brand_id = b.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL) AND (b.deleted_at IS NULL))))));

-- Policy 86/325: markets.clients_select_assigned_market
DROP POLICY IF EXISTS "clients_select_assigned_market" ON public.markets;
CREATE POLICY "clients_select_assigned_market"
  ON public.markets
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (EXISTS ( SELECT 1
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.market_id = markets.id) AND (c.deleted_at IS NULL))))));

-- Policy 87/325: markets.field_users_select_markets
DROP POLICY IF EXISTS "field_users_select_markets" ON public.markets;
CREATE POLICY "field_users_select_markets"
  ON public.markets
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 88/325: markets.tenant_admins_manage_markets
DROP POLICY IF EXISTS "tenant_admins_manage_markets" ON public.markets;
CREATE POLICY "tenant_admins_manage_markets"
  ON public.markets
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 89/325: markets.tenant_admins_select_markets
DROP POLICY IF EXISTS "tenant_admins_select_markets" ON public.markets;
CREATE POLICY "tenant_admins_select_markets"
  ON public.markets
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 90/325: notifications.notifications_select_own
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND (user_profile_id IN ( SELECT user_profiles.id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid()))))));

-- Policy 91/325: notifications.notifications_update_own
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND (user_profile_id IN ( SELECT user_profiles.id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid()))))))
  WITH CHECK (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND (user_profile_id IN ( SELECT user_profiles.id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid()))))));

-- Policy 92/325: order_items.asesor_ventas_manage_order_items
DROP POLICY IF EXISTS "asesor_ventas_manage_order_items" ON public.order_items;
CREATE POLICY "asesor_ventas_manage_order_items"
  ON public.order_items
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((order_id IN ( SELECT o.id
   FROM orders o
  WHERE ((o.assigned_to IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'asesor_de_ventas'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (o.deleted_at IS NULL)))));

-- Policy 93/325: order_items.policy_order_items_admin_all
DROP POLICY IF EXISTS "policy_order_items_admin_all" ON public.order_items;
CREATE POLICY "policy_order_items_admin_all"
  ON public.order_items
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.tenant_id IS NULL) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.tenant_id IS NULL) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 94/325: order_items.policy_order_items_brand_manager
DROP POLICY IF EXISTS "policy_order_items_brand_manager" ON public.order_items;
CREATE POLICY "policy_order_items_brand_manager"
  ON public.order_items
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((product_id IN ( SELECT p.id
   FROM (products p
     JOIN user_roles ur ON ((ur.brand_id = p.brand_id)))
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL) AND (p.deleted_at IS NULL)))) AND (deleted_at IS NULL)));

-- Policy 95/325: order_items.policy_order_items_client_delete
DROP POLICY IF EXISTS "policy_order_items_client_delete" ON public.order_items;
CREATE POLICY "policy_order_items_client_delete"
  ON public.order_items
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN clients c ON ((c.id = o.client_id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (o.order_status = 'draft'::order_status_enum) AND (o.deleted_at IS NULL) AND (c.deleted_at IS NULL)))) AND (deleted_at IS NULL)));

-- Policy 96/325: order_items.policy_order_items_client_insert
DROP POLICY IF EXISTS "policy_order_items_client_insert" ON public.order_items;
CREATE POLICY "policy_order_items_client_insert"
  ON public.order_items
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN clients c ON ((c.id = o.client_id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (o.order_status = 'draft'::order_status_enum) AND (o.deleted_at IS NULL) AND (c.deleted_at IS NULL)))));

-- Policy 97/325: order_items.policy_order_items_client_select
DROP POLICY IF EXISTS "policy_order_items_client_select" ON public.order_items;
CREATE POLICY "policy_order_items_client_select"
  ON public.order_items
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN clients c ON ((c.id = o.client_id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (o.deleted_at IS NULL) AND (c.deleted_at IS NULL)))) AND (deleted_at IS NULL)));

-- Policy 98/325: order_items.policy_order_items_client_update
DROP POLICY IF EXISTS "policy_order_items_client_update" ON public.order_items;
CREATE POLICY "policy_order_items_client_update"
  ON public.order_items
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN clients c ON ((c.id = o.client_id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (o.order_status = 'draft'::order_status_enum) AND (o.deleted_at IS NULL) AND (c.deleted_at IS NULL)))) AND (deleted_at IS NULL)))
  WITH CHECK ((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN clients c ON ((c.id = o.client_id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (o.order_status = 'draft'::order_status_enum) AND (o.deleted_at IS NULL) AND (c.deleted_at IS NULL)))));

-- Policy 99/325: order_items.policy_order_items_promotor
DROP POLICY IF EXISTS "policy_order_items_promotor" ON public.order_items;
CREATE POLICY "policy_order_items_promotor"
  ON public.order_items
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((order_id IN ( SELECT o.id
   FROM orders o
  WHERE ((o.assigned_to IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'promotor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (o.deleted_at IS NULL)))));

-- Policy 100/325: order_items.policy_order_items_supervisor
DROP POLICY IF EXISTS "policy_order_items_supervisor" ON public.order_items;
CREATE POLICY "policy_order_items_supervisor"
  ON public.order_items
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN clients c ON ((c.id = o.client_id)))
  WHERE ((c.id IN ( SELECT DISTINCT v.client_id
           FROM visits v
          WHERE ((v.promotor_id IN ( SELECT up.id
                   FROM user_profiles up
                  WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                           FROM (user_roles ur
                             JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                          WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL)))) AND (o.deleted_at IS NULL) AND (c.deleted_at IS NULL)))) AND (deleted_at IS NULL)));

-- Policy 101/325: order_items.policy_order_items_tenant_admin
DROP POLICY IF EXISTS "policy_order_items_tenant_admin" ON public.order_items;
CREATE POLICY "policy_order_items_tenant_admin"
  ON public.order_items
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((tenant_id IN ( SELECT ur.tenant_id
   FROM user_roles ur
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.tenant_id IS NOT NULL) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))))
  WITH CHECK ((tenant_id IN ( SELECT ur.tenant_id
   FROM user_roles ur
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.tenant_id IS NOT NULL) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 102/325: orders.admins_insert_orders
DROP POLICY IF EXISTS "admins_insert_orders" ON public.orders;
CREATE POLICY "admins_insert_orders"
  ON public.orders
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 103/325: orders.admins_select_orders
DROP POLICY IF EXISTS "admins_select_orders" ON public.orders;
CREATE POLICY "admins_select_orders"
  ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 104/325: orders.admins_update_orders
DROP POLICY IF EXISTS "admins_update_orders" ON public.orders;
CREATE POLICY "admins_update_orders"
  ON public.orders
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 105/325: orders.asesor_ventas_manage_orders
DROP POLICY IF EXISTS "asesor_ventas_manage_orders" ON public.orders;
CREATE POLICY "asesor_ventas_manage_orders"
  ON public.orders
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (assigned_to IN ( SELECT ur.user_profile_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'asesor_de_ventas'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 106/325: orders.asesor_ventas_select_orders
DROP POLICY IF EXISTS "asesor_ventas_select_orders" ON public.orders;
CREATE POLICY "asesor_ventas_select_orders"
  ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (assigned_to IN ( SELECT ur.user_profile_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'asesor_de_ventas'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 107/325: orders.brand_managers_select_orders
DROP POLICY IF EXISTS "brand_managers_select_orders" ON public.orders;
CREATE POLICY "brand_managers_select_orders"
  ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 108/325: orders.clients_insert_own_orders
DROP POLICY IF EXISTS "clients_insert_own_orders" ON public.orders;
CREATE POLICY "clients_insert_own_orders"
  ON public.orders
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((client_id IN ( SELECT c.id
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL)))));

-- Policy 109/325: orders.clients_select_own_orders
DROP POLICY IF EXISTS "clients_select_own_orders" ON public.orders;
CREATE POLICY "clients_select_own_orders"
  ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_id IN ( SELECT c.id
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL))))));

-- Policy 110/325: orders.clients_update_own_draft_orders
DROP POLICY IF EXISTS "clients_update_own_draft_orders" ON public.orders;
CREATE POLICY "clients_update_own_draft_orders"
  ON public.orders
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((deleted_at IS NULL) AND (order_status = 'draft'::order_status_enum) AND (client_id IN ( SELECT c.id
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL))))));

-- Policy 111/325: orders.promotors_select_orders
DROP POLICY IF EXISTS "promotors_select_orders" ON public.orders;
CREATE POLICY "promotors_select_orders"
  ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND ((assigned_to IN ( SELECT ur.user_profile_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'promotor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) OR (client_id IN ( SELECT c.id
   FROM (clients c
     JOIN visits v ON ((v.client_id = c.id)))
  WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'promotor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL) AND (c.deleted_at IS NULL)))))));

-- Policy 112/325: orders.supervisors_select_orders
DROP POLICY IF EXISTS "supervisors_select_orders" ON public.orders;
CREATE POLICY "supervisors_select_orders"
  ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_id IN ( SELECT c.id
   FROM clients c
  WHERE ((c.id IN ( SELECT DISTINCT v.client_id
           FROM visits v
          WHERE ((v.promotor_id IN ( SELECT up.id
                   FROM user_profiles up
                  WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                           FROM (user_roles ur
                             JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                          WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL)))) AND (c.deleted_at IS NULL))))));

-- Policy 113/325: orders.tenant_admins_manage_orders
DROP POLICY IF EXISTS "tenant_admins_manage_orders" ON public.orders;
CREATE POLICY "tenant_admins_manage_orders"
  ON public.orders
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 114/325: orders.tenant_admins_select_orders
DROP POLICY IF EXISTS "tenant_admins_select_orders" ON public.orders;
CREATE POLICY "tenant_admins_select_orders"
  ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 115/325: points_transactions.admins_insert_points_transactions
DROP POLICY IF EXISTS "admins_insert_points_transactions" ON public.points_transactions;
CREATE POLICY "admins_insert_points_transactions"
  ON public.points_transactions
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 116/325: points_transactions.admins_select_points_transactions
DROP POLICY IF EXISTS "admins_select_points_transactions" ON public.points_transactions;
CREATE POLICY "admins_select_points_transactions"
  ON public.points_transactions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 117/325: points_transactions.admins_update_points_transactions
DROP POLICY IF EXISTS "admins_update_points_transactions" ON public.points_transactions;
CREATE POLICY "admins_update_points_transactions"
  ON public.points_transactions
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 118/325: points_transactions.clients_select_own_points_transactions
DROP POLICY IF EXISTS "clients_select_own_points_transactions" ON public.points_transactions;
CREATE POLICY "clients_select_own_points_transactions"
  ON public.points_transactions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_brand_membership_id IN ( SELECT cbm.id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))));

-- Policy 119/325: points_transactions.promotors_select_points_transactions
DROP POLICY IF EXISTS "promotors_select_points_transactions" ON public.points_transactions;
CREATE POLICY "promotors_select_points_transactions"
  ON public.points_transactions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_brand_membership_id IN ( SELECT cbm.id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.id IN ( SELECT DISTINCT v.client_id
           FROM visits v
          WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
                  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'promotor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL)))) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))));

-- Policy 120/325: points_transactions.tenant_admins_manage_points_transactions
DROP POLICY IF EXISTS "tenant_admins_manage_points_transactions" ON public.points_transactions;
CREATE POLICY "tenant_admins_manage_points_transactions"
  ON public.points_transactions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 121/325: points_transactions.tenant_admins_select_points_transactions
DROP POLICY IF EXISTS "tenant_admins_select_points_transactions" ON public.points_transactions;
CREATE POLICY "tenant_admins_select_points_transactions"
  ON public.points_transactions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 122/325: product_categories.admins_delete_product_categories
DROP POLICY IF EXISTS "admins_delete_product_categories" ON public.product_categories;
CREATE POLICY "admins_delete_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 123/325: product_categories.admins_insert_product_categories
DROP POLICY IF EXISTS "admins_insert_product_categories" ON public.product_categories;
CREATE POLICY "admins_insert_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 124/325: product_categories.admins_select_product_categories
DROP POLICY IF EXISTS "admins_select_product_categories" ON public.product_categories;
CREATE POLICY "admins_select_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 125/325: product_categories.admins_update_product_categories
DROP POLICY IF EXISTS "admins_update_product_categories" ON public.product_categories;
CREATE POLICY "admins_update_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 126/325: product_categories.brand_managers_manage_product_categories
DROP POLICY IF EXISTS "brand_managers_manage_product_categories" ON public.product_categories;
CREATE POLICY "brand_managers_manage_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 127/325: product_categories.brand_managers_select_product_categories
DROP POLICY IF EXISTS "brand_managers_select_product_categories" ON public.product_categories;
CREATE POLICY "brand_managers_select_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND ((brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) OR ((brand_id IS NULL) AND (tenant_id IN ( SELECT b.tenant_id
   FROM ((user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
     JOIN brands b ON ((ur.brand_id = b.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL) AND (b.deleted_at IS NULL))))))));

-- Policy 128/325: product_categories.clients_select_product_categories
DROP POLICY IF EXISTS "clients_select_product_categories" ON public.product_categories;
CREATE POLICY "clients_select_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND ((brand_id IN ( SELECT cbm.brand_id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.membership_status = 'active'::membership_status_enum) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL)))) OR ((brand_id IS NULL) AND (tenant_id IN ( SELECT cbm.tenant_id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.membership_status = 'active'::membership_status_enum) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))))));

-- Policy 129/325: product_categories.field_users_select_product_categories
DROP POLICY IF EXISTS "field_users_select_product_categories" ON public.product_categories;
CREATE POLICY "field_users_select_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (((brand_id IS NOT NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))) OR ((brand_id IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))))));

-- Policy 130/325: product_categories.tenant_admins_manage_product_categories
DROP POLICY IF EXISTS "tenant_admins_manage_product_categories" ON public.product_categories;
CREATE POLICY "tenant_admins_manage_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 131/325: product_categories.tenant_admins_select_product_categories
DROP POLICY IF EXISTS "tenant_admins_select_product_categories" ON public.product_categories;
CREATE POLICY "tenant_admins_select_product_categories"
  ON public.product_categories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 132/325: product_variants.admins_delete_product_variants
DROP POLICY IF EXISTS "admins_delete_product_variants" ON public.product_variants;
CREATE POLICY "admins_delete_product_variants"
  ON public.product_variants
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 133/325: product_variants.admins_insert_product_variants
DROP POLICY IF EXISTS "admins_insert_product_variants" ON public.product_variants;
CREATE POLICY "admins_insert_product_variants"
  ON public.product_variants
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 134/325: product_variants.admins_select_product_variants
DROP POLICY IF EXISTS "admins_select_product_variants" ON public.product_variants;
CREATE POLICY "admins_select_product_variants"
  ON public.product_variants
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 135/325: product_variants.admins_update_product_variants
DROP POLICY IF EXISTS "admins_update_product_variants" ON public.product_variants;
CREATE POLICY "admins_update_product_variants"
  ON public.product_variants
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 136/325: product_variants.brand_managers_manage_product_variants
DROP POLICY IF EXISTS "brand_managers_manage_product_variants" ON public.product_variants;
CREATE POLICY "brand_managers_manage_product_variants"
  ON public.product_variants
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (product_id IN ( SELECT p.id
   FROM products p
  WHERE ((p.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (p.deleted_at IS NULL))))));

-- Policy 137/325: product_variants.brand_managers_select_product_variants
DROP POLICY IF EXISTS "brand_managers_select_product_variants" ON public.product_variants;
CREATE POLICY "brand_managers_select_product_variants"
  ON public.product_variants
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (product_id IN ( SELECT p.id
   FROM products p
  WHERE ((p.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (p.deleted_at IS NULL))))));

-- Policy 138/325: product_variants.clients_select_product_variants
DROP POLICY IF EXISTS "clients_select_product_variants" ON public.product_variants;
CREATE POLICY "clients_select_product_variants"
  ON public.product_variants
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (product_id IN ( SELECT p.id
   FROM products p
  WHERE ((p.brand_id IN ( SELECT cbm.brand_id
           FROM (client_brand_memberships cbm
             JOIN clients c ON ((cbm.client_id = c.id)))
          WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.membership_status = 'active'::membership_status_enum) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL)))) AND (p.deleted_at IS NULL) AND (p.is_active = true))))));

-- Policy 139/325: product_variants.tenant_admins_manage_product_variants
DROP POLICY IF EXISTS "tenant_admins_manage_product_variants" ON public.product_variants;
CREATE POLICY "tenant_admins_manage_product_variants"
  ON public.product_variants
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 140/325: product_variants.tenant_admins_select_product_variants
DROP POLICY IF EXISTS "tenant_admins_select_product_variants" ON public.product_variants;
CREATE POLICY "tenant_admins_select_product_variants"
  ON public.product_variants
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 141/325: products.admins_delete_products
DROP POLICY IF EXISTS "admins_delete_products" ON public.products;
CREATE POLICY "admins_delete_products"
  ON public.products
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 142/325: products.admins_insert_products
DROP POLICY IF EXISTS "admins_insert_products" ON public.products;
CREATE POLICY "admins_insert_products"
  ON public.products
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 143/325: products.admins_select_products
DROP POLICY IF EXISTS "admins_select_products" ON public.products;
CREATE POLICY "admins_select_products"
  ON public.products
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 144/325: products.admins_update_products
DROP POLICY IF EXISTS "admins_update_products" ON public.products;
CREATE POLICY "admins_update_products"
  ON public.products
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 145/325: products.asesor_ventas_select_products
DROP POLICY IF EXISTS "asesor_ventas_select_products" ON public.products;
CREATE POLICY "asesor_ventas_select_products"
  ON public.products
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'asesor_de_ventas'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 146/325: products.brand_managers_manage_products
DROP POLICY IF EXISTS "brand_managers_manage_products" ON public.products;
CREATE POLICY "brand_managers_manage_products"
  ON public.products
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 147/325: products.brand_managers_select_products
DROP POLICY IF EXISTS "brand_managers_select_products" ON public.products;
CREATE POLICY "brand_managers_select_products"
  ON public.products
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 148/325: products.clients_select_products
DROP POLICY IF EXISTS "clients_select_products" ON public.products;
CREATE POLICY "clients_select_products"
  ON public.products
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (brand_id IN ( SELECT cbm.brand_id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.membership_status = 'active'::membership_status_enum) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))));

-- Policy 149/325: products.tenant_admins_manage_products
DROP POLICY IF EXISTS "tenant_admins_manage_products" ON public.products;
CREATE POLICY "tenant_admins_manage_products"
  ON public.products
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 150/325: products.tenant_admins_select_products
DROP POLICY IF EXISTS "tenant_admins_select_products" ON public.products;
CREATE POLICY "tenant_admins_select_products"
  ON public.products
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 151/325: promotion_redemptions.admins_insert_promotion_redemptions
DROP POLICY IF EXISTS "admins_insert_promotion_redemptions" ON public.promotion_redemptions;
CREATE POLICY "admins_insert_promotion_redemptions"
  ON public.promotion_redemptions
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 152/325: promotion_redemptions.admins_select_promotion_redemptions
DROP POLICY IF EXISTS "admins_select_promotion_redemptions" ON public.promotion_redemptions;
CREATE POLICY "admins_select_promotion_redemptions"
  ON public.promotion_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 153/325: promotion_redemptions.admins_update_promotion_redemptions
DROP POLICY IF EXISTS "admins_update_promotion_redemptions" ON public.promotion_redemptions;
CREATE POLICY "admins_update_promotion_redemptions"
  ON public.promotion_redemptions
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 154/325: promotion_redemptions.brand_managers_select_promotion_redemptions
DROP POLICY IF EXISTS "brand_managers_select_promotion_redemptions" ON public.promotion_redemptions;
CREATE POLICY "brand_managers_select_promotion_redemptions"
  ON public.promotion_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (promotion_id IN ( SELECT p.id
   FROM promotions p
  WHERE ((p.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (p.deleted_at IS NULL))))));

-- Policy 155/325: promotion_redemptions.clients_select_own_promotion_redemptions
DROP POLICY IF EXISTS "clients_select_own_promotion_redemptions" ON public.promotion_redemptions;
CREATE POLICY "clients_select_own_promotion_redemptions"
  ON public.promotion_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_brand_membership_id IN ( SELECT cbm.id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))));

-- Policy 156/325: promotion_redemptions.promotors_select_promotion_redemptions
DROP POLICY IF EXISTS "promotors_select_promotion_redemptions" ON public.promotion_redemptions;
CREATE POLICY "promotors_select_promotion_redemptions"
  ON public.promotion_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (applied_by IN ( SELECT ur.user_profile_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'promotor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 157/325: promotion_redemptions.tenant_admins_manage_promotion_redemptions
DROP POLICY IF EXISTS "tenant_admins_manage_promotion_redemptions" ON public.promotion_redemptions;
CREATE POLICY "tenant_admins_manage_promotion_redemptions"
  ON public.promotion_redemptions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 158/325: promotion_redemptions.tenant_admins_select_promotion_redemptions
DROP POLICY IF EXISTS "tenant_admins_select_promotion_redemptions" ON public.promotion_redemptions;
CREATE POLICY "tenant_admins_select_promotion_redemptions"
  ON public.promotion_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 159/325: promotion_rules.admins_delete_promotion_rules
DROP POLICY IF EXISTS "admins_delete_promotion_rules" ON public.promotion_rules;
CREATE POLICY "admins_delete_promotion_rules"
  ON public.promotion_rules
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 160/325: promotion_rules.admins_insert_promotion_rules
DROP POLICY IF EXISTS "admins_insert_promotion_rules" ON public.promotion_rules;
CREATE POLICY "admins_insert_promotion_rules"
  ON public.promotion_rules
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 161/325: promotion_rules.admins_select_promotion_rules
DROP POLICY IF EXISTS "admins_select_promotion_rules" ON public.promotion_rules;
CREATE POLICY "admins_select_promotion_rules"
  ON public.promotion_rules
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 162/325: promotion_rules.admins_update_promotion_rules
DROP POLICY IF EXISTS "admins_update_promotion_rules" ON public.promotion_rules;
CREATE POLICY "admins_update_promotion_rules"
  ON public.promotion_rules
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 163/325: promotion_rules.brand_managers_manage_promotion_rules
DROP POLICY IF EXISTS "brand_managers_manage_promotion_rules" ON public.promotion_rules;
CREATE POLICY "brand_managers_manage_promotion_rules"
  ON public.promotion_rules
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (promotion_id IN ( SELECT p.id
   FROM promotions p
  WHERE ((p.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (p.deleted_at IS NULL))))));

-- Policy 164/325: promotion_rules.brand_managers_select_promotion_rules
DROP POLICY IF EXISTS "brand_managers_select_promotion_rules" ON public.promotion_rules;
CREATE POLICY "brand_managers_select_promotion_rules"
  ON public.promotion_rules
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (promotion_id IN ( SELECT p.id
   FROM promotions p
  WHERE ((p.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (p.deleted_at IS NULL))))));

-- Policy 165/325: promotion_rules.field_users_select_promotion_rules
DROP POLICY IF EXISTS "field_users_select_promotion_rules" ON public.promotion_rules;
CREATE POLICY "field_users_select_promotion_rules"
  ON public.promotion_rules
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (promotion_id IN ( SELECT p.id
   FROM promotions p
  WHERE ((p.status = 'active'::promotion_status_enum) AND (p.start_date <= CURRENT_DATE) AND (p.end_date >= CURRENT_DATE) AND (p.tenant_id IN ( SELECT ur.tenant_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (p.deleted_at IS NULL))))));

-- Policy 166/325: promotion_rules.tenant_admins_manage_promotion_rules
DROP POLICY IF EXISTS "tenant_admins_manage_promotion_rules" ON public.promotion_rules;
CREATE POLICY "tenant_admins_manage_promotion_rules"
  ON public.promotion_rules
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 167/325: promotion_rules.tenant_admins_select_promotion_rules
DROP POLICY IF EXISTS "tenant_admins_select_promotion_rules" ON public.promotion_rules;
CREATE POLICY "tenant_admins_select_promotion_rules"
  ON public.promotion_rules
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 168/325: promotions.Clients can view active promotions from their brands
DROP POLICY IF EXISTS "Clients can view active promotions from their brands" ON public.promotions;
CREATE POLICY "Clients can view active promotions from their brands"
  ON public.promotions
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((EXISTS ( SELECT 1
   FROM (clients c
     JOIN client_brand_memberships cbm ON ((cbm.client_id = c.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.brand_id = promotions.brand_id) AND (cbm.membership_status = 'active'::membership_status_enum) AND (cbm.deleted_at IS NULL)))) OR (EXISTS ( SELECT 1
   FROM (user_profiles up
     JOIN user_roles ur ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = ANY (ARRAY['admin'::user_role_type_enum, 'brand_manager'::user_role_type_enum])))))));

-- Policy 169/325: promotions.admins_delete_promotions
DROP POLICY IF EXISTS "admins_delete_promotions" ON public.promotions;
CREATE POLICY "admins_delete_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 170/325: promotions.admins_insert_promotions
DROP POLICY IF EXISTS "admins_insert_promotions" ON public.promotions;
CREATE POLICY "admins_insert_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 171/325: promotions.admins_select_promotions
DROP POLICY IF EXISTS "admins_select_promotions" ON public.promotions;
CREATE POLICY "admins_select_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 172/325: promotions.admins_update_promotions
DROP POLICY IF EXISTS "admins_update_promotions" ON public.promotions;
CREATE POLICY "admins_update_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 173/325: promotions.asesor_ventas_select_promotions
DROP POLICY IF EXISTS "asesor_ventas_select_promotions" ON public.promotions;
CREATE POLICY "asesor_ventas_select_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (status = 'active'::promotion_status_enum) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'asesor_de_ventas'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 174/325: promotions.brand_managers_manage_promotions
DROP POLICY IF EXISTS "brand_managers_manage_promotions" ON public.promotions;
CREATE POLICY "brand_managers_manage_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 175/325: promotions.brand_managers_select_promotions
DROP POLICY IF EXISTS "brand_managers_select_promotions" ON public.promotions;
CREATE POLICY "brand_managers_select_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 176/325: promotions.field_users_select_promotions
DROP POLICY IF EXISTS "field_users_select_promotions" ON public.promotions;
CREATE POLICY "field_users_select_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (status = 'active'::promotion_status_enum) AND (start_date <= CURRENT_DATE) AND (end_date >= CURRENT_DATE) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 177/325: promotions.tenant_admins_manage_promotions
DROP POLICY IF EXISTS "tenant_admins_manage_promotions" ON public.promotions;
CREATE POLICY "tenant_admins_manage_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 178/325: promotions.tenant_admins_select_promotions
DROP POLICY IF EXISTS "tenant_admins_select_promotions" ON public.promotions;
CREATE POLICY "tenant_admins_select_promotions"
  ON public.promotions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 179/325: promotor_assignments.Admin and brand managers can manage promotor assignments
DROP POLICY IF EXISTS "Admin and brand managers can manage promotor assignments" ON public.promotor_assignments;
CREATE POLICY "Admin and brand managers can manage promotor assignments"
  ON public.promotor_assignments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['admin'::user_role_type_enum, 'brand_manager'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 180/325: promotor_assignments.Users can view promotor assignments in their tenant
DROP POLICY IF EXISTS "Users can view promotor assignments in their tenant" ON public.promotor_assignments;
CREATE POLICY "Users can view promotor assignments in their tenant"
  ON public.promotor_assignments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 181/325: qr_codes.admin_manage_qr_codes
DROP POLICY IF EXISTS "admin_manage_qr_codes" ON public.qr_codes;
CREATE POLICY "admin_manage_qr_codes"
  ON public.qr_codes
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT up.tenant_id
   FROM (user_profiles up
     JOIN user_roles ur ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum)))));

-- Policy 182/325: qr_codes.asesor_ventas_view_qr_codes
DROP POLICY IF EXISTS "asesor_ventas_view_qr_codes" ON public.qr_codes;
CREATE POLICY "asesor_ventas_view_qr_codes"
  ON public.qr_codes
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_profiles up
     JOIN user_roles ur ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'asesor_de_ventas'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND ((EXISTS ( SELECT 1
           FROM client_assignments ca
          WHERE ((ca.client_id = qr_codes.client_id) AND (ca.user_profile_id = up.id) AND (ca.is_active = true) AND (ca.deleted_at IS NULL)))) OR (EXISTS ( SELECT 1
           FROM client_brand_memberships cbm
          WHERE ((cbm.client_id = qr_codes.client_id) AND (cbm.brand_id = ur.brand_id) AND (cbm.deleted_at IS NULL)))))))));

-- Policy 183/325: qr_codes.clients_create_own_qr_codes
DROP POLICY IF EXISTS "clients_create_own_qr_codes" ON public.qr_codes;
CREATE POLICY "clients_create_own_qr_codes"
  ON public.qr_codes
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((client_id IN ( SELECT clients.id
   FROM clients
  WHERE (clients.user_id = (SELECT auth.uid())))));

-- Policy 184/325: qr_codes.clients_view_own_qr_codes
DROP POLICY IF EXISTS "clients_view_own_qr_codes" ON public.qr_codes;
CREATE POLICY "clients_view_own_qr_codes"
  ON public.qr_codes
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((client_id IN ( SELECT clients.id
   FROM clients
  WHERE (clients.user_id = (SELECT auth.uid())))));

-- Policy 185/325: qr_redemptions.admin_manage_qr_redemptions
DROP POLICY IF EXISTS "admin_manage_qr_redemptions" ON public.qr_redemptions;
CREATE POLICY "admin_manage_qr_redemptions"
  ON public.qr_redemptions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT up.tenant_id
   FROM (user_profiles up
     JOIN user_roles ur ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum)))));

-- Policy 186/325: qr_redemptions.asesor_ventas_create_redemptions
DROP POLICY IF EXISTS "asesor_ventas_create_redemptions" ON public.qr_redemptions;
CREATE POLICY "asesor_ventas_create_redemptions"
  ON public.qr_redemptions
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_profiles up
     JOIN user_roles ur ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (up.id = qr_redemptions.redeemed_by) AND (ur.role = 'asesor_de_ventas'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum)))));

-- Policy 187/325: qr_redemptions.asesor_ventas_view_own_redemptions
DROP POLICY IF EXISTS "asesor_ventas_view_own_redemptions" ON public.qr_redemptions;
CREATE POLICY "asesor_ventas_view_own_redemptions"
  ON public.qr_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((redeemed_by IN ( SELECT user_profiles.id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 188/325: qr_redemptions.clients_view_qr_redemptions
DROP POLICY IF EXISTS "clients_view_qr_redemptions" ON public.qr_redemptions;
CREATE POLICY "clients_view_qr_redemptions"
  ON public.qr_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((qr_code_id IN ( SELECT qc.id
   FROM (qr_codes qc
     JOIN clients c ON ((c.id = qc.client_id)))
  WHERE (c.user_id = (SELECT auth.uid())))));

-- Policy 189/325: reward_redemptions.admins_insert_reward_redemptions
DROP POLICY IF EXISTS "admins_insert_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "admins_insert_reward_redemptions"
  ON public.reward_redemptions
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 190/325: reward_redemptions.admins_select_reward_redemptions
DROP POLICY IF EXISTS "admins_select_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "admins_select_reward_redemptions"
  ON public.reward_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 191/325: reward_redemptions.admins_update_reward_redemptions
DROP POLICY IF EXISTS "admins_update_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "admins_update_reward_redemptions"
  ON public.reward_redemptions
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 192/325: reward_redemptions.brand_managers_manage_reward_redemptions
DROP POLICY IF EXISTS "brand_managers_manage_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "brand_managers_manage_reward_redemptions"
  ON public.reward_redemptions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (reward_id IN ( SELECT r.id
   FROM rewards r
  WHERE ((r.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (r.deleted_at IS NULL))))));

-- Policy 193/325: reward_redemptions.brand_managers_select_reward_redemptions
DROP POLICY IF EXISTS "brand_managers_select_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "brand_managers_select_reward_redemptions"
  ON public.reward_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (reward_id IN ( SELECT r.id
   FROM rewards r
  WHERE ((r.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (r.deleted_at IS NULL))))));

-- Policy 194/325: reward_redemptions.clients_select_own_reward_redemptions
DROP POLICY IF EXISTS "clients_select_own_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "clients_select_own_reward_redemptions"
  ON public.reward_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_brand_membership_id IN ( SELECT cbm.id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))));

-- Policy 195/325: reward_redemptions.promotors_select_reward_redemptions
DROP POLICY IF EXISTS "promotors_select_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "promotors_select_reward_redemptions"
  ON public.reward_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_brand_membership_id IN ( SELECT cbm.id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.id IN ( SELECT DISTINCT v.client_id
           FROM visits v
          WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
                  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'promotor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL)))) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))));

-- Policy 196/325: reward_redemptions.tenant_admins_manage_reward_redemptions
DROP POLICY IF EXISTS "tenant_admins_manage_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "tenant_admins_manage_reward_redemptions"
  ON public.reward_redemptions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 197/325: reward_redemptions.tenant_admins_select_reward_redemptions
DROP POLICY IF EXISTS "tenant_admins_select_reward_redemptions" ON public.reward_redemptions;
CREATE POLICY "tenant_admins_select_reward_redemptions"
  ON public.reward_redemptions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 198/325: rewards.admins_delete_rewards
DROP POLICY IF EXISTS "admins_delete_rewards" ON public.rewards;
CREATE POLICY "admins_delete_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 199/325: rewards.admins_insert_rewards
DROP POLICY IF EXISTS "admins_insert_rewards" ON public.rewards;
CREATE POLICY "admins_insert_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 200/325: rewards.admins_select_rewards
DROP POLICY IF EXISTS "admins_select_rewards" ON public.rewards;
CREATE POLICY "admins_select_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 201/325: rewards.admins_update_rewards
DROP POLICY IF EXISTS "admins_update_rewards" ON public.rewards;
CREATE POLICY "admins_update_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 202/325: rewards.brand_managers_manage_rewards
DROP POLICY IF EXISTS "brand_managers_manage_rewards" ON public.rewards;
CREATE POLICY "brand_managers_manage_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 203/325: rewards.brand_managers_select_rewards
DROP POLICY IF EXISTS "brand_managers_select_rewards" ON public.rewards;
CREATE POLICY "brand_managers_select_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 204/325: rewards.clients_select_rewards
DROP POLICY IF EXISTS "clients_select_rewards" ON public.rewards;
CREATE POLICY "clients_select_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND ((valid_until IS NULL) OR (valid_until >= CURRENT_DATE)) AND (valid_from <= CURRENT_DATE) AND ((usage_limit_total IS NULL) OR (usage_count_total < usage_limit_total)) AND (brand_id IN ( SELECT cbm.brand_id
   FROM ((client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
     JOIN tiers t ON ((cbm.current_tier_id = t.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.membership_status = 'active'::membership_status_enum) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL) AND ((rewards.tier_requirements IS NULL) OR (((NOT (rewards.tier_requirements ? 'min_tier_level'::text)) OR (t.tier_level >= ((rewards.tier_requirements ->> 'min_tier_level'::text))::integer)) AND ((NOT (rewards.tier_requirements ? 'allowed_tiers'::text)) OR ((rewards.tier_requirements -> 'allowed_tiers'::text) ? (t.code)::text)) AND ((NOT (rewards.tier_requirements ? 'exclusive_to_tier'::text)) OR ((rewards.tier_requirements ->> 'exclusive_to_tier'::text) = (t.code)::text)))))))));

-- Policy 205/325: rewards.field_users_select_rewards
DROP POLICY IF EXISTS "field_users_select_rewards" ON public.rewards;
CREATE POLICY "field_users_select_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND ((valid_until IS NULL) OR (valid_until >= CURRENT_DATE)) AND (valid_from <= CURRENT_DATE) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 206/325: rewards.tenant_admins_manage_rewards
DROP POLICY IF EXISTS "tenant_admins_manage_rewards" ON public.rewards;
CREATE POLICY "tenant_admins_manage_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 207/325: rewards.tenant_admins_select_rewards
DROP POLICY IF EXISTS "tenant_admins_select_rewards" ON public.rewards;
CREATE POLICY "tenant_admins_select_rewards"
  ON public.rewards
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 208/325: survey_answers.survey_answers_insert
DROP POLICY IF EXISTS "survey_answers_insert" ON public.survey_answers;
CREATE POLICY "survey_answers_insert"
  ON public.survey_answers
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND (response_id IN ( SELECT sr.id
   FROM survey_responses sr
  WHERE (sr.respondent_id IN ( SELECT user_profiles.id
           FROM user_profiles
          WHERE (user_profiles.user_id = (SELECT auth.uid()))))))));

-- Policy 209/325: survey_answers.survey_answers_select
DROP POLICY IF EXISTS "survey_answers_select" ON public.survey_answers;
CREATE POLICY "survey_answers_select"
  ON public.survey_answers
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND ((response_id IN ( SELECT sr.id
   FROM survey_responses sr
  WHERE (sr.respondent_id IN ( SELECT user_profiles.id
           FROM user_profiles
          WHERE (user_profiles.user_id = (SELECT auth.uid())))))) OR (response_id IN ( SELECT sr.id
   FROM (survey_responses sr
     JOIN surveys s ON ((sr.survey_id = s.id)))
  WHERE (s.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.deleted_at IS NULL)))))) OR (EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.deleted_at IS NULL)))))));

-- Policy 210/325: survey_questions.survey_questions_delete
DROP POLICY IF EXISTS "survey_questions_delete" ON public.survey_questions;
CREATE POLICY "survey_questions_delete"
  ON public.survey_questions
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND (survey_id IN ( SELECT s.id
   FROM surveys s
  WHERE ((s.survey_status = 'draft'::survey_status_enum) AND (s.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.deleted_at IS NULL)))))))));

-- Policy 211/325: survey_questions.survey_questions_insert
DROP POLICY IF EXISTS "survey_questions_insert" ON public.survey_questions;
CREATE POLICY "survey_questions_insert"
  ON public.survey_questions
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND (survey_id IN ( SELECT s.id
   FROM surveys s
  WHERE ((s.survey_status = 'draft'::survey_status_enum) AND (s.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.deleted_at IS NULL)))))))));

-- Policy 212/325: survey_questions.survey_questions_update
DROP POLICY IF EXISTS "survey_questions_update" ON public.survey_questions;
CREATE POLICY "survey_questions_update"
  ON public.survey_questions
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND (survey_id IN ( SELECT s.id
   FROM surveys s
  WHERE ((s.survey_status = 'draft'::survey_status_enum) AND (s.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.deleted_at IS NULL)))))))));

-- Policy 213/325: survey_responses.survey_responses_insert
DROP POLICY IF EXISTS "survey_responses_insert" ON public.survey_responses;
CREATE POLICY "survey_responses_insert"
  ON public.survey_responses
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND (respondent_id IN ( SELECT user_profiles.id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid()))))));

-- Policy 214/325: survey_responses.survey_responses_select
DROP POLICY IF EXISTS "survey_responses_select" ON public.survey_responses;
CREATE POLICY "survey_responses_select"
  ON public.survey_responses
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND ((respondent_id IN ( SELECT user_profiles.id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))) OR (survey_id IN ( SELECT s.id
   FROM surveys s
  WHERE (s.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.deleted_at IS NULL)))))) OR (EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.deleted_at IS NULL)))))));

-- Policy 215/325: surveys.surveys_brand_insert
DROP POLICY IF EXISTS "surveys_brand_insert" ON public.surveys;
CREATE POLICY "surveys_brand_insert"
  ON public.surveys
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 216/325: surveys.surveys_brand_select
DROP POLICY IF EXISTS "surveys_brand_select" ON public.surveys;
CREATE POLICY "surveys_brand_select"
  ON public.surveys
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND ((brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.deleted_at IS NULL)))) OR (EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.deleted_at IS NULL)))) OR ((survey_status = 'active'::survey_status_enum) AND (deleted_at IS NULL) AND (start_date <= CURRENT_DATE) AND (end_date >= CURRENT_DATE)))));

-- Policy 217/325: surveys.surveys_brand_update
DROP POLICY IF EXISTS "surveys_brand_update" ON public.surveys;
CREATE POLICY "surveys_brand_update"
  ON public.surveys
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (((tenant_id IN ( SELECT get_user_tenant_ids() AS get_user_tenant_ids)) AND ((brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.deleted_at IS NULL)))) OR (EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.status = 'active'::user_role_status_enum) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.deleted_at IS NULL)))))));

-- Policy 218/325: tenants.admins_delete_tenants
DROP POLICY IF EXISTS "admins_delete_tenants" ON public.tenants;
CREATE POLICY "admins_delete_tenants"
  ON public.tenants
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 219/325: tenants.admins_insert_tenants
DROP POLICY IF EXISTS "admins_insert_tenants" ON public.tenants;
CREATE POLICY "admins_insert_tenants"
  ON public.tenants
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 220/325: tenants.admins_select_tenants
DROP POLICY IF EXISTS "admins_select_tenants" ON public.tenants;
CREATE POLICY "admins_select_tenants"
  ON public.tenants
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 221/325: tenants.admins_update_tenants
DROP POLICY IF EXISTS "admins_update_tenants" ON public.tenants;
CREATE POLICY "admins_update_tenants"
  ON public.tenants
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 222/325: tenants.brand_managers_select_tenants
DROP POLICY IF EXISTS "brand_managers_select_tenants" ON public.tenants;
CREATE POLICY "brand_managers_select_tenants"
  ON public.tenants
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 223/325: tenants.field_users_select_tenants
DROP POLICY IF EXISTS "field_users_select_tenants" ON public.tenants;
CREATE POLICY "field_users_select_tenants"
  ON public.tenants
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 224/325: tenants.tenant_admins_select_tenants
DROP POLICY IF EXISTS "tenant_admins_select_tenants" ON public.tenants;
CREATE POLICY "tenant_admins_select_tenants"
  ON public.tenants
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 225/325: tiers.admins_delete_tiers
DROP POLICY IF EXISTS "admins_delete_tiers" ON public.tiers;
CREATE POLICY "admins_delete_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 226/325: tiers.admins_insert_tiers
DROP POLICY IF EXISTS "admins_insert_tiers" ON public.tiers;
CREATE POLICY "admins_insert_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 227/325: tiers.admins_select_tiers
DROP POLICY IF EXISTS "admins_select_tiers" ON public.tiers;
CREATE POLICY "admins_select_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 228/325: tiers.admins_update_tiers
DROP POLICY IF EXISTS "admins_update_tiers" ON public.tiers;
CREATE POLICY "admins_update_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 229/325: tiers.brand_managers_manage_tiers
DROP POLICY IF EXISTS "brand_managers_manage_tiers" ON public.tiers;
CREATE POLICY "brand_managers_manage_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 230/325: tiers.brand_managers_select_tiers
DROP POLICY IF EXISTS "brand_managers_select_tiers" ON public.tiers;
CREATE POLICY "brand_managers_select_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 231/325: tiers.clients_select_tiers
DROP POLICY IF EXISTS "clients_select_tiers" ON public.tiers;
CREATE POLICY "clients_select_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (brand_id IN ( SELECT cbm.brand_id
   FROM (client_brand_memberships cbm
     JOIN clients c ON ((cbm.client_id = c.id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (cbm.membership_status = 'active'::membership_status_enum) AND (cbm.deleted_at IS NULL) AND (c.deleted_at IS NULL))))));

-- Policy 232/325: tiers.field_users_select_tiers
DROP POLICY IF EXISTS "field_users_select_tiers" ON public.tiers;
CREATE POLICY "field_users_select_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum, 'market_analyst'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 233/325: tiers.tenant_admins_manage_tiers
DROP POLICY IF EXISTS "tenant_admins_manage_tiers" ON public.tiers;
CREATE POLICY "tenant_admins_manage_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 234/325: tiers.tenant_admins_select_tiers
DROP POLICY IF EXISTS "tenant_admins_select_tiers" ON public.tiers;
CREATE POLICY "tenant_admins_select_tiers"
  ON public.tiers
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 235/325: user_roles.supervisors_select_subordinate_roles
DROP POLICY IF EXISTS "supervisors_select_subordinate_roles" ON public.user_roles;
CREATE POLICY "supervisors_select_subordinate_roles"
  ON public.user_roles
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (user_profile_id IN ( SELECT up.id
   FROM user_profiles up
  WHERE (up.manager_id IN ( SELECT supervisor_profile.id
           FROM user_profiles supervisor_profile
          WHERE (supervisor_profile.user_id = (SELECT auth.uid()))))))));

-- Policy 236/325: user_roles.users_select_own_roles
DROP POLICY IF EXISTS "users_select_own_roles" ON public.user_roles;
CREATE POLICY "users_select_own_roles"
  ON public.user_roles
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (user_profile_id IN ( SELECT up.id
   FROM user_profiles up
  WHERE (up.user_id = (SELECT auth.uid()))))));

-- Policy 237/325: visit_assessments.admins_delete_visit_assessments
DROP POLICY IF EXISTS "admins_delete_visit_assessments" ON public.visit_assessments;
CREATE POLICY "admins_delete_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 238/325: visit_assessments.admins_insert_visit_assessments
DROP POLICY IF EXISTS "admins_insert_visit_assessments" ON public.visit_assessments;
CREATE POLICY "admins_insert_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 239/325: visit_assessments.admins_select_visit_assessments
DROP POLICY IF EXISTS "admins_select_visit_assessments" ON public.visit_assessments;
CREATE POLICY "admins_select_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 240/325: visit_assessments.admins_update_visit_assessments
DROP POLICY IF EXISTS "admins_update_visit_assessments" ON public.visit_assessments;
CREATE POLICY "admins_update_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 241/325: visit_assessments.brand_managers_select_visit_assessments
DROP POLICY IF EXISTS "brand_managers_select_visit_assessments" ON public.visit_assessments;
CREATE POLICY "brand_managers_select_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (product_id IN ( SELECT p.id
   FROM products p
  WHERE ((p.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (p.deleted_at IS NULL))))));

-- Policy 242/325: visit_assessments.clients_select_visit_assessments
DROP POLICY IF EXISTS "clients_select_visit_assessments" ON public.visit_assessments;
CREATE POLICY "clients_select_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.client_id IN ( SELECT c.id
           FROM clients c
          WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 243/325: visit_assessments.promotors_manage_visit_assessments
DROP POLICY IF EXISTS "promotors_manage_visit_assessments" ON public.visit_assessments;
CREATE POLICY "promotors_manage_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 244/325: visit_assessments.promotors_select_visit_assessments
DROP POLICY IF EXISTS "promotors_select_visit_assessments" ON public.visit_assessments;
CREATE POLICY "promotors_select_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 245/325: visit_assessments.supervisors_manage_visit_assessments
DROP POLICY IF EXISTS "supervisors_manage_visit_assessments" ON public.visit_assessments;
CREATE POLICY "supervisors_manage_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 246/325: visit_assessments.supervisors_select_visit_assessments
DROP POLICY IF EXISTS "supervisors_select_visit_assessments" ON public.visit_assessments;
CREATE POLICY "supervisors_select_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 247/325: visit_assessments.tenant_admins_manage_visit_assessments
DROP POLICY IF EXISTS "tenant_admins_manage_visit_assessments" ON public.visit_assessments;
CREATE POLICY "tenant_admins_manage_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 248/325: visit_assessments.tenant_admins_select_visit_assessments
DROP POLICY IF EXISTS "tenant_admins_select_visit_assessments" ON public.visit_assessments;
CREATE POLICY "tenant_admins_select_visit_assessments"
  ON public.visit_assessments
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 249/325: visit_brand_product_assessments.brand_product_assessments_promotor_own
DROP POLICY IF EXISTS "brand_product_assessments_promotor_own" ON public.visit_brand_product_assessments;
CREATE POLICY "brand_product_assessments_promotor_own"
  ON public.visit_brand_product_assessments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((visit_id IN ( SELECT v.id
   FROM (visits v
     JOIN user_profiles up ON ((v.promotor_id = up.id)))
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 250/325: visit_brand_product_assessments.brand_product_assessments_tenant_isolation
DROP POLICY IF EXISTS "brand_product_assessments_tenant_isolation" ON public.visit_brand_product_assessments;
CREATE POLICY "brand_product_assessments_tenant_isolation"
  ON public.visit_brand_product_assessments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 251/325: visit_communication_plans.admins_delete_visit_communication_plans
DROP POLICY IF EXISTS "admins_delete_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "admins_delete_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 252/325: visit_communication_plans.admins_insert_visit_communication_plans
DROP POLICY IF EXISTS "admins_insert_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "admins_insert_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 253/325: visit_communication_plans.admins_select_visit_communication_plans
DROP POLICY IF EXISTS "admins_select_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "admins_select_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 254/325: visit_communication_plans.admins_update_visit_communication_plans
DROP POLICY IF EXISTS "admins_update_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "admins_update_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 255/325: visit_communication_plans.brand_managers_manage_visit_communication_plans
DROP POLICY IF EXISTS "brand_managers_manage_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "brand_managers_manage_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 256/325: visit_communication_plans.brand_managers_select_visit_communication_plans
DROP POLICY IF EXISTS "brand_managers_select_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "brand_managers_select_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (brand_id IN ( SELECT ur.brand_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 257/325: visit_communication_plans.clients_select_visit_communication_plans
DROP POLICY IF EXISTS "clients_select_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "clients_select_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.client_id IN ( SELECT c.id
           FROM clients c
          WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 258/325: visit_communication_plans.promotors_manage_visit_communication_plans
DROP POLICY IF EXISTS "promotors_manage_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "promotors_manage_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 259/325: visit_communication_plans.promotors_select_visit_communication_plans
DROP POLICY IF EXISTS "promotors_select_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "promotors_select_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 260/325: visit_communication_plans.supervisors_manage_visit_communication_plans
DROP POLICY IF EXISTS "supervisors_manage_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "supervisors_manage_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 261/325: visit_communication_plans.supervisors_select_visit_communication_plans
DROP POLICY IF EXISTS "supervisors_select_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "supervisors_select_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 262/325: visit_communication_plans.tenant_admins_manage_visit_communication_plans
DROP POLICY IF EXISTS "tenant_admins_manage_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "tenant_admins_manage_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 263/325: visit_communication_plans.tenant_admins_select_visit_communication_plans
DROP POLICY IF EXISTS "tenant_admins_select_visit_communication_plans" ON public.visit_communication_plans;
CREATE POLICY "tenant_admins_select_visit_communication_plans"
  ON public.visit_communication_plans
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 264/325: visit_competitor_assessments.competitor_assessments_promotor_own
DROP POLICY IF EXISTS "competitor_assessments_promotor_own" ON public.visit_competitor_assessments;
CREATE POLICY "competitor_assessments_promotor_own"
  ON public.visit_competitor_assessments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((visit_id IN ( SELECT v.id
   FROM (visits v
     JOIN user_profiles up ON ((v.promotor_id = up.id)))
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 265/325: visit_competitor_assessments.competitor_assessments_tenant_isolation
DROP POLICY IF EXISTS "competitor_assessments_tenant_isolation" ON public.visit_competitor_assessments;
CREATE POLICY "competitor_assessments_tenant_isolation"
  ON public.visit_competitor_assessments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 266/325: visit_evidence.visit_evidence_promotor_own_visits
DROP POLICY IF EXISTS "visit_evidence_promotor_own_visits" ON public.visit_evidence;
CREATE POLICY "visit_evidence_promotor_own_visits"
  ON public.visit_evidence
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((visit_id IN ( SELECT v.id
   FROM (visits v
     JOIN user_profiles up ON ((v.promotor_id = up.id)))
  WHERE (up.user_id = (SELECT auth.uid())))))
  WITH CHECK ((visit_id IN ( SELECT v.id
   FROM (visits v
     JOIN user_profiles up ON ((v.promotor_id = up.id)))
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 267/325: visit_evidence.visit_evidence_tenant_isolation
DROP POLICY IF EXISTS "visit_evidence_tenant_isolation" ON public.visit_evidence;
CREATE POLICY "visit_evidence_tenant_isolation"
  ON public.visit_evidence
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 268/325: visit_exhibition_checks.exhibition_checks_promotor_own
DROP POLICY IF EXISTS "exhibition_checks_promotor_own" ON public.visit_exhibition_checks;
CREATE POLICY "exhibition_checks_promotor_own"
  ON public.visit_exhibition_checks
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((visit_id IN ( SELECT v.id
   FROM (visits v
     JOIN user_profiles up ON ((v.promotor_id = up.id)))
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 269/325: visit_exhibition_checks.exhibition_checks_tenant_isolation
DROP POLICY IF EXISTS "exhibition_checks_tenant_isolation" ON public.visit_exhibition_checks;
CREATE POLICY "exhibition_checks_tenant_isolation"
  ON public.visit_exhibition_checks
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 270/325: visit_inventories.admins_delete_visit_inventories
DROP POLICY IF EXISTS "admins_delete_visit_inventories" ON public.visit_inventories;
CREATE POLICY "admins_delete_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 271/325: visit_inventories.admins_insert_visit_inventories
DROP POLICY IF EXISTS "admins_insert_visit_inventories" ON public.visit_inventories;
CREATE POLICY "admins_insert_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 272/325: visit_inventories.admins_select_visit_inventories
DROP POLICY IF EXISTS "admins_select_visit_inventories" ON public.visit_inventories;
CREATE POLICY "admins_select_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 273/325: visit_inventories.admins_update_visit_inventories
DROP POLICY IF EXISTS "admins_update_visit_inventories" ON public.visit_inventories;
CREATE POLICY "admins_update_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 274/325: visit_inventories.brand_managers_select_visit_inventories
DROP POLICY IF EXISTS "brand_managers_select_visit_inventories" ON public.visit_inventories;
CREATE POLICY "brand_managers_select_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (product_id IN ( SELECT p.id
   FROM products p
  WHERE ((p.brand_id IN ( SELECT ur.brand_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (p.deleted_at IS NULL))))));

-- Policy 275/325: visit_inventories.clients_select_visit_inventories
DROP POLICY IF EXISTS "clients_select_visit_inventories" ON public.visit_inventories;
CREATE POLICY "clients_select_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.client_id IN ( SELECT c.id
           FROM clients c
          WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 276/325: visit_inventories.promotors_manage_visit_inventories
DROP POLICY IF EXISTS "promotors_manage_visit_inventories" ON public.visit_inventories;
CREATE POLICY "promotors_manage_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 277/325: visit_inventories.promotors_select_visit_inventories
DROP POLICY IF EXISTS "promotors_select_visit_inventories" ON public.visit_inventories;
CREATE POLICY "promotors_select_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 278/325: visit_inventories.supervisors_manage_visit_inventories
DROP POLICY IF EXISTS "supervisors_manage_visit_inventories" ON public.visit_inventories;
CREATE POLICY "supervisors_manage_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 279/325: visit_inventories.supervisors_select_visit_inventories
DROP POLICY IF EXISTS "supervisors_select_visit_inventories" ON public.visit_inventories;
CREATE POLICY "supervisors_select_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 280/325: visit_inventories.tenant_admins_manage_visit_inventories
DROP POLICY IF EXISTS "tenant_admins_manage_visit_inventories" ON public.visit_inventories;
CREATE POLICY "tenant_admins_manage_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 281/325: visit_inventories.tenant_admins_select_visit_inventories
DROP POLICY IF EXISTS "tenant_admins_select_visit_inventories" ON public.visit_inventories;
CREATE POLICY "tenant_admins_select_visit_inventories"
  ON public.visit_inventories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 282/325: visit_order_items.policy_visit_order_items_admin_all
DROP POLICY IF EXISTS "policy_visit_order_items_admin_all" ON public.visit_order_items;
CREATE POLICY "policy_visit_order_items_admin_all"
  ON public.visit_order_items
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.tenant_id IS NULL) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.tenant_id IS NULL) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 283/325: visit_order_items.policy_visit_order_items_brand_manager
DROP POLICY IF EXISTS "policy_visit_order_items_brand_manager" ON public.visit_order_items;
CREATE POLICY "policy_visit_order_items_brand_manager"
  ON public.visit_order_items
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((product_id IN ( SELECT p.id
   FROM (products p
     JOIN user_roles ur ON ((ur.brand_id = p.brand_id)))
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL) AND (p.deleted_at IS NULL)))) AND (deleted_at IS NULL)));

-- Policy 284/325: visit_order_items.policy_visit_order_items_client_select
DROP POLICY IF EXISTS "policy_visit_order_items_client_select" ON public.visit_order_items;
CREATE POLICY "policy_visit_order_items_client_select"
  ON public.visit_order_items
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((visit_order_id IN ( SELECT vo.id
   FROM (visit_orders vo
     JOIN clients c ON ((c.id = vo.client_id)))
  WHERE ((c.user_id = (SELECT auth.uid())) AND (vo.deleted_at IS NULL) AND (c.deleted_at IS NULL)))) AND (deleted_at IS NULL)));

-- Policy 285/325: visit_order_items.policy_visit_order_items_promotor_delete
DROP POLICY IF EXISTS "policy_visit_order_items_promotor_delete" ON public.visit_order_items;
CREATE POLICY "policy_visit_order_items_promotor_delete"
  ON public.visit_order_items
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING ((visit_order_id IN ( SELECT vo.id
   FROM visit_orders vo
  WHERE ((vo.promotor_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE (user_profiles.user_id = (SELECT auth.uid())))) AND (vo.deleted_at IS NULL)))));

-- Policy 286/325: visit_order_items.policy_visit_order_items_promotor_insert
DROP POLICY IF EXISTS "policy_visit_order_items_promotor_insert" ON public.visit_order_items;
CREATE POLICY "policy_visit_order_items_promotor_insert"
  ON public.visit_order_items
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((visit_order_id IN ( SELECT vo.id
   FROM visit_orders vo
  WHERE ((vo.promotor_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE (user_profiles.user_id = (SELECT auth.uid())))) AND (vo.deleted_at IS NULL)))));

-- Policy 287/325: visit_order_items.policy_visit_order_items_promotor_select
DROP POLICY IF EXISTS "policy_visit_order_items_promotor_select" ON public.visit_order_items;
CREATE POLICY "policy_visit_order_items_promotor_select"
  ON public.visit_order_items
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((visit_order_id IN ( SELECT vo.id
   FROM visit_orders vo
  WHERE ((vo.promotor_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE (user_profiles.user_id = (SELECT auth.uid())))) AND (vo.deleted_at IS NULL)))));

-- Policy 288/325: visit_order_items.policy_visit_order_items_promotor_update
DROP POLICY IF EXISTS "policy_visit_order_items_promotor_update" ON public.visit_order_items;
CREATE POLICY "policy_visit_order_items_promotor_update"
  ON public.visit_order_items
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((visit_order_id IN ( SELECT vo.id
   FROM visit_orders vo
  WHERE ((vo.promotor_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE (user_profiles.user_id = (SELECT auth.uid())))) AND (vo.deleted_at IS NULL)))))
  WITH CHECK ((visit_order_id IN ( SELECT vo.id
   FROM visit_orders vo
  WHERE ((vo.promotor_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE (user_profiles.user_id = (SELECT auth.uid())))) AND (vo.deleted_at IS NULL)))));

-- Policy 289/325: visit_order_items.policy_visit_order_items_supervisor
DROP POLICY IF EXISTS "policy_visit_order_items_supervisor" ON public.visit_order_items;
CREATE POLICY "policy_visit_order_items_supervisor"
  ON public.visit_order_items
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (((visit_order_id IN ( SELECT vo.id
   FROM visit_orders vo
  WHERE ((vo.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (vo.deleted_at IS NULL)))) AND (deleted_at IS NULL)))
  WITH CHECK ((visit_order_id IN ( SELECT vo.id
   FROM visit_orders vo
  WHERE ((vo.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (vo.deleted_at IS NULL)))));

-- Policy 290/325: visit_order_items.policy_visit_order_items_tenant_admin
DROP POLICY IF EXISTS "policy_visit_order_items_tenant_admin" ON public.visit_order_items;
CREATE POLICY "policy_visit_order_items_tenant_admin"
  ON public.visit_order_items
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((tenant_id IN ( SELECT ur.tenant_id
   FROM user_roles ur
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.tenant_id IS NOT NULL) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))))
  WITH CHECK ((tenant_id IN ( SELECT ur.tenant_id
   FROM user_roles ur
  WHERE ((ur.user_profile_id = ( SELECT user_profiles.id
           FROM user_profiles
          WHERE ((user_profiles.user_id = (SELECT auth.uid())) AND (user_profiles.deleted_at IS NULL)))) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.tenant_id IS NOT NULL) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 291/325: visit_orders.admins_delete_visit_orders
DROP POLICY IF EXISTS "admins_delete_visit_orders" ON public.visit_orders;
CREATE POLICY "admins_delete_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 292/325: visit_orders.admins_insert_visit_orders
DROP POLICY IF EXISTS "admins_insert_visit_orders" ON public.visit_orders;
CREATE POLICY "admins_insert_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 293/325: visit_orders.admins_select_visit_orders
DROP POLICY IF EXISTS "admins_select_visit_orders" ON public.visit_orders;
CREATE POLICY "admins_select_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 294/325: visit_orders.admins_update_visit_orders
DROP POLICY IF EXISTS "admins_update_visit_orders" ON public.visit_orders;
CREATE POLICY "admins_update_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 295/325: visit_orders.clients_select_visit_orders
DROP POLICY IF EXISTS "clients_select_visit_orders" ON public.visit_orders;
CREATE POLICY "clients_select_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.client_id IN ( SELECT c.id
           FROM clients c
          WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 296/325: visit_orders.promotors_manage_visit_orders
DROP POLICY IF EXISTS "promotors_manage_visit_orders" ON public.visit_orders;
CREATE POLICY "promotors_manage_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 297/325: visit_orders.promotors_select_visit_orders
DROP POLICY IF EXISTS "promotors_select_visit_orders" ON public.visit_orders;
CREATE POLICY "promotors_select_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
          WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 298/325: visit_orders.supervisors_manage_visit_orders
DROP POLICY IF EXISTS "supervisors_manage_visit_orders" ON public.visit_orders;
CREATE POLICY "supervisors_manage_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 299/325: visit_orders.supervisors_select_visit_orders
DROP POLICY IF EXISTS "supervisors_select_visit_orders" ON public.visit_orders;
CREATE POLICY "supervisors_select_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (visit_id IN ( SELECT v.id
   FROM visits v
  WHERE ((v.promotor_id IN ( SELECT up.id
           FROM user_profiles up
          WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
                   FROM (user_roles ur
                     JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
                  WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL)))) AND (v.deleted_at IS NULL))))));

-- Policy 300/325: visit_orders.tenant_admins_manage_visit_orders
DROP POLICY IF EXISTS "tenant_admins_manage_visit_orders" ON public.visit_orders;
CREATE POLICY "tenant_admins_manage_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 301/325: visit_orders.tenant_admins_select_visit_orders
DROP POLICY IF EXISTS "tenant_admins_select_visit_orders" ON public.visit_orders;
CREATE POLICY "tenant_admins_select_visit_orders"
  ON public.visit_orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 302/325: visit_pop_material_checks.pop_material_checks_promotor_own
DROP POLICY IF EXISTS "pop_material_checks_promotor_own" ON public.visit_pop_material_checks;
CREATE POLICY "pop_material_checks_promotor_own"
  ON public.visit_pop_material_checks
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((visit_id IN ( SELECT v.id
   FROM (visits v
     JOIN user_profiles up ON ((v.promotor_id = up.id)))
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 303/325: visit_pop_material_checks.pop_material_checks_tenant_isolation
DROP POLICY IF EXISTS "pop_material_checks_tenant_isolation" ON public.visit_pop_material_checks;
CREATE POLICY "pop_material_checks_tenant_isolation"
  ON public.visit_pop_material_checks
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 304/325: visit_stage_assessments.visit_stage_assessments_promotor_own
DROP POLICY IF EXISTS "visit_stage_assessments_promotor_own" ON public.visit_stage_assessments;
CREATE POLICY "visit_stage_assessments_promotor_own"
  ON public.visit_stage_assessments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((visit_id IN ( SELECT v.id
   FROM (visits v
     JOIN user_profiles up ON ((v.promotor_id = up.id)))
  WHERE (up.user_id = (SELECT auth.uid())))))
  WITH CHECK ((visit_id IN ( SELECT v.id
   FROM (visits v
     JOIN user_profiles up ON ((v.promotor_id = up.id)))
  WHERE (up.user_id = (SELECT auth.uid())))));

-- Policy 305/325: visit_stage_assessments.visit_stage_assessments_tenant_isolation
DROP POLICY IF EXISTS "visit_stage_assessments_tenant_isolation" ON public.visit_stage_assessments;
CREATE POLICY "visit_stage_assessments_tenant_isolation"
  ON public.visit_stage_assessments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))))
  WITH CHECK ((tenant_id IN ( SELECT user_profiles.tenant_id
   FROM user_profiles
  WHERE (user_profiles.user_id = (SELECT auth.uid())))));

-- Policy 306/325: visits.admins_delete_visits
DROP POLICY IF EXISTS "admins_delete_visits" ON public.visits;
CREATE POLICY "admins_delete_visits"
  ON public.visits
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 307/325: visits.admins_insert_visits
DROP POLICY IF EXISTS "admins_insert_visits" ON public.visits;
CREATE POLICY "admins_insert_visits"
  ON public.visits
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 308/325: visits.admins_select_visits
DROP POLICY IF EXISTS "admins_select_visits" ON public.visits;
CREATE POLICY "admins_select_visits"
  ON public.visits
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 309/325: visits.admins_update_visits
DROP POLICY IF EXISTS "admins_update_visits" ON public.visits;
CREATE POLICY "admins_update_visits"
  ON public.visits
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 310/325: visits.clients_select_visits
DROP POLICY IF EXISTS "clients_select_visits" ON public.visits;
CREATE POLICY "clients_select_visits"
  ON public.visits
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (client_id IN ( SELECT c.id
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.deleted_at IS NULL))))));

-- Policy 311/325: visits.promotors_manage_visits
DROP POLICY IF EXISTS "promotors_manage_visits" ON public.visits;
CREATE POLICY "promotors_manage_visits"
  ON public.visits
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (promotor_id IN ( SELECT ur.user_profile_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 312/325: visits.promotors_select_visits
DROP POLICY IF EXISTS "promotors_select_visits" ON public.visits;
CREATE POLICY "promotors_select_visits"
  ON public.visits
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (promotor_id IN ( SELECT ur.user_profile_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['promotor'::user_role_type_enum, 'supervisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 313/325: visits.supervisors_manage_visits
DROP POLICY IF EXISTS "supervisors_manage_visits" ON public.visits;
CREATE POLICY "supervisors_manage_visits"
  ON public.visits
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (promotor_id IN ( SELECT up.id
   FROM user_profiles up
  WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
          WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL))))));

-- Policy 314/325: visits.supervisors_select_visits
DROP POLICY IF EXISTS "supervisors_select_visits" ON public.visits;
CREATE POLICY "supervisors_select_visits"
  ON public.visits
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (promotor_id IN ( SELECT up.id
   FROM user_profiles up
  WHERE ((up.manager_id IN ( SELECT ur.user_profile_id
           FROM (user_roles ur
             JOIN user_profiles up_mgr ON ((ur.user_profile_id = up_mgr.id)))
          WHERE ((up_mgr.user_id = (SELECT auth.uid())) AND (ur.role = 'supervisor'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))) AND (up.deleted_at IS NULL))))));

-- Policy 315/325: visits.tenant_admins_manage_visits
DROP POLICY IF EXISTS "tenant_admins_manage_visits" ON public.visits;
CREATE POLICY "tenant_admins_manage_visits"
  ON public.visits
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 316/325: visits.tenant_admins_select_visits
DROP POLICY IF EXISTS "tenant_admins_select_visits" ON public.visits;
CREATE POLICY "tenant_admins_select_visits"
  ON public.visits
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 317/325: zones.admins_delete_zones
DROP POLICY IF EXISTS "admins_delete_zones" ON public.zones;
CREATE POLICY "admins_delete_zones"
  ON public.zones
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 318/325: zones.admins_insert_zones
DROP POLICY IF EXISTS "admins_insert_zones" ON public.zones;
CREATE POLICY "admins_insert_zones"
  ON public.zones
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 319/325: zones.admins_select_zones
DROP POLICY IF EXISTS "admins_select_zones" ON public.zones;
CREATE POLICY "admins_select_zones"
  ON public.zones
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 320/325: zones.admins_update_zones
DROP POLICY IF EXISTS "admins_update_zones" ON public.zones;
CREATE POLICY "admins_update_zones"
  ON public.zones
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'global'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL)))));

-- Policy 321/325: zones.brand_managers_select_zones
DROP POLICY IF EXISTS "brand_managers_select_zones" ON public.zones;
CREATE POLICY "brand_managers_select_zones"
  ON public.zones
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT b.tenant_id
   FROM ((user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
     JOIN brands b ON ((ur.brand_id = b.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'brand_manager'::user_role_type_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL) AND (b.deleted_at IS NULL))))));

-- Policy 322/325: zones.clients_select_assigned_zone
DROP POLICY IF EXISTS "clients_select_assigned_zone" ON public.zones;
CREATE POLICY "clients_select_assigned_zone"
  ON public.zones
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (EXISTS ( SELECT 1
   FROM clients c
  WHERE ((c.user_id = (SELECT auth.uid())) AND (c.zone_id = zones.id) AND (c.deleted_at IS NULL))))));

-- Policy 323/325: zones.field_users_select_assigned_zones
DROP POLICY IF EXISTS "field_users_select_assigned_zones" ON public.zones;
CREATE POLICY "field_users_select_assigned_zones"
  ON public.zones
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (is_active = true) AND (EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = ANY (ARRAY['supervisor'::user_role_type_enum, 'advisor'::user_role_type_enum])) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL) AND (ur.tenant_id = zones.tenant_id))))));

-- Policy 324/325: zones.tenant_admins_manage_zones
DROP POLICY IF EXISTS "tenant_admins_manage_zones" ON public.zones;
CREATE POLICY "tenant_admins_manage_zones"
  ON public.zones
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 325/325: zones.tenant_admins_select_zones
DROP POLICY IF EXISTS "tenant_admins_select_zones" ON public.zones;
CREATE POLICY "tenant_admins_select_zones"
  ON public.zones
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((deleted_at IS NULL) AND (tenant_id IN ( SELECT ur.tenant_id
   FROM (user_roles ur
     JOIN user_profiles up ON ((ur.user_profile_id = up.id)))
  WHERE ((up.user_id = (SELECT auth.uid())) AND (ur.role = 'admin'::user_role_type_enum) AND (ur.scope = 'tenant'::user_role_scope_enum) AND (ur.status = 'active'::user_role_status_enum) AND (ur.deleted_at IS NULL))))));

-- Policy 326/327 (auth.jwt fix): brands.Allow DELETE on brands for same tenant
DROP POLICY IF EXISTS "Allow DELETE on brands for same tenant" ON public.brands;
CREATE POLICY "Allow DELETE on brands for same tenant"
  ON public.brands
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (((tenant_id)::text = ((SELECT auth.jwt()) ->> 'tenant_id'::text)));

-- Policy 327/327 (auth.jwt fix): brands.Allow UPDATE on brands for same tenant
DROP POLICY IF EXISTS "Allow UPDATE on brands for same tenant" ON public.brands;
CREATE POLICY "Allow UPDATE on brands for same tenant"
  ON public.brands
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (((tenant_id)::text = ((SELECT auth.jwt()) ->> 'tenant_id'::text)))
  WITH CHECK (((tenant_id)::text = ((SELECT auth.jwt()) ->> 'tenant_id'::text)));

COMMIT;
