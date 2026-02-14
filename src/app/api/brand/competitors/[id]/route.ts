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

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId } = result

    const { data: competitor, error } = await supabase
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
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (error || !competitor) {
      return NextResponse.json(
        { error: 'Competidor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ competitor })

  } catch (error) {
    console.error('Error in GET /api/brand/competitors/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
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

    // Verify competitor belongs to brand
    const { data: existing } = await supabase
      .from('brand_competitors')
      .select('id')
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Competidor no encontrado' },
        { status: 404 }
      )
    }

    const { competitor_name, logo_url, is_active, products } = body

    // Update competitor
    const updates: Record<string, unknown> = {}
    if (competitor_name !== undefined) updates.competitor_name = competitor_name.trim()
    if (logo_url !== undefined) updates.logo_url = logo_url || null
    if (is_active !== undefined) updates.is_active = is_active

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('brand_competitors')
        .update(updates)
        .eq('id', id)

      if (updateError) {
        console.error('Error updating competitor:', updateError)
        return NextResponse.json(
          { error: 'Error al actualizar competidor' },
          { status: 500 }
        )
      }
    }

    // Handle products update if provided
    if (products && Array.isArray(products)) {
      // Get existing products
      const { data: existingProducts } = await supabase
        .from('brand_competitor_products')
        .select('id')
        .eq('competitor_id', id)

      const existingProductIds = new Set(existingProducts?.map(p => p.id) || [])
      const updatedProductIds = new Set<string>()

      for (const product of products) {
        if (product.id && existingProductIds.has(product.id)) {
          // Update existing product
          updatedProductIds.add(product.id)
          await supabase
            .from('brand_competitor_products')
            .update({
              product_name: product.product_name?.trim(),
              default_size_grams: product.default_size_grams || null,
              default_size_ml: product.default_size_ml || null,
              is_active: product.is_active ?? true
            })
            .eq('id', product.id)

          // Handle sizes
          if (product.sizes && Array.isArray(product.sizes)) {
            // Delete existing sizes and recreate
            await supabase
              .from('brand_competitor_product_sizes')
              .delete()
              .eq('competitor_product_id', product.id)

            for (const size of product.sizes) {
              if (!size.size_value) continue
              await supabase
                .from('brand_competitor_product_sizes')
                .insert({
                  competitor_product_id: product.id,
                  size_value: size.size_value,
                  size_unit: size.size_unit || 'g',
                  is_default: size.is_default || false
                })
            }
          }
        } else if (product.product_name?.trim()) {
          // Create new product
          const { data: newProduct } = await supabase
            .from('brand_competitor_products')
            .insert({
              tenant_id: tenantId,
              competitor_id: id,
              product_name: product.product_name.trim(),
              default_size_grams: product.default_size_grams || null,
              default_size_ml: product.default_size_ml || null,
              is_active: true
            })
            .select()
            .single()

          if (newProduct && product.sizes && Array.isArray(product.sizes)) {
            for (const size of product.sizes) {
              if (!size.size_value) continue
              await supabase
                .from('brand_competitor_product_sizes')
                .insert({
                  competitor_product_id: newProduct.id,
                  size_value: size.size_value,
                  size_unit: size.size_unit || 'g',
                  is_default: size.is_default || false
                })
            }
          }
        }
      }

      // Soft delete products not in the update (keep historical data)
      for (const existingId of existingProductIds) {
        if (!updatedProductIds.has(existingId)) {
          await supabase
            .from('brand_competitor_products')
            .update({ is_active: false })
            .eq('id', existingId)
        }
      }
    }

    // Fetch updated competitor
    const { data: competitor } = await supabase
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
      .eq('id', id)
      .single()

    return NextResponse.json({ competitor })

  } catch (error) {
    console.error('Error in PUT /api/brand/competitors/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId } = result

    // Verify competitor belongs to brand
    const { data: existing } = await supabase
      .from('brand_competitors')
      .select('id')
      .eq('id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Competidor no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('brand_competitors')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting competitor:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar competidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in DELETE /api/brand/competitors/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
