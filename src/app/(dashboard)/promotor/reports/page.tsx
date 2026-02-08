'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/feedback'
import {
  Calendar,
  Users,
  CheckCircle,
  TrendingUp,
  Target,
  Clock,
  Star,
  BarChart3
} from 'lucide-react'

type Period = 'week' | 'month' | 'quarter' | 'year'

type PromotorStats = {
  total_visits: number
  pending_visits: number
  completed_visits: number
  visits_this_month: number
  avg_visit_rating: number
  total_clients: number
  new_clients_month: number
  performance_score: number
}

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Esta Semana',
  month: 'Este Mes',
  quarter: 'Este Trimestre',
  year: 'Este Año'
}

export default function PromotorReportsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<PromotorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('month')
  const [promotorName, setPromotorName] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/promotor/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar estadísticas')
      }

      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/promotor/profile')
        if (response.ok) {
          const data = await response.json()
          setPromotorName(data.full_name || null)
        }
      } catch {
        // Silently fail
      }
    }
    if (user) {
      fetchProfile()
    }
  }, [user])

  if (!user) {
    return <div>Cargando...</div>
  }

  // Calculate derived metrics
  const effectiveness = stats
    ? stats.total_visits > 0
      ? Math.round((stats.completed_visits / stats.total_visits) * 100)
      : 0
    : 0

  const clientCoverage = stats
    ? stats.total_clients > 0
      ? Math.round((stats.visits_this_month / stats.total_clients) * 100)
      : 0
    : 0

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Reportes</h1>
              <p className="text-gray-600">
                {promotorName || user.email?.split('@')[0]} - Resumen de desempeño
              </p>
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
        ) : stats ? (
          <div className="space-y-6">
            {/* Main KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Visitas */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Visitas del Mes</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">
                        {stats.visits_this_month}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {stats.completed_visits} completadas
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Efectividad */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Efectividad</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">
                        {effectiveness}%
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        tasa de completado
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clientes */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Clientes</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">
                        {stats.total_clients}
                      </p>
                      <p className="text-sm text-purple-600 mt-1">
                        +{stats.new_clients_month} nuevos este mes
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Score */}
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">Score</p>
                      <p className="text-3xl font-bold text-amber-900 mt-1">
                        {stats.performance_score}
                      </p>
                      <p className="text-sm text-amber-600 mt-1">
                        puntos de desempeño
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-amber-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visit Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gray-500" />
                    Desglose de Visitas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Total Visits Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Total de Visitas</span>
                        <span className="font-medium">{stats.total_visits}</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    {/* Completed Visits */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Completadas
                        </span>
                        <span className="font-medium text-green-600">
                          {stats.completed_visits} ({effectiveness}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${stats.total_visits > 0 ? (stats.completed_visits / stats.total_visits) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Pending Visits */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-yellow-500" />
                          Pendientes
                        </span>
                        <span className="font-medium text-yellow-600">
                          {stats.pending_visits}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{
                            width: `${stats.total_visits > 0 ? (stats.pending_visits / stats.total_visits) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Coverage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    Cobertura de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Coverage Progress */}
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-purple-200 bg-purple-50">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-purple-700">
                            {Math.min(clientCoverage, 100)}%
                          </p>
                          <p className="text-xs text-purple-600">cobertura</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.visits_this_month}
                        </p>
                        <p className="text-sm text-gray-500">Clientes visitados</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.total_clients}
                        </p>
                        <p className="text-sm text-gray-500">Total asignados</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rating & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Average Rating */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gray-500" />
                    Calificación Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-8 w-8 ${
                              star <= Math.round(stats.avg_visit_rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.avg_visit_rating.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-500">de 5.0 estrellas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-500" />
                    Desglose de Desempeño
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Visitas completadas</span>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Calificación promedio</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cartera de clientes</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Actividad mensual</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Score Total</span>
                        <span className="text-lg font-bold text-blue-600">
                          {stats.performance_score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
