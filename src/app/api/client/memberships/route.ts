import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CurrentTier {
  id: string
  name: string
  tier_level: number
  points_multiplier: number
  discount_percentage: number
  tier_color: string | null
}

interface NextTier {
  name: string
  min_points_required: number
  points_needed: number
}

interface ClientMembership {
  id: string
  public_id: string
  brand_id: string
  brand_name: string
  brand_logo_url: string | null
  membership_status: string
  joined_date: string | null
  points_balance: number
  lifetime_points: number
  current_tier: CurrentTier | null
  next_tier: NextTier | null
}

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Get client data linked to this user
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'No se encontró un perfil de cliente asociado a tu cuenta' },
        { status: 404 }
      )
    }

    // 3. Get all memberships with brand info and current tier
    const { data: memberships, error: membershipsError } = await supabase
      .from('client_brand_memberships')
      .select(`
        id,
        public_id,
        brand_id,
        membership_status,
        joined_date,
        points_balance,
        lifetime_points,
        current_tier_id,
        brands!client_brand_memberships_brand_id_fkey(
          id,
          name,
          logo_url
        ),
        tiers!client_brand_memberships_current_tier_id_fkey(
          id,
          name,
          tier_level,
          points_multiplier,
          discount_percentage,
          tier_color
        )
      `)
      .eq('client_id', clientData.id)
      .is('deleted_at', null)
      .order('joined_date', { ascending: false })

    if (membershipsError) {
      throw new Error(`Error al obtener membresías: ${membershipsError.message}`)
    }

    // 4. For each membership, calculate next tier
    const membershipsWithNextTier: ClientMembership[] = await Promise.all(
      (memberships || []).map(async (membership) => {
        const brand = membership.brands as unknown as { id: string; name: string; logo_url: string | null } | null
        const currentTier = membership.tiers as unknown as {
          id: string
          name: string
          tier_level: number
          points_multiplier: number
          discount_percentage: number
          tier_color: string | null
        } | null

        // Get next tier for this brand
        let nextTier: NextTier | null = null

        if (brand) {
          const currentTierLevel = currentTier?.tier_level ?? 0

          const { data: nextTierData } = await supabase
            .from('tiers')
            .select('name, min_points_required, tier_level')
            .eq('brand_id', brand.id)
            .eq('is_active', true)
            .gt('tier_level', currentTierLevel)
            .order('tier_level', { ascending: true })
            .limit(1)
            .single()

          if (nextTierData) {
            nextTier = {
              name: nextTierData.name,
              min_points_required: nextTierData.min_points_required || 0,
              points_needed: Math.max(0, (nextTierData.min_points_required || 0) - (membership.lifetime_points || 0))
            }
          }
        }

        return {
          id: membership.id,
          public_id: membership.public_id,
          brand_id: membership.brand_id,
          brand_name: brand?.name || 'Marca desconocida',
          brand_logo_url: brand?.logo_url || null,
          membership_status: membership.membership_status,
          joined_date: membership.joined_date,
          points_balance: membership.points_balance || 0,
          lifetime_points: membership.lifetime_points || 0,
          current_tier: currentTier ? {
            id: currentTier.id,
            name: currentTier.name,
            tier_level: currentTier.tier_level,
            points_multiplier: currentTier.points_multiplier || 1,
            discount_percentage: currentTier.discount_percentage || 0,
            tier_color: currentTier.tier_color
          } : null,
          next_tier: nextTier
        }
      })
    )

    return NextResponse.json({
      memberships: membershipsWithNextTier
    })

  } catch (error) {
    console.error('Error en /api/client/memberships:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
