import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import { env } from '@/env'
import { supabase } from '@/lib/supabase'

/**
 * In local dev the Supabase Storage `getPublicUrl()` returns paths with the
 * web app's `NEXT_PUBLIC_SUPABASE_URL` (typically `http://127.0.0.1:54321`).
 * That host is unreachable from a physical phone or simulator on a different
 * loopback. In dev we rewrite to the host the mobile app is configured with
 * (`EXPO_PUBLIC_SUPABASE_URL`); in production both sides hit the public
 * Supabase URL so the rewrite is a no-op.
 */
function rewriteDevAssetUrl(url: string): string {
  if (!__DEV__) return url
  try {
    const u = new URL(url)
    if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') {
      const target = new URL(env.SUPABASE_URL)
      u.hostname = target.hostname
      u.port = target.port
      u.protocol = target.protocol
      return u.toString()
    }
  } catch {
    // ignore — return untouched
  }
  return url
}

export interface VisitClient {
  id: string
  public_id: string
  business_name: string | null
  owner_name: string | null
  owner_last_name: string | null
  address_street: string | null
  address_neighborhood: string | null
  phone: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface VisitListItem {
  id: string
  public_id: string
  visit_number: string
  visit_status: string
  status: string
  visit_date: string | null
  check_in_time: string | null
  check_out_time: string | null
  promotor_notes?: string | null
  client: VisitClient | null
  brand: { id: string; name: string; logo_url: string | null } | null
}

export interface VisitsResponse {
  visits: VisitListItem[]
  metrics: {
    totalClients: number
    monthlyQuota: number
    completedVisits: number
    effectiveness: number
  }
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface EvidenceItem {
  id: string
  visit_id: string
  evidence_stage: string
  evidence_type: string | null
  file_url: string
  file_name: string | null
  caption: string | null
  capture_latitude: number | null
  capture_longitude: number | null
  captured_at: string | null
  created_at: string
}

export function useMyVisits(dateRange: 'today' | 'week' | 'month' = 'month') {
  return useQuery<VisitsResponse>({
    queryKey: ['promotor', 'visits', dateRange],
    queryFn: () => apiFetch<VisitsResponse>(`/api/promotor/visits?date_range=${dateRange}`),
  })
}

export function useVisit(visitId: string | undefined) {
  return useQuery<{ visit: VisitListItem }>({
    queryKey: ['promotor', 'visit', visitId],
    queryFn: () => apiFetch<{ visit: VisitListItem }>(`/api/promotor/visits/${visitId}`),
    enabled: !!visitId,
  })
}

export function useEvidence(visitId: string | undefined) {
  return useQuery<{ evidence: EvidenceItem[] }>({
    queryKey: ['promotor', 'visit', visitId, 'evidence'],
    queryFn: async () => {
      const data = await apiFetch<{ evidence: EvidenceItem[] }>(
        `/api/promotor/visits/${visitId}/evidence`
      )
      return {
        evidence: data.evidence.map(e => ({ ...e, file_url: rewriteDevAssetUrl(e.file_url) })),
      }
    },
    enabled: !!visitId,
  })
}

export function useCheckIn(visitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (coords: { latitude: number; longitude: number } | null) =>
      apiFetch<{ visit: VisitListItem }>(`/api/promotor/visits/${visitId}/checkin`, {
        method: 'POST',
        body: JSON.stringify(coords ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotor', 'visit', visitId] })
      qc.invalidateQueries({ queryKey: ['promotor', 'visits'] })
    },
  })
}

export function useCheckOut(visitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { promotor_notes?: string; latitude?: number; longitude?: number }) =>
      apiFetch<{ visit: VisitListItem; duration_minutes: number }>(
        `/api/promotor/visits/${visitId}/checkout`,
        { method: 'POST', body: JSON.stringify(payload) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotor', 'visit', visitId] })
      qc.invalidateQueries({ queryKey: ['promotor', 'visits'] })
    },
  })
}

export function useUpdateVisitNotes(visitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (promotor_notes: string) =>
      apiFetch<{ visit: VisitListItem }>(`/api/promotor/visits/${visitId}`, {
        method: 'PUT',
        body: JSON.stringify({ promotor_notes }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotor', 'visit', visitId] })
    },
  })
}

export function useUploadEvidence(visitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      uri: string
      mimeType: string
      fileName: string
      evidenceStage: 'pricing' | 'inventory' | 'communication'
      caption?: string
      latitude?: number
      longitude?: number
    }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      const formData = new FormData()
      // RN multipart: pass an object with uri+type+name; cast through unknown
      // because RN's FormData accepts this shape but TS expects Blob/File.
      formData.append('file', {
        uri: input.uri,
        type: input.mimeType,
        name: input.fileName,
      } as unknown as Blob)
      formData.append('evidence_stage', input.evidenceStage)
      if (input.caption) formData.append('caption', input.caption)
      if (input.latitude != null) formData.append('capture_latitude', String(input.latitude))
      if (input.longitude != null) formData.append('capture_longitude', String(input.longitude))

      const res = await fetch(`${env.WEB_API_BASE}/api/promotor/visits/${visitId}/evidence`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          // Do NOT set Content-Type — RN sets the multipart boundary automatically.
        },
        body: formData,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText}: ${text}`)
      }
      return res.json() as Promise<{ evidence: EvidenceItem }>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotor', 'visit', visitId, 'evidence'] })
    },
  })
}
