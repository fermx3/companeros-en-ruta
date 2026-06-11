'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, Package, AlertCircle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { usePageTitle } from '@/hooks/usePageTitle'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number | null
  total_price: number | null
  product_name: string | null
}

interface OrderDetail {
  id: string
  public_id: string
  order_number: string
  order_status: string
  order_type: string | null
  order_date: string
  total_amount: number
  subtotal: number | null
  discount_amount: number | null
  payment_method: string | null
  payment_status: string | null
  client_notes: string | null
  brand_name: string | null
  brand_logo_url: string | null
  items: OrderItem[]
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  submitted: 'Enviado',
  confirmed: 'Confirmado',
  processing: 'En proceso',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default function ClientOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  usePageTitle('Detalle de pedido')

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/client/orders/${orderId}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al cargar el pedido')
      }
      const data = await res.json()
      setOrder(data.order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/client/orders">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Detalle de pedido</h1>
          </div>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!order ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Pedido no disponible</h3>
              <p className="text-muted-foreground">
                No encontramos este pedido o ya no está accesible.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Folio</p>
                    <p className="text-lg font-bold text-navy">{order.order_number}</p>
                  </div>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-primary/10 text-primary">
                    {STATUS_LABELS[order.order_status] ?? order.order_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Marca</p>
                    <p className="text-sm text-navy">{order.brand_name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Fecha</p>
                    <p className="text-sm text-navy">
                      {format(new Date(order.order_date), "dd 'de' MMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Pago</p>
                    <p className="text-sm text-navy capitalize">
                      {order.payment_method ?? '—'}
                      {order.payment_status ? ` · ${order.payment_status}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Tipo</p>
                    <p className="text-sm text-navy capitalize">{order.order_type ?? 'standard'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.items.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                    Productos
                  </p>
                  <div className="divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2 flex items-center justify-between">
                        <div className="min-w-0 pr-3">
                          <p className="text-sm text-navy truncate">{item.product_name ?? 'Producto'}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity}x</p>
                        </div>
                        <p className="text-sm font-semibold text-navy">
                          ${Number(item.total_price ?? 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6 space-y-2">
                {order.subtotal != null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-navy">${Number(order.subtotal).toFixed(2)}</span>
                  </div>
                )}
                {order.discount_amount != null && order.discount_amount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="text-success">-${Number(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-semibold text-navy">Total</span>
                  <span className="text-lg font-black text-navy">
                    ${Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {order.client_notes && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                    Notas
                  </p>
                  <p className="text-sm text-navy">{order.client_notes}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
