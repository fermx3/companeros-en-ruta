import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'
import { env } from '../env'
import type { Database } from '@companeros/shared/types/supabase'

/**
 * Server-side Supabase client.
 *
 * Two transports, picked from the incoming request:
 *
 * 1. **Cookie / SSR**: default. Returns `createServerClient` wired to Next's
 *    cookie store. The web app's middleware refreshes sessions through this
 *    path on every request.
 * 2. **Authorization: Bearer**: when the request carries a Bearer header
 *    (mobile clients), returns a stateless `createClient` with that token
 *    pre-bound as the global Authorization header. PostgREST queries run
 *    under the Bearer-derived JWT and RLS resolves correctly. No cookies
 *    are read or written in this path.
 *
 * Detection happens at request time inside the route handler / Server
 * Component, so the same `createClient()` call site keeps working for both
 * platforms.
 */
export async function createClient() {
  let bearer: string | null = null
  try {
    const h = await headers()
    const auth = h.get('authorization')
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice('Bearer '.length).trim()
      if (token) bearer = token
    }
  } catch {
    // headers() is unavailable outside a request scope (e.g. background
    // scripts). Fall through to the cookie-based SSR client.
  }

  if (bearer) {
    return createSupabaseClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    )
  }

  const cookieStore = cookies()

  return createServerClient<Database>(
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

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  )
}
