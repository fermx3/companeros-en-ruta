'use client'

import {
  TrendingUp, Target, Package, PieChart, LayoutGrid, Users, MapPin, Star,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface KpiProgressRingProps {
  label: string
  actual: number
  target: number | null
  unit: string
  color?: string
  icon?: string
  size?: number
}

const HEX_MAP: Record<string, string> = {
  blue: '#2563EB', green: '#16A34A', purple: '#9333EA',
  orange: '#EA580C', red: '#DC2626', cyan: '#0891B2', amber: '#D97706',
}

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp, Target, Package, PieChart, LayoutGrid, Users, MapPin, Star,
}

export function KpiProgressRing({
  label, actual, target, unit, color = 'blue', icon, size = 140,
}: KpiProgressRingProps) {
  const hex = HEX_MAP[color] || HEX_MAP.blue
  const pct = target && target > 0 ? Math.min(actual / target * 100, 100) : 0
  const radius = (size / 2) - 12
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (pct / 100) * circumference
  const viewBox = `0 0 ${size} ${size}`
  const center = size / 2

  const IconComponent = icon ? ICON_MAP[icon] : null

  const formatValue = (val: number) => {
    if (unit === 'MXN') {
      if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
      if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`
      return `$${val.toLocaleString('es-MX')}`
    }
    if (unit === '%') return `${val}%`
    return val.toLocaleString()
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} viewBox={viewBox} className="-rotate-90">
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="currentColor" strokeWidth={10}
            className="text-gray-200/60"
          />
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke={hex} strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold text-gray-900">{formatValue(actual)}</span>
          {target !== null && (
            <span className="text-xs text-gray-500">/ {formatValue(target)}</span>
          )}
          {IconComponent && (
            <IconComponent className="h-4 w-4 mt-1 opacity-50" style={{ color: hex }} />
          )}
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">{label}</p>
      {target !== null && (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full mt-1"
          style={{ backgroundColor: `${hex}15`, color: hex }}
        >
          {Math.round(pct)}% cumplimiento
        </span>
      )}
    </div>
  )
}
