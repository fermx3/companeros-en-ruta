# @companeros/mobile

Expo (React Native) app for the **promotor** field flow. Login + visit list shipped in PR B; check-in (GPS), assessment, evidence, and check-out land in subsequent PRs.

## First-time setup (macOS)

```bash
# from monorepo root
pnpm install
cp apps/mobile/.env.example apps/mobile/.env.local
# fill in the values — see comments in .env.example

pnpm mobile          # boot Expo dev server (interactive)
# i  → iOS simulator (requires Xcode)
# a  → Android emulator (requires Android Studio AVD)
# w  → web preview (limited — RN primitives only)
```

If `EXPO_PUBLIC_WEB_API_BASE` points to `http://localhost:3000`, also run `pnpm --filter=@companeros/web dev` in another terminal so the API the mobile client calls is reachable.

## What you should see

1. App opens on `app/index.tsx`. If no session is in `expo-secure-store`, you're redirected to `/(auth)/login`.
2. Sign in with a real promotor account (the same credentials that work on `apps/web`'s `/login`).
3. After login, `/(promotor)/visits` lists the promotor's visits for the current month, fetched from `GET /api/promotor/visits?date_range=month` with `Authorization: Bearer <access_token>`.
4. Tap a visit → stub detail screen (full flow comes in the next PR).
5. "Cerrar sesión" wipes secure-store tokens.

## Structure

See `MONOREPO.md` § "Mobile app (apps/mobile)" for the canonical layout and config files.

## Adding a new screen

1. Create the route file under `app/...`. File-based routing follows Next.js semantics (`(group)/route.tsx`, `[param].tsx`, `_layout.tsx`).
2. For data, add a TanStack Query hook in `src/features/<domain>/api.ts` calling `apiFetch<ResponseShape>(path)`. Don't reinvent the auth header.
3. For shared types, import from `@companeros/shared/types/<x>`.

## Adding a new web API consumer

When the new mobile screen needs an existing web route, that route MUST go through the role auth helper (`resolvePromotorAuth`, etc.) so the Bearer-token path activates. Inline `supabase.auth.getUser()` chains in route handlers will silently 401 mobile traffic. See `apps/web/src/lib/api/auth-resolver.ts`.

## Troubleshooting

- **"Unable to resolve module @companeros/shared/..."** — check `metro.config.js` has `watchFolders` pointed at the monorepo root and `disableHierarchicalLookup` set.
- **Tailwind classes not applying** — confirm `app/_layout.tsx` imports `'../global.css'` and `babel.config.js` has the `nativewind/babel` plugin.
- **iOS Simulator can't reach `localhost:3000`** — that works for iOS Simulator (it's running on the same machine). Android emulator must use `http://10.0.2.2:3000` instead.
