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

  it('should redirect authenticated users away from login page', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-id', email: 'test@example.com' } },
      error: null
    })

    const request = new NextRequest('http://localhost:3000/login')
    const response = await updateSession(request)

    expect(response.status).toBe(307) // Redirect
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
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
