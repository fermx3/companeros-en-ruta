'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { VisitList } from '@/components/visits/VisitList'
import { VisitFilters } from '@/components/visits/VisitFilters'
import { AsesorMetrics } from '@/components/visits/AsesorMetrics'
import { useMyVisits } from '@/hooks/useVisits'

export default function VisitasPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'pending' | 'in_progress' | 'completed',
    dateRange: 'today' as 'today' | 'week' | 'month'
  })

  const { visits, loading, error, metrics, refetch } = useMyVisits(filters)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <>
      {/* Header con métricas del asesor */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Asesor: {user.email?.split('@')[0]}
            </h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <AsesorMetrics metrics={metrics} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <VisitFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        <VisitList
          visits={visits}
          loading={loading}
          error={error}
          onRefresh={refetch}
        />
      </div>
    </>
  )
}
