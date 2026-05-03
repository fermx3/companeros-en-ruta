import { render, screen, fireEvent } from '@testing-library/react'
import { RequestCard } from '@/components/ui/request-card'

describe('RequestCard', () => {
    const mockOnApprove = jest.fn()
    const mockOnReject = jest.fn()

    const defaultProps = {
        id: '1',
        title: 'Nueva Campaña de Verano',
        description: 'Campaña promocional para productos de temporada',
        type: 'campaign' as const,
        timeAgo: 'hace 2 horas',
        status: 'pending' as const,
        onApprove: mockOnApprove,
        onReject: mockOnReject
    }

    beforeEach(() => {
        mockOnApprove.mockClear()
        mockOnReject.mockClear()
    })

    it('renders title and description', () => {
        render(<RequestCard {...defaultProps} />)

        expect(screen.getByText('Nueva Campaña de Verano')).toBeInTheDocument()
        expect(screen.getByText('Campaña promocional para productos de temporada')).toBeInTheDocument()
    })

    it('renders timeAgo', () => {
        render(<RequestCard {...defaultProps} />)

        expect(screen.getByText('hace 2 horas')).toBeInTheDocument()
    })

    it('renders status badge', () => {
        render(<RequestCard {...defaultProps} />)

        expect(screen.getByText('PENDIENTE')).toBeInTheDocument()
    })

    it('renders campaign icon for campaign type', () => {
        const { container } = render(<RequestCard {...defaultProps} type="campaign" />)

        // Tag icon should be present
        const iconContainer = container.querySelector('.bg-blue-100')
        expect(iconContainer).toBeInTheDocument()
    })

    it('renders promotion icon for promotion type', () => {
        const { container } = render(<RequestCard {...defaultProps} type="promotion" />)

        const iconContainer = container.querySelector('.bg-blue-100')
        expect(iconContainer).toBeInTheDocument()
    })

    it('renders visit icon for visit type', () => {
        const { container } = render(<RequestCard {...defaultProps} type="visit" />)

        const iconContainer = container.querySelector('.bg-blue-100')
        expect(iconContainer).toBeInTheDocument()
    })

    it('shows approve and reject buttons when status is pending', () => {
        render(<RequestCard {...defaultProps} status="pending" />)

        expect(screen.getByText('Aprobar')).toBeInTheDocument()
        expect(screen.getByText('Rechazar')).toBeInTheDocument()
    })

    it('hides buttons when status is not pending', () => {
        render(<RequestCard {...defaultProps} status="completed" />)

        expect(screen.queryByText('Aprobar')).not.toBeInTheDocument()
        expect(screen.queryByText('Rechazar')).not.toBeInTheDocument()
    })

    it('calls onApprove when approve button is clicked', () => {
        render(<RequestCard {...defaultProps} />)

        fireEvent.click(screen.getByText('Aprobar'))
        expect(mockOnApprove).toHaveBeenCalledTimes(1)
    })

    it('calls onReject when reject button is clicked', () => {
        render(<RequestCard {...defaultProps} />)

        fireEvent.click(screen.getByText('Rechazar'))
        expect(mockOnReject).toHaveBeenCalledTimes(1)
    })

    it('approve button has primary variant', () => {
        render(<RequestCard {...defaultProps} />)

        const approveButton = screen.getByText('Aprobar').closest('button')
        expect(approveButton).toHaveClass('bg-primary')
    })

    it('reject button has ghost variant', () => {
        render(<RequestCard {...defaultProps} />)

        const rejectButton = screen.getByText('Rechazar').closest('button')
        expect(rejectButton).toHaveClass('bg-transparent')
    })

    it('renders with active status', () => {
        render(<RequestCard {...defaultProps} status="active" />)

        expect(screen.getByText('ACTIVO')).toBeInTheDocument()
    })

    it('renders with cancelled status', () => {
        render(<RequestCard {...defaultProps} status="cancelled" />)

        expect(screen.getByText('CANCELADO')).toBeInTheDocument()
    })

    it('applies custom className', () => {
        const { container } = render(
            <RequestCard {...defaultProps} className="custom-request" />
        )

        expect(container.querySelector('.custom-request')).toBeInTheDocument()
    })

    it('has rounded-2xl styling', () => {
        const { container } = render(<RequestCard {...defaultProps} />)

        const card = container.firstChild
        expect(card).toHaveClass('rounded-2xl')
    })
})
