# Blueprint: Bugfix Task — Compañeros en Ruta

> Use for: "Fix / broken / regression / 500 / crashes / wrong data / can't login".
> Output: a minimal change that fixes the root cause + a regression test.

---

## Context

Bugfixes in this repo most commonly stem from:

1. Missing / wrong `tenant_id` filter (data shows up for the wrong user, or empty for the right user).
2. Wrong column name used in a query (see `CLAUDE.md` § 6 pitfalls).
3. RLS policy gap (read fails or writes silently miss).
4. `validate_*` trigger rejecting an operation that should succeed (or vice versa).
5. Soft-delete not respected (`deleted_at` not filtered).
6. Public ID vs UUID confusion in URLs.
7. `auth.getUser()` re-implementation drift (use the helper).

Read these before changing anything:

- `CLAUDE.md`
- `.claude/rules/general-rules.md`
- The skill matching the bug area (`backend-apis.md` for API errors, `supabase-database.md` for DB errors, `frontend.md` for UI bugs)

---

## Inputs

From the user (ask if missing):

- **Reproduction** — exact steps, role used, payload, response/error.
- **Expected vs actual** — what should happen, what does happen.
- **Environment** — local, preview, prod.
- **Logs / error message** — verbatim if available.
- **Recent changes** — was a migration, deploy, or PR involved?

---

## Steps

### 1. Reproduce locally

- If the bug is in an API route: craft the request (curl / Thunder Client) with the failing payload as the same role.
- If UI: open the dev server, log in as the affected role, repeat the steps.
- If DB: replay the failing query against the local Supabase using the SQL the app generates (Supabase logs / `EXPLAIN`).

If you cannot reproduce: **stop and ask** for more context. Don't fix invisible bugs.

### 2. Locate the surface

State explicitly:

```
Surface: <file:line>
Symptom: <one sentence>
Trigger: <call path that reaches the surface>
Recent changes: <commits or migrations or "none">
```

### 3. Find the root cause (do NOT patch the symptom)

Walk the call path. For each step, verify:

- Is the schema accessed correctly? (column names in `packages/shared/src/types/database.ts`)
- Is `tenant_id` derived correctly and filtered correctly?
- Is the auth helper used? Are role checks correct?
- Are RLS policies allowing/denying as expected? Test with `psql` as different users.
- Are `validate_*` triggers in play?
- Is `deleted_at` handled?
- Is `public_id` vs `id` confusion present?

When you find the root cause, **state it explicitly** before writing a fix:

```
Root cause: <one sentence — what was wrong and why>
```

### 4. Decide the fix scope

- **Smallest safe change** that addresses the root cause.
- Do not refactor surrounding code "while you're there." If you spot drift, note it in LEARNINGS.md or as outstanding work.
- If the fix requires a migration (e.g., RLS gap, missing index, trigger bug):
  - New migration file: `supabase/migrations/YYYYMMDDHHMMSS_fix_<short>.sql`
  - Never edit the offending migration in place.

### 5. Write a failing regression test FIRST

Add a test that fails on `main` and passes after the fix. Examples:

- API bug: `apps/web/__tests__/app/api/<role>/<feature>.test.ts` exercising the failing payload
- RLS bug: `tests/database/...` with the cross-tenant negative case
- UI bug: component or e2e test for the failing interaction

Run the test, confirm red. Then implement the fix.

### 6. Implement the fix

- Match the surrounding code style.
- If the fix is in an auth helper, the change propagates to many routes — check callers.
- If the fix is in a `validate_*` trigger, ensure no legitimate operations break — run the trigger's existing test cases.

### 7. Validate

```
[ ] Regression test passes
[ ] Existing tests still pass: npm run test
[ ] Lint: npm run lint
[ ] Types: npm run build (or tsc --noEmit)
[ ] If UI: manual repro is now green
[ ] If migration: applied locally + RLS validated for ≥2 roles
[ ] No collateral changes — diff is minimal
```

### 8. Append to LEARNINGS.md

Bugs are the highest-signal source of learnings. Append unless the bug was a typo with no broader lesson. Include:

- Symptom
- Root cause (the invariant that was violated)
- Fix / rule for the future
- Tags (#schema #rls #auth #soft-delete etc.)

---

## Output Format

```
## Bug summary
<one sentence>

## Repro
<steps>

## Root cause
<one sentence>

## Fix
- <file:line> — <what changed>

## Migration (if any)
- <file>

## Tests added
- <file> — <case covered>

## Validation
- regression test: pass
- lint / types / tests: pass
- manual: <what was retested>

## Learnings recorded
- <bullet>
```

---

## Validation Checklist

```
[ ] Reproduced locally before any code change
[ ] Root cause stated, not just the symptom
[ ] Regression test added, fails on main, passes after fix
[ ] Fix scope is minimal — no incidental refactors
[ ] If auth/RLS-related, cross-tenant case verified
[ ] If trigger/migration-related, related migrations and triggers checked
[ ] All standard validations pass
[ ] LEARNINGS.md updated unless trivially typo
```

---

## Common Bug Classes & First Checks

| Symptom | First check |
|---------|------------|
| 401 on a route that should accept the user | Is the auth helper for the right role? Is `user_roles.status = 'active'` and `deleted_at IS NULL`? |
| 403 unexpectedly | Role check too narrow, or scope (brand_id) mismatch |
| Empty list when data exists | Missing `tenant_id` filter, or `deleted_at IS NOT NULL`, or wrong join |
| `column "X" does not exist` | Column was renamed; check `database.ts` and the pitfalls table in `CLAUDE.md` |
| `new row violates row-level security policy` | Insert is missing `tenant_id`, or RLS WITH CHECK isn't met, or user lacks role |
| `validate_*_data() failed` | Read the trigger source in the migration; usually a tenant or role mismatch |
| `relation "X" does not exist` in local | Migration not applied; reset local DB |
| Cookies missing on auth refresh | `apps/web/src/lib/supabase/middleware.ts` cookie forwarding — see existing comments |
| Wrong dashboard after login | Don't auto-redirect from /login; let the login page detect role (per `middleware.ts` comment) |
| Cross-tenant row visible | STOP. Treat as a P0 incident. Don't ship until root cause is found. |

---

## Stop Conditions

Stop and ask if:

1. You can't reproduce.
2. The bug suggests a security violation (cross-tenant leak, RLS bypass) — escalate before patching.
3. The fix would require disabling a `validate_*` trigger or weakening RLS.
4. The bug seems to span an external service you can't access.
