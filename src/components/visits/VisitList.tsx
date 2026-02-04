'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import type { Visit } from '@/lib/types/visits'

// ===========================================
// Types
// ===========================================

interface VisitListItem {
  id: string
  client_id: string
  visit_number: string
  visit_date: string
  status: 'draft' | 'pending' | 'in_progress' | 'completed'
  notes?: string | null
  client?: {
    id: string
    business_name: string
    owner_name?: string
    address_street?: string
    address_neighborhood?: string
  }
  brand?: {
    id: string
    name: string
  }
}

interface VisitListProps {
  /** Lista de visitas a mostrar */
  visits: VisitListItem[]
  /** Estado de carga */
  loading: boolean
  /** Mensaje de error si existe */
  error: string | null
  /** Callback para recargar datos */
  onRefresh: () => void
}

// ===========================================
// Component
// ===========================================

/**
 * Lista de visitas para asesores.
 * Muestra visitas con estados de carga, error y vacío.
 *
 * @example
 * <VisitList
 *   visits={visits}
 *   loading={loading}
 *   error={error}
 *   onRefresh={handleRefresh}
 * />
 */
export function VisitList({ visits, loading, error, onRefresh }: VisitListProps) {
  // ===========================================
  // Hooks
  // ===========================================

  const router = useRouter()

  // ===========================================
  // Utility Functions
  // ===========================================

  /**
   * Obtener badge de estado para visita
   */
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { style: string; label: string }> = {
      pending: { style: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      in_progress: { style: 'bg-blue-100 text-blue-800', label: 'En Progreso' },
      completed: { style: 'bg-green-100 text-green-800', label: 'Completada' },
    }

    const config = statusConfig[status] || { style: 'bg-gray-100 text-gray-800', label: status }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.style}`}>
        {config.label}
      </span>
    )
  }

  /**
   * Navegar a detalle de visita
   */
  const handleVisitClick = (visitId: string) => {
    router.push(`/asesor/visitas/${visitId}`)
  }

  // ===========================================
  // Render States
  // ===========================================

  // Estado de carga
  if (loading) {
    return <VisitListSkeleton />
  }

  // Estado de error
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Error: {error}
        </div>
        <Button onClick={onRefresh} className="bg-blue-600 hover:bg-blue-700">
          Reintentar
        </Button>
      </div>
    )
  }

  // Estado vacío
  if (!visits.length) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500 mb-4">No hay visitas para mostrar</p>
        <Button onClick={onRefresh} className="bg-blue-600 hover:bg-blue-700">
          Actualizar
        </Button>
      </div>
    )
  }

  // ===========================================
  // Main Render
  // ===========================================

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <Card
          key={visit.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleVisitClick(visit.id)}
          role="button"
          tabIndex={0}
          aria-label={`Ver detalles de visita a ${visit.client?.business_name || 'cliente'}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleVisitClick(visit.id)
            }
          }}
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {visit.client?.business_name || 'Cliente sin nombre'}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {[visit.client?.address_street, visit.client?.address_neighborhood].filter(Boolean).join(', ') || 'Sin dirección'}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(visit.visit_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Visita: {visit.visit_number}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(visit.status)}
                <div className="text-xs text-gray-500 mt-2">
                  {visit.brand?.name || 'Marca'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ===========================================
// Skeleton Component
// ===========================================

/**
 * Skeleton para estado de carga de la lista
 */
function VisitListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ===========================================
// Export skeleton for external use
// ===========================================

VisitList.Skeleton = VisitListSkeleton
