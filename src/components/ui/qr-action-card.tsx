import React from 'react'
import { Card } from './Card'
import { ActionButton } from './action-button'
import { cn } from '@/lib/utils'

export interface QRActionCardProps {
    title: string
    description: string
    icon: React.ReactNode
    onAction: () => void
    actionLabel: string
    disabled?: boolean
    className?: string
}

export function QRActionCard({
    title,
    description,
    icon,
    onAction,
    actionLabel,
    disabled,
    className
}: QRActionCardProps) {
    return (
        <Card className={cn(
            "p-4 rounded-2xl border-0 shadow-sm bg-white hover:shadow-md transition-shadow",
            className
        )}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-600 truncate">{description}</p>
                    </div>
                </div>
                <ActionButton
                    variant="primary"
                    size="sm"
                    onClick={onAction}
                    disabled={disabled}
                    className="shrink-0"
                >
                    {actionLabel}
                </ActionButton>
            </div>
        </Card>
    )
}
