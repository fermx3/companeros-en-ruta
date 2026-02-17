'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Star } from 'lucide-react'
import Link from 'next/link'

interface Visit {
  id: string
  visit_date: string
  visit_status: string
  client_satisfaction_rating: number | null
  promotor_id: string
  promotor_name: string
  client_name: string
}

interface TeamMember {
  id: string
  name: string
}

const visitStatusLabels: Record<string, string> = {
  planned: 'Planificada',
  scheduled: 'Agendada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const visitStatusColors: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const visitStatusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'planned', label: 'Planificada' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
]

export default function SupervisorVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [promotorFilter, setPromotorFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })

  const loadVisits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (promotorFilter) params.set('promotor_id', promotorFilter)
      if (dateFrom) params.set('date_from', dateFrom)
      if (dateTo) params.set('date_to', dateTo)
      params.set('page', String(pagination.page))

      const response = await fetch(`/api/supervisor/visits?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar visitas')
      }

      const data = await response.json()
      setVisits(data.visits)
      setPagination(data.pagination)
      if (data.team_members) {
        setTeamMembers(data.team_members)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, promotorFilter, dateFrom, dateTo, pagination.page])

  useEffect(() => {
    loadVisits()
  }, [loadVisits])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  if (loading && visits.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded-md w-48"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-gray-300 rounded-md w-40"></div>
            <div className="h-10 bg-gray-300 rounded-md w-40"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm h-96"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <h3 className="text-red-800 font-semibold">Error al cargar los datos</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button onClick={loadVisits} variant="outline" className="mt-4">
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/supervisor">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visitas del Equipo</h1>
              <p className="text-gray-600 text-sm">{pagination.total} visita{pagination.total !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {visitStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={promotorFilter}
              onChange={(e) => {
                setPromotorFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Todos los promotores</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Desde:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Hasta:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {(statusFilter || promotorFilter || dateFrom || dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('')
                  setPromotorFilter('')
                  setDateFrom('')
                  setDateTo('')
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="self-start"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Visits Table */}
          {visits.length > 0 ? (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promotor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {visits.map((visit) => (
                          <tr key={visit.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {visit.visit_date
                                ? new Date(visit.visit_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {visit.promotor_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {visit.client_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                visitStatusColors[visit.visit_status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {visitStatusLabels[visit.visit_status] || visit.visit_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {visit.client_satisfaction_rating ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span className="text-sm">{visit.client_satisfaction_rating}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin visitas</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusFilter || promotorFilter || dateFrom || dateTo
                      ? 'No se encontraron visitas con esos filtros.'
                      : 'No hay visitas registradas del equipo.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
