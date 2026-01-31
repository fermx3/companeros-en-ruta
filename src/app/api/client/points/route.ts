import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface PointsTransaction {
  id: string
  public_id: string
  transaction_type: string
  points: number
  balance_after: number
  source_type: string | null
  source_description: string | null
  transaction_date: string
}

interface BrandPointsSummary {
  brand_id: string
  brand_name: string
  brand_logo_url: string | null
  current_balance: number
  lifetime_points: number
  recent_transactions: PointsTransaction[]
}

export async function GET(request: NextRequest) {
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

    // 2. Get client data
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'No se encontró un perfil de cliente asociado a tu cuenta' },
        { status: 404 }
      )
    }

    // 3. Get query parameters
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brand_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // 4. If specific brand requested, get transactions for that brand
    if (brandId) {
      // Get membership for this brand
      const { data: membership, error: membershipError } = await supabase
        .from('client_brand_memberships')
        .select(`
          id,
          brand_id,
          points_balance,
          lifetime_points,
          brands!client_brand_memberships_brand_id_fkey(
            id,
            name,
            logo_url
          )
        `)
        .eq('client_id', clientData.id)
        .eq('brand_id', brandId)
        .eq('membership_status', 'active')
        .is('deleted_at', null)
        .single()

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'No tienes membresía activa con esta marca' },
          { status: 404 }
        )
      }

      // Get transactions count
      const { count } = await supabase
        .from('points_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('client_brand_membership_id', membership.id)
        .is('deleted_at', null)

      // Get transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('points_transactions')
        .select(`
          id,
          public_id,
          transaction_type,
          points,
          balance_after,
          source_type,
          source_description,
          transaction_date
        `)
        .eq('client_brand_membership_id', membership.id)
        .is('deleted_at', null)
        .order('transaction_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (transactionsError) {
        throw new Error(`Error al obtener transacciones: ${transactionsError.message}`)
      }

      const brand = membership.brands as unknown as { id: string; name: string; logo_url: string | null }

      return NextResponse.json({
        brand: {
          id: brand.id,
          name: brand.name,
          logo_url: brand.logo_url
        },
        summary: {
          current_balance: membership.points_balance || 0,
          lifetime_points: membership.lifetime_points || 0
        },
        transactions: transactions || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    }

    // 5. If no brand specified, get summary for all brands
    const { data: memberships, error: membershipsError } = await supabase
      .from('client_brand_memberships')
      .select(`
        id,
        brand_id,
        points_balance,
        lifetime_points,
        brands!client_brand_memberships_brand_id_fkey(
          id,
          name,
          logo_url
        )
      `)
      .eq('client_id', clientData.id)
      .eq('membership_status', 'active')
      .is('deleted_at', null)

    if (membershipsError) {
      throw new Error(`Error al obtener membresías: ${membershipsError.message}`)
    }

    // Get recent transactions for each brand (last 5)
    const brandSummaries: BrandPointsSummary[] = []
    let totalBalance = 0
    let totalLifetime = 0

    for (const membership of memberships || []) {
      const brand = membership.brands as unknown as { id: string; name: string; logo_url: string | null }

      const { data: recentTransactions } = await supabase
        .from('points_transactions')
        .select(`
          id,
          public_id,
          transaction_type,
          points,
          balance_after,
          source_type,
          source_description,
          transaction_date
        `)
        .eq('client_brand_membership_id', membership.id)
        .is('deleted_at', null)
        .order('transaction_date', { ascending: false })
        .limit(5)

      brandSummaries.push({
        brand_id: brand.id,
        brand_name: brand.name,
        brand_logo_url: brand.logo_url,
        current_balance: membership.points_balance || 0,
        lifetime_points: membership.lifetime_points || 0,
        recent_transactions: recentTransactions || []
      })

      totalBalance += membership.points_balance || 0
      totalLifetime += membership.lifetime_points || 0
    }

    return NextResponse.json({
      total_balance: totalBalance,
      total_lifetime_points: totalLifetime,
      brands: brandSummaries
    })

  } catch (error) {
    console.error('Error en GET /api/client/points:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
