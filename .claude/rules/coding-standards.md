# Coding Standards — Compañeros en Ruta

> Style and structural rules. Aligned with the actual code in `src/`.

---

## MUST

### TypeScript

- **MUST** use `strict: true` (already enforced in `tsconfig.json`).
- **MUST** import shared types from `@companeros/shared/types/database` and `@companeros/shared/types/supabase`.
- **MUST** type Supabase clients via `Database` generic: `createClient<Database>(...)` (already configured in `apps/web/src/lib/supabase/{client,server}.ts`).
- **MUST** prefer `interface` for public domain shapes, `type` for unions/utility types. **MUST NOT** declare an empty `interface X extends Y {}` — use `type X = Y` instead (lint rule `@typescript-eslint/no-empty-object-type` blocks this).
- **MUST** use the `@/` path alias inside `apps/web` — never deep relative paths (`../../../`).
- **MUST** type API responses with explicit return shapes. Don't return `Response` without a known body.

### `any` is forbidden — use proper types instead

These patterns are caught by `pnpm lint` (gated in CI). When you reach for `as any` or `: any`, stop and use the typed alternative:

| Pattern you wrote | Use instead |
|---|---|
| `.eq('status', value as any)` | `value as Database['public']['Enums']['<enum_name>']` |
| `.from(tableName as any)` (literal-table dynamic switch) | declare the array `as const` so the strings narrow to the table-name union |
| `.insert(payload as any)` / `.update(payload as any)` | `as Database['public']['Tables']['<table>']['Insert' \| 'Update']`. If TS rejects because of strict `Json` columns (`preferences`, `settings`, `metadata`), use `as unknown as <T>` with a one-line comment explaining the supabase-js codegen mismatch (precedent: PRs #15, #18, #20). |
| `function f(supabase: any, ...)` | `function f(supabase: SupabaseClient<Database>, ...)` (alias `SbClient` locally if used many times) |
| `(item: any) => item.x` in `.map / .filter` | drop the annotation entirely — TS infers from typed query, OR write a small inline structural type (`(p: { is_active?: boolean \| null }) => ...`) |
| `(joined.client as any)` for Supabase join projections | structural shape with optional fields: `(joined.client as { business_name?: string \| null; email?: string \| null } \| null)`. For unions of object/array, narrow with `Array.isArray`. |
| `(supabase as any).from('promotor_assignments')` | Only acceptable when the table is genuinely missing from the generated supabase types. **Comment why** and add `// eslint-disable-next-line @typescript-eslint/no-explicit-any` on the same line (precedent: `surveys/route.ts`, `targeting/reach/route.ts`). Regenerating the types is the proper fix. |
| `catch (err: any) { err.something }` | `catch (err) { (err as { something?: ... }).something }` or refine with `instanceof` checks. |
| `Record<string, any>` for an accumulator | `Record<string, unknown>` and narrow at the use site. |

### CI gate

`pnpm lint` is a **hard gate** in `.github/workflows/test.yml` (Lint step has no `continue-on-error`). Regressing the lint baseline blocks merges. If you need a local override for a single line, use `// eslint-disable-next-line <rule>` with a reason in a trailing comment — the disable comment IS the documentation.

### Naming

- Files: `kebab-case.tsx` for components, `kebab-case.ts` for utilities.
  - Exceptions already in repo (preserve): `Card.tsx`, `EmptyState.tsx`. Match what's there per folder; don't create new PascalCase files unless extending the existing pattern.
- React components: `PascalCase` exports.
- Hooks: `useXxx` in `apps/web/src/hooks/`.
- Services: `xxxService.ts` in `apps/web/src/lib/services/` — class with named methods OR a default-exported object.
- Auth helpers: `<role>-auth.ts` in `apps/web/src/lib/api/` — `resolve<Role>Auth`, `is<Role>AuthError`, `<role>AuthErrorResponse`.
- Tests: mirror the source path under `apps/web/__tests__/`. E.g. `apps/web/src/components/ui/metric-card.tsx` → `apps/web/__tests__/components/ui/metric-card.test.tsx`.

### Folder structure

- App routes: `apps/web/src/app/(auth|dashboard)/<role>/<feature>/...` — one folder per feature; `page.tsx` + `layout.tsx` + colocated child files.
- API routes: `apps/web/src/app/api/<role>/<feature>/route.ts`. Mirror the dashboard structure.
- Reusable UI: `apps/web/src/components/ui/` (shadcn-style primitives). Domain components go in `apps/web/src/components/<domain>/`.
- Utilities: `packages/shared/src/utils/` (functions), `packages/shared/src/types/` (types), `apps/web/src/lib/services/` (orchestration).

### Components

- Default to **Server Components**. Add `"use client"` only when needed (state, effects, refs, browser-only APIs).
- For client components fetching data: prefer custom hooks in `apps/web/src/hooks/` (e.g., `useVisits`, `useNotifications`). Don't fetch in `useEffect` directly in feature files.
- Use components from `apps/web/src/components/ui/` (the canonical registry — see `.claude/skills/frontend.md`) instead of inlining div/span equivalents.
- Forms: `react-hook-form` + `@hookform/resolvers/zod` + a Zod schema. No uncontrolled forms in new code.

### Styling

- Tailwind 4. Tokens are defined in CSS variables (see `apps/web/src/app/globals.css` if present).
- Never hardcode hex colors in JSX. Use Tailwind classes that map to design tokens (`bg-primary`, `text-navy`, etc.).
- `cn(...)` from `packages/shared/src/utils/cn.ts` (or `tailwind-merge` directly) for conditional classnames.

### Server / API

- Use `createClient()` from `@/lib/supabase/server` in route handlers and Server Components.
- Use `createServiceClient()` ONLY for admin-back-office operations that require RLS bypass; document each use.
- Use the auth helper for the role; do not re-implement the chain.
- Validate every request body with Zod before touching Supabase.
- Return shape: `NextResponse.json({ data | error, ...meta })` with explicit HTTP status codes.

### Error handling

- Internal code paths: trust framework guarantees. Don't validate types you control.
- Boundaries (API request body, query string, external responses): validate with Zod.
- Never swallow errors. Log with `console.error('Context: ...', error)` and return `NextResponse.json({ error }, { status })`.
- Distinguish:
  - 400 Validation
  - 401 Unauthenticated
  - 403 Authenticated but not authorized (wrong role, wrong tenant)
  - 404 Resource not found / not visible
  - 409 Conflict (unique violation, state collision)
  - 500 Unhandled / DB error

### Comments

- Default: no comments.
- Only when WHY is non-obvious (a trigger constraint, a hidden invariant, a workaround).
- Never restate WHAT the code does.
- Never link to ticket numbers in code (use commit messages / PR descriptions instead).

---

## MUST NOT

- **MUST NOT** mix tabs and spaces. The repo uses 2-space indentation.
- **MUST NOT** introduce `default exports` for new utility/types modules; named exports only. (Exception: Next.js page/layout files which require default export.)
- **MUST NOT** create barrel `index.ts` files just to re-export — use them only when the module forms a coherent public API.
- **MUST NOT** use `any` to silence the type-checker. The "`any` is forbidden" table above gives a typed alternative for every common case the codebase hit. The only acceptable `any` is a `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a one-line rationale (e.g., "table missing from generated supabase types").
- **MUST NOT** hardcode tenant IDs, brand IDs, role names, or environment URLs.
- **MUST NOT** define new "status badge" / "metric card" / "empty state" variants inline — use the canonical components from `apps/web/src/components/ui/`.
- **MUST NOT** import from `@supabase/supabase-js` directly in app code; go through `@/lib/supabase/{client,server}`.
- **MUST NOT** use raw `fetch()` to your own API routes from a Server Component — call the data layer directly via Supabase.
- **MUST NOT** add prop drilling beyond 2 levels — extract a hook or a context provider.

---

## Validation Checklist

```
[ ] Path alias @/ used inside apps/web (no ../../../)
[ ] Types imported from @companeros/shared/types/*
[ ] Supabase client comes from @/lib/supabase/{client,server}
[ ] Zod schema validates every request body
[ ] Auth helper used in route handlers (no inline getUser → profiles → roles chain)
[ ] No new `any` (see the "`any` is forbidden" table above for the typed
    alternative for every common case). Any disable-comment needs a one-line
    rationale on the same line.
[ ] No empty `interface X extends Y {}` — use `type X = Y`
[ ] `pnpm --filter=@companeros/web exec eslint src/` returns 0 errors
[ ] No hex colors / hardcoded design tokens in JSX
[ ] Canonical UI components used (no inline duplicates)
[ ] No console.log; only console.error in catch blocks with context
[ ] Soft-delete (`.is('deleted_at', null)`) respected on applicable tables
```

---

## Enforcement Logic

- For every new file, the agent MUST grep the repo for an existing equivalent before creating it (e.g., a "ClickableCard" before adding a `LinkCard`).
- For every new query, the agent MUST locate at least one similar query in the same role's API folder and align the patterns.
- For every new component, the agent MUST verify against the canonical registry in `.claude/skills/frontend.md`.

If the agent must deviate from these standards, it MUST state the reason in the end-of-run report.
