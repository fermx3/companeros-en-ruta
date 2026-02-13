import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from './Card'
import { cn } from '@/lib/utils'
import type { TrendType, VariantType } from '@/types/ui'

export interface MetricCardProps {
    title: string
    value: string | number
    change?: string
    trend?: TrendType
    icon?: React.ReactNode
    variant?: VariantType
    loading?: boolean
    error?: string | null
    className?: string
}

function MetricCardSkeleton() {
    return (
        <Card className="p-6 rounded-2xl border-0 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-8 bg-muted rounded w-32" />
                    <div className="h-4 bg-muted rounded w-16" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted" />
            </div>
        </Card>
    )
}

function MetricCardError({ error }: { error: string }) {
    return (
        <Card className="p-6 rounded-2xl border-0 shadow-sm border-destructive/50">
            <div className="text-sm text-destructive">
                Error: {error}
            </div>
        </Card>
    )
}

export function MetricCard({
    title,
    value,
    change,
    trend,
    icon,
    variant = 'default',
    loading,
    error,
    className
}: MetricCardProps) {
    // Handle loading state
    if (loading) return <MetricCardSkeleton />

    // Handle error state
    if (error) return <MetricCardError error={error} />

    return (
        <Card className={cn(
            "p-6 rounded-2xl border-0 shadow-sm transition-all duration-200 hover:shadow-md",
            {
                'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground': variant === 'primary',
                'bg-gradient-to-br from-green-500 to-green-600 text-white': variant === 'success',
                'bg-gradient-to-br from-amber-500 to-amber-600 text-white': variant === 'warning',
                'bg-card': variant === 'default'
            },
            className
        )}>
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <p className={cn(
                        "text-sm font-medium",
                        variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
                    )}>
                        {title}
                    </p>
                    <p className="text-3xl font-bold">{value}</p>
                    {change && (
                        <div className="flex items-center gap-1">
                            {trend === 'up' && <TrendingUp className="h-4 w-4" />}
                            {trend === 'down' && <TrendingDown className="h-4 w-4" />}
                            <span className="text-sm font-medium">{change}</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center",
                        variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-white/20'
                    )}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    )
}
