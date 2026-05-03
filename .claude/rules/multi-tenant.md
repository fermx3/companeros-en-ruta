# Multi-Tenant Rules — Compañeros en Ruta

> Multi-tenancy is a hard isolation requirement. A leak is a security incident.
> These rules apply to every read, write, and code path that touches tenant-scoped data.

---

## Tenant Hierarchy

```
tenants (the customer org)
  └── brands (one tenant has 1..N brands)
       ├── user_profiles + user_roles (scoped to tenant; roles can be brand-scoped)
       ├── clients (tenant-scoped; can have memberships across multiple brands)
       ├── zones, markets, client_types, commercial_structures (tenant-scoped catalogs)
       ├── products (tenant + brand)
       ├── visits, visit_orders (tenant + client + promotor; brand may be on the visit)
       ├── orders (tenant + client; brand may be null in some flows)
       ├── promotions, surveys, qr_codes, notifications, points_transactions
       └── ...
```

**Tenant-scoped tables ALL have `tenant_id UUID NOT NULL`.** This is the universal isolation boundary.

---

## MUST

- **MUST** include `.eq('tenant_id', tenantId)` in every Supabase query against a tenant-scoped table — even when RLS would also enforce it. Defense in depth.
- **MUST** derive `tenantId` from the authenticated user via `user_profiles.tenant_id`. Never from a request body, query string, header, or client-side state.
- **MUST** use the role-specific auth helper (`resolveAdminAuth`, `resolvePromotorAuth`, `resolveAsesorAuth`, `resolveBrandAuth`) which returns a verified `tenantId`.
- **MUST** propagate `tenant_id` on every INSERT into a tenant-scoped table.
- **MUST** validate that any row referenced by ID (e.g., `client_id`, `brand_id`, `zone_id`) belongs to the same `tenant_id` before linking. Use a `validate_*_data()` trigger if one exists, or a pre-insert SELECT.
- **MUST** filter joins by tenant on both sides when joining tenant-scoped tables across the same query (Supabase's `select(...)` joins inherit RLS, but explicit `.eq('tenant_id', ...)` on the parent is required).
- **MUST** treat user_role scope correctly:
  - `user_roles.tenant_id` — every role belongs to a tenant
  - `user_roles.brand_id` — may be NULL (tenant-wide role) or set (brand-scoped role)
  - `user_roles.scope` — informational; rely on `role` + `brand_id` for authorization
- **MUST** distinguish `tenant_id` (org boundary) from `brand_id` (sub-org boundary). Brand isolation is a separate concern, layered on top.

## MUST NOT

- **MUST NOT** trust `tenant_id` supplied by the client.
- **MUST NOT** use `createServiceClient()` to "look up across tenants" without explicit user approval and a documented reason. Service-role bypasses RLS entirely.
- **MUST NOT** write a query that, if RLS were disabled, would return rows from another tenant.
- **MUST NOT** cache tenant-scoped data in module-level variables, singletons, or shared in-memory stores. Each request is per-tenant.
- **MUST NOT** include `tenant_id` in a response body unless absolutely required for downstream logic. Prefer `public_id` and never expose tenant UUIDs to clients.
- **MUST NOT** create cross-tenant joins (e.g., listing brands from another tenant for selection). If you ever need to, ask first.
- **MUST NOT** bypass the role-specific auth helper to "save a query" — the helpers exist precisely to make tenant resolution explicit and uniform.

---

## Validation Checklist (every change)

```
[ ] Every read against a tenant-scoped table includes .eq('tenant_id', tenantId)
[ ] Every insert sets tenant_id = the authenticated user's tenant_id
[ ] Every update/delete includes the tenant filter
[ ] Cross-table references validated to belong to the same tenant (or via DB trigger)
[ ] Auth helper used; tenant_id derived from user_profiles, not the request
[ ] No tenant_id appears in response payloads to client (public_id used instead)
[ ] No createServiceClient() introduced (or, if introduced, justification recorded)
[ ] RLS policies on any new table enforce tenant isolation (and brand isolation where required)
[ ] Tests cover the cross-tenant negative path (an attacker from tenant A cannot read tenant B)
```

---

## Enforcement Logic — applied to this repo

### A. New API route

- Open `apps/web/src/lib/api/<role>-auth.ts`. Use the matching helper.
- Every Supabase call inside the handler must:
  1. Use the resolved `tenantId`.
  2. Include `.eq('tenant_id', tenantId)`.
  3. Include `.is('deleted_at', null)` on tables with soft delete.

### B. New migration creating a table

- The table MUST have `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT`.
- The table MUST have RLS enabled and a tenant-isolation policy.
- Foreign keys to other tenant-scoped tables MUST be validated (in code or via trigger) to match `tenant_id`.

### C. New Server Component data fetch

- Resolve user → `user_profiles` → `tenant_id` once at the top.
- All subsequent queries filter by that `tenant_id`.
- If the page is per-brand, also filter by `brand_id` after verifying the user has access to that brand.

### D. New shared utility / hook

- Tenant-scoped data must not be cached at module level.
- Cache only at request scope (e.g., per route handler invocation).

---

## Brand Isolation (layered on top)

Some roles are tenant-wide (`admin`, `market_analyst`); others are brand-scoped (`brand_manager`, `supervisor`, `promotor`, `asesor_de_ventas`).

For brand-scoped roles:

- Resolve `brandId` from `user_roles.brand_id` (may be one or many active rows).
- Filter brand-scoped queries by both `tenant_id` AND `brand_id IN (...)`.
- For users with multiple brand assignments, build the `brand_ids` array and use `.in('brand_id', brandIds)`.

See `apps/web/src/app/api/promotor/visits/route.ts` for the canonical pattern.

---

## Common Gotchas

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Empty result for a row that "should be there" | Missing `tenant_id` filter, or `deleted_at IS NOT NULL` | Add `.eq('tenant_id', tenantId)` and `.is('deleted_at', null)` |
| `validate_*` trigger error on insert | Cross-tenant FK (e.g., `zone_id` from another tenant) | Verify referenced row's `tenant_id` first |
| Promotor sees clients they shouldn't | Missing `client_assignments` join + `tenant_id` filter | Use the assignment table; never list `clients` directly without scope |
| Realtime subscription receives other tenants' rows | Filter expression doesn't include `tenant_id` | Add `tenant_id=eq.<tenantId>` to the channel filter |
| Service-role query returns N tenants' data | Expected — service-role bypasses RLS | Don't use service-role in user-facing flows |

---

## When to Stop

Stop and ask the user if:

1. The task description seems to require crossing tenant boundaries (it almost never does).
2. You can't determine the right `tenant_id` source.
3. You'd need to bypass RLS / use service-role to satisfy the requirement.
4. Multiple users in the same flow have different tenants.

**Cross-tenant data leakage is a P0 incident. Treat any uncertainty as a blocker.**
