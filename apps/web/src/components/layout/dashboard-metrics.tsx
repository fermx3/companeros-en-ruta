import React from 'react'
import { MetricCard, type MetricCardProps } from '@/components/ui/metric-card'
import { cn } from '@/lib/utils'

export interface DashboardMetricsProps {
    metrics: MetricCardProps[]
    className?: string
}

export function DashboardMetrics({ metrics, className }: DashboardMetricsProps) {
    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
            className
        )}>
            {metrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
            ))}
        </div>
    )
}
