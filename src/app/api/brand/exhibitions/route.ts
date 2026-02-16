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

    const activeOnly = searchParams.get('active_only') === 'true'

    let query = supabase
      .from('brand_exhibitions')
      .select(`
        id,
        public_id,
        exhibition_name,
        negotiated_period,
        location_description,
        start_date,
        end_date,
        is_active,
        created_at,
        products(
          id,
          name,
          sku
        ),
        brand_communication_plans(
          id,
          plan_name
        )
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: exhibitions, error } = await query

    if (error) {
      console.error('Error fetching exhibitions:', error)
      return NextResponse.json(
        { error: 'Error al obtener exhibiciones' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      exhibitions: exhibitions || [],
      total: exhibitions?.length || 0
    })

  } catch (error) {
    console.error('Error in GET /api/brand/exhibitions:', error)
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

    const {
      exhibition_name,
      negotiated_period,
      location_description,
      start_date,
      end_date,
      product_id,
      communication_plan_id
    } = body

    if (!exhibition_name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la exhibición es requerido' },
        { status: 400 }
      )
    }

    const { data: exhibition, error: exhibitionError } = await supabase
      .from('brand_exhibitions')
      .insert({
        tenant_id: tenantId,
        brand_id: brandId,
        exhibition_name: exhibition_name.trim(),
        negotiated_period: negotiated_period || null,
        location_description: location_description || null,
        start_date: start_date || null,
        end_date: end_date || null,
        product_id: product_id || null,
        communication_plan_id: communication_plan_id || null,
        is_active: true
      })
      .select(`
        id,
        public_id,
        exhibition_name,
        negotiated_period,
        location_description,
        start_date,
        end_date,
        is_active,
        created_at,
        products(
          id,
          name,
          sku
        ),
        brand_communication_plans(
          id,
          plan_name
        )
      `)
      .single()

    if (exhibitionError) {
      console.error('Error creating exhibition:', exhibitionError)
      return NextResponse.json(
        { error: 'Error al crear exhibición' },
        { status: 500 }
      )
    }

    return NextResponse.json({ exhibition }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/brand/exhibitions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
