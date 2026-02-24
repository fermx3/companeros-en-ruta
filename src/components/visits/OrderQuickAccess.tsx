'use client'

import { ShoppingCart, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface VisitOrder {
  id: string
  order_number: string
  order_status: string
  total_amount: number
  distributor_id: string | null
  distributor_name: string | null
  payment_method: string
  order_notes: string | null
  created_at: string
  items: Array<{
    product_id: string
    product_variant_id: string | null
    product_name: string
    quantity: number
    unit_price: number
  }>
}

export type WhyNotBuyingReason =
  | 'lack_of_budget'
  | 'low_turnover'
  | 'sufficient_inventory'
  | 'prefers_other_brand'
  | 'distributor_issues'
  | 'not_applicable'

const WHY_NOT_BUYING_LABELS: Record<WhyNotBuyingReason, string> = {
  lack_of_budget: 'Falta de presupuesto',
  low_turnover: 'Bajo desplazamiento',
  sufficient_inventory: 'Tiene suficiente inventario',
  prefers_other_brand: 'Prefiere otra marca',
  distributor_issues: 'Problemas con distribuidor',
  not_applicable: 'No aplica'
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  confirmed: 'Confirmada',
  processed: 'Procesada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processed: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

interface OrderQuickAccessProps {
  hasPurchaseOrder: boolean
  onHasPurchaseOrderChange: (value: boolean) => void
  purchaseOrderNumber: string
  onPurchaseOrderNumberChange: (value: string) => void
  whyNotBuying: WhyNotBuyingReason | null
  onWhyNotBuyingChange: (value: WhyNotBuyingReason | null) => void
  orders: VisitOrder[]
  onCreateOrder: () => void
  onEditOrder: (orderId: string) => void
  onDeleteOrder: (orderId: string) => void
  deletingOrderId: string | null
  className?: string
}

export function OrderQuickAccess({
  hasPurchaseOrder,
  onHasPurchaseOrderChange,
  purchaseOrderNumber,
  onPurchaseOrderNumberChange,
  whyNotBuying,
  onWhyNotBuyingChange,
  orders,
  onCreateOrder,
  onEditOrder,
  onDeleteOrder,
  deletingOrderId,
  className
}: OrderQuickAccessProps) {
  const hasActiveOrders = orders.some(o => o.order_status !== 'cancelled')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Orden de Compra</h3>
        </div>

      </div>

      {/* Order cards */}
      {orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order, index) => {
            const isDraft = order.order_status === 'draft'
            const isDeleting = deletingOrderId === order.id

            return (
              <div
                key={order.id}
                className={cn(
                  'border rounded-lg p-3 transition-colors',
                  isDraft ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {order.order_number
                          ? `#${order.order_number}`
                          : `Orden ${index + 1}`}
                      </span>
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-700'
                      )}>
                        {STATUS_LABELS[order.order_status] || order.order_status}
                      </span>
                    </div>
                    {order.distributor_name && (
                      <p className="text-xs text-gray-500 truncate">
                        {order.distributor_name}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      ${Number(order.total_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    {order.items.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Action buttons — only for draft orders */}
                  {isDraft && (
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditOrder(order.id)}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Editar orden"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteOrder(order.id)}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar orden"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Toggle & details: only show when no active orders exist */}
      {hasActiveOrders ? (
        /* When orders exist, just show the create button */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de orden (opcional)
            </label>
            <input
              type="text"
              value={purchaseOrderNumber}
              onChange={(e) => onPurchaseOrderNumberChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: ORD-2026-001"
            />
          </div>

          <Button
            type="button"
            onClick={onCreateOrder}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Nueva Orden
          </Button>
        </div>
      ) : (
        <>
          {/* Toggle: Has purchase order? */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              ¿Se realizó orden de compra en esta visita?
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => onHasPurchaseOrderChange(true)}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
                  hasPurchaseOrder
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                )}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => {
                  onHasPurchaseOrderChange(false)
                  onPurchaseOrderNumberChange('')
                }}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
                  !hasPurchaseOrder
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                )}
              >
                No
              </button>
            </div>
          </div>

          {/* Order details or reason */}
          {hasPurchaseOrder ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de orden (opcional)
                </label>
                <input
                  type="text"
                  value={purchaseOrderNumber}
                  onChange={(e) => onPurchaseOrderNumberChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: ORD-2026-001"
                />
              </div>

              <Button
                type="button"
                onClick={onCreateOrder}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Nueva Orden
              </Button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Por qué no se realizó compra?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(WHY_NOT_BUYING_LABELS) as [WhyNotBuyingReason, string][]).map(
                  ([value, label]) => (
                    <label
                      key={value}
                      className={cn(
                        'flex items-center p-3 border rounded-lg cursor-pointer transition-colors',
                        whyNotBuying === value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="why_not_buying"
                        value={value}
                        checked={whyNotBuying === value}
                        onChange={() => onWhyNotBuyingChange(value)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
