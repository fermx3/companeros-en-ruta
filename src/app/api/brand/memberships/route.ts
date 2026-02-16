import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

interface MembershipResponse {
  id: string
  public_id: string
  client_id: string
  client_name: string
  client_email: string | null
  client_phone: string | null
  membership_status: string
  joined_date: string | null
  approved_date: string | null
  points_balance: number
  lifetime_points: number
  current_tier: {
    id: string
    name: string
    tier_level: number
    tier_color: string | null
  } | null
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId: targetBrandId } = result

    // 3. Get query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const tierId = searchParams.get('tier_id') || ''
    const offset = (page - 1) * limit

    // 4. Build query
    let query = supabase
      .from('client_brand_memberships')
      .select(`
        id,
        public_id,
        client_id,
        membership_status,
        joined_date,
        approved_date,
        points_balance,
        lifetime_points,
        current_tier_id,
        created_at,
        clients!client_brand_memberships_client_id_fkey(
          id,
          business_name,
          owner_name,
          email,
          phone
        ),
        tiers!client_brand_memberships_current_tier_id_fkey(
          id,
          name,
          tier_level,
          tier_color
        )
      `)
      .eq('brand_id', targetBrandId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status && ['pending', 'active', 'suspended', 'cancelled'].includes(status)) {
      query = query.eq('membership_status', status)
    }

    // Apply tier filter
    if (tierId) {
      query = query.eq('current_tier_id', tierId)
    }

    // 5. Get total count for pagination
    let countQuery = supabase
      .from('client_brand_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', targetBrandId)
      .is('deleted_at', null)

    if (status && ['pending', 'active', 'suspended', 'cancelled'].includes(status)) {
      countQuery = countQuery.eq('membership_status', status)
    }
    if (tierId) {
      countQuery = countQuery.eq('current_tier_id', tierId)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      throw new Error(`Error al contar membresías: ${countError.message}`)
    }

    // 6. Get paginated data
    const { data: memberships, error: dataError } = await query
      .range(offset, offset + limit - 1)

    if (dataError) {
      throw new Error(`Error al obtener membresías: ${dataError.message}`)
    }

    // 7. Transform and filter by search
    let transformedMemberships: MembershipResponse[] = (memberships || []).map((m) => {
      const client = m.clients as unknown as { id: string; business_name: string; owner_name: string | null; email: string | null; phone: string | null } | null
      const tier = m.tiers as unknown as { id: string; name: string; tier_level: number; tier_color: string | null } | null

      return {
        id: m.id,
        public_id: m.public_id,
        client_id: m.client_id,
        client_name: client?.business_name || client?.owner_name || `Cliente ${m.public_id}`,
        client_email: client?.email || null,
        client_phone: client?.phone || null,
        membership_status: m.membership_status,
        joined_date: m.joined_date,
        approved_date: m.approved_date,
        points_balance: m.points_balance || 0,
        lifetime_points: m.lifetime_points || 0,
        current_tier: tier ? {
          id: tier.id,
          name: tier.name,
          tier_level: tier.tier_level,
          tier_color: tier.tier_color
        } : null,
        created_at: m.created_at
      }
    })

    // Apply client-side search filter
    if (search) {
      const searchLower = search.toLowerCase()
      transformedMemberships = transformedMemberships.filter((m) =>
        m.client_name.toLowerCase().includes(searchLower) ||
        (m.client_email?.toLowerCase().includes(searchLower)) ||
        m.public_id.toLowerCase().includes(searchLower)
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      memberships: transformedMemberships,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      },
      filters: {
        status,
        search,
        tier_id: tierId
      }
    })

  } catch (error) {
    console.error('Error en GET /api/brand/memberships:', error)
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
    const { brandId: targetBrandId, tenantId, userProfileId } = result

    // 3. Get request body
    const body = await request.json()
    const { client_ids, filters } = body

    // Either client_ids (array) or filters (object with zone_id, client_type_id, etc.)
    let clientsToAdd: string[] = []

    if (client_ids && Array.isArray(client_ids) && client_ids.length > 0) {
      // Direct list of client IDs
      clientsToAdd = client_ids
    } else if (filters) {
      // Query clients based on filters
      let clientQuery = supabase
        .from('clients')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (filters.zone_id) {
        clientQuery = clientQuery.eq('zone_id', filters.zone_id)
      }
      if (filters.client_type_id) {
        clientQuery = clientQuery.eq('client_type_id', filters.client_type_id)
      }
      if (filters.market_id) {
        clientQuery = clientQuery.eq('market_id', filters.market_id)
      }

      const { data: filteredClients, error: filterError } = await clientQuery

      if (filterError) {
        throw new Error(`Error al filtrar clientes: ${filterError.message}`)
      }

      clientsToAdd = (filteredClients || []).map(c => c.id)
    } else {
      return NextResponse.json(
        { error: 'Debe proporcionar client_ids o filters' },
        { status: 400 }
      )
    }

    if (clientsToAdd.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron clientes para agregar' },
        { status: 400 }
      )
    }

    // 4. Filter out clients that already have membership with this brand
    const { data: existingMemberships } = await supabase
      .from('client_brand_memberships')
      .select('client_id')
      .eq('brand_id', targetBrandId)
      .in('client_id', clientsToAdd)
      .is('deleted_at', null)

    const existingClientIds = new Set((existingMemberships || []).map(m => m.client_id))
    const newClientIds = clientsToAdd.filter(id => !existingClientIds.has(id))

    if (newClientIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Todos los clientes ya tienen membresía con esta marca',
        created: 0,
        skipped: clientsToAdd.length
      })
    }

    // 5. Get default tier for this brand
    const { data: defaultTier } = await supabase
      .from('tiers')
      .select('id')
      .eq('brand_id', targetBrandId)
      .eq('is_default', true)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    // 6. Create memberships
    const now = new Date().toISOString()
    const membershipsToCreate = newClientIds.map(clientId => ({
      client_id: clientId,
      brand_id: targetBrandId,
      tenant_id: tenantId,
      membership_status: 'active',
      current_tier_id: defaultTier?.id || null,
      joined_date: now,
      approved_by: userProfileId,
      approved_date: now,
      points_balance: 0,
      lifetime_points: 0
    }))

    const { data: createdMemberships, error: createError } = await supabase
      .from('client_brand_memberships')
      .insert(membershipsToCreate)
      .select('id, client_id')

    if (createError) {
      throw new Error(`Error al crear membresías: ${createError.message}`)
    }

    // 7. Create tier assignments for new memberships if default tier exists
    if (defaultTier && createdMemberships && createdMemberships.length > 0) {
      const tierAssignments = createdMemberships.map(m => ({
        client_brand_membership_id: m.id,
        tier_id: defaultTier.id,
        tenant_id: tenantId,
        assignment_type: 'automatic',
        is_current: true,
        effective_from: now,
        assigned_by: userProfileId,
        assigned_date: now
      }))

      await supabase
        .from('client_tier_assignments')
        .insert(tierAssignments)
    }

    return NextResponse.json({
      success: true,
      message: `${createdMemberships?.length || 0} membresías creadas correctamente`,
      created: createdMemberships?.length || 0,
      skipped: existingClientIds.size
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/brand/memberships:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
