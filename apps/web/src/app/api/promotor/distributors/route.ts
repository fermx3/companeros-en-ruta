import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolvePromotorAuth, isPromotorAuthError, promotorAuthErrorResponse } from '@/lib/api/promotor-auth'

/**
 * GET /api/promotor/distributors?brand_id=X
 * Returns active distributors for the promotor's tenant, optionally filtered by brand
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await resolvePromotorAuth(supabase)
    if (isPromotorAuthError(auth)) return promotorAuthErrorResponse(auth)

    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brand_id')

    let query = supabase
      .from('distributors')
      .select('id, name, contact_name, contact_phone')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name')

    // If brand_id provided, filter to distributors that handle that brand
    if (brandId) {
      // Get distributor IDs that have this brand assigned
      const { data: distributorBrands, error: dbError } = await supabase
        .from('distributor_brands')
        .select('distributor_id')
        .eq('brand_id', brandId)

      if (dbError) {
        return NextResponse.json({ error: 'Error al filtrar distribuidores' }, { status: 500 })
      }

      const distributorIds = (distributorBrands || []).map(db => db.distributor_id)

      if (distributorIds.length === 0) {
        return NextResponse.json({ distributors: [] })
      }

      query = query.in('id', distributorIds)
    }

    const { data: distributors, error } = await query

    if (error) {
      console.error('Error fetching distributors:', error)
      return NextResponse.json({ error: 'Error al obtener distribuidores' }, { status: 500 })
    }

    return NextResponse.json({ distributors: distributors || [] })
  } catch (error) {
    console.error('Error in GET /api/promotor/distributors:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
