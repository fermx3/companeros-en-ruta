import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider'
import type { User, Session } from '@supabase/supabase-js'
import '@testing-library/jest-dom'

// Mock hooks
const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockFrom = jest.fn()

jest.mock('/src/lib/supabase/client.ts', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  }),
}))

// Mock del hook useAuth para testing
const TestComponent = () => {
  const { user, loading, userRoles } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <div data-testid="user-email">{user.email}</div>
      <div data-testid="user-roles">{userRoles.join(', ')}</div>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock subscription object
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })

    // Mock console.error to suppress the act warning in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render loading state initially', () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render not authenticated when no user', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should render user data when authenticated', async () => {
    const mockUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    }

    const mockSession: Session = {
      user: mockUser,
      access_token: 'test-token',
      expires_at: Date.now() + 3600000,
      expires_in: 3600,
      refresh_token: 'refresh-token',
      token_type: 'bearer' as const
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    // Mock user profile query
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'test-user-id', tenant_id: 'test-tenant' },
        error: null
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
    }, { timeout: 5000 })
  })
})
