'use client'

interface VisitHeaderProps {
  visit: {
    client?: {
      name: string
      business_type: string
      address: string
    }
    brand?: {
      name: string
    }
    visit_number: string
    visit_date: string
    status: string
  }
}

export function VisitHeader({ visit }: VisitHeaderProps) {
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {visit.client?.name || 'Cliente sin nombre'}
          </h1>
          <p className="text-gray-600 mb-1">
            {visit.client?.business_type || 'Tipo de negocio'}
          </p>
          <p className="text-gray-500 text-sm">
            📍 {visit.client?.address || 'Sin dirección'}
          </p>
        </div>
        <div className="text-right">
          {getStatusBadge(visit.status)}
          <div className="text-sm text-gray-600 mt-2">
            Marca: {visit.brand?.name || 'Sin marca'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <span className="text-sm font-medium text-gray-500">Número de visita</span>
          <p className="text-sm text-gray-900">{visit.visit_number}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Fecha programada</span>
          <p className="text-sm text-gray-900">
            {new Date(visit.visit_date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
