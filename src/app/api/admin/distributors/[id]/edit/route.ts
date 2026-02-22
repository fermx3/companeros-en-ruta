import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { distributorUpdateSchema } from '@/lib/types/admin';
import { resolveIdColumn } from '@/lib/utils/public-id';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function verifyAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 400 }) };
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
    return { error: NextResponse.json({ error: 'Sin permisos para gestionar distribuidores' }, { status: 403 }) };
  }

  return { profile };
}

/**
 * PUT /api/admin/distributors/[id]/edit - Actualizar distribuidor
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const auth = await verifyAdmin(supabase);
    if ('error' in auth && auth.error) return auth.error;
    const { profile } = auth as { profile: { id: string; tenant_id: string } };

    const body = await request.json();
    const validatedData = distributorUpdateSchema.parse(body);

    const serviceSupabase = createServiceClient();

    const { data: existing, error: findError } = await serviceSupabase
      .from('distributors')
      .select('id, tenant_id')
      .eq(resolveIdColumn(id), id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: 'Distribuidor no encontrado' }, { status: 404 });
    }

    const updateData = {
      name: validatedData.name,
      legal_name: validatedData.legal_name || null,
      rfc: validatedData.rfc || null,
      contact_name: validatedData.contact_name || null,
      contact_email: validatedData.contact_email || null,
      contact_phone: validatedData.contact_phone || null,
      address_street: validatedData.address_street || null,
      address_city: validatedData.address_city || null,
      address_state: validatedData.address_state || null,
      address_postal_code: validatedData.address_postal_code || null,
      address_country: validatedData.address_country,
      status: validatedData.status,
      notes: validatedData.notes || null,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await serviceSupabase
      .from('distributors')
      .update(updateData)
      .eq('id', existing.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating distributor:', updateError);
      return NextResponse.json({ error: 'Error al actualizar el distribuidor' }, { status: 500 });
    }

    return NextResponse.json(
      { data: updated, message: 'Distribuidor actualizado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/admin/distributors/[id]/edit:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/distributors/[id]/edit - Soft-delete distribuidor
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const auth = await verifyAdmin(supabase);
    if ('error' in auth && auth.error) return auth.error;
    const { profile } = auth as { profile: { id: string; tenant_id: string } };

    const serviceSupabase = createServiceClient();

    const { data: existing, error: findError } = await serviceSupabase
      .from('distributors')
      .select('id')
      .eq(resolveIdColumn(id), id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: 'Distribuidor no encontrado' }, { status: 404 });
    }

    // Check for assigned employees
    const { count: employeeCount } = await serviceSupabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('distributor_id', existing.id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    if (employeeCount && employeeCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el distribuidor porque tiene ${employeeCount} empleado(s) asignado(s)` },
        { status: 400 }
      );
    }

    const { error: deleteError } = await serviceSupabase
      .from('distributors')
      .update({ deleted_at: new Date().toISOString(), status: 'inactive' })
      .eq('id', existing.id);

    if (deleteError) {
      console.error('Error soft-deleting distributor:', deleteError);
      return NextResponse.json({ error: 'Error al eliminar el distribuidor' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Distribuidor eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/distributors/[id]/edit:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}
