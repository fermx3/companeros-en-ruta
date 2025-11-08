import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'
import type { User, Session } from '@supabase/supabase-js'

const mockPush = jest.fn()
const mockSignInWithPassword = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('/src/lib/supabase/client.ts', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form', () => {
    render(<LoginPage />)

    expect(screen.getByText('Compañeros en Ruta')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()

    const mockUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    }
    const mockSession: Session = {
      user: mockUser,
      access_token: 'token',
      expires_at: Date.now() + 3600000,
      expires_in: 3600,
      refresh_token: 'refresh-token',
      token_type: 'bearer' as const
    }

    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: mockUser,
        session: mockSession
      },
      error: null
    })

    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should handle login error', async () => {
    const user = userEvent.setup()

    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    })

    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('Email'), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText('Contraseña'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should show loading state during login', async () => {
    const user = userEvent.setup()

    // Simular login lento
    mockSignInWithPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: { user: null, session: null },
        error: null
      }), 1000))
    )

    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
