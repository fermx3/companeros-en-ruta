import { render, screen } from '@testing-library/react'
import { BottomNavigation } from '@/components/layout/bottom-navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/dashboard'),
    useRouter: jest.fn()
}))

describe('BottomNavigation', () => {
    it('renders navigation for admin role with all items', () => {
        render(<BottomNavigation role="admin" />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Reportes')).toBeInTheDocument()
        expect(screen.getByText('Ajustes')).toBeInTheDocument()
    })

    it('renders navigation for promotor role with filtered items', () => {
        render(<BottomNavigation role="promotor" />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Visitas')).toBeInTheDocument()
        expect(screen.getByText('Clientes')).toBeInTheDocument()
        expect(screen.queryByText('Lealtad')).not.toBeInTheDocument()
    })

    it('renders navigation for client role with loyalty', () => {
        render(<BottomNavigation role="client" />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Lealtad')).toBeInTheDocument()
        expect(screen.getByText('Ajustes')).toBeInTheDocument()
        expect(screen.queryByText('Visitas')).not.toBeInTheDocument()
    })

    it('renders navigation for brand role', () => {
        render(<BottomNavigation role="brand" />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Clientes')).toBeInTheDocument()
        expect(screen.getByText('Reportes')).toBeInTheDocument()
    })

    it('renders navigation for supervisor role', () => {
        render(<BottomNavigation role="supervisor" />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Visitas')).toBeInTheDocument()
        expect(screen.getByText('Clientes')).toBeInTheDocument()
    })

    it('renders navigation for asesor_de_ventas role', () => {
        render(<BottomNavigation role="asesor_de_ventas" />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Visitas')).toBeInTheDocument()
        expect(screen.getByText('Ajustes')).toBeInTheDocument()
    })

    it('limits to 4 items maximum', () => {
        const { container } = render(<BottomNavigation role="admin" />)

        const links = container.querySelectorAll('a')
        expect(links.length).toBeLessThanOrEqual(4)
    })

    it('highlights active route', () => {
        const usePathname = require('next/navigation').usePathname
        usePathname.mockReturnValue('/dashboard')

        render(<BottomNavigation role="admin" />)

        const dashboardLink = screen.getByText('Inicio').closest('a')
        expect(dashboardLink).toHaveClass('text-primary', 'bg-primary/5')
    })

    it('has correct styling for inactive items', () => {
        const usePathname = require('next/navigation').usePathname
        usePathname.mockReturnValue('/dashboard')

        render(<BottomNavigation role="admin" />)

        const reportsLink = screen.getByText('Reportes').closest('a')
        expect(reportsLink).toHaveClass('text-muted-foreground')
    })

    it('is fixed at bottom with correct z-index', () => {
        const { container } = render(<BottomNavigation role="admin" />)

        const nav = container.querySelector('nav')
        expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'z-40')
    })

    it('is hidden on desktop (md:hidden)', () => {
        const { container } = render(<BottomNavigation role="admin" />)

        const nav = container.querySelector('nav')
        expect(nav).toHaveClass('md:hidden')
    })

    it('renders icons for each nav item', () => {
        const { container } = render(<BottomNavigation role="admin" />)

        const icons = container.querySelectorAll('svg')
        expect(icons.length).toBeGreaterThan(0)
    })
})
