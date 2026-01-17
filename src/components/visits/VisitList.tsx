'use client'

import { useRouter } from 'next/navigation'

interface VisitListProps {
  visits: any[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export function VisitList({ visits, loading, error, onRefresh }: VisitListProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="flex justify-between items-start">
              <div>
                <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!visits.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">No hay visitas para mostrar</div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Actualizar
        </button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    }

    const labels = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <div
          key={visit.id}
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push(`/asesor/visitas/${visit.id}`)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {visit.client?.name || 'Cliente sin nombre'}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                {visit.client?.business_type || 'Tipo de negocio'} • {visit.client?.address || 'Sin dirección'}
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
      ))}
    </div>
  )
}
