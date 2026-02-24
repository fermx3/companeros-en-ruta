import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  // Find client_brand_membership IDs for this client
  let membershipsQuery = supabase
    .from('client_brand_memberships')
    .select('id')
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

  // Transform promotions to include usage info for this client
  const clientPromotions = (promotions || []).map(promo => {
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
