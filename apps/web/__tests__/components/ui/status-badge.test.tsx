import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/ui/status-badge'

describe('StatusBadge', () => {
    it('renders active status with correct styling', () => {
        render(<StatusBadge status="active" />)

        const badge = screen.getByText('ACTIVO')
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveClass('bg-green-100', 'text-green-700', 'border-green-200')
    })

    it('renders pending status', () => {
        render(<StatusBadge status="pending" />)

        const badge = screen.getByText('PENDIENTE')
        expect(badge).toHaveClass('bg-amber-100', 'text-amber-700', 'border-amber-200')
    })

    it('renders completed status', () => {
        render(<StatusBadge status="completed" />)

        const badge = screen.getByText('COMPLETADO')
        expect(badge).toHaveClass('bg-blue-100', 'text-blue-700', 'border-blue-200')
    })

    it('renders cancelled status', () => {
        render(<StatusBadge status="cancelled" />)

        const badge = screen.getByText('CANCELADO')
        expect(badge).toHaveClass('bg-red-100', 'text-red-700', 'border-red-200')
    })

    it('renders expired status', () => {
        render(<StatusBadge status="expired" />)

        const badge = screen.getByText('EXPIRADO')
        expect(badge).toHaveClass('bg-gray-100', 'text-gray-700', 'border-gray-200')
    })

    it('renders small size', () => {
        render(<StatusBadge status="active" size="sm" />)

        const badge = screen.getByText('ACTIVO')
        expect(badge).toHaveClass('px-2', 'py-1', 'text-xs')
    })

    it('renders medium size (default)', () => {
        render(<StatusBadge status="active" size="md" />)

        const badge = screen.getByText('ACTIVO')
        expect(badge).toHaveClass('px-3', 'py-1', 'text-sm')
    })

    it('renders large size', () => {
        render(<StatusBadge status="active" size="lg" />)

        const badge = screen.getByText('ACTIVO')
        expect(badge).toHaveClass('px-4', 'py-2', 'text-base')
    })

    it('renders custom children instead of default label', () => {
        render(
            <StatusBadge status="pending">
                3 Pendientes
            </StatusBadge>
        )

        expect(screen.getByText('3 Pendientes')).toBeInTheDocument()
        expect(screen.queryByText('PENDIENTE')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
        render(<StatusBadge status="active" className="custom-badge" />)

        const badge = screen.getByText('ACTIVO')
        expect(badge).toHaveClass('custom-badge')
    })

    it('has rounded-full styling', () => {
        render(<StatusBadge status="active" />)

        const badge = screen.getByText('ACTIVO')
        expect(badge).toHaveClass('rounded-full')
    })
})
