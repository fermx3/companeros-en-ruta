'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PendingOrder {
  id: string
  order_number: string
  status: string
  status_label: string
  total_amount: number
  created_at: string
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

interface OrderQuickAccessProps {
  hasPurchaseOrder: boolean
  onHasPurchaseOrderChange: (value: boolean) => void
  purchaseOrderNumber: string
  onPurchaseOrderNumberChange: (value: string) => void
  whyNotBuying: WhyNotBuyingReason | null
  onWhyNotBuyingChange: (value: WhyNotBuyingReason | null) => void
  pendingOrders: PendingOrder[]
  onCreateOrder: () => void
  onViewOrderHistory: () => void
  className?: string
}

export function OrderQuickAccess({
  hasPurchaseOrder,
  onHasPurchaseOrderChange,
  purchaseOrderNumber,
  onPurchaseOrderNumberChange,
  whyNotBuying,
  onWhyNotBuyingChange,
  pendingOrders,
  onCreateOrder,
  onViewOrderHistory,
  className
}: OrderQuickAccessProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Orden de Compra</h3>
        </div>

        {pendingOrders.length > 0 && (
          <button
            type="button"
            onClick={onViewOrderHistory}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
          >
            Ver historial
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        )}
      </div>

      {/* Pending orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {pendingOrders.length} orden{pendingOrders.length !== 1 ? 'es' : ''} pendiente{pendingOrders.length !== 1 ? 's' : ''}
              </p>
              <div className="mt-1 space-y-1">
                {pendingOrders.slice(0, 3).map((order) => (
                  <p key={order.id} className="text-xs text-yellow-700">
                    #{order.order_number} - ${order.total_amount.toLocaleString()} ({order.status_label})
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
          {/* Order number input */}
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

          {/* Create order button */}
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
    </div>
  )
}
