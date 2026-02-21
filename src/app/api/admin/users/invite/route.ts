import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServiceClient } from '@/lib/utils/tenant';
import { extractDigits } from '@/lib/utils/phone';

/**
 * API Route para invitar usuarios con permisos de administrador
 * POST /api/admin/users/invite
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

    // Validate phone (10 digits for Mexico)
    if (phone) {
      const phoneDigits = extractDigits(phone);
      if (phoneDigits.length !== 10) {
        return NextResponse.json(
          { error: 'El teléfono debe tener 10 dígitos' },
          { status: 400 }
        );
      }
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

    let authUser;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser(createUserPayload);

    // Si el usuario ya existe en auth, intentar obtenerlo
    if (authError?.message?.includes('User already registered') || authError?.message?.includes('already exists')) {
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
            status: 'active',
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
            status: 'active',
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

      // 3. Verificar y asignar rol inicial
      let roleData;

      // Determinar el scope correcto basado en si hay brand_id
      const roleScope = brand_id ? 'brand' : 'tenant';

      // Verificar si ya tiene un rol similar
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_profile_id', profile.id)
        .eq('tenant_id', tenantId)
        .eq('role', role)
        .eq('brand_id', brand_id || null)
        .eq('zone_id', zone_id || null)
        .eq('scope', roleScope)
        .single();

      if (existingRole) {
        // Si ya existe el rol, simplemente usarlo
        roleData = existingRole;
      } else {
        // Si no existe, crearlo
        const { data: newRole, error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_profile_id: profile.id, // Usar el ID del perfil, no del usuario auth
            tenant_id: tenantId,
            role,
            brand_id: brand_id || null,
            zone_id: zone_id || null,
            status: 'active',
            scope: roleScope // Usar el scope calculado
          })
          .select()
          .single();

        if (roleError) {
          console.error('Role creation error:', roleError);
          throw new Error(`Error creando rol: ${roleError.message}`);
        }

        roleData = newRole;
      }

      return NextResponse.json({
        user: profile,
        role: roleData
      }, { status: 201 });

    } catch (error) {
      // Si falla la creación del perfil o rol y el usuario fue creado nuevo, limpiar usuario de auth
      if (userWasCreatedNew && authUser?.user?.id) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      }
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
