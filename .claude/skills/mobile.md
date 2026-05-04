# Skill: Mobile — Compañeros en Ruta

## Scope

Constraints and patterns for the Expo (React Native) mobile app at `apps/mobile`. The mobile app shares the canonical contract with `apps/web` (Supabase RLS + the web Route Handlers under `apps/web/src/app/api/`). The web app must keep working at all times.

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

## Layout (post-bootstrap)

```
packages/shared/                # @companeros/shared (DOM-free, RN-safe)
  src/types/                    # database, supabase, admin, api, visits
  src/utils/                    # cn, csv, phone, public-id, ...
  src/surveys/                  # resolve-visibility-conditions
  src/env/shared.ts             # neutral Zod schema (apps map EXPO_PUBLIC_* / NEXT_PUBLIC_* → SharedEnv)

apps/web/                       # Next.js 16
  src/lib/api/auth-resolver.ts  # accepts cookie + Bearer → resolveUserId(supabase)
  src/lib/api/<role>-auth.ts    # all 4 helpers delegate to auth-resolver

apps/mobile/                    # Expo SDK 54 + Expo Router 6 + NativeWind 4
  app/                          # file-based routes
    _layout.tsx                 # root layout (QueryClientProvider, NativeWind css)
    index.tsx                   # session-based redirect
    (auth)/login.tsx            # email + password
    (promotor)/visits.tsx       # promotor visit list
    (promotor)/visits/[id].tsx  # detail (full impl in subsequent PR)
  src/env.ts                    # parses EXPO_PUBLIC_* via parseSharedEnv
  src/lib/supabase.ts           # SDK client + SecureStore adapter
  src/lib/api.ts                # apiFetch<T>(path, init) — Bearer wrapper
  src/lib/auth.ts               # useSession() hook + signOut()
  src/lib/query.ts              # TanStack Query client
  src/features/<domain>/api.ts  # useXxx hooks (TanStack Query)
  metro.config.js               # monorepo resolution (watchFolders + nodeModulesPaths)
  babel.config.js               # babel-preset-expo + nativewind/babel
  tailwind.config.js            # nativewind preset + Perfectapp tokens
  global.css                    # @tailwind directives, imported in app/_layout.tsx
```

The mobile app:
- Consumes `@companeros/shared` directly via Metro's monorepo config.
- Has its own `src/env.ts` mapping `EXPO_PUBLIC_*` onto `SharedEnv`.
- Has its own Supabase client wrapper using `expo-secure-store` for token persistence.
- Calls the **web API** with `Authorization: Bearer <access_token>` rather than re-implementing route handlers.
- Implements its own UI primitives with NativeWind (no shadcn).

---

## Rules for Web Code Today (mobile-friendly defaults)

### MUST

- **MUST** keep domain types in `packages/shared/src/types/` free of `next/*`, `next/headers`, DOM imports, or browser-only APIs.
- **MUST** define Zod schemas in `packages/shared/src/types/` (or near the domain) so they can be shared.
- **MUST** keep service-layer files (`apps/web/src/lib/services/*Service.ts`) DOM-free. Pass a Supabase client in (constructor or method arg) rather than capturing one.
- **MUST** keep auth helpers in `apps/web/src/lib/api/<role>-auth.ts` web-specific (they use `next/headers`). Mobile will need its own helpers — that's fine.
- **MUST** prefer Supabase data access for the canonical contract; the same RLS protects both clients.

### MUST NOT

- **MUST NOT** import `next/...` from anywhere under `packages/shared/src/types/`, `apps/web/src/lib/services/` (mobile will reuse).
- **MUST NOT** assume cookies are the only auth transport. Mobile typically uses access/refresh tokens directly.
- **MUST NOT** hardcode design decisions to Tailwind classes inside service-layer code. Keep services UI-agnostic.
- **MUST NOT** rely on Server Actions for logic that must also run from a mobile client. Expose a Route Handler or RPC.
- **MUST NOT** introduce `react-native` imports in this repo while it is web-only.

---

## API Contract Hygiene

The API routes under `apps/web/src/app/api/...` are the **public contract**. Mobile will consume them.

### MUST

- **MUST** use stable, versionable response shapes. When changing, add a field; don't rename without a migration plan.
- **MUST** validate input with Zod schemas declared in shareable modules (`packages/shared/src/types/api.ts` or feature-local schemas re-exported there).
- **MUST** return `public_id` in API responses. Mobile will pass `public_id` back in URLs.
- **MUST** never put `tenant_id` or other server-only fields in the response body unless absolutely required.

### MUST NOT

- **MUST NOT** rely on cookies for cross-origin mobile clients without a documented strategy. Today web uses cookies; mobile will likely use `Authorization: Bearer <access_token>`.
- **MUST NOT** embed HTML in API responses.

---

## Auth Strategy

| Concern | Web | Mobile |
|---------|-----|--------|
| Session transport | HttpOnly cookies via `@supabase/ssr` | Access/refresh tokens in `expo-secure-store` |
| Session refresh | Middleware (`apps/web/src/lib/supabase/middleware.ts`) | `supabase.auth` auto-refresh |
| User identity in API routes | `x-supabase-user-id` header injected by middleware | `Authorization: Bearer <access_token>` validated via `supabase.auth.getUser(token)` |
| Server-side resolver | `apps/web/src/lib/api/auth-resolver.ts` → `resolveUserId(supabase)` (handles BOTH paths transparently) | (same — mobile calls the same web routes) |
| Role guards | `apps/web/src/lib/api/<role>-auth.ts` (admin/asesor/brand/promotor) | (same — those helpers all delegate to `resolveUserId`) |

**New API routes MUST go through one of the role helpers** (or, if the route is public/role-agnostic, through `resolveUserId` directly). Inline `supabase.auth.getUser()` in route handlers will only see cookie sessions and silently 401 mobile traffic.

### Adding a new mobile screen that calls the web API

1. Open or extend `apps/mobile/src/features/<domain>/api.ts` and add a TanStack Query hook calling `apiFetch<ResponseType>('/api/<role>/<endpoint>')`.
2. `apiFetch` (`apps/mobile/src/lib/api.ts`) attaches `Authorization: Bearer ${session.access_token}` automatically. Don't re-implement.
3. The web route's role helper will resolve the Bearer-derived user via `resolveUserId`. No web-side changes needed.
4. If the web route doesn't yet use the role helper (it has its own inline `getUser()` chain), refactor it to use the helper in the same PR.

---

## Data Access from Mobile (recommended)

For mobile, prefer:

1. **Direct Supabase JS** for reads/writes on tables — RLS gives the same protection.
2. **Custom API routes** for multi-step or privileged operations that already exist on web.
3. **RPC functions** (Postgres) for atomic transactions — same as web.

Avoid duplicating logic between mobile and `apps/web/src/app/api/...`. If a mobile screen needs a flow that today is a route handler, call the route handler.

---

## UI

Mobile uses **NativeWind 4** (Tailwind for React Native). The Perfectapp design tokens live in `apps/mobile/tailwind.config.js` and mirror what `apps/web` uses (`primary`, `navy`, `success`, etc.). NativeWind's `className` prop is type-augmented via `apps/mobile/nativewind-env.d.ts`.

- **Don't** import from `apps/web/src/components/ui/*` — those are shadcn / Tailwind for the DOM.
- **Do** create RN primitives under `apps/mobile/src/components/ui/` when you have at least 2 callers.
- Keep tokens in sync. If you add a token to web's Tailwind config, mirror it in `apps/mobile/tailwind.config.js`.

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
[ ] Auth in route handlers goes through apps/web/src/lib/api/<role>-auth.ts (web)
[ ] No premature abstraction — no packages/ split without a mobile consumer
[ ] Web flows untouched and tests still green
[ ] If mobile-specific code added: clearly isolated under apps/mobile or packages/mobile
[ ] Documentation updated when split is introduced
```

---

## Stop Conditions

Stop and ask if:

1. A change requires moving code out of `apps/web/src/` into `packages/shared/` — discuss the migration plan first.
2. The proposed mobile path conflicts with existing web behavior.
3. You'd need to bypass `resolveUserId` / the role helpers in a new web route handler.
4. A `@types/react` or `react` version bump is proposed in only one app — both apps must move together (see `MONOREPO.md` § "Cross-app `@types/react` alignment" and `LEARNINGS.md` 2026-05-03).
