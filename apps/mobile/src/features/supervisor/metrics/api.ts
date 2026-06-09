import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface SupervisorMetricsTeamMember {
  id: string
  full_name: string
  email: string
  status: string
  total_clients: number
  completed_visits: number
  pending_visits: number
  avg_rating: number
}

export interface SupervisorMetricsResponse {
  team_size: number
  total_clients: number
  total_visits: number
  completed_visits: number
  pending_visits: number
  visits_this_month: number
  avg_team_rating: number
  team_members: SupervisorMetricsTeamMember[]
}

export function useSupervisorMetrics() {
  return useQuery<SupervisorMetricsResponse>({
    queryKey: ['supervisor', 'metrics'],
    queryFn: () => apiFetch<SupervisorMetricsResponse>('/api/supervisor/metrics'),
  })
}
