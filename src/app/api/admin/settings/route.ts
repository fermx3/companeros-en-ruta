import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { tenantUpdateSchema } from '@/lib/types/admin';
import { z } from 'zod';

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
    return { error: NextResponse.json({ error: 'Sin permisos de administrador' }, { status: 403 }) };
  }

  return { profile };
}

/**
 * GET /api/admin/settings - Obtener información del tenant
 */
export async function GET() {
  try {
    const supabase = createClient();
    const auth = await verifyAdmin(supabase);
    if ('error' in auth && auth.error) return auth.error;
    const { profile } = auth as { profile: { id: string; tenant_id: string } };

    const serviceSupabase = createServiceClient();

    const { data: tenant, error: tenantError } = await serviceSupabase
      .from('tenants')
      .select('*')
      .eq('id', profile.tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: tenant }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/settings - Actualizar información del tenant
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const auth = await verifyAdmin(supabase);
    if ('error' in auth && auth.error) return auth.error;
    const { profile } = auth as { profile: { id: string; tenant_id: string } };

    const body = await request.json();

    // Only allow updating editable fields (not subscription_plan, status, etc.)
    const editableSchema = z.object({
      name: z.string().min(1, 'Nombre es requerido').max(100),
      email: z.string().email('Email inválido').optional().or(z.literal('')),
      phone: z.string().optional().or(z.literal('')),
      address: z.string().optional().or(z.literal('')),
      timezone: z.string().default('America/Mexico_City'),
    });

    const validatedData = editableSchema.parse(body);

    const serviceSupabase = createServiceClient();

    const updateData = {
      name: validatedData.name,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      address: validatedData.address || null,
      timezone: validatedData.timezone,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await serviceSupabase
      .from('tenants')
      .update(updateData)
      .eq('id', profile.tenant_id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating tenant:', updateError);
      return NextResponse.json({ error: 'Error al actualizar la configuración' }, { status: 500 });
    }

    return NextResponse.json(
      { data: updated, message: 'Configuración actualizada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/admin/settings:', error);

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
