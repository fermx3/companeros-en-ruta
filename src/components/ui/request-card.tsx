import React from 'react'
import { Tag, Percent, MapPin } from 'lucide-react'
import { Card } from './Card'
import { StatusBadge } from './status-badge'
import { ActionButton } from './action-button'
import { cn } from '@/lib/utils'
import type { RequestType, StatusType } from '@/types/ui'

export interface RequestCardProps {
    id: string
    title: string
    description: string
    type: RequestType
    timeAgo: string
    status: StatusType
    onApprove: () => void
    onReject: () => void
    className?: string
}

const typeIcons: Record<RequestType, React.ReactNode> = {
    campaign: <Tag className="h-5 w-5" />,
    promotion: <Percent className="h-5 w-5" />,
    visit: <MapPin className="h-5 w-5" />
}

export function RequestCard({
    title,
    description,
    type,
    timeAgo,
    status,
    onApprove,
    onReject,
    className
}: RequestCardProps) {
    return (
        <Card className={cn("p-4 rounded-2xl space-y-4", className)}>
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    {typeIcons[type]}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                    <h4 className="font-semibold">{title}</h4>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{timeAgo}</span>
                        <StatusBadge status={status} size="sm" />
                    </div>
                </div>
            </div>

            {status === 'pending' && (
                <div className="flex gap-2">
                    <ActionButton
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={onReject}
                    >
                        Rechazar
                    </ActionButton>
                    <ActionButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={onApprove}
                    >
                        Aprobar
                    </ActionButton>
                </div>
            )}
        </Card>
    )
}
