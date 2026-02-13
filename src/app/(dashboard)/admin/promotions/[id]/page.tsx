'use client'

import React, { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, Alert } from '@/components/ui/feedback'
import {
  Gift, Calendar, DollarSign, Users, TrendingUp, Check, X,
  ArrowLeft, Building2, Clock, Target, FileText, Hash
} from 'lucide-react'

interface Brand {
  id: string
  name: string
  logo_url: string | null
  brand_color_primary: string | null
}

interface Creator {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface PromotionRule {
  id: string
  public_id: string
  rule_type: string
  rule_name: string
  is_inclusion: boolean
  apply_to_all: boolean
  target_zones: unknown
  target_states: unknown
  target_markets: unknown
  target_commercial_structures: unknown
  target_client_types: unknown
  target_clients: unknown
  target_products: unknown
  target_categories: unknown
  target_tiers: unknown
  is_active: boolean
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
  start_time: string | null
  end_time: string | null
  days_of_week: number[] | null
  discount_percentage: number | null
  discount_amount: number | null
  min_purchase_amount: number | null
  max_discount_amount: number | null
  buy_quantity: number | null
  get_quantity: number | null
  points_multiplier: number | null
  usage_limit_per_client: number | null
  usage_limit_total: number | null
  usage_count_total: number
  budget_allocated: number | null
  budget_spent: number | null
  priority: number
  stackable: boolean
  auto_apply: boolean
  requires_code: boolean
  promo_code: string | null
  terms_and_conditions: string | null
  internal_notes: string | null
  approval_notes: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  brands: Brand
  user_profiles: Creator | null
  promotion_rules: PromotionRule[]
}

interface Stats {
  total_redemptions: number
  total_discount_given: number
  total_bonus_points: number
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

const DAYS_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function AdminPromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')

  const loadPromotion = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/promotions/${id}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar promoción')
      }

      const data = await response.json()
      setPromotion(data.promotion || null)
      setStats(data.stats || null)

    } catch (err) {
      console.error('Error loading promotion:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPromotion()
  }, [loadPromotion])

  const handleApprove = async () => {
    setActionLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/promotions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_notes: approvalNotes || null })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al aprobar')
      }

      const data = await response.json()
      setSuccess(data.message)
      await loadPromotion()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('El motivo de rechazo es requerido')
      return
    }

    setActionLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/promotions/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: rejectReason })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al rechazar')
      }

      const data = await response.json()
      setSuccess(data.message)
      setShowRejectModal(false)
      await loadPromotion()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPromotionValue = (): string => {
    if (!promotion) return '-'
    if (promotion.discount_percentage) return `${promotion.discount_percentage}% de descuento`
    if (promotion.discount_amount) return `$${promotion.discount_amount} de descuento`
    if (promotion.buy_quantity && promotion.get_quantity) return `Compra ${promotion.buy_quantity}, lleva ${promotion.get_quantity}`
    if (promotion.points_multiplier) return `${promotion.points_multiplier}x puntos`
    return '-'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando promoción...</p>
        </div>
      </div>
    )
  }

  if (!promotion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Promoción no encontrada</p>
          <Link href="/admin/promotions">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a promociones
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
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
                    <Link href="/admin/promotions" className="ml-4 text-gray-400 hover:text-gray-500">
                      Promociones
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-gray-900 font-medium">{promotion.public_id}</span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {promotion.brands?.logo_url ? (
                  <Image
                    src={promotion.brands.logo_url}
                    alt={promotion.brands.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 object-contain rounded-lg"
                  />
                ) : (
                  <div
                    className="h-16 w-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: promotion.brands?.brand_color_primary || '#3B82F6' }}
                  >
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">{promotion.name}</h1>
                    <StatusBadge status={STATUS_COLORS[promotion.status] || 'inactive'} size="md" />
                  </div>
                  <p className="text-gray-500 mt-1">
                    {promotion.brands?.name} • {promotion.public_id} • {promotion.promotion_type_label}
                  </p>
                </div>
              </div>

              <Link href="/admin/promotions">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Approval Actions */}
        {promotion.status === 'pending_approval' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Promoción Pendiente de Aprobación
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Revisa los detalles y decide si aprobar o rechazar esta promoción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas de aprobación (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Agrega comentarios sobre la aprobación..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Aprobar Promoción
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-red-600">Rechazar Promoción</CardTitle>
                <CardDescription>
                  Proporciona el motivo del rechazo. Esto será visible para el creador de la promoción.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Motivo del rechazo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  autoFocus
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false)
                      setRejectReason('')
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {actionLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Confirmar Rechazo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {promotion.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{promotion.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Promotion Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Detalles de la Promoción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium">{promotion.promotion_type_label}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valor</p>
                    <p className="font-medium text-blue-600">{getPromotionValue()}</p>
                  </div>
                  {promotion.min_purchase_amount && promotion.min_purchase_amount > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Compra mínima</p>
                      <p className="font-medium">${promotion.min_purchase_amount}</p>
                    </div>
                  )}
                  {promotion.max_discount_amount && (
                    <div>
                      <p className="text-sm text-gray-500">Descuento máximo</p>
                      <p className="font-medium">${promotion.max_discount_amount}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {promotion.auto_apply && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Auto-aplicar</span>
                    )}
                    {promotion.stackable && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Acumulable</span>
                    )}
                    {promotion.requires_code && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Código: {promotion.promo_code}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Prioridad: {promotion.priority}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Vigencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha de inicio</p>
                    <p className="font-medium">{formatDate(promotion.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de fin</p>
                    <p className="font-medium">{formatDate(promotion.end_date)}</p>
                  </div>
                  {promotion.start_time && (
                    <div>
                      <p className="text-sm text-gray-500">Hora de inicio</p>
                      <p className="font-medium">{promotion.start_time}</p>
                    </div>
                  )}
                  {promotion.end_time && (
                    <div>
                      <p className="text-sm text-gray-500">Hora de fin</p>
                      <p className="font-medium">{promotion.end_time}</p>
                    </div>
                  )}
                </div>

                {promotion.days_of_week && promotion.days_of_week.length < 7 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Días activos</p>
                    <div className="flex gap-2">
                      {DAYS_LABELS.map((day, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-sm ${
                            promotion.days_of_week?.includes(idx)
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms */}
            {promotion.terms_and_conditions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Términos y Condiciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{promotion.terms_and_conditions}</p>
                </CardContent>
              </Card>
            )}

            {/* Internal Notes */}
            {promotion.internal_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notas Internas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{promotion.internal_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Canjes totales</span>
                    <span className="font-semibold">{stats.total_redemptions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Descuento otorgado</span>
                    <span className="font-semibold">${stats.total_discount_given.toLocaleString()}</span>
                  </div>
                  {stats.total_bonus_points > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Puntos bonus</span>
                      <span className="font-semibold">{stats.total_bonus_points.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Límites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uso total</span>
                  <span className="font-semibold">
                    {promotion.usage_count_total} / {promotion.usage_limit_total || '∞'}
                  </span>
                </div>
                {promotion.usage_limit_per_client && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Por cliente</span>
                    <span className="font-semibold">{promotion.usage_limit_per_client}</span>
                  </div>
                )}
                {promotion.budget_allocated && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Presupuesto</span>
                      <span className="font-semibold">
                        ${promotion.budget_spent?.toLocaleString() || 0} / ${promotion.budget_allocated.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(((promotion.budget_spent || 0) / promotion.budget_allocated) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Meta Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Creada por</p>
                  <p className="font-medium">
                    {promotion.user_profiles
                      ? `${promotion.user_profiles.first_name} ${promotion.user_profiles.last_name}`
                      : 'Desconocido'}
                  </p>
                  <p className="text-xs text-gray-500">{promotion.user_profiles?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de creación</p>
                  <p className="font-medium">{formatDateTime(promotion.created_at)}</p>
                </div>
                {promotion.approved_at && (
                  <div>
                    <p className="text-sm text-gray-500">Fecha de aprobación</p>
                    <p className="font-medium">{formatDateTime(promotion.approved_at)}</p>
                  </div>
                )}
                {promotion.approval_notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notas de aprobación</p>
                    <p className="font-medium text-sm">{promotion.approval_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
