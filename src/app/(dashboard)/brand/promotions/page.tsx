'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback'
import { Gift, Plus, Search, Calendar, DollarSign, Users, TrendingUp, Pause, Play, Eye, Edit } from 'lucide-react'
import { ExportButton } from '@/components/ui/export-button'
import { usePageTitle } from '@/hooks/usePageTitle'

interface Promotion {
  id: string
  public_id: string
  name: string
  description: string | null
  promotion_type: string
  promotion_type_label: string
  status: string
  status_label: string
  start_date: string
  end_date: string
  discount_percentage: number | null
  discount_amount: number | null
  buy_quantity: number | null
  get_quantity: number | null
  points_multiplier: number | null
  usage_limit_total: number | null
  usage_count_total: number
  budget_allocated: number | null
  budget_spent: number | null
  created_at: string
}

interface Metrics {
  total: number
  active: number
  pending: number
  draft: number
  totalBudget: number
  spentBudget: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const STATUS_COLORS: Record<string, 'active' | 'inactive' | 'pending' | 'suspended'> = {
  draft: 'inactive',
  pending_approval: 'pending',
  approved: 'active',
  active: 'active',
  paused: 'suspended',
  completed: 'inactive',
  cancelled: 'inactive'
}

const PROMOTION_TYPE_ICONS: Record<string, string> = {
  discount_percentage: '%',
  discount_amount: '$',
  buy_x_get_y: '2x1',
  free_product: 'FREE',
  volume_discount: 'VOL',
  tier_bonus: 'TIER',
  cashback: 'CB',
  points_multiplier: 'x2'
}

export default function BrandPromotionsPage() {
  usePageTitle('Promociones')
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!currentBrandId) return

    const controller = new AbortController()

    const loadPromotions = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(searchTerm && { search: searchTerm }),
          ...(selectedStatus !== 'all' && { status: selectedStatus })
        })

        const response = await brandFetch(`/api/brand/promotions?${params}`, { signal: controller.signal })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar promociones')
        }

        const data = await response.json()
        setPromotions(data.promotions || [])
        setMetrics(data.metrics || null)
        setPagination(data.pagination || null)

      } catch (err) {
        if (controller.signal.aborted) return
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(`Error al cargar promociones: ${errorMessage}`)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadPromotions()
    return () => controller.abort()
  }, [page, searchTerm, selectedStatus, brandFetch, currentBrandId, refreshKey])

  const handlePauseResume = async (promotionId: string, currentStatus: string) => {
    setActionLoading(promotionId)
    try {
      const action = currentStatus === 'active' ? { pause: true } : { resume: true }
      const response = await brandFetch(`/api/brand/promotions/${promotionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar promoción')
      }

      setRefreshKey(k => k + 1)
    } catch (err) {
      console.error('Error updating promotion:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSubmitForApproval = async (promotionId: string) => {
    setActionLoading(promotionId)
    try {
      const response = await brandFetch(`/api/brand/promotions/${promotionId}/submit`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al enviar promoción')
      }

      setRefreshKey(k => k + 1)
    } catch (err) {
      console.error('Error submitting promotion:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'pending_approval', label: 'Pendiente de aprobación' },
    { value: 'approved', label: 'Aprobada' },
    { value: 'active', label: 'Activa' },
    { value: 'paused', label: 'Pausada' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPromotionValue = (promo: Promotion): string => {
    if (promo.discount_percentage) return `${promo.discount_percentage}%`
    if (promo.discount_amount) return `$${promo.discount_amount}`
    if (promo.buy_quantity && promo.get_quantity) return `${promo.buy_quantity}x${promo.get_quantity}`
    if (promo.points_multiplier) return `x${promo.points_multiplier}`
    return '-'
  }

  if (loading && promotions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando promociones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-6">
            <div className="min-w-0">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/brand" className="text-gray-400 hover:text-gray-500">
                      Marca
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Promociones</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Gestión de Promociones
              </h1>
              <p className="text-gray-600 mt-1">
                Crea y administra las promociones de tu marca
              </p>
            </div>
            <div className="flex space-x-3 shrink-0">
              <ExportButton
                endpoint="/api/brand/promotions/export"
                filename="promociones"
                filters={{ search: searchTerm, status: selectedStatus }}
              />
              <Link href="/brand/promotions/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Promoción
                </Button>
              </Link>
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

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Promociones</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Gift className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Activas</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.active}</p>
                  </div>
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics.pending}</p>
                  </div>
                  <div className="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Presupuesto Usado</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(metrics.spentBudget || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      de ${(metrics.totalBudget || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar promoción
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre o código..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                    setPage(1)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Promotions List */}
        {promotions.length === 0 && !loading ? (
          <EmptyState
            icon={<Gift className="w-16 h-16" />}
            title="No hay promociones"
            description={
              searchTerm || selectedStatus !== 'all'
                ? "No se encontraron promociones con los filtros aplicados."
                : "Crea tu primera promoción para empezar a atraer más clientes."
            }
            action={
              <Link href="/brand/promotions/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Promoción
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {promotions.map((promo) => (
              <Card key={promo.id} className="hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Type Icon */}
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-blue-600">
                        {PROMOTION_TYPE_ICONS[promo.promotion_type] || 'P'}
                      </span>
                    </div>

                    {/* Info + Actions */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                              {promo.name}
                            </h3>
                            <StatusBadge
                              status={STATUS_COLORS[promo.status] || 'inactive'}
                              size="sm"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {promo.public_id} • {promo.promotion_type_label}
                          </p>
                        </div>

                        {/* Desktop actions */}
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                          {promo.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSubmitForApproval(promo.id)}
                              disabled={actionLoading === promo.id}
                            >
                              {actionLoading === promo.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                'Enviar a Aprobación'
                              )}
                            </Button>
                          )}
                          {promo.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePauseResume(promo.id, promo.status)}
                              disabled={actionLoading === promo.id}
                            >
                              {actionLoading === promo.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <Pause className="h-4 w-4 mr-1" />
                                  Pausar
                                </>
                              )}
                            </Button>
                          )}
                          {promo.status === 'paused' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePauseResume(promo.id, promo.status)}
                              disabled={actionLoading === promo.id}
                            >
                              {actionLoading === promo.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Reanudar
                                </>
                              )}
                            </Button>
                          )}
                          <Link href={`/brand/promotions/${promo.public_id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          {['draft', 'approved'].includes(promo.status) && (
                            <Link href={`/brand/promotions/${promo.public_id}/edit`}>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      {promo.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {promo.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 shrink-0" />
                          {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                        </span>
                        <span className="flex items-center font-medium text-blue-600">
                          Valor: {getPromotionValue(promo)}
                        </span>
                        {promo.usage_limit_total && (
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1 shrink-0" />
                            {promo.usage_count_total}/{promo.usage_limit_total} usos
                          </span>
                        )}
                      </div>

                      {/* Mobile actions */}
                      <div className="flex sm:hidden flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                        {promo.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSubmitForApproval(promo.id)}
                            disabled={actionLoading === promo.id}
                          >
                            {actionLoading === promo.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              'Enviar a Aprobación'
                            )}
                          </Button>
                        )}
                        {promo.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseResume(promo.id, promo.status)}
                            disabled={actionLoading === promo.id}
                          >
                            {actionLoading === promo.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Pause className="h-4 w-4 mr-1" />
                                Pausar
                              </>
                            )}
                          </Button>
                        )}
                        {promo.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseResume(promo.id, promo.status)}
                            disabled={actionLoading === promo.id}
                          >
                            {actionLoading === promo.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Reanudar
                              </>
                            )}
                          </Button>
                        )}
                        <Link href={`/brand/promotions/${promo.public_id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        {['draft', 'approved'].includes(promo.status) && (
                          <Link href={`/brand/promotions/${promo.public_id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-6">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  variant="outline"
                >
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
