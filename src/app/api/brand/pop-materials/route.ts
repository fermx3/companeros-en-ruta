import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to get brand profile from auth
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
    user,
    userProfileId: userProfile.id,
    brandId: brandRole.brand_id,
    tenantId: brandRole.tenant_id || userProfile.tenant_id
  }
}

// Material categories
const MATERIAL_CATEGORIES = {
  poster: 'Poster',
  exhibidor: 'Exhibidor',
  senalizacion: 'Señalización',
  colgante: 'Colgante',
  banner: 'Banner',
  otro: 'Otro'
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
    const includeSystem = searchParams.get('include_system') !== 'false'

    // Get brand-specific materials
    const { data: brandMaterials, error: brandError } = await supabase
      .from('brand_pop_materials')
      .select('*')
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (brandError) {
      console.error('Error fetching brand materials:', brandError)
      return NextResponse.json(
        { error: 'Error al obtener materiales' },
        { status: 500 }
      )
    }

    // Get system templates if requested
    let systemMaterials: typeof brandMaterials = []
    if (includeSystem) {
      const { data, error } = await supabase
        .from('brand_pop_materials')
        .select('*')
        .eq('is_system_template', true)
        .is('deleted_at', null)
        .order('display_order', { ascending: true })

      if (!error) {
        systemMaterials = data || []
      }
    }

    return NextResponse.json({
      materials: brandMaterials || [],
      systemTemplates: systemMaterials,
      categories: MATERIAL_CATEGORIES
    })

  } catch (error) {
    console.error('Error in GET /api/brand/pop-materials:', error)
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

    const { material_name, material_category } = body

    if (!material_name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre del material es requerido' },
        { status: 400 }
      )
    }

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('brand_pop_materials')
      .select('display_order')
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.display_order || 0) + 1

    // Create material
    const { data: material, error: materialError } = await supabase
      .from('brand_pop_materials')
      .insert({
        tenant_id: tenantId,
        brand_id: brandId,
        material_name: material_name.trim(),
        material_category: material_category || null,
        is_system_template: false,
        display_order: nextOrder,
        is_active: true
      })
      .select()
      .single()

    if (materialError) {
      console.error('Error creating material:', materialError)
      return NextResponse.json(
        { error: 'Error al crear material' },
        { status: 500 }
      )
    }

    return NextResponse.json({ material }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/brand/pop-materials:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
