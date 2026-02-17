import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateZoneSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255),
  code: z.string().min(1, 'Código es requerido').max(50),
  zone_type: z.enum(['country', 'region', 'state', 'city', 'district', 'custom'], 'Tipo de zona inválido'),
  description: z.string().optional(),
  country: z.string().length(2, 'Código de país debe tener 2 caracteres'),
  state: z.string().max(100).optional(),
  cities: z.array(z.string()).optional(),
  postal_codes: z.array(z.string()).optional(),
  parent_zone_id: z.string().uuid('Zona padre inválida').optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true)
});

/**
 * Helper to verify admin auth — returns { profile } or a Response on error
 */
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

  const adminRole = userRoles?.find(r => r.role === 'admin' && r.status === 'active');

  if (roleError || !adminRole) {
    return { error: NextResponse.json({ error: 'Sin permisos para gestionar zonas' }, { status: 403 }) };
  }

  return { profile };
}

/**
 * PUT /api/admin/zones/[id]/edit - Actualizar una zona
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const auth = await verifyAdmin(supabase);
    if ('error' in auth && auth.error) return auth.error;
    const { profile } = auth as { profile: { id: string; tenant_id: string } };

    const body = await request.json();
    const validatedData = updateZoneSchema.parse(body);

    const serviceSupabase = createServiceClient();

    // Verify zone exists and belongs to tenant
    const { data: existingZone, error: zoneError } = await serviceSupabase
      .from('zones')
      .select('id, tenant_id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (zoneError || !existingZone) {
      return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 });
    }

    // Validate parent_zone_id if provided
    if (validatedData.parent_zone_id) {
      if (validatedData.parent_zone_id === id) {
        return NextResponse.json(
          { error: 'Una zona no puede ser su propia zona padre' },
          { status: 400 }
        );
      }

      const { data: parentZone, error: parentError } = await serviceSupabase
        .from('zones')
        .select('id')
        .eq('id', validatedData.parent_zone_id)
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)
        .single();

      if (parentError || !parentZone) {
        return NextResponse.json(
          { error: 'Zona padre no encontrada o no válida' },
          { status: 400 }
        );
      }
    }

    // Check duplicate code (excluding current zone)
    const { data: duplicateZone } = await serviceSupabase
      .from('zones')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .eq('code', validatedData.code)
      .neq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (duplicateZone) {
      return NextResponse.json(
        { error: 'Ya existe otra zona con ese código en este tenant' },
        { status: 400 }
      );
    }

    const updateData = {
      name: validatedData.name,
      code: validatedData.code,
      zone_type: validatedData.zone_type,
      description: validatedData.description || null,
      country: validatedData.country,
      state: validatedData.state || null,
      cities: validatedData.cities || null,
      postal_codes: validatedData.postal_codes || null,
      parent_zone_id: validatedData.parent_zone_id || null,
      sort_order: validatedData.sort_order,
      is_active: validatedData.is_active,
      updated_at: new Date().toISOString()
    };

    const { data: updatedZone, error: updateError } = await serviceSupabase
      .from('zones')
      .update(updateData)
      .eq('id', existingZone.id)
      .select(`
        *,
        parent_zone:parent_zone_id(id, name)
      `)
      .single();

    if (updateError) {
      console.error('Error updating zone:', updateError);
      return NextResponse.json({ error: 'Error al actualizar la zona' }, { status: 500 });
    }

    const formattedZone = {
      ...updatedZone,
      parent_zone_name: updatedZone.parent_zone?.name || null,
      parent_zone: undefined
    };

    return NextResponse.json(
      { data: formattedZone, message: 'Zona actualizada exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in PUT /api/admin/zones/[id]/edit:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/zones/[id]/edit - Soft-delete de una zona
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const auth = await verifyAdmin(supabase);
    if ('error' in auth && auth.error) return auth.error;
    const { profile } = auth as { profile: { id: string; tenant_id: string } };

    const serviceSupabase = createServiceClient();

    // Verify zone exists
    const { data: existingZone, error: zoneError } = await serviceSupabase
      .from('zones')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (zoneError || !existingZone) {
      return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 });
    }

    // Check for active clients assigned to this zone
    const { count: clientCount } = await serviceSupabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('zone_id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null);

    if (clientCount && clientCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la zona porque tiene ${clientCount} cliente(s) asignado(s)` },
        { status: 400 }
      );
    }

    // Soft-delete
    const { error: deleteError } = await serviceSupabase
      .from('zones')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', existingZone.id);

    if (deleteError) {
      console.error('Error soft-deleting zone:', deleteError);
      return NextResponse.json({ error: 'Error al eliminar la zona' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Zona eliminada exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in DELETE /api/admin/zones/[id]/edit:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}
