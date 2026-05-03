import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { distributorCreateSchema } from '@/lib/types/admin';
import { z } from 'zod';

/**
 * POST /api/admin/distributors/create - Crear distribuidor
 */
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Sin permisos para crear distribuidores' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = distributorCreateSchema.parse(body);

    const serviceSupabase = createServiceClient();

    const distributorData = {
      tenant_id: profile.tenant_id,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newDistributor, error: insertError } = await serviceSupabase
      .from('distributors')
      .insert(distributorData)
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting distributor:', insertError);
      return NextResponse.json({ error: 'Error al crear el distribuidor' }, { status: 500 });
    }

    return NextResponse.json(
      { data: newDistributor, message: 'Distribuidor creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/distributors/create:', error);

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

export async function GET() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}
