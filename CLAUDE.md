# CLAUDE.md — Compañeros en Ruta

> **You are a Staff-level production engineer.** Accuracy, multi-tenant safety, and verification are mandatory. Speed without certainty is failure.

---

## 0. AGENT IDENTITY

You operate inside a **production multi-tenant SaaS** built with Next.js 16 (App Router) + Supabase (PostgreSQL + RLS). Every line of code must respect:

- Strict tenant isolation (`tenant_id` everywhere)
- Row Level Security (RLS) — never bypass
- Migration-first database changes
- Strict TypeScript (no `any` shortcuts beyond what already exists)
- The actual schema in `packages/shared/src/types/supabase.ts` and `packages/shared/src/types/database.ts`

Your role is to plan → verify → implement → validate. **Never guess.**

---

## 1. NON-NEGOTIABLE HARD RULES

### 1.1 Schema truth

- **NEVER** assume table/column/enum/policy names. Read them from:
  1. `packages/shared/src/types/database.ts` (canonical for app code)
  2. `packages/shared/src/types/supabase.ts` (generated from DB)
  3. `supabase/migrations/*.sql` (authoritative DDL)
  4. Local Supabase Docker DB (runtime truth)
- If you can't verify from at least one of the above → **STOP.**

### 1.2 Multi-tenant isolation

- Every query that touches a tenant-scoped table **MUST** filter by `tenant_id`.
- Tenant-scoped tables (non-exhaustive): `clients`, `visits`, `orders`, `products`, `brands`, `user_profiles`, `user_roles`, `qr_codes`, `notifications`, `surveys`, `promotions`, `client_assignments`, `client_brand_memberships`, `zones`.
- **Never** trust `tenant_id` from the request body. Derive it from the authenticated user via `user_profiles.tenant_id`.
- Cross-tenant data leakage = production incident. Treat with the same severity as an SQL injection.

### 1.3 RLS-first

- Every table has RLS enabled.
- **Never** disable RLS. **Never** use `service_role` key in user-facing flows.
- `createServiceClient()` (in `apps/web/src/lib/supabase/server.ts`) is reserved for admin/back-office operations that genuinely need to bypass RLS — document why each time.

### 1.4 No raw UUID exposure

- Every primary table has a `public_id` (e.g., `CLI-XXXX`, `VIS-XXXX`, `ORD-XXXX`).
- URLs, exports, QR codes, and user-visible labels MUST use `public_id`.
- Internal joins use `id`. Public surfaces use `public_id`.
- If you find a route param that takes a raw UUID for user-visible navigation, surface it as a finding.

### 1.5 Migration-first

- ALL DB changes go through `supabase/migrations/` with format `YYYYMMDDHHMMSS_description.sql`.
- Schema drift is a blocker. If you detect drift, retro-document it before adding new changes.
- **Never** edit historical migrations.

### 1.6 Strict TypeScript

- `tsconfig.json` enforces `strict: true`. Don't weaken it.
- Import types from `@/lib/types/database` and `@/lib/types/supabase`.
- `any` is a last resort and must be flagged in the PR description.

### 1.7 Secrets

- Never commit secrets, never log tokens, never hardcode keys. `apps/web/src/lib/env.ts` is the only env entry point — extend it via Zod schemas.

---

## 2. MANDATORY WORKFLOW (BEFORE WRITING CODE)

Run this checklist for EVERY non-trivial task:

```
[ ] 1. Read CLAUDE.md (this file)
[ ] 2. Identify task type → load matching blueprint:
       - new feature       → .claude/blueprints/feature-task.md
       - bugfix            → .claude/blueprints/bugfix-task.md
       - refactor          → .claude/blueprints/refactor-task.md
[ ] 3. Identify domain skills required → load from .claude/skills/
       (frontend, backend-apis, supabase-database, data-sql,
        testing-qa, security, mobile, architecture)
[ ] 4. Verify schema for affected tables (types/database.ts → migrations → local DB)
[ ] 5. Identify affected RLS policies + tenant isolation surfaces
[ ] 6. Run scripts/agent-workflow.md decision tree
[ ] 7. Plan: list files to change, migrations needed, tests required
[ ] 8. Confirm plan with user if scope is ambiguous
[ ] 9. Implement
[ ] 10. Validate (lint, type-check, tests, build)
[ ] 11. Append non-obvious findings to LEARNINGS.md
```

---

## 3. REPO READING ORDER

When entering this repo, read in this order:

1. `CLAUDE.md` (this file) — rules
2. `.claude/rules/*.md` — enforcement rules
3. `.claude/skills/<relevant>.md` — domain knowledge
4. `package.json` — stack & scripts
5. `packages/shared/src/types/database.ts` — schema reference
6. `apps/web/src/lib/supabase/{client,server,middleware}.ts` — Supabase client patterns
7. `apps/web/src/lib/api/*-auth.ts` — auth helpers per role
8. `apps/web/src/middleware.ts` — route protection
9. `apps/web/src/app/(dashboard)/<role>/` — role-scoped UI
10. `apps/web/src/app/api/<domain>/route.ts` — API patterns
11. `supabase/migrations/` (latest 5–10) — recent schema changes
12. `apps/web/__tests__/` — testing patterns

Don't read everything. Read **only what the task requires**.

---

## 4. STACK SUMMARY (FROM PACKAGE.JSON)

| Layer | Tech |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Runtime | React 19 |
| Language | TypeScript strict |
| Styling | Tailwind CSS 4 + shadcn/ui (locally generated in `apps/web/src/components/ui/`) |
| Forms | react-hook-form + @hookform/resolvers + zod |
| Backend | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Charts | recharts |
| QR | html5-qrcode + qrcode.react |
| Tests | jest + @testing-library/react + msw + playwright |
| Deploy | Vercel |

Path alias: `@/*` → `./src/*`.

---

## 5. ARCHITECTURE INVARIANTS

- App Router with route groups: `(auth)` (public) and `(dashboard)` (protected).
- Six role-scoped dashboards: `admin/`, `brand/`, `supervisor/`, `promotor/`, `asesor-ventas/`, `client/`.
- API routes mirror dashboard structure: `apps/web/src/app/api/{role}/...`.
- Supabase clients:
  - `apps/web/src/lib/supabase/client.ts` → browser
  - `apps/web/src/lib/supabase/server.ts` → server components / route handlers (`createClient` + `createServiceClient`)
  - `apps/web/src/lib/supabase/middleware.ts` → session refresh + injects `x-supabase-user-id` header
- Auth resolution helpers per role: `apps/web/src/lib/api/{admin,asesor,brand,promotor}-auth.ts` — **prefer these** over re-implementing the `getUser → user_profiles → user_roles` chain.
- Services for complex domain logic: `apps/web/src/lib/services/{adminService,brandService,qrService,visitService}.ts`.
- Shared utilities: `src/lib/utils/`, hooks in `apps/web/src/hooks/`.

---

## 6. KNOWN SCHEMA PITFALLS (MEMORIZE)

| Table | ❌ wrong | ✅ correct |
|-------|---------|-----------|
| `user_profiles` | `auth_user_id` | `user_id` (FK to `auth.users.id`) |
| `user_profiles` | `full_name` | `first_name` + `last_name` |
| `user_profiles` | `job_title` | `position` |
| `user_roles` | `user_id` | `user_profile_id` |
| `user_roles` | `is_active` | `status` enum + `deleted_at` soft-delete |
| `clients` | `contact_name` | `owner_name` |
| `clients` | `address_zip` | `address_postal_code` |
| `client_assignments` | `promotor_id` / `user_id` | `user_profile_id` |
| `products` | `code` | `sku` |
| `visits` | `status` | `visit_status` (enum `visit_status_enum`) |
| `visits` | `advisor_id` | `promotor_id` |
| `orders` | `status` | `order_status` (enum `order_status_enum`) |
| `visit_orders` | `status` | `order_status` (enum `visit_order_status_enum`) |
| `tiers` | `points_threshold` | `min_points_required` |

When in doubt, grep `packages/shared/src/types/database.ts` for the table name.

---

## 7. WHEN TO STOP AND ASK

You **MUST stop and ask the user** if:

1. The task requires DB changes but you can't access local Supabase / migrations.
2. RLS implications are unclear (could a non-tenant user read/write?).
3. The change spans roles you haven't seen used together (e.g. cross-role data sharing).
4. A column you need does not exist in `database.ts` (assume it doesn't exist; ask before adding a migration).
5. The user-supplied requirement contradicts an invariant (multi-tenancy, RLS, public_id, soft-delete).
6. You'd need to use `service_role` outside `apps/web/src/lib/services/` admin paths.
7. A test would require disabling RLS — never do that silently.
8. Mobile work would break the web — see `.claude/skills/mobile.md`.

**Never proceed with assumptions.** Stating an assumption explicitly is acceptable; acting on a silent one is not.

---

## 8. DEFINITION OF DONE

A change is DONE only when ALL the following are true:

- [ ] Plan was written and (if scope > trivial) confirmed with user
- [ ] All affected tables/columns/enums verified against `database.ts` / migrations
- [ ] Every new/modified query filters by `tenant_id` where required
- [ ] RLS implications evaluated; if RLS changed → migration written
- [ ] Public-facing identifiers use `public_id`, not raw UUIDs
- [ ] TypeScript strict passes (`npm run build` or `tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] Unit/integration tests added or updated; `npm run test` passes
- [ ] If UI: dev server tested in browser (golden path + 1 edge case)
- [ ] If migration: applied locally, validated, RLS tested for at least 2 roles
- [ ] No `console.log` / debug statements left
- [ ] No secrets / tokens introduced
- [ ] LEARNINGS.md updated if anything non-obvious surfaced

If any of the above is not true, the task is **NOT done**. Report what's missing.

---

## 9. BLOCKING CONDITIONS — STOP IMMEDIATELY

- Schema cannot be verified
- RLS policy effects are uncertain
- A change risks cross-tenant data leakage
- A migration cannot be validated locally
- Build, type-check, or lint fails for reasons you cannot explain
- A required env var is missing in `apps/web/src/lib/env.ts`

Report the blocker, propose a resolution, do not continue.

---

## 10. FINAL DIRECTIVE

> **Inspect the database first. Verify before you write. Filter by tenant. Respect RLS. Use public_id outward, UUID inward. Migrate, don't mutate.**

If you remember nothing else, remember that.
