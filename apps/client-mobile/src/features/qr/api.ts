import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface QRCode {
  id: string
  code: string
  qr_type: string
  status: string // 'active' | 'used' | 'expired' | 'cancelled'
  max_redemptions: number | null
  redemption_count: number | null
  discount_type: string | null
  discount_value: number | null
  discount_description: string | null
  valid_from: string | null
  valid_until: string | null
  created_at: string
  promotion: { id: string; name: string } | null
  brand: { id: string; name: string; logo_url: string | null } | null
}

export interface QRCodesResponse {
  qr_codes: QRCode[]
  total: number
}

export interface GenerateQRBody {
  client_id: string
  brand_id: string
  promotion_id?: string | null
}

export function useQRCodes() {
  return useQuery<QRCodesResponse>({
    queryKey: ['client', 'qr'],
    queryFn: () => apiFetch<QRCodesResponse>('/api/qr/generate'),
  })
}

export function useGenerateQR() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GenerateQRBody) =>
      apiFetch<{ success: true; qr_code: QRCode }>('/api/qr/generate', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', 'qr'] })
    },
  })
}

/**
 * Build a human-readable discount label from the qr_codes.discount_type +
 * discount_value pair when there is no promotion-level discount_description.
 */
export function discountLabel(qr: Pick<QRCode, 'discount_type' | 'discount_value' | 'discount_description'>): string | null {
  if (qr.discount_description) return qr.discount_description
  if (qr.discount_type === 'percentage' && qr.discount_value != null) {
    return `-${qr.discount_value}%`
  }
  if (qr.discount_type === 'amount' && qr.discount_value != null) {
    return `-$${qr.discount_value.toFixed(2)}`
  }
  return null
}
