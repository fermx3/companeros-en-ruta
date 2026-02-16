import { render, screen } from '@testing-library/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { brandNavConfig } from '@/lib/navigation-config'

// Mock child components
jest.mock('@/components/layout/dashboard-header', () => ({
    DashboardHeader: ({ brandName, subtitle }: any) => (
        <div data-testid="dashboard-header">
            <div>{subtitle}</div>
            <div>{brandName}</div>
        </div>
    )
}))

jest.mock('@/components/layout/bottom-navigation', () => ({
    BottomNavigation: ({ items }: any) => (
        <div data-testid="bottom-navigation">Items: {items?.length ?? 0}</div>
    )
}))

describe('DashboardLayout', () => {
    it('renders children content', () => {
        render(
            <DashboardLayout>
                <div>Dashboard Content</div>
            </DashboardLayout>
        )

        expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })

    it('renders DashboardHeader component', () => {
        render(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.getByTestId('dashboard-header')).toBeInTheDocument()
    })

    it('renders BottomNavigation when items are provided', () => {
        render(
            <DashboardLayout items={brandNavConfig.items}>
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument()
    })

    it('does not render BottomNavigation when no items provided', () => {
        render(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.queryByTestId('bottom-navigation')).not.toBeInTheDocument()
    })

    it('passes brandName to DashboardHeader', () => {
        render(
            <DashboardLayout brandName="Mi Marca">
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.getByText('Mi Marca')).toBeInTheDocument()
    })

    it('passes subtitle to DashboardHeader', () => {
        render(
            <DashboardLayout subtitle="CUSTOM SUBTITLE">
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.getByText('CUSTOM SUBTITLE')).toBeInTheDocument()
    })

    it('has correct layout structure', () => {
        const { container } = render(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        )

        const layout = container.firstChild
        expect(layout).toHaveClass('min-h-screen', 'bg-background', 'pb-20', 'md:pb-0')
    })

    it('main content has correct spacing', () => {
        const { container } = render(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        )

        const main = container.querySelector('main')
        expect(main).toHaveClass('p-4', 'space-y-6')
    })

    it('applies custom className to main', () => {
        const { container } = render(
            <DashboardLayout className="custom-main">
                <div>Content</div>
            </DashboardLayout>
        )

        const main = container.querySelector('main')
        expect(main).toHaveClass('custom-main')
    })
})
