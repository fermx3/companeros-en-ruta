import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * API Route para crear usuarios con permisos de administrador
 * POST /api/admin/users/create
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const {
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      employee_code,
      password,
      status = 'active'
    } = body;

    // Validar datos requeridos
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: 'Campos requeridos: first_name, last_name, email, password' },
        { status: 400 }
      );
    }

    // 1. Crear usuario en auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name
      }
    });

    if (authError || !authUser.user) {
      console.error('Supabase Auth Error:', authError);
      return NextResponse.json(
        {
          error: `Error al crear usuario en auth: ${authError?.message}`,
          details: authError
        },
        { status: 400 }
      );
    }

    try {
      const tenantId = process.env.NEXT_PUBLIC_DEMO_TENANT_ID;

      if (!tenantId) {
        throw new Error('NEXT_PUBLIC_DEMO_TENANT_ID not configured');
      }

      // 2. Crear perfil de usuario
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authUser.user.id,
          tenant_id: tenantId,
          first_name,
          last_name,
          email,
          phone,
          position,
          department,
          employee_code,
          status,
          timezone: 'America/Mexico_City'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Error creando perfil: ${profileError.message}`);
      }

      return NextResponse.json({ user: profile }, { status: 201 });

    } catch (error) {
      // Si falla la creación del perfil, limpiar usuario de auth
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }

  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json(
      {
        error: errorMessage,
        details: error
      },
      { status: 500 }
    );
  }
}
