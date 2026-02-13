/**
 * Brand Carousel Component
 *
 * Horizontal scrollable brand selector for filtering QR coupons.
 * Includes "Todas" option and individual brand cards.
 *
 * Mobile-first design with snap-scroll for better UX.
 */

'use client'

import React from 'react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export interface Brand {
  id: string
  name: string
  logo_url?: string | null
}

export interface BrandCarouselProps {
  /** Available brands */
  brands: Brand[]
  /** Currently selected brand ID (null = all brands) */
  selectedBrandId: string | null
  /** Callback when brand is selected */
  onSelectBrand: (brandId: string | null) => void
  /** Additional CSS classes */
  className?: string
}

export function BrandCarousel({
  brands,
  selectedBrandId,
  onSelectBrand,
  className,
}: BrandCarouselProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Title */}
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-4">
        MIS CUPONES
      </h3>

      {/* Scrollable brand cards */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-2 no-scrollbar">
        {/* "Todas" option */}
        <button
          onClick={() => onSelectBrand(null)}
          className={cn(
            'flex-shrink-0 snap-start',
            'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all',
            'min-w-[80px]',
            selectedBrandId === null
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-muted-foreground'
          )}
        >
          <div className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center',
            selectedBrandId === null
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
          <span className={cn(
            'text-xs font-medium text-center',
            selectedBrandId === null ? 'text-primary' : 'text-muted-foreground'
          )}>
            Todas
          </span>
        </button>

        {/* Brand cards */}
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => onSelectBrand(brand.id)}
            className={cn(
              'flex-shrink-0 snap-start',
              'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all',
              'min-w-[80px]',
              selectedBrandId === brand.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-muted-foreground'
            )}
          >
            <Avatar
              src={brand.logo_url}
              alt={brand.name}
              size="md"
            />
            <span className={cn(
              'text-xs font-medium text-center line-clamp-2',
              selectedBrandId === brand.id ? 'text-primary' : 'text-muted-foreground'
            )}>
              {brand.name}
            </span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
