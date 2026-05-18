import { parseSharedEnv } from '@companeros/shared/env/shared'
import { z } from 'zod'

const mobileSpecificSchema = z.object({
  WEB_API_BASE: z
    .string()
    .url('EXPO_PUBLIC_WEB_API_BASE must be a valid URL pointing to the web API'),
})

const shared = parseSharedEnv({
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  DEMO_TENANT_ID: process.env.EXPO_PUBLIC_DEMO_TENANT_ID,
})

const mobile = mobileSpecificSchema.parse({
  WEB_API_BASE: process.env.EXPO_PUBLIC_WEB_API_BASE,
})

export const env = {
  ...shared,
  ...mobile,
}
