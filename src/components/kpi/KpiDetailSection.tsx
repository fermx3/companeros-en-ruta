'use client'

import { useState } from 'react'
import { KpiMetricCard } from './KpiMetricCard'
import { KpiWeeklyBarChart } from './KpiWeeklyBarChart'
import { KpiZoneHorizontalBar } from './KpiZoneHorizontalBar'

interface KpiDetailSectionProps {
  slug: string
  label: string
  color: string
  brandFetch: (url: string, init?: RequestInit) => Promise<Response>
  month: string
}

function useKpiDetail(
  brandFetch: (url: string, init?: RequestInit) => Promise<Response>,
  slug: string,
  month: string,
) {
  const endpoint = getEndpointForSlug(slug)
  const [state, setState] = useState<{
    key: string
    data: Record<string, unknown> | null
    loading: boolean
  }>({ key: '', data: null, loading: !!endpoint })

  const currentKey = `${slug}:${month}`

  if (currentKey !== state.key && endpoint) {
    // Trigger re-fetch by returning loading state immediately
    setState({ key: currentKey, data: null, loading: true })

    // Start fetch
    brandFetch(`${endpoint}?month=${month}`)
      .then(res => res.ok ? res.json() : null)
      .then(d => setState(prev => prev.key === currentKey ? { key: currentKey, data: d ?? {}, loading: false } : prev))
      .catch(() => setState(prev => prev.key === currentKey ? { key: currentKey, data: {}, loading: false } : prev))
  }

  if (!endpoint) return { data: null, loading: false }
  return { data: state.data, loading: state.loading }
}

export function KpiDetailSection({ slug, label, color, brandFetch, month }: KpiDetailSectionProps) {
  const { data, loading } = useKpiDetail(brandFetch, slug, month)

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-100 rounded-lg" />
          <div className="h-32 bg-gray-100 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-400">Sin datos para {label}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{label}</h3>
      {renderKpiContent(slug, data, color)}
    </div>
  )
}

function getEndpointForSlug(slug: string): string | null {
  const map: Record<string, string> = {
    volume: '/api/brand/kpis/volume',
    reach_mix: '/api/brand/kpis/reach',
    mix: '/api/brand/kpis/mix',
    assortment: '/api/brand/kpis/assortment',
    market_share: '/api/brand/kpis/market-share',
    share_of_shelf: '/api/brand/kpis/share-of-shelf',
  }
  return map[slug] || null
}

function renderKpiContent(slug: string, data: Record<string, unknown>, color: string) {
  switch (slug) {
    case 'volume':
      return <VolumeContent data={data} color={color} />
    case 'reach_mix':
      return <ReachContent data={data} color={color} />
    case 'mix':
      return <MixContent data={data} color={color} />
    case 'assortment':
      return <AssortmentContent data={data} color={color} />
    case 'market_share':
      return <MarketShareContent data={data} color={color} />
    case 'share_of_shelf':
      return <ShareOfShelfContent data={data} color={color} />
    default:
      return <p className="text-sm text-gray-400">KPI no soportado</p>
  }
}

function VolumeContent({ data, color }: { data: Record<string, unknown>; color: string }) {
  const weekly = (data.weekly || []) as Array<{ week: string; revenue: number; weight_tons: number }>
  const byZone = (data.by_zone || []) as Array<{ zone_name: string | null; revenue: number }>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KpiMetricCard
          label="Ingresos del mes" value={Number(data.monthly_total) || 0}
          unit="MXN" target={data.target as number | null}
          achievement_pct={data.achievement_pct as number | null} color={color}
        />
        <KpiMetricCard
          label="Peso total" value={Number(data.weight_tons_total) || 0}
          unit="TONS" color={color}
        />
      </div>
      {weekly.length > 0 && (
        <KpiWeeklyBarChart data={weekly} color={color} label="Ingresos semanales" unit="MXN" />
      )}
      {byZone.length > 1 && (
        <KpiZoneHorizontalBar
          data={byZone.map(z => ({ zone_name: z.zone_name, value: z.revenue }))}
          color={color} label="Ingresos por zona" unit="MXN"
        />
      )}
    </div>
  )
}

function ReachContent({ data, color }: { data: Record<string, unknown>; color: string }) {
  const byZone = (data.by_zone || []) as Array<{ zone_name: string | null; reach_pct: number; clients_visited: number }>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiMetricCard
          label="Reach" value={Number(data.reach_pct) || 0} unit="%"
          target={data.target as number | null}
          achievement_pct={data.achievement_pct as number | null} color={color}
        />
        <KpiMetricCard
          label="Clientes visitados" value={Number(data.monthly_total_visited) || 0} unit="" color={color}
        />
        <KpiMetricCard
          label="Miembros activos" value={Number(data.total_active_members) || 0} unit="" color={color}
        />
      </div>
      {byZone.length > 1 && (
        <KpiZoneHorizontalBar
          data={byZone.map(z => ({ zone_name: z.zone_name, value: z.reach_pct }))}
          color={color} label="Reach por zona" unit="%"
        />
      )}
    </div>
  )
}

function MixContent({ data, color }: { data: Record<string, unknown>; color: string }) {
  const channels = (data.channels || []) as Array<{ market_name: string; client_count: number }>

  return (
    <div className="space-y-6">
      <KpiMetricCard
        label="Canales distintos" value={Number(data.distinct_count) || 0} unit="channels"
        target={data.target as number | null}
        achievement_pct={data.achievement_pct as number | null} color={color}
      />
      {channels.length > 0 && (
        <KpiZoneHorizontalBar
          data={channels.map(c => ({ zone_name: c.market_name, value: c.client_count }))}
          color={color} label="Clientes por canal" unit=""
        />
      )}
    </div>
  )
}

function AssortmentContent({ data, color }: { data: Record<string, unknown>; color: string }) {
  const byZone = (data.by_zone || []) as Array<{ zone_name: string | null; avg_pct: number }>

  return (
    <div className="space-y-6">
      <KpiMetricCard
        label="Assortment promedio" value={Number(data.avg_pct) || 0} unit="%"
        target={data.target as number | null}
        achievement_pct={data.achievement_pct as number | null} color={color}
      />
      {byZone.length > 1 && (
        <KpiZoneHorizontalBar
          data={byZone.map(z => ({ zone_name: z.zone_name, value: z.avg_pct }))}
          color={color} label="Assortment por zona" unit="%"
        />
      )}
    </div>
  )
}

function MarketShareContent({ data, color }: { data: Record<string, unknown>; color: string }) {
  const byZone = (data.by_zone || []) as Array<{ zone_name: string | null; share_pct: number }>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiMetricCard
          label="Market Share" value={Number(data.share_pct) || 0} unit="%"
          target={data.target as number | null}
          achievement_pct={data.achievement_pct as number | null} color={color}
        />
        <KpiMetricCard label="Productos marca" value={Number(data.brand_present) || 0} unit="" color={color} />
        <KpiMetricCard label="Productos competidores" value={Number(data.competitor_present) || 0} unit="" color="red" />
      </div>
      {byZone.length > 1 && (
        <KpiZoneHorizontalBar
          data={byZone.map(z => ({ zone_name: z.zone_name, value: z.share_pct }))}
          color={color} label="Market Share por zona" unit="%"
        />
      )}
    </div>
  )
}

function ShareOfShelfContent({ data, color }: { data: Record<string, unknown>; color: string }) {
  const byZone = (data.by_zone || []) as Array<{ zone_name: string | null; combined_pct: number }>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiMetricCard
          label="Combinado" value={Number(data.combined_pct) || 0} unit="%"
          target={data.target as number | null}
          achievement_pct={data.achievement_pct as number | null} color={color}
        />
        <KpiMetricCard label="POP presente" value={Number(data.pop_pct) || 0} unit="%" color={color} />
        <KpiMetricCard label="Exhibiciones" value={Number(data.exhib_pct) || 0} unit="%" color={color} />
      </div>
      {byZone.length > 1 && (
        <KpiZoneHorizontalBar
          data={byZone.map(z => ({ zone_name: z.zone_name, value: z.combined_pct }))}
          color={color} label="Share of Shelf por zona" unit="%"
        />
      )}
    </div>
  )
}
