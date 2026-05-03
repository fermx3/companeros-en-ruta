# General Rules — Compañeros en Ruta

> Behavior rules for any agent (primary or sub) operating in this repository.
> These complement, never override, `CLAUDE.md`.

---

## MUST

- **MUST** read `CLAUDE.md` and the rules in `.claude/rules/` before any non-trivial change.
- **MUST** work on a feature branch — `master` is locked. Create one with `git checkout master && git pull && git checkout -b <type>/<short-name>` (`type` ∈ `feat | fix | refactor | chore`).
- **MUST** open a Pull Request against `master` and merge via squash. NEVER push directly to `master`.
- **MUST** classify the task (feature / bugfix / refactor) and load the matching blueprint from `.claude/blueprints/`.
- **MUST** load only the skills relevant to the task (see `scripts/agent-workflow.md` § 3).
- **MUST** verify schema against `packages/shared/src/types/database.ts` and migrations before writing any Supabase query.
- **MUST** evaluate cross-platform impact: if the change touches `packages/shared/`, `supabase/`, or any API contract, it must be validated on **both** `apps/web` and `apps/mobile` (or, if mobile doesn't exist yet, the PR states "Mobile validation: N/A (apps/mobile not yet present)").
- **MUST** state assumptions explicitly when something is unclear; never act on silent assumptions.
- **MUST** stop and ask the user when any of the conditions in `CLAUDE.md` § 7 apply.
- **MUST** validate (lint + types + tests + manual UI when applicable) before declaring done.
- **MUST** wait for CI green and verify the Vercel preview deploy before merging.
- **MUST** report changes, validation results, and outstanding items at end of run (see `scripts/agent-workflow.md` § 11).
- **MUST** append non-obvious findings to `LEARNINGS.md`.

## MUST NOT

- **MUST NOT** push, commit, or merge directly to `master`. Always go through a feature branch + PR.
- **MUST NOT** force-push to `master` under any circumstances. Force-push to feature branches is allowed only when necessary and not on shared branches.
- **MUST NOT** assume table/column/enum names. Read them.
- **MUST NOT** weaken RLS, disable policies, or bypass tenant filters "to make a test pass."
- **MUST NOT** introduce `service_role` usage outside `apps/web/src/lib/services/` admin paths without explicit user approval.
- **MUST NOT** expose raw UUIDs in URLs, QR codes, exports, or user-facing labels (use `public_id`).
- **MUST NOT** ship a change that breaks the contract for `apps/web` OR `apps/mobile`. Both platforms must keep working.
- **MUST NOT** edit prior migrations. Add a new corrective migration.
- **MUST NOT** commit, push, or open PRs unless the user explicitly asks.
- **MUST NOT** add features, helpers, or abstractions not required by the task.
- **MUST NOT** add comments that just restate what the code does.
- **MUST NOT** introduce new dependencies without justifying them and confirming with the user.
- **MUST NOT** narrate internal deliberation in user-facing text. Be terse.

---

## Validation Checklist (every task)

```
[ ] Working on a feature branch, NOT master
[ ] Plan written before code
[ ] Schema verified for affected tables
[ ] tenant_id present in every relevant query
[ ] RLS implications considered; migration written if needed
[ ] public_id used for any external/visible identifier
[ ] Cross-platform impact assessed (web AND mobile if shared code touched)
[ ] Strict TypeScript passes (no new `any` without justification)
[ ] Lint passes
[ ] Tests added/updated and pass
[ ] If UI: tested in browser on web, golden path + 1 edge case
[ ] If apps/mobile exists and shared code changed: tested on mobile too
[ ] No secrets, no console.log, no debug code
[ ] LEARNINGS.md updated if anything surprising surfaced
[ ] PR opened against master (never push to master directly)
[ ] CI green, Vercel preview verified
[ ] End-of-run report sent
```

---

## Enforcement Logic — applied to this repo

### A. Multi-tenant filter present?
- For each new/modified Supabase query, grep the changed file for `.eq('tenant_id', ...)` or RLS-equivalent path.
- Tables with RLS that already enforce tenant isolation still **require** explicit `tenant_id` filter for clarity and defense-in-depth.
- Exceptions: lookup tables that are not tenant-scoped (none currently — verify in `database.ts` before assuming).

### B. Auth helper used?
- For new API routes under `apps/web/src/app/api/admin/**`: use `resolveAdminAuth` from `apps/web/src/lib/api/admin-auth.ts`.
- For `apps/web/src/app/api/promotor/**`: use `resolvePromotorAuth` from `apps/web/src/lib/api/promotor-auth.ts`.
- For `apps/web/src/app/api/asesor-ventas/**`: use `resolveAsesorAuth` from `apps/web/src/lib/api/asesor-auth.ts`.
- For `apps/web/src/app/api/brand/**`: use `resolveBrandAuth` from `apps/web/src/lib/api/brand-auth.ts`.
- Re-implementing the `getUser → user_profiles → user_roles` chain inline is forbidden in new code.

### C. Soft-delete respected?
- For tables with `deleted_at` (e.g., `visits`, `clients`, `user_roles`): every read MUST include `.is('deleted_at', null)` unless explicitly fetching deleted rows for an admin tool.

### D. Validation at boundary?
- Every API route that accepts a body MUST validate with a Zod schema before touching Supabase.
- Schemas live colocated with the route or in `packages/shared/src/types/`.

### E. Public ID exposure?
- New URL params, exports, QR payloads, and user-visible IDs MUST be `public_id`. Internal foreign keys remain UUID.

---

## Communication Rules

- Default response style: **terse**. One sentence per update.
- Don't summarize what the user can read in the diff.
- If a decision involves trade-offs, state them in 1–2 sentences and ask which the user prefers — don't guess and don't implement both.
- Use the path:line format when referring to code (e.g., `apps/web/src/lib/api/admin-auth.ts:48`).
- Spanish is acceptable in user-facing strings (the product is Spanish). English in code, comments, and identifiers.

---

## Stop Conditions (re-stated)

Stop and ask if:

1. Schema cannot be verified.
2. RLS implications are unclear.
3. Cross-tenant data could leak.
4. A migration cannot be validated locally.
5. The task contradicts an invariant in `CLAUDE.md`.
6. You'd need to weaken security (disable RLS, use service_role, skip validation) to "make it work."

Do not proceed without resolution.
