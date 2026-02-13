import { render, screen } from '@testing-library/react'
import { ProgressCard } from '@/components/ui/progress-card'

describe('ProgressCard', () => {
    const defaultProps = {
        currentTier: 'Bronce',
        nextTier: 'Plata',
        currentPoints: 250,
        targetPoints: 500,
        totalPoints: 1250
    }

    it('renders current tier information', () => {
        render(<ProgressCard {...defaultProps} />)

        expect(screen.getByText('NIVEL ACTUAL')).toBeInTheDocument()
        expect(screen.getByText('Bronce')).toBeInTheDocument()
    })

    it('renders progress to next tier', () => {
        render(<ProgressCard {...defaultProps} />)

        expect(screen.getByText(/Progreso a Plata/)).toBeInTheDocument()
        expect(screen.getByText(/250 \/ 500 pts/)).toBeInTheDocument()
    })

    it('renders total points', () => {
        render(<ProgressCard {...defaultProps} />)

        expect(screen.getByText('1,250')).toBeInTheDocument()
        expect(screen.getByText('puntos totales')).toBeInTheDocument()
    })

    it('renders user ID when provided', () => {
        render(<ProgressCard {...defaultProps} userId="USER123" />)

        expect(screen.getByText('ID:')).toBeInTheDocument()
        expect(screen.getByText('USER123')).toBeInTheDocument()
    })

    it('does not render user ID when not provided', () => {
        render(<ProgressCard {...defaultProps} />)

        expect(screen.queryByText('ID:')).not.toBeInTheDocument()
    })

    it('calculates progress percentage correctly', () => {
        const { container } = render(<ProgressCard {...defaultProps} />)

        // 250/500 = 50%
        const progressBar = container.querySelector('.bg-white.rounded-full.h-3')
        expect(progressBar).toHaveStyle({ width: '50%' })
    })

    it('caps progress at 100%', () => {
        const { container } = render(
            <ProgressCard
                {...defaultProps}
                currentPoints={600}
                targetPoints={500}
            />
        )

        const progressBar = container.querySelector('.bg-white.rounded-full.h-3')
        expect(progressBar).toHaveStyle({ width: '100%' })
    })

    it('formats numbers with locale', () => {
        render(
            <ProgressCard
                {...defaultProps}
                currentPoints={1250}
                targetPoints={5000}
                totalPoints={12500}
            />
        )

        expect(screen.getByText(/1,250 \/ 5,000 pts/)).toBeInTheDocument()
        expect(screen.getByText('12,500')).toBeInTheDocument()
    })

    it('has gradient background', () => {
        const { container } = render(<ProgressCard {...defaultProps} />)

        const card = container.querySelector('.bg-gradient-to-br')
        expect(card).toBeInTheDocument()
        expect(card).toHaveClass('from-primary', 'to-amber-500')
    })

    it('renders Crown icon', () => {
        const { container } = render(<ProgressCard {...defaultProps} />)

        const crownIcon = container.querySelector('svg')
        expect(crownIcon).toBeInTheDocument()
    })

    it('applies custom className', () => {
        const { container } = render(
            <ProgressCard {...defaultProps} className="custom-progress" />
        )

        expect(container.querySelector('.custom-progress')).toBeInTheDocument()
    })
})
