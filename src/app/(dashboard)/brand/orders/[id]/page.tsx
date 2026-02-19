'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { displayPhone, extractDigits } from '@/lib/utils/phone'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  User,
  Truck
} from 'lucide-react'

interface OrderItem {
  id: string
  public_id: string
  line_number: number
  quantity_ordered: number
  quantity_confirmed: number | null
  quantity_delivered: number
  unit_price: number
  line_subtotal: number
  line_discount_amount: number
  line_total: number
  unit_type: string
  item_status: string
  product: {
    id: string
    name: string
    sku: string | null
  } | null
  product_variant: {
    id: string
    name: string
  } | null
}

interface OrderDetail {
  id: string
  public_id: string
  order_number: string
  order_status: string
  order_type: string | null
  source_channel: string
  order_date: string
  requested_delivery_date: string | null
  confirmed_delivery_date: string | null
  actual_delivery_date: string | null
  delivery_address: string | null
  delivery_instructions: string | null
  payment_method: string
  payment_status: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  priority: string
  client_notes: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string | null
  client: {
    id: string
    public_id: string
    business_name: string
    owner_name: string | null
    email: string | null
    phone: string | null
    address_street: string | null
    address_city: string | null
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
  items: OrderItem[]
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" /> },
    submitted: { label: 'Enviado', className: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
    confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-800', icon: <Package className="h-4 w-4" /> },
    processing: { label: 'En Proceso', className: 'bg-indigo-100 text-indigo-800', icon: <Package className="h-4 w-4" /> },
    shipped: { label: 'Enviado', className: 'bg-purple-100 text-purple-800', icon: <Package className="h-4 w-4" /> },
    delivered: { label: 'Entregado', className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
    completed: { label: 'Completado', className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
    cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> }
  }

  const { label, className, icon } = config[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
    icon: <Package className="h-4 w-4" />
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full ${className}`}>
      {icon}
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
    month: 'long',
    day: 'numeric'
  })
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function BrandOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: orderId } = use(params)

  const { brandFetch, currentBrandId } = useBrandFetch()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentBrandId) return

    const controller = new AbortController()

    const loadOrder = async () => {
      try {
        const response = await brandFetch(`/api/brand/orders/${orderId}`, { signal: controller.signal })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar la orden')
        }
        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadOrder()
    return () => controller.abort()
  }, [orderId, brandFetch, currentBrandId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando orden...</p>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert variant="error" className="max-w-lg mx-auto">
          {error}
        </Alert>
        <div className="text-center mt-4">
          <Link href="/brand/orders">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver a Ordenes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/brand" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link href="/brand/orders" className="text-gray-500 hover:text-gray-700">
                    Ordenes
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">#{order.order_number}</li>
              </ol>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingBag className="h-6 w-6 text-indigo-600" />
                  Orden #{order.order_number}
                  <StatusBadge status={order.order_status} />
                </h1>
                <p className="text-gray-600 mt-1">
                  Creada el {formatDateTime(order.created_at)}
                </p>
              </div>
              <Link href="/brand/orders">
                <Button variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg divide-y">
                  {order.items.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">#{item.line_number}</span>
                          <h4 className="font-medium text-gray-900">
                            {item.product?.name || 'Producto desconocido'}
                          </h4>
                        </div>
                        {item.product?.sku && (
                          <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                        )}
                        <div className="text-sm text-gray-600 mt-1">
                          {item.quantity_ordered} {item.unit_type} x {formatCurrency(item.unit_price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(item.line_total)}</p>
                        {item.line_discount_amount > 0 && (
                          <p className="text-xs text-green-600">
                            -{formatCurrency(item.line_discount_amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="p-4 bg-gray-50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento</span>
                        <span>-{formatCurrency(order.discount_amount)}</span>
                      </div>
                    )}
                    {order.tax_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impuestos</span>
                        <span>{formatCurrency(order.tax_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-indigo-600">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            {(order.delivery_address || order.delivery_instructions) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Informacion de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.delivery_address && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Direccion</p>
                      <p className="text-gray-900">{order.delivery_address}</p>
                    </div>
                  )}
                  {order.delivery_instructions && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Instrucciones</p>
                      <p className="text-gray-900">{order.delivery_instructions}</p>
                    </div>
                  )}
                  {order.requested_delivery_date && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Fecha Solicitada</p>
                      <p className="text-gray-900">{formatDate(order.requested_delivery_date)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {(order.client_notes || order.internal_notes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.client_notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Notas del Cliente</p>
                      <p className="text-gray-900">{order.client_notes}</p>
                    </div>
                  )}
                  {order.internal_notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Notas Internas</p>
                      <p className="text-gray-900">{order.internal_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            {order.client && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">{order.client.business_name}</p>
                    {order.client.owner_name && (
                      <p className="text-sm text-gray-600">{order.client.owner_name}</p>
                    )}
                  </div>

                  {order.client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:+52${extractDigits(order.client.phone)}`} className="hover:text-indigo-600">
                        {displayPhone(order.client.phone)}
                      </a>
                    </div>
                  )}

                  {order.client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${order.client.email}`} className="hover:text-indigo-600">
                        {order.client.email}
                      </a>
                    </div>
                  )}

                  {order.client.address_street && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>
                        {order.client.address_street}
                        {order.client.address_city && `, ${order.client.address_city}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Distributor Info */}
            {order.distributor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Distribuidor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900">{order.distributor.name}</p>
                </CardContent>
              </Card>
            )}

            {/* Assigned User */}
            {order.assigned_user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Asesor Asignado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900">
                    {order.assigned_user.first_name} {order.assigned_user.last_name}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Numero</span>
                  <span className="font-medium">{order.order_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fecha</span>
                  <span>{formatDate(order.order_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo</span>
                  <span className="capitalize">{order.order_type || 'Estandar'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Canal</span>
                  <span className="capitalize">{order.source_channel.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Prioridad</span>
                  <span className="capitalize">{order.priority}</span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Metodo de Pago</span>
                    <span className="capitalize">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Estado de Pago</span>
                    <span className={`capitalize ${
                      order.payment_status === 'paid' ? 'text-green-600' :
                      order.payment_status === 'pending' ? 'text-yellow-600' : ''
                    }`}>
                      {order.payment_status === 'pending' ? 'Pendiente' :
                       order.payment_status === 'paid' ? 'Pagado' :
                       order.payment_status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            {order.updated_at && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Actividad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>Creado: {formatDateTime(order.created_at)}</p>
                    {order.updated_at !== order.created_at && (
                      <p className="mt-1">Actualizado: {formatDateTime(order.updated_at)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
