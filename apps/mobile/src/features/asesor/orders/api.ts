import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export type OrderStatus =
  | 'all'
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export interface AsesorOrderListItem {
  id: string
  public_id: string
  order_number: string
  client: {
    id: string
    public_id: string
    business_name: string
    owner_name: string | null
    owner_last_name: string | null
  } | null
  brand: { id: string; name: string } | null
  order_status: string
  order_type: string | null
  source_channel: string
  order_date: string
  total_amount: number
  items_count: number
  created_at: string
}

export interface AsesorOrderDetail {
  id: string
  public_id: string
  order_number: string
  order_status: string
  order_type: string | null
  source_channel: string
  order_date: string
  requested_delivery_date: string | null
  delivery_address: string | null
  delivery_instructions: string | null
  payment_method: string
  payment_status: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  priority: string
  client_notes: string | null
  internal_notes: string | null
  created_at: string
  client: {
    id: string
    public_id: string
    business_name: string
    owner_name: string | null
    owner_last_name: string | null
    email: string | null
    phone: string | null
    address_street: string | null
    address_city: string | null
  } | null
  brand: { id: string; name: string } | null
  items: {
    id: string
    public_id: string
    line_number: number
    quantity_ordered: number
    quantity_delivered: number
    unit_price: number
    line_subtotal: number
    line_total: number
    unit_type: string
    item_status: string
    product: { id: string; name: string; sku: string | null } | null
    product_variant: { id: string; name: string } | null
  }[]
}

export interface OrdersListResponse {
  orders: AsesorOrderListItem[]
  summary: {
    total_orders: number
    total_sales: number
    pending_orders: number
    completed_orders: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateOrderItem {
  product_id: string
  quantity: number
  unit_price: number
  unit_type?: string
}

export interface CreateOrderPayload {
  client_id: string
  items: CreateOrderItem[]
  delivery_address?: string
  client_notes?: string
}

export function useAsesorOrders(status: OrderStatus = 'all', limit = 20) {
  return useInfiniteQuery<OrdersListResponse>({
    queryKey: ['asesor', 'orders', status, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams({ page: String(pageParam), limit: String(limit) })
      if (status !== 'all') qs.set('status', status)
      return apiFetch<OrdersListResponse>(`/api/asesor-ventas/orders?${qs.toString()}`)
    },
    getNextPageParam: last =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
  })
}

export function useAsesorOrder(id: string | undefined) {
  return useQuery<{ order: AsesorOrderDetail }>({
    queryKey: ['asesor', 'orders', 'detail', id],
    queryFn: () => apiFetch(`/api/asesor-ventas/orders/${id}`),
    enabled: !!id,
  })
}

export function useCreateAsesorOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      apiFetch<{ order: { id: string; public_id: string; order_number: string }; message: string }>(
        '/api/asesor-ventas/orders',
        { method: 'POST', body: JSON.stringify(payload) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asesor', 'orders'] })
    },
  })
}
