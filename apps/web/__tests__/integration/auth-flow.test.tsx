import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/components/providers/AuthProvider'
import LoginPage from '@/app/(auth)/login/page'

// Mock Supabase
const mockSignInWithPassword = jest.fn()
const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null })
    }))
  }),
}))

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {})

    // Setup default mocks
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })

    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should complete full auth flow', async () => {
    const user = userEvent.setup()

    // Renderizar login dentro del AuthProvider
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )

    // Verificar elementos del formulario
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument()

    // Simular login
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    // Verificar que se llamó la función de login
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
})
