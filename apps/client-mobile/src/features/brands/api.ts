import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface JoinBrandResponse {
  success: true
  message: string
  membership: {
    id: string
    public_id: string
    brand_name: string
    status: string
  }
}

export function useJoinBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (brand_id: string) =>
      apiFetch<JoinBrandResponse>('/api/client/brands', {
        method: 'POST',
        body: JSON.stringify({ brand_id }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', 'brands'] })
      qc.invalidateQueries({ queryKey: ['client', 'memberships'] })
    },
  })
}
