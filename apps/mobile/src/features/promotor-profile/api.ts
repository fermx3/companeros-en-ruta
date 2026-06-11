import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface PromotorProfile {
  id: string
  public_id: string
  full_name: string
  email: string | null
  phone: string | null
  zone_name: string | null
  specialization: string | null
  experience_level: string | null
  total_assigned_clients: number
  performance_rating: number | null
}

export function usePromotorProfile() {
  return useQuery<PromotorProfile>({
    queryKey: ['promotor', 'profile'],
    queryFn: () => apiFetch<PromotorProfile>('/api/promotor/profile'),
  })
}
