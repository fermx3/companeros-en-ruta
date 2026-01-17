import { createClient } from '@/lib/supabase/client';
import { env } from '@/lib/env';
import type {
  AdminDashboardMetrics,
  Brand,
  Client,
  UserProfile,
  UserRole,
  Zone,
  Market,
  ClientType,
  CommercialStructure,
  Tenant,
  BrandCreateForm,
  TenantUpdateForm,
  ApiResponse,
  PaginatedResponse
} from '@/lib/types/admin';

/**
 * Admin Service - Gestión completa para administradores
 * Todas las queries incluyen tenant_id para multi-tenancy
 */

export class AdminService {
  private supabase = createClient();

  // Obtener tenant_id del usuario actual (para MVP usamos tenant demo)
  private async getCurrentTenantId(): Promise<string> {
    // Para el MVP, usamos directamente el tenant demo
    // En producción, esto debería obtenerse del contexto de autenticación
    const DEMO_TENANT_ID = env.NEXT_PUBLIC_DEMO_TENANT_ID || 'fe0f429d-2d83-4738-af65-32c655cef656';

    try {
      // Intentar obtener usuario autenticado
      const { data: { user } } = await this.supabase.auth.getUser();

      if (user) {
        // Buscar el perfil del usuario para obtener el tenant_id real
        const { data: profile } = await this.supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          // En el futuro aquí obtendríamos el tenant_id desde user_roles o user_profiles
          return DEMO_TENANT_ID;
        }
      }

      // Fallback: usar tenant demo para desarrollo
      return DEMO_TENANT_ID;
    } catch (error) {
      return DEMO_TENANT_ID;
    }
  }

  /**
   * Dashboard Metrics - Métricas principales para el admin
   */
  async getDashboardMetrics(): Promise<ApiResponse<AdminDashboardMetrics>> {
    try {
      const tenantId = await this.getCurrentTenantId();

      const response = await fetch(`/api/admin/metrics?tenant_id=${tenantId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener métricas');
      }

      const metrics = await response.json();
      return { data: metrics };

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return { error: 'Error al cargar métricas del dashboard' };
    }
  }

  /**
   * Brand Management
   */
  /**
   * Brands Management - Usando RLS directamente
   */
  async getBrands(page = 1, limit = 20): Promise<PaginatedResponse<Brand>> {
    const tenantId = await this.getCurrentTenantId();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from('brands')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(`Error al obtener brands: ${error.message}`);

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  async createBrand(brandData: BrandCreateForm): Promise<ApiResponse<Brand>> {
    try {
      const tenantId = await this.getCurrentTenantId();

      // Generar public_id único
      const { count } = await this.supabase
        .from('brands')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      const nextNumber = (count || 0) + 1;
      const publicId = `BRD-${nextNumber.toString().padStart(4, '0')}`;

      // Crear slug desde el nombre
      const slug = brandData.name?.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      const brand: Partial<Brand> = {
        public_id: publicId,
        name: brandData.name,
        slug,
        description: brandData.description,
        website: brandData.website,
        tenant_id: tenantId,
        status: brandData.status || 'active',
        settings: brandData.settings || {}
      };

      const { data, error } = await this.supabase
        .from('brands')
        .insert(brand)
        .select()
        .single();

      if (error) throw new Error(`Error al crear brand: ${error.message}`);

      return {
        data: data as Brand,
        message: 'Brand creada exitosamente'
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return {
        error: message
      };
    }
  }

  async updateBrand(id: string, brandData: Partial<BrandCreateForm>): Promise<ApiResponse<Brand>> {
    try {
      const tenantId = await this.getCurrentTenantId();

      const { data, error } = await this.supabase
        .from('brands')
        .update({
          ...brandData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Brand, message: 'Brand actualizado exitosamente' };
    } catch (error) {
      console.error('Error updating brand:', error);
      return { error: 'Error al actualizar brand' };
    }
  }

  async deleteBrand(id: string): Promise<ApiResponse<void>> {
    try {
      const tenantId = await this.getCurrentTenantId();

      console.log('DeleteBrand - attempting to delete:', { id, tenantId });

      // Verificar que la brand existe antes de intentar eliminarla
      const { data: existingBrand, error: findError } = await this.supabase
        .from('brands')
        .select('id, public_id, name, deleted_at, tenant_id')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (findError) {
        console.error('Error finding brand:', findError);
        throw new Error(`Brand no encontrada: ${findError.message || 'Error de base de datos'}`);
      }

      if (!existingBrand) {
        throw new Error('Brand no encontrada');
      }

      if (existingBrand.deleted_at) {
        throw new Error('La brand ya está eliminada');
      }

      console.log('DeleteBrand - found brand:', existingBrand);

      // Realizar soft delete - intentar con diferentes enfoques si falla
      console.log('DeleteBrand - attempting soft delete...');

      const { data: updateData, error: deleteError } = await this.supabase
        .from('brands')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null) // Solo actualizar si no está ya eliminada
        .select(); // Importante: agregar .select() para obtener los datos actualizados

      console.log('DeleteBrand - update result:', { updateData, deleteError });

      if (deleteError) {
        console.error('Error during soft delete:', deleteError);

        // Proporcionar información más específica sobre el error
        if (deleteError.code === 'PGRST301') {
          throw new Error('No tienes permisos para eliminar esta brand');
        } else if (deleteError.code === 'PGRST116') {
          throw new Error('La brand no fue encontrada o ya fue eliminada');
        } else {
          throw new Error(`Error al eliminar brand: ${deleteError.message || 'Error desconocido de base de datos'}`);
        }
      }

      // Verificar si la actualización fue exitosa
      if (!updateData || updateData.length === 0) {
        // Esto puede ocurrir si las políticas RLS bloquean la operación
        console.warn('DeleteBrand - no rows updated, checking if brand still exists...');

        // Verificar si la brand todavía existe sin cambios
        const { data: verifyBrand, error: verifyError } = await this.supabase
          .from('brands')
          .select('id, deleted_at')
          .eq('id', id)
          .eq('tenant_id', tenantId)
          .single();

        if (verifyError || !verifyBrand) {
          console.error('DeleteBrand - verification failed:', verifyError);
          throw new Error('No se pudo verificar el estado de la brand después de la eliminación');
        }

        if (!verifyBrand.deleted_at) {
          // La brand todavía existe y no fue eliminada - esto indica un problema de permisos RLS
          throw new Error('No se pudo eliminar la brand. Esto puede ser un problema de permisos. Por favor, contacta al administrador del sistema.');
        } else {
          // La brand fue eliminada exitosamente por otro proceso
          console.log('DeleteBrand - brand was already deleted by another process');
        }
      }

      console.log('DeleteBrand - successfully deleted:', id);
      return { message: 'Brand eliminado exitosamente' };

    } catch (error) {
      console.error('Error deleting brand:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar brand';
      return { error: errorMessage };
    }
  }

  /**
   * Client Management
   */
  async getClients(page = 1, limit = 20, filters?: {
    status?: string;
    zone_id?: string;
    market_id?: string;
  }): Promise<PaginatedResponse<Client & {
    zone_name?: string;
    market_name?: string;
    client_type_name?: string;
    commercial_structure_name?: string;
  }>> {
    const tenantId = await this.getCurrentTenantId();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase
      .from('clients')
      .select(`
        *,
        zones:zone_id(name),
        markets:market_id(name),
        client_types:client_type_id(name),
        commercial_structures:commercial_structure_id(name)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    // Aplicar filtros
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.zone_id) query = query.eq('zone_id', filters.zone_id);
    if (filters?.market_id) query = query.eq('market_id', filters.market_id);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(`Error al obtener clientes: ${error.message}`);

    // Formatear data con nombres de relaciones
    const formattedData = (data || []).map(client => ({
      ...client,
      zone_name: client.zones?.name,
      market_name: client.markets?.name,
      client_type_name: client.client_types?.name,
      commercial_structure_name: client.commercial_structures?.name
    }));

    return {
      data: formattedData,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * User Management
   */
  async getUsers(page = 1, limit = 20): Promise<PaginatedResponse<UserProfile & { roles?: UserRole[] }>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles(*)
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(`Error al obtener usuarios: ${error.message}`);

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Catalog Management - Obtener datos para formularios
   */
  async getZones(): Promise<Zone[]> {
    const tenantId = await this.getCurrentTenantId();

    const { data, error } = await this.supabase
      .from('zones')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name');

    if (error) throw new Error(`Error al obtener zonas: ${error.message}`);
    return data || [];
  }

  async getMarkets(): Promise<Market[]> {
    const tenantId = await this.getCurrentTenantId();

    const { data, error } = await this.supabase
      .from('markets')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name');

    if (error) throw new Error(`Error al obtener mercados: ${error.message}`);
    return data || [];
  }

  async getClientTypes(): Promise<ClientType[]> {
    const tenantId = await this.getCurrentTenantId();

    const { data, error } = await this.supabase
      .from('client_types')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name');

    if (error) throw new Error(`Error al obtener tipos de cliente: ${error.message}`);
    return data || [];
  }

  async getCommercialStructures(): Promise<CommercialStructure[]> {
    const tenantId = await this.getCurrentTenantId();

    const { data, error } = await this.supabase
      .from('commercial_structures')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name');

    if (error) throw new Error(`Error al obtener estructuras comerciales: ${error.message}`);
    return data || [];
  }

  /**
   * Tenant Management
   */
  async getTenantInfo(): Promise<ApiResponse<Tenant>> {
    try {
      const tenantId = await this.getCurrentTenantId();

      const { data, error } = await this.supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      return { data: data as Tenant };
    } catch (error) {
      console.error('Error fetching tenant info:', error);
      return { error: 'Error al obtener información del tenant' };
    }
  }

  async updateTenantInfo(tenantData: TenantUpdateForm): Promise<ApiResponse<Tenant>> {
    try {
      const tenantId = await this.getCurrentTenantId();

      const { data, error } = await this.supabase
        .from('tenants')
        .update({
          ...tenantData,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Tenant, message: 'Información actualizada exitosamente' };
    } catch (error) {
      console.error('Error updating tenant:', error);
      return { error: 'Error al actualizar información del tenant' };
    }
  }
}

// Singleton instance
export const adminService = new AdminService();
