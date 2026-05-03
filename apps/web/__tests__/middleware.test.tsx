/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Mock Supabase
const mockGetUser = jest.fn()
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser
    }
  }))
}))

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect unauthenticated users from protected routes to login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = new NextRequest('http://localhost:3000/admin')
    const response = await updateSession(request)

    expect(response.status).toBe(307) // Redirect
    expect(response.headers.get('location')).toBe('http://localhost:3000/login')
  })

  it('should allow authenticated users to access protected routes', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-id', email: 'test@example.com' } },
      error: null
    })

    const request = new NextRequest('http://localhost:3000/admin')
    const response = await updateSession(request)

    expect(response.status).toBe(200)
  })

  it('should NOT auto-redirect authenticated users from /login (login page handles role)', async () => {
    // The middleware deliberately stopped auto-redirecting from /login. Role-based
    // routing is decided by the login page itself after probing the user's roles
    // and client membership. See the comment in apps/web/src/lib/supabase/middleware.ts:
    // "Don't auto-redirect from login — let the login page handle role detection.
    //  This prevents security issues where users get redirected to wrong dashboards."
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-id', email: 'test@example.com' } },
      error: null
    })

    const request = new NextRequest('http://localhost:3000/login')
    const response = await updateSession(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('should allow unauthenticated users to access login page', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = new NextRequest('http://localhost:3000/login')
    const response = await updateSession(request)

    expect(response.status).toBe(200)
  })

  it('should allow access to public routes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = new NextRequest('http://localhost:3000/')
    const response = await updateSession(request)

    expect(response.status).toBe(200)
  })
})
