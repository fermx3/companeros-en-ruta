# Skill: Supabase Database — Compañeros en Ruta

## Scope

Schema design, migrations, RLS policies, triggers, functions, views, storage buckets, and runtime database operations on the project's Supabase Postgres.

This skill is the **authoritative companion** to `.claude/rules/supabase-rules.md` (rules) and `.claude/rules/multi-tenant.md` (isolation).

---

## When to Use

- Writing or modifying any `supabase/migrations/*.sql`
- Adding/removing/renaming tables, columns, indexes, enums
- Authoring RLS policies or DB functions/triggers
- Investigating schema drift, RLS recursion, or performance issues
- Updating `src/lib/types/database.ts` and `src/lib/types/supabase.ts`

---

## Architecture Overview

```
tenants
 ├── brands
 │    ├── products (brand-scoped)
 │    ├── client_brand_memberships
 │    └── promotor / asesor / supervisor roles (via user_roles.brand_id)
 ├── user_profiles (linked to auth.users via user_id)
 │    └── user_roles (role + scope + brand_id + status + deleted_at)
 ├── clients
 │    ├── client_assignments (promotor/asesor ↔ client)
 │    ├── client_brand_memberships
 │    └── client_invoice_data
 ├── zones / markets / client_types / commercial_structures (catalogs)
 ├── visits
 │    ├── visit_stage_assessments
 │    ├── visit_brand_product_assessments
 │    ├── visit_competitor_assessments
 │    ├── visit_pop_material_checks
 │    ├── visit_exhibition_checks
 │    ├── visit_evidence
 │    └── visit_orders → visit_order_items
 ├── orders → order_items
 ├── qr_codes → qr_redemptions
 ├── promotions
 ├── surveys → survey_questions → survey_sections → survey_responses
 ├── tiers + client_tier_assignments + points_transactions + rewards
 ├── kpi_definitions + kpi_targets
 ├── notifications
 └── audit_logs
```

Every public-schema table is RLS-enabled. Most user-facing tables have `public_id` (`PRE-XXXX`).

---

## Critical Conventions

### Column-name pitfalls (memorize)

See `CLAUDE.md` § 6 for the full table. Most-confused:

- `user_profiles.user_id` (FK to `auth.users.id`)
- `user_profiles.first_name` / `last_name` (no `full_name`)
- `user_roles.user_profile_id` (FK to `user_profiles.id`, NOT `auth.users.id`)
- `user_roles.status` + `deleted_at` (no `is_active`)
- `clients.owner_name`, `phone`, `email`, `address_postal_code`
- `client_assignments.user_profile_id`
- `products.sku` (renamed from `code`)
- `visits.visit_status`, `visits.promotor_id`
- `orders.order_status`, `visit_orders.order_status`

### Enums

```
user_role_type_enum:    admin | brand_manager | supervisor | promotor | asesor_de_ventas | market_analyst
user_role_status_enum:  active | inactive | suspended | expired
visit_status_enum:      planned | in_progress | completed | cancelled | no_show
visit_workflow_status_enum: not_started | check_in | assessment | ordering | communication | check_out | completed
order_status_enum:      draft | pending | confirmed | processing | shipped | delivered | cancelled | returned
visit_order_status_enum: draft | pending | confirmed | cancelled
qr_status_enum:         active | fully_redeemed | expired | cancelled
stock_level_observed_enum: out_of_stock | low | medium | high | overstock
material_condition_enum:   good | damaged | missing | not_applicable
promotion_type_enum:    discount_percentage | discount_amount | buy_x_get_y | points_multiplier | free_product | bundle
```

In raw SQL, **cast enums explicitly**:
```sql
'in_progress'::visit_status_enum
'active'::user_role_status_enum
```

### Soft delete

Several tables use `deleted_at TIMESTAMPTZ` for soft delete. Always read with `.is('deleted_at', null)` unless the use case explicitly wants tombstones. Tables include: `user_roles`, `client_assignments`, `client_brand_memberships`, `visits`, `clients` (verify per-table in `database.ts`).

### Public IDs

Generated via `generate_public_id(prefix TEXT, length INT)`. Set as the column default on creation. Do not generate in app code.

---

## Step-by-Step: Adding a Migration

### 1. Decide the change

Confirm:
- What tables/columns are affected
- Is this a new table, a column change, an enum change, a policy change, a function change?
- Are there downstream impacts (triggers, views, types, RLS, app code)?

### 2. Name the file

```
supabase/migrations/YYYYMMDDHHMMSS_<short_description>.sql
```

Use UTC. Match the format of existing files (see `ls supabase/migrations | tail -5`).

### 3. Write the migration

```sql
-- ============================================================================
-- Migration: <Title>
-- ============================================================================
-- <Why this change is needed in 1-3 lines.>
-- ============================================================================

BEGIN;

-- 1. DDL (idempotent)
CREATE TABLE IF NOT EXISTS my_new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(20) UNIQUE NOT NULL DEFAULT generate_public_id('MNT', 4),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    brand_id UUID REFERENCES brands(id) ON DELETE RESTRICT,
    -- domain columns ...
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 2. Indexes for FKs
CREATE INDEX IF NOT EXISTS idx_my_new_table_tenant ON my_new_table(tenant_id);
CREATE INDEX IF NOT EXISTS idx_my_new_table_brand  ON my_new_table(brand_id);

-- 3. updated_at trigger
DROP TRIGGER IF EXISTS trg_my_new_table_updated_at ON my_new_table;
CREATE TRIGGER trg_my_new_table_updated_at
  BEFORE UPDATE ON my_new_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS
ALTER TABLE my_new_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_select_my_new_table" ON my_new_table;
CREATE POLICY "tenant_select_my_new_table" ON my_new_table
  FOR SELECT TO authenticated
  USING (
    tenant_id = (
      SELECT up.tenant_id FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- (insert / update / delete policies — model after recent consolidation migrations)

COMMIT;
```

Match the style of recent migrations (`20260221130000_rls_consolidation_phase2_select_policies.sql`, etc.) which use **helper functions** for tenant/role checks rather than inline `EXISTS` blocks.

### 4. Apply locally

```
# refresh local DB if needed
bash ./scripts/import_local_backup.sh

# (or per project workflow) supabase db reset
```

Validate the migration runs end-to-end on a clean local DB.

### 5. Update TypeScript types

- Update `src/lib/types/database.ts` interfaces in the **same commit**.
- Regenerate `src/lib/types/supabase.ts` (Supabase CLI: `supabase gen types typescript --local > src/lib/types/supabase.ts`).
- Verify `npm run build` passes.

### 6. Test RLS

For each RLS policy, validate:

- Tenant A user reads → only tenant A rows
- Tenant B user reads → only tenant B rows (cross-tenant negative)
- Brand-scoped role → only brand rows
- Insert with mismatched `tenant_id` → fails

Add or extend tests in `__tests__/database/rls.test.ts`.

### 7. Update services / API as needed

If the new table or column changes a service or API handler, update those files in the same PR.

### 8. Append to LEARNINGS.md

If anything non-obvious surfaced (RLS recursion, trigger constraint, performance trap), append.

---

## RLS Patterns

The project consolidated RLS in `20260221120000_*` through `20260221150000_*`. Pattern:

```sql
-- Helper function (already exists; reuse)
-- Examples to grep for in migrations:
--   public.user_tenant_id()           → returns current user's tenant
--   public.is_tenant_admin()          → boolean
--   public.user_has_role(role_name)   → boolean
--   public.user_brand_ids()           → uuid[]

-- SELECT policy
CREATE POLICY "select_clients_in_tenant" ON clients
  FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id());

-- INSERT policy
CREATE POLICY "admin_insert_clients" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.user_tenant_id()
    AND public.is_tenant_admin()
  );
```

**Always**:
- `TO authenticated` (not `TO public`)
- `(SELECT auth.uid())` wrapped to avoid initplan (see `20260221100000_fix_auth_rls_initplan.sql`)
- Reuse helper functions; do not inline auth lookups

---

## Triggers — what they enforce

Validation triggers run BEFORE INSERT OR UPDATE on many tables. Read `database.ts` and the migration that created the trigger before assuming behavior.

| Trigger | Table | Constraints |
|---------|-------|-------------|
| `validate_visit_data()` | `visits` | `promotor_id` MUST have role `promotor` or `supervisor` (NOT `asesor_de_ventas`) |
| `validate_visit_order_data()` | `visit_orders` | Accepts `promotor`, `supervisor`, `asesor_de_ventas` |
| `validate_order_data()` | `orders` | Tenant + brand consistency; brand_id can be NULL |
| `validate_client_data()` | `clients` | Tenant consistency for zone/market/client_type |
| `validate_promotion_data()` | `promotions` | Type-specific required fields per `promotion_type_enum` |
| `validate_primary_brand_unique()` | `client_brand_memberships` | Fires BEFORE INSERT — runs before ON CONFLICT |
| `validate_zone_data()` | `zones` | code + zone_type required |
| `validate_tier_data()` | `tiers` | benefits JSON shape, `min_points_required` |
| `validate_visit_inventory_data()` | `visit_brand_product_assessments` | stock_level enum + product/brand coherence |
| `validate_user_roles_unique` | `user_roles` | uniqueness with soft-delete awareness |
| `validate_single_primary_role()` | `user_roles` | Only one primary role |

If a trigger blocks a legitimate operation, the path forward is a migration that updates the trigger — never bypass it.

---

## Views

- All views must be `SECURITY INVOKER` (see `20260217100000_fix_views_security_invoker.sql` and the follow-up). When recreating a view, set `WITH (security_invoker = true)`.
- Views inherit RLS from underlying tables only when `security_invoker = true`.

---

## Functions

- Mark `SECURITY DEFINER` only when the function must perform privileged work (e.g., `redeem_qr`).
- Always set `search_path`: `SET search_path = public, pg_temp` (see `20260221170000_fix_function_search_path.sql`).
- Qualify references with `public.` to avoid `search_path` ambiguity (see `20260303010000_fix_search_path_unqualified_refs.sql`).

---

## Storage

- Buckets defined in `20260215170000_create_storage_buckets.sql`.
- Object paths: `<tenant_id>/<entity>/<file>` — enforce in policies and in app upload logic.
- New buckets require a migration.

---

## Common Performance Pitfalls

- Unindexed FK columns → slow joins. The project audited unused indexes in `20260221160000_drop_unused_indexes.sql`. If you add an FK, add an index.
- `auth.uid()` re-evaluation per row → wrap in `(SELECT auth.uid())` (`20260221100000_fix_auth_rls_initplan.sql`).
- N+1 queries in route handlers → push the join into Supabase select or into an RPC.

---

## Anti-Patterns

- ❌ Editing an existing migration. Add a new one.
- ❌ Adding a column without updating `database.ts` + `supabase.ts`.
- ❌ Creating a table without RLS.
- ❌ Hardcoding tenant lookups in policies (use helper functions).
- ❌ Using `auth.jwt() ->> 'tenant_id'` — the project resolves tenant via `user_profiles`.
- ❌ Adding a `validate_*` trigger that depends on session settings (`current_setting('app.current_tenant')`) — use direct lookups via the auth helpers.
- ❌ Dropping a policy without `IF EXISTS`.
- ❌ Forgetting indexes on `tenant_id`, `brand_id`, FK columns.

---

## Examples From the Repo

- New table with full pattern: `20260213010000_create_brand_competitors.sql` (verify content before copying).
- RLS consolidation series: `20260221120000_rls_consolidation_phase1_helpers.sql` … `phase4`.
- Trigger fix: `20260210010000_fix_validate_visit_functions.sql`.
- Function search_path fix: `20260221170000_fix_function_search_path.sql`.
- Public ID sequence fix: `20260214125745_fix_product_public_id_sequence.sql`.

---

## Validation Checklist

```
[ ] Migration file named YYYYMMDDHHMMSS_<desc>.sql, UTC timestamp
[ ] Wrapped in BEGIN/COMMIT
[ ] DDL is idempotent (IF NOT EXISTS, IF EXISTS)
[ ] tenant_id NOT NULL + FK + index
[ ] created_at, updated_at + trigger
[ ] deleted_at when soft delete is needed
[ ] public_id default if user-facing
[ ] RLS enabled
[ ] Policies use helper functions; (SELECT auth.uid()) wrapping
[ ] Indexes on every FK column
[ ] Trigger validations match app-layer expectations
[ ] src/lib/types/database.ts updated in same commit
[ ] src/lib/types/supabase.ts regenerated
[ ] Local DB applies migration cleanly
[ ] RLS validated for ≥2 roles, including cross-tenant negative test
[ ] LEARNINGS.md updated if non-obvious behavior surfaced
```
