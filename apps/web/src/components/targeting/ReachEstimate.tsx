'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Users } from 'lucide-react'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import type { TargetingCriteria } from '@/lib/types/database'

interface ReachEstimateProps {
  criteria: TargetingCriteria
  audience: 'client' | 'staff' | 'both'
}

interface ReachData {
  clients?: { total: number; matching: number }
  staff?: { total: number; matching: number }
}

export function ReachEstimate({ criteria, audience }: ReachEstimateProps) {
  const { brandFetch } = useBrandFetch()
  const [data, setData] = useState<ReachData | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      try {
        const res = await brandFetch('/api/brand/targeting/reach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ criteria, audience }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('reach failed')
        const result = await res.json()
        if (!controller.signal.aborted) setData(result)
      } catch {
        // ignore aborted
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [criteria, audience, brandFetch])

  const renderBar = (label: string, matching: number, total: number) => {
    const pct = total > 0 ? Math.round((matching / total) * 100) : 0
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-gray-900">
            {matching.toLocaleString()} de {total.toLocaleString()}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
        <Users className="w-3.5 h-3.5" />
        Alcance estimado
        {loading && <span className="text-blue-400 animate-pulse">actualizando...</span>}
      </div>

      {data ? (
        <div className="space-y-2">
          {data.clients && renderBar('Clientes', data.clients.matching, data.clients.total)}
          {data.staff && renderBar('Staff', data.staff.matching, data.staff.total)}
        </div>
      ) : (
        <p className="text-xs text-blue-600">Calculando...</p>
      )}
    </div>
  )
}
