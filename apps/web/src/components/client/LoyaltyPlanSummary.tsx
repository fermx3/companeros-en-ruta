'use client'

interface MembershipLite {
  points_balance: number
  current_tier: { name: string } | null
}

interface LoyaltyPlanSummaryProps {
  memberships: MembershipLite[]
  promotionsCount: number
  membershipsCount: number
}

/**
 * Aggregated snapshot of the client's standing inside the generic Perfectapp
 * loyalty plan. Sits above per-brand tier cards so the dashboard answers
 * "how am I doing overall" before drilling into specifics.
 *
 * Alcance is rendered as a placeholder until purchase tracking (OCR ticket /
 * POS integration) lands in a later PR.
 */
export function LoyaltyPlanSummary({
  memberships,
  promotionsCount,
  membershipsCount,
}: LoyaltyPlanSummaryProps) {
  const totalPoints = memberships.reduce((sum, m) => sum + (m.points_balance ?? 0), 0)
  const primaryTierName =
    memberships.map(m => m.current_tier?.name).find(Boolean) ?? 'Perfectapp'

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
      <div className="bg-primary/10 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          Plan Perfectapp
        </p>
        <p className="text-lg font-bold text-navy mt-0.5">{primaryTierName}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2">
        <SummaryTile
          value={totalPoints.toLocaleString('es-MX')}
          unit="puntos"
          label="Mis puntos"
        />
        <SummaryTile value={String(promotionsCount)} unit="promos" label="Promos activas" />
        <SummaryTile value="—" unit="próx." label="Alcance" muted />
        <SummaryTile value={String(membershipsCount)} unit="marcas" label="Mis marcas" />
      </div>
    </div>
  )
}

function SummaryTile({
  value,
  unit,
  label,
  muted = false,
}: {
  value: string
  unit: string
  label: string
  muted?: boolean
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 px-3 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
        {label}
      </p>
      <p
        className={`text-2xl font-black mt-1 ${muted ? 'text-muted-foreground' : 'text-navy'}`}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground truncate">{unit}</p>
    </div>
  )
}
