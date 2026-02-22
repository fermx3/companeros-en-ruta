'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { VisitList } from '@/components/visits/VisitList'
import { VisitFilters } from '@/components/visits/VisitFilters'
import { PromotorMetrics } from '@/components/visits/PromotorMetrics'
import { useMyVisits } from '@/hooks/useVisits'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function VisitasPage() {
  usePageTitle('Mis Visitas')
  // Role protection is handled by the layout (promotor/layout.tsx)
  const router = useRouter()
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'no_show',
    dateRange: 'month' as 'today' | 'week' | 'month'
  })
  const [promotorName, setPromotorName] = useState<string | null>(null)

  const { visits, loading, error, metrics, refetch } = useMyVisits(filters)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/promotor/profile')
        if (response.ok) {
          const data = await response.json()
          setPromotorName(data.full_name || null)
        }
      } catch {
        // Silently fail, will use email fallback
      }
    }
    if (user) {
      fetchProfile()
    }
  }, [user])

  return (
    <>
      {/* Header con métricas del promotor */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Promotor: {promotorName || user?.email?.split('@')[0]}
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
            <Button
              onClick={() => router.push('/promotor/visitas/nueva')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Visita
            </Button>
          </div>

          <PromotorMetrics metrics={metrics} />
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
