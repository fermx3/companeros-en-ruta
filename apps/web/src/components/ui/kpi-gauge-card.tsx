import type { LucideIcon } from 'lucide-react'

interface KpiGaugeCardProps {
  label: string
  value: number
  unit: string
  description?: string
  icon: LucideIcon
  color: string
}

const HEX_MAP: Record<string, string> = {
  blue: '#2563EB',
  green: '#16A34A',
  purple: '#9333EA',
  orange: '#EA580C',
  red: '#DC2626',
  cyan: '#0891B2',
  amber: '#D97706',
}

const BG_MAP: Record<string, string> = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  purple: 'bg-purple-50',
  orange: 'bg-orange-50',
  red: 'bg-red-50',
  cyan: 'bg-cyan-50',
  amber: 'bg-amber-50',
}

const TEXT_MAP: Record<string, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  cyan: 'text-cyan-600',
  amber: 'text-amber-600',
}

function formatCompactValue(value: number, unit: string): string {
  if (unit === '%') return `${value}%`
  if (unit === 'MXN') {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`
    return `$${value.toLocaleString('es-MX')}`
  }
  return value.toLocaleString()
}

export function KpiGaugeCard({ label, value, unit, description, icon: Icon, color }: KpiGaugeCardProps) {
  const hex = HEX_MAP[color] || HEX_MAP.blue
  const bgClass = BG_MAP[color] || BG_MAP.blue
  const textClass = TEXT_MAP[color] || TEXT_MAP.blue

  if (unit === '%') {
    return <GaugeMode label={label} value={value} description={description} icon={Icon} hex={hex} bgClass={bgClass} textClass={textClass} />
  }
  return <ValueMode label={label} value={value} unit={unit} description={description} icon={Icon} hex={hex} bgClass={bgClass} textClass={textClass} />
}

function GaugeMode({ label, value, description, icon: Icon, hex, bgClass, textClass }: {
  label: string; value: number; description?: string; icon: LucideIcon; hex: string; bgClass: string; textClass: string
}) {
  const clamped = Math.min(Math.max(value, 0), 100)
  const radius = 54
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (clamped / 100) * circumference

  return (
    <div className={`${bgClass}/40 rounded-2xl p-5 shadow-sm border border-white/60 hover:shadow-md transition-shadow relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <div className={`h-8 w-8 ${bgClass} rounded-lg flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${textClass}`} />
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative inline-flex items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 128 128" className="-rotate-90">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-200/60" />
            <circle
              cx="64" cy="64" r={radius} fill="none"
              stroke={hex} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute text-3xl font-bold text-gray-900">{value}%</span>
        </div>
      </div>

      {description && (
        <p className="text-xs text-gray-500 text-center mt-2">{description}</p>
      )}
    </div>
  )
}

function ValueMode({ label, value, unit, description, icon: Icon, hex, bgClass, textClass }: {
  label: string; value: number; unit: string; description?: string; icon: LucideIcon; hex: string; bgClass: string; textClass: string
}) {
  return (
    <div className={`${bgClass}/40 rounded-2xl p-5 shadow-sm border border-white/60 hover:shadow-md transition-shadow relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <div className={`h-8 w-8 ${bgClass} rounded-lg flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${textClass}`} />
        </div>
      </div>

      <p className="text-3xl font-bold text-gray-900 mb-1">
        {formatCompactValue(value, unit)}
      </p>

      <div className="flex items-center gap-2 mt-2">
        <span
          className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${hex}15`, color: hex }}
        >
          {unit}
        </span>
      </div>

      {description && (
        <p className="text-xs text-gray-500 mt-3">{description}</p>
      )}
    </div>
  )
}

export function KpiGaugeCardSkeleton({ isGauge = false }: { isGauge?: boolean }) {
  return (
    <div className="bg-gray-50/60 rounded-2xl p-5 shadow-sm border border-white/60 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-3 bg-muted rounded w-20" />
        <div className="h-8 w-8 bg-muted rounded-lg" />
      </div>
      {isGauge ? (
        <div className="flex justify-center">
          <div className="h-[140px] w-[140px] rounded-full border-8 border-muted" />
        </div>
      ) : (
        <>
          <div className="h-9 bg-muted rounded w-32 mb-2" />
          <div className="h-5 bg-muted rounded w-12 mt-2" />
        </>
      )}
    </div>
  )
}
