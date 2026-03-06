'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/ui/metric-card'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { EmptyState } from '@/components/ui/EmptyState'
import { VisitStatusBadge } from '@/components/ui/visit-status-badge'
import { MapPin, Clock, CheckCircle, Star } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ClickableCard } from '@/components/ui/clickable-card'

interface Visit {
  id: string
  public_id: string
  visit_date: string
  visit_status: string
  duration: number | null
  rating: number | null
  promotor_notes: string | null
  client_id: string
  client_name: string
  brand_name: string
  promotor_name: string
}

interface Summary {
  total: number
  active: number
  completed: number
  avg_rating: number
}

export default function AdminVisitsPage() {
  usePageTitle('Visitas')
  const [visits, setVisits] = useState<Visit[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, active: 0, completed: 0, avg_rating: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadVisits = async () => {
      setLoading(true)
      setError(null)
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(statusFilter && { status: statusFilter }),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(dateFrom && { date_from: dateFrom }),
          ...(dateTo && { date_to: dateTo }),
        })
        const response = await fetch(`/api/admin/visits?${queryParams}`, { signal: controller.signal })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar visitas')
        }
        const data = await response.json()
        setVisits(data.visits || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setSummary(data.summary || { total: 0, active: 0, completed: 0, avg_rating: 0 })
      } catch (err) {
        if (controller.signal.aborted) return
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        setError(msg)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadVisits()
    return () => controller.abort()
  }, [page, statusFilter, debouncedSearch, dateFrom, dateTo])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'scheduled', label: 'Programada' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
  ]

  if (loading && visits.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando visitas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/admin" className="text-gray-400 hover:text-gray-500">Admin</Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Visitas</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Visitas</h1>
              <p className="text-gray-600 mt-1">Todas las visitas del tenant</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Visitas"
            value={summary.total}
            icon={<MapPin className="h-6 w-6" />}
          />
          <MetricCard
            title="En Progreso"
            value={summary.active}
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />
          <MetricCard
            title="Completadas"
            value={summary.completed}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
          />
          <MetricCard
            title="Rating Promedio"
            value={summary.avg_rating > 0 ? summary.avg_rating.toFixed(1) : 'N/A'}
            icon={<Star className="h-6 w-6" />}
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cliente o promotor..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-2">
                  Desde
                </label>
                <input
                  type="date"
                  id="date-from"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => {
                    const val = e.target.value
                    setDateFrom(val)
                    if (dateTo && val > dateTo) setDateTo(val)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta
                </label>
                <input
                  type="date"
                  id="date-to"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => {
                    const val = e.target.value
                    setDateTo(val)
                    if (dateFrom && val < dateFrom) setDateFrom(val)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => { setSearchTerm(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1) }}
                  variant="outline"
                  className="w-full"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Visits List */}
        {visits.length === 0 && !loading ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="No hay visitas registradas"
            description={statusFilter || searchTerm || dateFrom
              ? 'No se encontraron visitas con los filtros aplicados.'
              : 'Aún no se han registrado visitas.'}
          />
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <ClickableCard key={visit.id} href={`/admin/visits/${visit.id}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-500">{visit.public_id}</span>
                          <VisitStatusBadge status={visit.visit_status} />
                          {visit.rating != null && (
                            <span className="inline-flex items-center text-sm text-yellow-600">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {visit.rating}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Fecha:</span>
                            <span className="ml-1 text-gray-900">{formatDate(visit.visit_date)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Cliente:</span>
                            <span className="ml-1 text-gray-900">{visit.client_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Marca:</span>
                            <span className="ml-1 text-gray-900">{visit.brand_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Promotor:</span>
                            <span className="ml-1 text-gray-900">{visit.promotor_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Duración:</span>
                            <span className="ml-1 text-gray-900">
                              {visit.duration ? `${visit.duration} min` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
              </ClickableCard>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-6">
                <Button onClick={() => setPage(page - 1)} disabled={page <= 1} variant="outline">
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <Button onClick={() => setPage(page + 1)} disabled={page >= totalPages} variant="outline">
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
