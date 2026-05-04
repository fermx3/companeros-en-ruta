# Monorepo Setup

This repo is a pnpm + turbo monorepo. The Next.js web app lives at `apps/web`. The Expo (React Native) mobile app lives at `apps/mobile`. Shared, UI-agnostic code (types, schemas, helpers) lives at `packages/shared` and is consumed via `@companeros/shared/...`.

## Layout

```
companeros-en-ruta/
├── apps/
│   ├── web/                Next.js 16 app (production)
│   └── mobile/             Expo (React Native) app — Promotor MVP
├── packages/
│   └── shared/             types, utils, surveys, env schema (UI-agnostic)
├── supabase/               migrations + functions (cross-app)
├── tests/database/         RLS / DB tests (cross-app, run with `pnpm test:db`)
├── scripts/                cross-app utility scripts (run with `tsx`)
├── .claude/                agent system
├── pnpm-workspace.yaml
├── turbo.json
└── package.json            workspace root (no app code)
```

## Toolchain

- **Package manager**: pnpm 10.x (workspaces)
- **Build orchestrator**: turbo 2.x
- **Node**: ≥20.19.0 (per `engines`)

## Common commands (run from repo root)

```bash
pnpm install                                      # install all workspaces
pnpm --filter=@companeros/web dev                 # Next dev server
pnpm --filter=@companeros/web build               # Next production build
pnpm --filter=@companeros/web test                # web jest suite
pnpm test:db                                      # cross-app DB / RLS tests
pnpm --filter=@companeros/web test:e2e            # Playwright

pnpm mobile                                       # Expo dev server (apps/mobile)
pnpm mobile:ios                                   # Boot iOS simulator
pnpm mobile:android                               # Boot Android emulator

pnpm turbo build                                  # build everything via turbo
```

## Mobile app (apps/mobile)

Expo SDK 54, React Native 0.81, Expo Router 6, NativeWind 4. Auth uses Supabase
JS with `expo-secure-store` for token persistence; data is fetched from the
**web API** with `Authorization: Bearer <access_token>` (the web auth helpers
accept Bearer in addition to the cookie-based middleware header — see
`apps/web/src/lib/api/auth-resolver.ts`).

Required env (copy `apps/mobile/.env.example` → `apps/mobile/.env.local`):

| Var | Purpose |
|-----|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `EXPO_PUBLIC_WEB_API_BASE` | Base URL of the web API (`http://localhost:3000` for dev, Vercel URL otherwise) |
| `EXPO_PUBLIC_DEMO_TENANT_ID` | (optional) demo tenant UUID |

Mobile-specific config files:

- `metro.config.js` — points Metro at the monorepo root so it can resolve
  `@companeros/shared`. `disableHierarchicalLookup` keeps Metro from walking
  up past `apps/mobile/node_modules` and pulling in non-RN-safe packages.
- `babel.config.js` — `babel-preset-expo` + `nativewind/babel`.
- `tailwind.config.js` — NativeWind preset with Perfectapp tokens.
- `global.css` — `@tailwind` directives, imported once in `app/_layout.tsx`.
- `nativewind-env.d.ts` — ambient `className` prop types for RN components.

## Vercel deployment

The Vercel project must be configured with:

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework** | Next.js (auto-detected) |
| **Install Command** | (default: `pnpm install`) |
| **Build Command** | (default: `pnpm build`) |
| **Output Directory** | `.next` (auto) |

`apps/web/vercel.json` adds an `ignoreCommand` so Vercel skips deploys when only `.claude/`, `docs/`, or unrelated files change.

If the dashboard `Root Directory` is left at `/`, deploys will fail — Vercel won't find Next.js at the repo root.

## Adding a new workspace

1. Create the directory under `apps/<name>` or `packages/<name>`.
2. Add a `package.json` with a `name` like `@companeros/<name>`.
3. `pnpm install` from root — pnpm picks it up via `pnpm-workspace.yaml`.

To consume `@companeros/shared` from a new workspace, add `"@companeros/shared": "workspace:*"` to its `dependencies`.

For Next.js apps consuming workspace packages: add `transpilePackages: ['@companeros/shared']` (or whichever) to `next.config.ts` so Next compiles the workspace's TypeScript source.

## Pinned dependency versions (apps/web)

These versions are pinned (no caret) because pnpm fresh resolution picked higher minors that introduced pre-existing type errors. Bumps should be evaluated separately:

- `next`: 16.0.11
- `@supabase/supabase-js`: 2.80.0
- `@supabase/ssr`: 0.7.0
- `@supabase/auth-helpers-nextjs`: 0.10.0
- `recharts`: 3.3.0

## Cross-app `@types/react` alignment

`apps/web` and `apps/mobile` must keep `@types/react` on the same minor (currently `~19.2`). When the two diverge, pnpm produces two `@types+react@<X>` directories and TypeScript resolves the styled-jsx augmentation against a different React types instance than the one the web app's tsc is using — the symptom is `<style jsx>` errors in `apps/web` even though the source hasn't changed. If you bump one app, bump the other in the same PR.
