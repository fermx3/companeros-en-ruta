import { render, screen } from '@testing-library/react'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { promotorNavConfig, clientNavConfig, brandNavConfig, supervisorNavConfig } from '@/lib/navigation-config'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/promotor'),
    useRouter: jest.fn()
}))

describe('BottomNavigation', () => {
    it('renders navigation items passed as props', () => {
        render(<BottomNavigation items={promotorNavConfig.items.slice(0, 5)} />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Visitas')).toBeInTheDocument()
        expect(screen.getByText('Clientes')).toBeInTheDocument()
    })

    it('renders client navigation items', () => {
        const usePathname = require('next/navigation').usePathname
        usePathname.mockReturnValue('/client')

        render(<BottomNavigation items={clientNavConfig.items.slice(0, 5)} />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Mi QR')).toBeInTheDocument()
        expect(screen.getByText('Pedidos')).toBeInTheDocument()
    })

    it('renders brand navigation items', () => {
        const usePathname = require('next/navigation').usePathname
        usePathname.mockReturnValue('/brand')

        render(<BottomNavigation items={brandNavConfig.items.slice(0, 5)} />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Clientes')).toBeInTheDocument()
        expect(screen.getByText('Productos')).toBeInTheDocument()
    })

    it('renders supervisor navigation items', () => {
        const usePathname = require('next/navigation').usePathname
        usePathname.mockReturnValue('/supervisor')

        render(<BottomNavigation items={supervisorNavConfig.items} />)

        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Equipo')).toBeInTheDocument()
        expect(screen.getByText('Clientes')).toBeInTheDocument()
    })

    it('limits to 5 items maximum', () => {
        render(<BottomNavigation items={brandNavConfig.items} />)

        const links = screen.getAllByRole('link')
        expect(links.length).toBeLessThanOrEqual(5)
    })

    it('highlights active route', () => {
        const usePathname = require('next/navigation').usePathname
        usePathname.mockReturnValue('/promotor')

        render(<BottomNavigation items={promotorNavConfig.items.slice(0, 5)} />)

        const homeLink = screen.getByText('Inicio').closest('a')
        expect(homeLink).toHaveClass('text-primary', 'bg-primary/5')
    })

    it('has correct styling for inactive items', () => {
        const usePathname = require('next/navigation').usePathname
        usePathname.mockReturnValue('/promotor')

        render(<BottomNavigation items={promotorNavConfig.items.slice(0, 5)} />)

        const visitsLink = screen.getByText('Visitas').closest('a')
        expect(visitsLink).toHaveClass('text-muted-foreground')
    })

    it('is fixed at bottom with correct z-index', () => {
        const { container } = render(<BottomNavigation items={promotorNavConfig.items.slice(0, 5)} />)

        const nav = container.querySelector('nav')
        expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'z-40')
    })

    it('is hidden on desktop (lg:hidden)', () => {
        const { container } = render(<BottomNavigation items={promotorNavConfig.items.slice(0, 5)} />)

        const nav = container.querySelector('nav')
        expect(nav).toHaveClass('lg:hidden')
    })

    it('renders icons for each nav item', () => {
        const { container } = render(<BottomNavigation items={promotorNavConfig.items.slice(0, 5)} />)

        const icons = container.querySelectorAll('svg')
        expect(icons.length).toBeGreaterThan(0)
    })
})
