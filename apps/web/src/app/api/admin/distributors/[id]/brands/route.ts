import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveIdColumn } from '@/lib/utils/public-id'

interface RouteParams {
  params: Promise<{ id: string }>
}

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 }) }
  }

  const { data: userRoles, error: roleError } = await supabase
    .from('user_roles')
    .select('role, status')
    .eq('user_profile_id', profile.id)
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)

  const adminRole = userRoles?.find(
    r => r.status === 'active' && r.role === 'admin'
  )

  if (roleError || !adminRole) {
    return { error: NextResponse.json({ error: 'Sin permisos de administrador' }, { status: 403 }) }
  }

  return { profile }
}

/**
 * GET /api/admin/distributors/[id]/brands
 * Returns all tenant brands with assigned status for a distributor
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: distributorId } = await params
    const supabase = await createClient()
    const auth = await verifyAdmin(supabase)
    if ('error' in auth && auth.error) return auth.error

    const { profile } = auth as { profile: { id: string; tenant_id: string } }
    const serviceSupabase = createServiceClient()

    // Verify distributor belongs to tenant (supports UUID or public_id)
    const idColumn = resolveIdColumn(distributorId)
    const { data: distributor, error: distError } = await serviceSupabase
      .from('distributors')
      .select('id')
      .eq(idColumn, distributorId)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single()

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distribuidor no encontrado' }, { status: 404 })
    }

    // Get all active brands for the tenant
    const { data: brands, error: brandsError } = await serviceSupabase
      .from('brands')
      .select('id, name, logo_url')
      .eq('tenant_id', profile.tenant_id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name')

    if (brandsError) {
      return NextResponse.json({ error: 'Error al obtener marcas' }, { status: 500 })
    }

    // Get assigned brand IDs for this distributor (use resolved UUID)
    const { data: assignedBrands, error: assignedError } = await serviceSupabase
      .from('distributor_brands')
      .select('brand_id')
      .eq('distributor_id', distributor.id)

    if (assignedError) {
      return NextResponse.json({ error: 'Error al obtener marcas asignadas' }, { status: 500 })
    }

    const assignedBrandIds = new Set((assignedBrands || []).map(ab => ab.brand_id))

    const result = (brands || []).map(brand => ({
      id: brand.id,
      name: brand.name,
      logo_url: brand.logo_url,
      assigned: assignedBrandIds.has(brand.id),
    }))

    return NextResponse.json({ brands: result })
  } catch (error) {
    console.error('Error in GET /api/admin/distributors/[id]/brands:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/distributors/[id]/brands
 * Syncs brand assignments for a distributor
 * Body: { brand_ids: string[] }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: distributorId } = await params
    const supabase = await createClient()
    const auth = await verifyAdmin(supabase)
    if ('error' in auth && auth.error) return auth.error

    const { profile } = auth as { profile: { id: string; tenant_id: string } }
    const serviceSupabase = createServiceClient()

    // Verify distributor belongs to tenant (supports UUID or public_id)
    const idColumn = resolveIdColumn(distributorId)
    const { data: distributor, error: distError } = await serviceSupabase
      .from('distributors')
      .select('id')
      .eq(idColumn, distributorId)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single()

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distribuidor no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const brandIds: string[] = body.brand_ids || []

    // Validate brand_ids belong to the tenant
    if (brandIds.length > 0) {
      const { data: validBrands, error: validError } = await serviceSupabase
        .from('brands')
        .select('id')
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .in('id', brandIds)

      if (validError) {
        return NextResponse.json({ error: 'Error al validar marcas' }, { status: 500 })
      }

      if ((validBrands || []).length !== brandIds.length) {
        return NextResponse.json({ error: 'Algunas marcas no son válidas' }, { status: 400 })
      }
    }

    // Delete existing assignments (use resolved UUID)
    const { error: deleteError } = await serviceSupabase
      .from('distributor_brands')
      .delete()
      .eq('distributor_id', distributor.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Error al actualizar marcas' }, { status: 500 })
    }

    // Insert new assignments
    if (brandIds.length > 0) {
      const rows = brandIds.map(brandId => ({
        tenant_id: profile.tenant_id,
        distributor_id: distributor.id,
        brand_id: brandId,
      }))

      const { error: insertError } = await serviceSupabase
        .from('distributor_brands')
        .insert(rows)

      if (insertError) {
        return NextResponse.json({ error: 'Error al asignar marcas' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, assigned_count: brandIds.length })
  } catch (error) {
    console.error('Error in PUT /api/admin/distributors/[id]/brands:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
