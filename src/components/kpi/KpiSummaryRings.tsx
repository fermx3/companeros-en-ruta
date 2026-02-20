'use client'

import { KpiProgressRing } from './KpiProgressRing'

interface KpiSummaryItem {
  slug: string
  label: string
  actual: number
  target: number | null
  unit: string
  color: string
}

interface KpiSummaryRingsProps {
  kpis: KpiSummaryItem[]
  loading?: boolean
}

export function KpiSummaryRings({ kpis, loading }: KpiSummaryRingsProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap justify-center gap-8 py-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center animate-pulse">
            <div className="h-[140px] w-[140px] rounded-full border-8 border-muted" />
            <div className="h-3 bg-muted rounded w-20 mt-3" />
          </div>
        ))}
      </div>
    )
  }

  if (kpis.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No hay KPIs configurados
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-8 py-4">
      {kpis.map(kpi => (
        <KpiProgressRing
          key={kpi.slug}
          label={kpi.label}
          actual={kpi.actual}
          target={kpi.target}
          unit={kpi.unit}
          color={kpi.color}
        />
      ))}
    </div>
  )
}
