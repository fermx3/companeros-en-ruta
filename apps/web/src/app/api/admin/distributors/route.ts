import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/distributors - Lista paginada de distribuidores
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, status')
      .eq('user_profile_id', profile.id);

    const adminRole = userRoles?.find(
      role => role.status === 'active' && role.role === 'admin'
    );

    if (roleError || !adminRole) {
      return NextResponse.json({ error: 'Acceso denegado - Se requiere rol de administrador' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const serviceSupabase = createServiceClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = serviceSupabase
      .from('distributors')
      .select('*', { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    if (search) {
      query = query.or(`name.ilike.%${search}%,rfc.ilike.%${search}%,contact_name.ilike.%${search}%,public_id.ilike.%${search}%`);
    }
    if (status) query = query.eq('status', status);

    const { data: distributors, error: distError, count } = await query
      .order('name', { ascending: true })
      .range(from, to);

    if (distError) {
      return NextResponse.json(
        { error: `Error al obtener distribuidores: ${distError.message}` },
        { status: 500 }
      );
    }

    // Get employee counts per distributor
    const distributorIds = (distributors || []).map(d => d.id);
    let employeeCounts: Record<string, number> = {};

    if (distributorIds.length > 0) {
      const { data: employees } = await serviceSupabase
        .from('user_profiles')
        .select('distributor_id')
        .in('distributor_id', distributorIds)
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null);

      if (employees) {
        for (const emp of employees) {
          if (emp.distributor_id) {
            employeeCounts[emp.distributor_id] = (employeeCounts[emp.distributor_id] || 0) + 1;
          }
        }
      }
    }

    const formattedDistributors = (distributors || []).map(d => ({
      ...d,
      employee_count: employeeCounts[d.id] || 0,
    }));

    return NextResponse.json({
      data: formattedDistributors,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/distributors:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
