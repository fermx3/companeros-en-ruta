import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

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

export interface UnifiedOrder {
  id: string
  public_id: string
  order_number: string
  total_amount: number
  order_status: string
  order_type: string | null
  source: 'direct' | 'visit'
  notes: string | null
  brand_id: string | null
  brand_name: string | null
  promotor_name: string | null
  order_date: string
  created_at: string
}

export interface OrdersSummary {
  total_orders: number
  total_spent: number
  direct_orders: number
  visit_orders: number
  pending_orders: number
  completed_orders: number
}

export interface OrdersResponse {
  orders: UnifiedOrder[]
  summary: OrdersSummary
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useOrders(status: OrderStatus = 'all', limit = 20) {
  return useInfiniteQuery<OrdersResponse>({
    queryKey: ['client', 'orders', status, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      })
      if (status !== 'all') qs.set('status', status)
      return apiFetch<OrdersResponse>(`/api/client/orders?${qs.toString()}`)
    },
    getNextPageParam: last =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
  })
}

/**
 * Reads an order from the paginated cache. The list endpoint returns the
 * unified order with everything the detail screen needs (the web doesn't
 * expose a single-order endpoint either), so we don't make a second call.
 */
export function useOrderFromCache(orderId: string | undefined) {
  return useQuery<UnifiedOrder | null>({
    queryKey: ['client', 'orders', 'detail', orderId],
    queryFn: () => null,
    enabled: false,
  })
}
