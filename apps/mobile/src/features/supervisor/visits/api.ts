import { useInfiniteQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export type SupervisorVisitStatus =
  | 'all'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface SupervisorVisitItem {
  id: string
  visit_date: string
  visit_status: string
  client_satisfaction_rating: number | null
  promotor_id: string
  promotor_name: string
  client_name: string
}

export interface SupervisorVisitsResponse {
  visits: SupervisorVisitItem[]
  pagination: {
    page: number
    totalPages: number
    total: number
  }
  team_members: { id: string; name: string }[]
}

interface VisitsFilters {
  status?: SupervisorVisitStatus
  promotorId?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}

export function useSupervisorVisits(filters: VisitsFilters = {}) {
  const { status = 'all', promotorId, dateFrom, dateTo, limit = 20 } = filters
  return useInfiniteQuery<SupervisorVisitsResponse>({
    queryKey: ['supervisor', 'visits', status, promotorId ?? '', dateFrom ?? '', dateTo ?? '', limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams({ page: String(pageParam), limit: String(limit) })
      if (status !== 'all') qs.set('status', status)
      if (promotorId) qs.set('promotor_id', promotorId)
      if (dateFrom) qs.set('date_from', dateFrom)
      if (dateTo) qs.set('date_to', dateTo)
      return apiFetch<SupervisorVisitsResponse>(`/api/supervisor/visits?${qs.toString()}`)
    },
    getNextPageParam: last =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
  })
}
