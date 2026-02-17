import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/zones - Obtener lista de zonas con filtros y paginación
 * Solo accesible por usuarios con rol admin
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    // Verificar rol de admin
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, status')
      .eq('user_profile_id', profile.id);

    const adminRole = userRoles?.find(role => role.role === 'admin' && role.status === 'active');

    if (roleError || !adminRole) {
      return NextResponse.json({ error: 'Acceso denegado - Se requiere rol de administrador' }, { status: 403 });
    }

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const zone_type = searchParams.get('zone_type');
    const is_active = searchParams.get('is_active');
    const parent_zone_id = searchParams.get('parent_zone_id');

    // Usar service client para operaciones de admin
    const serviceSupabase = createServiceClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Construir query
    let query = serviceSupabase
      .from('zones')
      .select(`
        *,
        parent_zone:parent_zone_id(id, name)
      `, { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,public_id.ilike.%${search}%`);
    }
    if (zone_type) query = query.eq('zone_type', zone_type);
    if (is_active !== null && is_active !== '') {
      query = query.eq('is_active', is_active === 'true');
    }
    if (parent_zone_id) query = query.eq('parent_zone_id', parent_zone_id);

    const { data: zones, error: zonesError, count } = await query
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
      .range(from, to);

    if (zonesError) {
      console.error('Error fetching zones:', zonesError);
      return NextResponse.json(
        { error: `Error al obtener zonas: ${zonesError.message}` },
        { status: 500 }
      );
    }

    // Formatear data con nombres de relaciones
    const formattedZones = (zones || []).map(zone => ({
      ...zone,
      parent_zone_name: zone.parent_zone?.name || null,
      parent_zone: undefined
    }));

    const response = {
      data: formattedZones,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in GET /api/admin/zones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
