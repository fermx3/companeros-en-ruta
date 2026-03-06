import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    // Fetch all catalogs in parallel
    const [
      zonesResult,
      marketsResult,
      clientTypesResult,
      commercialStructuresResult,
      tiersResult,
      distributorsResult,
    ] = await Promise.all([
      supabase
        .from('zones')
        .select('id, code, name, state')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name'),

      supabase
        .from('markets')
        .select('id, code, name')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name'),

      supabase
        .from('client_types')
        .select('id, code, name, category')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name'),

      supabase
        .from('commercial_structures')
        .select('id, code, name')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name'),

      supabase
        .from('tiers')
        .select('id, name, level')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('level'),

      supabase
        .from('distributors')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name'),
    ])

    return NextResponse.json({
      zones: zonesResult.data || [],
      markets: marketsResult.data || [],
      client_types: clientTypesResult.data || [],
      commercial_structures: commercialStructuresResult.data || [],
      tiers: tiersResult.data || [],
      distributors: distributorsResult.data || [],
    })
  } catch (error) {
    console.error('Error in GET /api/brand/targeting/catalogs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
