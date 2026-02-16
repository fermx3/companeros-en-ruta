import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

interface BrandTier {
  id: string
  public_id: string
  name: string
  tier_level: number
  min_points_required: number
  min_visits_required: number
  min_purchases_required: number
  points_multiplier: number
  discount_percentage: number
  benefits: Record<string, unknown> | null
  tier_color: string | null
  is_default: boolean
  is_active: boolean
  member_count: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId: targetBrandId } = result

    // 3. Get all tiers for this brand
    const { data: tiers, error: tiersError } = await supabase
      .from('tiers')
      .select(`
        id,
        public_id,
        name,
        tier_level,
        min_points_required,
        min_visits_required,
        min_purchases_required,
        points_multiplier,
        discount_percentage,
        benefits,
        tier_color,
        is_default,
        is_active
      `)
      .eq('brand_id', targetBrandId)
      .is('deleted_at', null)
      .order('tier_level', { ascending: true })

    if (tiersError) {
      throw new Error(`Error al obtener niveles: ${tiersError.message}`)
    }

    // 4. Get member counts for each tier
    const tiersWithCounts: BrandTier[] = await Promise.all(
      (tiers || []).map(async (tier) => {
        const { count } = await supabase
          .from('client_brand_memberships')
          .select('id', { count: 'exact', head: true })
          .eq('current_tier_id', tier.id)
          .is('deleted_at', null)

        return {
          id: tier.id,
          public_id: tier.public_id,
          name: tier.name,
          tier_level: tier.tier_level,
          min_points_required: tier.min_points_required || 0,
          min_visits_required: tier.min_visits_required || 0,
          min_purchases_required: tier.min_purchases_required || 0,
          points_multiplier: tier.points_multiplier || 1,
          discount_percentage: tier.discount_percentage || 0,
          benefits: tier.benefits as Record<string, unknown> | null,
          tier_color: tier.tier_color,
          is_default: tier.is_default || false,
          is_active: tier.is_active ?? true,
          member_count: count || 0
        }
      })
    )

    return NextResponse.json({
      tiers: tiersWithCounts
    })

  } catch (error) {
    console.error('Error en GET /api/brand/tiers:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId: targetBrandId, tenantId } = result

    // 3. Get request body
    const body = await request.json()
    const {
      name,
      code,
      tier_level,
      min_points_required = 0,
      min_visits_required = 0,
      min_purchases_required = 0,
      points_multiplier = 1,
      discount_percentage = 0,
      benefits = null,
      tier_color = null,
      is_default = false,
      is_active = true
    } = body

    // 4. Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del nivel es requerido' },
        { status: 400 }
      )
    }

    if (tier_level === undefined || typeof tier_level !== 'number' || tier_level < 1) {
      return NextResponse.json(
        { error: 'El nivel debe ser un número válido mayor o igual a 1' },
        { status: 400 }
      )
    }

    // Generate code from name if not provided
    const tierCode = code || name.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 20)

    // 5. Check tier_level uniqueness within brand
    const { data: existingTier } = await supabase
      .from('tiers')
      .select('id')
      .eq('brand_id', targetBrandId)
      .eq('tier_level', tier_level)
      .is('deleted_at', null)
      .single()

    if (existingTier) {
      return NextResponse.json(
        { error: `Ya existe un nivel con el número ${tier_level} en esta marca` },
        { status: 400 }
      )
    }

    // 6. If setting as default, unset existing default
    if (is_default) {
      await supabase
        .from('tiers')
        .update({ is_default: false })
        .eq('brand_id', targetBrandId)
        .eq('is_default', true)
    }

    // 7. Create new tier
    const { data: newTier, error: insertError } = await supabase
      .from('tiers')
      .insert({
        brand_id: targetBrandId,
        tenant_id: tenantId,
        name: name.trim(),
        code: tierCode,
        tier_level,
        min_points_required,
        min_visits_required,
        min_purchases_required,
        points_multiplier,
        discount_percentage,
        benefits,
        tier_color,
        is_default,
        is_active
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Error al crear nivel: ${insertError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Nivel creado correctamente',
      tier: newTier
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/brand/tiers:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
