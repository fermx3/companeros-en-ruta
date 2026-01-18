import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/clients - Obtener lista de clientes con filtros y paginación
 * Solo accesible por usuarios con rol admin
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== API Route: GET /api/admin/clients ===');

    // Verificar autenticación
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('❌ User not authenticated:', userError?.message);
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.log('❌ Profile not found:', profileError?.message);
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    console.log('Profile encontrado:', profile);

    // Verificar rol de admin
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, status')
      .eq('user_profile_id', profile.id);

    console.log('Roles query result:', { userRoles, roleError });

    const adminRole = userRoles?.find(role => role.role === 'admin' && role.status === 'active');

    if (!adminRole) {
      console.log('❌ No admin role found for user');
      return NextResponse.json({ error: 'Acceso denegado - Se requiere rol de administrador' }, { status: 403 });
    }

    console.log('✅ Admin permissions verified');

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const zone_id = searchParams.get('zone_id');
    const market_id = searchParams.get('market_id');

    console.log('Query parameters:', { page, limit, status, zone_id, market_id });

    // Usar service client para operaciones de admin
    const serviceSupabase = createServiceClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Construir query
    let query = serviceSupabase
      .from('clients')
      .select(`
        *,
        zones:zone_id(name),
        markets:market_id(name),
        client_types:client_type_id(name),
        commercial_structures:commercial_structure_id(name)
      `, { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    // Aplicar filtros
    if (status) query = query.eq('status', status);
    if (zone_id) query = query.eq('zone_id', zone_id);
    if (market_id) query = query.eq('market_id', market_id);

    const { data: clients, error: clientsError, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError);
      return NextResponse.json(
        { error: `Error al obtener clientes: ${clientsError.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${clients?.length || 0} clients (total: ${count})`);

    // Formatear data con nombres de relaciones
    const formattedClients = (clients || []).map(client => ({
      ...client,
      zone_name: client.zones?.name,
      market_name: client.markets?.name,
      client_type_name: client.client_types?.name,
      commercial_structure_name: client.commercial_structures?.name
    }));

    const response = {
      data: formattedClients,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };

    console.log('✅ Sending response with', formattedClients.length, 'clients');

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/admin/clients:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
