import { render, screen } from '@testing-library/react'
import { MetricCard } from '@/components/ui/metric-card'
import { DollarSign } from 'lucide-react'

describe('MetricCard', () => {
    it('renders basic metric card with title and value', () => {
        render(
            <MetricCard
                title="Total Sales"
                value="$124.5k"
            />
        )

        expect(screen.getByText('Total Sales')).toBeInTheDocument()
        expect(screen.getByText('$124.5k')).toBeInTheDocument()
    })

    it('renders with change and trend up', () => {
        render(
            <MetricCard
                title="Revenue"
                value="$50k"
                change="+12.5%"
                trend="up"
            />
        )

        expect(screen.getByText('+12.5%')).toBeInTheDocument()
        // TrendingUp icon should be present
        const svg = screen.getByText('+12.5%').parentElement?.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('renders with change and trend down', () => {
        render(
            <MetricCard
                title="Orders"
                value="892"
                change="-2.1%"
                trend="down"
            />
        )

        expect(screen.getByText('-2.1%')).toBeInTheDocument()
    })

    it('renders with icon', () => {
        render(
            <MetricCard
                title="Sales"
                value="$100k"
                icon={<DollarSign data-testid="dollar-icon" />}
            />
        )

        expect(screen.getByTestId('dollar-icon')).toBeInTheDocument()
    })

    it('renders primary variant with gradient background', () => {
        const { container } = render(
            <MetricCard
                title="Featured Metric"
                value="999"
                variant="primary"
            />
        )

        const card = container.querySelector('.bg-gradient-to-br')
        expect(card).toBeInTheDocument()
        expect(card).toHaveClass('from-primary')
    })

    it('renders success variant', () => {
        const { container } = render(
            <MetricCard
                title="Success Metric"
                value="100%"
                variant="success"
            />
        )

        const card = container.querySelector('.from-green-500')
        expect(card).toBeInTheDocument()
    })

    it('renders warning variant', () => {
        const { container } = render(
            <MetricCard
                title="Warning Metric"
                value="50"
                variant="warning"
            />
        )

        const card = container.querySelector('.from-amber-500')
        expect(card).toBeInTheDocument()
    })

    it('renders loading state with skeleton', () => {
        const { container } = render(
            <MetricCard
                title="Loading"
                value="0"
                loading={true}
            />
        )

        expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
        expect(screen.queryByText('Loading')).not.toBeInTheDocument()
    })

    it('renders error state', () => {
        render(
            <MetricCard
                title="Error"
                value="0"
                error="Failed to load data"
            />
        )

        expect(screen.getByText(/Failed to load data/)).toBeInTheDocument()
        expect(screen.queryByText('Error')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
        const { container } = render(
            <MetricCard
                title="Custom"
                value="123"
                className="custom-class"
            />
        )

        expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
})
