import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface SupervisorTeamMember {
  id: string
  public_id: string
  full_name: string
  email: string
  phone: string | null
  status: string
  total_clients: number
  completed_visits: number
  pending_visits: number
  avg_rating: number
}

export interface SupervisorTeamMemberDetail {
  profile: {
    id: string
    full_name: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
    status: string
  }
  stats: {
    total_clients: number
    completed_visits: number
    pending_visits: number
    avg_rating: number
  }
  assigned_clients: {
    id: string
    name: string
    public_id: string
    client_type: string
    status: string
    contact_email: string | null
    contact_phone: string | null
    assignment_type: string
  }[]
  recent_visits: {
    id: string
    visit_date: string
    visit_status: string
    client_satisfaction_rating: number | null
    client_name: string
  }[]
}

interface TeamListResponse {
  team_members: SupervisorTeamMember[]
}

export function useSupervisorTeam(search?: string) {
  return useQuery<TeamListResponse>({
    queryKey: ['supervisor', 'team', search ?? ''],
    queryFn: () => {
      const qs = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
      return apiFetch<TeamListResponse>(`/api/supervisor/team${qs}`)
    },
  })
}

export function useSupervisorTeamMember(id: string | undefined) {
  return useQuery<SupervisorTeamMemberDetail>({
    queryKey: ['supervisor', 'team', 'detail', id],
    queryFn: () => apiFetch<SupervisorTeamMemberDetail>(`/api/supervisor/team/${id}`),
    enabled: !!id,
  })
}
