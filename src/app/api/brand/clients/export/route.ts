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

    // Build query — all clients via memberships (same pattern as /api/brand/clients)
    let query = supabase
      .from('client_brand_memberships')
      .select(`
        id, public_id, membership_status, joined_date, lifetime_points,
        points_balance, last_purchase_date, created_at,
        client:clients(
          id, public_id, business_name, legal_name, owner_name,
          email, phone, whatsapp, status, registration_date,
          address_street, address_city, address_state, address_postal_code,
          client_type:client_types(name),
          commercial_structure:commercial_structures(name)
        )
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    const search = searchParams.get('search')
    const type = searchParams.get('type')

    if (type && type !== 'all') {
      if (type === 'active') query = query.eq('membership_status', 'active')
      else if (type === 'pending') query = query.eq('membership_status', 'pending')
      else if (type === 'inactive') query = query.eq('membership_status', 'inactive')
    }

    const { data: memberships, error } = await query

    if (error) {
      return Response.json({ error: 'Error al obtener clientes' }, { status: 500 })
    }

    const headers = [
      'ID', 'Nombre', 'Nombre Legal', 'Propietario', 'Email',
      'Teléfono', 'WhatsApp', 'Tipo Cliente', 'Estructura Comercial',
      'Estado', 'Estado Membresía', 'Dirección', 'Ciudad', 'Estado/Provincia',
      'CP', 'Puntos Balance', 'Puntos Lifetime', 'Fecha Alta', 'Última Compra',
    ]

    let rows = (memberships || []).map(m => {
      const client = m.client as any
      const clientType = client?.client_type as any
      const commercialStructure = client?.commercial_structure as any
      const name = client?.business_name || client?.legal_name || ''

      return [
        client?.public_id || m.public_id || '',
        name,
        client?.legal_name || '',
        client?.owner_name || '',
        client?.email || '',
        client?.phone || '',
        client?.whatsapp || '',
        clientType?.name || '',
        commercialStructure?.name || '',
        client?.status || '',
        m.membership_status || '',
        client?.address_street || '',
        client?.address_city || '',
        client?.address_state || '',
        client?.address_postal_code || '',
        String(m.points_balance ?? 0),
        String(m.lifetime_points ?? 0),
        formatCsvDate(m.joined_date || m.created_at),
        formatCsvDate(m.last_purchase_date),
      ]
    })

    // Client-side search filter (Supabase doesn't support ilike on joined tables easily)
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(row =>
        row[1].toLowerCase().includes(s) ||
        row[0].toLowerCase().includes(s) ||
        row[4].toLowerCase().includes(s)
      )
    }

    const csv = buildCsvString(headers, rows)
    return csvResponse(csv, `clientes_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error in GET /api/brand/clients/export:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
