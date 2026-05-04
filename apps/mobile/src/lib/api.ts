import { supabase } from './supabase'
import { env } from '../env'

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new ApiError(401, 'No active session')

  const res = await fetch(`${env.WEB_API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...init.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, `${res.status} ${res.statusText}`, body)
  }
  return res.json() as Promise<T>
}
