'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/button"
import { Users, MapPin, CheckCircle, Clock, Star, TrendingUp, ShoppingCart, ArrowRight } from "lucide-react"
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'

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

interface SupervisorMetrics {
  team_size: number
  total_clients: number
  total_visits: number
  completed_visits: number
  pending_visits: number
  visits_this_month: number
  avg_team_rating: number
  team_members: TeamMember[]
}

export default function SupervisorDashboard() {
  const { userRoles } = useAuth()
  const [metrics, setMetrics] = useState<SupervisorMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasPromotorRole = userRoles.includes('promotor')
  const hasAsesorRole = userRoles.includes('asesor_de_ventas')
  const hasExtraRoles = hasPromotorRole || hasAsesorRole

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/supervisor/metrics')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar métricas')
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
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
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-gray-300 rounded-md w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
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
            <CardHeader>
              <CardTitle className="text-red-800">Error al cargar los datos</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadMetrics} variant="outline" className="mt-4">
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Dashboard de Supervisor
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona y supervisa el desempeño de tu equipo
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/supervisor/team">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Users className="h-4 w-4 mr-2" />
                  Ver Equipo
                </Button>
              </Link>
              <Link href="/supervisor/reports">
                <Button className="w-full sm:w-auto">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Reportes
                </Button>
              </Link>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Promotores en Equipo</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.team_size || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes del Equipo</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.total_clients || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visitas Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.completed_visits || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visitas Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.pending_visits || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visitas Este Mes</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.visits_this_month || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Total del equipo</p>
                  </div>
                  <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(metrics?.avg_team_rating || 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Calificación del equipo</p>
                  </div>
                  <div className="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members Table */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Miembros del Equipo</CardTitle>
              <CardDescription className="text-gray-600">
                Desempeño individual de cada promotor
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {metrics?.team_members && metrics.team_members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Promotor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clientes
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completadas
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pendientes
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {metrics.team_members.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-700">
                                    {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {member.total_clients}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            <span className="text-green-600 font-medium">{member.completed_visits}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            <span className="text-yellow-600 font-medium">{member.pending_visits}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-900">{member.avg_rating.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/supervisor/team/${member.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver detalle
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin promotores asignados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No hay promotores en tu equipo actualmente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              <CardDescription className="text-gray-600">
                Herramientas de supervisión
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/supervisor/visits">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                    <MapPin className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">Visitas del Equipo</span>
                  </Button>
                </Link>

                <Link href="/supervisor/clients">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                    <Users className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">Clientes</span>
                  </Button>
                </Link>

                <Link href="/supervisor/assignments">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">Asignaciones</span>
                  </Button>
                </Link>

                <Link href="/supervisor/reports">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                    <span className="text-sm font-medium">Reportes</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Other Modules (conditional on extra roles) */}
          {hasExtraRoles && (
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Mis Otros Módulos</CardTitle>
                <CardDescription className="text-gray-600">
                  Accede a tus otros módulos asignados
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hasPromotorRole && (
                    <Link href="/promotor">
                      <Button variant="outline" className="w-full h-16 flex items-center justify-between px-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium">Ir a Módulo Promotor</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </Button>
                    </Link>
                  )}
                  {hasAsesorRole && (
                    <Link href="/asesor-ventas">
                      <Button variant="outline" className="w-full h-16 flex items-center justify-between px-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium">Ir a Módulo Asesor de Ventas</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
