# Skill: Architecture — Compañeros en Ruta

## Scope

Cross-cutting concerns: layering, module boundaries, dependency direction, data flow, design tokens, and naming. Use this skill when designing new modules or refactoring existing ones.

This skill is **descriptive of the current repo** — it captures invariants, not aspirations. If a proposed change contradicts what's described here, raise the contradiction with the user before acting.

---

## High-Level Layout

```
companeros-en-ruta/
├── src/
│   ├── app/                       Next.js App Router
│   │   ├── (auth)/                Public routes (login)
│   │   ├── (dashboard)/           Protected, role-scoped UIs
│   │   │   ├── admin/
│   │   │   ├── brand/
│   │   │   ├── supervisor/
│   │   │   ├── promotor/
│   │   │   ├── asesor-ventas/
│   │   │   └── client/
│   │   ├── api/                   Route Handlers (mirror dashboard structure)
│   │   ├── design-guide/          Internal style/component reference
│   │   └── unauthorized/
│   ├── components/
│   │   ├── ui/                    Canonical primitives (shadcn-style, locally generated)
│   │   ├── layout/                Shells, navigation, page chrome
│   │   ├── auth/                  Auth-specific components
│   │   ├── visits/                Domain — visits
│   │   ├── brand/                 Domain — brand-side
│   │   ├── client/                Domain — client/customer-side
│   │   ├── surveys/               Domain — surveys
│   │   ├── kpi/                   Domain — KPIs
│   │   ├── qr/                    Domain — QR
│   │   ├── exports/               Domain — exports
│   │   ├── notifications/         Domain — notifications
│   │   ├── targeting/             Domain — targeting/segmentation
│   │   ├── icons/                 Custom icons (Perfectapp design)
│   │   └── providers/             React context providers (Auth, etc.)
│   ├── hooks/                     Reusable client-side hooks
│   ├── lib/
│   │   ├── api/                   Auth helpers per role + visit-detail helpers
│   │   ├── services/              Domain orchestration (admin, brand, qr, visit)
│   │   ├── supabase/              client.ts, server.ts, middleware.ts
│   │   ├── types/                 database.ts, supabase.ts, admin.ts, api.ts, visits.ts
│   │   ├── utils/                 Pure helpers
│   │   ├── surveys/               Survey-specific helpers
│   │   ├── env.ts                 Zod-validated env access
│   │   ├── navigation-config.ts   Single source of truth for nav per role
│   │   ├── notifications.ts       Notification helpers
│   │   └── utils.ts               cn() and similar small utilities
│   └── middleware.ts              Next.js root middleware (delegates to lib/supabase/middleware.ts)
├── supabase/
│   ├── migrations/                Versioned DDL
│   ├── functions/                 Edge Functions (if any)
│   └── config.toml
├── __tests__/                     Mirrors src/ paths + e2e/ + database/
├── scripts/                       Bash + TS utility scripts
├── public/
├── docs/                          MVP_STATUS, MIGRATION docs
├── .claude/                       Agent system (this folder)
└── CLAUDE.md / LEARNINGS.md       Top-level rules and journal
```

---

## Layering & Dependency Direction

```
app/(dashboard|api|auth)/...
        │
        ▼
src/components/* ── src/hooks/* ── src/lib/services/*
        │                                   │
        └────────────────── src/lib/api/* (auth helpers, route-side)
                                            │
                                            ▼
                              src/lib/supabase/{client,server,middleware}
                                            │
                                            ▼
                                Supabase (Postgres + RLS)
```

Dependency rules:

- `src/lib/types/` depends on **nothing** project-internal except other types.
- `src/lib/services/` depends on `types` + `supabase`. **Never** on `next/headers`, `app/`, or `components/`.
- `src/lib/api/` depends on `next/headers`, `types`, `supabase`. May be consumed by `app/api/`.
- `src/hooks/` depends on `lib` + browser APIs. May be consumed by Client Components.
- `src/components/` depends on `hooks`, `lib`, other components. Never on `app/`.
- `src/app/` is the consumer of everything else.

If a proposed change creates a cycle or pushes dependencies upward, redesign.

---

## Server vs Client Boundary

| Concern | Server | Client |
|---------|--------|--------|
| Initial render | Server Component | n/a |
| Sensitive data fetch | Server Component / Route Handler | Hook → Route Handler |
| Cookies / auth | `src/lib/supabase/server.ts` | `src/lib/supabase/client.ts` |
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
       src/middleware.ts
              │
              ▼
   src/lib/supabase/middleware.ts
              │   ├── refresh session (cookies)
              │   ├── inject x-supabase-user-id header
              │   └── redirect to /login if unauthenticated
              ▼
       Server Component / Route Handler
              │
              ▼
  src/lib/supabase/server.ts createClient()
              │
              ▼
  src/lib/api/<role>-auth.ts resolveXxxAuth()
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
- A dashboard at `src/app/(dashboard)/<role>/`
- API routes at `src/app/api/<role>/`
- An auth helper at `src/lib/api/<role>-auth.ts` (admin, brand, promotor, asesor)

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

`src/lib/services/` contains domain-orchestration code that:

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
