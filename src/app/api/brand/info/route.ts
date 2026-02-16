import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    // Obtener información de la marca
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
      .eq('id', brandId)
      .single()

    if (brandError || !brandInfo) {
      return NextResponse.json(
        { error: 'Información de marca no encontrada' },
        { status: 404 }
      )
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
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    // Obtener datos del body
    const body = await request.json()
    const {
      name,
      description,
      contact_email,
      contact_phone,
      website,
      logo_url,
      brand_color_primary,
      brand_color_secondary,
      settings
    } = body

    // Actualizar marca
    const { data: updatedBrand, error: updateError } = await supabase
      .from('brands')
      .update({
        name,
        description,
        contact_email,
        contact_phone,
        website,
        logo_url,
        brand_color_primary,
        brand_color_secondary,
        settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', brandId)
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
