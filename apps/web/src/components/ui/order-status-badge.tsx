import React from 'react'
import { Clock, Package, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'processing'
  | 'processed'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<OrderStatus, { label: string; className: string; icon: React.ReactNode }> = {
  draft: {
    label: 'Borrador',
    className: 'bg-gray-100 text-gray-800',
    icon: <Clock className="h-3 w-3" />
  },
  submitted: {
    label: 'Enviado',
    className: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="h-3 w-3" />
  },
  confirmed: {
    label: 'Confirmado',
    className: 'bg-blue-100 text-blue-800',
    icon: <Package className="h-3 w-3" />
  },
  processing: {
    label: 'En Proceso',
    className: 'bg-indigo-100 text-indigo-800',
    icon: <Package className="h-3 w-3" />
  },
  processed: {
    label: 'Procesado',
    className: 'bg-indigo-100 text-indigo-800',
    icon: <Package className="h-3 w-3" />
  },
  shipped: {
    label: 'Enviado',
    className: 'bg-purple-100 text-purple-800',
    icon: <Package className="h-3 w-3" />
  },
  delivered: {
    label: 'Entregado',
    className: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-3 w-3" />
  },
  completed: {
    label: 'Completado',
    className: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-3 w-3" />
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-3 w-3" />
  }
}

const fallback = {
  label: '',
  className: 'bg-gray-100 text-gray-800',
  icon: <Package className="h-3 w-3" />
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status as OrderStatus] || { ...fallback, label: status }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
      config.className,
      className
    )}>
      {config.icon}
      {config.label}
    </span>
  )
}
