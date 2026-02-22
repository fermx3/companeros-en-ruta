'use client'

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  suspended: { label: 'Suspendido', className: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' }
}

export function MembershipStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}
