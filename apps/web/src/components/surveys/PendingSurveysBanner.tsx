'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'

interface PendingSurvey {
  id: string
  title: string
  brands: { name: string; logo_url: string | null } | null
  has_responded?: boolean
}

interface PendingSurveysBannerProps {
  /** Destination for the "Responder →" CTA, e.g. "/asesor-ventas/surveys". */
  surveysHref: string
}

/**
 * Persistent banner shown above the Home content of every role that can
 * answer surveys (client, asesor, promotor, supervisor). Hidden when there
 * are zero pending surveys so it doesn't add noise on a clean inbox.
 *
 * Hits the shared /api/surveys endpoint — it already filters by the
 * authenticated user's roles via target_roles overlap, so each surface only
 * sees its own pending list without any extra parameters.
 */
export function PendingSurveysBanner({ surveysHref }: PendingSurveysBannerProps) {
  const [pending, setPending] = useState<PendingSurvey[]>([])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/surveys')
      if (!res.ok) return
      const data = await res.json()
      const list = (data.surveys ?? []) as PendingSurvey[]
      setPending(list.filter(s => !s.has_responded))
    } catch {
      // Silent — the banner is a hint, not a critical surface.
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (pending.length === 0) return null

  return (
    <Link
      href={surveysHref}
      className="block rounded-2xl bg-primary p-4 text-white shadow-sm hover:opacity-95 transition-opacity"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">
            {pending.length === 1
              ? 'Tienes 1 encuesta pendiente'
              : `Tienes ${pending.length} encuestas pendientes`}
          </p>
          <p className="text-xs opacity-90 truncate">
            {pending[0].brands?.name
              ? `Empieza con ${pending[0].brands.name}`
              : 'Responde para ayudarnos a mejorar'}
          </p>
        </div>
        <span className="text-xs font-bold whitespace-nowrap">Responder →</span>
      </div>
    </Link>
  )
}
