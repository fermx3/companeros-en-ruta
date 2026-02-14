import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getBrandProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: { message: 'Usuario no autenticado', status: 401 } }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      tenant_id,
      user_roles!user_roles_user_profile_id_fkey(
        brand_id,
        role,
        status,
        tenant_id
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  const brandRole = userProfile.user_roles.find((role: { status: string; role: string }) =>
    role.status === 'active' &&
    ['brand_manager', 'brand_admin'].includes(role.role)
  )

  if (!brandRole || !brandRole.brand_id) {
    return { error: { message: 'Usuario no tiene permisos de marca activos', status: 403 } }
  }

  return {
    brandId: brandRole.brand_id,
    tenantId: brandRole.tenant_id || userProfile.tenant_id
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId } = result
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'

    let query = supabase
      .from('brand_exhibitions')
      .select(`
        id,
        public_id,
        exhibition_name,
        negotiated_period,
        location_description,
        start_date,
        end_date,
        is_active,
        created_at,
        products(
          id,
          name,
          sku
        ),
        brand_communication_plans(
          id,
          plan_name
        )
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: exhibitions, error } = await query

    if (error) {
      console.error('Error fetching exhibitions:', error)
      return NextResponse.json(
        { error: 'Error al obtener exhibiciones' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      exhibitions: exhibitions || [],
      total: exhibitions?.length || 0
    })

  } catch (error) {
    console.error('Error in GET /api/brand/exhibitions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId, tenantId } = result
    const body = await request.json()

    const {
      exhibition_name,
      negotiated_period,
      location_description,
      start_date,
      end_date,
      product_id,
      communication_plan_id
    } = body

    if (!exhibition_name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la exhibición es requerido' },
        { status: 400 }
      )
    }

    const { data: exhibition, error: exhibitionError } = await supabase
      .from('brand_exhibitions')
      .insert({
        tenant_id: tenantId,
        brand_id: brandId,
        exhibition_name: exhibition_name.trim(),
        negotiated_period: negotiated_period || null,
        location_description: location_description || null,
        start_date: start_date || null,
        end_date: end_date || null,
        product_id: product_id || null,
        communication_plan_id: communication_plan_id || null,
        is_active: true
      })
      .select(`
        id,
        public_id,
        exhibition_name,
        negotiated_period,
        location_description,
        start_date,
        end_date,
        is_active,
        created_at,
        products(
          id,
          name,
          sku
        ),
        brand_communication_plans(
          id,
          plan_name
        )
      `)
      .single()

    if (exhibitionError) {
      console.error('Error creating exhibition:', exhibitionError)
      return NextResponse.json(
        { error: 'Error al crear exhibición' },
        { status: 500 }
      )
    }

    return NextResponse.json({ exhibition }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/brand/exhibitions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
