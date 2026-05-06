import { supabase } from './supabase'
import { env } from '../env'

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  // If the cached token is expired or about to expire, force a refresh.
  // RN's auto-refresh timer pauses while the app is backgrounded, so a
  // cold open after >1h often hits a stale token; refreshSession() picks
  // up the refresh_token from SecureStore and rotates it.
  const expiresAt = session.expires_at ?? 0
  if (expiresAt && expiresAt < Math.floor(Date.now() / 1000) + 30) {
    const { data: refreshed, error } = await supabase.auth.refreshSession()
    if (error || !refreshed.session) return null
    return refreshed.session.access_token
  }
  return session.access_token
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token = await getAccessToken()
  if (!token) throw new ApiError(401, 'No active session')

  const doFetch = (t: string) =>
    fetch(`${env.WEB_API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${t}`,
        ...init.headers,
      },
    })

  let res = await doFetch(token)

  // One retry on 401 — covers the race where the cached token expired
  // mid-flight or the proactive refresh above didn't fire (e.g., the
  // session said it expires in 31s but the server rejects it anyway).
  if (res.status === 401) {
    const { data: refreshed } = await supabase.auth.refreshSession()
    if (refreshed.session) {
      token = refreshed.session.access_token
      res = await doFetch(token)
    }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, `${res.status} ${res.statusText}`, body)
  }
  return res.json() as Promise<T>
}
