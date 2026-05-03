import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

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
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

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
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
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
