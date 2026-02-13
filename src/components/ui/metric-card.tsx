import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from './Card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
    title: string
    value: string | number
    change?: string
    trend?: 'up' | 'down' | 'neutral'
    icon?: React.ReactNode
    variant?: 'default' | 'primary' | 'success' | 'warning'
    className?: string
}

export function MetricCard({
    title,
    value,
    change,
    trend,
    icon,
    variant = 'default',
    className
}: MetricCardProps) {
    return (
        <Card className={cn(
            "p-6 rounded-2xl border-0 shadow-sm",
            {
                'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground': variant === 'primary',
                'bg-gradient-to-br from-green-500 to-green-600 text-white': variant === 'success',
                'bg-gradient-to-br from-amber-500 to-amber-600 text-white': variant === 'warning'
            },
            className
        )}>
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <p className={cn(
                        "text-sm font-medium",
                        variant === 'default' ? 'text-gray-500' : 'opacity-80'
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
                        variant === 'default' ? 'bg-gray-100' : 'bg-white/20'
                    )}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    )
}
