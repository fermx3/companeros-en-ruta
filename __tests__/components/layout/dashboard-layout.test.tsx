import { render, screen } from '@testing-library/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

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
    BottomNavigation: ({ role }: any) => (
        <div data-testid="bottom-navigation">Role: {role}</div>
    )
}))

describe('DashboardLayout', () => {
    it('renders children content', () => {
        render(
            <DashboardLayout role="admin">
                <div>Dashboard Content</div>
            </DashboardLayout>
        )

        expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })

    it('renders DashboardHeader component', () => {
        render(
            <DashboardLayout role="admin">
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.getByTestId('dashboard-header')).toBeInTheDocument()
    })

    it('renders BottomNavigation component', () => {
        render(
            <DashboardLayout role="admin">
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument()
    })

    it('passes role to BottomNavigation', () => {
        render(
            <DashboardLayout role="promotor">
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.getByText('Role: promotor')).toBeInTheDocument()
    })

    it('passes brandName to DashboardHeader', () => {
        render(
            <DashboardLayout role="brand" brandName="Mi Marca">
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.getByText('Mi Marca')).toBeInTheDocument()
    })

    it('passes subtitle to DashboardHeader', () => {
        render(
            <DashboardLayout role="brand" subtitle="CUSTOM SUBTITLE">
                <div>Content</div>
            </DashboardLayout>
        )

        expect(screen.getByText('CUSTOM SUBTITLE')).toBeInTheDocument()
    })

    it('has correct layout structure', () => {
        const { container } = render(
            <DashboardLayout role="admin">
                <div>Content</div>
            </DashboardLayout>
        )

        const layout = container.firstChild
        expect(layout).toHaveClass('min-h-screen', 'bg-background', 'pb-20', 'md:pb-0')
    })

    it('main content has correct spacing', () => {
        const { container } = render(
            <DashboardLayout role="admin">
                <div>Content</div>
            </DashboardLayout>
        )

        const main = container.querySelector('main')
        expect(main).toHaveClass('p-4', 'space-y-6')
    })

    it('applies custom className to main', () => {
        const { container } = render(
            <DashboardLayout role="admin" className="custom-main">
                <div>Content</div>
            </DashboardLayout>
        )

        const main = container.querySelector('main')
        expect(main).toHaveClass('custom-main')
    })

    it('renders for all user roles', () => {
        const roles = ['admin', 'brand', 'supervisor', 'promotor', 'asesor_de_ventas', 'client'] as const

        roles.forEach(role => {
            const { container } = render(
                <DashboardLayout role={role}>
                    <div>Content for {role}</div>
                </DashboardLayout>
            )

            expect(screen.getByText(`Content for ${role}`)).toBeInTheDocument()
        })
    })
})
