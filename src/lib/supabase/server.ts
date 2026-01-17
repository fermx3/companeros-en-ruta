import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { env } from '../env'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(async ({ name, value, options }) => {
              (await cookieStore).set(name, value, options)
            })
          } catch (error) {
            console.error('Error setting cookies in Supabase client:', error)
            // La función setAll se llama desde el middleware también
            // Puede fallar en middleware si es una respuesta mutativa
          }
        },
      },
    }
  )
}

/**
 * Crea un cliente de Supabase con service role key
 * Para operaciones administrativas que bypasean RLS
 */
export function createServiceClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  )
}
