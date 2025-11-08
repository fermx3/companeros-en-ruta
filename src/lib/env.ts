import { z } from 'zod';

// Schema para variables del cliente (disponibles en el browser)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  NEXT_PUBLIC_APP_DOMAIN: z.string().min(1, 'App domain is required'),
});

// Schema para variables del servidor (solo disponibles en el servidor)
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NextAuth secret is required'),
});

// Variables del cliente (siempre disponibles)
const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
});

// Variables del servidor (solo en el servidor)
let serverEnv: z.infer<typeof serverEnvSchema> = {
  SUPABASE_SERVICE_ROLE_KEY: '',
  NEXTAUTH_SECRET: '',
};

if (typeof window === 'undefined') {
  // Solo validar variables del servidor si estamos en el servidor
  serverEnv = serverEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  });
}

export const env = {
  ...clientEnv,
  ...serverEnv,
};
