'use client'

import { Card } from '@/components/ui/Card'

// ===========================================
// Types
// ===========================================

interface VisitClient {
  name?: string
  business_name?: string
  business_type: string
  address: string
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
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getClientName()}
            </h1>
            <p className="text-gray-600 mb-1">
              {visit.client?.business_type || 'Tipo de negocio'}
            </p>
            <p className="text-gray-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {visit.client?.address || 'Sin dirección'}
            </p>
          </div>
          <div className="text-right ml-4">
            {getStatusBadge(visit.status)}
            <div className="text-sm text-gray-600 mt-2">
              Marca: {visit.brand?.name || 'Sin marca'}
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
