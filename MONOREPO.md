# Monorepo Setup

This repo is a pnpm + turbo monorepo. The Next.js app lives at `apps/web`. Shared, UI-agnostic code (types, schemas, helpers) lives at `packages/shared` and is consumed via `@companeros/shared/...`.

## Layout

```
companeros-en-ruta/
├── apps/
│   └── web/                Next.js 16 app (production)
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

pnpm turbo build                                  # build everything via turbo
```

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
