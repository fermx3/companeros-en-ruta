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
  public_id: string
  name: string
  description: string | null
  promotion_type: string
  status: string
  start_date: string | null
  end_date: string | null
  discount_percentage: number | null
  discount_amount: number | null
  points_multiplier: number | null
  buy_quantity: number | null
  get_quantity: number | null
  terms_and_conditions: string | null
  requires_code: boolean | null
  promo_code: string | null
  usage_limit_per_client: number | null
  usage_count_total: number | null
  usage_limit_total: number | null
  brand: {
    id: string
    name: string
    logo_url: string | null
    brand_color_primary: string | null
    brand_color_secondary: string | null
  } | null
}

export interface ClientPromotionsResponse {
  promotions: ClientPromotion[]
  total: number
}

/**
 * Build a short, human-readable label for a promotion's main benefit.
 * Matches what the web's `discount_display` synthesizes server-side.
 */
export function promotionDiscountLabel(p: ClientPromotion): string | null {
  if (p.discount_percentage != null && p.discount_percentage > 0) return `${p.discount_percentage}% off`
  if (p.discount_amount != null && p.discount_amount > 0) return `$${p.discount_amount} off`
  if (p.points_multiplier != null && p.points_multiplier > 1) return `${p.points_multiplier}x puntos`
  if (p.buy_quantity != null && p.get_quantity != null) return `${p.buy_quantity}x${p.get_quantity}`
  return null
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
