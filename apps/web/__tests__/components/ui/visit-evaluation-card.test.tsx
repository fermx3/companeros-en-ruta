import { render, screen, fireEvent } from '@testing-library/react'
import { VisitEvaluationCard, type EvaluationItem } from '@/components/ui/visit-evaluation-card'
import { Camera, Package, FileText } from 'lucide-react'

describe('VisitEvaluationCard', () => {
    const mockOnPress1 = jest.fn()
    const mockOnPress2 = jest.fn()
    const mockOnPress3 = jest.fn()

    const mockItems: EvaluationItem[] = [
        {
            id: '1',
            title: 'Fotos del Punto de Venta',
            description: 'Captura 3-5 fotos',
            icon: <Camera data-testid="camera-icon" />,
            status: 'completed',
            onPress: mockOnPress1
        },
        {
            id: '2',
            title: 'Inventario de Productos',
            description: 'Registra stock disponible',
            icon: <Package data-testid="package-icon" />,
            status: 'pending',
            onPress: mockOnPress2
        },
        {
            id: '3',
            title: 'Orden de Compra',
            description: 'Genera orden si aplica',
            icon: <FileText data-testid="file-icon" />,
            status: 'pending',
            onPress: mockOnPress3
        }
    ]

    beforeEach(() => {
        mockOnPress1.mockClear()
        mockOnPress2.mockClear()
        mockOnPress3.mockClear()
    })

    it('renders card title', () => {
        render(<VisitEvaluationCard items={mockItems} pendingCount={2} />)

        expect(screen.getByText('EVALUACIÓN DE VISITA')).toBeInTheDocument()
    })

    it('renders pending count badge when pendingCount > 0', () => {
        render(<VisitEvaluationCard items={mockItems} pendingCount={2} />)

        expect(screen.getByText('2 Pendientes')).toBeInTheDocument()
    })

    it('does not render pending badge when pendingCount is 0', () => {
        render(<VisitEvaluationCard items={mockItems} pendingCount={0} />)

        expect(screen.queryByText(/Pendientes/)).not.toBeInTheDocument()
    })

    it('renders all evaluation items', () => {
        render(<VisitEvaluationCard items={mockItems} pendingCount={2} />)

        expect(screen.getByText('Fotos del Punto de Venta')).toBeInTheDocument()
        expect(screen.getByText('Inventario de Productos')).toBeInTheDocument()
        expect(screen.getByText('Orden de Compra')).toBeInTheDocument()
    })

    it('renders item descriptions', () => {
        render(<VisitEvaluationCard items={mockItems} pendingCount={2} />)

        expect(screen.getByText('Captura 3-5 fotos')).toBeInTheDocument()
        expect(screen.getByText('Registra stock disponible')).toBeInTheDocument()
        expect(screen.getByText('Genera orden si aplica')).toBeInTheDocument()
    })

    it('renders item icons', () => {
        render(<VisitEvaluationCard items={mockItems} pendingCount={2} />)

        expect(screen.getByTestId('camera-icon')).toBeInTheDocument()
        expect(screen.getByTestId('package-icon')).toBeInTheDocument()
        expect(screen.getByTestId('file-icon')).toBeInTheDocument()
    })

    it('calls onPress when item is clicked', () => {
        render(<VisitEvaluationCard items={mockItems} pendingCount={2} />)

        fireEvent.click(screen.getByText('Fotos del Punto de Venta'))
        expect(mockOnPress1).toHaveBeenCalledTimes(1)

        fireEvent.click(screen.getByText('Inventario de Productos'))
        expect(mockOnPress2).toHaveBeenCalledTimes(1)
    })

    it('renders ChevronRight icon for each item', () => {
        const { container } = render(
            <VisitEvaluationCard items={mockItems} pendingCount={2} />
        )

        // Should have 3 ChevronRight icons (one per item)
        const chevrons = container.querySelectorAll('svg[class*="h-5 w-5 text-muted-foreground"]')
        expect(chevrons.length).toBeGreaterThanOrEqual(3)
    })

    it('has hover effect on items', () => {
        const { container } = render(
            <VisitEvaluationCard items={mockItems} pendingCount={2} />
        )

        const items = container.querySelectorAll('.hover\\:bg-muted\\/50')
        expect(items.length).toBe(3)
    })

    it('applies custom className', () => {
        const { container } = render(
            <VisitEvaluationCard
                items={mockItems}
                pendingCount={2}
                className="custom-evaluation"
            />
        )

        expect(container.querySelector('.custom-evaluation')).toBeInTheDocument()
    })

    it('renders with empty items array', () => {
        render(<VisitEvaluationCard items={[]} pendingCount={0} />)

        expect(screen.getByText('EVALUACIÓN DE VISITA')).toBeInTheDocument()
        expect(screen.queryByText('Fotos')).not.toBeInTheDocument()
    })

    it('icon containers have primary background', () => {
        const { container } = render(
            <VisitEvaluationCard items={mockItems} pendingCount={2} />
        )

        const iconContainers = container.querySelectorAll('.bg-primary\\/10')
        expect(iconContainers.length).toBe(3)
    })
})
