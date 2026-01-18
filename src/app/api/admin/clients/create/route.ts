import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

/**
 * API Route para crear un nuevo cliente
 * POST /api/admin/clients/create
 *
 * Endpoint protegido que permite a admins crear nuevos clientes
 * Incluye validación completa y manejo de errores
 */

// Schema de validación para el request
const createClientSchema = z.object({
  business_name: z.string().min(1, 'Nombre del negocio es requerido').max(100),
  legal_name: z.string().optional(),
  owner_name: z.string().min(1, 'Nombre del propietario es requerido').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  tax_id: z.string().optional(),
  zone_id: z.string().uuid('Zona inválida'),
  market_id: z.string().uuid('Mercado inválido'),
  client_type_id: z.string().uuid('Tipo de cliente inválido'),
  commercial_structure_id: z.string().uuid('Estructura comercial inválida'),
  address_street: z.string().min(1, 'Dirección es requerida'),
  address_neighborhood: z.string().optional(),
  address_city: z.string().min(1, 'Ciudad es requerida'),
  address_state: z.string().length(2, 'Código de estado debe tener 2 caracteres').regex(/^[A-Z]{2}$/, 'Código de estado inválido'),
  address_postal_code: z.string().optional(),
  address_country: z.string().length(2, 'Código de país debe tener 2 caracteres').regex(/^[A-Z]{2}$/, 'Código de país inválido'),
  visit_frequency_days: z.number().min(1, 'Frecuencia de visitas debe ser mayor a 0'),
  assessment_frequency_days: z.number().min(1, 'Frecuencia de evaluación debe ser mayor a 0'),
  payment_terms: z.string().optional(),
  minimum_order: z.number().min(1, 'El pedido mínimo debe ser mayor a 0'),
  credit_limit: z.number().min(0, 'El límite de crédito no puede ser negativo')
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación usando client que puede leer cookies de sesión
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el perfil del usuario con id y tenant_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tiene permisos de admin
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_profile_id', profile.id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (roleError || !userRole || userRole.role !== 'admin') {
      return NextResponse.json(
        { error: 'Sin permisos para crear clientes' },
        { status: 403 }
      );
    }

    // Validar y parsear el body del request
    const body = await request.json();
    const validatedData = createClientSchema.parse(body);

    // Verificar que las referencias (zone, market, etc.) pertenecen al tenant
    const serviceSupabase = createServiceClient();
    const referencesToValidate = [
      { table: 'zones', id: validatedData.zone_id, name: 'zona' },
      { table: 'markets', id: validatedData.market_id, name: 'mercado' },
      { table: 'client_types', id: validatedData.client_type_id, name: 'tipo de cliente' },
      { table: 'commercial_structures', id: validatedData.commercial_structure_id, name: 'estructura comercial' }
    ];

    for (const ref of referencesToValidate) {
      const { data, error } = await serviceSupabase
        .from(ref.table)
        .select('id')
        .eq('id', ref.id)
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: `${ref.name} no encontrado o no válido` },
          { status: 400 }
        );
      }
    }

    // Generar public_id único para el cliente
    const { data: existingClients } = await serviceSupabase
      .from('clients')
      .select('public_id')
      .eq('tenant_id', profile.tenant_id)
      .like('public_id', 'CLI-%')
      .order('public_id', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (existingClients && existingClients.length > 0) {
      const lastPublicId = existingClients[0].public_id;
      const lastNumber = parseInt(lastPublicId.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    const publicId = `CLI-${nextNumber.toString().padStart(4, '0')}`;

    // Crear el cliente (sin mapeo, los códigos vienen ya validados del frontend)
    const clientData = {
      public_id: publicId,
      tenant_id: profile.tenant_id,
      business_name: validatedData.business_name,
      legal_name: validatedData.legal_name || null,
      owner_name: validatedData.owner_name,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      whatsapp: validatedData.whatsapp || null,
      tax_id: validatedData.tax_id || null,
      zone_id: validatedData.zone_id,
      market_id: validatedData.market_id,
      client_type_id: validatedData.client_type_id,
      commercial_structure_id: validatedData.commercial_structure_id,
      address_street: validatedData.address_street,
      address_neighborhood: validatedData.address_neighborhood || null,
      address_city: validatedData.address_city,
      address_state: validatedData.address_state, // Ya viene como código de 2 caracteres
      address_postal_code: validatedData.address_postal_code || null,
      address_country: validatedData.address_country, // Ya viene como código de 2 caracteres
      visit_frequency_days: validatedData.visit_frequency_days,
      assessment_frequency_days: validatedData.assessment_frequency_days,
      payment_terms: validatedData.payment_terms || null,
      minimum_order: Math.max(validatedData.minimum_order, 1), // Asegurar que sea al menos 1
      credit_limit: validatedData.credit_limit,
      status: 'active',
      registration_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newClient, error: insertError } = await serviceSupabase
      .from('clients')
      .insert(clientData)
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting client:', insertError);
      return NextResponse.json(
        { error: 'Error al crear el cliente' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: newClient,
        message: 'Cliente creado exitosamente'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in POST /api/admin/clients/create:', error);

    // Manejar errores de validación de Zod
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

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Manejar métodos no permitidos
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}
