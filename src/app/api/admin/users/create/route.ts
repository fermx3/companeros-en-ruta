import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServiceClient } from '@/lib/utils/tenant';

/**
 * API Route para crear usuarios con permisos de administrador
 * POST /api/admin/users/create
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener cliente autenticado y tenant_id
    const { supabase, tenantId } = await getAuthenticatedServiceClient();
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

    // 1. Crear usuario en auth o manejar usuario existente
    let authUser;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name
      }
    });

    // Si el usuario ya existe en auth, intentar obtenerlo
    if (authError?.message?.includes('User already registered') || authError?.message?.includes('already exists')) {
      console.log('User already exists in auth, attempting to retrieve existing user');

      // Obtener el usuario existente
      const { data: existingUsers, error: getUserError } = await supabase.auth.admin.listUsers();

      if (getUserError) {
        return NextResponse.json(
          {
            error: `Error al verificar usuarios existentes: ${getUserError.message}`,
            details: getUserError
          },
          { status: 400 }
        );
      }

      // Buscar el usuario por email
      const existingUser = existingUsers.users?.find((user: any) => user.email === email);

      if (!existingUser) {
        return NextResponse.json(
          {
            error: `Usuario ya existe en auth pero no se pudo recuperar: ${authError.message}`,
            details: authError
          },
          { status: 400 }
        );
      }

      // Usar el usuario existente
      authUser = { user: existingUser };
    } else if (authError || !authData?.user) {
      console.error('Supabase Auth Error:', authError);
      return NextResponse.json(
        {
          error: `Error al crear usuario en auth: ${authError?.message}`,
          details: authError
        },
        { status: 400 }
      );
    } else {
      authUser = authData;
    }

    let userWasCreatedNew = !authError?.message?.includes('User already registered') && !authError?.message?.includes('already exists');

    try {
      // 2. Verificar si ya existe el perfil o crearlo
      let profile;

      // Primero verificar si existe el perfil
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.user.id)
        .single();

      if (existingProfile) {
        // Si ya existe el perfil, actualizarlo con los nuevos datos
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
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
          .eq('user_id', authUser.user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw new Error(`Error actualizando perfil: ${updateError.message}`);
        }

        profile = updatedProfile;
      } else {
        // Si no existe, crearlo
        const { data: newProfile, error: profileError } = await supabase
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

        profile = newProfile;
      }

      return NextResponse.json({ user: profile }, { status: 201 });

    } catch (error) {
      // Si falla la creación del perfil y el usuario fue creado nuevo, limpiar usuario de auth
      if (userWasCreatedNew && authUser?.user?.id) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      }
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
