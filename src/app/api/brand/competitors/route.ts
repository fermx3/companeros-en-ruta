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

    const includeProducts = searchParams.get('include_products') === 'true'

    // Build query
    let query = supabase
      .from('brand_competitors')
      .select(includeProducts
        ? `
          id,
          public_id,
          competitor_name,
          logo_url,
          is_active,
          display_order,
          created_at,
          brand_competitor_products(
            id,
            product_name,
            default_size_grams,
            default_size_ml,
            is_active,
            brand_competitor_product_sizes(
              id,
              size_value,
              size_unit,
              is_default
            )
          )
        `
        : `
          id,
          public_id,
          competitor_name,
          logo_url,
          is_active,
          display_order,
          created_at
        `
      )
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    const { data: competitors, error } = await query

    if (error) {
      console.error('Error fetching competitors:', error)
      return NextResponse.json(
        { error: 'Error al obtener competidores' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      competitors: competitors || [],
      total: competitors?.length || 0
    })

  } catch (error) {
    console.error('Error in GET /api/brand/competitors:', error)
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

    const { competitor_name, logo_url, products } = body

    if (!competitor_name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre del competidor es requerido' },
        { status: 400 }
      )
    }

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('brand_competitors')
      .select('display_order')
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.display_order || 0) + 1

    // Create competitor
    const { data: competitor, error: competitorError } = await supabase
      .from('brand_competitors')
      .insert({
        tenant_id: tenantId,
        brand_id: brandId,
        competitor_name: competitor_name.trim(),
        logo_url: logo_url || null,
        display_order: nextOrder,
        is_active: true
      })
      .select()
      .single()

    if (competitorError) {
      console.error('Error creating competitor:', competitorError)
      return NextResponse.json(
        { error: 'Error al crear competidor' },
        { status: 500 }
      )
    }

    // Create products if provided
    if (products && Array.isArray(products) && products.length > 0) {
      for (const product of products) {
        if (!product.product_name?.trim()) continue

        const { data: productData, error: productError } = await supabase
          .from('brand_competitor_products')
          .insert({
            tenant_id: tenantId,
            competitor_id: competitor.id,
            product_name: product.product_name.trim(),
            default_size_grams: product.default_size_grams || null,
            default_size_ml: product.default_size_ml || null,
            is_active: true
          })
          .select()
          .single()

        if (productError) {
          console.error('Error creating product:', productError)
          continue
        }

        // Create sizes if provided
        if (product.sizes && Array.isArray(product.sizes)) {
          for (const size of product.sizes) {
            if (!size.size_value) continue

            await supabase
              .from('brand_competitor_product_sizes')
              .insert({
                competitor_product_id: productData.id,
                size_value: size.size_value,
                size_unit: size.size_unit || 'g',
                is_default: size.is_default || false
              })
          }
        }
      }
    }

    // Fetch the complete competitor with products
    const { data: completeCompetitor } = await supabase
      .from('brand_competitors')
      .select(`
        id,
        public_id,
        competitor_name,
        logo_url,
        is_active,
        display_order,
        created_at,
        brand_competitor_products(
          id,
          product_name,
          default_size_grams,
          default_size_ml,
          is_active,
          brand_competitor_product_sizes(
            id,
            size_value,
            size_unit,
            is_default
          )
        )
      `)
      .eq('id', competitor.id)
      .single()

    return NextResponse.json({ competitor: completeCompetitor }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/brand/competitors:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
