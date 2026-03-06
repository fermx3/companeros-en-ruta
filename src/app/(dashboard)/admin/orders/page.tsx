'use client'

import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/ui/metric-card'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  Building2,
  User,
  Truck
} from 'lucide-react'
import { OrderStatusBadge } from '@/components/ui/order-status-badge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ClickableCard } from '@/components/ui/clickable-card'

interface Order {
  id: string
  public_id: string
  order_number: string
  client: {
    id: string
    business_name: string
    owner_name: string | null
    owner_last_name: string | null
  } | null
  brand: {
    id: string
    name: string
  } | null
  distributor: {
    id: string
    name: string
  } | null
  assigned_user: {
    id: string
    first_name: string
    last_name: string
  } | null
  order_status: string
  order_type: string | null
  source_channel: string
  source: 'direct' | 'visit'
  order_date: string
  total_amount: number
  items_count: number
  priority: string
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

function SourceBadge({ source }: { source: string }) {
  const config: Record<string, { label: string; className: string }> = {
    field_sales: { label: 'Campo', className: 'bg-emerald-50 text-emerald-700' },
    client_portal: { label: 'Portal', className: 'bg-blue-50 text-blue-700' },
    mobile_app: { label: 'App', className: 'bg-purple-50 text-purple-700' },
    whatsapp: { label: 'WhatsApp', className: 'bg-green-50 text-green-700' },
    phone: { label: 'Telefono', className: 'bg-orange-50 text-orange-700' },
    email: { label: 'Email', className: 'bg-gray-50 text-gray-700' }
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

function OriginBadge({ source }: { source: 'direct' | 'visit' }) {
  if (source === 'visit') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-50 text-purple-700">
        Visita
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700">
      Directo
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

export default function AdminOrdersPage() {
  usePageTitle('Pedidos')
  const [data, setData] = useState<OrdersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(statusFilter && { status: statusFilter }),
          ...(debouncedSearch && { search: debouncedSearch })
        })

        const response = await fetch(`/api/admin/orders?${params}`)

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
  }, [page, statusFilter, debouncedSearch])

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'draft', label: 'Borrador' },
    { value: 'submitted', label: 'Enviados' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'processing', label: 'En Proceso' },
    { value: 'shipped', label: 'Enviados' },
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
                  <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Ordenes</li>
              </ol>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                  Ordenes
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona todas las ordenes del tenant
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Buscar por # orden..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
            <MetricCard
              title="Total Ordenes"
              value={data.summary.total_orders}
              icon={<ShoppingBag className="h-6 w-6" />}
            />
            <MetricCard
              title="Total Ventas"
              value={formatCurrency(data.summary.total_sales)}
              icon={<TrendingUp className="h-6 w-6" />}
              variant="success"
            />
            <MetricCard
              title="Pendientes"
              value={data.summary.pending_orders}
              icon={<Clock className="h-6 w-6" />}
              variant="warning"
            />
            <MetricCard
              title="Completados"
              value={data.summary.completed_orders}
              icon={<CheckCircle className="h-6 w-6" />}
              variant="success"
            />
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
                      ? 'bg-blue-600 text-white'
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
              statusFilter || search
                ? "No se encontraron ordenes con los filtros seleccionados."
                : "Aun no se han creado ordenes en este tenant."
            }
          />
        ) : (
          <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {data?.orders.map(order => (
              <ClickableCard
                key={order.id}
                href={`/admin/orders/${order.public_id}`}
              >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">
                            #{order.order_number}
                          </span>
                          <OrderStatusBadge status={order.order_status} />
                          <OriginBadge source={order.source} />
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

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {order.distributor && (
                            <span className="flex items-center gap-1">
                              <Truck className="h-3.5 w-3.5" />
                              {order.distributor.name}
                            </span>
                          )}
                          {order.assigned_user && (
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {order.assigned_user.first_name} {order.assigned_user.last_name}
                            </span>
                          )}
                          <span>
                            {order.items_count} {order.items_count === 1 ? 'producto' : 'productos'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
              </ClickableCard>
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
