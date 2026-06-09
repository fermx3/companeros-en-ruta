import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface RedeemPayload {
  qr_code: string
  latitude?: number
  longitude?: number
  notes?: string
}

export interface RedeemResponse {
  success: boolean
  message: string
  redemption_id: string
}

export function useRedeemQR() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RedeemPayload) =>
      apiFetch<RedeemResponse>('/api/qr/redeem', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asesor', 'stats'] })
    },
  })
}
