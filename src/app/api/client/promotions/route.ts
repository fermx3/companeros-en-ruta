import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/client/promotions
 * Get active promotions available to the client based on their brand memberships
 * Phase 1.1: Client Promotions Integration
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            )
        }

        // 2. Get client profile
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id, tenant_id')
            .eq('user_id', user.id)
            .single()

        if (clientError || !client) {
            return NextResponse.json(
                { error: 'Cliente no encontrado' },
                { status: 404 }
            )
        }

        // 3. Get active brand memberships
        const { data: memberships, error: membershipsError } = await supabase
            .from('client_brand_memberships')
            .select('brand_id')
            .eq('client_id', client.id)
            .eq('membership_status', 'active')
            .is('deleted_at', null)

        if (membershipsError) {
            console.error('Error fetching memberships:', membershipsError)
            return NextResponse.json(
                { error: 'Error al obtener membresías' },
                { status: 500 }
            )
        }

        const brandIds = memberships?.map(m => m.brand_id) || []

        console.log('🔍 [API] Brand IDs from memberships:', brandIds)

        if (brandIds.length === 0) {
            return NextResponse.json({
                promotions: [],
                message: 'No tienes membresías activas'
            })
        }

        // 4. Get query params
        const { searchParams } = new URL(request.url)
        const brandIdFilter = searchParams.get('brand_id')

        console.log('🔍 [API] Brand ID filter from query:', brandIdFilter)

        // 5. Build promotions query
        // Use date-only format for comparison with date columns
        const now = new Date().toISOString().split('T')[0] // '2026-02-12' format

        console.log('🔍 [API] Current date for filtering:', now)

        // First, let's test without date filters to see if we get any results
        const { data: testPromotions } = await supabase
            .from('promotions')
            .select('id, name, status, start_date, end_date, brand_id')
            .eq('status', 'active')
            .in('brand_id', brandIds)
            .is('deleted_at', null)

        console.log('🔍 [API] Test query (no date filters):', testPromotions)

        let query = supabase
            .from('promotions')
            .select(`
        id,
        public_id,
        name,
        description,
        promotion_type,
        discount_percentage,
        discount_amount,
        start_date,
        end_date,
        status,
        terms_and_conditions,
        brand:brands(
          id,
          name,
          logo_url
        )
      `)
            .eq('status', 'active')
            .lte('start_date', now)
            .gte('end_date', now)
            .in('brand_id', brandIds)
            .is('deleted_at', null)
            .order('start_date', { ascending: false })

        // Filter by specific brand if requested
        if (brandIdFilter && brandIds.includes(brandIdFilter)) {
            query = query.eq('brand_id', brandIdFilter)
            console.log('🔍 [API] Filtering by specific brand:', brandIdFilter)
        }

        const { data: promotions, error: promotionsError } = await query

        console.log('🔍 [API] Query result:', {
            promotionsCount: promotions?.length || 0,
            error: promotionsError,
            promotions: promotions
        })

        if (promotionsError) {
            console.error('Error fetching promotions:', promotionsError)
            return NextResponse.json(
                { error: 'Error al obtener promociones' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            promotions: promotions || [],
            total: promotions?.length || 0
        })

    } catch (error) {
        console.error('Error in GET /api/client/promotions:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

        return NextResponse.json(
            { error: 'Error interno del servidor', details: errorMessage },
            { status: 500 }
        )
    }
}
