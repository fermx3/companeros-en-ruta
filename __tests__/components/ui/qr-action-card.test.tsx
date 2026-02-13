import { render, screen, fireEvent } from '@testing-library/react'
import { QRActionCard } from '@/components/ui/qr-action-card'
import { QrCode } from 'lucide-react'

describe('QRActionCard', () => {
    const mockOnAction = jest.fn()

    const defaultProps = {
        title: 'Escanear Entrada',
        description: 'Registra tu llegada al punto de venta',
        icon: <QrCode data-testid="qr-icon" />,
        onAction: mockOnAction,
        actionLabel: 'Escanear'
    }

    beforeEach(() => {
        mockOnAction.mockClear()
    })

    it('renders title and description', () => {
        render(<QRActionCard {...defaultProps} />)

        expect(screen.getByText('Escanear Entrada')).toBeInTheDocument()
        expect(screen.getByText('Registra tu llegada al punto de venta')).toBeInTheDocument()
    })

    it('renders icon', () => {
        render(<QRActionCard {...defaultProps} />)

        expect(screen.getByTestId('qr-icon')).toBeInTheDocument()
    })

    it('renders action button with label', () => {
        render(<QRActionCard {...defaultProps} />)

        expect(screen.getByText('Escanear')).toBeInTheDocument()
    })

    it('calls onAction when button is clicked', () => {
        render(<QRActionCard {...defaultProps} />)

        fireEvent.click(screen.getByText('Escanear'))
        expect(mockOnAction).toHaveBeenCalledTimes(1)
    })

    it('disables button when disabled prop is true', () => {
        render(<QRActionCard {...defaultProps} disabled />)

        const button = screen.getByText('Escanear').closest('button')
        expect(button).toBeDisabled()
    })

    it('does not call onAction when disabled', () => {
        render(<QRActionCard {...defaultProps} disabled />)

        fireEvent.click(screen.getByText('Escanear'))
        expect(mockOnAction).not.toHaveBeenCalled()
    })

    it('icon has primary background color', () => {
        const { container } = render(<QRActionCard {...defaultProps} />)

        const iconContainer = screen.getByTestId('qr-icon').parentElement
        expect(iconContainer).toHaveClass('bg-primary/10', 'text-primary')
    })

    it('has hover shadow effect', () => {
        const { container } = render(<QRActionCard {...defaultProps} />)

        const card = container.firstChild
        expect(card).toHaveClass('hover:shadow-md')
    })

    it('applies custom className', () => {
        const { container } = render(
            <QRActionCard {...defaultProps} className="custom-qr-card" />
        )

        expect(container.querySelector('.custom-qr-card')).toBeInTheDocument()
    })

    it('has rounded-2xl styling', () => {
        const { container } = render(<QRActionCard {...defaultProps} />)

        const card = container.firstChild
        expect(card).toHaveClass('rounded-2xl')
    })

    it('uses ActionButton component for action', () => {
        render(<QRActionCard {...defaultProps} />)

        const button = screen.getByText('Escanear')
        // ActionButton should have primary variant and sm size
        expect(button.closest('button')).toHaveClass('bg-primary')
    })
})
