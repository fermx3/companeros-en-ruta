import React from 'react'
import { cn } from '@/lib/utils'

type VisitStatus =
  | 'planned'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'missed'
  | 'no_show'

interface VisitStatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<VisitStatus, { label: string; className: string }> = {
  planned: {
    label: 'Planificada',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  scheduled: {
    label: 'Programada',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  in_progress: {
    label: 'En Progreso',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  completed: {
    label: 'Completada',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  missed: {
    label: 'No Realizada',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  no_show: {
    label: 'No Presentado',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
}

const fallback = {
  label: '',
  className: 'bg-gray-100 text-gray-800 border-gray-200',
}

export function VisitStatusBadge({ status, className }: VisitStatusBadgeProps) {
  const config = statusConfig[status as VisitStatus] || { ...fallback, label: status }

  return (
    <span className={cn(
      'inline-flex items-center border px-2 py-1 text-xs font-medium rounded-full',
      config.className,
      className
    )}>
      {config.label}
    </span>
  )
}
