'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/metric-card'
import { ActionButton } from '@/components/ui/action-button'
import { LoadingSpinner, Alert, EmptyState } from '@/components/ui/feedback'
import { Input } from '@/components/ui/input'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  History,
  ArrowLeft,
  QrCode,
  Building2,
  Calendar,
  Tag,
  MapPin,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  FileText
} from 'lucide-react'

interface QRRedemption {
  id: string
  qr_code_id: string
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  discount_type: string | null
  discount_value: number | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  redeemed_at: string
  qr_code: {
    id: string
    code: string
    discount_description: string | null
    client: {
      id: string
      business_name: string
      owner_name: string | null
    } | null
  } | null
}

export default function HistorialQRPage() {
  usePageTitle('Historial QR')
  const [redemptions, setRedemptions] = useState<QRRedemption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [exporting, setExporting] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const loadRedemptions = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/asesor-ventas/qr-history')

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Error al cargar historial')
        }

        const data = await response.json()
        setRedemptions(data.redemptions || [])
      } catch (err) {
        console.error('Error loading redemptions:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    loadRedemptions()
  }, [])

  // Filter redemptions
  const filteredRedemptions = redemptions.filter(r => {
    const date = new Date(r.redeemed_at)
    const now = new Date()

    // Apply preset filter
    if (filter === 'today') {
      if (date.toDateString() !== now.toDateString()) return false
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      if (date < weekAgo) return false
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      if (date < monthAgo) return false
    }

    // Apply custom date range
    if (startDate && date < new Date(startDate)) return false
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      if (date > end) return false
    }

    return true
  })

  // Calculate stats
  const stats = {
    total: redemptions.length,
    today: redemptions.filter(r =>
      new Date(r.redeemed_at).toDateString() === new Date().toDateString()
    ).length,
    totalValue: redemptions
      .filter(r => r.status === 'completed' && r.discount_value)
      .reduce((sum, r) => sum + (r.discount_value || 0), 0)
  }

  // Handle export
  const handleExport = async () => {
    setExporting(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await fetch(`/api/asesor-ventas/qr-history/export?${params}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al exportar datos')
      }

      // Download CSV file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facturacion_qr_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting:', err)
      setError(err instanceof Error ? err.message : 'Error al exportar')
    } finally {
      setExporting(false)
    }
  }

  // Format discount
  const formatDiscount = (type: string | null, value: number | null): string => {
    if (!type || value === null) return '-'
    switch (type) {
      case 'percentage':
        return `${value}%`
      case 'fixed_amount':
        return `$${value.toFixed(2)}`
      case 'free_product':
        return 'Producto gratis'
      case 'points':
        return `${value} pts`
      default:
        return `${value}`
    }
  }

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Completado
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" />
            Pendiente
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Fallido
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/asesor-ventas" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Historial QR</li>
              </ol>
            </nav>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="h-6 w-6 text-emerald-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Historial de QR</h1>
                  <p className="text-gray-600">Registro de promociones entregadas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ActionButton
                  variant="secondary"
                  size="sm"
                  icon={<Download className="h-4 w-4" />}
                  onClick={handleExport}
                  loading={exporting}
                  disabled={redemptions.length === 0}
                >
                  Exportar para Facturación
                </ActionButton>
                <Link href="/asesor-ventas">
                  <ActionButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
                    Volver
                  </ActionButton>
                </Link>
              </div>
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

        {/* Stats Cards - Using MetricCard component */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Total Canjeados"
            value={stats.total}
            icon={<QrCode className="h-6 w-6 text-emerald-600" />}
          />
          <MetricCard
            title="Hoy"
            value={stats.today}
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
          />
          <MetricCard
            title="Valor Total Facturación"
            value={`$${stats.totalValue.toFixed(2)}`}
            icon={<FileText className="h-6 w-6 text-yellow-600" />}
            variant="warning"
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 mr-2">Filtro rápido:</span>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'today', label: 'Hoy' },
                  { value: 'week', label: 'Semana' },
                  { value: 'month', label: 'Mes' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value as typeof filter)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === option.value
                        ? 'bg-emerald-100 text-emerald-700 font-medium'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Rango personalizado:</span>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm"
                  placeholder="Fecha inicio"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm"
                  placeholder="Fecha fin"
                />
                {(startDate || endDate) && (
                  <ActionButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStartDate('')
                      setEndDate('')
                    }}
                  >
                    Limpiar
                  </ActionButton>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redemptions List */}
        {filteredRedemptions.length === 0 ? (
          <EmptyState
            icon={<History className="w-16 h-16 text-gray-400" />}
            title="Sin registros"
            description={
              filter === 'all' && !startDate && !endDate
                ? "Aun no has canjeado ninguna promocion."
                : `No hay promociones canjeadas en el periodo seleccionado.`
            }
            action={
              <Link href="/asesor-ventas/entregar-promocion">
                <ActionButton variant="primary" icon={<QrCode className="h-4 w-4" />}>
                  Escanear QR
                </ActionButton>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredRedemptions.map((redemption) => (
              <Card key={redemption.id} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <QrCode className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        {/* Client */}
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {redemption.qr_code?.client?.business_name || 'Cliente desconocido'}
                          </span>
                        </div>

                        {/* QR Code */}
                        <p className="text-sm text-gray-500 font-mono mb-2">
                          {redemption.qr_code?.code || 'N/A'}
                        </p>

                        {/* Discount */}
                        {redemption.qr_code?.discount_description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {redemption.qr_code.discount_description}
                          </p>
                        )}

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(redemption.redeemed_at)}
                          </span>
                          {redemption.latitude && redemption.longitude && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Ubicacion registrada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(redemption.status)}
                      <span className="text-lg font-bold text-emerald-600">
                        {formatDiscount(redemption.discount_type, redemption.discount_value)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
