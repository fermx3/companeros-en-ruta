'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface ZoneData {
  zone_name: string | null
  value: number
}

interface KpiZoneHorizontalBarProps {
  data: ZoneData[]
  color?: string
  label?: string
  unit?: string
}

const HEX_MAP: Record<string, string> = {
  blue: '#2563EB', green: '#16A34A', purple: '#9333EA',
  orange: '#EA580C', red: '#DC2626', cyan: '#0891B2', amber: '#D97706',
}

function formatValue(value: number, unit?: string): string {
  if (unit === 'MXN') {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`
    return `$${value.toLocaleString('es-MX')}`
  }
  if (unit === '%') return `${value}%`
  return value.toLocaleString()
}

export function KpiZoneHorizontalBar({
  data, color = 'blue', label = 'Por Zona', unit,
}: KpiZoneHorizontalBarProps) {
  const hex = HEX_MAP[color] || HEX_MAP.blue
  const chartData = data.map(d => ({
    zone: d.zone_name || 'Sin zona',
    value: d.value,
  }))

  if (chartData.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{label}</p>
        <p className="text-sm text-gray-400 text-center py-8">Sin datos por zona</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{label}</p>
      <ResponsiveContainer width="100%" height={Math.max(chartData.length * 40 + 20, 120)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
            tickFormatter={(v) => formatValue(v, unit)}
          />
          <YAxis
            type="category" dataKey="zone" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
            width={80}
          />
          <Tooltip
            formatter={(value: number) => [formatValue(value, unit), label]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="value" fill={hex} radius={[0, 4, 4, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
