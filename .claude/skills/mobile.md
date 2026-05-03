# Skill: Mobile — Compañeros en Ruta

## Scope

Constraints and patterns for migrating role-scoped flows from web (Next.js) to mobile (React Native / Expo) **without breaking the web app**.

This skill is forward-looking: as of the current commit on `main`, the project is web-only (Next.js 16 + Tailwind). Mobile migration is anticipated. This document defines the rules so:

1. New web code is **mobile-portable** by default.
2. When mobile starts, the team has a clear playbook.

If a mobile package (`apps/mobile`, `expo`, etc.) appears in the repo and contradicts this guide, follow the actual code and propose updating this skill.

---

## When to Use

- Designing or refactoring code that may eventually run on mobile (most domain logic).
- Reviewing whether a new abstraction can be shared between web and a future mobile client.
- Touching auth, data access, or domain types that are likely to be shared.

Do not use for: web-only UI primitives that have no mobile counterpart.

---

## Hard Constraint: Don't Break the Web

The web app is in production. Any preparation for mobile MUST:

- Keep the existing web flows working.
- Avoid web-incompatible imports inside shared modules (e.g., `react-native` in `src/lib/`).
- Avoid premature abstractions that don't already have a concrete second consumer.

If the user asks for mobile work that would require restructuring web code today without a clear mobile target, **stop and ask**.

---

## Sharing Strategy (recommended)

When the mobile app lands, the recommended split is:

```
src/lib/types/        → safe to share (TypeScript types, Zod schemas)
src/lib/services/     → safe to share IF Supabase access is abstracted (no `next/headers`)
src/hooks/            → web-only by default; shared hooks need DOM-free implementations
src/components/ui/    → web-only (shadcn + Tailwind); mobile gets its own primitives
src/lib/supabase/     → server.ts is web-only; client.ts can be a base shared client
```

A future structure might be:

```
packages/
  shared/             # types, schemas, services (UI-agnostic)
  web/                # current Next.js app
  mobile/             # Expo app
```

---

## Rules for Web Code Today (mobile-friendly defaults)

### MUST

- **MUST** keep domain types in `src/lib/types/` free of `next/*`, `next/headers`, DOM imports, or browser-only APIs.
- **MUST** define Zod schemas in `src/lib/types/` (or near the domain) so they can be shared.
- **MUST** keep service-layer files (`src/lib/services/*Service.ts`) DOM-free. Pass a Supabase client in (constructor or method arg) rather than capturing one.
- **MUST** keep auth helpers in `src/lib/api/<role>-auth.ts` web-specific (they use `next/headers`). Mobile will need its own helpers — that's fine.
- **MUST** prefer Supabase data access for the canonical contract; the same RLS protects both clients.

### MUST NOT

- **MUST NOT** import `next/...` from anywhere under `src/lib/types/`, `src/lib/services/` (mobile will reuse).
- **MUST NOT** assume cookies are the only auth transport. Mobile typically uses access/refresh tokens directly.
- **MUST NOT** hardcode design decisions to Tailwind classes inside service-layer code. Keep services UI-agnostic.
- **MUST NOT** rely on Server Actions for logic that must also run from a mobile client. Expose a Route Handler or RPC.
- **MUST NOT** introduce `react-native` imports in this repo while it is web-only.

---

## API Contract Hygiene

The API routes under `src/app/api/...` are the **public contract**. Mobile will consume them.

### MUST

- **MUST** use stable, versionable response shapes. When changing, add a field; don't rename without a migration plan.
- **MUST** validate input with Zod schemas declared in shareable modules (`src/lib/types/api.ts` or feature-local schemas re-exported there).
- **MUST** return `public_id` in API responses. Mobile will pass `public_id` back in URLs.
- **MUST** never put `tenant_id` or other server-only fields in the response body unless absolutely required.

### MUST NOT

- **MUST NOT** rely on cookies for cross-origin mobile clients without a documented strategy. Today web uses cookies; mobile will likely use `Authorization: Bearer <access_token>`.
- **MUST NOT** embed HTML in API responses.

---

## Auth Strategy (web vs mobile)

| Concern | Web (today) | Mobile (future) |
|---------|-------------|-----------------|
| Session transport | HttpOnly cookies via `@supabase/ssr` | Access/refresh tokens stored in secure storage (Expo SecureStore / Keychain) |
| Session refresh | Middleware (`src/lib/supabase/middleware.ts`) | Supabase JS client auto-refresh |
| User identity injection | `x-supabase-user-id` header injected in middleware | Bearer token verified server-side |
| API auth helpers | `src/lib/api/<role>-auth.ts` (use `next/headers`) | Mirror helpers that read `Authorization` header |

When introducing the mobile client:
1. Add a `src/lib/api/<role>-auth-mobile.ts` (or unify) that reads `Authorization` Bearer.
2. Keep both code paths converged via a shared `verifyRoleFromToken(token)` core.

---

## Data Access from Mobile (recommended)

For mobile, prefer:

1. **Direct Supabase JS** for reads/writes on tables — RLS gives the same protection.
2. **Custom API routes** for multi-step or privileged operations that already exist on web.
3. **RPC functions** (Postgres) for atomic transactions — same as web.

Avoid duplicating logic between mobile and `src/app/api/...`. If a mobile screen needs a flow that today is a route handler, call the route handler.

---

## UI Sharing

Tailwind + shadcn does not run on React Native. Plan for:

- Mobile gets its own primitives library (e.g., `nativewind` + custom components).
- Domain components (calendar, list, form) get **logic** shared via hooks/services and **rendering** kept platform-specific.

Don't attempt to share `src/components/ui/*` to mobile.

---

## Anti-Patterns

- ❌ Importing `next/headers` from a shared service.
- ❌ Embedding Tailwind class strings in shared logic.
- ❌ Returning HTML strings from API routes for "rendering ease."
- ❌ Splitting code today into `packages/shared` without a real consumer.
- ❌ Rewriting working web code for "mobile parity" before the mobile app exists.
- ❌ Committing React Native dependencies before the mobile app is set up.

---

## Validation Checklist

```
[ ] Shared modules (types, services, schemas) have no next/* / DOM imports
[ ] Zod schemas live in shareable modules
[ ] API responses use public_id and stable shapes
[ ] Auth in route handlers goes through src/lib/api/<role>-auth.ts (web)
[ ] No premature abstraction — no packages/ split without a mobile consumer
[ ] Web flows untouched and tests still green
[ ] If mobile-specific code added: clearly isolated under apps/mobile or packages/mobile
[ ] Documentation updated when split is introduced
```

---

## Stop Conditions

Stop and ask if:

1. The user asks to "share code with mobile" but no mobile app exists yet.
2. A change requires moving code out of `src/` into `packages/shared/` — discuss the migration plan first.
3. A mobile-specific dependency is requested but the mobile app isn't initialized.
4. The proposed mobile path conflicts with existing web behavior.
