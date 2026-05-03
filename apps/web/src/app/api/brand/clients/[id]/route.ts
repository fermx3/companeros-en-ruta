import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    // Get client details with joins
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        public_id,
        business_name,
        legal_name,
        owner_name,
        owner_last_name,
        email,
        phone,
        whatsapp,
        address_street,
        address_neighborhood,
        address_city,
        address_state,
        address_postal_code,
        address_country,
        status,
        created_at,
        updated_at,
        gender,
        date_of_birth,
        email_opt_in,
        whatsapp_opt_in,
        has_meat_fridge,
        has_soda_fridge,
        accepts_card,
        onboarding_completed,
        latitude,
        longitude,
        metadata,
        zones:zone_id(id, name),
        markets:market_id(id, name),
        client_types:client_type_id(id, name, code, category),
        commercial_structures:commercial_structure_id(id, name, code, structure_type)
      `)
      .eq(resolveIdColumn(id), id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Verify client belongs to brand via membership
    const { data: membership, error: membershipError } = await supabase
      .from('client_brand_memberships')
      .select(`
        id,
        public_id,
        membership_status,
        joined_date,
        lifetime_points,
        points_balance,
        last_purchase_date,
        current_tier_id,
        tiers!client_brand_memberships_current_tier_id_fkey(
          id,
          name,
          tier_level,
          tier_color
        )
      `)
      .eq('client_id', client.id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Cliente no encontrado en esta marca' },
        { status: 404 }
      )
    }

    // Get visit count for this client+brand
    const { count: visitCount } = await supabase
      .from('visits')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', client.id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)

    // Get order count for this client+brand
    const { count: orderCount } = await supabase
      .from('active_orders')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', client.id)
      .eq('brand_id', brandId)

    const tier = membership.tiers as unknown as { id: string; name: string; tier_level: number; tier_color: string | null } | null

    return NextResponse.json({
      client,
      membership: {
        id: membership.id,
        public_id: membership.public_id,
        membership_status: membership.membership_status,
        joined_date: membership.joined_date,
        lifetime_points: membership.lifetime_points || 0,
        points_balance: membership.points_balance || 0,
        last_purchase_date: membership.last_purchase_date,
        current_tier: tier || null,
      },
      stats: {
        total_visits: visitCount || 0,
        total_orders: orderCount || 0,
      }
    })

  } catch (error) {
    console.error('Error in GET /api/brand/clients/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
