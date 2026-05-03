import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background'

    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md hover:shadow-lg',
      outline: 'border-2 border-border bg-card hover:bg-muted',
      ghost: 'hover:bg-muted hover:text-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md'
    }

    const sizes = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 text-xs',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10'
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
