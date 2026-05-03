import { z } from 'zod';
import { parseSharedEnv } from './env.shared';

/**
 * Web-only env adapter.
 *
 * Maps Next.js NEXT_PUBLIC_* vars onto the neutral SharedEnv schema and
 * augments it with web-only vars (NextAuth, service role, web subdomains).
 *
 * Mobile (Expo) will have a parallel adapter using EXPO_PUBLIC_*.
 */

const webClientSchema = z.object({
  NEXT_PUBLIC_APP_DOMAIN: z.string().min(1, 'App domain is required'),
});

const webServerSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NextAuth secret is required'),
});

const shared = parseSharedEnv({
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  DEMO_TENANT_ID: process.env.NEXT_PUBLIC_DEMO_TENANT_ID,
});

const webClient = webClientSchema.parse({
  NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
});

let webServer: z.infer<typeof webServerSchema> = {
  SUPABASE_SERVICE_ROLE_KEY: '',
  NEXTAUTH_SECRET: '',
};

if (typeof window === 'undefined') {
  webServer = webServerSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  });
}

/**
 * Backwards-compatible flat env object. Public surface unchanged:
 *   env.NEXT_PUBLIC_SUPABASE_URL
 *   env.NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   env.NEXT_PUBLIC_APP_DOMAIN
 *   env.NEXT_PUBLIC_DEMO_TENANT_ID
 *   env.SUPABASE_SERVICE_ROLE_KEY
 *   env.NEXTAUTH_SECRET
 */
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: shared.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: shared.SUPABASE_ANON_KEY,
  NEXT_PUBLIC_DEMO_TENANT_ID: shared.DEMO_TENANT_ID,
  ...webClient,
  ...webServer,
};
