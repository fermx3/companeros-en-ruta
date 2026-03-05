'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/ui/metric-card'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { SurveyStatusBadge } from '@/components/surveys/SurveyStatusBadge'
import { Search, ClipboardList, Clock, BarChart3, Lock } from 'lucide-react'
import type { SurveyStatusEnum, SurveyTargetRoleEnum } from '@/lib/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'

interface AdminSurvey {
  id: string
  public_id: string
  title: string
  survey_status: SurveyStatusEnum
  target_roles: SurveyTargetRoleEnum[]
  start_date: string
  end_date: string
  created_at: string
  response_count: number
  brands: { name: string } | null
  creator: { first_name: string; last_name: string } | null
}

const ROLE_LABELS: Record<string, string> = {
  promotor: 'Promotor',
  asesor_de_ventas: 'Asesor de Ventas',
  client: 'Cliente'
}

export default function AdminSurveysPage() {
  usePageTitle('Encuestas')
  const [surveys, setSurveys] = useState<AdminSurvey[]>([])
  const [metrics, setMetrics] = useState<{ total: number; pending: number; active: number; closed: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: selectedStatus,
        search: debouncedSearch
      })
      const res = await fetch(`/api/admin/surveys?${params}`)
      if (!res.ok) throw new Error('Error al cargar encuestas')
      const data = await res.json()
      setSurveys(data.surveys || [])
      setMetrics(data.metrics || null)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [page, selectedStatus, debouncedSearch])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Encuestas</h1>
        <p className="text-sm text-gray-500">Gestión y aprobación de encuestas</p>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total"
            value={metrics.total}
            icon={<ClipboardList className="h-6 w-6" />}
          />
          <MetricCard
            title="Pendientes"
            value={metrics.pending}
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />
          <MetricCard
            title="Activas"
            value={metrics.active}
            icon={<BarChart3 className="h-6 w-6" />}
            variant="success"
          />
          <MetricCard
            title="Cerradas"
            value={metrics.closed}
            icon={<Lock className="h-6 w-6" />}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar encuestas..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1) }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="pending_approval">Pendientes</option>
              <option value="active">Activas</option>
              <option value="approved">Aprobadas</option>
              <option value="closed">Cerradas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <LoadingSpinner />
      ) : surveys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay encuestas</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Encuestas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Encuesta</th>
                    <th className="pb-3 font-medium">Marca</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Creada por</th>
                    <th className="pb-3 font-medium">Dirigida a</th>
                    <th className="pb-3 font-medium text-right">Respuestas</th>
                    <th className="pb-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {surveys.map((survey) => (
                    <tr key={survey.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{survey.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(survey.start_date).toLocaleDateString('es-MX')} - {new Date(survey.end_date).toLocaleDateString('es-MX')}
                        </p>
                      </td>
                      <td className="py-3 text-gray-600">
                        {survey.brands?.name || '-'}
                      </td>
                      <td className="py-3">
                        <SurveyStatusBadge status={survey.survey_status} />
                      </td>
                      <td className="py-3 text-gray-600">
                        {survey.creator ? `${survey.creator.first_name} ${survey.creator.last_name}` : '-'}
                      </td>
                      <td className="py-3 text-xs text-gray-600">
                        {survey.target_roles.map(r => ROLE_LABELS[r] || r).join(', ')}
                      </td>
                      <td className="py-3 text-right font-medium">{survey.response_count}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/surveys/${survey.public_id}`}>
                            <Button variant="outline" size="sm">
                              {survey.survey_status === 'pending_approval' ? 'Revisar' : 'Ver'}
                            </Button>
                          </Link>
                          {(survey.survey_status === 'active' || survey.survey_status === 'closed') && (
                            <Link href={`/admin/surveys/${survey.public_id}/results`}>
                              <Button variant="outline" size="sm">
                                <BarChart3 className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  Anterior
                </Button>
                <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
