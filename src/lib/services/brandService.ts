import { createClient } from '@/lib/supabase/client'

interface BrandDashboardMetrics {
  brand_id: string
  brand_public_id: string
  tenant_id: string
  brand_name: string
  brand_slug: string
  logo_url: string | null
  brand_color_primary: string | null
  brand_color_secondary: string | null
  website: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  status: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
  tenant_name: string
  tenant_slug: string
  total_clients: number
  active_clients: number
  pending_clients: number
  avg_client_points: number
  total_points_balance: number
  total_visits: number
  monthly_visits: number
  active_visits: number
  avg_visit_rating: number
  total_orders: number
  monthly_orders: number
  total_revenue: number
  monthly_revenue: number
  active_promotions: number
  total_promotions: number
  conversion_rate: number
  revenue_per_client: number
  first_membership_date: string | null
  last_membership_date: string | null
  last_visit_date: string | null
  last_order_date: string | null
}

export class BrandService {
  private supabase = createClient()

  /**
   * Obtener métricas del dashboard para una marca específica
   */
  async getBrandDashboardMetrics(brandId?: string): Promise<BrandDashboardMetrics | null> {
    try {
      let query = this.supabase
        .from('brand_dashboard_metrics')
        .select('*')

      // Si se proporciona brandId específico, filtrar por él
      if (brandId) {
        query = query.eq('brand_id', brandId)
      }

      // Si no se proporciona brandId, obtener la marca del usuario actual
      // (esto requerirá lógica adicional para determinar la marca del usuario)

      const { data, error } = await query.single()

      if (error) {
        console.error('Error fetching brand dashboard metrics:', error)
        throw new Error(`Error al obtener métricas de marca: ${error.message}`)
      }

      return data as BrandDashboardMetrics
    } catch (error) {
      console.error('Error in getBrandDashboardMetrics:', error)
      throw error
    }
  }

  /**
   * Obtener información de marca por public_id
   */
  async getBrandByPublicId(publicId: string): Promise<BrandDashboardMetrics | null> {
    try {
      const { data, error } = await this.supabase
        .from('brand_dashboard_metrics')
        .select('*')
        .eq('brand_public_id', publicId)
        .single()

      if (error) {
        console.error('Error fetching brand by public_id:', error)
        throw new Error(`Error al obtener marca: ${error.message}`)
      }

      return data as BrandDashboardMetrics
    } catch (error) {
      console.error('Error in getBrandByPublicId:', error)
      throw error
    }
  }

  /**
   * Obtener la marca principal del usuario actual
   * Esta función necesitará ser ajustada según la lógica de asignación de marcas
   */
  async getCurrentUserBrand(): Promise<BrandDashboardMetrics | null> {
    try {
      // Obtener el usuario autenticado
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Buscar el rol activo del usuario para obtener su brand_id
      const { data: userRole, error: roleError } = await this.supabase
        .from('user_roles')
        .select('brand_id')
        .eq('user_profile_id', user.id)
        .eq('status', 'active')
        .not('brand_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (roleError || !userRole?.brand_id) {
        console.error('Error fetching user role:', roleError)
        throw new Error('No se encontró marca asignada al usuario')
      }

      // Obtener las métricas de la marca
      return this.getBrandDashboardMetrics(userRole.brand_id)
    } catch (error) {
      console.error('Error in getCurrentUserBrand:', error)
      throw error
    }
  }
}

// Instancia singleton para usar en toda la app
export const brandService = new BrandService()
