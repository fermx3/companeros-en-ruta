import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Mock Supabase client
jest.mock('@/lib/supabase/client')
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

describe('LoginForm', () => {
    const mockPush = jest.fn()
    const mockSignInWithPassword = jest.fn()
    const mockFrom = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush
            })

        mockCreateClient.mockReturnValue({
            auth: {
                // LoginForm probes for an existing session on mount to skip the form
                // for already-authenticated users. Default: no session → form renders.
                getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
                signInWithPassword: mockSignInWithPassword,
            },
            from: mockFrom,
        } as any)
    })

    // The login form mounts a session check (`getSession`) and shows a loader
    // until it resolves. Tests must `await` the form before interacting.
    const findEmailInput = () => screen.findByPlaceholderText('correo@empresa.com')

    it('renders login form with branding', async () => {
        render(<LoginForm />)

        await findEmailInput()
        expect(screen.getByText('Compañeros en Ruta')).toBeInTheDocument()
        expect(screen.getByText(/Centraliza tu/)).toBeInTheDocument()
    })

    it('renders email and password fields', async () => {
        render(<LoginForm />)

        expect(await findEmailInput()).toBeInTheDocument()
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    })

    it('renders submit button', async () => {
        render(<LoginForm />)

        await findEmailInput()
        expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument()
    })

    it('shows validation error for invalid email', async () => {
        const form = render(<LoginForm />)

        const emailInput = await findEmailInput() as HTMLInputElement

        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        })

        // Submit the form directly; clicking the type=submit button in jsdom
        // sometimes fails to bubble through the shadcn-wrapped layout. Submitting
        // the form element is the more reliable path and exercises the same
        // RHF + Zod resolver pipeline.
        const formEl = emailInput.closest('form')!
        await act(async () => {
            fireEvent.submit(formEl)
        })

        await waitFor(() => {
            expect(screen.getByText('Email inválido')).toBeInTheDocument()
        })
    })

    it('shows validation error for short password', async () => {
        render(<LoginForm />)

        const emailInput = await findEmailInput()
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: '123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/debe tener al menos 6 caracteres/)).toBeInTheDocument()
        })
    })

    it('toggles password visibility', async () => {
        render(<LoginForm />)

        await findEmailInput()
        const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement
        const allButtons = screen.getAllByRole('button')
        const toggleButton = allButtons.find(btn => (btn as HTMLButtonElement).type === 'button' && !btn.textContent?.includes('Iniciar'))

        expect(passwordInput.type).toBe('password')

        if (toggleButton) {
            fireEvent.click(toggleButton)
            expect(passwordInput.type).toBe('text')

            fireEvent.click(toggleButton)
            expect(passwordInput.type).toBe('password')
        }
    })

    it('displays error message on failed login', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: null,
            error: { message: 'Invalid credentials' }
        })

        render(<LoginForm />)

        const emailInput = await findEmailInput()
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
        })
    })

    it('redirects client users to /client', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null
        })

        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: { id: 'client-123', status: 'active' },
                error: null
            })
        })

        render(<LoginForm />)

        const emailInput = await findEmailInput()
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })

        fireEvent.change(emailInput, { target: { value: 'client@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/client')
        })
    })

    it('shows loading state during submission', async () => {
        mockSignInWithPassword.mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 100))
        )

        render(<LoginForm />)

        const emailInput = await findEmailInput()
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })

        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })
        })
        await act(async () => {
            fireEvent.click(submitButton)
        })

        await waitFor(() => {
            expect(submitButton).toBeDisabled()
        })
    })

    it('has icons in input fields', async () => {
        const { container } = render(<LoginForm />)

        await findEmailInput()
        const icons = container.querySelectorAll('svg')
        expect(icons.length).toBeGreaterThan(0)
    })

    it('has mobile-first design with rounded inputs', async () => {
        const { container } = render(<LoginForm />)

        await findEmailInput()
        const inputs = container.querySelectorAll('input')
        inputs.forEach(input => {
            // Perfectapp login uses rounded-full pills, h-12 inputs
            expect(input).toHaveClass('rounded-full')
            expect(input).toHaveClass('h-12')
        })
    })
})
