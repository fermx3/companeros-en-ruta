import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface AsesorProfile {
  id: string
  public_id: string
  full_name: string
  email: string | null
  phone: string | null
  distributor_id: string | null
  distributor_name: string | null
  total_clients: number
  hasDistributor: boolean
  needsDistributorAssignment: boolean
}

export interface AsesorStats {
  total_orders: number
  orders_this_month: number
  pending_orders: number
  completed_orders: number
  total_sales_amount: number
  avg_order_value: number
  total_clients: number
  qr_redeemed_this_month: number
  total_qr_redeemed: number
}

export function useAsesorProfile() {
  return useQuery<AsesorProfile>({
    queryKey: ['asesor', 'profile'],
    queryFn: () => apiFetch<AsesorProfile>('/api/asesor-ventas/profile'),
  })
}

export function useAsesorStats() {
  return useQuery<{ stats: AsesorStats }>({
    queryKey: ['asesor', 'stats'],
    queryFn: () => apiFetch<{ stats: AsesorStats }>('/api/asesor-ventas/stats'),
  })
}
