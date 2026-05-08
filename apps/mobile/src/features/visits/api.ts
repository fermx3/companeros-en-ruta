import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import { env } from '@/env'
import { supabase } from '@/lib/supabase'

import type {
  AssessmentPostBody,
  BrandCompetitorsResponse,
  BrandExhibitionsResponse,
  BrandProductsResponse,
  ClientPromotionsResponse,
  CommunicationPlansResponse,
  CreateOrderBody,
  DistributorsResponse,
  PopMaterialsResponse,
  VisitAssessmentResponse,
  VisitOrdersResponse,
} from './types'

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

// ----- Catalog hooks (brand-scoped; resolveBrandAuth picks up the promotor's brand) -----

export function useBrandProducts(brandId: string | undefined) {
  return useQuery<BrandProductsResponse>({
    queryKey: ['brand', 'products', brandId],
    queryFn: () => apiFetch<BrandProductsResponse>(`/api/brand/products?brand_id=${brandId}`),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000, // catalogs change infrequently within a visit
  })
}

export function useBrandCompetitors(brandId: string | undefined) {
  return useQuery<BrandCompetitorsResponse>({
    queryKey: ['brand', 'competitors', brandId],
    queryFn: () =>
      apiFetch<BrandCompetitorsResponse>(
        `/api/brand/competitors?brand_id=${brandId}&include_products=true`
      ),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCommunicationPlans(brandId: string | undefined) {
  return useQuery<CommunicationPlansResponse>({
    queryKey: ['brand', 'communication-plans', brandId],
    queryFn: () =>
      apiFetch<CommunicationPlansResponse>(
        `/api/brand/communication-plans?brand_id=${brandId}&active_only=true`
      ),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePopMaterials(brandId: string | undefined) {
  return useQuery<PopMaterialsResponse>({
    queryKey: ['brand', 'pop-materials', brandId],
    queryFn: () =>
      apiFetch<PopMaterialsResponse>(
        `/api/brand/pop-materials?brand_id=${brandId}&include_system=true`
      ),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useExhibitions(brandId: string | undefined) {
  return useQuery<BrandExhibitionsResponse>({
    queryKey: ['brand', 'exhibitions', brandId],
    queryFn: () =>
      apiFetch<BrandExhibitionsResponse>(
        `/api/brand/exhibitions?brand_id=${brandId}&active_only=true`
      ),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  })
}

// ----- Assessment hooks -----

export function useVisitAssessment(visitId: string | undefined) {
  return useQuery<VisitAssessmentResponse>({
    queryKey: ['promotor', 'visit', visitId, 'assessment'],
    queryFn: () => apiFetch<VisitAssessmentResponse>(`/api/promotor/visits/${visitId}/assessment`),
    enabled: !!visitId,
  })
}

export function useSaveStage(visitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AssessmentPostBody) =>
      apiFetch<{ success: true }>(`/api/promotor/visits/${visitId}/assessment`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotor', 'visit', visitId, 'assessment'] })
      qc.invalidateQueries({ queryKey: ['promotor', 'visit', visitId] })
    },
  })
}

export interface FinalizeError extends Error {
  status?: number
  missingStages?: number[]
}

export function useFinalizeAssessment(visitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      try {
        return await apiFetch<{ success: true; allStagesCompleted: true }>(
          `/api/promotor/visits/${visitId}/assessment`,
          { method: 'PUT' }
        )
      } catch (err) {
        // apiFetch throws ApiError with status + body; surface missing_stages
        // from the 400 body so callers can route the user back to the gap.
        if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
          const e = err as { status: number; body?: string }
          if (e.status === 400 && e.body) {
            try {
              const parsed = JSON.parse(e.body) as { stages?: Record<string, boolean> }
              if (parsed.stages) {
                const missing = Object.entries(parsed.stages)
                  .filter(([, done]) => !done)
                  .map(([k]) => Number(k.replace('stage', '')))
                const fe: FinalizeError = Object.assign(new Error('missing_stages'), {
                  status: 400,
                  missingStages: missing,
                })
                throw fe
              }
            } catch {
              /* fall through */
            }
          }
        }
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotor', 'visit', visitId, 'assessment'] })
    },
  })
}

// ----- Stage 2 hooks -----

export function useDistributors(brandId: string | undefined) {
  return useQuery<DistributorsResponse>({
    queryKey: ['promotor', 'distributors', brandId],
    queryFn: () =>
      apiFetch<DistributorsResponse>(`/api/promotor/distributors?brand_id=${brandId}`),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useClientPromotions(clientId: string | undefined, brandId: string | undefined) {
  return useQuery<ClientPromotionsResponse>({
    queryKey: ['client', clientId, 'promotions', brandId],
    queryFn: () => {
      const qs = brandId ? `?brand_id=${brandId}` : ''
      return apiFetch<ClientPromotionsResponse>(`/api/client/${clientId}/promotions${qs}`)
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useVisitOrders(visitId: string | undefined) {
  return useQuery<VisitOrdersResponse>({
    queryKey: ['promotor', 'visit', visitId, 'orders'],
    queryFn: () => apiFetch<VisitOrdersResponse>(`/api/promotor/visits/${visitId}/orders`),
    enabled: !!visitId,
  })
}

export function useCreateOrder(visitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrderBody) =>
      apiFetch<{ order_id: string; message?: string }>(
        `/api/promotor/visits/${visitId}/orders`,
        { method: 'POST', body: JSON.stringify(body) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotor', 'visit', visitId, 'orders'] })
    },
  })
}

export function useDeleteOrder(visitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) =>
      apiFetch<{ message?: string }>(
        `/api/promotor/visits/${visitId}/orders?order_id=${orderId}`,
        { method: 'DELETE' }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotor', 'visit', visitId, 'orders'] })
    },
  })
}
