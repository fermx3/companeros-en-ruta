'use client'

import { Gift, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface ClientPromotion {
  id: string
  name: string
  promotion_type: string
  discount_display: string
  valid_until: string
  status: 'available' | 'partially_used' | 'fully_used' | 'expired'
  usage_limit: number
  times_used: number
  remaining_uses: number
}

interface ClientPromotionsPanelProps {
  promotions: ClientPromotion[]
  loading?: boolean
  className?: string
}

const STATUS_CONFIG = {
  available: {
    label: 'Disponible',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2
  },
  partially_used: {
    label: 'Parcialmente usada',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock
  },
  fully_used: {
    label: 'Completamente usada',
    color: 'bg-gray-100 text-gray-600',
    icon: CheckCircle2
  },
  expired: {
    label: 'Expirada',
    color: 'bg-red-100 text-red-700',
    icon: AlertCircle
  }
}

const PROMOTION_TYPE_LABELS: Record<string, string> = {
  discount_percentage: 'Descuento %',
  discount_amount: 'Descuento $',
  buy_x_get_y: 'Compra X Lleva Y',
  free_product: 'Producto Gratis',
  volume_discount: 'Descuento por Volumen',
  tier_bonus: 'Bonus de Nivel',
  cashback: 'Cashback',
  points_multiplier: 'Multiplicador Pts'
}

export function ClientPromotionsPanel({
  promotions,
  loading,
  className
}: ClientPromotionsPanelProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMM yyyy', { locale: es })
    } catch {
      return dateString
    }
  }

  const availablePromotions = promotions.filter(
    p => p.status === 'available' || p.status === 'partially_used'
  )
  const unavailablePromotions = promotions.filter(
    p => p.status === 'fully_used' || p.status === 'expired'
  )

  if (loading) {
    return (
      <div className={cn('animate-pulse space-y-3', className)}>
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-20 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Gift className="w-5 h-5 text-purple-600" />
        <h3 className="text-sm font-medium text-gray-900">
          Promociones Disponibles
        </h3>
        {availablePromotions.length > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {availablePromotions.length}
          </span>
        )}
      </div>

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          Estas promociones están disponibles para el cliente. Úsalas como argumento de venta.
          Se aplican automáticamente al crear una orden.
        </p>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Gift className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No hay promociones disponibles para este cliente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Available promotions */}
          {availablePromotions.length > 0 && (
            <div className="space-y-2">
              {availablePromotions.map((promo) => {
                const statusConfig = STATUS_CONFIG[promo.status]
                const StatusIcon = statusConfig.icon

                return (
                  <div
                    key={promo.id}
                    className="border border-gray-200 rounded-lg p-3 bg-white hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {promo.name}
                          </h4>
                          <span className={cn(
                            'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                            statusConfig.color
                          )}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {PROMOTION_TYPE_LABELS[promo.promotion_type] || promo.promotion_type}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <span className="text-lg font-bold text-purple-600">
                          {promo.discount_display}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Válida hasta: {formatDate(promo.valid_until)}
                      </span>
                      {promo.usage_limit > 0 && (
                        <span>
                          Usos: {promo.times_used}/{promo.usage_limit}
                          {promo.remaining_uses > 0 && ` (${promo.remaining_uses} restantes)`}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Unavailable promotions (collapsed) */}
          {unavailablePromotions.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                {unavailablePromotions.length} promocion{unavailablePromotions.length !== 1 ? 'es' : ''} no disponible{unavailablePromotions.length !== 1 ? 's' : ''}
              </summary>
              <div className="mt-2 space-y-2">
                {unavailablePromotions.map((promo) => {
                  const statusConfig = STATUS_CONFIG[promo.status]

                  return (
                    <div
                      key={promo.id}
                      className="border border-gray-100 rounded-lg p-2 bg-gray-50 opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{promo.name}</span>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          statusConfig.color
                        )}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
