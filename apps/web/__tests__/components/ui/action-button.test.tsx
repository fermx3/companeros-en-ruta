import { render, screen, fireEvent } from '@testing-library/react'
import { ActionButton } from '@/components/ui/action-button'
import { Camera } from 'lucide-react'

describe('ActionButton', () => {
    it('renders button with children text', () => {
        render(<ActionButton>Click Me</ActionButton>)

        expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('renders primary variant by default', () => {
        const { container } = render(<ActionButton>Primary</ActionButton>)

        const button = screen.getByText('Primary').closest('button')
        expect(button).toHaveClass('bg-primary', 'hover:bg-primary/90')
    })

    it('renders secondary variant', () => {
        const { container } = render(
            <ActionButton variant="secondary">Secondary</ActionButton>
        )

        const button = screen.getByText('Secondary').closest('button')
        expect(button).toHaveClass('bg-secondary', 'hover:bg-secondary/90')
    })

    it('renders ghost variant', () => {
        const { container } = render(
            <ActionButton variant="ghost">Ghost</ActionButton>
        )

        const button = screen.getByText('Ghost').closest('button')
        expect(button).toHaveClass('bg-transparent', 'hover:bg-muted')
    })

    it('renders destructive variant', () => {
        const { container } = render(
            <ActionButton variant="destructive">Delete</ActionButton>
        )

        const button = screen.getByText('Delete').closest('button')
        expect(button).toHaveClass('bg-red-500', 'hover:bg-red-600')
    })

    it('renders small size', () => {
        render(<ActionButton size="sm">Small</ActionButton>)

        const button = screen.getByText('Small').closest('button')
        expect(button).toHaveClass('h-8', 'px-3', 'text-sm')
    })

    it('renders medium size (default)', () => {
        render(<ActionButton size="md">Medium</ActionButton>)

        const button = screen.getByText('Medium').closest('button')
        expect(button).toHaveClass('h-10', 'px-4')
    })

    it('renders large size', () => {
        render(<ActionButton size="lg">Large</ActionButton>)

        const button = screen.getByText('Large').closest('button')
        expect(button).toHaveClass('h-12', 'px-6', 'text-lg')
    })

    it('renders icon size', () => {
        render(
            <ActionButton size="icon" icon={<Camera data-testid="camera-icon" />} />
        )

        const button = screen.getByTestId('camera-icon').closest('button')
        expect(button).toHaveClass('h-10', 'w-10', 'p-0')
    })

    it('renders with icon', () => {
        render(
            <ActionButton icon={<Camera data-testid="camera-icon" />}>
                Take Photo
            </ActionButton>
        )

        expect(screen.getByTestId('camera-icon')).toBeInTheDocument()
        expect(screen.getByText('Take Photo')).toBeInTheDocument()
    })

    it('renders loading state with spinner', () => {
        render(<ActionButton loading>Loading</ActionButton>)

        const button = screen.getByText('Loading').closest('button')
        expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
        expect(button).toBeDisabled()

        // Check for spinner (Loader2 icon with animate-spin)
        const spinner = button?.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
    })

    it('hides icon when loading', () => {
        render(
            <ActionButton loading icon={<Camera data-testid="camera-icon" />}>
                Loading
            </ActionButton>
        )

        expect(screen.queryByTestId('camera-icon')).not.toBeInTheDocument()
    })

    it('renders full width', () => {
        render(<ActionButton fullWidth>Full Width</ActionButton>)

        const button = screen.getByText('Full Width').closest('button')
        expect(button).toHaveClass('w-full')
    })

    it('handles click events', () => {
        const handleClick = jest.fn()
        render(<ActionButton onClick={handleClick}>Click</ActionButton>)

        fireEvent.click(screen.getByText('Click'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not fire click when disabled', () => {
        const handleClick = jest.fn()
        render(
            <ActionButton onClick={handleClick} disabled>
                Disabled
            </ActionButton>
        )

        const button = screen.getByText('Disabled')
        fireEvent.click(button)
        expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not fire click when loading', () => {
        const handleClick = jest.fn()
        render(
            <ActionButton onClick={handleClick} loading>
                Loading
            </ActionButton>
        )

        const button = screen.getByText('Loading')
        fireEvent.click(button)
        expect(handleClick).not.toHaveBeenCalled()
    })

    it('applies custom className', () => {
        render(<ActionButton className="custom-btn">Custom</ActionButton>)

        const button = screen.getByText('Custom').closest('button')
        expect(button).toHaveClass('custom-btn')
    })

    it('has rounded-xl styling', () => {
        render(<ActionButton>Rounded</ActionButton>)

        const button = screen.getByText('Rounded').closest('button')
        expect(button).toHaveClass('rounded-xl')
    })
})
