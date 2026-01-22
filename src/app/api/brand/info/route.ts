import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado', details: authError?.message },
        { status: 401 }
      )
    }

    // 2. Obtener user_profile y brand_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_roles!user_roles_user_profile_id_fkey(
          brand_id,
          role,
          status
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado', details: profileError?.message },
        { status: 404 }
      )
    }

    // Validar que tenga rol de marca activo
    const brandRole = userProfile.user_roles.find(role =>
      role.status === 'active' &&
      ['brand_manager', 'brand_admin'].includes(role.role)
    )

    if (!brandRole || !brandRole.brand_id) {
      return NextResponse.json(
        { error: 'Usuario no tiene permisos de marca activos' },
        { status: 403 }
      )
    }

    const targetBrandId = brandRole.brand_id

    // 3. Obtener información de la marca
    const { data: brandInfo, error: brandError } = await supabase
      .from('brands')
      .select(`
        id,
        public_id,
        tenant_id,
        name,
        slug,
        description,
        logo_url,
        brand_color_primary,
        brand_color_secondary,
        contact_email,
        contact_phone,
        website,
        status,
        settings,
        created_at,
        updated_at,
        tenants!brands_tenant_id_fkey(
          name,
          slug
        )
      `)
      .eq('id', targetBrandId)
      .single()

    if (brandError) {
      console.error('Error al obtener marca:', brandError)
      throw new Error(`Error al obtener información de marca: ${brandError.message}`)
    }

    if (!brandInfo) {
      console.error('Marca no encontrada para brand_id:', targetBrandId)
      throw new Error('Información de marca no encontrada')
    }

    return NextResponse.json({
      brand: {
        id: brandInfo.id,
        public_id: brandInfo.public_id,
        tenant_id: brandInfo.tenant_id,
        name: brandInfo.name,
        slug: brandInfo.slug,
        description: brandInfo.description,
        logo_url: brandInfo.logo_url,
        brand_color_primary: brandInfo.brand_color_primary,
        brand_color_secondary: brandInfo.brand_color_secondary,
        contact_email: brandInfo.contact_email,
        contact_phone: brandInfo.contact_phone,
        website: brandInfo.website,
        status: brandInfo.status,
        settings: brandInfo.settings,
        created_at: brandInfo.created_at,
        updated_at: brandInfo.updated_at,
        tenant: {
          name: ((brandInfo as Record<string, unknown>).tenants as Record<string, unknown> | null)?.name as string,
          slug: ((brandInfo as Record<string, unknown>).tenants as Record<string, unknown> | null)?.slug as string
        }
      }
    })

  } catch (error) {
    console.error('Error en /api/brand/info:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado', details: authError?.message },
        { status: 401 }
      )
    }

    // 2. Obtener user_profile y brand_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_roles!user_roles_user_profile_id_fkey(
          brand_id,
          role,
          status
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado', details: profileError?.message },
        { status: 404 }
      )
    }

    // Validar que tenga rol de marca activo
    const brandRole = userProfile.user_roles.find(role =>
      role.status === 'active' &&
      ['brand_manager', 'brand_admin'].includes(role.role)
    )

    if (!brandRole || !brandRole.brand_id) {
      return NextResponse.json(
        { error: 'Usuario no tiene permisos de marca activos' },
        { status: 403 }
      )
    }

    const targetBrandId = brandRole.brand_id

    // 3. Obtener datos del body
    const body = await request.json()
    const {
      name,
      description,
      contact_email,
      contact_phone,
      website,
      brand_color_primary,
      brand_color_secondary,
      settings
    } = body

    // 4. Actualizar marca
    const { data: updatedBrand, error: updateError } = await supabase
      .from('brands')
      .update({
        name,
        description,
        contact_email,
        contact_phone,
        website,
        brand_color_primary,
        brand_color_secondary,
        settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetBrandId)
      .select(`
        id,
        public_id,
        tenant_id,
        name,
        slug,
        description,
        logo_url,
        brand_color_primary,
        brand_color_secondary,
        contact_email,
        contact_phone,
        website,
        status,
        settings,
        created_at,
        updated_at
      `)
      .single()

    if (updateError) {
      throw new Error(`Error al actualizar marca: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Marca actualizada correctamente',
      brand: updatedBrand
    })

  } catch (error) {
    console.error('Error en PUT /api/brand/info:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
