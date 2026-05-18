import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface PointsTransaction {
  id: string
  public_id: string
  transaction_type: string
  points: number
  balance_after: number
  source_type: string | null
  source_description: string | null
  transaction_date: string
}

export interface BrandPointsSummary {
  brand_id: string
  brand_name: string
  brand_logo_url: string | null
  current_balance: number
  lifetime_points: number
  recent_transactions: PointsTransaction[]
}

export interface PointsSummaryResponse {
  total_balance: number
  total_lifetime_points: number
  brands: BrandPointsSummary[]
}

export interface PointsDetailResponse {
  brand: { id: string; name: string; logo_url: string | null }
  summary: { current_balance: number; lifetime_points: number }
  transactions: PointsTransaction[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export function usePointsSummary() {
  return useQuery<PointsSummaryResponse>({
    queryKey: ['client', 'points', 'summary'],
    queryFn: () => apiFetch<PointsSummaryResponse>('/api/client/points'),
  })
}

export function usePointsDetail(brandId: string | undefined, limit = 20) {
  return useInfiniteQuery<PointsDetailResponse>({
    queryKey: ['client', 'points', 'detail', brandId, limit],
    initialPageParam: 1,
    enabled: !!brandId,
    queryFn: ({ pageParam }) =>
      apiFetch<PointsDetailResponse>(
        `/api/client/points?brand_id=${brandId}&page=${pageParam}&limit=${limit}`
      ),
    getNextPageParam: last =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
  })
}
