import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { resolveIdColumn } from '@/lib/utils/public-id';
import { createNotification } from '@/lib/notifications';

/**
 * API Route para obtener un cliente específico por su public_id
 * GET /api/admin/clients/[clientId]
 *
 * Endpoint protegido que permite a admins obtener información detallada de un cliente
 */

interface RouteParams {
  params: Promise<{
    clientId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { clientId } = await params;

    // Verificar autenticación usando client que puede leer cookies de sesión
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el perfil del usuario con id y tenant_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tiene permisos de admin
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, status, brand_id')
      .eq('user_profile_id', profile.id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    // Buscar rol admin activo
    const adminRole = userRoles?.find(r => r.role === 'admin' && r.status === 'active');

    if (roleError || !adminRole) {
      return NextResponse.json(
        { error: 'Sin permisos para ver clientes' },
        { status: 403 }
      );
    }

    // Usar serviceClient para la query final (bypasea RLS)
    const serviceSupabase = createServiceClient();

    // Obtener el cliente con sus relaciones
    const { data: client, error: clientError } = await serviceSupabase
      .from('clients')
      .select(`
        *,
        zones:zone_id(name),
        markets:market_id(name),
        client_types:client_type_id(name),
        commercial_structures:commercial_structure_id(name)
      `)
      .eq(resolveIdColumn(clientId), clientId)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (clientError) {
      if (clientError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Cliente no encontrado' },
          { status: 404 }
        );
      }

      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Error al obtener el cliente' },
        { status: 500 }
      );
    }

    // Queries de estadísticas en paralelo
    const [visitsResult, ordersResult] = await Promise.all([
      serviceSupabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .is('deleted_at', null)
        .not('visit_status', 'in', '(cancelled,no_show)'),
      serviceSupabase
        .from('orders')
        .select('total_amount, order_status, order_date')
        .eq('client_id', client.id)
        .is('deleted_at', null),
    ]);

    const totalVisits = visitsResult.count ?? 0;
    const orders = ordersResult.data ?? [];
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.order_status === 'delivered' || o.order_status === 'completed')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const lastOrderDate = orders.length > 0
      ? orders.reduce((max, o) => (o.order_date && o.order_date > max ? o.order_date : max), orders[0]?.order_date ?? '')
      : null;

    // Formatear la respuesta con nombres de relaciones
    const formattedClient = {
      ...client,
      zone_name: client.zones?.name,
      market_name: client.markets?.name,
      client_type_name: client.client_types?.name,
      commercial_structure_name: client.commercial_structures?.name,
      // Remover las relaciones anidadas ya que las tenemos formateadas
      zones: undefined,
      markets: undefined,
      client_types: undefined,
      commercial_structures: undefined
    };

    return NextResponse.json(
      {
        data: formattedClient,
        stats: {
          total_visits: totalVisits,
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          last_order_date: lastOrderDate || null,
        },
        message: 'Cliente obtenido exitosamente'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in GET /api/admin/clients/[clientId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Manejar métodos no permitidos
export async function POST() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

const patchClientSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { clientId } = await params;

    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 400 }
      );
    }

    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, status, brand_id')
      .eq('user_profile_id', profile.id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    const adminRole = userRoles?.find(r => r.role === 'admin' && r.status === 'active');

    if (roleError || !adminRole) {
      return NextResponse.json(
        { error: 'Sin permisos para modificar clientes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = patchClientSchema.parse(body);

    const serviceSupabase = createServiceClient();

    const { data: updatedClient, error: updateError } = await serviceSupabase
      .from('clients')
      .update({
        status: validatedData.status,
        updated_at: new Date().toISOString(),
      })
      .eq(resolveIdColumn(clientId), clientId)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .select('id, public_id, status')
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Cliente no encontrado' },
          { status: 404 }
        );
      }
      console.error('Error updating client status:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar el estado del cliente' },
        { status: 500 }
      );
    }

    // Notify the client about the status change
    try {
      const statusLabels: Record<string, string> = {
        active: 'Activo',
        inactive: 'Inactivo',
        suspended: 'Suspendido',
      }
      await createNotification({
        tenant_id: profile.tenant_id,
        client_id: updatedClient.id,
        title: 'Estado actualizado',
        message: `Tu estado ha sido cambiado a: ${statusLabels[updatedClient.status!] ?? updatedClient.status}`,
        notification_type: 'client_status_changed',
        action_url: '/client/profile',
      })
    } catch (notifError) {
      console.error('[PATCH /api/admin/clients/[clientId]] Notification error:', notifError)
    }

    return NextResponse.json(
      { data: { public_id: updatedClient.public_id, status: updatedClient.status }, message: 'Estado del cliente actualizado exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in PATCH /api/admin/clients/[clientId]:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Estado inválido', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/clients/[clientId] - Soft-delete cliente
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { clientId } = await params;

    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 400 }
      );
    }

    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, status')
      .eq('user_profile_id', profile.id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    const adminRole = userRoles?.find(r => r.role === 'admin' && r.status === 'active');

    if (roleError || !adminRole) {
      return NextResponse.json(
        { error: 'Sin permisos para eliminar clientes' },
        { status: 403 }
      );
    }

    const serviceSupabase = createServiceClient();

    // Verify client exists
    const { data: existing, error: findError } = await serviceSupabase
      .from('clients')
      .select('id')
      .eq(resolveIdColumn(clientId), clientId)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Check for visits in_progress
    const { count: activeVisitCount } = await serviceSupabase
      .from('visits')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', existing.id)
      .eq('visit_status', 'in_progress')
      .is('deleted_at', null);

    if (activeVisitCount && activeVisitCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el cliente porque tiene ${activeVisitCount} visita(s) en progreso` },
        { status: 400 }
      );
    }

    // Soft-delete
    const { error: deleteError } = await serviceSupabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString(), status: 'inactive' })
      .eq('id', existing.id);

    if (deleteError) {
      console.error('Error soft-deleting client:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar el cliente' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Cliente eliminado exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in DELETE /api/admin/clients/[clientId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
