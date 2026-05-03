# LEARNINGS.md — Compañeros en Ruta

> Persistent log of non-obvious findings discovered during implementation.
> Append-only. Never delete; supersede.

---

## Purpose

Each entry captures a **surprise** — something that wasn't visible from the code/schema alone and that, if forgotten, would lead to repeated mistakes. The aim is to prevent the same trap from being hit twice.

**DO NOT** record:
- Things obvious from `packages/shared/src/types/database.ts`
- Style preferences (those go in `.claude/rules/coding-standards.md`)
- One-off ticket details
- Generic Next.js / Supabase facts

**DO** record:
- Schema quirks not captured by types (constraints, triggers, enum casts)
- RLS gotchas (recursion, helper-function dependencies, performance traps)
- Cross-table coupling that isn't enforced by FKs
- Hidden invariants enforced only by `validate_*` triggers
- Build/runtime traps (Next.js 16 + Turbopack quirks, RSC boundaries)
- Things that broke once and silently regressed

---

## Entry Format

```markdown
### YYYY-MM-DD — <Short title>

- **Context:** <Where this came up — file/route/migration>
- **Symptom:** <What went wrong / what was confusing>
- **Root cause:** <Why — the underlying invariant>
- **Fix / Rule:** <What to do next time>
- **Tags:** <#schema #rls #frontend #migration #auth #multi-tenant #performance ...>
```

Keep each section to 1–3 lines. Link to commits, files, or migrations when useful.

---

## Append Rules

1. **One entry per finding.** Don't bundle.
2. **Date in ISO format** (YYYY-MM-DD). Use today's actual date.
3. **Tag aggressively** so future agents can grep.
4. **Supersede, don't rewrite.** If a learning becomes wrong, add a new entry that says "supersedes <date> — <title>" and explains what changed. Leave the old entry in place.
5. **No PII, no secrets, no tenant data.** Anonymize tenant/brand/client names.
6. After appending, **read the previous 3 entries** to detect duplicate findings.

---

## How Future Agents Use This File

Before starting non-trivial work:

1. Identify the area you'll touch (auth, RLS, visits, QR, etc.).
2. `grep` LEARNINGS.md for relevant tags.
3. Apply the rules from any matching entries.
4. If you discover a contradiction with current state, supersede.

---

## Avoiding Repetition

A finding worth recording is worth **operationalizing**. After three entries on the same theme, promote the rule into:

- `.claude/rules/*.md` (a hard rule), or
- A skill page in `.claude/skills/*.md` (a pattern), or
- A lint / type-level check (best when feasible)

LEARNINGS.md is the staging ground; rules and skills are the canon.

---

## Entries

> Append below. Newest at top.

### 2026-05-03 — CI baseline: 3 known-failing checks (lint, unit tests, E2E)

- **Context:** `.github/workflows/test.yml`. PR #11 (monorepo migration) surfaced these via the new pnpm/turbo pipeline. All three were failing on master too — the monorepo migration just made them visible because the workflow now runs cleanly up to those steps.
- **Symptom:** GH Actions fails 3 steps unless `continue-on-error: true` is set. None of them are runtime bugs; all three are infrastructure / test-isolation issues.
- **Root cause:** Three independent issues — see "Issues to fix" below.
- **Fix / Rule:** Until each is resolved, the steps stay marked `continue-on-error` so the workflow doesn't gate merges on pre-existing baseline failures. Vercel preview build is the de-facto gate. Each fix is tracked as its own task.
- **Tags:** #ci #lint #tests #e2e #infra #monorepo

---

### Issues to fix (post-monorepo)

#### A. Lint — 21 `@typescript-eslint/no-explicit-any` in `apps/web/src/lib/services/*.ts`

- **Files:** `adminService.ts` (5), `brandService.ts` (2), `qrService.ts` (3), `visitService.ts` (7) + 4 in `apps/web/src/app/api/admin/users/{create,invite}/route.ts`
- **Cause:** Supabase JS query builder types are too restrictive for some dynamic queries (e.g., `.from('table' as any)`, `.insert(... as any)`).
- **Fix approach:** Replace `as any` with proper Supabase generic types from `@/types/supabase`. Where the dynamic shape genuinely requires it, narrow with `as never` or build typed helpers in `packages/shared/utils/`.
- **Effort:** Medium. ~30 spots across 7 files. Mechanical but needs care to avoid regressions.
- **Severity:** Low. Lint warnings, no runtime impact.
- **Tracked in:** unmark `continue-on-error: true` from `Lint` step in `.github/workflows/test.yml` once fixed.

#### B. Unit tests — 20 failures in CI without `.env.local`

- **Files:** mostly `__tests__/components/**`, `__tests__/integration/**`, `__tests__/lib/supabase/client.test.ts`
- **Cause:** `apps/web/src/lib/env.web.ts` calls `parseSharedEnv(...)` at module evaluation. When jest imports any module that transitively pulls in `@/lib/env`, the Zod parse throws because CI has no `.env.local` and GH Secrets aren't injected for unit tests.
- **Fix approach (pick one):**
  1. **Best:** make `env.web.ts` lazy — export a getter `getEnv()` that parses on first call, not at import time. Tests can mock `getEnv` cleanly. Production behavior unchanged (first request still triggers parse, fails fast on missing secrets).
  2. **Cheap:** add a `jest.setup.js` that sets dummy `process.env.NEXT_PUBLIC_*` values before any test imports run.
  3. **Brittle:** add `SUPABASE_URL` etc. as GH Action env vars in the unit-test step (couples tests to real values).
- **Effort:** Low (#2) to medium (#1). Recommend #1 for cleanliness; it also benefits mobile.
- **Severity:** Medium. Tests aren't catching regressions in the affected modules.
- **Tracked in:** unmark `continue-on-error: true` from `Unit + integration tests (apps/web)` step once fixed.

#### C. E2E Playwright — `next dev` fails to boot in CI without Supabase secrets

- **Cause:** `apps/web/playwright.config.ts` `webServer.command: 'next dev'` boots a real Next dev server, which validates env vars on boot. CI has no `SUPABASE_URL` / `SUPABASE_ANON_KEY` (the workflow references `secrets.SUPABASE_URL` / `secrets.SUPABASE_ANON_KEY` but those aren't set in the GitHub repo's Secrets).
- **Fix approach (pick one):**
  1. **Recommended:** add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to GitHub repo Secrets (Settings → Secrets and variables → Actions). Use a dedicated **test/staging** Supabase project — never production. Then E2E runs against that.
  2. **Alternative:** spin up a local Supabase via `supabase start` in CI before Playwright runs (heavier but no shared secrets). Requires `supabase` CLI in the runner.
  3. **Stopgap:** keep E2E `continue-on-error` and rely on Vercel preview manual smoke + local runs.
- **Decision needed:** is it OK to expose a non-prod Supabase project's anon key + URL to GitHub Actions? Anon key is already public-facing, so this is normally fine, but tenant data should be a sanitized test set.
- **Effort:** Low (#1, once a test project exists), High (#2).
- **Severity:** Medium-high. No automated regression coverage for full user flows. Manual smoke + Vercel preview cover this for now.
- **Tracked in:** unmark `continue-on-error: true` from `E2E tests` step once fixed.

---

<!-- ### 2026-05-03 — Example finding -->
<!-- - **Context:** src/app/api/promotor/visits/route.ts -->
<!-- - **Symptom:** Visit insert failed with "promotor_id role mismatch" despite role being 'asesor_de_ventas' -->
<!-- - **Root cause:** validate_visit_data() trigger only accepts 'promotor' or 'supervisor'; visit_orders trigger accepts 'asesor_de_ventas' too -->
<!-- - **Fix / Rule:** For asesor flows, write to visit_orders, not visits. Document at top of any visit-creation handler. -->
<!-- - **Tags:** #schema #triggers #visits #asesor -->
