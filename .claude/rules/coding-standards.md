# Coding Standards — Compañeros en Ruta

> Style and structural rules. Aligned with the actual code in `src/`.

---

## MUST

### TypeScript

- **MUST** use `strict: true` (already enforced in `tsconfig.json`).
- **MUST** import shared types from `@/lib/types/database` and `@/lib/types/supabase`.
- **MUST** type Supabase clients via `Database` generic: `createClient<Database>(...)` (already configured in `src/lib/supabase/{client,server}.ts`).
- **MUST** prefer `interface` for public domain shapes, `type` for unions/utility types.
- **MUST** use the `@/` path alias — never deep relative paths (`../../../`).
- **MUST** type API responses with explicit return shapes. Don't return `Response` without a known body.

### Naming

- Files: `kebab-case.tsx` for components, `kebab-case.ts` for utilities.
  - Exceptions already in repo (preserve): `Card.tsx`, `EmptyState.tsx`. Match what's there per folder; don't create new PascalCase files unless extending the existing pattern.
- React components: `PascalCase` exports.
- Hooks: `useXxx` in `src/hooks/`.
- Services: `xxxService.ts` in `src/lib/services/` — class with named methods OR a default-exported object.
- Auth helpers: `<role>-auth.ts` in `src/lib/api/` — `resolve<Role>Auth`, `is<Role>AuthError`, `<role>AuthErrorResponse`.
- Tests: mirror the source path under `__tests__/`. E.g. `src/components/ui/metric-card.tsx` → `__tests__/components/ui/metric-card.test.tsx`.

### Folder structure

- App routes: `src/app/(auth|dashboard)/<role>/<feature>/...` — one folder per feature; `page.tsx` + `layout.tsx` + colocated child files.
- API routes: `src/app/api/<role>/<feature>/route.ts`. Mirror the dashboard structure.
- Reusable UI: `src/components/ui/` (shadcn-style primitives). Domain components go in `src/components/<domain>/`.
- Utilities: `src/lib/utils/` (functions), `src/lib/types/` (types), `src/lib/services/` (orchestration).

### Components

- Default to **Server Components**. Add `"use client"` only when needed (state, effects, refs, browser-only APIs).
- For client components fetching data: prefer custom hooks in `src/hooks/` (e.g., `useVisits`, `useNotifications`). Don't fetch in `useEffect` directly in feature files.
- Use components from `src/components/ui/` (the canonical registry — see `.claude/skills/frontend.md`) instead of inlining div/span equivalents.
- Forms: `react-hook-form` + `@hookform/resolvers/zod` + a Zod schema. No uncontrolled forms in new code.

### Styling

- Tailwind 4. Tokens are defined in CSS variables (see `src/app/globals.css` if present).
- Never hardcode hex colors in JSX. Use Tailwind classes that map to design tokens (`bg-primary`, `text-navy`, etc.).
- `cn(...)` from `src/lib/utils.ts` (or `tailwind-merge` directly) for conditional classnames.

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
- **MUST NOT** use `any` without an explanatory comment and a follow-up TODO. There are existing `as any` usages tied to Supabase generic limitations — match the existing style if you can't avoid it.
- **MUST NOT** hardcode tenant IDs, brand IDs, role names, or environment URLs.
- **MUST NOT** define new "status badge" / "metric card" / "empty state" variants inline — use the canonical components from `src/components/ui/`.
- **MUST NOT** import from `@supabase/supabase-js` directly in app code; go through `@/lib/supabase/{client,server}`.
- **MUST NOT** use raw `fetch()` to your own API routes from a Server Component — call the data layer directly via Supabase.
- **MUST NOT** add prop drilling beyond 2 levels — extract a hook or a context provider.

---

## Validation Checklist

```
[ ] Path alias @/ used (no ../../../)
[ ] Types imported from @/lib/types/*
[ ] Supabase client comes from @/lib/supabase/{client,server}
[ ] Zod schema validates every request body
[ ] Auth helper used in route handlers (no inline getUser → profiles → roles chain)
[ ] No new `any` without justification
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
