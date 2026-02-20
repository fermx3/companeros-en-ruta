'use client'

import Link from 'next/link'
import { Building2, ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

interface CurrentTier {
  id: string
  name: string
  tier_level: number
  points_multiplier: number
  discount_percentage: number
  tier_color: string | null
}

interface NextTier {
  name: string
  min_points_required: number
  points_needed: number
}

interface ClientMembership {
  id: string
  public_id: string
  brand_id: string
  brand_name: string
  brand_logo_url: string | null
  membership_status: string
  joined_date: string | null
  points_balance: number
  lifetime_points: number
  current_tier: CurrentTier | null
  next_tier: NextTier | null
}

interface LoyaltyPlansSectionProps {
  memberships: ClientMembership[]
  loading?: boolean
}

function LoyaltyPlansSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-muted rounded w-48 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[200px] h-40 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export function LoyaltyPlansSection({ memberships, loading }: LoyaltyPlansSectionProps) {
  if (loading) return <LoyaltyPlansSkeleton />

  const displayMemberships = memberships.slice(0, 6)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Mis Planes de Lealtad</h2>
        <Link
          href="/client/brands"
          className="text-sm text-[#FF5722] hover:text-[#E64A19] font-medium flex items-center gap-1"
        >
          Ver todos
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Cards */}
      {displayMemberships.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center shadow-sm">
          <Building2 className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-900">Sin planes de lealtad</p>
          <p className="text-sm text-gray-500 mt-1">
            Unite a una marca para empezar a acumular puntos.
          </p>
          <Link
            href="/client/brands"
            className="inline-block mt-4 text-sm font-medium text-[#FF5722] hover:text-[#E64A19]"
          >
            Explorar marcas
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-x-visible">
          {displayMemberships.map((m) => {
            const tierColor = m.current_tier?.tier_color || '#6366F1'
            const progressPercent = m.next_tier
              ? Math.min(100, (m.lifetime_points / m.next_tier.min_points_required) * 100)
              : 100

            return (
              <div
                key={m.id}
                className="min-w-[200px] snap-start rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-3"
              >
                {/* Brand info */}
                <div className="flex items-center gap-3">
                  <Avatar
                    src={m.brand_logo_url}
                    alt={m.brand_name}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.brand_name}</p>
                    {m.current_tier && (
                      <span
                        className="inline-block text-xs font-medium px-2 py-0.5 rounded-full text-white mt-0.5"
                        style={{ backgroundColor: tierColor }}
                      >
                        {m.current_tier.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <p className="text-2xl font-bold text-gray-900">
                  {m.points_balance.toLocaleString()}
                  <span className="text-xs font-normal text-gray-500 ml-1">pts</span>
                </p>

                {/* Progress bar */}
                <div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: tierColor,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {m.next_tier
                      ? `${m.next_tier.points_needed.toLocaleString()} pts para ${m.next_tier.name}`
                      : 'Nivel maximo'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
