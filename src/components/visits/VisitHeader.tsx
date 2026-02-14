'use client'

import { Card } from '@/components/ui/Card'

// ===========================================
// Types
// ===========================================

interface VisitClient {
  name?: string
  business_name?: string
  owner_name?: string
  address_street?: string
  address_neighborhood?: string
}

interface VisitBrand {
  name: string
}

interface Visit {
  client?: VisitClient
  brand?: VisitBrand
  visit_number: string
  visit_date: string
  status: string
}

interface VisitHeaderProps {
  /** Datos de la visita */
  visit: Visit
}

// ===========================================
// Component
// ===========================================

/**
 * Header con información principal de una visita.
 * Muestra cliente, estado, marca y detalles de la visita.
 *
 * @example
 * <VisitHeader visit={visit} />
 */
export function VisitHeader({ visit }: VisitHeaderProps) {
  // ===========================================
  // Utility Functions
  // ===========================================

  /**
   * Obtener badge de estado para la visita
   */
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { style: string; label: string }> = {
      pending: { style: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      in_progress: { style: 'bg-blue-100 text-blue-800', label: 'En Progreso' },
      completed: { style: 'bg-green-100 text-green-800', label: 'Completada' },
    }

    const config = statusConfig[status] || { style: 'bg-gray-100 text-gray-800', label: status }

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.style}`}>
        {config.label}
      </span>
    )
  }

  /**
   * Obtener nombre del cliente (prioriza name sobre business_name)
   */
  const getClientName = () => {
    return visit.client?.name || visit.client?.business_name || 'Cliente sin nombre'
  }

  /**
   * Formatear fecha de visita
   */
  const formatVisitDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // ===========================================
  // Main Render
  // ===========================================

  return (
    <Card>
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 space-y-3">
            {/* Business Name */}
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {getClientName()}
                </h1>
              </div>
            </div>

            {/* Owner Name & Address in a compact grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
              {visit.client?.owner_name && (
                <div className="flex items-center gap-1.5 text-sm">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700 font-medium truncate">{visit.client.owner_name}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-sm">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-600 truncate">
                  {[visit.client?.address_street, visit.client?.address_neighborhood].filter(Boolean).join(', ') || 'Sin dirección'}
                </span>
              </div>
            </div>
          </div>

          {/* Status & Brand Badge */}
          <div className="flex flex-col items-end gap-2 ml-4">
            {getStatusBadge(visit.status)}
            <div className="flex items-center gap-1.5 text-sm bg-blue-50 px-3 py-1.5 rounded-md">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-blue-700 font-medium">{visit.brand?.name || 'Sin marca'}</span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <span className="text-sm font-medium text-gray-500">Número de visita</span>
            <p className="text-sm text-gray-900 font-mono">{visit.visit_number}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Fecha programada</span>
            <p className="text-sm text-gray-900">
              {formatVisitDate(visit.visit_date)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
