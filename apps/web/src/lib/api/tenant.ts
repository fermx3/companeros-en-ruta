/**
 * Utilidades para manejo de tenant_id en contextos multi-tenant
 * SOLO para uso en servidor (API routes)
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Obtiene el tenant_id del usuario autenticado desde el servidor
 * SOLO para uso en API routes
 * @returns Promise<string> - El tenant_id del usuario autenticado
 * @throws Error si no se puede obtener el tenant_id
 */
export async function getCurrentTenantId(): Promise<string> {
  // Importación dinámica para evitar problemas en el cliente
  const { createClient } = await import('@/lib/supabase/server');

  try {
    // Usar el cliente normal que maneja cookies automáticamente
    const supabase = createClient();

    // Obtener usuario autenticado desde las cookies
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(`Usuario no autenticado: ${userError?.message || 'No se encontró sesión'}`);
    }

    // Buscar el perfil del usuario para obtener el tenant_id real
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error(`No se pudo obtener el perfil del usuario: ${profileError?.message}`);
    }

    return profile.tenant_id;

  } catch (error) {
    console.error('Error obteniendo tenant_id:', error);
    throw error;
  }
}

/**
 * Obtiene el tenant_id y crea un cliente de servicio para operaciones administrativas
 * SOLO para uso en API routes
 * @returns Promise<{supabase: SupabaseClient, tenantId: string}>
 */
export async function getAuthenticatedServiceClient(): Promise<{supabase: SupabaseClient, tenantId: string}> {
  const tenantId = await getCurrentTenantId();

  // Importar aquí para evitar dependencias circulares
  const { createServiceClient } = await import('@/lib/supabase/server');
  const supabase = createServiceClient();

  return { supabase, tenantId };
}

/**
 * Valida que el usuario autenticado tenga permisos de administrador en el tenant
 * @param supabase - Cliente de Supabase
 * @param tenantId - ID del tenant a validar
 * @returns Promise<boolean> - true si tiene permisos de admin
 */
export async function validateAdminPermissions(supabase: SupabaseClient, tenantId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Buscar roles de administrador para este usuario y tenant
    const { data: adminRoles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_profile_id', user.id)
      .eq('tenant_id', tenantId)
      .in('role', ['admin', 'brand_manager'])
      .eq('status', 'active');

    if (error) {
      console.error('Error validating admin permissions:', error);
      return false;
    }

    return adminRoles && adminRoles.length > 0;
  } catch (error) {
    console.error('Error validating admin permissions:', error);
    return false;
  }
}
