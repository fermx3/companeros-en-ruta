import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

// GET: Retrieve products for a brand
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
  if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
  const { brandId: effectiveBrandId, tenantId } = result

  const includeInactive = searchParams.get('include_inactive') === 'true'
  const forDashboard = searchParams.get('dashboard') === 'true'

  // Build available brands list from user's roles
  const userBrandIds = [...new Set(result.allBrandRoles.map(r => r.brand_id))]
  let availableBrands: Array<{ id: string; name: string }> = []

  if (userBrandIds.length > 0) {
    const { data: brandsData } = await supabase
      .from('brands')
      .select('id, name')
      .in('id', userBrandIds)
      .is('deleted_at', null)
      .order('name')

    availableBrands = brandsData || []
  }

  // Fallback for global admins
  if (availableBrands.length === 0) {
    const { data: tenantBrands } = await supabase
      .from('brands')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('name')

    availableBrands = tenantBrands || []
  }

  // For dashboard: fetch full product details with variants and category
  if (forDashboard) {
    // First fetch products
    let query = supabase
      .from('products')
      .select(`
        id,
        public_id,
        name,
        sku,
        description,
        barcode,
        base_price,
        cost,
        is_active,
        is_featured,
        include_in_assessment,
        category_id,
        created_at
      `)
      .eq('brand_id', effectiveBrandId)
      .is('deleted_at', null)
      .order('name')

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('[Products API] Error fetching products:', error)
      return NextResponse.json({ error: 'Error fetching products', details: error.message }, { status: 500 })
    }

    // Fetch variants for these products
    const productIds = (products || []).map(p => p.id)
    let variants: any[] = []

    if (productIds.length > 0) {
      const { data: variantData } = await supabase
        .from('product_variants')
        .select(`
          id,
          public_id,
          product_id,
          variant_name,
          variant_code,
          barcode,
          price,
          cost,
          size_value,
          size_unit,
          package_type,
          is_active,
          is_default
        `)
        .in('product_id', productIds)
        .is('deleted_at', null)
        .order('sort_order')

      variants = variantData || []
    }

    // Fetch categories for the form
    const { data: categories } = await supabase
      .from('product_categories')
      .select('id, name, code')
      .is('deleted_at', null)
      .order('name')

    // Build a category lookup map
    const categoryMap = new Map((categories || []).map(c => [c.id, c]))

    // Combine products with their variants and category
    // Map sku to code for frontend compatibility
    const enrichedProducts = (products || []).map(product => ({
      ...product,
      code: product.sku,  // Alias for frontend
      product_categories: categoryMap.get(product.category_id) || null,
      product_variants: variants.filter(v => v.product_id === product.id)
    }))

    return NextResponse.json({
      products: enrichedProducts,
      categories: categories || [],
      availableBrands,
      currentBrandId: effectiveBrandId
    })
  }

  // For promotor assessment: simpler query with suggested_price alias
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      sku,
      brand_id,
      base_price,
      product_variants (
        id,
        variant_name,
        size_value,
        size_unit,
        price
      )
    `)
    .eq('brand_id', effectiveBrandId)
    .eq('is_active', true)
    .eq('include_in_assessment', true)
    .is('deleted_at', null)
    .order('name')

  // Transform to include suggested_price alias for frontend compatibility
  const transformedProducts = (products || []).map(product => ({
    ...product,
    code: product.sku,  // Alias for frontend that expects 'code'
    product_variants: product.product_variants.map(variant => ({
      ...variant,
      suggested_price: variant.price
    }))
  }))

  if (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 })
  }

  return NextResponse.json({ products: transformedProducts })
}

// POST: Create a new product
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
  if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
  const { brandId, tenantId } = result

  try {
    const body = await request.json()
    // Frontend sends 'code' but DB column is 'sku'
    const { name, code, description, category_id, base_price, cost, barcode, variants, brand_id: requestBrandId } = body
    const sku = code  // Map to correct column name

    // If a specific brand_id was requested in the body, validate access
    let effectiveBrandId = brandId
    if (requestBrandId && requestBrandId !== brandId) {
      const userBrandIds = result.allBrandRoles.map(r => r.brand_id)
      if (userBrandIds.includes(requestBrandId)) {
        effectiveBrandId = requestBrandId
      }
    }

    if (!name || !sku || !category_id || !base_price) {
      return NextResponse.json({
        error: 'Missing required fields: name, code, category_id, base_price'
      }, { status: 400 })
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        tenant_id: tenantId,
        brand_id: effectiveBrandId,
        category_id,
        name,
        sku,
        description: description || null,
        barcode: barcode || null,
        base_price: parseFloat(base_price),
        cost: cost ? parseFloat(cost) : null,
        is_active: true
      })
      .select()
      .single()

    if (productError) {
      console.error('Error creating product:', productError)
      return NextResponse.json({ error: 'Error creating product', details: productError.message }, { status: 500 })
    }

    // Create variants if provided
    if (variants && variants.length > 0) {
      const variantRecords = variants.map((v: any, index: number) => ({
        tenant_id: tenantId,
        product_id: product.id,
        variant_name: v.variant_name,
        variant_code: v.variant_code || `${sku}-${index + 1}`,
        barcode: v.barcode || null,
        price: parseFloat(v.price),
        cost: v.cost ? parseFloat(v.cost) : null,
        size_value: parseFloat(v.size_value),
        size_unit: v.size_unit,
        package_type: v.package_type || null,
        is_default: index === 0,
        is_active: true
      }))

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantRecords)
        .select()

      if (variantError) {
        console.error('[Products API POST] Error creating variants:', variantError)
      }
    }

    return NextResponse.json({ product, success: true })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
