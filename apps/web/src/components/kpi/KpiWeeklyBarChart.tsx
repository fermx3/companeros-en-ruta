'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface WeekData {
  week: string
  revenue: number
  weight_tons?: number
}

interface KpiWeeklyBarChartProps {
  data: WeekData[]
  dataKey?: string
  color?: string
  label?: string
  unit?: string
}

const HEX_MAP: Record<string, string> = {
  blue: '#2563EB', green: '#16A34A', purple: '#9333EA',
  orange: '#EA580C', red: '#DC2626', cyan: '#0891B2', amber: '#D97706',
}

function formatWeekLabel(week: string): string {
  const d = new Date(week + 'T00:00:00')
  const day = d.getDate()
  const month = d.toLocaleString('es-MX', { month: 'short' })
  return `${day} ${month}`
}

function formatTooltipValue(value: number, unit?: string): string {
  if (unit === 'MXN') {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`
    return `$${value.toLocaleString('es-MX')}`
  }
  return value.toLocaleString()
}

export function KpiWeeklyBarChart({
  data, dataKey = 'revenue', color = 'blue', label = 'Semanal', unit = 'MXN',
}: KpiWeeklyBarChartProps) {
  const hex = HEX_MAP[color] || HEX_MAP.blue
  const chartData = data.map(d => ({ ...d, label: formatWeekLabel(d.week) }))

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{label}</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
            tickFormatter={(v) => formatTooltipValue(v, unit)}
            width={60}
          />
          <Tooltip
            formatter={(value: number) => [formatTooltipValue(value, unit), label]}
            labelStyle={{ fontSize: 12 }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey={dataKey} fill={hex} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
