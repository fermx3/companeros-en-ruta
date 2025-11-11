

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  subdomain: string;
  logo_url?: string;
  primary_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  tenant_id: string;
  code: string;
  business_name: string;
  owner_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  zone_id?: string;
  market_id?: string;
  commercial_structure_id?: string;
  client_type_id?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  zone?: Zone;
  market?: Market;
  client_type?: ClientType;
  commercial_structure?: CommercialStructure;
}

export interface Zone {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  state?: string;
  country: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientType {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommercialStructure {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
