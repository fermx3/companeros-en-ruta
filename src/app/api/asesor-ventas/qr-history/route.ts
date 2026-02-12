import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/asesor-ventas/qr-history
 * Get QR redemption history for the authenticated Asesor de Ventas
 * Used for tracking and billing distributor→brand
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

    // 2. Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id, distributor_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 404 }
      )
    }

    // 3. Verify asesor_de_ventas role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status')
      .eq('user_profile_id', userProfile.id)

    const hasAsesorRole = roles?.some(role =>
      role.status === 'active' && role.role === 'asesor_de_ventas'
    )

    if (!hasAsesorRole) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      )
    }

    // 4. Get query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 5. Fetch redemptions
    const { data: redemptions, error: redemptionsError } = await supabase
      .from('qr_redemptions')
      .select(`
        id,
        qr_code_id,
        status,
        discount_type,
        discount_value,
        latitude,
        longitude,
        notes,
        redeemed_at,
        created_at,
        qr_code:qr_codes(
          id,
          code,
          discount_description,
          client:clients(
            id,
            business_name,
            owner_name
          )
        )
      `)
      .eq('redeemed_by', userProfile.id)
      .order('redeemed_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (redemptionsError) {
      console.error('Error fetching redemptions:', redemptionsError)
      return NextResponse.json(
        { error: 'Error al obtener historial' },
        { status: 500 }
      )
    }

    // 6. Get total count for pagination
    const { count } = await supabase
      .from('qr_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('redeemed_by', userProfile.id)

    // 7. Calculate summary stats
    const { data: statsData } = await supabase
      .from('qr_redemptions')
      .select('discount_value, status, redeemed_at')
      .eq('redeemed_by', userProfile.id)
      .eq('status', 'completed')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = {
      total: count || 0,
      today: statsData?.filter(r => new Date(r.redeemed_at) >= today).length || 0,
      totalValue: statsData?.reduce((sum, r) => sum + (r.discount_value || 0), 0) || 0
    }

    return NextResponse.json({
      redemptions: redemptions || [],
      stats,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    })

  } catch (error) {
    console.error('Error in GET /api/asesor-ventas/qr-history:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
