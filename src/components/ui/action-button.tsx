import React from 'react'
import { Loader2 } from 'lucide-react'
import { Button, type ButtonProps } from './button'
import { cn } from '@/lib/utils'

export interface ActionButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    icon?: React.ReactNode
    loading?: boolean
    fullWidth?: boolean
}

export function ActionButton({
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    fullWidth,
    children,
    className,
    disabled,
    ...props
}: ActionButtonProps) {
    return (
        <Button
            className={cn(
                'rounded-xl font-medium transition-all duration-200',
                {
                    // Primary - Naranja del sistema
                    'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl': variant === 'primary',

                    // Secondary - Azul del sistema
                    'bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl': variant === 'secondary',

                    // Ghost - Para acciones sutiles
                    'bg-transparent hover:bg-muted border border-border text-foreground hover:text-foreground': variant === 'ghost',

                    // Destructive - Para acciones peligrosas
                    'bg-red-500 hover:bg-red-600 text-white': variant === 'destructive',

                    // Sizes
                    'h-8 px-3 text-sm': size === 'sm',
                    'h-10 px-4': size === 'md',
                    'h-12 px-6 text-lg': size === 'lg',
                    'h-10 w-10 p-0': size === 'icon',

                    // Full width
                    'w-full': fullWidth,

                    // Loading state
                    'opacity-50 cursor-not-allowed': loading || disabled
                },
                className
            )}
            disabled={loading || disabled}
            {...props}
        >
            <div className="flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {!loading && icon && <span className="shrink-0">{icon}</span>}
                {children && <span>{children}</span>}
            </div>
        </Button>
    )
}
