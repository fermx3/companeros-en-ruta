import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clientMatchesTargeting } from '@/lib/utils/targeting'
import type { TargetingCriteria } from '@/lib/types/database'

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

        // 2. Get client profile with targeting fields
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id, tenant_id, zone_id, market_id, client_type_id, commercial_structure_id, has_meat_fridge, has_soda_fridge, accepts_card, email_opt_in, whatsapp_opt_in, gender, date_of_birth')
            .eq('user_id', user.id)
            .single()

        if (clientError || !client) {
            return NextResponse.json(
                { error: 'Cliente no encontrado' },
                { status: 404 }
            )
        }

        // 3. Get active brand memberships (with tier info for targeting)
        const { data: memberships, error: membershipsError } = await supabase
            .from('client_brand_memberships')
            .select('brand_id, current_tier_id')
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

        if (brandIds.length === 0) {
            return NextResponse.json({
                promotions: [],
                message: 'No tienes membresías activas'
            })
        }

        // 4. Get query params
        const { searchParams } = new URL(request.url)
        const brandIdFilter = searchParams.get('brand_id')

        // 5. Build promotions query
        // Use date-only format for comparison with date columns
        const now = new Date().toISOString().split('T')[0] // '2026-02-12' format

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
        targeting_criteria,
        brand_id,
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
        }

        const { data: promotions, error: promotionsError } = await query

        if (promotionsError) {
            console.error('Error fetching promotions:', promotionsError)
            return NextResponse.json(
                { error: 'Error al obtener promociones' },
                { status: 500 }
            )
        }

        // Build client targeting profile
        const tierIds = (memberships || [])
            .map(m => m.current_tier_id)
            .filter((t): t is string => t != null)

        const clientProfile = {
            zone_id: client.zone_id,
            market_id: client.market_id,
            client_type_id: client.client_type_id,
            commercial_structure_id: client.commercial_structure_id,
            has_meat_fridge: client.has_meat_fridge,
            has_soda_fridge: client.has_soda_fridge,
            accepts_card: client.accepts_card,
            email_opt_in: client.email_opt_in,
            whatsapp_opt_in: client.whatsapp_opt_in,
            gender: client.gender,
            date_of_birth: client.date_of_birth,
            tier_ids: tierIds,
        }

        // Filter promotions by targeting criteria
        const filtered = (promotions || []).filter(promo => {
            // For tier targeting, use the tier from the specific brand membership
            const brandMembership = (memberships || []).find(m => m.brand_id === promo.brand_id)
            const promoProfile = {
                ...clientProfile,
                tier_ids: brandMembership?.current_tier_id ? [brandMembership.current_tier_id] : [],
            }
            return clientMatchesTargeting(promo.targeting_criteria as TargetingCriteria | null, promoProfile)
        })

        // Strip targeting_criteria from response
        const cleanPromotions = filtered.map(({ targeting_criteria, brand_id, ...rest }) => rest)

        return NextResponse.json({
            promotions: cleanPromotions,
            total: cleanPromotions.length
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
