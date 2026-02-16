'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { SurveyStatusBadge } from '@/components/surveys/SurveyStatusBadge'
import { Search, ClipboardList, Clock, BarChart3 } from 'lucide-react'
import type { SurveyStatusEnum, SurveyTargetRoleEnum } from '@/lib/types/database'

interface AdminSurvey {
  id: string
  public_id: string
  title: string
  survey_status: SurveyStatusEnum
  target_roles: SurveyTargetRoleEnum[]
  start_date: string
  end_date: string
  created_at: string
  brands: { name: string } | null
  creator: { first_name: string; last_name: string } | null
}

const ROLE_LABELS: Record<string, string> = {
  promotor: 'Promotor',
  asesor_de_ventas: 'Asesor de Ventas',
  client: 'Cliente'
}

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<AdminSurvey[]>([])
  const [metrics, setMetrics] = useState<{ total: number; pending: number; active: number; closed: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: selectedStatus,
        search: searchTerm
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
  }, [page, selectedStatus, searchTerm])

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
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-blue-600" />
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
                <Clock className="w-5 h-5 text-yellow-600" />
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
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{metrics.active}</p>
                  <p className="text-xs text-gray-500">Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div>
                <p className="text-2xl font-bold">{metrics.closed}</p>
                <p className="text-xs text-gray-500">Cerradas</p>
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="pending_approval">Pendientes</option>
              <option value="active">Activas</option>
              <option value="approved">Aprobadas</option>
              <option value="draft">Borrador</option>
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
                      <td className="py-3 text-right">
                        <Link href={`/admin/surveys/${survey.id}`}>
                          <Button variant="outline" size="sm">
                            {survey.survey_status === 'pending_approval' ? 'Revisar' : 'Ver'}
                          </Button>
                        </Link>
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
