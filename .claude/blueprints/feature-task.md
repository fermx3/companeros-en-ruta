# Blueprint: Feature Task — Compañeros en Ruta

> Use for: "Add / build / create / implement <X>".
> Output of this blueprint is a complete, validated change ready for the user to review.

---

## Context

You are adding a new capability to a multi-tenant SaaS. The change typically spans:

- DB schema (migration) — sometimes
- API route handler — usually
- Server / Client components — usually
- Hooks / services — sometimes
- Tests — always

Before writing code, follow `scripts/agent-workflow.md` and load:

- `CLAUDE.md`
- `.claude/rules/general-rules.md`
- `.claude/rules/multi-tenant.md`
- `.claude/rules/supabase-rules.md`
- `.claude/rules/coding-standards.md`
- The skills relevant to the feature (most features need `frontend.md` + `backend-apis.md` + `supabase-database.md`)

---

## Inputs

Capture from the user request (or ask):

- **Feature name** — short, action-oriented.
- **Audience role(s)** — admin / brand / supervisor / promotor / asesor / client.
- **Tenant scope** — tenant-wide, brand-scoped, or per-user.
- **Tables involved** — list explicitly.
- **Acceptance criteria** — what does "working" mean from the user's perspective?
- **Edge cases** — empty state, error state, permission boundaries.
- **UI surface** — which page(s), which component(s), is it a new route?

If any of these are unclear, **ask once** before writing code.

---

## Steps

### 0. Branch off master

```bash
git checkout master && git pull --ff-only
git checkout -b feat/<short-name>
```

NEVER work on `master` directly. Master is locked; pushes go through PRs only.

### 1. Acknowledge compliance

State explicitly:

```
✓ Read CLAUDE.md and the rules in .claude/rules/
✓ On feature branch: feat/<name>  (NOT master)
✓ Loaded skills: <list>
✓ This feature touches tables: <list>
✓ Audience: <roles>
✓ Tenant scope: <tenant-wide | brand-scoped | per-user>
✓ Cross-platform impact: <web-only | shared (web + mobile) | mobile-only>
```

### 2. Verify schema

For each table touched, look up:

1. Column names + types in `packages/shared/src/types/database.ts`
2. Recent migrations affecting the table (`ls supabase/migrations | grep <table>`)
3. RLS policies (grep migrations for `<table>` + `POLICY`)
4. Triggers (grep for `validate_<table>_data` or `update_<table>_*`)

If a column you need does not exist, **stop**. Either:

- The user wants you to add it via migration (proceed to step 3 with a migration plan), or
- You're misreading the schema (re-check).

### 3. Plan migration (if needed)

If schema changes are required:

- File: `supabase/migrations/YYYYMMDDHHMMSS_<feature>.sql`
- Include: DDL, indexes for FKs, `updated_at` trigger, RLS enable, RLS policies, `validate_*` trigger if invariants apply
- Update `packages/shared/src/types/database.ts` and (regenerate or hand-update) `packages/shared/src/types/supabase.ts`
- See `.claude/skills/supabase-database.md` for the migration template

If no schema change: proceed directly.

### 4. Plan API surface

For each new route handler:

- Path: `apps/web/src/app/api/<role>/<feature>/route.ts`
- Methods: GET / POST / PATCH / DELETE — only what's needed
- Auth: which `<role>-auth.ts` helper applies; create one if missing
- Validation: define the Zod schema (where it lives — colocated or `packages/shared/src/types/api.ts`)
- Response shape: explicit, typed
- Status codes: 200 / 201 / 204 / 400 / 401 / 403 / 404 / 409 / 422 / 500 — be precise

For complex flows: decide whether to extract logic into `apps/web/src/lib/services/<domain>Service.ts` or a Postgres RPC.

### 5. Plan UI

For each page or component:

- Where it lives: `apps/web/src/app/(dashboard)/<role>/<feature>/page.tsx`
- Server vs Client decision
- Data source: Server Component direct fetch, or Client Component + hook
- Reused canonical components (see `.claude/skills/frontend.md`)
- Form schema (if applicable)
- Loading / empty / error states

### 6. Plan tests

Minimum:

- Unit: every new utility, hook, service method
- Integration: each new API route — happy path, 401, 403, validation 4xx
- Cross-tenant negative test for any tenant-scoped endpoint
- E2E: one Playwright spec for the golden user path

### 7. Confirm plan with user (if scope is non-trivial)

Send the plan in this format:

```
## Plan: <Feature name>

### Migration
- <file> — <one-line summary>

### API
- POST /api/<role>/<feature> — body: <fields>, response: <fields>, auth: <helper>
- GET /api/<role>/<feature> — query: <params>, response: <fields>

### UI
- src/app/(dashboard)/<role>/<feature>/page.tsx (server)
- src/components/<domain>/<Feature>Form.tsx (client)
- Hooks used: <list>

### Tests
- <list>

### Risks / open questions
- <bullet>
```

If the user OKs the plan, proceed. If they redirect, replan.

### 8. Implement

Order:

1. Migration (if any) — apply locally, verify
2. Types update
3. Service / RPC (if any)
4. Auth helper (if new role)
5. API route handler
6. Hook (if any)
7. Components (Server + Client)
8. Page wiring
9. Tests

### 9. Validate

```
[ ] pnpm lint
[ ] pnpm --filter=@companeros/web build (or tsc --noEmit)
[ ] pnpm --filter=@companeros/web test (focused first; full suite before declaring done)
[ ] pnpm test:db (if migration / RLS changed)
[ ] If web UI: pnpm --filter=@companeros/web dev → browser, golden path + 1 edge case
[ ] If apps/mobile exists and shared code changed: validated on mobile too
[ ] If migration: applied locally + RLS tested for ≥2 roles
```

### 10. Open the PR

```
[ ] git push -u origin feat/<short-name>
[ ] gh pr create --base master --title "..." --body "..."
[ ] PR description states which platforms were validated:
     - "Validated on: web (admin + promotor + brand flows)"
     - "Validated on: mobile (when apps/mobile exists)" or
     - "Mobile validation: N/A (apps/mobile not yet present)"
[ ] Wait for CI green AND Vercel preview deploy verified
[ ] gh pr merge <PR#> --squash --delete-branch
```

NEVER push directly to master. NEVER force-push to master.

### 11. Append to LEARNINGS.md

If anything non-obvious surfaced, append. See `LEARNINGS.md` for format.

---

## Output Format

End-of-run report:

```
## Summary
<1–3 sentences>

## Files changed
- <relative path>: <one-line reason>
- ...

## Migration
- <file or "none">

## Validation
- lint: pass
- types: pass
- tests: <suite> <passed/total>
- manual UI: <what was tested>

## Outstanding
- <bullet or "none">

## Learnings recorded
- <bullet or "none">
```

---

## Validation Checklist

```
[ ] On a feature branch (NOT master)
[ ] Plan acknowledged and (if non-trivial) confirmed with user
[ ] Schema verified for every touched table
[ ] Migration written, applied locally, types updated (if applicable)
[ ] tenant_id filter present on every relevant query
[ ] Auth helper used in every new API route
[ ] Public_id used for user-facing identifiers
[ ] Zod validation at API boundary
[ ] RLS policies cover the new access pattern
[ ] Cross-tenant negative test added
[ ] UI uses canonical components; loading/empty/error states present
[ ] All standard validations pass (lint, types, tests, manual UI)
[ ] Validated on web (state which flows in the PR)
[ ] If apps/mobile exists and shared code changed: validated on mobile too
[ ] LEARNINGS.md updated if non-obvious findings
[ ] PR opened against master; merged via squash after CI green + preview verified
```

---

## Common Pitfalls (specific to features in this repo)

- Adding a new role-scoped endpoint without creating the matching auth helper.
- Forgetting `client_assignments` validation for promotor/asesor flows.
- Adding a column to `database.ts` without the migration (or vice versa).
- Wiring a new route to a Server Component but using `fetch('/api/...')` instead of direct Supabase access.
- Returning raw UUIDs in API response when `public_id` exists.
- Skipping the `validate_visit_data` constraint: it requires `promotor` or `supervisor` role on `promotor_id` (NOT `asesor_de_ventas`).
- Defining a status badge inline instead of using `StatusBadge` / `OrderStatusBadge` / `VisitStatusBadge`.
