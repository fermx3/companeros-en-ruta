import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { extractDigits } from '@/lib/utils/phone'

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

    // Verify client belongs to brand via membership
    const { data: membership, error: membershipError } = await supabase
      .from('client_brand_memberships')
      .select('id, membership_status, joined_date, lifetime_points, points_balance, last_purchase_date')
      .eq('client_id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Cliente no encontrado en esta marca' },
        { status: 404 }
      )
    }

    // Get client details with joins
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        public_id,
        business_name,
        legal_name,
        owner_name,
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
        zones:zone_id(id, name),
        markets:market_id(id, name),
        client_types:client_type_id(id, name, code, category),
        commercial_structures:commercial_structure_id(id, name, code, structure_type)
      `)
      .eq('id', id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Get visit count for this client+brand
    const { count: visitCount } = await supabase
      .from('visits')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)

    // Get order count for this client+brand
    const { count: orderCount } = await supabase
      .from('active_orders')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', id)
      .eq('brand_id', brandId)

    return NextResponse.json({
      client,
      membership: {
        membership_status: membership.membership_status,
        joined_date: membership.joined_date,
        lifetime_points: membership.lifetime_points || 0,
        points_balance: membership.points_balance || 0,
        last_purchase_date: membership.last_purchase_date,
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

export async function PUT(
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

    // Verify client belongs to brand
    const { data: membership } = await supabase
      .from('client_brand_memberships')
      .select('id')
      .eq('client_id', id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Cliente no encontrado en esta marca' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate phone fields (10 digits for Mexico)
    for (const field of ['phone', 'whatsapp'] as const) {
      if (body[field]) {
        const digits = extractDigits(body[field])
        if (digits.length !== 10) {
          return NextResponse.json(
            { error: `El ${field === 'phone' ? 'teléfono' : 'WhatsApp'} debe tener 10 dígitos` },
            { status: 400 }
          )
        }
        body[field] = digits
      }
    }

    // Brand managers can only edit basic info fields
    const allowedFields = [
      'business_name', 'owner_name', 'email', 'phone', 'whatsapp',
      'address_street', 'address_neighborhood', 'address_city',
      'address_state', 'address_postal_code'
    ] as const

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = typeof body[field] === 'string' ? body[field].trim() || null : body[field]
      }
    }

    // business_name is required
    if (updates.business_name === null || updates.business_name === '') {
      return NextResponse.json(
        { error: 'El nombre del negocio es requerido' },
        { status: 400 }
      )
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      )
    }

    updates.updated_at = new Date().toISOString()

    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating client:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar cliente' },
        { status: 500 }
      )
    }

    return NextResponse.json({ client: updatedClient })

  } catch (error) {
    console.error('Error in PUT /api/brand/clients/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
