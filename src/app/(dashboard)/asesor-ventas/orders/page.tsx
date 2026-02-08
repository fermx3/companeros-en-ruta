'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert, EmptyState } from '@/components/ui/feedback'
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  Building2,
  Plus
} from 'lucide-react'

interface Order {
  id: string
  public_id: string
  order_number: string
  client: {
    id: string
    public_id: string
    business_name: string
    owner_name: string | null
  } | null
  brand: {
    id: string
    name: string
  } | null
  order_status: string
  order_type: string | null
  source_channel: string
  order_date: string
  total_amount: number
  items_count: number
  created_at: string
}

interface OrdersSummary {
  total_orders: number
  total_sales: number
  pending_orders: number
  completed_orders: number
}

interface OrdersData {
  orders: Order[]
  summary: OrdersSummary
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    draft: {
      label: 'Borrador',
      className: 'bg-gray-100 text-gray-800',
      icon: <Clock className="h-3 w-3" />
    },
    submitted: {
      label: 'Enviado',
      className: 'bg-yellow-100 text-yellow-800',
      icon: <Clock className="h-3 w-3" />
    },
    confirmed: {
      label: 'Confirmado',
      className: 'bg-blue-100 text-blue-800',
      icon: <Package className="h-3 w-3" />
    },
    processing: {
      label: 'En Proceso',
      className: 'bg-indigo-100 text-indigo-800',
      icon: <Package className="h-3 w-3" />
    },
    shipped: {
      label: 'Enviado',
      className: 'bg-purple-100 text-purple-800',
      icon: <Package className="h-3 w-3" />
    },
    delivered: {
      label: 'Entregado',
      className: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="h-3 w-3" />
    },
    completed: {
      label: 'Completado',
      className: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="h-3 w-3" />
    },
    cancelled: {
      label: 'Cancelado',
      className: 'bg-red-100 text-red-800',
      icon: <XCircle className="h-3 w-3" />
    }
  }

  const { label, className, icon } = config[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
    icon: <Package className="h-3 w-3" />
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${className}`}>
      {icon}
      {label}
    </span>
  )
}

function SourceBadge({ source }: { source: string }) {
  const config: Record<string, { label: string; className: string }> = {
    field_sales: {
      label: 'Campo',
      className: 'bg-emerald-50 text-emerald-700'
    },
    client_portal: {
      label: 'Portal',
      className: 'bg-blue-50 text-blue-700'
    },
    mobile_app: {
      label: 'App',
      className: 'bg-purple-50 text-purple-700'
    },
    whatsapp: {
      label: 'WhatsApp',
      className: 'bg-green-50 text-green-700'
    },
    phone: {
      label: 'Telefono',
      className: 'bg-orange-50 text-orange-700'
    },
    email: {
      label: 'Email',
      className: 'bg-gray-50 text-gray-700'
    }
  }

  const { label, className } = config[source] || {
    label: source,
    className: 'bg-gray-50 text-gray-700'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${className}`}>
      {label}
    </span>
  )
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

export default function AsesorVentasOrdersPage() {
  const [data, setData] = useState<OrdersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(statusFilter && { status: statusFilter })
        })

        const response = await fetch(`/api/asesor-ventas/orders?${params}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar ordenes')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error loading orders:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [page, statusFilter])

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'draft', label: 'Borrador' },
    { value: 'submitted', label: 'Enviados' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'processing', label: 'En Proceso' },
    { value: 'delivered', label: 'Entregados' },
    { value: 'completed', label: 'Completados' },
    { value: 'cancelled', label: 'Cancelados' }
  ]

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando ordenes...</p>
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
                <li className="text-gray-900 font-medium">Mis Ordenes</li>
              </ol>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6 text-emerald-600" />
                  Mis Ordenes
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona tus ordenes de compra
                </p>
              </div>
              <Link href="/asesor-ventas/orders/create">
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
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        {data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <ShoppingBag className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {data.summary.total_orders}
                </div>
                <div className="text-xs text-gray-600">Total Ordenes</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.summary.total_sales)}
                </div>
                <div className="text-xs text-gray-600">Total Ventas</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {data.summary.pending_orders}
                </div>
                <div className="text-xs text-gray-600">Pendientes</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {data.summary.completed_orders}
                </div>
                <div className="text-xs text-gray-600">Completados</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    statusFilter === option.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading && data && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" className="mr-2" />
            <span className="text-gray-600">Actualizando...</span>
          </div>
        )}

        {!loading && (!data?.orders || data.orders.length === 0) ? (
          <EmptyState
            icon={<ShoppingBag className="w-16 h-16 text-gray-400" />}
            title="No hay ordenes"
            description={
              statusFilter
                ? "No se encontraron ordenes con el filtro seleccionado."
                : "Aun no has creado ninguna orden. Crea tu primera orden para comenzar."
            }
            action={
              !statusFilter && (
                <Link href="/asesor-ventas/orders/create">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Orden
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {data?.orders.map(order => (
              <Link
                key={order.id}
                href={`/asesor-ventas/orders/${order.public_id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">
                            #{order.order_number}
                          </span>
                          <StatusBadge status={order.order_status} />
                          <SourceBadge source={order.source_channel} />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(order.order_date || order.created_at)}
                          </span>
                          {order.client && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {order.client.business_name}
                            </span>
                          )}
                          {order.brand && (
                            <span className="flex items-center gap-1">
                              <Package className="h-3.5 w-3.5" />
                              {order.brand.name}
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-500">
                          {order.items_count} {order.items_count === 1 ? 'producto' : 'productos'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <span className="text-sm text-gray-600">
                  Pagina {page} de {data.pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (data) {
                      setPage(p => Math.min(data.pagination.totalPages, p + 1))
                    }
                  }}
                  disabled={page >= data.pagination.totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
