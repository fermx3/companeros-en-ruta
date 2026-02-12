'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert, EmptyState } from '@/components/ui/feedback'
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
  Filter
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
  const [redemptions, setRedemptions] = useState<QRRedemption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

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
    if (filter === 'all') return true

    const date = new Date(r.redeemed_at)
    const now = new Date()

    if (filter === 'today') {
      return date.toDateString() === now.toDateString()
    }

    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return date >= weekAgo
    }

    if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return date >= monthAgo
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
              <Link href="/asesor-ventas">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Canjeados</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hoy</p>
                  <p className="text-xl font-bold text-gray-900">{stats.today}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Tag className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${stats.totalValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 mr-2">Filtrar:</span>
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
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filter === option.value
                        ? 'bg-emerald-100 text-emerald-700 font-medium'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
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
              filter === 'all'
                ? "Aun no has canjeado ninguna promocion."
                : `No hay promociones canjeadas en el periodo seleccionado.`
            }
            action={
              <Link href="/asesor-ventas/entregar-promocion">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear QR
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredRedemptions.map((redemption) => (
              <Card key={redemption.id}>
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
