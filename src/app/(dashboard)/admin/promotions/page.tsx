'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback'
import { Gift, Search, Calendar, Clock, Check, X, Eye, Building2, AlertCircle } from 'lucide-react'

interface Brand {
  id: string
  name: string
  logo_url: string | null
  brand_color_primary: string | null
}

interface Creator {
  id: string
  full_name: string
  email: string
}

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
  budget_allocated: number | null
  created_at: string
  brands: Brand
  user_profiles: Creator | null
}

interface Metrics {
  total: number
  pending_approval: number
  approved: number
  active: number
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

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('pending_approval')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const loadPromotions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: selectedStatus,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedBrand && { brand_id: selectedBrand })
      })

      const response = await fetch(`/api/admin/promotions?${params}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar promociones')
      }

      const data = await response.json()
      setPromotions(data.promotions || [])
      setMetrics(data.metrics || null)
      setBrands(data.brands || [])
      setPagination(data.pagination || null)

    } catch (err) {
      console.error('Error loading promotions:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar promociones: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, selectedStatus, selectedBrand])

  useEffect(() => {
    loadPromotions()
  }, [loadPromotions])

  const handleApprove = async (promotionId: string) => {
    setActionLoading(promotionId)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/promotions/${promotionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al aprobar promoción')
      }

      const data = await response.json()
      setSuccess(data.message)
      await loadPromotions()
    } catch (err) {
      console.error('Error approving promotion:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (promotionId: string) => {
    if (!rejectReason.trim()) {
      setError('Debes proporcionar un motivo de rechazo')
      return
    }

    setActionLoading(promotionId)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/promotions/${promotionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: rejectReason })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al rechazar promoción')
      }

      const data = await response.json()
      setSuccess(data.message)
      setRejectingId(null)
      setRejectReason('')
      await loadPromotions()
    } catch (err) {
      console.error('Error rejecting promotion:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const statusOptions = [
    { value: 'pending_approval', label: 'Pendientes de aprobación' },
    { value: 'all', label: 'Todos los estados' },
    { value: 'approved', label: 'Aprobadas' },
    { value: 'active', label: 'Activas' },
    { value: 'cancelled', label: 'Canceladas' }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'hace menos de 1 hora'
    if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
    return formatDate(dateString)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                      Admin
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
                Aprobación de Promociones
              </h1>
              <p className="text-gray-600 mt-1">
                Revisa y aprueba las promociones de las marcas
              </p>
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

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className={selectedStatus === 'pending_approval' ? 'ring-2 ring-yellow-500' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics.pending_approval}</p>
                  </div>
                  <div className="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.approved}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Check className="h-5 w-5 text-blue-600" />
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
                    <Gift className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
                  </div>
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Gift className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
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

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  id="brand"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las marcas</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('pending_approval')
                    setSelectedBrand('')
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
            title={selectedStatus === 'pending_approval' ? 'No hay promociones pendientes' : 'No hay promociones'}
            description={
              selectedStatus === 'pending_approval'
                ? "No hay promociones esperando aprobación en este momento."
                : "No se encontraron promociones con los filtros aplicados."
            }
          />
        ) : (
          <div className="space-y-4">
            {promotions.map((promo) => (
              <Card key={promo.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Brand Logo */}
                      <div className="flex-shrink-0">
                        {promo.brands?.logo_url ? (
                          <Image
                            src={promo.brands.logo_url}
                            alt={promo.brands.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-contain rounded-lg"
                          />
                        ) : (
                          <div
                            className="h-12 w-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: promo.brands?.brand_color_primary || '#3B82F6' }}
                          >
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {promo.name}
                          </h3>
                          <StatusBadge
                            status={STATUS_COLORS[promo.status] || 'inactive'}
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          {promo.brands?.name} • {promo.public_id} • {promo.promotion_type_label}
                        </p>
                        {promo.description && (
                          <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                            {promo.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                          </span>
                          <span className="font-medium text-blue-600">
                            Valor: {getPromotionValue(promo)}
                          </span>
                          {promo.status === 'pending_approval' && (
                            <span className="flex items-center text-yellow-600">
                              <Clock className="h-4 w-4 mr-1" />
                              Enviada {formatRelativeTime(promo.created_at)}
                            </span>
                          )}
                        </div>
                        {promo.user_profiles && (
                          <p className="text-xs text-gray-500 mt-2">
                            Creada por: {promo.user_profiles.full_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/promotions/${promo.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </Link>
                      </div>

                      {promo.status === 'pending_approval' && (
                        <div className="flex items-center space-x-2">
                          {rejectingId === promo.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Motivo de rechazo..."
                                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(promo.id)}
                                disabled={actionLoading === promo.id}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                {actionLoading === promo.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  'Confirmar'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectingId(null)
                                  setRejectReason('')
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(promo.id)}
                                disabled={actionLoading === promo.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {actionLoading === promo.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Aprobar
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRejectingId(promo.id)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      )}
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
