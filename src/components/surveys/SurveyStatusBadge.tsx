'use client'

import React from 'react'
import type { SurveyStatusEnum } from '@/lib/types/database'

const STATUS_CONFIG: Record<SurveyStatusEnum, { label: string; className: string }> = {
  draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-700' },
  pending_approval: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Aprobada', className: 'bg-blue-100 text-blue-700' },
  active: { label: 'Activa', className: 'bg-green-100 text-green-700' },
  closed: { label: 'Cerrada', className: 'bg-red-100 text-red-700' },
  archived: { label: 'Archivada', className: 'bg-gray-100 text-gray-500' }
}

interface SurveyStatusBadgeProps {
  status: SurveyStatusEnum
}

export function SurveyStatusBadge({ status }: SurveyStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
