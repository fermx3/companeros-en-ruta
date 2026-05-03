import { z } from 'zod';

/**
 * Neutral env schema — applies to any runtime (web, mobile, scripts).
 * Each app maps its native env (NEXT_PUBLIC_*, EXPO_PUBLIC_*, plain) into this shape.
 */
export const sharedEnvSchema = z.object({
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  DEMO_TENANT_ID: z.string().uuid('Invalid demo tenant ID').optional(),
});

export type SharedEnv = z.infer<typeof sharedEnvSchema>;

export function parseSharedEnv(input: Record<string, string | undefined>): SharedEnv {
  return sharedEnvSchema.parse(input);
}
