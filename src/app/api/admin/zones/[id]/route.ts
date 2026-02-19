import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/zones/[id] - Obtener detalle de una zona
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 400 });
    }

    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, status')
      .eq('user_profile_id', profile.id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    const adminRole = userRoles?.find(
      r => r.status === 'active' && r.role === 'admin'
    );

    if (roleError || !adminRole) {
      return NextResponse.json({ error: 'Sin permisos para ver zonas' }, { status: 403 });
    }

    const serviceSupabase = createServiceClient();

    const { data: zone, error: zoneError } = await serviceSupabase
      .from('zones')
      .select(`
        *,
        parent_zone:parent_zone_id(id, name, public_id)
      `)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (zoneError) {
      if (zoneError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 });
      }
      console.error('Error fetching zone:', zoneError);
      return NextResponse.json({ error: 'Error al obtener la zona' }, { status: 500 });
    }

    // Count active clients assigned to this zone
    const { count: clientCount } = await serviceSupabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('zone_id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    const formattedZone = {
      ...zone,
      parent_zone_name: zone.parent_zone?.name || null,
      parent_zone_public_id: zone.parent_zone?.public_id || null,
      parent_zone: undefined,
      client_count: clientCount ?? 0
    };

    return NextResponse.json(
      { data: formattedZone, message: 'Zona obtenida exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in GET /api/admin/zones/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
