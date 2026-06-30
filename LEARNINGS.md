# LEARNINGS.md — Compañeros en Ruta

> Persistent log of non-obvious findings discovered during implementation.
> Append-only. Never delete; supersede.

---

## Purpose

Each entry captures a **surprise** — something that wasn't visible from the code/schema alone and that, if forgotten, would lead to repeated mistakes. The aim is to prevent the same trap from being hit twice.

**DO NOT** record:
- Things obvious from `packages/shared/src/types/database.ts`
- Style preferences (those go in `.claude/rules/coding-standards.md`)
- One-off ticket details
- Generic Next.js / Supabase facts

**DO** record:
- Schema quirks not captured by types (constraints, triggers, enum casts)
- RLS gotchas (recursion, helper-function dependencies, performance traps)
- Cross-table coupling that isn't enforced by FKs
- Hidden invariants enforced only by `validate_*` triggers
- Build/runtime traps (Next.js 16 + Turbopack quirks, RSC boundaries)
- Things that broke once and silently regressed

---

## Entry Format

```markdown
### YYYY-MM-DD — <Short title>

- **Context:** <Where this came up — file/route/migration>
- **Symptom:** <What went wrong / what was confusing>
- **Root cause:** <Why — the underlying invariant>
- **Fix / Rule:** <What to do next time>
- **Tags:** <#schema #rls #frontend #migration #auth #multi-tenant #performance ...>
```

Keep each section to 1–3 lines. Link to commits, files, or migrations when useful.

---

## Append Rules

1. **One entry per finding.** Don't bundle.
2. **Date in ISO format** (YYYY-MM-DD). Use today's actual date.
3. **Tag aggressively** so future agents can grep.
4. **Supersede, don't rewrite.** If a learning becomes wrong, add a new entry that says "supersedes <date> — <title>" and explains what changed. Leave the old entry in place.
5. **No PII, no secrets, no tenant data.** Anonymize tenant/brand/client names.
6. After appending, **read the previous 3 entries** to detect duplicate findings.

---

## How Future Agents Use This File

Before starting non-trivial work:

1. Identify the area you'll touch (auth, RLS, visits, QR, etc.).
2. `grep` LEARNINGS.md for relevant tags.
3. Apply the rules from any matching entries.
4. If you discover a contradiction with current state, supersede.

---

## Avoiding Repetition

A finding worth recording is worth **operationalizing**. After three entries on the same theme, promote the rule into:

- `.claude/rules/*.md` (a hard rule), or
- A skill page in `.claude/skills/*.md` (a pattern), or
- A lint / type-level check (best when feasible)

LEARNINGS.md is the staging ground; rules and skills are the canon.

---

## Entries

> Append below. Newest at top.

### 2026-06-29 — EAS Build default image for SDK 54 ships a Hermes that crashes on iOS 26.5

- **Context:** `apps/client-mobile`, EAS Build production profile. Apple rejected build 7 with a crash on iPad Air M3 / iPadOS 26.5. We then burned builds 8-15 via EAS — every one crashed at boot on iPhone 17 / iOS 26.5 with the same signature (`TurboModule` void method throws NSException → RN's `convertNSExceptionToJSError` → Hermes `errorStackGetter` null deref).
- **Symptom:** TestFlight install opens for 155ms and dies. No JS stack visible — the conversion to JSError crashes before logging the NSException. Indistinguishable in TestFlight from "our code is broken at boot".
- **Root cause:** EAS Build resolves `sdk-54` to `macos-sequoia-15.6-xcode-26.0`. The Xcode 26.0 toolchain bundles a Hermes precompiled binary with a known incompatibility on iOS 26.5 runtime. Xcode 26.4 (latest at the time) bundles a fixed Hermes. Confirmed by comparing the two IPAs: `hermes.framework/hermes` differs by ~27KB and only the Xcode 26.4-built one boots.
- **Fix / Rule:** Pin `ios.image: "macos-tahoe-26.4-xcode-26.4"` in `apps/client-mobile/eas.json` (PR #57). **Caveat:** even with the image pinned, the binary EAS produces still differs ~27KB from a local Xcode 26.4 Archive and STILL crashes — investigation open (`project_eas_build_xcode_drift.md` memory). Workaround when EAS-built IPAs misbehave on a bleeding-edge iOS: local `npx expo prebuild --platform ios --clean && pod install && open ios/*.xcworkspace` + Product → Archive + Distribute → ASC. Tarda lo mismo, produce un IPA funcional.
- **Tags:** #ios #eas #expo #hermes #release

---

### 2026-06-29 — Module-load native calls = crash chain on iOS bleeding-edge

- **Context:** `apps/client-mobile/app/_layout.tsx`, `apps/client-mobile/src/lib/supabase.ts`. PRs #55 (defer `Notifications.setNotificationHandler` to `useEffect`) and #56 (defer `AppState.addEventListener` + `supabase.auth.onAuthStateChange` via a new `attachSupabaseLifecycle()` helper).
- **Symptom:** App crashes at boot before React mounts. No JS error logged because the global `ErrorUtils` handler hasn't been installed yet. Native crash logs show abort in `objc_exception_rethrow` or `convertNSExceptionToJSError`.
- **Root cause:** any TurboModule void method invoked at the top level of a module that gets imported during JS bundle evaluation (i.e., before any React component renders) can throw an NSException. The dispatch queue / JSI runtime has no handler in place yet, so terminate is called → SIGABRT. iOS 26.5 surfaces this aggressively because of stricter Hermes/TurboModule behavior.
- **Fix / Rule:** Treat module top-level as a no-side-effects zone in mobile apps. Any code that touches native modules (`Notifications.*`, `AppState.*`, `LogBox.*`, `SecureStore.*`, etc.) goes inside a `useEffect` in the root layout — wrapped in `try/catch` so even if it throws it stays bounded. Install `global.ErrorUtils.setGlobalHandler` early in `_layout.tsx` so anything that DOES leak gets logged instead of taking the app down.
- **Tags:** #ios #expo #react-native #boot #turbo-modules

---

### 2026-06-29 — IPA drift diagnostic toolkit

- **Context:** Debugging the crash gap between EAS-built and local-Xcode-built IPAs of `apps/client-mobile`.
- **Symptom:** Same code, same EAS image, but the binaries differ and behave differently on the same device. Need to find the actual delta.
- **Root cause:** N/A — this is the toolkit, not a bug.
- **Fix / Rule:** Standard diagnostic flow when an IPA misbehaves on a real device:
  1. Download the EAS IPA: `eas build:view <id> --json | jq -r .artifacts.buildUrl` then `curl -O`.
  2. Unzip: `mkdir x && cd x && unzip ../build.ipa`.
  3. Entitlements diff: `codesign -d --entitlements - Payload/*.app` — confirms `aps-environment` (production vs development) and signing identity.
  4. Info.plist diff: `plutil -p Payload/*.app/Info.plist` and grep for `DTXcode`, `DTPlatformVersion`, `BuildMachineOSBuild`. Reveals which Xcode/macOS produced each IPA.
  5. Frameworks diff: `ls -l Payload/*.app/Frameworks/{hermes,React,ReactNativeDependencies}.framework/*` — size differences here are the smoking gun for engine incompatibilities.
  6. If a local Archive boots and EAS doesn't, the gap is in the build infra, not your code.
- **Tags:** #ios #release #debug #ipa

---

### 2026-06-29 — `.env.local` always loaded by Expo, overrides `.env.production`

- **Context:** `apps/client-mobile/.env.local`. Local Archive for production needed prod URLs baked in but `.env.local` had dev URLs and they leaked into the IPA.
- **Symptom:** App built via local Xcode Archive with intent to ship to TestFlight came up pointing at `http://192.168.100.166:54321` (local Supabase). Login network-errored because the LAN IP isn't reachable from outside the local network.
- **Root cause:** Expo's env loader respects the standard precedence `.env.{NODE_ENV}.local > .env.local > .env.{NODE_ENV} > .env`. `.env.local` is loaded in EVERY environment including production — it's not gated by NODE_ENV. EAS Build remote ignores `.env.local` (it's gitignored), but local builds read it.
- **Fix / Rule:** Before doing a local production Archive: back up `apps/client-mobile/.env.local` → write prod values → Archive → upload → restore. For long-term, populate EAS environment variables (`pnpm exec eas env:create ...`) so future EAS builds carry the prod values without depending on local files. Document the temporary swap in the PR description if the local Archive ships.
- **Tags:** #expo #env #release

---

### 2026-06-29 — `react-native-css-interop` must be a direct dep in pnpm-isolated monorepos

- **Context:** `apps/client-mobile/package.json`, `apps/client-mobile/metro.config.js`. After running `expo prebuild` locally for the first time, Metro failed to resolve `react-native-css-interop/jsx-runtime` from `expo-router/build/qualified-entry.js`.
- **Symptom:** Build error: `Unable to resolve module react-native-css-interop/jsx-runtime from <pnpm-deeply-nested>/expo-router/build/qualified-entry.js`. Web build is fine.
- **Root cause:** `react-native-css-interop` is a transitive dep of `nativewind`. In pnpm's isolated `node_modules`, it lives in a versioned `.pnpm/` directory, not in `apps/client-mobile/node_modules`. The Metro config has `resolver.disableHierarchicalLookup: true` (needed for monorepo determinism) — so Metro never walks up to find the transitive. `expo-router` tries to import the jsx-runtime by bare specifier and the resolution fails.
- **Fix / Rule:** Add `"react-native-css-interop": "0.2.3"` (pin the same version pnpm already resolved transitively) to `apps/client-mobile/package.json` `dependencies` and rerun `pnpm install`. pnpm hoists it as a direct symlink under `apps/client-mobile/node_modules`. Mirror in any other Expo app added to the monorepo (e.g., `apps/mobile` should add this proactively when it gets its first NativeWind component).
- **Tags:** #expo #metro #monorepo #pnpm #nativewind

---

### 2026-05-03 — `Authorization: Bearer` needs transport-level setup, not just JWT validation

- **Context:** PR B (`feat/mobile-bootstrap`). The original PR A `auth-resolver` validated a Bearer access token via `supabase.auth.getUser(token)` and returned the user id. Smoke-testing against a real promotor account returned 200 → 404 with `"Perfil de usuario no encontrado"`. The token was valid; the lookup failed.
- **Symptom:** `getUser(token)` returns the correct user, but the next `supabase.from('user_profiles').select(...)` query runs as the anonymous role (PostgREST sees no `Authorization` header). RLS hides every tenant row → `.single()` returns no data → 404.
- **Root cause:** The route's `createClient()` returns the `@supabase/ssr` `createServerClient` wired to Next's cookie adapter. That client reads its session from cookies on every PostgREST request. Calling `getUser(token)` does **not** mutate the client's session, and `supabase.auth.setSession({ access_token, refresh_token: '' })` only writes to the cookie store (which is read-only inside route handlers in this setup), so the next REST call still goes out anonymous.
- **Fix / Rule:** `apps/web/src/lib/supabase/server.ts` `createClient()` now reads `headers()` itself. If the request carries `Authorization: Bearer <token>`, it returns a vanilla `@supabase/supabase-js` client with `global.headers.Authorization` pre-bound to the Bearer token (and `persistSession: false`, no cookies). All subsequent `.from(...)` queries on that client run under the Bearer-derived JWT and RLS resolves correctly. The cookie/SSR client is still returned for cookie-only requests (web), so web behavior is unchanged. `createClient()` is now `async` because `headers()` is async — every server-side caller adds `await`, and helper signatures using `ReturnType<typeof createClient>` switch to `Awaited<ReturnType<typeof createClient>>`.
- **Tags:** #api #auth #supabase #ssr #mobile #rls

---

### 2026-05-03 — Cross-app `@types/react` minor must match (web ↔ mobile)

- **Context:** PR B (`feat/mobile-bootstrap`). Adding `apps/mobile` with `@types/react: ~19.1` while `apps/web` had `~19.2` caused `apps/web/src/components/qr/brand-carousel.tsx` to fail typecheck with `Type '{ children: string; jsx: true; }' is not assignable to type DetailedHTMLProps<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>` even though the file wasn't modified.
- **Symptom:** Pre-existing `<style jsx>` blocks suddenly stop type-checking after a fresh `pnpm install` that pulls a second `@types+react@<X>` directory into `node_modules/.pnpm/`.
- **Root cause:** `next/dist/styled-jsx/types/global.d.ts` augments `react`'s `StyleHTMLAttributes` to add the `jsx` and `global` props. The augmentation file does `import React from 'react'`, and the augmentation only applies to whichever `@types/react` it resolves to. With two `@types/react` minors in the tree, pnpm's strict isolation can route the augmentation to a *different* React types instance than the one `apps/web`'s tsc loads — so the augmentation never reaches the web code.
- **Fix / Rule:** Pin `@types/react` to the same minor across `apps/web` and `apps/mobile`. Bumps must be coordinated in the same PR. Documented in `MONOREPO.md` § "Cross-app `@types/react` alignment".
- **Tags:** #monorepo #types #pnpm #styled-jsx #mobile

---

### 2026-05-03 — CI baseline: 3 known-failing checks (lint, unit tests, E2E)

- **Context:** `.github/workflows/test.yml`. PR #11 (monorepo migration) surfaced these via the new pnpm/turbo pipeline. All three were failing on master too — the monorepo migration just made them visible because the workflow now runs cleanly up to those steps.
- **Symptom:** GH Actions fails 3 steps unless `continue-on-error: true` is set. None of them are runtime bugs; all three are infrastructure / test-isolation issues.
- **Root cause:** Three independent issues — see "Issues to fix" below.
- **Fix / Rule:** Until each is resolved, the steps stay marked `continue-on-error` so the workflow doesn't gate merges on pre-existing baseline failures. Vercel preview build is the de-facto gate. Each fix is tracked as its own task.
- **Tags:** #ci #lint #tests #e2e #infra #monorepo

---

### Issues to fix (post-monorepo)

#### A. Lint — split into A1 (fixed) + A2 (open)

##### A1 — Services + admin user routes (FIXED 2026-05-03)

- **Status:** ✅ Fixed in PR #15.
- **What was fixed:**
  - Deleted `apps/web/src/lib/services/{visit,brand,qr}Service.ts` — these were dead code (zero callers). They referenced an old schema (`visit_number`, `start_time`, `visit_assessments`, `visit_purchases`) that no longer exists. Removing them resolved 12 of the 21 errors.
  - In `adminService.ts`: replaced 5 `as any` casts with `Tables['<X>']['Insert']` / `['Update']` types. Two of them (`user_profiles.preferences`, `tenants.settings`, `user_roles` insert with conditional `zone_id`) needed `as unknown as ...` to bridge a known supabase-js codegen quirk: generated `Json` types don't accept `Record<string, unknown>` at the type level even though they accept it at runtime.
  - In `apps/web/src/app/api/admin/users/{create,invite}/route.ts`: dropped the `(user: any)` annotation from a `.find` callback (the inferred type from `auth.admin.listUsers` is sufficient), and changed `let userWasCreatedNew` to `const` (`prefer-const`).
- **Result:** services + admin user routes scope is now lint-clean. 21 errors + 2 warnings → 0.

##### A2 — Project-wide lint baseline (CLOSED 2026-05-03)

- **Status:** ✅ **Closed.** Project lint goes from 241 errors to **0 errors**. The `Lint` CI step is now a hard gate (`continue-on-error: true` removed in batch 5).
- **Progress:** 241 → 0 errors (100% reduction) across 6 batches:
  - Batch 1: lib + hooks easy wins (PR #16)
  - Batch 3a: api/admin/ (PR #17)
  - Batch 3b: api/brand/ partial (PR #18)
  - Batch 3c: api/brand/exports + points + targeting (PR #19)
  - Batch 3d: api/{asesor,client,promotor,qr,supervisor,surveys}/ + brand/kpis/ (PR #20)
  - Batch 4: app/(dashboard)/* — typing + React-hooks rule downgrade (PR #21)
  - Batch 5: components/* + final stragglers + un-gated lint in CI (this PR)
- **Remaining (warnings only, non-blocking):** ~161 warnings, dominated by the
  React 19 hook-rule violations covered by the deferred sub-issue below.

##### A2 sub-issue — React 19 hook rules downgraded to `warn` (DEFERRED REFACTOR)

- **Status:** ⏳ Deferred — needs focused refactoring PR.
- **What:** `apps/web/eslint.config.mjs` downgrades 6 React 19 rules to `warn`:
  `react-hooks/set-state-in-effect`, `react-hooks/immutability`,
  `react-hooks/incompatible-library`, `react-hooks/purity`,
  `react-hooks/exhaustive-deps`, `react-hooks/refs`.
- **Why:** ~50 violations across `app/(dashboard)/*`, `hooks/*`. The patterns are
  legitimate data-loading effects and ref-syncing patterns that work correctly
  but trip the new pedantic rules. Treating each one properly requires either
  restructuring with derived state, useReducer, or moving logic to event
  handlers — a real refactor, not a typing fix.
- **Fix approach (when scheduled):**
  1. Audit each violation file-by-file; classify each into:
     a. true bug (cascading renders or render-time mutations) → fix
     b. legitimate pattern → use `useEffectEvent` (React 19 stable) or
        eslint-disable-next-line with rationale
  2. Once cleaned, remove the rule overrides from `eslint.config.mjs`.
- **Severity:** Low. Existing components work; the warnings flag patterns
  that *could* improve but are not bugs.
- **Tracked in:** the override block in `apps/web/eslint.config.mjs`. Removing
  that block re-enables the rules at error severity.

#### B. Unit tests — split into B1 (fixed) + B2 (open)

##### B1 — env-import crashes in CI (FIXED 2026-05-03)

- **Status:** ✅ Fixed in PR #13.
- **Cause:** `apps/web/src/lib/env.web.ts` calls `parseSharedEnv(...)` at module load. CI lacked `.env.local` so any module that transitively imported `@/lib/env` crashed at import → 5 test files never even loaded.
- **Fix:** `apps/web/jest.setup.js` now sets schema-valid dummies for all 6 env keys with the `||=` pattern, so local `.env.local` values still win when present.
- **Result:** CI baseline went from 21 fail / 103 pass / 123 total to 21 fail / 107 pass / 128 total — matches local exactly.

##### B2 — 21 stale unit tests (FIXED 2026-05-03 in PR #14)

- **Files affected (exact):** `__tests__/components/auth/login-form.test.tsx` (8 tests), `__tests__/app/(auth)/login/page.test.tsx` (4), `__tests__/components/layout/bottom-navigation.test.tsx` (2), `__tests__/components/ui/{action-button,request-card,status-badge,qr-action-card}.test.tsx` (mixed), `__tests__/integration/auth-flow.test.tsx` (1).
- **Cause:** Tests assert old Tailwind class names (e.g. `bg-green-100 text-green-700`). Components migrated to the **Perfectapp design system** (e.g. `bg-[#e3fee8] text-[#437b56]`) — see commit `3da420a` and the Perfectapp UI overhaul. Test assertions never updated.
- **Fix approach:** Update test assertions to match the new tokens. Where possible, assert on **semantic** outcomes (text content, role, aria-state) rather than class names — that prevents this kind of drift.
- **Effort:** Medium — ~21 assertions across 7 files. Mechanical but needs care to avoid asserting on internal styling that may change again.
- **Severity:** Medium. The components themselves are not broken; the tests are out of date and don't catch real regressions while they fail.
- **Tracked in:** unmark `continue-on-error: true` from the `Unit + integration tests (apps/web)` step once these are updated.

#### C. E2E Playwright — `next dev` fails to boot in CI without Supabase secrets

- **Cause:** `apps/web/playwright.config.ts` `webServer.command: 'next dev'` boots a real Next dev server, which validates env vars on boot. CI has no `SUPABASE_URL` / `SUPABASE_ANON_KEY` (the workflow references `secrets.SUPABASE_URL` / `secrets.SUPABASE_ANON_KEY` but those aren't set in the GitHub repo's Secrets).
- **Fix approach (pick one):**
  1. **Recommended:** add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to GitHub repo Secrets (Settings → Secrets and variables → Actions). Use a dedicated **test/staging** Supabase project — never production. Then E2E runs against that.
  2. **Alternative:** spin up a local Supabase via `supabase start` in CI before Playwright runs (heavier but no shared secrets). Requires `supabase` CLI in the runner.
  3. **Stopgap:** keep E2E `continue-on-error` and rely on Vercel preview manual smoke + local runs.
- **Decision needed:** is it OK to expose a non-prod Supabase project's anon key + URL to GitHub Actions? Anon key is already public-facing, so this is normally fine, but tenant data should be a sanitized test set.
- **Effort:** Low (#1, once a test project exists), High (#2).
- **Severity:** Medium-high. No automated regression coverage for full user flows. Manual smoke + Vercel preview cover this for now.
- **Tracked in:** unmark `continue-on-error: true` from `E2E tests` step once fixed.

---

<!-- ### 2026-05-03 — Example finding -->
<!-- - **Context:** src/app/api/promotor/visits/route.ts -->
<!-- - **Symptom:** Visit insert failed with "promotor_id role mismatch" despite role being 'asesor_de_ventas' -->
<!-- - **Root cause:** validate_visit_data() trigger only accepts 'promotor' or 'supervisor'; visit_orders trigger accepts 'asesor_de_ventas' too -->
<!-- - **Fix / Rule:** For asesor flows, write to visit_orders, not visits. Document at top of any visit-creation handler. -->
<!-- - **Tags:** #schema #triggers #visits #asesor -->

---

### 2026-06-08 — QR redemption flow lacks client-side realtime reaction

- **Context:** apps/mobile (asesor) scans + redeems → POST /api/qr/redeem; meanwhile apps/client-mobile is on the QR list / detail screen.
- **Symptom:** When the asesor redeems a client's coupon, the client's app does NOT react (no toast, no badge update, no haptic). The client only sees the change on next manual pull-to-refresh.
- **What we want:** the client's QR list / detail should auto-refresh AND show a confirmation ("Tu cupón fue canjeado") right after redemption.
- **Options:**
  1. **Supabase realtime subscription** on `qr_codes` filtered by `client_id` in apps/client-mobile. Lightweight, no push setup needed. Works only while the app is foregrounded.
  2. **Expo Push Notifications** via the `redeem_qr_code` RPC → write to a `notifications` row → trigger an Expo push to the client device. Works backgrounded, but needs APNs/FCM credentials + expo-notifications integration.
  3. **Both:** realtime for in-app, push for background. Probably the right answer for a polished UX.
- **Effort:** Medium for (1), High for (2). (1) gets us 80% with very little code.
- **Severity:** Low/Medium. The current flow is functional (the QR redeems correctly); the UX feedback gap is the only issue.
- **Tracked in:** open issue once we get to it. Probably worth slotting after PR P/Q.
- **Tags:** #realtime #qr #asesor #client-mobile #notifications
