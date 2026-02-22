'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { SurveyStatusBadge } from '@/components/surveys/SurveyStatusBadge'
import { Plus, Search, ClipboardList, BarChart3, Clock, Users } from 'lucide-react'
import { ExportButton } from '@/components/ui/export-button'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { SurveyStatusEnum, SurveyTargetRoleEnum } from '@/lib/types/database'

interface SurveyListItem {
  id: string
  public_id: string
  title: string
  description: string | null
  survey_status: SurveyStatusEnum
  target_roles: SurveyTargetRoleEnum[]
  start_date: string
  end_date: string
  response_count: number
  created_at: string
  brands: { name: string } | null
}

interface Metrics {
  total: number
  active: number
  pending: number
  draft: number
  totalResponses: number
}

const ROLE_LABELS: Record<string, string> = {
  promotor: 'Promotor',
  asesor_de_ventas: 'Asesor de Ventas',
  client: 'Cliente'
}

export default function BrandSurveysPage() {
  usePageTitle('Encuestas')
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [surveys, setSurveys] = useState<SurveyListItem[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    if (!currentBrandId) return

    const controller = new AbortController()

    const fetchSurveys = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          status: selectedStatus,
          search: searchTerm
        })

        const res = await brandFetch(`/api/brand/surveys?${params}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Error al cargar encuestas')

        const data = await res.json()
        setSurveys(data.surveys || [])
        setMetrics(data.metrics || null)
        setTotalPages(data.pagination?.totalPages || 1)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchSurveys()
    return () => controller.abort()
  }, [page, selectedStatus, searchTerm, brandFetch, currentBrandId])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Encuestas</h1>
          <p className="text-sm text-gray-500">Gestiona tus encuestas y visualiza resultados</p>
        </div>
        <div className="flex space-x-3">
          <ExportButton
            endpoint="/api/brand/surveys/export"
            filename="encuestas"
            filters={{ search: searchTerm, status: selectedStatus }}
          />
          <Link href="/brand/surveys/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Nueva Encuesta
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.active}</p>
                  <p className="text-xs text-gray-500">Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.pending}</p>
                  <p className="text-xs text-gray-500">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.totalResponses}</p>
                  <p className="text-xs text-gray-500">Respuestas</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="pending_approval">Pendiente</option>
              <option value="approved">Aprobada</option>
              <option value="active">Activa</option>
              <option value="closed">Cerrada</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <LoadingSpinner />
      ) : surveys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay encuestas</h3>
            <p className="text-sm text-gray-500 mb-4">Crea tu primera encuesta para comenzar</p>
            <Link href="/brand/surveys/create">
              <Button><Plus className="w-4 h-4 mr-2" /> Nueva Encuesta</Button>
            </Link>
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
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Dirigida a</th>
                    <th className="pb-3 font-medium">Vigencia</th>
                    <th className="pb-3 font-medium text-right">Respuestas</th>
                    <th className="pb-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {surveys.map((survey) => (
                    <tr key={survey.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{survey.title}</p>
                        <p className="text-xs text-gray-500">{survey.public_id}</p>
                      </td>
                      <td className="py-3">
                        <SurveyStatusBadge status={survey.survey_status} />
                      </td>
                      <td className="py-3 text-xs text-gray-600">
                        {survey.target_roles.map(r => ROLE_LABELS[r] || r).join(', ')}
                      </td>
                      <td className="py-3 text-xs text-gray-600">
                        {new Date(survey.start_date).toLocaleDateString('es-MX')} - {new Date(survey.end_date).toLocaleDateString('es-MX')}
                      </td>
                      <td className="py-3 text-right font-medium">{survey.response_count}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/brand/surveys/${survey.public_id}`}>
                            <Button variant="outline" size="sm">Ver</Button>
                          </Link>
                          {(survey.survey_status === 'active' || survey.survey_status === 'closed') && (
                            <Link href={`/brand/surveys/${survey.public_id}/results`}>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
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
