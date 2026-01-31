import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface AvailableBrand {
  id: string
  public_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  brand_color_primary: string | null
  is_member: boolean
  membership_status: string | null
}

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Get client data
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'No se encontró un perfil de cliente asociado a tu cuenta' },
        { status: 404 }
      )
    }

    // 3. Get all active brands in the tenant
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select(`
        id,
        public_id,
        name,
        slug,
        description,
        logo_url,
        brand_color_primary
      `)
      .eq('tenant_id', clientData.tenant_id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name')

    if (brandsError) {
      throw new Error(`Error al obtener marcas: ${brandsError.message}`)
    }

    // 4. Get client's existing memberships
    const { data: memberships } = await supabase
      .from('client_brand_memberships')
      .select('brand_id, membership_status')
      .eq('client_id', clientData.id)
      .is('deleted_at', null)

    const membershipMap = new Map(
      (memberships || []).map(m => [m.brand_id, m.membership_status])
    )

    // 5. Transform response
    const availableBrands: AvailableBrand[] = (brands || []).map(brand => ({
      id: brand.id,
      public_id: brand.public_id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo_url: brand.logo_url,
      brand_color_primary: brand.brand_color_primary,
      is_member: membershipMap.has(brand.id),
      membership_status: membershipMap.get(brand.id) || null
    }))

    return NextResponse.json({
      brands: availableBrands
    })

  } catch (error) {
    console.error('Error en GET /api/client/brands:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Get client data
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'No se encontró un perfil de cliente asociado a tu cuenta' },
        { status: 404 }
      )
    }

    // 3. Get request body
    const body = await request.json()
    const { brand_id } = body

    if (!brand_id) {
      return NextResponse.json(
        { error: 'El ID de la marca es requerido' },
        { status: 400 }
      )
    }

    // 4. Verify brand exists and belongs to same tenant
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id, name, tenant_id, status')
      .eq('id', brand_id)
      .is('deleted_at', null)
      .single()

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Marca no encontrada' },
        { status: 404 }
      )
    }

    if (brand.tenant_id !== clientData.tenant_id) {
      return NextResponse.json(
        { error: 'No puedes unirte a esta marca' },
        { status: 403 }
      )
    }

    if (brand.status !== 'active') {
      return NextResponse.json(
        { error: 'Esta marca no está activa actualmente' },
        { status: 400 }
      )
    }

    // 5. Check if membership already exists
    const { data: existingMembership } = await supabase
      .from('client_brand_memberships')
      .select('id, membership_status')
      .eq('client_id', clientData.id)
      .eq('brand_id', brand_id)
      .is('deleted_at', null)
      .single()

    if (existingMembership) {
      if (existingMembership.membership_status === 'pending') {
        return NextResponse.json(
          { error: 'Ya tienes una solicitud pendiente para esta marca' },
          { status: 400 }
        )
      }
      if (existingMembership.membership_status === 'active') {
        return NextResponse.json(
          { error: 'Ya eres miembro de esta marca' },
          { status: 400 }
        )
      }
      // If cancelled or suspended, allow re-subscription
    }

    // 6. Create membership with pending status (client self-subscribe)
    const { data: newMembership, error: createError } = await supabase
      .from('client_brand_memberships')
      .insert({
        client_id: clientData.id,
        brand_id: brand_id,
        tenant_id: clientData.tenant_id,
        membership_status: 'pending',
        points_balance: 0,
        lifetime_points: 0
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Error al crear membresía: ${createError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: `Solicitud enviada a ${brand.name}. Espera la aprobación de la marca.`,
      membership: {
        id: newMembership.id,
        public_id: newMembership.public_id,
        brand_name: brand.name,
        status: 'pending'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/client/brands:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
