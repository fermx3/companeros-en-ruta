'use client'

import { useEffect, useState } from 'react'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/button"
import {
  Users, TrendingUp, MapPin, Star, Settings, Building2, UserCheck, Layers,
  Gift, ChevronRight, ClipboardList, Target, Package, PieChart, LayoutGrid,
  SlidersHorizontal, X, Clock, Check,
} from "lucide-react"
import { displayPhone } from '@/lib/utils/phone'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { KpiGaugeCard, KpiGaugeCardSkeleton } from '@/components/ui/kpi-gauge-card'

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

interface KpiResult {
  slug: string
  label: string
  value: number
  unit: string
  icon: string
  color: string
  description: string
  period: string
}

interface KpiDefinition {
  id: string
  slug: string
  label: string
  description: string | null
  icon: string | null
  color: string | null
  computation_type: string
  display_order: number
}

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp, Target, Package, PieChart, LayoutGrid, Users, MapPin, Star,
}

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
}

export default function BrandDashboard() {
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [metrics, setMetrics] = useState<BrandDashboardMetrics | null>(null)
  const [kpis, setKpis] = useState<KpiResult[]>([])
  const [loading, setLoading] = useState(true)
  const [kpiLoading, setKpiLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showKpiSelector, setShowKpiSelector] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!currentBrandId) return

    const controller = new AbortController()

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await brandFetch('/api/brand/metrics', { signal: controller.signal })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar métricas')
        }
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        if (controller.signal.aborted) return
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        setError(errorMessage)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }

      try {
        if (controller.signal.aborted) return
        setKpiLoading(true)
        const response = await brandFetch('/api/brand/kpis', { signal: controller.signal })
        if (response.ok) {
          const data = await response.json()
          if (!controller.signal.aborted) setKpis(data.kpis || [])
        }
      } catch {
        // KPIs are enhancement, don't block the page
      } finally {
        if (!controller.signal.aborted) setKpiLoading(false)
      }
    }

    loadData()
    return () => controller.abort()
  }, [brandFetch, currentBrandId, refreshKey])

  const loadKpis = async () => {
    try {
      setKpiLoading(true)
      const response = await brandFetch('/api/brand/kpis')
      if (response.ok) {
        const data = await response.json()
        setKpis(data.kpis || [])
      }
    } catch {
      // KPIs are enhancement, don't block the page
    } finally {
      setKpiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-gray-300 rounded-md w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
              <Button onClick={() => setRefreshKey(k => k + 1)} variant="outline" className="mt-4">
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
                  <img src={metrics.logo_url} alt={`${metrics.brand_name} logo`} className="h-16 w-16 object-contain" />
                ) : (
                  <div className="h-16 w-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: metrics.brand_color_primary || '#3B82F6' }}>
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{metrics.brand_name}</h1>
                  <p className="text-gray-600 mt-1">Dashboard de Marca &bull; {metrics.brand_public_id}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/brand/settings">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Settings className="h-4 w-4 mr-2" /> Configuración
                  </Button>
                </Link>
                <Link href="/brand/reports">
                  <Button className="w-full sm:w-auto">
                    <TrendingUp className="h-4 w-4 mr-2" /> Ver Reportes
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Dynamic KPI Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">KPIs</h2>
                {kpis.length > 0 && kpis[0].period && (
                  <p className="text-xs text-gray-500">{kpis[0].period}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowKpiSelector(true)}>
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Configurar KPIs
              </Button>
            </div>

            {kpiLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                  <KpiGaugeCardSkeleton key={i} isGauge={i <= 2} />
                ))}
              </div>
            ) : kpis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {kpis.map(kpi => {
                  const IconComponent = ICON_MAP[kpi.icon] || TrendingUp
                  return (
                    <KpiGaugeCard
                      key={kpi.slug}
                      label={kpi.label}
                      value={kpi.value}
                      unit={kpi.unit}
                      description={kpi.description}
                      icon={IconComponent}
                      color={kpi.color}
                    />
                  )
                })}
              </div>
            ) : (
              /* Fallback: show static metrics if no KPIs configured */
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
            )}
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
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Más opciones</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/brand/promotions">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <Gift className="h-4 w-4 mr-1" /> Promociones <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/brand/reports">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <TrendingUp className="h-4 w-4 mr-1" /> Reportes <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/brand/surveys">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <ClipboardList className="h-4 w-4 mr-1" /> Encuestas <ChevronRight className="h-3 w-3 ml-1" />
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
                    <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md block">{metrics.brand_name}</span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Código Público</label>
                    <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md block">{metrics.brand_public_id}</span>
                  </div>
                  {metrics.contact_email && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Email</label>
                      <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md block">{metrics.contact_email}</span>
                    </div>
                  )}
                  {metrics.contact_phone && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Teléfono</label>
                      <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md block">{displayPhone(metrics.contact_phone)}</span>
                    </div>
                  )}
                  {metrics.website && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Sitio Web</label>
                      <a href={metrics.website} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 bg-gray-50 px-3 py-2 rounded-md block">{metrics.website}</a>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Estado</label>
                    <span className={`text-sm px-3 py-2 rounded-md block ${
                      metrics.status === 'active' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'
                    }`}>
                      {metrics.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  {(metrics.brand_color_primary || metrics.brand_color_secondary) && (
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Colores de Marca</label>
                      <div className="flex flex-wrap gap-4">
                        {metrics.brand_color_primary && (
                          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg border">
                            <div className="w-10 h-10 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: metrics.brand_color_primary }}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Color Primario</p>
                              <p className="text-xs text-gray-600 font-mono">{metrics.brand_color_primary}</p>
                            </div>
                          </div>
                        )}
                        {metrics.brand_color_secondary && (
                          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg border">
                            <div className="w-10 h-10 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: metrics.brand_color_secondary }}></div>
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

      {/* KPI Selector Modal */}
      {showKpiSelector && (
        <KpiSelectorModal
          brandFetch={brandFetch}
          onClose={() => setShowKpiSelector(false)}
          onSaved={() => { setShowKpiSelector(false); loadKpis() }}
        />
      )}
    </div>
  )
}

function KpiSelectorModal({ brandFetch, onClose, onSaved }: {
  brandFetch: (url: string, init?: RequestInit) => Promise<Response>
  onClose: () => void
  onSaved: () => void
}) {
  const [definitions, setDefinitions] = useState<KpiDefinition[]>([])
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [canUpdate, setCanUpdate] = useState(true)
  const [cooldownMs, setCooldownMs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await brandFetch('/api/brand/kpis/selection')
        if (res.ok) {
          const data = await res.json()
          setDefinitions(data.definitions || [])
          setSelectedSlugs(data.selected_slugs || [])
          setCanUpdate(data.can_update)
          setCooldownMs(data.cooldown_remaining_ms || 0)
        }
      } catch {
        setError('Error al cargar definiciones')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [brandFetch])

  const toggleSlug = (slug: string) => {
    if (!canUpdate) return
    setSelectedSlugs(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug)
      if (prev.length >= 5) return prev
      return [...prev, slug]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await brandFetch('/api/brand/kpis/selection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kpi_slugs: selectedSlugs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const cooldownHours = Math.ceil(cooldownMs / (60 * 60 * 1000))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Configurar KPIs</h2>
            <p className="text-sm text-gray-500">Selecciona hasta 5 KPIs para tu dashboard</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</div>
          )}

          {!canUpdate && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md">
              <Clock className="h-4 w-4" />
              Podrás cambiar KPIs en {cooldownHours}h
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : (
            definitions.map(def => {
              const isSelected = selectedSlugs.includes(def.slug)
              const IconComponent = ICON_MAP[def.icon || 'TrendingUp'] || TrendingUp
              const colors = COLOR_MAP[def.color || 'blue'] || COLOR_MAP.blue

              return (
                <button
                  key={def.slug}
                  onClick={() => toggleSlug(def.slug)}
                  disabled={!canUpdate}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!canUpdate ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <IconComponent className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{def.label}</p>
                    {def.description && <p className="text-xs text-gray-500">{def.description}</p>}
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-blue-500" />}
                </button>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <span className="text-sm text-gray-500">{selectedSlugs.length}/5 seleccionados</span>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !canUpdate || selectedSlugs.length === 0}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
