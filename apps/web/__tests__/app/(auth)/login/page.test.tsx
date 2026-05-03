import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'

// LoginPage is a thin wrapper around <LoginForm />. The form's behavior is
// covered exhaustively in __tests__/components/auth/login-form.test.tsx.
// Here we only verify the page mounts and delegates to the form.
//
// LoginForm probes for an existing session on mount via supabase.auth.getSession,
// so we mock the Supabase client to return null and let the form render.

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(),
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('Login Page', () => {
  it('renders the LoginForm', async () => {
    render(<LoginPage />)

    // The form's email input is the canonical evidence that LoginForm mounted.
    expect(await screen.findByPlaceholderText('correo@empresa.com')).toBeInTheDocument()
  })
})
