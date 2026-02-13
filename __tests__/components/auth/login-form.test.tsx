import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
                signInWithPassword: mockSignInWithPassword
            },
            from: mockFrom
        } as any)
    })

    it('renders login form with branding', () => {
        render(<LoginForm />)

        expect(screen.getByText('Compañeros')).toBeInTheDocument()
        expect(screen.getByText('EN RUTA')).toBeInTheDocument()
        expect(screen.getByText(/Centraliza tu/)).toBeInTheDocument()
    })

    it('renders email and password fields', () => {
        render(<LoginForm />)

        expect(screen.getByPlaceholderText('nombre@empresa.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    })

    it('renders submit button', () => {
        render(<LoginForm />)

        expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument()
    })

    it('shows validation error for invalid email', async () => {
        render(<LoginForm />)

        const emailInput = screen.getByPlaceholderText('nombre@empresa.com')
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Email inválido')).toBeInTheDocument()
        })
    })

    it('shows validation error for short password', async () => {
        render(<LoginForm />)

        const emailInput = screen.getByPlaceholderText('nombre@empresa.com')
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: '123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/debe tener al menos 6 caracteres/)).toBeInTheDocument()
        })
    })

    it('toggles password visibility', () => {
        render(<LoginForm />)

        const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement
        const allButtons = screen.getAllByRole('button')
        // Find the toggle button (not the submit button)
        const toggleButton = allButtons.find(btn => btn.type === 'button' && !btn.textContent?.includes('Iniciar'))

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

        const emailInput = screen.getByPlaceholderText('nombre@empresa.com')
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

        const emailInput = screen.getByPlaceholderText('nombre@empresa.com')
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

        const emailInput = screen.getByPlaceholderText('nombre@empresa.com')
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        // Button should be disabled during loading
        expect(submitButton).toBeDisabled()
    })

    it('has icons in input fields', () => {
        const { container } = render(<LoginForm />)

        // Should have Mail and Lock icons
        const icons = container.querySelectorAll('svg')
        expect(icons.length).toBeGreaterThan(0)
    })

    it('has mobile-first design with rounded-xl inputs', () => {
        const { container } = render(<LoginForm />)

        const inputs = container.querySelectorAll('input')
        inputs.forEach(input => {
            expect(input).toHaveClass('rounded-xl')
            expect(input).toHaveClass('h-12')
        })
    })
})
