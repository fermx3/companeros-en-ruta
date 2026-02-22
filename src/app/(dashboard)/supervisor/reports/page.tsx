'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, CheckCircle, Clock, Star, TrendingUp, MapPin } from 'lucide-react'
import Link from 'next/link'
import { usePageTitle } from '@/hooks/usePageTitle'

interface TeamMember {
  id: string
  full_name: string
  email: string
  status: string
  total_clients: number
  completed_visits: number
  pending_visits: number
  avg_rating: number
}

interface Metrics {
  team_size: number
  total_clients: number
  total_visits: number
  completed_visits: number
  pending_visits: number
  visits_this_month: number
  avg_team_rating: number
  team_members: TeamMember[]
}

export default function SupervisorReportsPage() {
  usePageTitle('Reportes')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/supervisor/metrics')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar reportes')
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded-md w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm h-24"></div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm h-64"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <h3 className="text-red-800 font-semibold">Error al cargar los datos</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button onClick={loadMetrics} variant="outline" className="mt-4">
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const completionRate = metrics && metrics.total_visits > 0
    ? Math.round((metrics.completed_visits / metrics.total_visits) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/supervisor">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
              <p className="text-gray-600 text-sm">Resumen de desempeño del equipo</p>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Equipo</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.team_size || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.total_clients || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa Completado</p>
                    <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                  </div>
                  <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visitas Este Mes</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.visits_this_month || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{(metrics?.avg_team_rating || 0).toFixed(1)}</p>
                <p className="text-sm text-gray-600">Rating Promedio del Equipo</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{metrics?.completed_visits || 0}</p>
                <p className="text-sm text-gray-600">Visitas Completadas (Total)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{metrics?.pending_visits || 0}</p>
                <p className="text-sm text-gray-600">Visitas Pendientes</p>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance Table */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Desempeño Individual</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {metrics?.team_members && metrics.team_members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promotor</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Clientes</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Completadas</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pendientes</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {metrics.team_members.map((member) => {
                        const totalVisits = member.completed_visits + member.pending_visits
                        const memberRate = totalVisits > 0
                          ? Math.round((member.completed_visits / totalVisits) * 100)
                          : 0

                        return (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-blue-700">
                                    {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                                  <div className="text-xs text-gray-500">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                              {member.total_clients}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                              <span className="text-green-600 font-medium">{member.completed_visits}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                              <span className="text-yellow-600 font-medium">{member.pending_visits}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      memberRate >= 75 ? 'bg-green-500' :
                                      memberRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${memberRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900">{memberRate}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm text-gray-900">{member.avg_rating.toFixed(1)}</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Sin miembros en el equipo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
