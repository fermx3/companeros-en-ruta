'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/feedback'
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Award,
  PieChart,
  BarChart3,
  ShoppingCart
} from 'lucide-react'

type Period = 'week' | 'month' | 'quarter' | 'year'

type BrandMetrics = {
  brand_id: string
  brand_name: string
  logo_url: string | null
  total_clients: number
  active_clients: number
  pending_clients: number
  total_visits: number
  monthly_visits: number
  total_orders: number
  monthly_orders: number
  total_revenue: number
  monthly_revenue: number
  conversion_rate: number
  total_points_balance: number
  avg_client_points: number
  active_promotions: number
  first_membership_date: string | null
  last_membership_date: string | null
}

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Esta Semana',
  month: 'Este Mes',
  quarter: 'Este Trimestre',
  year: 'Este Año'
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-MX').format(num)
}

export default function BrandReportsPage() {
  const { user } = useAuth()
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [metrics, setMetrics] = useState<BrandMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('month')

  useEffect(() => {
    if (!user || !currentBrandId) return

    const controller = new AbortController()

    const fetchMetrics = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await brandFetch('/api/brand/metrics', { signal: controller.signal })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar métricas')
        }

        setMetrics(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Error al cargar métricas')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchMetrics()
    return () => controller.abort()
  }, [user, brandFetch, currentBrandId])

  if (!user) {
    return <div>Cargando...</div>
  }

  // Calculate derived metrics
  const inactiveClients = metrics
    ? metrics.total_clients - metrics.active_clients - metrics.pending_clients
    : 0

  const activePercentage = metrics && metrics.total_clients > 0
    ? Math.round((metrics.active_clients / metrics.total_clients) * 100)
    : 0

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {metrics?.logo_url && (
                <img
                  src={metrics.logo_url}
                  alt={metrics.brand_name}
                  className="h-12 w-12 rounded-lg object-contain bg-gray-100"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Reportes de Marca
                </h1>
                <p className="text-gray-600">
                  {metrics?.brand_name || 'Cargando...'} - Analítica y métricas
                </p>
              </div>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-2">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={period === p ? 'bg-blue-600' : ''}
                >
                  {PERIOD_LABELS[p]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            {/* Main KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Clientes */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Clientes</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">
                        {formatNumber(metrics.total_clients)}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {metrics.active_clients} activos
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visitas */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Visitas</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">
                        {formatNumber(metrics.monthly_visits)}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        este mes
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingresos */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Ingresos</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">
                        {formatCurrency(metrics.monthly_revenue)}
                      </p>
                      <p className="text-sm text-purple-600 mt-1">
                        este mes
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conversión */}
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">Conversión</p>
                      <p className="text-3xl font-bold text-amber-900 mt-1">
                        {metrics.conversion_rate}%
                      </p>
                      <p className="text-sm text-amber-600 mt-1">
                        tasa de conversión
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-amber-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-gray-500" />
                    Distribución de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Visual Bar Representation */}
                    <div className="h-8 flex rounded-full overflow-hidden">
                      {metrics.total_clients > 0 ? (
                        <>
                          <div
                            className="bg-green-500"
                            style={{ width: `${(metrics.active_clients / metrics.total_clients) * 100}%` }}
                            title={`Activos: ${metrics.active_clients}`}
                          />
                          <div
                            className="bg-yellow-500"
                            style={{ width: `${(metrics.pending_clients / metrics.total_clients) * 100}%` }}
                            title={`Pendientes: ${metrics.pending_clients}`}
                          />
                          <div
                            className="bg-gray-300"
                            style={{ width: `${(inactiveClients / metrics.total_clients) * 100}%` }}
                            title={`Inactivos: ${inactiveClients}`}
                          />
                        </>
                      ) : (
                        <div className="w-full bg-gray-200" />
                      )}
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm text-gray-600">Activos</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {metrics.active_clients}
                        </p>
                        <p className="text-xs text-gray-500">{activePercentage}%</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-sm text-gray-600">Pendientes</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {metrics.pending_clients}
                        </p>
                        <p className="text-xs text-gray-500">
                          {metrics.total_clients > 0
                            ? Math.round((metrics.pending_clients / metrics.total_clients) * 100)
                            : 0}%
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-300" />
                          <span className="text-sm text-gray-600">Inactivos</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {inactiveClients}
                        </p>
                        <p className="text-xs text-gray-500">
                          {metrics.total_clients > 0
                            ? Math.round((inactiveClients / metrics.total_clients) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Points Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-gray-500" />
                    Resumen de Puntos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Total Points Balance */}
                    <div className="text-center py-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
                      <p className="text-sm text-amber-600">Balance Total de Puntos</p>
                      <p className="text-4xl font-bold text-amber-700 mt-1">
                        {formatNumber(metrics.total_points_balance)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Promedio por Cliente</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatNumber(Math.round(metrics.avg_client_points))}
                        </p>
                        <p className="text-xs text-gray-500">puntos</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Promociones Activas</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {metrics.active_promotions}
                        </p>
                        <p className="text-xs text-gray-500">activas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue & Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    Ingresos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-green-600">Ingresos Este Mes</p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(metrics.monthly_revenue)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(metrics.total_revenue)}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>

                    {metrics.total_clients > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ingreso por Cliente</span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(Math.round(metrics.total_revenue / metrics.total_clients))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Orders Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                    Órdenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-blue-600">Este Mes</p>
                        <p className="text-3xl font-bold text-blue-700">
                          {formatNumber(metrics.monthly_orders)}
                        </p>
                        <p className="text-xs text-blue-500">órdenes</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Totales</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {formatNumber(metrics.total_orders)}
                        </p>
                        <p className="text-xs text-gray-500">órdenes</p>
                      </div>
                    </div>

                    {metrics.monthly_orders > 0 && metrics.monthly_revenue > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ticket Promedio</span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(Math.round(metrics.monthly_revenue / metrics.monthly_orders))}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tasa de Conversión</span>
                        <span className="font-medium text-green-600">
                          {metrics.conversion_rate}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.min(metrics.conversion_rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Info */}
            {(metrics.first_membership_date || metrics.last_membership_date) && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500">
                    {metrics.first_membership_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Primera membresía:{' '}
                          <span className="font-medium text-gray-700">
                            {new Date(metrics.first_membership_date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </span>
                      </div>
                    )}
                    {metrics.last_membership_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Última membresía:{' '}
                          <span className="font-medium text-gray-700">
                            {new Date(metrics.last_membership_date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </>
  )
}
