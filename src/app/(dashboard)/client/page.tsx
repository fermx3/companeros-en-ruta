'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/button"
import { Store, ShoppingCart, Star, MapPin, Phone, Mail, Gift, Award, TrendingUp, Building2, QrCode, ClipboardList } from "lucide-react"
import Link from 'next/link'

interface ClientProfile {
  id: string
  public_id: string
  business_name: string
  legal_name: string | null
  owner_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_postal_code: string | null
  status: string
  zone_name: string | null
  market_name: string | null
  client_type_name: string | null
  total_points: number
  total_orders: number
  last_order_date: string | null
  last_visit_date: string | null
  created_at: string
}

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

export default function ClientPortal() {
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [primaryMembership, setPrimaryMembership] = useState<ClientMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [profileResponse, membershipsResponse] = await Promise.all([
        fetch('/api/client/profile'),
        fetch('/api/client/memberships')
      ])

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        throw new Error(errorData.error || 'Error al cargar perfil')
      }

      const profileData = await profileResponse.json()
      setProfile(profileData)

      if (membershipsResponse.ok) {
        const membershipsData = await membershipsResponse.json()
        const activeMemberships = (membershipsData.memberships || []).filter(
          (m: ClientMembership) => m.membership_status === 'active'
        )
        if (activeMemberships.length > 0) {
          setPrimaryMembership(activeMemberships[0])
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-gray-300 rounded-md w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
              <Button onClick={loadProfile} variant="outline" className="mt-4">
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
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 lg:p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Store className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    Bienvenido, {profile?.business_name || 'Cliente'}
                  </h1>
                  <p className="text-blue-100 mt-1">
                    {profile?.public_id} • {profile?.client_type_name || 'Cliente'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/client/orders">
                  <Button variant="outline" className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Mis Pedidos
                  </Button>
                </Link>
                <Link href="/client/profile">
                  <Button className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50">
                    Mi Perfil
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Puntos Acumulados</p>
                    <p className="text-3xl font-bold text-gray-900">{profile?.total_points || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Disponibles para canjear</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                    <p className="text-3xl font-bold text-gray-900">{profile?.total_orders || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Pedidos realizados</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Zona</p>
                    <p className="text-xl font-bold text-gray-900">{profile?.zone_name || 'Sin asignar'}</p>
                    <p className="text-xs text-gray-500 mt-1">{profile?.market_name || 'Mercado general'}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Membership Tier */}
          {primaryMembership && (
            <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
              <div
                className="h-2"
                style={{ backgroundColor: primaryMembership.current_tier?.tier_color || '#6366F1' }}
              />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {primaryMembership.brand_logo_url ? (
                      <img
                        src={primaryMembership.brand_logo_url}
                        alt={primaryMembership.brand_name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{primaryMembership.brand_name}</CardTitle>
                      <CardDescription>Tu membresía principal</CardDescription>
                    </div>
                  </div>
                  <Link href="/client/brands">
                    <Button variant="outline" size="sm">
                      Ver todas las marcas
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Tier */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryMembership.current_tier?.tier_color || '#6366F1' }}
                    >
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tu nivel</p>
                      <p className="text-lg font-bold text-gray-900">
                        {primaryMembership.current_tier?.name || 'Sin nivel'}
                      </p>
                      {primaryMembership.current_tier && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {primaryMembership.current_tier.points_multiplier > 1 && (
                            <span className="flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {primaryMembership.current_tier.points_multiplier}x puntos
                            </span>
                          )}
                          {primaryMembership.current_tier.discount_percentage > 0 && (
                            <span>{primaryMembership.current_tier.discount_percentage}% desc.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Points Balance */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Puntos disponibles</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {primaryMembership.points_balance.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {primaryMembership.lifetime_points.toLocaleString()} pts acumulados
                    </p>
                  </div>

                  {/* Progress to Next Tier */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {primaryMembership.next_tier ? (
                      <>
                        <p className="text-sm text-gray-500">Próximo nivel: {primaryMembership.next_tier.name}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{primaryMembership.lifetime_points.toLocaleString()} pts</span>
                            <span>{primaryMembership.next_tier.min_points_required.toLocaleString()} pts</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, (primaryMembership.lifetime_points / primaryMembership.next_tier.min_points_required) * 100)}%`,
                                backgroundColor: primaryMembership.current_tier?.tier_color || '#6366F1'
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Faltan <span className="font-medium">{primaryMembership.next_tier.points_needed.toLocaleString()}</span> puntos
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">Nivel máximo</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">Alcanzado</p>
                        <p className="text-xs text-gray-500">Disfruta todos los beneficios</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Information */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Información del Negocio</CardTitle>
                <CardDescription className="text-gray-600">
                  Datos de tu empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-start space-x-3">
                  <Store className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{profile?.business_name}</p>
                    <p className="text-sm text-gray-500">{profile?.owner_name || 'Propietario no especificado'}</p>
                  </div>
                </div>

                {profile?.address_street && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {profile.address_street}
                        {profile.address_neighborhood && `, ${profile.address_neighborhood}`}
                      </p>
                      {(profile.address_city || profile.address_state) && (
                        <p className="text-sm text-gray-500">
                          {[profile.address_city, profile.address_state, profile.address_postal_code].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {profile?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a href={`tel:${profile.phone}`} className="text-sm text-blue-600 hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                )}

                {profile?.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <a href={`mailto:${profile.email}`} className="text-sm text-blue-600 hover:underline">
                      {profile.email}
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Estado de la cuenta</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      profile?.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile?.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                <CardDescription className="text-gray-600">
                  Accede a tus servicios
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/client/qr">
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 border-purple-200 bg-purple-50/50">
                      <QrCode className="h-8 w-8 text-purple-600" />
                      <span className="text-sm font-medium">Mi Código QR</span>
                    </Button>
                  </Link>

                  <Link href="/client/orders">
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                      <span className="text-sm font-medium">Mis Pedidos</span>
                    </Button>
                  </Link>

                  <Link href="/client/brands">
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <Building2 className="h-8 w-8 text-indigo-600" />
                      <span className="text-sm font-medium">Mis Marcas</span>
                    </Button>
                  </Link>

                  <Link href="/client/points">
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <Star className="h-8 w-8 text-yellow-600" />
                      <span className="text-sm font-medium">Mis Puntos</span>
                    </Button>
                  </Link>

                  <Link href="/client/profile">
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <Store className="h-8 w-8 text-green-600" />
                      <span className="text-sm font-medium">Mi Perfil</span>
                    </Button>
                  </Link>

                  <Link href="/client/surveys">
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <ClipboardList className="h-8 w-8 text-indigo-600" />
                      <span className="text-sm font-medium">Encuestas</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Placeholder */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
              <CardDescription className="text-gray-600">
                Últimos pedidos y visitas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {profile?.total_orders === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin pedidos aún</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Tus pedidos aparecerán aquí cuando realices tu primera compra.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Último pedido</p>
                        <p className="text-xs text-gray-500">
                          {profile?.last_order_date
                            ? new Date(profile.last_order_date).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Sin fecha'
                          }
                        </p>
                      </div>
                    </div>
                    <Link href="/client/orders">
                      <Button variant="outline" size="sm">
                        Ver todos
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
