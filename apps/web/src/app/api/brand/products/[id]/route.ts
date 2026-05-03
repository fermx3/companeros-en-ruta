import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET: Get single product with variants
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: productId } = await params
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
  if (isBrandAuthError(result)) return brandAuthErrorResponse(result)

  const allowedBrandIds = result.allBrandRoles.map(r => r.brand_id)
  // Include the resolved brandId in case user is global admin with no brand roles
  if (!allowedBrandIds.includes(result.brandId)) {
    allowedBrandIds.push(result.brandId)
  }

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_categories (
        id,
        name,
        code
      ),
      product_variants (
        *
      )
    `)
    .eq(resolveIdColumn(productId), productId)
    .is('deleted_at', null)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Verify user has access to this product's brand
  if (!allowedBrandIds.includes(product.brand_id)) {
    return NextResponse.json({ error: 'No tienes acceso a esta marca' }, { status: 403 })
  }

  return NextResponse.json({ product })
}

// PUT: Update product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id: productId } = await params
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const authResult = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
  if (isBrandAuthError(authResult)) return brandAuthErrorResponse(authResult)
  const { tenantId } = authResult

  const allowedBrandIds = authResult.allBrandRoles.map(r => r.brand_id)
  if (!allowedBrandIds.includes(authResult.brandId)) {
    allowedBrandIds.push(authResult.brandId)
  }

  // Verify product exists and user has tenant + brand access
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id, brand_id')
    .eq(resolveIdColumn(productId), productId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .single()

  if (!existingProduct) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (!allowedBrandIds.includes(existingProduct.brand_id)) {
    return NextResponse.json({ error: 'No tienes acceso a esta marca' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      name,
      code,
      description,
      category_id,
      base_price,
      cost,
      barcode,
      is_active,
      is_featured,
      include_in_assessment,
      variants
    } = body

    // Update product
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (code !== undefined) updateData.sku = code  // Frontend sends 'code', DB column is 'sku'
    if (description !== undefined) updateData.description = description
    if (category_id !== undefined) updateData.category_id = category_id
    if (base_price !== undefined) updateData.base_price = parseFloat(base_price)
    if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null
    if (barcode !== undefined) updateData.barcode = barcode
    if (is_active !== undefined) updateData.is_active = is_active
    if (is_featured !== undefined) updateData.is_featured = is_featured
    if (include_in_assessment !== undefined) updateData.include_in_assessment = include_in_assessment

    const { data: product, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', existingProduct.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating product:', updateError)
      return NextResponse.json({ error: 'Error updating product' }, { status: 500 })
    }

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        if (variant.id) {
          // Update existing variant
          const variantUpdate: Record<string, unknown> = {
            updated_at: new Date().toISOString()
          }

          if (variant.variant_name !== undefined) variantUpdate.variant_name = variant.variant_name
          if (variant.variant_code !== undefined) variantUpdate.variant_code = variant.variant_code
          if (variant.price !== undefined) variantUpdate.price = parseFloat(variant.price)
          if (variant.cost !== undefined) variantUpdate.cost = variant.cost ? parseFloat(variant.cost) : null
          if (variant.size_value !== undefined) variantUpdate.size_value = parseFloat(variant.size_value)
          if (variant.size_unit !== undefined) variantUpdate.size_unit = variant.size_unit
          if (variant.package_type !== undefined) variantUpdate.package_type = variant.package_type
          if (variant.barcode !== undefined) variantUpdate.barcode = variant.barcode
          if (variant.is_active !== undefined) variantUpdate.is_active = variant.is_active
          if (variant.is_default !== undefined) variantUpdate.is_default = variant.is_default

          await supabase
            .from('product_variants')
            .update(variantUpdate)
            .eq('id', variant.id)
        } else if (variant._action === 'create') {
          // Create new variant
          await supabase
            .from('product_variants')
            .insert({
              tenant_id: tenantId,
              product_id: existingProduct.id,
              variant_name: variant.variant_name,
              variant_code: variant.variant_code,
              barcode: variant.barcode || null,
              price: parseFloat(variant.price),
              cost: variant.cost ? parseFloat(variant.cost) : null,
              size_value: parseFloat(variant.size_value),
              size_unit: variant.size_unit,
              package_type: variant.package_type || null,
              is_default: variant.is_default || false,
              is_active: true
            })
        }
      }
    }

    return NextResponse.json({ product, success: true })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Soft delete product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: productId } = await params
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const authResult = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
  if (isBrandAuthError(authResult)) return brandAuthErrorResponse(authResult)
  const { tenantId } = authResult

  const allowedBrandIds = authResult.allBrandRoles.map(r => r.brand_id)
  if (!allowedBrandIds.includes(authResult.brandId)) {
    allowedBrandIds.push(authResult.brandId)
  }

  // Verify product exists and get its brand
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id, brand_id')
    .eq(resolveIdColumn(productId), productId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .single()

  if (!existingProduct) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (!allowedBrandIds.includes(existingProduct.brand_id)) {
    return NextResponse.json({ error: 'No tienes acceso a esta marca' }, { status: 403 })
  }

  // Soft delete product
  const { error: deleteError } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', existingProduct.id)
    .eq('tenant_id', tenantId)

  if (deleteError) {
    console.error('Error deleting product:', deleteError)
    return NextResponse.json({ error: 'Error deleting product' }, { status: 500 })
  }

  // Also soft delete variants
  await supabase
    .from('product_variants')
    .update({ deleted_at: new Date().toISOString() })
    .eq('product_id', existingProduct.id)

  return NextResponse.json({ success: true })
}
