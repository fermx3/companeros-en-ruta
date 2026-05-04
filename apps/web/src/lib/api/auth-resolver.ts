import { headers } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Resolves the authenticated Supabase user id for an API route handler.
 *
 * Resolution order:
 *
 * 1. `x-supabase-user-id` request header — injected by web middleware on
 *    cookie-authenticated requests. Fast path: skips Supabase entirely.
 * 2. `Authorization: Bearer <access_token>` header — used by mobile clients
 *    that don't carry cookies. The token is validated via
 *    `supabase.auth.getUser(token)`, which returns the user only if the
 *    token is a valid Supabase access token for this project.
 * 3. `supabase.auth.getUser()` (no token) — falls back to the cookie session
 *    on the SSR client. Covers any route that runs without middleware
 *    pre-injection.
 *
 * Returns `null` when no path authenticates. Callers map that to a 401.
 */
export async function resolveUserId(
  supabase: SupabaseClient
): Promise<string | null> {
  try {
    const h = await headers()

    const headerUserId = h.get('x-supabase-user-id')
    if (headerUserId) return headerUserId

    const auth = h.get('authorization')
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice('Bearer '.length).trim()
      if (token) {
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data.user) return data.user.id
        return null
      }
    }
  } catch {
    // headers() not available outside request context — fall through to
    // cookie-based getUser() below.
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  if (!error && user) return user.id

  return null
}
