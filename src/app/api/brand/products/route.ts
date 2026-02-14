import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Retrieve products for a specific brand
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const brandId = searchParams.get('brand_id')

  if (!brandId) {
    return NextResponse.json({ error: 'brand_id is required' }, { status: 400 })
  }

  // Fetch products for the brand with variants
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      sku,
      brand_id,
      product_variants (
        id,
        variant_name,
        size_value,
        size_unit,
        suggested_price
      )
    `)
    .eq('brand_id', brandId)
    .is('deleted_at', null)
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 })
  }

  return NextResponse.json({ products: products || [] })
}
