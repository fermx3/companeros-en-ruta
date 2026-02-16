'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, MapPin, Star, Settings, Building2, UserCheck, Layers, Gift, ChevronRight, ClipboardList } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'

// Interfaces basadas en la vista brand_dashboard_metrics
interface BrandDashboardMetrics {
  brand_id: string
  brand_public_id: string
  tenant_id: string
  brand_name: string
  brand_slug: string
  logo_url: string | null
  brand_color_primary: string | null
  brand_color_secondary: string | null
  website: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  status: 'active' | 'inactive'
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
  tenant_name: string
  tenant_slug: string
  total_clients: number
  active_clients: number
  pending_clients: number
  avg_client_points: number
  total_points_balance: number
  total_visits: number
  monthly_visits: number
  active_visits: number
  avg_visit_rating: number
  total_orders: number
  monthly_orders: number
  total_revenue: number
  monthly_revenue: number
  active_promotions: number
  total_promotions: number
  conversion_rate: number
  revenue_per_client: number
  first_membership_date: string | null
  last_membership_date: string | null
  last_visit_date: string | null
  last_order_date: string | null
}

export default function BrandDashboard() {
  const [metrics, setMetrics] = useState<BrandDashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBrandMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/brand/metrics')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar métricas')
      }

      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Error loading brand metrics:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBrandMetrics()
  }, [loadBrandMetrics])

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm h-64"></div>
            <div className="bg-white p-6 rounded-lg shadow-sm h-64"></div>
          </div>
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
              <Button onClick={loadBrandMetrics} variant="outline" className="mt-4">
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
          {/* Header with Logo and Brand Info */}
          {metrics && (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                {metrics.logo_url ? (
                  <Image
                    src={metrics.logo_url}
                    alt={`${metrics.brand_name} logo`}
                    width={64}
                    height={64}
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <div
                    className="h-16 w-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: metrics.brand_color_primary || '#3B82F6' }}
                  >
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {metrics.brand_name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Dashboard de Marca • {metrics.brand_public_id}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/brand/settings">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </Button>
                </Link>
                <Link href="/brand/reports">
                  <Button className="w-full sm:w-auto">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver Reportes
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes Totales</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.total_clients || 0}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visitas Activas</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.active_visits || 0}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                    <p className="text-2xl font-bold text-gray-900">${(metrics?.monthly_revenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{(metrics?.avg_visit_rating || 0).toFixed(1)}</p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                <CardDescription className="text-gray-600">Herramientas principales para gestionar tu marca</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/brand/clients">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <Users className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium">Clientes</span>
                    </Button>
                  </Link>

                  <Link href="/brand/memberships">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <UserCheck className="h-6 w-6 text-indigo-600" />
                      <span className="text-sm font-medium">Miembros</span>
                    </Button>
                  </Link>

                  <Link href="/brand/tiers">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <Layers className="h-6 w-6 text-purple-600" />
                      <span className="text-sm font-medium">Niveles</span>
                    </Button>
                  </Link>

                  <Link href="/brand/visits">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <MapPin className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-medium">Visitas</span>
                    </Button>
                  </Link>
                </div>

                {/* More Options */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Más opciones</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/brand/promotions">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <Gift className="h-4 w-4 mr-1" />
                        Promociones
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/brand/reports">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Reportes
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/brand/surveys">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <ClipboardList className="h-4 w-4 mr-1" />
                        Encuestas
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Performance Summary */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Resumen de Desempeño</CardTitle>
                <CardDescription className="text-gray-600">Métricas clave de tu marca</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Clientes activos</span>
                    <span className="text-sm font-semibold">{metrics?.active_clients || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Visitas este mes</span>
                    <span className="text-sm font-semibold">{metrics?.monthly_visits || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ingresos mensuales</span>
                    <span className="text-sm font-semibold">${(metrics?.monthly_revenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasa de conversión</span>
                    <span className="text-sm font-semibold">{((metrics?.conversion_rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ingreso por cliente</span>
                    <span className="text-sm font-semibold">${(metrics?.revenue_per_client || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Brand Information */}
          {metrics && (
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Información de la Marca</CardTitle>
                <CardDescription className="text-gray-600">Detalles y configuración de tu marca</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Nombre</label>
                    <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md block">
                      {metrics.brand_name}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Código Público</label>
                    <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md block">
                      {metrics.brand_public_id}
                    </span>
                  </div>
                  {metrics.contact_email && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Email</label>
                      <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md block">
                        {metrics.contact_email}
                      </span>
                    </div>
                  )}
                  {metrics.contact_phone && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Teléfono</label>
                      <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md block">
                        {metrics.contact_phone}
                      </span>
                    </div>
                  )}
                  {metrics.website && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Sitio Web</label>
                      <a
                        href={metrics.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 bg-gray-50 px-3 py-2 rounded-md block"
                      >
                        {metrics.website}
                      </a>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Estado</label>
                    <span className={`text-sm px-3 py-2 rounded-md block ${
                      metrics.status === 'active'
                        ? 'text-green-700 bg-green-50 border border-green-200'
                        : 'text-red-700 bg-red-50 border border-red-200'
                    }`}>
                      {metrics.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  {/* Colores de Marca */}
                  {(metrics.brand_color_primary || metrics.brand_color_secondary) && (
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Colores de Marca</label>
                      <div className="flex flex-wrap gap-4">
                        {metrics.brand_color_primary && (
                          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg border">
                            <div
                              className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                              style={{ backgroundColor: metrics.brand_color_primary }}
                            ></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Color Primario</p>
                              <p className="text-xs text-gray-600 font-mono">{metrics.brand_color_primary}</p>
                            </div>
                          </div>
                        )}

                        {metrics.brand_color_secondary && (
                          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg border">
                            <div
                              className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                              style={{ backgroundColor: metrics.brand_color_secondary }}
                            ></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Color Secundario</p>
                              <p className="text-xs text-gray-600 font-mono">{metrics.brand_color_secondary}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
