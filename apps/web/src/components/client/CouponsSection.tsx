'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Ticket, Copy, Check } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

interface PromotionBrand {
  id: string
  name: string
  logo_url: string | null
}

interface CouponPromotion {
  id: string
  public_id: string
  name: string
  description: string | null
  promotion_type: string
  discount_percentage: number | null
  discount_amount: number | null
  start_date: string
  end_date: string
  requires_code?: boolean
  promo_code?: string | null
  points_multiplier?: number | null
  buy_quantity?: number | null
  get_quantity?: number | null
  brand: PromotionBrand
}

interface CouponsSectionProps {
  promotions: CouponPromotion[]
}

function getDiscountBadge(promo: CouponPromotion): string {
  switch (promo.promotion_type) {
    case 'discount_percentage':
      return `${promo.discount_percentage || 0}% OFF`
    case 'discount_amount':
      return `$${promo.discount_amount || 0} OFF`
    case 'buy_x_get_y':
      return `${promo.buy_quantity || 0}x${promo.get_quantity || 0}`
    case 'points_multiplier':
      return `${promo.points_multiplier || 2}x Pts`
    default:
      return 'Promo'
  }
}

function getBadgeColor(type: string): string {
  switch (type) {
    case 'discount_percentage':
      return 'bg-orange-100 text-orange-700'
    case 'discount_amount':
      return 'bg-green-100 text-green-700'
    case 'buy_x_get_y':
      return 'bg-purple-100 text-purple-700'
    case 'points_multiplier':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: do nothing
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-gray-700 transition-colors"
    >
      {code}
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3 text-gray-400" />
      )}
    </button>
  )
}

export function CouponsSection({ promotions }: CouponsSectionProps) {
  const couponTypes = ['discount_percentage', 'discount_amount', 'buy_x_get_y', 'points_multiplier']

  const coupons = promotions.filter(
    (p) => (p.requires_code && p.promo_code) || couponTypes.includes(p.promotion_type)
  )

  if (coupons.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cupones y Descuentos</h2>
        <div className="rounded-2xl bg-gray-50 p-8 text-center shadow-sm">
          <Ticket className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-900">No hay cupones disponibles</p>
          <p className="text-sm text-gray-500 mt-1">
            Los cupones y descuentos de tus marcas apareceran aqui.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cupones y Descuentos</h2>

      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-x-visible">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="min-w-[240px] snap-start rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-3"
          >
            {/* Brand + Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar
                  src={coupon.brand?.logo_url}
                  alt={coupon.brand?.name || ''}
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {coupon.brand?.name}
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${getBadgeColor(coupon.promotion_type)}`}>
                {getDiscountBadge(coupon)}
              </span>
            </div>

            {/* Promo name */}
            <p className="text-sm font-medium text-gray-700 line-clamp-2">{coupon.name}</p>

            {/* Promo code (if has one) */}
            {coupon.promo_code && (
              <CopyableCode code={coupon.promo_code} />
            )}

            {/* Valid until */}
            <p className="text-xs text-gray-400 mt-auto">
              Valido hasta {format(new Date(coupon.end_date), "dd 'de' MMM yyyy", { locale: es })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
