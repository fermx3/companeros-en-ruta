export type UserRole = 'admin' | 'brand' | 'supervisor' | 'promotor' | 'market_analyst' | 'client'

export interface User {
  id: string
  tenant_id: string
  email: string
  full_name?: string
  phone?: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

export interface Brand {
  id: string
  tenant_id: string
  name: string
  slug: string
  subdomain?: string
  logo_url?: string
  primary_color: string
  secondary_color: string
  is_active: boolean
  created_at: string
  updated_at: string
  settings?: Record<string, unknown>
}

export interface UserRoleAssignment {
  id: string
  tenant_id: string
  user_id: string
  brand_id?: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
  permissions?: Record<string, unknown>
}

export interface BrandScope {
  id: string
  tenant_id: string
  user_id: string
  brand_id: string
  can_read: boolean
  can_write: boolean
  can_admin: boolean
  granted_at: string
  granted_by?: string
  expires_at?: string
  is_active: boolean
}
