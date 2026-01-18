import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * API Route para invitar usuarios con permisos de administrador
 * POST /api/admin/users/invite
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
      role,
      brand_id,
      zone_id,
      send_email = true
    } = body;

    // Validar datos requeridos
    if (!first_name || !last_name || !email || !role) {
      return NextResponse.json(
        { error: 'Campos requeridos: first_name, last_name, email, role' },
        { status: 400 }
      );
    }

    // 1. Crear usuario en auth con contraseña temporal si no se envía email
    const createUserPayload: {
      email: string;
      password?: string;
      email_confirm?: boolean;
      user_metadata: {
        first_name: string;
        last_name: string;
        invite_mode: boolean;
      };
    } = {
      email,
      user_metadata: {
        first_name,
        last_name,
        invite_mode: true
      }
    };

    // Si no enviamos email, necesitamos una contraseña temporal y confirmar automáticamente
    if (!send_email) {
      createUserPayload.password = Math.random().toString(36).slice(-12) + 'Aa1!'; // Contraseña temporal fuerte
      createUserPayload.email_confirm = true;
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser(createUserPayload);

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
          status: 'active',
          timezone: 'America/Mexico_City'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Error creando perfil: ${profileError.message}`);
      }

      // 3. Asignar rol inicial
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_profile_id: profile.id, // Usar el ID del perfil, no del usuario auth
          tenant_id: tenantId,
          role,
          brand_id: brand_id || null,
          zone_id: zone_id || null,
          status: 'active',
          scope: 'tenant' // Scope por defecto
        })
        .select()
        .single();

      if (roleError) {
        console.error('Role creation error:', roleError);
        throw new Error(`Error creando rol: ${roleError.message}`);
      }

      return NextResponse.json({
        user: profile,
        role: roleData
      }, { status: 201 });

    } catch (error) {
      // Si falla la creación del perfil o rol, limpiar usuario de auth
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }

  } catch (error) {
    console.error('Error inviting user:', error);
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
