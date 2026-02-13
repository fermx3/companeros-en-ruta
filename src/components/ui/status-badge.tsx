import React from 'react'
import { cn } from '@/lib/utils'
import type { StatusType, SizeType } from '@/types/ui'

export interface StatusBadgeProps {
    status: StatusType
    size?: SizeType
    className?: string
    children?: React.ReactNode
}

const statusVariants: Record<StatusType, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    expired: 'bg-gray-100 text-gray-700 border-gray-200'
}

const statusLabels: Record<StatusType, string> = {
    active: 'ACTIVO',
    pending: 'PENDIENTE',
    completed: 'COMPLETADO',
    cancelled: 'CANCELADO',
    expired: 'EXPIRADO'
}

const sizeVariants: Record<SizeType, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
}

export function StatusBadge({
    status,
    size = 'md',
    className,
    children
}: StatusBadgeProps) {
    return (
        <span className={cn(
            'inline-flex items-center border rounded-full font-medium',
            statusVariants[status],
            sizeVariants[size],
            className
        )}>
            {children || statusLabels[status]}
        </span>
    )
}
