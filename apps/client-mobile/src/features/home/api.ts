import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface ClientMembership {
  id: string
  public_id: string
  brand_id: string
  brand_name: string
  brand_logo_url: string | null
  membership_status: string
  joined_date: string | null
  points_balance: number
  lifetime_points: number
  current_tier: { id: string; name: string; min_points_required: number } | null
  next_tier: { id: string; name: string; min_points_required: number; points_needed: number } | null
}

export interface MembershipsResponse {
  memberships: ClientMembership[]
}

export interface AvailableBrand {
  id: string
  public_id: string
  name: string
  slug: string | null
  description: string | null
  logo_url: string | null
  brand_color_primary: string | null
  is_member: boolean
  membership_status: string | null
}

export interface AvailableBrandsResponse {
  brands: AvailableBrand[]
}

export interface ClientPromotion {
  id: string
  brand_id: string
  brand_name: string | null
  brand_logo_url: string | null
  name: string
  description: string | null
  promotion_type: string
  discount_display: string | null
  valid_from: string | null
  valid_until: string | null
  status: string
}

export interface ClientPromotionsResponse {
  promotions: ClientPromotion[]
  total: number
}

export interface FeaturedProduct {
  id: string
  public_id: string
  name: string
  description: string | null
  base_price: number | null
  image_url: string | null
  brand_id: string
  brand_name: string | null
  brand_logo_url: string | null
}

export interface FeaturedProductsResponse {
  products: FeaturedProduct[]
}

export function useMemberships() {
  return useQuery<MembershipsResponse>({
    queryKey: ['client', 'memberships'],
    queryFn: () => apiFetch<MembershipsResponse>('/api/client/memberships'),
  })
}

export function useAvailableBrands() {
  return useQuery<AvailableBrandsResponse>({
    queryKey: ['client', 'brands'],
    queryFn: () => apiFetch<AvailableBrandsResponse>('/api/client/brands'),
  })
}

export function useClientPromotions(brandId?: string) {
  return useQuery<ClientPromotionsResponse>({
    queryKey: ['client', 'promotions', brandId ?? null],
    queryFn: () => {
      const qs = brandId ? `?brand_id=${brandId}` : ''
      return apiFetch<ClientPromotionsResponse>(`/api/client/promotions${qs}`)
    },
  })
}

export function useFeaturedProducts() {
  return useQuery<FeaturedProductsResponse>({
    queryKey: ['client', 'products'],
    queryFn: () => apiFetch<FeaturedProductsResponse>('/api/client/products'),
  })
}
