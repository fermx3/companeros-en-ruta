'use client'

interface KpiMetricCardProps {
  label: string
  value: number
  unit: string
  target?: number | null
  achievement_pct?: number | null
  color?: string
}

const HEX_MAP: Record<string, string> = {
  blue: '#2563EB', green: '#16A34A', purple: '#9333EA',
  orange: '#EA580C', red: '#DC2626', cyan: '#0891B2', amber: '#D97706',
}

function formatValue(value: number, unit: string): string {
  if (unit === 'MXN') {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`
    return `$${value.toLocaleString('es-MX')}`
  }
  if (unit === '%') return `${value}%`
  if (unit === 'TONS') return `${value.toFixed(2)} t`
  if (unit === 'channels') return `${value}`
  return value.toLocaleString()
}

export function KpiMetricCard({
  label, value, unit, target, achievement_pct, color = 'blue',
}: KpiMetricCardProps) {
  const hex = HEX_MAP[color] || HEX_MAP.blue

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{formatValue(value, unit)}</p>
      <div className="flex items-center gap-2 mt-2">
        {target !== null && target !== undefined && (
          <span className="text-xs text-gray-500">Meta: {formatValue(target, unit)}</span>
        )}
        {achievement_pct !== null && achievement_pct !== undefined && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${hex}15`, color: hex }}
          >
            {achievement_pct}%
          </span>
        )}
      </div>
    </div>
  )
}
