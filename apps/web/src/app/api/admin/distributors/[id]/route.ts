import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { resolveIdColumn } from '@/lib/utils/public-id';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/distributors/[id] - Detalle de distribuidor
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
      return NextResponse.json({ error: 'Sin permisos para ver distribuidores' }, { status: 403 });
    }

    const serviceSupabase = createServiceClient();

    const { data: distributor, error: distError } = await serviceSupabase
      .from('distributors')
      .select('*')
      .eq(resolveIdColumn(id), id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (distError) {
      if (distError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Distribuidor no encontrado' }, { status: 404 });
      }
      console.error('Error fetching distributor:', distError);
      return NextResponse.json({ error: 'Error al obtener el distribuidor' }, { status: 500 });
    }

    // Count employees assigned to this distributor
    const { count: employeeCount } = await serviceSupabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('distributor_id', distributor.id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    return NextResponse.json(
      {
        data: { ...distributor, employee_count: employeeCount ?? 0 },
        message: 'Distribuidor obtenido exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/distributors/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
