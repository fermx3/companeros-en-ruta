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

  // Get promotions available to this client
  // This includes general promotions and client-specific promotions
  const { data: promotions, error } = await supabase
    .from('promotions')
    .select(`
      id,
      name,
      description,
      promotion_type,
      discount_type,
      discount_value,
      start_date,
      end_date,
      usage_limit,
      is_active,
      promotion_redemptions (
        id,
        client_id
      )
    `)
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Error fetching promotions' }, { status: 500 })
  }

  // Transform promotions to include usage info for this client
  const clientPromotions = (promotions || []).map(promo => {
    const redemptionsByClient = promo.promotion_redemptions?.filter(
      (r: { client_id: string }) => r.client_id === clientId
    ) || []
    const timesUsed = redemptionsByClient.length
    const remainingUses = promo.usage_limit ? promo.usage_limit - timesUsed : null

    let status: 'available' | 'partially_used' | 'fully_used' | 'expired' = 'available'
    if (remainingUses !== null) {
      if (remainingUses <= 0) {
        status = 'fully_used'
      } else if (timesUsed > 0) {
        status = 'partially_used'
      }
    } else if (timesUsed > 0) {
      status = 'partially_used'
    }

    // Format discount display
    let discountDisplay = ''
    if (promo.discount_type === 'percentage') {
      discountDisplay = `${promo.discount_value}% OFF`
    } else if (promo.discount_type === 'fixed') {
      discountDisplay = `$${promo.discount_value} descuento`
    } else if (promo.discount_type === 'bogo') {
      discountDisplay = '2x1'
    }

    return {
      id: promo.id,
      name: promo.name,
      description: promo.description,
      promotionType: promo.promotion_type,
      discountDisplay,
      validUntil: promo.end_date,
      status,
      usageLimit: promo.usage_limit,
      timesUsed,
      remainingUses
    }
  })

  return NextResponse.json({ promotions: clientPromotions })
}
