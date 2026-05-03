# Skill: Architecture — Compañeros en Ruta

## Scope

Cross-cutting concerns: layering, module boundaries, dependency direction, data flow, design tokens, and naming. Use this skill when designing new modules or refactoring existing ones.

This skill is **descriptive of the current repo** — it captures invariants, not aspirations. If a proposed change contradicts what's described here, raise the contradiction with the user before acting.

---

## High-Level Layout

```
companeros-en-ruta/                pnpm + turbo monorepo
├── apps/
│   └── web/                       @companeros/web — Next.js 16 app
│       ├── src/
│       │   ├── app/               Next.js App Router (auth + dashboard route groups + api/)
│       │   ├── components/        UI: ui/, layout/, auth/, visits/, brand/, client/,
│       │   │                          surveys/, kpi/, qr/, exports/, notifications/,
│       │   │                          targeting/, icons/, providers/
│       │   ├── hooks/             Reusable client-side hooks
│       │   ├── lib/               Web-bound (next/headers, next/server)
│       │   │   ├── api/           Auth helpers (admin, asesor, brand, promotor) + tenant helper
│       │   │   ├── supabase/      client.ts, server.ts, middleware.ts
│       │   │   ├── services/      adminService, brandService, qrService, visitService
│       │   │   ├── env.ts         Re-exports env.web
│       │   │   ├── env.web.ts     Maps NEXT_PUBLIC_* onto SharedEnv + adds web-only vars
│       │   │   ├── navigation-config.ts
│       │   │   └── notifications.ts
│       │   ├── types/ui.ts        UI-specific types (web-only)
│       │   └── middleware.ts      Next.js root middleware
│       ├── __tests__/             Web jest + Playwright e2e
│       ├── public/
│       ├── package.json           name: @companeros/web
│       └── (next.config.ts, tsconfig.json, jest.config.cjs, playwright.config.ts, vercel.json)
├── packages/
│   └── shared/                    @companeros/shared — UI-agnostic, Next-free
│       └── src/
│           ├── types/             database, supabase, admin, api, visits, index
│           ├── utils/             cn, client, csv, onboarding-labels, phone, public-id, targeting
│           ├── surveys/           resolve-visibility-conditions
│           └── env/shared.ts      Neutral Zod schema (mobile maps EXPO_PUBLIC_* into it)
├── supabase/                      Cross-app
│   ├── migrations/
│   ├── functions/
│   └── config.toml
├── tests/database/                Cross-app DB / RLS tests (run with pnpm test:db)
├── scripts/                       Cross-app utility scripts (run with tsx)
├── docs/                          MVP_STATUS, MIGRATION docs
├── .claude/                       Agent system
├── pnpm-workspace.yaml
├── turbo.json
├── package.json                   workspace root (no app code)
├── MONOREPO.md                    monorepo setup guide
└── CLAUDE.md / LEARNINGS.md       Top-level rules and journal
```

---

## Layering & Dependency Direction

```
apps/web/src/app/(dashboard|api|auth)/...
        │
        ▼
apps/web/src/components/* ── apps/web/src/hooks/* ── apps/web/src/lib/services/*
        │                                                    │
        └─────────────────────── apps/web/src/lib/api/* (auth helpers, route-side)
                                                             │
                                                             ▼
                                  apps/web/src/lib/supabase/{client,server,middleware}
                                                             │
                                                             ▼
                                          @companeros/shared (types, utils, surveys, env schema)
                                                             │
                                                             ▼
                                                 Supabase (Postgres + RLS)
```

Dependency rules:

- `@companeros/shared/types` depends on **nothing** project-internal except other shared types.
- `@companeros/shared/utils`, `@companeros/shared/surveys`, `@companeros/shared/env/shared` depend only on shared types or third-party packages — never on Next.js, DOM, or any app code.
- `apps/web/src/lib/services/` depends on shared types + `apps/web/src/lib/supabase/client`. Constructor accepts an injected client (Phase-1 prep), so they can move to shared once a mobile consumer exists.
- `apps/web/src/lib/api/` depends on `next/headers`, `next/server`, shared types, supabase. Consumed by `app/api/`.
- `apps/web/src/hooks/` depends on lib + browser APIs. Consumed by Client Components.
- `apps/web/src/components/` depends on hooks, lib, other components. Never on `app/`.
- `apps/web/src/app/` is the top-level consumer.
- **Never** import from `apps/web/...` inside `packages/shared/...`.

If a proposed change creates a cycle or pushes dependencies upward, redesign.

---

## Server vs Client Boundary

| Concern | Server | Client |
|---------|--------|--------|
| Initial render | Server Component | n/a |
| Sensitive data fetch | Server Component / Route Handler | Hook → Route Handler |
| Cookies / auth | `apps/web/src/lib/supabase/server.ts` | `apps/web/src/lib/supabase/client.ts` |
| Mutations | Server Action OR Route Handler | Hook calling Route Handler |
| Realtime subscriptions | n/a | `useEffect` in a Client Component |
| Forms with validation | Server Component shell + Client form | Client Component |

Default to Server Component. Add `"use client"` only when state, effects, refs, browser APIs, or third-party client-only libraries require it.

---

## Auth Flow (current)

```
Browser ──► /<protected route>
              │
              ▼
       apps/web/src/middleware.ts
              │
              ▼
   apps/web/src/lib/supabase/middleware.ts
              │   ├── refresh session (cookies)
              │   ├── inject x-supabase-user-id header
              │   └── redirect to /login if unauthenticated
              ▼
       Server Component / Route Handler
              │
              ▼
  apps/web/src/lib/supabase/server.ts createClient()
              │
              ▼
  apps/web/src/lib/api/<role>-auth.ts resolveXxxAuth()
              │
              ▼
  Auth context: { user, userProfileId, tenantId, brandId?, role? }
              │
              ▼
  Tenant- and role-scoped queries via Supabase
```

Every API route follows this skeleton. Re-implementing the auth chain inline is forbidden — extend the helper instead.

---

## Domain Model (mental model)

Six roles, three logical clusters:

| Cluster | Roles | Mental model |
|---------|-------|--------------|
| Tenant administration | `admin`, `market_analyst` | Cross-brand, cross-zone; full read; admin writes |
| Brand operations | `brand_manager`, `supervisor` | Brand-scoped; manages products, promotions, KPIs, team |
| Field execution | `promotor`, `asesor_de_ventas` | Brand- and client-scoped via `client_assignments`; executes visits + orders |
| End user | `client` (consumer of QR / promotions) | Tenant-scoped via `clients.user_id`; reads own data only |

Each role has:
- A dashboard at `apps/web/src/app/(dashboard)/<role>/`
- API routes at `apps/web/src/app/api/<role>/`
- An auth helper at `apps/web/src/lib/api/<role>-auth.ts` (admin, brand, promotor, asesor)

When adding a feature that involves a role for which the helper is missing (e.g., `supervisor`, `client`), create the helper following the existing pattern.

---

## Public ID Pattern

Every user-facing entity has `public_id` (e.g., `CLI-1234`, `VIS-1234`).

- Internal joins use `id` (UUID).
- Routes, exports, QR payloads, labels use `public_id`.
- API responses include both: `id` (UUID) and `public_id`.
- The frontend should prefer `public_id` for navigation.

---

## Soft Delete Pattern

Tables with `deleted_at TIMESTAMPTZ`:

- `user_roles`, `client_assignments`, `client_brand_memberships`, `visits`, and others (verify in `database.ts`).
- Every read MUST add `.is('deleted_at', null)` unless explicitly fetching tombstones.
- Deletion is `UPDATE ... SET deleted_at = now()`, not `DELETE`.

---

## Validation Pattern

Two layers, in this order:

1. **API boundary** — Zod schema in the route handler.
2. **DB boundary** — `validate_*_data()` triggers + RLS + `WITH CHECK` policies.

App code MUST NOT skip layer 1 because layer 2 exists. They have different failure modes (UX vs. defense in depth).

---

## Service Layer

`apps/web/src/lib/services/` contains domain-orchestration code that:

- Wraps multi-step Supabase calls under a meaningful method name.
- Stays UI-agnostic (no Next.js or React imports).
- Receives a Supabase client (server or browser) as input — does not capture one at module scope.

Current services:
- `adminService.ts` — admin entity lifecycles
- `brandService.ts` — brand-side operations
- `qrService.ts` — QR generation/redemption
- `visitService.ts` — visit lifecycle

If a route handler grows beyond ~80 lines or wraps >3 sequential Supabase calls, extract a service method.

---

## Design Tokens (Perfectapp)

| Token | Hex |
|-------|-----|
| `--color-primary` | `#dd5025` |
| `--color-primary-light` | `#ec6033` |
| `--color-secondary` | `#4d71ed` |
| `--color-navy` | `#202456` |
| `--color-accent` | `#437b56` |
| `--color-warning` | `#ffe159` |
| `--color-foreground` | `#202456` |
| `--color-muted-foreground` | `#999999` |
| `--color-border` | `#cccccc` |
| `--color-success-bg` | `#e3fee8` |
| `--color-success-text` | `#437b56` |

Typography: Nunito Sans via `next/font/google`, `--font-nunito-sans`.

Tier gradients:
- BRONCE: `#ec6033 → #202456`
- PLATA: `#4d71ed → #202456`
- ORO: `#ffe159 → #202456`

---

## Anti-Patterns (architecture)

- ❌ Putting domain logic in `app/<route>/page.tsx` instead of a service.
- ❌ Importing components into services.
- ❌ Importing `next/*` into shared types/services that may go to mobile.
- ❌ Module-level Supabase clients.
- ❌ Auth chain re-implemented inline in a new route.
- ❌ Cross-role utilities placed inside a single role's folder.
- ❌ Adding a new top-level folder under `src/` without aligning with the existing layout.

---

## When to Refactor (criteria)

Refactor when at least two of the following are true:

1. The same logic is duplicated in ≥3 files.
2. The duplicated logic has a known invariant (e.g., tenant filter) that has been violated at least once.
3. A change touches ≥5 files because of the duplication.
4. A test fails because two copies drifted.

Don't refactor for elegance alone. The repo prefers concrete duplication over premature abstraction.

---

## Validation Checklist (architectural review)

```
[ ] Code lands in the correct layer (lib/types | lib/services | lib/api | components | app)
[ ] Dependency direction respected (no cycles, no upward imports)
[ ] Server vs Client Component decision is correct
[ ] Auth helper used; no inline auth chain
[ ] Service-layer files are UI-agnostic and DOM-free
[ ] Module-level state is request-scoped, not shared
[ ] public_id surfaced for any user-facing identifier
[ ] Domain folder placement matches the cluster (admin/brand/field/client)
[ ] No new dependency without justification
[ ] If new pattern: documented in this skill or LEARNINGS.md
```
