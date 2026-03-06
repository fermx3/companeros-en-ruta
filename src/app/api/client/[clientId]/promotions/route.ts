import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clientMatchesTargeting } from '@/lib/utils/targeting'
import type { TargetingCriteria } from '@/lib/types/database'

interface RouteParams {
  params: Promise<{ clientId: string }>
}

// GET: Retrieve available promotions for a client
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { clientId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const brandId = searchParams.get('brand_id')

  // Get client profile for targeting evaluation
  const { data: clientData } = await supabase
    .from('clients')
    .select('zone_id, market_id, client_type_id, commercial_structure_id, has_meat_fridge, has_soda_fridge, accepts_card, email_opt_in, whatsapp_opt_in, gender, date_of_birth')
    .eq('id', clientId)
    .single()

  // Find client_brand_membership IDs for this client
  let membershipsQuery = supabase
    .from('client_brand_memberships')
    .select('id, brand_id, current_tier_id')
    .eq('client_id', clientId)
    .is('deleted_at', null)

  if (brandId) {
    membershipsQuery = membershipsQuery.eq('brand_id', brandId)
  }

  const { data: memberships } = await membershipsQuery

  const membershipIds = (memberships || []).map(m => m.id)

  let promotionsQuery = supabase
    .from('promotions')
    .select(`
      id,
      name,
      description,
      promotion_type,
      status,
      start_date,
      end_date,
      discount_percentage,
      discount_amount,
      buy_quantity,
      get_quantity,
      usage_limit_per_client,
      usage_limit_total,
      usage_count_total,
      targeting_criteria,
      brand_id,
      promotion_redemptions (
        id,
        client_brand_membership_id
      )
    `)
    .eq('status', 'active')
    .lte('start_date', new Date().toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0])
    .is('deleted_at', null)

  if (brandId) {
    promotionsQuery = promotionsQuery.eq('brand_id', brandId)
  }

  const { data: promotions, error } = await promotionsQuery

  if (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Error fetching promotions' }, { status: 500 })
  }

  // Filter promotions by targeting criteria
  const targetedPromotions = (promotions || []).filter(promo => {
    if (!clientData) return true // no client data = skip filtering
    const brandMembership = (memberships || []).find(m => m.brand_id === promo.brand_id)
    return clientMatchesTargeting(promo.targeting_criteria as TargetingCriteria | null, {
      zone_id: clientData.zone_id,
      market_id: clientData.market_id,
      client_type_id: clientData.client_type_id,
      commercial_structure_id: clientData.commercial_structure_id,
      has_meat_fridge: clientData.has_meat_fridge,
      has_soda_fridge: clientData.has_soda_fridge,
      accepts_card: clientData.accepts_card,
      email_opt_in: clientData.email_opt_in,
      whatsapp_opt_in: clientData.whatsapp_opt_in,
      gender: clientData.gender,
      date_of_birth: clientData.date_of_birth,
      tier_ids: brandMembership?.current_tier_id ? [brandMembership.current_tier_id] : [],
    })
  })

  // Transform promotions to include usage info for this client
  const clientPromotions = targetedPromotions.map(promo => {
    const redemptionsByClient = promo.promotion_redemptions?.filter(
      (r: { client_brand_membership_id: string }) =>
        membershipIds.includes(r.client_brand_membership_id)
    ) || []
    const timesUsed = redemptionsByClient.length
    const usageLimit = promo.usage_limit_per_client
    const remainingUses = usageLimit ? usageLimit - timesUsed : null

    let clientStatus: 'available' | 'partially_used' | 'fully_used' = 'available'
    if (remainingUses !== null) {
      if (remainingUses <= 0) {
        clientStatus = 'fully_used'
      } else if (timesUsed > 0) {
        clientStatus = 'partially_used'
      }
    } else if (timesUsed > 0) {
      clientStatus = 'partially_used'
    }

    // Format discount display based on promotion_type and available fields
    let discountDisplay = ''
    if (promo.discount_percentage) {
      discountDisplay = `${promo.discount_percentage}% OFF`
    } else if (promo.discount_amount) {
      discountDisplay = `$${promo.discount_amount} descuento`
    } else if (promo.buy_quantity && promo.get_quantity) {
      discountDisplay = `Lleva ${promo.buy_quantity}, paga ${promo.buy_quantity - promo.get_quantity}`
    }

    return {
      id: promo.id,
      name: promo.name,
      description: promo.description,
      promotion_type: promo.promotion_type,
      discount_display: discountDisplay,
      valid_until: promo.end_date,
      status: clientStatus,
      usage_limit: usageLimit,
      times_used: timesUsed,
      remaining_uses: remainingUses
    }
  })

  return NextResponse.json({ promotions: clientPromotions })
}
