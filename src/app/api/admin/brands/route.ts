import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Crear cliente Supabase con service role key
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const DEMO_TENANT_ID = 'fe0f429d-2d83-4738-af65-32c655cef656';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const tenantId = searchParams.get('tenant_id') ?? DEMO_TENANT_ID;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    console.log('API Route - getBrands:', { page, limit, tenantId, from, to });

    const { data, error, count } = await supabase
      .from('brands')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    console.log('API Route - query result:', { data: data?.length, error, count });

    if (error) {
      console.error('Database error:', error);
      return Response.json(
        { error: 'Error al obtener brands', details: error.message },
        { status: 500 }
      );
    }

    const response = {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };

    return Response.json(response);

  } catch (error) {
    console.error('API Route error:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Crear brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = DEMO_TENANT_ID;

    // Generar public_id único
    const { count } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    const nextNumber = (count || 0) + 1;
    const publicId = `BRD-${nextNumber.toString().padStart(4, '0')}`;

    // Crear slug desde el nombre
    const slug = body.name?.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const brandData = {
      public_id: publicId,
      name: body.name,
      slug,
      description: body.description,
      website: body.website,
      tenant_id: tenantId,
      status: body.status || 'active',
      settings: body.settings || {}
    };

    const { data, error } = await supabase
      .from('brands')
      .insert(brandData)
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: 'Error al crear brand', details: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data });

  } catch (error) {
    console.error('API Route POST error:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
