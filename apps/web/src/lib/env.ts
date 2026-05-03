// Web env entry point. Re-exports the web adapter so existing call sites
// (`import { env } from '@/lib/env'`) keep working unchanged.
//
// In the upcoming monorepo split:
//   - apps/web  imports from '@/lib/env' (this file → env.web.ts)
//   - apps/mobile will have its own adapter that maps EXPO_PUBLIC_*
//     onto the same shared schema (env.shared.ts).
export { env } from './env.web';
