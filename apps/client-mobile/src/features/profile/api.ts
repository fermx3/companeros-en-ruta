import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface ClientProfile {
  id: string
  public_id: string
  business_name: string | null
  legal_name: string | null
  owner_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_postal_code: string | null
  status: string
  zone_name: string | null
  market_name: string | null
  client_type_name: string | null
  total_points: number
  total_orders: number
  last_order_date: string | null
  last_visit_date: string | null
  created_at: string
  onboarding_completed: boolean | null
}

export function useClientProfile() {
  return useQuery<ClientProfile>({
    queryKey: ['client', 'profile'],
    queryFn: () => apiFetch<ClientProfile>('/api/client/profile'),
  })
}

export function useUpdateClientProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: { phone?: string; whatsapp?: string }) =>
      apiFetch<{ success: true }>('/api/client/profile', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', 'profile'] })
    },
  })
}
