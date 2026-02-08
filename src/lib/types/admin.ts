import { z } from 'zod';

/**
 * Database types based on actual Supabase schema
 */

// Tenant types
export interface Tenant {
  id: string;
  public_id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan: 'base' | 'pro' | 'enterprise';
  trial_ends_at: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Brand types
export interface Brand {
  id: string;
  public_id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  brand_color_primary: string | null;
  brand_color_secondary: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  status: 'active' | 'inactive';
  settings: Record<string, unknown> | null;
  dashboard_metrics: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Client types
export interface Client {
  id: string;
  public_id: string;
  tenant_id: string;
  user_id: string | null;
  business_name: string;
  legal_name: string | null;
  owner_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  tax_id: string | null;
  zone_id: string;
  market_id: string;
  client_type_id: string;
  commercial_structure_id: string;
  address_street: string;
  address_neighborhood: string | null;
  address_city: string;
  address_state: string;
  address_postal_code: string | null;
  address_country: string;
  coordinates: unknown | null;
  visit_frequency_days: number | null;
  assessment_frequency_days: number | null;
  payment_terms: string | null;
  minimum_order: number | null;
  credit_limit: number;
  status: 'active' | 'inactive' | 'suspended';
  registration_date: string | null;
  last_visit_date: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// User Profile types
export interface UserProfile {
  id: string;
  user_id: string;
  tenant_id: string;
  public_id: string;
  employee_code: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  position: string | null;
  department: string | null;
  hire_date: string | null;
  manager_id: string | null;
  status: 'active' | 'inactive' | 'suspended';
  preferences: Record<string, unknown> | null;
  last_login_at: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// User Role types
export interface UserRole {
  id: string;
  user_profile_id: string;
  tenant_id: string;
  brand_id: string | null;
  zone_id: string | null; // Campo agregado para zonas geográficas
  role: 'admin' | 'brand_manager' | 'supervisor' | 'promotor' | 'market_analyst' | 'client';
  scope: string;
  is_primary: boolean | null;
  granted_by: string | null;
  granted_at: string | null;
  expires_at: string | null;
  status: 'active' | 'inactive' | null;
  permissions: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Geographic and organizational types
export interface Zone {
  id: string;
  tenant_id: string;
  brand_id: string;
  name: string;
  code: string;
  description: string | null;
  supervisor_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Market {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClientType {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CommercialStructure {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Dashboard metrics types
export interface AdminDashboardMetrics {
  totalBrands: number;
  activeBrands: number;
  totalClients: number;
  activeClients: number;
  totalUsers: number;
  activeUsers: number;
  totalVisits: number;
  monthlyVisits: number;
  totalOrders: number;
  monthlyRevenue: number;
}

// Recent activity types
export interface RecentActivity {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: string; // Campo de la tabla audit_logs
  resource_type: string; // Tipo de entidad afectada
  resource_id?: string; // ID del recurso
  user_name?: string; // Nombre del usuario que hizo la acción (join con user_profiles)
  created_at: string;
  // Campos calculados para mostrar en la UI
  action_type: 'brand_created' | 'brand_updated' | 'user_created' | 'user_role_assigned' | 'client_created' | 'client_updated' | 'visit_created' | 'order_created';
  description: string;
}

export interface AdminDashboardData extends AdminDashboardMetrics {
  recentActivity: RecentActivity[];
}

// Form validation schemas
export const brandCreateSchema = z.object({
  name: z.string().min(1, 'Nombre de marca es requerido').max(100),
  slug: z.string().min(1, 'Slug es requerido').max(50)
    .regex(/^[a-z0-9-]+$/, 'Solo se permiten letras minúsculas, números y guiones'),
  description: z.string().optional(),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  brand_color_primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional().or(z.literal('')),
  brand_color_secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional().or(z.literal('')),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active')
});

export const userCreateSchema = z.object({
  first_name: z.string().min(1, 'Nombre es requerido').max(50),
  last_name: z.string().min(1, 'Apellido es requerido').max(50),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  employee_code: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  timezone: z.string().default('America/Mexico_City')
});

export const clientCreateSchema = z.object({
  business_name: z.string().min(1, 'Nombre del negocio es requerido').max(100),
  legal_name: z.string().optional(),
  owner_name: z.string().min(1, 'Nombre del propietario es requerido').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  tax_id: z.string().optional(),
  zone_id: z.string().uuid('Zona inválida'),
  market_id: z.string().uuid('Mercado inválido'),
  client_type_id: z.string().uuid('Tipo de cliente inválido'),
  commercial_structure_id: z.string().uuid('Estructura comercial inválida'),
  address_street: z.string().min(1, 'Dirección es requerida'),
  address_neighborhood: z.string().optional(),
  address_city: z.string().min(1, 'Ciudad es requerida'),
  address_state: z.string().min(1, 'Estado es requerido'),
  address_postal_code: z.string().optional(),
  address_country: z.string().default('MX'),
  visit_frequency_days: z.number().int().min(1).max(365).optional(),
  assessment_frequency_days: z.number().int().min(1).max(365).optional(),
  payment_terms: z.string().optional(),
  minimum_order: z.number().min(0).optional(),
  credit_limit: z.number().min(0).default(0),
  notes: z.string().optional()
});

export const tenantUpdateSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().default('America/Mexico_City'),
  subscription_plan: z.enum(['base', 'pro', 'enterprise']),
  settings: z.record(z.string(), z.unknown()).optional()
});

// Form types
export type BrandCreateForm = z.infer<typeof brandCreateSchema>;
export type UserCreateForm = z.infer<typeof userCreateSchema>;
export type ClientCreateForm = z.infer<typeof clientCreateSchema>;
export type TenantUpdateForm = z.infer<typeof tenantUpdateSchema>;

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
