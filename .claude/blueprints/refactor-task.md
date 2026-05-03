# Blueprint: Refactor Task — Compañeros en Ruta

> Use for: "Refactor / clean up / extract / consolidate / dedupe / migrate pattern".
> Output: behavior-preserving structural change with test coverage proving equivalence.

---

## Context

Refactors in this repo are **risk-bearing**: this is a multi-tenant production SaaS where mistakes leak data. Apply the most conservative version of the change.

A refactor is justified when at least two of the following hold:

1. The same logic is duplicated in ≥3 files.
2. Duplicated logic violates a known invariant (e.g., tenant filter, RLS pattern) — see existing consolidation series in `supabase/migrations/20260221120000_*` through `20260221150000_*`.
3. A change must touch ≥5 files because of duplication.
4. Two copies of the logic have already drifted (different bugs, different fixes).

If only one is true, prefer leaving it. Three similar lines is better than a premature abstraction.

---

## Inputs

From the user (ask if missing):

- **Refactor target** — what code, what shape change.
- **Motivation** — which of the criteria above applies.
- **Behavior contract** — what observable behavior must remain identical.
- **Boundary** — files allowed in scope, files explicitly out of scope.
- **Risk tolerance** — can we land in pieces, or is this single-PR?

---

## Steps

### 1. Acknowledge compliance

```
✓ Read CLAUDE.md and the rules in .claude/rules/
✓ Loaded skills: <list, usually architecture.md + the affected domain skill>
✓ Refactor target: <description>
✓ Behavior contract: <one or two sentences>
✓ Justification: <which of the criteria apply>
```

### 2. Inventory

Before changing anything, list:

- Files in scope (with paths).
- Public exports / call sites that depend on the to-be-changed code.
- Tests that exercise the current behavior.
- Migrations that constrain the data shape (if DB-related).

If tests are sparse, **write characterization tests first** (see step 4). A refactor without tests is gambling.

### 3. Plan

Write a plan in this format:

```
## Refactor plan: <target>

### Behavior contract
<observable behavior that must not change>

### Files in scope
- <path> — current shape → new shape

### Files out of scope
- <path>

### Migration steps
1. <step>
2. <step>

### Test coverage
- Existing tests covering this surface: <list>
- Characterization tests to add (if any): <list>

### Open questions
- <bullet>
```

If non-trivial, confirm with the user before changing code. Refactors are easier to reject early than to revert later.

### 4. Characterization tests (if coverage is thin)

Before refactoring, lock the current behavior:

- For an API route: add tests that capture every status code + response shape currently produced (don't pass judgment on whether they're correct — just lock them).
- For a service / hook: add tests that capture inputs → outputs.
- For a UI component: render snapshot or behavior assertions on every variant.

Run them and confirm green on the unrefactored code.

### 5. Refactor in slices

Land the smallest internally-consistent slice. Examples:

- Extract a helper, leave callers unchanged → adopt one caller → adopt remaining callers.
- Add a new auth helper for a role, port one route, then port the rest.
- Introduce a service method, route one handler through it, then the rest.

Each slice must:
- Pass all tests (including characterization).
- Leave the system in a working state — no half-migrations across commits.

### 6. Behavior preservation rules

- **MUST** preserve every public response shape unless the refactor's purpose is to change the contract (in which case it's a feature, not a refactor).
- **MUST** preserve `tenant_id` filters and RLS access patterns.
- **MUST** preserve `public_id` exposure.
- **MUST NOT** introduce new dependencies unless they replace something with strictly less surface area.
- **MUST NOT** change column / enum semantics. If a rename is needed, that's a migration + a feature change with backwards-compat plan.
- **MUST NOT** widen the API surface "for future flexibility." Add it when the second consumer arrives.

### 7. Validate

```
[ ] All existing tests pass (no test was modified to make it pass)
[ ] Characterization tests added in step 4 still pass
[ ] Lint: npm run lint
[ ] Types: npm run build
[ ] If UI: manual smoke test of the refactored surface
[ ] If migration: applied locally; data reads/writes still correct for ≥2 roles
[ ] Diff is reviewable — small, focused, no drive-by changes
```

### 8. Verify behavior parity

For changes likely to alter response shapes:

- Capture the response from the old code (snapshot or recorded response).
- Capture from the new code on the same input.
- Diff. The only differences should be intentional.

### 9. Append to LEARNINGS.md

If the refactor exposed a hidden invariant, an unexpected coupling, or a class of bugs that should not recur, append.

### 10. Out-of-scope follow-ups

If you spot related cleanup that's out of scope, list it in the report under "Outstanding" — do not silently absorb.

---

## Output Format

```
## Refactor summary
<1–3 sentences>

## Behavior contract
<what is invariant>

## Files changed
- <relative path>: <one-line reason>

## Slices landed
- 1: <description>
- 2: <description>

## Tests
- existing: <count, all passing>
- characterization added: <count>

## Validation
- lint / types / tests: pass
- manual: <what was checked>

## Outstanding (out of scope)
- <bullet or "none">

## Learnings recorded
- <bullet or "none">
```

---

## Validation Checklist

```
[ ] Justification meets ≥2 of the criteria
[ ] Plan was confirmed before code changes
[ ] Characterization tests added if coverage was thin
[ ] Each slice left the system green
[ ] No new dependencies (or replacements only)
[ ] No widened APIs for hypothetical consumers
[ ] tenant_id, RLS, public_id, soft-delete behaviors preserved
[ ] Existing tests untouched, all green
[ ] Diff is minimal and reviewable
[ ] Out-of-scope cleanup noted, not silently absorbed
```

---

## Common Refactor Targets in This Repo

- **Auth chain duplication** — every new route should already use `src/lib/api/<role>-auth.ts`. If you find inline `getUser → user_profiles → user_roles` in a route, that's a candidate.
- **RLS policy consolidation** — see migrations `20260221120000_*` series for the helper-function approach. New tables should follow the same pattern.
- **Inline status badges** — replace with `StatusBadge` / `OrderStatusBadge` / `VisitStatusBadge`.
- **Inline metric cards / empty states** — replace with `MetricCard` / `EmptyState`.
- **Quick actions** — `QuickActions` component is the canonical layout (recent commit `4ae09b4`); replace ad-hoc nav grids.
- **Dashboard service extraction** — heavy `page.tsx` server components with multiple Supabase calls should delegate to `src/lib/services/<domain>Service.ts`.
- **Survey logic** — survey-related helpers live under `src/lib/surveys/`; new survey code should reuse them rather than re-implementing question rendering.

---

## Stop Conditions

Stop and ask if:

1. The refactor would require simultaneous changes across more than one role's surface AND no characterization tests exist.
2. You'd need to weaken RLS, disable a trigger, or bypass tenant isolation to make the new shape work.
3. Test coverage is too thin to confirm behavior parity.
4. The motivation reduces to "I think this is cleaner" — that's not enough.
