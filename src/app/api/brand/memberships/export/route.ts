import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { buildCsvString, csvResponse, formatCsvDate } from '@/lib/utils/csv'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    let query = supabase
      .from('client_brand_memberships')
      .select(`
        id, public_id, membership_status, joined_date, lifetime_points,
        points_balance, last_purchase_date, created_at,
        client:clients(business_name, public_id, email, phone),
        tier:tiers(name, tier_level)
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    const status = searchParams.get('status')
    const tierId = searchParams.get('tier_id')

    if (status && status !== 'all') {
      query = query.eq('membership_status', status)
    }
    if (tierId) query = query.eq('current_tier_id', tierId)

    const { data: memberships, error } = await query

    if (error) {
      return Response.json({ error: 'Error al obtener membresías' }, { status: 500 })
    }

    const headers = [
      'ID', 'Cliente', 'Email', 'Teléfono', 'Estado Membresía',
      'Tier', 'Nivel Tier', 'Puntos Balance', 'Puntos Lifetime',
      'Fecha Alta', 'Última Compra',
    ]

    let rows = (memberships || []).map(m => {
      const client = m.client as any
      const tier = m.tier as any

      return [
        m.public_id || '',
        client?.business_name || '',
        client?.email || '',
        client?.phone || '',
        m.membership_status || '',
        tier?.name || 'Sin tier',
        tier?.tier_level !== undefined ? String(tier.tier_level) : '',
        String(m.points_balance ?? 0),
        String(m.lifetime_points ?? 0),
        formatCsvDate(m.joined_date || m.created_at),
        formatCsvDate(m.last_purchase_date),
      ]
    })

    const search = searchParams.get('search')
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(row =>
        row[1].toLowerCase().includes(s) || row[0].toLowerCase().includes(s)
      )
    }

    const csv = buildCsvString(headers, rows)
    return csvResponse(csv, `membresias_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error in GET /api/brand/memberships/export:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
