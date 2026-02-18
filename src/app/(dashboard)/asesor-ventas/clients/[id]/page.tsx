'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert, StatusBadge, EmptyState } from '@/components/ui/feedback'
import { displayPhone, extractDigits } from '@/lib/utils/phone'
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  ShoppingBag,
  Gift,
  Star,
  Calendar,
  TrendingUp,
  Package,
  Plus,
  ExternalLink
} from 'lucide-react'

interface ClientDetail {
  id: string
  public_id: string
  business_name: string
  owner_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address: {
    street: string | null
    city: string | null
    state: string | null
    postal_code: string | null
  }
  location: {
    latitude: number
    longitude: number
  } | null
  status: string
  zone: { id: string; name: string } | null
  market: { id: string; name: string } | null
  client_type: { id: string; name: string } | null
  created_at: string
}

interface Membership {
  id: string
  status: string
  points_balance: number
  total_points_earned: number
  brand: { id: string; name: string; logo_url: string | null } | null
  tier: { id: string; name: string; min_points_required: number } | null
  created_at: string
}

interface Promotion {
  id: string
  public_id: string
  name: string
  description: string | null
  promotion_type: string
  discount_value: number
  discount_type: string
  start_date: string
  end_date: string
  status: string
  brand: { id: string; name: string } | null
}

interface Order {
  id: string
  public_id: string
  order_number: string
  order_status: string
  order_date: string
  total_amount: number
  created_at: string
}

interface Stats {
  total_orders: number
  total_sales: number
  pending_orders: number
  completed_orders: number
}

interface ClientData {
  client: ClientDetail
  memberships: Membership[]
  promotions: Promotion[]
  recent_orders: Order[]
  stats: Stats
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
    submitted: { label: 'Enviado', className: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-800' },
    processing: { label: 'En Proceso', className: 'bg-indigo-100 text-indigo-800' },
    shipped: { label: 'Enviado', className: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Entregado', className: 'bg-green-100 text-green-800' },
    completed: { label: 'Completado', className: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' }
  }

  const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>
      {label}
    </span>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string

  const [data, setData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadClient = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/asesor-ventas/clients/${clientId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar cliente')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error loading client:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (clientId) {
      loadClient()
    }
  }, [clientId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando cliente...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="error" title="Error">{error}</Alert>
          <div className="mt-4">
            <Link href="/asesor-ventas/clients">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Clientes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { client, memberships, promotions, recent_orders, stats } = data

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
                <li>
                  <Link href="/asesor-ventas/clients" className="text-gray-500 hover:text-gray-700">
                    Clientes
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium truncate max-w-[200px]">
                  {client.business_name}
                </li>
              </ol>
            </nav>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {client.business_name}
                  </h1>
                  {client.owner_name && (
                    <p className="text-gray-600">{client.owner_name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={client.status as 'active' | 'inactive'} size="sm" />
                    {client.client_type && (
                      <span className="text-sm text-gray-500">
                        {client.client_type.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link href={`/asesor-ventas/orders/create?client_id=${client.id}`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Orden
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.total_orders}</div>
              <div className="text-xs text-gray-600">Total Ordenes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.total_sales)}
              </div>
              <div className="text-xs text-gray-600">Total Ventas</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.pending_orders}</div>
              <div className="text-xs text-gray-600">Pendientes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{memberships.length}</div>
              <div className="text-xs text-gray-600">Membresias</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Client Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informacion de Contacto
                </h3>
                <div className="space-y-4">
                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Telefono</p>
                        <a href={`tel:+52${extractDigits(client.phone)}`} className="text-gray-900 hover:text-emerald-600">
                          {displayPhone(client.phone)}
                        </a>
                      </div>
                    </div>
                  )}

                  {client.whatsapp && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">WhatsApp</p>
                        <a
                          href={`https://wa.me/52${extractDigits(client.whatsapp)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-emerald-600 flex items-center gap-1"
                        >
                          {displayPhone(client.whatsapp)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {client.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a href={`mailto:${client.email}`} className="text-gray-900 hover:text-emerald-600">
                          {client.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {(client.address.street || client.address.city) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Direccion</p>
                        <p className="text-gray-900">
                          {[
                            client.address.street,
                            client.address.city,
                            client.address.state,
                            client.address.postal_code
                          ].filter(Boolean).join(', ')}
                        </p>
                        {client.location && (
                          <a
                            href={`https://maps.google.com/?q=${client.location.latitude},${client.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 text-sm hover:underline flex items-center gap-1 mt-1"
                          >
                            Ver en mapa
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {client.zone && (
                      <div>
                        <p className="text-gray-500">Zona</p>
                        <p className="font-medium">{client.zone.name}</p>
                      </div>
                    )}
                    {client.market && (
                      <div>
                        <p className="text-gray-500">Mercado</p>
                        <p className="font-medium">{client.market.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Cliente desde</p>
                      <p className="font-medium">{formatDate(client.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Memberships */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  Membresias
                </h3>

                {memberships.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Este cliente no tiene membresias activas.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {memberships.map(membership => (
                      <div
                        key={membership.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {membership.brand?.name || 'Sin marca'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            membership.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {membership.status === 'active' ? 'Activo' : membership.status}
                          </span>
                        </div>
                        {membership.tier && (
                          <p className="text-sm text-gray-600">
                            Tier: {membership.tier.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {membership.points_balance.toLocaleString()} puntos
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Orders & Promotions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Promotions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-pink-600" />
                    Promociones Disponibles
                  </h3>
                </div>

                {promotions.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No hay promociones disponibles en este momento.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {promotions.slice(0, 5).map(promo => (
                      <div
                        key={promo.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{promo.name}</h4>
                            {promo.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {promo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Hasta {formatDate(promo.end_date)}
                              </span>
                              {promo.brand && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded">
                                  {promo.brand.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-emerald-600">
                              {promo.discount_type === 'percentage'
                                ? `${promo.discount_value}%`
                                : formatCurrency(promo.discount_value)}
                            </span>
                            <p className="text-xs text-gray-500">descuento</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    Ordenes Recientes
                  </h3>
                  <Link href={`/asesor-ventas/orders?client_id=${client.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Todas
                    </Button>
                  </Link>
                </div>

                {recent_orders.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag className="w-12 h-12 text-gray-400" />}
                    title="Sin ordenes"
                    description="Aun no has creado ordenes para este cliente."
                    action={
                      <Link href={`/asesor-ventas/orders/create?client_id=${client.id}`}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primera Orden
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {recent_orders.map(order => (
                      <Link
                        key={order.id}
                        href={`/asesor-ventas/orders/${order.public_id}`}
                        className="block"
                      >
                        <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  #{order.order_number}
                                </span>
                                <OrderStatusBadge status={order.order_status} />
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(order.order_date || order.created_at)}
                              </p>
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
