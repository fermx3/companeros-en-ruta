import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import type { ClientProfile } from '@/features/profile/api'

export interface ClientOnboardingData {
  id: string
  owner_name: string | null
  owner_last_name: string | null
  gender: string | null
  date_of_birth: string | null
  email: string | null
  email_opt_in: boolean | null
  whatsapp: string | null
  whatsapp_opt_in: boolean | null
  client_type_id: string | null
  address_state: string | null
  address_postal_code: string | null
  has_meat_fridge: boolean | null
  has_soda_fridge: boolean | null
  accepts_card: boolean | null
  metadata: Record<string, unknown> | null
  onboarding_completed: boolean | null
}

export interface ClientType {
  id: string
  name: string
  code: string
}

export interface OnboardingResponse {
  client: ClientOnboardingData
  client_types: ClientType[]
}

export interface OnboardingPayload {
  owner_name: string
  owner_last_name?: string
  gender?: string
  date_of_birth?: string
  email?: string
  email_opt_in?: boolean
  whatsapp?: string
  whatsapp_opt_in?: boolean
  client_type_id?: string
  address_state?: string
  address_postal_code?: string
  latitude?: number
  longitude?: number
  has_meat_fridge?: boolean
  has_soda_fridge?: boolean
  accepts_card?: boolean
  employees?: string
  offers_topups?: boolean
  supply_sources?: string[]
  digital_restock?: boolean
  digital_restock_detail?: string
}

export function useOnboardingData() {
  return useQuery<OnboardingResponse>({
    queryKey: ['client', 'onboarding'],
    queryFn: () => apiFetch<OnboardingResponse>('/api/client/onboarding'),
  })
}

export function useSubmitOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: OnboardingPayload) =>
      apiFetch<{ success: true }>('/api/client/onboarding', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      // Optimistically flip the local cache flag so the index.tsx branch sees
      // the new state immediately on navigation. `invalidateQueries` triggers
      // a refetch but does not block the next render — without this patch,
      // the redirect lands back on /(onboarding)/welcome for one frame.
      qc.setQueryData<ClientProfile | undefined>(['client', 'profile'], old =>
        old ? { ...old, onboarding_completed: true } : old
      )
      await Promise.all([
        qc.refetchQueries({ queryKey: ['client', 'profile'] }),
        qc.invalidateQueries({ queryKey: ['client', 'onboarding'] }),
      ])
    },
  })
}
