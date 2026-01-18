import { createClient } from '@/lib/supabase/client';
import { env } from '@/lib/env';
import type {
  AdminDashboardMetrics,
  RecentActivity,
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
 * Usa rutas API para operaciones que requieren permisos elevados
 */

export class AdminService {
  private supabase = createClient();

  // Generar contraseña temporal para invitaciones
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Obtener tenant_id del usuario actual (para MVP usamos tenant demo)
  private async getCurrentTenantId(): Promise<string> {
    try {
      // En el cliente, obtener del perfil del usuario autenticado
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Buscar el perfil del usuario para obtener el tenant_id real
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('No se pudo obtener el perfil del usuario autenticado');
      }

      return profile.tenant_id;

    } catch (error) {
      console.error('Error obteniendo tenant_id:', error);
      // Fallback solo para desarrollo - en producción esto debería fallar
      const DEMO_TENANT_ID = env.NEXT_PUBLIC_DEMO_TENANT_ID || 'fe0f429d-2d83-4738-af65-32c655cef656';
      return DEMO_TENANT_ID;
    }
  }

  /**
   * Dashboard Metrics - Métricas principales para el admin
   */
  async getDashboardMetrics(): Promise<ApiResponse<AdminDashboardMetrics>> {
    try {
      const tenantId = await this.getCurrentTenantId();

      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(`/api/admin/metrics?tenant_id=${tenantId}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Error al obtener métricas';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const metrics = await response.json();

      // Validar que la respuesta tenga el formato esperado
      if (!metrics || typeof metrics !== 'object') {
        throw new Error('Respuesta inválida del servidor');
      }

      return { data: metrics };

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { error: 'Timeout: La petición tardó demasiado tiempo' };
        }
        return { error: error.message };
      }

      return { error: 'Error desconocido al cargar métricas del dashboard' };
    }
  }

  /**
   * Recent Activity - Obtener actividad reciente del sistema
   */
  async getRecentActivity(limit = 5): Promise<ApiResponse<RecentActivity[]>> {
    try {
      const tenantId = await this.getCurrentTenantId();

      // Consultar audit_logs para obtener actividad reciente
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          action,
          resource_type,
          resource_id,
          new_values,
          created_at,
          user_profiles(first_name, last_name)
        `)
        .eq('tenant_id', tenantId)
        .in('action', ['CREATE', 'UPDATE'])
        .in('resource_type', ['brands', 'users', 'clients', 'visits', 'orders'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Error al obtener actividad reciente: ${error.message}`);
      }

      if (!data) {
        return { data: [] };
      }

      // Mapear los datos a formato de RecentActivity
      const activities: RecentActivity[] = data.map((log: any) => {
        const entityName = log.new_values?.name || log.new_values?.business_name || log.new_values?.first_name || 'Elemento';
        const userName = log.user_profiles ? `${log.user_profiles.first_name} ${log.user_profiles.last_name}`.trim() : undefined;

        // Determinar el tipo de acción y descripción
        let actionType: RecentActivity['action_type'];
        let description: string;

        const resourceType = log.resource_type.slice(0, -1); // Quitar 's' del plural
        const actionVerb = log.action === 'CREATE' ? 'creó' : 'actualizó';

        switch (resourceType) {
          case 'brand':
            actionType = log.action === 'CREATE' ? 'brand_created' : 'brand_updated';
            description = `Se ${actionVerb} la marca ${entityName}`;
            break;
          case 'user':
            actionType = log.action === 'CREATE' ? 'user_created' : 'user_role_assigned';
            description = `Se ${actionVerb} el usuario ${entityName}`;
            break;
          case 'client':
            actionType = log.action === 'CREATE' ? 'client_created' : 'client_updated';
            description = `Se ${actionVerb} el cliente ${entityName}`;
            break;
          case 'visit':
            actionType = 'visit_created';
            description = `Se ${actionVerb} una visita`;
            break;
          case 'order':
            actionType = 'order_created';
            description = `Se ${actionVerb} una orden`;
            break;
          default:
            actionType = 'brand_created';
            description = `Se ${actionVerb} ${entityName}`;
        }

        return {
          id: log.id,
          tenant_id: tenantId,
          user_id: log.user_id,
          action: log.action,
          resource_type: log.resource_type,
          resource_id: log.resource_id,
          user_name: userName,
          created_at: log.created_at,
          action_type: actionType,
          description
        };
      });

      return { data: activities };

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return { error: message };
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

  async getBrandById(id: string): Promise<ApiResponse<Brand>> {
    try {
      const tenantId = await this.getCurrentTenantId();

      const { data, error } = await this.supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .single();

      if (error) throw new Error(`Error al obtener brand: ${error.message}`);
      if (!data) throw new Error('Brand no encontrada');

      return {
        data: data as Brand,
        message: 'Brand obtenida exitosamente'
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return {
        error: message
      };
    }
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
        logo_url: brandData.logo_url,
        brand_color_primary: brandData.brand_color_primary,
        brand_color_secondary: brandData.brand_color_secondary,
        contact_email: brandData.contact_email,
        contact_phone: brandData.contact_phone,
        website: brandData.website,
        tenant_id: tenantId,
        status: brandData.status || 'active',
        settings: {}
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
    try {
      // Construir parámetros de query
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (filters?.status) params.append('status', filters.status);
      if (filters?.zone_id) params.append('zone_id', filters.zone_id);
      if (filters?.market_id) params.append('market_id', filters.market_id);

      console.log('Calling API with params:', params.toString());

      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(`/api/admin/clients?${params.toString()}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Error al obtener clientes';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      console.log('API response:', data);

      // Validar que tenemos datos válidos
      if (!data || typeof data !== 'object') {
        throw new Error('Datos inválidos recibidos del servidor');
      }

      return data;

    } catch (error) {
      console.error('Error in getClients:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: La petición tardó demasiado tiempo');
        }
        throw error;
      }

      throw new Error('Error desconocido al obtener clientes');
    }
  }

  /**
   * User Management
   */
  async getUsers(page = 1, limit = 20): Promise<PaginatedResponse<UserProfile & { user_roles?: UserRole[] }>> {
    const tenantId = await this.getCurrentTenantId();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Primero obtener los perfiles de usuarios
    const { data: profiles, error: profileError, count } = await this.supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (profileError) throw new Error(`Error al obtener usuarios: ${profileError.message}`);

    // Para cada perfil, obtener sus roles
    const usersWithRoles = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: roles } = await this.supabase
          .from('user_roles')
          .select('*')
          .eq('user_profile_id', profile.id)
          .eq('tenant_id', tenantId)
          .is('deleted_at', null);

        return {
          ...profile,
          user_roles: roles || []
        };
      })
    );

    return {
      data: usersWithRoles,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  async getUserById(userId: string): Promise<UserProfile & { user_roles?: UserRole[] }> {
    const tenantId = await this.getCurrentTenantId();

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        throw new Error('Usuario no encontrado');
      }
      throw new Error(`Error al obtener usuario: ${profileError.message}`);
    }

    // Obtener los roles del usuario
    const { data: roles } = await this.supabase
      .from('user_roles')
      .select('*')
      .eq('user_profile_id', profile.id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    return {
      ...profile,
      user_roles: roles || []
    };
  }

  async updateUser(userId: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    const tenantId = await this.getCurrentTenantId();

    // Verificar que el usuario pertenece al tenant
    const { data: existingUser, error: checkError } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingUser) {
      throw new Error('Usuario no encontrado o sin permisos para modificar');
    }

    const { data, error } = await this.supabase
      .from('user_profiles')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar usuario: ${error.message}`);

    return data;
  }

  async deactivateUser(userId: string): Promise<void> {
    const tenantId = await this.getCurrentTenantId();

    // Verificar que el usuario pertenece al tenant
    const { data: existingUser, error: checkError } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingUser) {
      throw new Error('Usuario no encontrado o sin permisos para modificar');
    }

    const { error } = await this.supabase
      .from('user_profiles')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('tenant_id', tenantId);

    if (error) throw new Error(`Error al desactivar usuario: ${error.message}`);

    // También desactivar todos los roles del usuario
    await this.supabase
      .from('user_roles')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }

  async reactivateUser(userId: string): Promise<void> {
    const tenantId = await this.getCurrentTenantId();

    // Verificar que el usuario pertenece al tenant
    const { data: existingUser, error: checkError } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingUser) {
      throw new Error('Usuario no encontrado o sin permisos para modificar');
    }

    const { error } = await this.supabase
      .from('user_profiles')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('tenant_id', tenantId);

    if (error) throw new Error(`Error al reactivar usuario: ${error.message}`);
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

  /**
   * User Role Management
   */
  async assignUserRole(
    userProfileId: string,
    roleData: {
      role: 'admin' | 'brand_manager' | 'supervisor' | 'advisor' | 'market_analyst' | 'client';
      brand_id: string | null;
      zone_id?: string | null; // Hacer opcional por problemas de esquema
    }
  ): Promise<UserRole> {
    const tenantId = await this.getCurrentTenantId();

    // Verificar que el usuario pertenece al tenant
    const { data: userProfile, error: userError } = await this.supabase
      .from('user_profiles')
      .select('id, user_id')
      .eq('tenant_id', tenantId)
      .eq('id', userProfileId)
      .is('deleted_at', null)
      .single();

    if (userError || !userProfile) {
      throw new Error('Usuario no encontrado o sin permisos');
    }

    // Obtener el perfil del usuario actual (quien está asignando el rol)
    const { data: { user: currentUser } } = await this.supabase.auth.getUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const { data: currentUserProfile, error: currentUserError } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', currentUser.id)
      .is('deleted_at', null)
      .single();

    if (currentUserError || !currentUserProfile) {
      throw new Error('Perfil de usuario actual no encontrado');
    }

    // Verificar si el usuario ya tiene roles
    const { data: existingRoles, error: rolesError } = await this.supabase
      .from('user_roles')
      .select('role, is_primary')
      .eq('user_profile_id', userProfileId)
      .eq('status', 'active');

    if (rolesError) {
      console.error('Error checking existing roles:', rolesError);
    }

    // Determinar si este rol debería ser primario
    // Solo el admin o el primer rol asignado debe ser primario
    const hasPrimaryRole = existingRoles?.some(role => role.is_primary) ?? false;
    const shouldBePrimary = roleData.role === 'admin' || !hasPrimaryRole;

    // Determinar el scope según el tipo de rol
    let scope = 'tenant'; // Default para admin

    if (roleData.role === 'brand_manager' || roleData.role === 'supervisor' || roleData.role === 'advisor' || roleData.role === 'market_analyst') {
      if (!roleData.brand_id) {
        throw new Error(`El rol ${roleData.role} requiere un brand_id asignado`);
      }
      scope = 'brand';
    }

    if (roleData.role === 'client') {
      scope = 'client';
    }

    const insertData: any = {
      user_profile_id: userProfileId,
      tenant_id: tenantId,
      role: roleData.role,
      brand_id: roleData.brand_id,
      scope: scope,
      is_primary: shouldBePrimary,
      granted_by: currentUserProfile.id, // ID del perfil que otorga el rol
      granted_at: new Date().toISOString(),
      status: 'active'
    };

    // Solo agregar zone_id si está definido (para evitar errores de esquema)
    if (roleData.zone_id) {
      insertData.zone_id = roleData.zone_id;
    }

    const { data, error } = await this.supabase
      .from('user_roles')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(`Error al asignar rol: ${error.message}`);

    return data;
  }

  async deactivateUserRole(roleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_roles')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', roleId);

    if (error) throw new Error(`Error al desactivar rol: ${error.message}`);
  }

  /**
   * Cambiar el rol primario de un usuario
   * Desactiva el rol primario actual y activa el nuevo rol como primario
   */
  async changePrimaryRole(userProfileId: string, newPrimaryRoleId: string): Promise<void> {
    const tenantId = await this.getCurrentTenantId();

    // Verificar que ambos roles pertenecen al usuario y tenant
    const { data: roles, error: rolesError } = await this.supabase
      .from('user_roles')
      .select('id, is_primary, role')
      .eq('user_profile_id', userProfileId)
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    if (rolesError) {
      throw new Error(`Error al obtener roles del usuario: ${rolesError.message}`);
    }

    const currentPrimaryRole = roles?.find(role => role.is_primary);
    const newRole = roles?.find(role => role.id === newPrimaryRoleId);

    if (!newRole) {
      throw new Error('El rol especificado no existe o no pertenece al usuario');
    }

    // Iniciar transacción para cambiar roles
    const updates = [];

    // Si hay un rol primario actual, marcarlo como secundario
    if (currentPrimaryRole && currentPrimaryRole.id !== newPrimaryRoleId) {
      updates.push(
        this.supabase
          .from('user_roles')
          .update({
            is_primary: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPrimaryRole.id)
      );
    }

    // Marcar el nuevo rol como primario
    updates.push(
      this.supabase
        .from('user_roles')
        .update({
          is_primary: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', newPrimaryRoleId)
    );

    // Ejecutar todas las actualizaciones
    const results = await Promise.all(updates);

    // Verificar si alguna actualización falló
    const failedUpdate = results.find(result => result.error);
    if (failedUpdate && failedUpdate.error) {
      throw new Error(`Error al cambiar rol primario: ${failedUpdate.error.message}`);
    }
  }

  async activateUserRole(roleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_roles')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', roleId);

    if (error) throw new Error(`Error al activar rol: ${error.message}`);
  }

  async removeUserRole(roleId: string): Promise<void> {
    // Soft delete del rol
    const { error } = await this.supabase
      .from('user_roles')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', roleId);

    if (error) throw new Error(`Error al eliminar rol: ${error.message}`);
  }

  async createUser(userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    position: string | null;
    department: string | null;
    employee_code: string | null;
    password: string;
    status: 'active' | 'inactive';
  }): Promise<UserProfile> {
    const response = await fetch('/api/admin/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear usuario');
    }

    const { user } = await response.json();
    return user;
  }

  async inviteUser(userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    position: string | null;
    department: string | null;
    employee_code: string | null;
    role: 'admin' | 'brand_manager' | 'supervisor' | 'advisor' | 'market_analyst' | 'client';
    brand_id: string | null;
    zone_id: string | null;
    send_email: boolean;
  }): Promise<{ user: UserProfile; role: UserRole }> {
    const response = await fetch('/api/admin/users/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al invitar usuario');
    }

    const { user, role } = await response.json();
    return { user, role };
  }
}

// Singleton instance
export const adminService = new AdminService();
