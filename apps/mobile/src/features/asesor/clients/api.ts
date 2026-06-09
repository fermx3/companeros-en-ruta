import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface AsesorClient {
  id: string
  public_id: string
  business_name: string
  owner_name: string | null
  owner_last_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  status: string
  source_id: string
  source_type: 'assignment' | 'membership'
  source_status: string
}

export interface AsesorClientDetail {
  client: {
    id: string
    public_id: string
    business_name: string
    owner_name: string | null
    owner_last_name: string | null
    email: string | null
    phone: string | null
    whatsapp: string | null
    address: {
      street: string | null
      city: string | null
      state: string | null
      postal_code: string | null
    }
    location: { latitude: number; longitude: number } | null
    status: string
    zone: { id: string; name: string } | null
    market: { id: string; name: string } | null
    client_type: { id: string; name: string } | null
    created_at: string
  }
  memberships: {
    id: string
    status: string
    points_balance: number
    total_points_earned: number
    brand: { id: string; name: string; logo_url: string | null } | null
    tier: { id: string; name: string; min_points_required: number } | null
    created_at: string
  }[]
  recent_orders: {
    id: string
    public_id: string
    order_number: string
    order_status: string
    order_date: string
    total_amount: number
    created_at: string
  }[]
  stats: {
    total_orders: number
    total_sales: number
    pending_orders: number
    completed_orders: number
  }
}

interface ClientsResponse {
  clients: AsesorClient[]
  total: number
}

export function useAsesorClients() {
  return useQuery<ClientsResponse>({
    queryKey: ['asesor', 'clients'],
    queryFn: () => apiFetch<ClientsResponse>('/api/asesor-ventas/clients'),
  })
}

export function useAsesorClient(publicId: string | undefined) {
  return useQuery<AsesorClientDetail>({
    queryKey: ['asesor', 'clients', publicId],
    queryFn: () => apiFetch<AsesorClientDetail>(`/api/asesor-ventas/clients/${publicId}`),
    enabled: !!publicId,
  })
}
