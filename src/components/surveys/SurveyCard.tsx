'use client'

import React from 'react'
import Link from 'next/link'
import { SurveyStatusBadge } from './SurveyStatusBadge'
import { Calendar, Users, ClipboardList } from 'lucide-react'
import type { SurveyStatusEnum, SurveyTargetRoleEnum } from '@/lib/types/database'

const ROLE_LABELS: Record<string, string> = {
  promotor: 'Promotor',
  asesor_de_ventas: 'Asesor de Ventas',
  client: 'Cliente'
}

interface SurveyCardProps {
  survey: {
    id: string
    public_id: string
    title: string
    description?: string | null
    survey_status: SurveyStatusEnum
    target_roles: SurveyTargetRoleEnum[]
    start_date: string
    end_date: string
    response_count?: number
    brands?: { name: string } | null
    has_responded?: boolean
  }
  href: string
  showBrand?: boolean
  showResponseCount?: boolean
}

export function SurveyCard({ survey, href, showBrand = false, showResponseCount = false }: SurveyCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{survey.title}</h3>
          {showBrand && survey.brands && (
            <p className="text-xs text-gray-500 mt-0.5">{survey.brands.name}</p>
          )}
        </div>
        <SurveyStatusBadge status={survey.survey_status} />
      </div>

      {survey.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{survey.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(survey.start_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })} - {new Date(survey.end_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
        </span>

        <span className="flex items-center gap-1">
          <ClipboardList className="w-3.5 h-3.5" />
          {survey.target_roles.map(r => ROLE_LABELS[r] || r).join(', ')}
        </span>

        {showResponseCount && survey.response_count !== undefined && (
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {survey.response_count} resp.
          </span>
        )}
      </div>

      {survey.has_responded !== undefined && (
        <div className="mt-2">
          {survey.has_responded ? (
            <span className="text-xs text-green-600 font-medium">Respondida</span>
          ) : (
            <span className="text-xs text-blue-600 font-medium">Pendiente de responder</span>
          )}
        </div>
      )}
    </Link>
  )
}
