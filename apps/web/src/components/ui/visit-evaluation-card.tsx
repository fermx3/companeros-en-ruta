import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Card } from './Card'
import { StatusBadge } from './status-badge'
import { cn } from '@/lib/utils'

export interface EvaluationItem {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    status: 'pending' | 'completed'
    onPress: () => void
}

export interface VisitEvaluationCardProps {
    items: EvaluationItem[]
    pendingCount: number
    className?: string
}

export function VisitEvaluationCard({
    items,
    pendingCount,
    className
}: VisitEvaluationCardProps) {
    return (
        <Card className={cn("p-6 rounded-2xl space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">EVALUACIÓN DE VISITA</h3>
                {pendingCount > 0 && (
                    <StatusBadge status="pending" size="sm">
                        {pendingCount} Pendientes
                    </StatusBadge>
                )}
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={item.onPress}
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                ))}
            </div>
        </Card>
    )
}
