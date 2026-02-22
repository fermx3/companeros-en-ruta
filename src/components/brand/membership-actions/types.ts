export interface MembershipTier {
  id: string
  name: string
  tier_level: number
  tier_color: string | null
}

export interface Membership {
  id: string
  public_id: string
  client_id: string
  client_public_id: string | null
  client_name: string
  client_email: string | null
  client_phone: string | null
  membership_status: string
  joined_date: string | null
  approved_date: string | null
  points_balance: number
  lifetime_points: number
  current_tier: MembershipTier | null
  created_at: string
}

export interface BrandTier {
  id: string
  name: string
  tier_level: number
  tier_color: string | null
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PointsOperationData {
  points_amount: number
  transaction_type: 'award' | 'deduct'
  description: string
}

export interface PointsModalMembership {
  client_name: string
  points_balance: number
}
