'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Tag, QrCode } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

interface PromotionBrand {
  id: string
  name: string
  logo_url: string | null
  brand_color_primary?: string | null
  brand_color_secondary?: string | null
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

function getBrandGradient(brand: PromotionBrand): string {
  const primary = brand.brand_color_primary || '#6b7a3d'
  const secondary = brand.brand_color_secondary || '#202456'
  return `linear-gradient(to right, ${primary}, ${secondary})`
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
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded w-48 animate-pulse" />
      <div className="h-36 bg-muted rounded-2xl animate-pulse" />
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
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Promociones de la Semana</h2>
        <div className="rounded-2xl bg-white/60 p-8 text-center shadow-sm">
          <Tag className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-navy">No hay promociones activas</p>
          <p className="text-sm text-muted-foreground mt-1">
            Las promociones de tus marcas apareceran aqui.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Promociones de la Semana</h2>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
      >
        {displayPromotions.map((promo) => (
          <div
            key={promo.id}
            className="min-w-full snap-start rounded-2xl p-5 text-white shadow-sm relative overflow-hidden"
            style={{ background: getBrandGradient(promo.brand) }}
          >
            {/* Brand logo — large circle on the right */}
            <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
              <Avatar
                src={promo.brand?.logo_url}
                alt={promo.brand?.name || ''}
                size="lg"
                className="opacity-90"
              />
            </div>

            {/* Content — left side */}
            <div className="pr-24">
              <p className="text-base font-bold mb-1">{promo.brand?.name}</p>
              <p className="text-2xl font-black">{getDiscountLabel(promo)}</p>
              <p className="text-sm font-medium opacity-90">{promo.name}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs opacity-70">
                Válido hasta {format(new Date(promo.end_date), "dd 'de' MMM", { locale: es })}
              </p>
              <Link
                href="/client/qr"
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              >
                Ver QR
                <QrCode className="h-3.5 w-3.5" />
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
                i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-white/50'
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
