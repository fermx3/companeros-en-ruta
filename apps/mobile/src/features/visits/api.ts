import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface VisitListItem {
  id: string
  public_id: string
  visit_number: string
  visit_status: string
  status: string
  visit_date: string | null
  check_in_time: string | null
  check_out_time: string | null
  client: {
    id: string
    public_id: string
    business_name: string | null
    owner_name: string | null
    owner_last_name: string | null
    address_street: string | null
    address_neighborhood: string | null
    phone: string | null
  } | null
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
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useMyVisits(dateRange: 'today' | 'week' | 'month' = 'month') {
  return useQuery<VisitsResponse>({
    queryKey: ['promotor', 'visits', dateRange],
    queryFn: () =>
      apiFetch<VisitsResponse>(`/api/promotor/visits?date_range=${dateRange}`),
  })
}
