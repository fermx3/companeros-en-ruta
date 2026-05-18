import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface QRCode {
  id: string
  public_id: string
  qr_code_string: string
  brand_id: string
  brand_name: string | null
  brand_logo_url: string | null
  brand_color_primary: string | null
  promotion_id: string | null
  promotion_name: string | null
  promotion_discount_display: string | null
  status: string // 'active' | 'used' | 'expired' | 'cancelled'
  valid_until: string | null
  created_at: string
  used_at: string | null
}

export interface QRCodesResponse {
  qr_codes: QRCode[]
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
    mutationFn: (body: { brand_id: string; promotion_id?: string | null }) =>
      apiFetch<{ qr_code: QRCode }>('/api/qr/generate', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', 'qr'] })
    },
  })
}
