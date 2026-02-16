'use client'

import { BadgeCheck, Sparkles } from 'lucide-react'

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
  public_id?: string
  brand_name: string
  brand_logo_url: string | null
  points_balance: number
  lifetime_points: number
  current_tier: CurrentTier | null
  next_tier: NextTier | null
}

interface TierProgressCardProps {
  membership: ClientMembership
}

export function TierProgressCard({ membership }: TierProgressCardProps) {
  const tier = membership.current_tier
  const nextTier = membership.next_tier
  const isMaxTier = !nextTier

  const progressPercent = nextTier
    ? Math.min(100, (membership.lifetime_points / nextTier.min_points_required) * 100)
    : 100

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-[#FF5722] p-6 text-white shadow-sm">
      {/* Row 1: NIVEL ACTUAL + ID badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold uppercase tracking-widest text-white/90">
          Nivel Actual
        </span>
        {membership.public_id && (
          <span className="text-xs font-medium bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 text-white">
            ID: {membership.public_id}
          </span>
        )}
      </div>

      {/* Row 2: Tier name + badge icon */}
      <h3 className="text-3xl font-bold mb-5 flex items-center gap-2">
        {tier?.name || 'Sin nivel'}
        <BadgeCheck className="h-7 w-7 text-yellow-300" />
      </h3>

      {/* Row 3: Progress section */}
      {isMaxTier ? (
        <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-3 mb-5">
          <Sparkles className="h-5 w-5 text-white" />
          <span className="text-sm font-semibold text-white">Nivel maximo alcanzado</span>
        </div>
      ) : (
        <div className="mb-5">
          <div className="flex justify-between text-sm font-medium text-white mb-2">
            <span>Progreso a {nextTier.name}</span>
            <span>
              {membership.lifetime_points.toLocaleString()} / {nextTier.min_points_required.toLocaleString()} pts
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-white transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Row 4: Points total (large) */}
      <p className="text-4xl font-bold">
        {membership.points_balance.toLocaleString()}
        <span className="text-lg font-medium text-white/90 ml-2">puntos totales</span>
      </p>
    </div>
  )
}
