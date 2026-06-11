import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface PromotorClientBrand {
  id: string
  name: string
  logo_url: string | null
}

export interface PromotorClient {
  id: string
  public_id: string
  business_name: string
  owner_name: string | null
  owner_last_name: string | null
  address: string
  phone: string | null
  email: string | null
  status: string
  last_visit_date: string | null
  brands: PromotorClientBrand[]
  assignment: { type: string; priority: number }
}

interface PromotorClientsResponse {
  clients: PromotorClient[]
  total: number
}

/**
 * Assigned clients for the promotor. Endpoint groups by client and attaches
 * brand list + last completed visit date — enough to drive list + detail
 * without a separate [id] endpoint (detail screen looks up by id in cache).
 */
export function usePromotorClients(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return useQuery<PromotorClientsResponse>({
    queryKey: ['promotor', 'clients', search ?? ''],
    queryFn: () => apiFetch<PromotorClientsResponse>(`/api/promotor/clients${qs}`),
  })
}
