# Agent Workflow — Compañeros en Ruta

> Decision tree and execution checklist for any agent operating in this repo.
> If you skip this, you will break multi-tenancy. Do not skip it.

---

## 1. Loading Context (in order)

```
1. CLAUDE.md                          (repo root) — hard rules
2. .claude/rules/general-rules.md     — agent behavior
3. .claude/rules/multi-tenant.md      — tenant isolation
4. .claude/rules/supabase-rules.md    — DB / RLS rules
5. .claude/rules/coding-standards.md  — code style
6. <task blueprint>                   — see step 3 below
7. <relevant skills>                  — see step 4 below
8. packages/shared/src/types/database.ts          — schema reference
9. supabase/migrations/<latest>       — recent DDL
```

Stop reading once you have what the task needs. Don't load unrelated skills.

---

## 2. Classify the Task

| Trigger | Task type | Blueprint |
|---------|-----------|-----------|
| "Add / build / create / implement <X>" | Feature | `.claude/blueprints/feature-task.md` |
| "Fix / broken / regression / error / 500" | Bugfix | `.claude/blueprints/bugfix-task.md` |
| "Refactor / clean up / extract / consolidate / dedupe" | Refactor | `.claude/blueprints/refactor-task.md` |
| Mixed | Pick the **dominant** intent + load the secondary blueprint as reference |

---

## 3. Select Skills (load only what applies)

| The task involves… | Load skill |
|--------------------|-----------|
| React / pages / components / Tailwind / shadcn | `frontend.md` |
| API routes / route handlers / auth helpers | `backend-apis.md` |
| Supabase queries / RLS / new migration / schema | `supabase-database.md` |
| Raw SQL / data analysis / reporting / views | `data-sql.md` |
| Tests (jest, RTL, msw, playwright) | `testing-qa.md` |
| Auth, RLS, secrets, validation, threat surface | `security.md` |
| Anything that touches React Native / Expo / mobile compatibility | `mobile.md` |
| Cross-cutting design (boundaries, services, layering) | `architecture.md` |

Most tasks need 2–4 skills. Loading all eight for every task is wasteful.

---

## 4. Verify Rules

Before writing code, confirm against rules:

```
[ ] general-rules.md       — behavior, stop-conditions, communication
[ ] multi-tenant.md        — tenant_id present in every relevant query
[ ] supabase-rules.md      — RLS, migration-first, no service-role abuse
[ ] coding-standards.md    — naming, layering, types, imports
```

If a rule conflicts with the task, **stop and ask**.

---

## 5. Decision Tree — Schema impact

```
Does the task add/rename/remove a column, table, type, policy, view, function, trigger?
├── YES  → migration required
│         → write migration → apply locally → update packages/shared/src/types/* → run tests
│         → if RLS: validate with at least 2 roles
└── NO   → fast path
          → consult packages/shared/src/types/database.ts for column names
          → no migration needed
```

---

## 6. Decision Tree — Auth & multi-tenant

```
Does the code path read or write tenant-scoped data?
├── YES → must derive tenant_id from authenticated user
│         ├── server route handler → resolve via apps/web/src/lib/api/<role>-auth.ts
│         ├── server component     → apps/web/src/lib/supabase/server.ts createClient + select user_profiles
│         └── client component     → must call an API route, NEVER trust client-supplied tenant_id
│   AND every query must:
│         ├── include .eq('tenant_id', tenantId), AND
│         └── include .is('deleted_at', null) when soft-delete column exists
└── NO  → still respect RLS — never use createServiceClient() unless explicitly required
```

---

## 7. Decision Tree — Public ID exposure

```
Will an identifier appear in:
- a URL path/segment?
- a QR code?
- an export (CSV/PDF)?
- a user-visible label?
└── YES → use public_id (CLI-####, VIS-####, ORD-####, PRD-####, etc.)
          NEVER expose raw UUID externally.
          Internal joins still use id (UUID).
```

---

## 8. Execution Steps

```
1. Plan (write down):
   - files to add/modify
   - tables/columns touched
   - migration filename if any
   - tests to add/modify

2. Confirm scope with user if ambiguous (one round-trip).

3. Implement smallest coherent slice first.

4. Validate locally (in this order):
   - npm run lint
   - npm run build         (or tsc --noEmit if you only want types)
   - npm run test          (or focused: jest <pattern>)
   - npm run test:e2e      (only if UI flow changed)
   - manual browser check  (if UI)

5. If a migration was added:
   - bash ./scripts/import_local_backup.sh  (refresh local data if needed)
   - reset local DB (per repo workflow) and verify migration applies cleanly

6. Update LEARNINGS.md if a non-obvious finding emerged.

7. Report: changes summary, validation results, anything skipped + why.
```

---

## 9. Safe Execution Rules

- **NEVER** run destructive commands (`git push --force`, `rm -rf`, `supabase db reset` against remote, `DROP TABLE`) without explicit approval.
- **NEVER** commit without the user asking.
- **NEVER** weaken RLS, disable a policy, or use `service_role` to "unblock" a test.
- **NEVER** edit existing migrations — add a new one.
- **NEVER** write to `supabase/migrations/` to "fix" an issue without a clear migration purpose.
- **ALWAYS** run lint + build + tests before declaring DONE.
- **ALWAYS** prefer auth helpers in `apps/web/src/lib/api/` over re-implementing the auth chain.
- **ALWAYS** use the `@/` path alias.

---

## 10. When Things Go Wrong

```
Symptom                                 → First check
──────────────────────────────────────────────────────────────────────
RLS returns empty data                  → Is the user authenticated? Is tenant_id derived?
Insert fails with role check error      → check validate_visit_data / validate_visit_order_data triggers
Type error on supabase query            → packages/shared/src/types/supabase.ts may be stale; regenerate or align types/database.ts
Build hang on Turbopack                 → restart dev server; check next.config.ts pageExtensions
Cookies not set on auth refresh         → middleware response cookie forwarding (see apps/web/src/lib/supabase/middleware.ts)
Cross-tenant row appears in response    → STOP. Treat as a security incident. Don't ship.
Migration fails locally                 → never edit prior migrations; add a corrective one
```

---

## 11. Output Contract

Every agent run ends with a short report:

```
## Summary
- <one sentence per substantive change>

## Files changed
- <relative path>: <one-line reason>

## Validation
- lint: pass / fail / skipped (reason)
- types: pass / fail / skipped (reason)
- tests: <suite> <pass/fail counts>
- manual: <what was tested in browser, if applicable>

## Outstanding
- <anything left undone, with a reason>

## Learnings to record
- <bullet for LEARNINGS.md, or "none">
```

If validation failed, the report comes BEFORE you propose more code, not after.
