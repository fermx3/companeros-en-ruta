import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { resolveIdColumn } from '@/lib/utils/public-id';

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
      .select('public_id, status')
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

    return NextResponse.json(
      { data: updatedClient, message: 'Estado del cliente actualizado exitosamente' },
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

export async function DELETE() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}
