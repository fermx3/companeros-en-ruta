'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/button"
import { Award, Star, TrendingUp, Building2, Plus, Clock, Check } from "lucide-react"
import Link from 'next/link'

interface CurrentTier {
  id: string
  name: string
  tier_level: number
  points_multiplier: number
  discount_percentage: number
  tier_color: string | null
}

interface NextTier {
  name: string
  min_points_required: number
  points_needed: number
}

interface ClientMembership {
  id: string
  public_id: string
  brand_id: string
  brand_name: string
  brand_logo_url: string | null
  membership_status: string
  joined_date: string | null
  points_balance: number
  lifetime_points: number
  current_tier: CurrentTier | null
  next_tier: NextTier | null
}

interface AvailableBrand {
  id: string
  public_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  brand_color_primary: string | null
  is_member: boolean
  membership_status: string | null
}

function TierProgressBar({ membership }: { membership: ClientMembership }) {
  if (!membership.next_tier) {
    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Nivel máximo alcanzado</span>
          <span>{membership.lifetime_points.toLocaleString()} pts</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    )
  }

  const progress = membership.next_tier.min_points_required > 0
    ? Math.min(100, ((membership.lifetime_points) / membership.next_tier.min_points_required) * 100)
    : 0

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progreso hacia {membership.next_tier.name}</span>
        <span>{membership.lifetime_points.toLocaleString()} / {membership.next_tier.min_points_required.toLocaleString()} pts</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: membership.current_tier?.tier_color || '#3B82F6'
          }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Faltan <span className="font-medium text-gray-700">{membership.next_tier.points_needed.toLocaleString()}</span> puntos
      </p>
    </div>
  )
}

function MembershipStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Activa', className: 'bg-green-100 text-green-800' },
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
    suspended: { label: 'Suspendida', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-800' }
  }

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}

export default function ClientBrandsPage() {
  const [memberships, setMemberships] = useState<ClientMembership[]>([])
  const [availableBrands, setAvailableBrands] = useState<AvailableBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'memberships' | 'available'>('memberships')
  const [joiningBrand, setJoiningBrand] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [membershipsRes, brandsRes] = await Promise.all([
        fetch('/api/client/memberships'),
        fetch('/api/client/brands')
      ])

      if (!membershipsRes.ok) {
        const errorData = await membershipsRes.json()
        throw new Error(errorData.error || 'Error al cargar membresías')
      }

      const membershipsData = await membershipsRes.json()
      setMemberships(membershipsData.memberships || [])

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json()
        setAvailableBrands(brandsData.brands || [])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleJoinBrand = async (brandId: string) => {
    try {
      setJoiningBrand(brandId)
      setError(null)

      const response = await fetch('/api/client/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brandId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al unirse a la marca')
      }

      const data = await response.json()
      setSuccessMessage(data.message)
      setTimeout(() => setSuccessMessage(null), 5000)

      // Reload data
      loadData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setJoiningBrand(null)
    }
  }

  const availableToJoin = availableBrands.filter(b => !b.is_member)
  const activeMemberships = memberships.filter(m => m.membership_status === 'active')
  const pendingMemberships = memberships.filter(m => m.membership_status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded-md w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm h-64">
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && memberships.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error al cargar los datos</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadData} variant="outline" className="mt-4">
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
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 lg:p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    Mis Marcas
                  </h1>
                  <p className="text-purple-100 mt-1">
                    {activeMemberships.length} {activeMemberships.length === 1 ? 'membresía activa' : 'membresías activas'}
                    {pendingMemberships.length > 0 && ` • ${pendingMemberships.length} pendiente${pendingMemberships.length > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              <Link href="/client">
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <p className="text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

          {error && memberships.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('memberships')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'memberships'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mis Membresías ({memberships.length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Descubrir Marcas ({availableToJoin.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'memberships' ? (
            <>
              {memberships.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Sin membresías</h3>
                      <p className="mt-2 text-gray-500">
                        Aún no tienes membresías con ninguna marca.
                      </p>
                      <Button onClick={() => setActiveTab('available')} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Descubrir marcas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {memberships.map((membership) => (
                    <Card key={membership.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                      <div
                        className="h-2"
                        style={{ backgroundColor: membership.current_tier?.tier_color || '#6366F1' }}
                      />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {membership.brand_logo_url ? (
                              <img
                                src={membership.brand_logo_url}
                                alt={membership.brand_name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-lg">{membership.brand_name}</CardTitle>
                              <MembershipStatusBadge status={membership.membership_status} />
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-4">
                        {membership.membership_status === 'pending' ? (
                          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <p className="text-sm text-yellow-800">
                              Tu solicitud está siendo revisada por la marca
                            </p>
                          </div>
                        ) : (
                          <>
                            {membership.current_tier ? (
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div
                                  className="h-10 w-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: membership.current_tier.tier_color || '#6366F1' }}
                                >
                                  <Award className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{membership.current_tier.name}</p>
                                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    {membership.current_tier.points_multiplier > 1 && (
                                      <span className="flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {membership.current_tier.points_multiplier}x puntos
                                      </span>
                                    )}
                                    {membership.current_tier.discount_percentage > 0 && (
                                      <span>{membership.current_tier.discount_percentage}% descuento</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <p className="text-sm text-gray-500">Sin nivel asignado</p>
                              </div>
                            )}

                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <span className="text-sm text-gray-600">Puntos disponibles</span>
                              </div>
                              <span className="text-lg font-bold text-gray-900">
                                {membership.points_balance.toLocaleString()}
                              </span>
                            </div>

                            {membership.membership_status === 'active' && (
                              <TierProgressBar membership={membership} />
                            )}
                          </>
                        )}

                        {membership.joined_date && (
                          <p className="text-xs text-gray-400 pt-2 border-t">
                            Miembro desde {new Date(membership.joined_date).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {availableToJoin.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Check className="mx-auto h-12 w-12 text-green-500" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Ya estás en todas las marcas</h3>
                      <p className="mt-2 text-gray-500">
                        Eres miembro de todas las marcas disponibles.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableToJoin.map((brand) => (
                    <Card key={brand.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                      <div
                        className="h-2"
                        style={{ backgroundColor: brand.brand_color_primary || '#6366F1' }}
                      />
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div
                              className="h-12 w-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: brand.brand_color_primary || '#6366F1' }}
                            >
                              <Building2 className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{brand.name}</CardTitle>
                            <CardDescription>{brand.slug}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-4">
                        {brand.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {brand.description}
                          </p>
                        )}

                        <Button
                          onClick={() => handleJoinBrand(brand.id)}
                          disabled={joiningBrand === brand.id}
                          className="w-full"
                        >
                          {joiningBrand === brand.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Enviando solicitud...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Unirse a {brand.name}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
