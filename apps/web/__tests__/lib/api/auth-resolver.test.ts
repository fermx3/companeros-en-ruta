import { resolveUserId } from '@/lib/api/auth-resolver'
import { headers } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

const headersMock = headers as jest.MockedFunction<typeof headers>

type GetUserFn = SupabaseClient['auth']['getUser']

function makeSupabase(getUser: jest.MockedFunction<GetUserFn>): SupabaseClient {
  return {
    auth: { getUser },
  } as unknown as SupabaseClient
}

function makeHeaders(map: Record<string, string>) {
  return {
    get: (name: string) => map[name.toLowerCase()] ?? null,
  } as unknown as Awaited<ReturnType<typeof headers>>
}

describe('resolveUserId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns id from x-supabase-user-id header without calling supabase', async () => {
    headersMock.mockResolvedValue(
      makeHeaders({ 'x-supabase-user-id': 'user-from-header' })
    )
    const getUser = jest.fn() as jest.MockedFunction<GetUserFn>
    const supabase = makeSupabase(getUser)

    const id = await resolveUserId(supabase)

    expect(id).toBe('user-from-header')
    expect(getUser).not.toHaveBeenCalled()
  })

  it('validates Bearer token via supabase.auth.getUser(token) and returns user id', async () => {
    headersMock.mockResolvedValue(
      makeHeaders({ authorization: 'Bearer valid-access-token' })
    )
    const getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-from-bearer' } },
      error: null,
    }) as unknown as jest.MockedFunction<GetUserFn>
    const supabase = makeSupabase(getUser)

    const id = await resolveUserId(supabase)

    expect(id).toBe('user-from-bearer')
    expect(getUser).toHaveBeenCalledWith('valid-access-token')
  })

  it('returns null for an invalid Bearer token (does not fall through to cookie path)', async () => {
    headersMock.mockResolvedValue(
      makeHeaders({ authorization: 'Bearer invalid-token' })
    )
    const getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid JWT' },
    }) as unknown as jest.MockedFunction<GetUserFn>
    const supabase = makeSupabase(getUser)

    const id = await resolveUserId(supabase)

    expect(id).toBeNull()
    expect(getUser).toHaveBeenCalledTimes(1)
    expect(getUser).toHaveBeenCalledWith('invalid-token')
  })

  it('falls back to cookie-based getUser() when no header and no Authorization', async () => {
    headersMock.mockResolvedValue(makeHeaders({}))
    const getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-from-cookie' } },
      error: null,
    }) as unknown as jest.MockedFunction<GetUserFn>
    const supabase = makeSupabase(getUser)

    const id = await resolveUserId(supabase)

    expect(id).toBe('user-from-cookie')
    expect(getUser).toHaveBeenCalledWith()
  })

  it('returns null when cookie fallback also has no user', async () => {
    headersMock.mockResolvedValue(makeHeaders({}))
    const getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }) as unknown as jest.MockedFunction<GetUserFn>
    const supabase = makeSupabase(getUser)

    const id = await resolveUserId(supabase)

    expect(id).toBeNull()
  })

  it('ignores Authorization header when scheme is not Bearer', async () => {
    headersMock.mockResolvedValue(
      makeHeaders({ authorization: 'Basic abc123' })
    )
    const getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-from-cookie' } },
      error: null,
    }) as unknown as jest.MockedFunction<GetUserFn>
    const supabase = makeSupabase(getUser)

    const id = await resolveUserId(supabase)

    expect(id).toBe('user-from-cookie')
    expect(getUser).toHaveBeenCalledWith()
  })

  it('falls back to cookie path when Bearer is empty', async () => {
    headersMock.mockResolvedValue(
      makeHeaders({ authorization: 'Bearer    ' })
    )
    const getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-from-cookie' } },
      error: null,
    }) as unknown as jest.MockedFunction<GetUserFn>
    const supabase = makeSupabase(getUser)

    const id = await resolveUserId(supabase)

    expect(id).toBe('user-from-cookie')
    expect(getUser).toHaveBeenCalledWith()
  })

  it('falls back to cookie path when headers() throws (non-request context)', async () => {
    headersMock.mockRejectedValue(new Error('headers not available'))
    const getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-from-cookie' } },
      error: null,
    }) as unknown as jest.MockedFunction<GetUserFn>
    const supabase = makeSupabase(getUser)

    const id = await resolveUserId(supabase)

    expect(id).toBe('user-from-cookie')
  })
})
