# Supabase Rules — Compañeros en Ruta

> Rules for working with Supabase in this repository: clients, queries, RLS, migrations, storage, realtime.

---

## Clients

There are exactly three Supabase client factories. Use the right one.

| File | Function | Use case |
|------|----------|----------|
| `apps/web/src/lib/supabase/client.ts` | `createClient()` | Browser / Client Components |
| `apps/web/src/lib/supabase/server.ts` | `createClient()` | Server Components, Route Handlers, Server Actions |
| `apps/web/src/lib/supabase/server.ts` | `createServiceClient()` | Admin operations that genuinely require RLS bypass — last resort |
| `apps/web/src/lib/supabase/middleware.ts` | `updateSession()` | Next.js middleware (do not call elsewhere) |

### MUST

- **MUST** import from `@/lib/supabase/{client,server}` — never directly from `@supabase/ssr` or `@supabase/supabase-js` in app code.
- **MUST** create a fresh client per request on the server. Don't memoize across requests.
- **MUST** await `createClient()` on the server (it reads cookies asynchronously).

### MUST NOT

- **MUST NOT** import the server client into a Client Component.
- **MUST NOT** use `createServiceClient()` to "fix" an RLS problem. If RLS blocks a legitimate operation, the policy is wrong — fix the policy with a migration.
- **MUST NOT** instantiate Supabase clients in module scope.

---

## Auth & Authorization

### MUST

- **MUST** use the role-scoped auth helpers in route handlers:
  - `apps/web/src/lib/api/admin-auth.ts` → `resolveAdminAuth`
  - `apps/web/src/lib/api/promotor-auth.ts` → `resolvePromotorAuth`
  - `apps/web/src/lib/api/asesor-auth.ts` → `resolveAsesorAuth`
  - `apps/web/src/lib/api/brand-auth.ts` → `resolveBrandAuth`
- **MUST** check `isXxxAuthError(result)` before destructuring success fields, and return `xxxAuthErrorResponse(result)` on failure.
- **MUST** rely on `x-supabase-user-id` header (set by middleware) for cheap user resolution. Helpers already do this; don't bypass.
- **MUST** treat `user_roles.status = 'active'` AND `deleted_at IS NULL` as the join condition for active roles.

### MUST NOT

- **MUST NOT** call `supabase.auth.getUser()` in new route handlers — go through the auth helper.
- **MUST NOT** infer role from `user_roles.scope`. The authoritative fields are `role` + `brand_id` + `status`.
- **MUST NOT** join `user_roles` to `auth.users.id`; the FK is on `user_profiles.id`, not `auth.users.id`.

---

## Queries

### MUST

- **MUST** filter by `tenant_id` on every tenant-scoped table — see `.claude/rules/multi-tenant.md`.
- **MUST** include `.is('deleted_at', null)` on tables that have soft delete (`visits`, `clients`, `user_roles`, `client_assignments`, `client_brand_memberships`, etc. — verify in `database.ts`).
- **MUST** select only the columns you need (`select('id, name')` not `select('*')`) for any list view that returns >50 rows.
- **MUST** paginate (`.range(offset, offset + limit - 1)` with `{ count: 'exact' }` when total is needed).
- **MUST** use `.maybeSingle()` when zero rows is acceptable, `.single()` only when exactly-one is required (it errors on 0).
- **MUST** verify referenced rows belong to the same `tenant_id` before linking — either via DB triggers (`validate_*_data()`) or with an explicit pre-insert check.

### MUST NOT

- **MUST NOT** use `select('*')` in production list endpoints.
- **MUST NOT** call `supabase.rpc('...')` without confirming the function exists in `supabase/migrations/` and is `SECURITY INVOKER` (or `SECURITY DEFINER` only when explicitly required and with `search_path` set).
- **MUST NOT** rely on Supabase implicit joins to enforce tenant scope. State `.eq('tenant_id', tenantId)` on the parent.

---

## Schema & Migrations

### MUST

- **MUST** put every DB change in a new migration file: `supabase/migrations/YYYYMMDDHHMMSS_<description>.sql`. Use UTC timestamp.
- **MUST** wrap migration in `BEGIN; ... COMMIT;`.
- **MUST** make migrations idempotent where possible (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`).
- **MUST** include in any new table:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT` (if tenant-scoped)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` + trigger `update_updated_at_column()`
  - `deleted_at TIMESTAMPTZ` (if soft delete is appropriate)
  - `public_id` column with the project's `generate_public_id(prefix, len)` default (if user-facing)
- **MUST** enable RLS on every new table: `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;`
- **MUST** add at least:
  - SELECT policy (tenant + role-scoped)
  - INSERT WITH CHECK (tenant + role-scoped)
  - UPDATE / DELETE policies (or "manage" via function helpers — see `20260221150000_*` series)
- **MUST** update `packages/shared/src/types/database.ts` AND regenerate `packages/shared/src/types/supabase.ts` (or update by hand to match) in the SAME commit as the migration.
- **MUST** test the migration locally (apply, query as different roles) before declaring done.
- **MUST** retro-document any existing-but-unmigrated DB state into a new migration before adding new changes.

### MUST NOT

- **MUST NOT** edit existing migration files. Add a new one to correct mistakes.
- **MUST NOT** create new validation rules in app code that should be enforced in DB triggers — push them into `validate_*_data()` functions.
- **MUST NOT** rely on `auth.jwt() ->> 'tenant_id'` in policies — the project uses `user_profiles.user_id` lookups via helper functions (see `20260221120000_rls_consolidation_phase1_helpers.sql`). Match the existing pattern.
- **MUST NOT** create unindexed FK columns. Add an index in the same migration.

---

## RLS Policy Patterns

The repo has gone through RLS consolidation phases (`20260221120000_*` through `20260221150000_*`). New policies should follow these patterns:

1. **Tenant isolation** via helper function (e.g., `is_tenant_member(tenant_id)` or equivalent — verify the latest helpers in migrations).
2. **Role check** via helper function (e.g., `is_tenant_admin()`, `has_role('promotor', brand_id)`).
3. **Scope check** for brand-bound roles.

**MUST**:
- Reuse existing helper functions; don't inline repeated `EXISTS (SELECT ...)` blocks.
- Set `SECURITY INVOKER` on views (see `20260217100000_fix_views_security_invoker.sql`).
- Set explicit `search_path = public, pg_temp` on `SECURITY DEFINER` functions (see `20260221170000_fix_function_search_path.sql`).

**MUST NOT**:
- Create policies with `auth.uid() = user_id` shortcuts on tables that should join through `user_profiles`.
- Leave a table without RLS — every public-schema table is RLS-enabled.

---

## Storage

### MUST

- **MUST** use the storage buckets defined in `20260215170000_create_storage_buckets.sql`.
- **MUST** prefix object paths with `tenant_id/` to enforce isolation at the path level.
- **MUST** use signed URLs for non-public assets; public buckets are explicit and limited.

### MUST NOT

- **MUST NOT** create new buckets without a migration.
- **MUST NOT** generate URLs that expose tenant_id in the path beyond what the bucket policy already allows.

---

## Realtime

### MUST

- **MUST** filter channels by `tenant_id`: `filter: 'tenant_id=eq.<tenantId>'` (and brand_id where applicable).
- **MUST** unsubscribe on cleanup (component unmount).
- **MUST** rely on RLS — channels respect RLS for the connected user.

### MUST NOT

- **MUST NOT** subscribe with `service_role` keys from the browser.
- **MUST NOT** broadcast user data through realtime channels in plaintext.

---

## Public ID Pattern

Most user-facing tables use a `public_id` column populated by `generate_public_id('PRE', 4)` (see existing migrations).

| Table | Prefix |
|-------|--------|
| `clients` | `CLI-` |
| `visits` | `VIS-` |
| `orders` | `ORD-` |
| `products` | `PRD-` |
| `user_profiles` | (verify) |
| `qr_codes` | (verify in migration) |

**MUST**:
- Use `public_id` in URLs, exports, QR payloads, user-visible labels.
- Use `id` (UUID) for joins, FK constraints, internal logic.

**MUST NOT**:
- Expose raw UUIDs externally.
- Build URLs with both — pick one (public_id) and stick with it.

---

## Validation Checklist

```
[ ] Imports use @/lib/supabase, not @supabase/* directly
[ ] Auth helper used in route handlers
[ ] tenant_id and deleted_at filters present on every applicable query
[ ] Selects are explicit (no `select('*')` in list endpoints)
[ ] Pagination + count where the response could exceed 50 rows
[ ] Migration file follows naming convention; wrapped in BEGIN/COMMIT
[ ] New tables: id UUID, tenant_id, created_at, updated_at, RLS enabled, policies added
[ ] Indexes added for new FK columns
[ ] packages/shared/src/types/database.ts updated in the same commit as the migration
[ ] No service-role usage outside admin paths
[ ] Storage paths prefixed with tenant_id
[ ] Realtime filters include tenant_id
[ ] Public-facing identifiers use public_id
```

---

## Stop Conditions

Stop and ask if:

1. You can't apply a migration locally.
2. Existing RLS helper functions don't cover the access pattern you need.
3. A `validate_*_data()` trigger blocks a legitimate operation — investigate before bypassing.
4. The task seems to require `service_role` usage in a user-facing path.
5. The schema has drifted (a column or policy is in DB but not in migrations, or vice versa).

Schema drift = retro-document FIRST. New changes after.
