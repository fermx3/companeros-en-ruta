'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Tag, Gift, QrCode } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

interface PromotionBrand {
  id: string
  name: string
  logo_url: string | null
}

interface Promotion {
  id: string
  public_id: string
  name: string
  description: string | null
  promotion_type: string
  discount_percentage: number | null
  discount_amount: number | null
  start_date: string
  end_date: string
  status: string
  terms_and_conditions: string | null
  brand: PromotionBrand
}

interface WeeklyPromotionsBannerProps {
  promotions: Promotion[]
  loading?: boolean
}

function getPromotionGradient(type: string): string {
  switch (type) {
    case 'percentage_discount':
      return 'from-[#FF5722] to-orange-400'
    case 'points_multiplier':
      return 'from-[#2196F3] to-blue-400'
    case 'free_product':
      return 'from-emerald-500 to-green-400'
    default:
      return 'from-[#FF5722] to-amber-500'
  }
}

function getDiscountLabel(promo: Promotion): string {
  if (promo.discount_percentage && promo.discount_percentage > 0) {
    return `${promo.discount_percentage}% OFF`
  }
  if (promo.discount_amount && promo.discount_amount > 0) {
    return `$${promo.discount_amount} OFF`
  }
  if (promo.promotion_type === 'points_multiplier') {
    return '2x Puntos'
  }
  if (promo.promotion_type === 'free_product') {
    return 'Gratis'
  }
  return 'Promo'
}

function PromotionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-muted rounded w-56 animate-pulse" />
      <div className="h-44 bg-muted rounded-2xl animate-pulse" />
    </div>
  )
}

export function WeeklyPromotionsBanner({ promotions, loading }: WeeklyPromotionsBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const displayPromotions = promotions.slice(0, 5)
  const total = displayPromotions.length

  // Track active slide on scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || total === 0) return
    const scrollLeft = el.scrollLeft
    const cardWidth = el.scrollWidth / total
    const idx = Math.round(scrollLeft / cardWidth)
    setActiveIndex(Math.min(idx, total - 1))
  }, [total])

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (total <= 1) return
    const interval = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const nextIdx = (activeIndex + 1) % total
      const cardWidth = el.scrollWidth / total
      el.scrollTo({ left: nextIdx * cardWidth, behavior: 'smooth' })
    }, 5000)
    return () => clearInterval(interval)
  }, [activeIndex, total])

  if (loading) return <PromotionsSkeleton />

  if (total === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Promociones de la Semana</h2>
        <div className="rounded-2xl bg-gray-50 p-8 text-center shadow-sm">
          <Tag className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-900">No hay promociones activas</p>
          <p className="text-sm text-gray-500 mt-1">
            Las promociones de tus marcas apareceran aqui.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Promociones de la Semana</h2>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
      >
        {displayPromotions.map((promo) => (
          <div
            key={promo.id}
            className={`min-w-full snap-start rounded-2xl bg-gradient-to-br ${getPromotionGradient(promo.promotion_type)} p-6 text-white shadow-sm relative overflow-hidden`}
          >
            {/* Decorative circle */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />

            {/* Brand avatar + name */}
            <div className="flex items-center gap-2 mb-3 relative">
              <Avatar
                src={promo.brand?.logo_url}
                alt={promo.brand?.name || ''}
                size="sm"
                className="border-2 border-white/30"
              />
              <span className="text-sm font-medium opacity-90">{promo.brand?.name}</span>
            </div>

            {/* Promo name + discount */}
            <div className="relative">
              <p className="text-base font-bold mb-1">{promo.name}</p>
              <p className="text-3xl font-extrabold mb-2">{getDiscountLabel(promo)}</p>
            </div>

            {/* Footer: validity + CTA */}
            <div className="flex items-center justify-between relative">
              <p className="text-xs opacity-70">
                Valido hasta {format(new Date(promo.end_date), "dd 'de' MMM", { locale: es })}
              </p>
              <Link
                href="/client/qr"
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <QrCode className="h-4 w-4" />
                Ver QR
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5">
          {displayPromotions.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir a promocion ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === activeIndex ? 'w-6 bg-[#FF5722]' : 'w-2 bg-gray-300'
              }`}
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                const cardWidth = el.scrollWidth / total
                el.scrollTo({ left: i * cardWidth, behavior: 'smooth' })
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
