import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to get advisor profile from auth
async function getAdvisorProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: { message: 'Usuario no autenticado', status: 401 } }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('id, role, status, brand_id, tenant_id')
    .eq('user_profile_id', userProfile.id)

  const asesorRole = roles?.find(role =>
    role.status === 'active' && role.role === 'advisor'
  )

  if (!asesorRole) {
    return { error: { message: 'Usuario no tiene rol de asesor activo', status: 403 } }
  }

  return {
    user,
    userProfile,
    asesorRole,
    advisorId: userProfile.id,
    tenantId: asesorRole.tenant_id
  }
}

// GET /api/asesor/clients - Get assigned clients
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const result = await getAdvisorProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { user, advisorId } = result

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Get all client assignments for this advisor with client and brand details
    let query = supabase
      .from('advisor_client_assignments')
      .select(`
        id,
        assignment_type,
        priority,
        brand_id,
        client:clients(
          id,
          public_id,
          business_name,
          owner_name,
          address_street,
          address_neighborhood,
          phone,
          email,
          status
        ),
        brand:brands(
          id,
          name,
          logo_url
        )
      `, { count: 'exact' })
      .eq('advisor_id', advisorId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('priority', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data: assignments, error: assignmentsError, count: totalCount } = await query

    if (assignmentsError) {
      console.error('Error fetching client assignments:', assignmentsError)
      return NextResponse.json(
        { error: 'Error al obtener clientes asignados', details: assignmentsError.message },
        { status: 500 }
      )
    }

    // Define types for the joined data
    type ClientData = {
      id: string
      public_id: string
      business_name: string
      owner_name: string
      address_street: string
      address_neighborhood: string
      phone: string
      email: string
      status: string
    }

    type BrandData = {
      id: string
      name: string
      logo_url: string | null
    }

    // Get last visit date for each client
    const clientIds = assignments?.map(a => {
      const client = a.client as ClientData | ClientData[] | null
      if (Array.isArray(client)) return client[0]?.id
      return client?.id
    }).filter(Boolean) as string[] || []

    let lastVisitDates: Record<string, string> = {}
    if (clientIds.length > 0) {
      const { data: lastVisits } = await supabase
        .from('visits')
        .select('client_id, visit_date')
        .eq('advisor_id', user!.id)
        .in('client_id', clientIds)
        .eq('status', 'completed')
        .is('deleted_at', null)
        .order('visit_date', { ascending: false })

      // Get most recent visit date per client
      lastVisits?.forEach(visit => {
        if (!lastVisitDates[visit.client_id]) {
          lastVisitDates[visit.client_id] = visit.visit_date
        }
      })
    }

    // Group assignments by client to collect all brands per client
    const clientMap = new Map<string, {
      id: string
      public_id: string
      business_name: string
      owner_name: string
      address: string
      phone: string
      email: string
      status: string
      last_visit_date: string | null
      brands: Array<{ id: string; name: string; logo_url: string | null }>
      assignment: { type: string; priority: number }
    }>()

    assignments?.forEach(assignment => {
      // Handle both single object and array cases from Supabase joins
      const clientRaw = assignment.client as ClientData | ClientData[] | null
      const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw

      const brandRaw = assignment.brand as BrandData | BrandData[] | null
      const brand = Array.isArray(brandRaw) ? brandRaw[0] : brandRaw

      if (!client) return

      if (!clientMap.has(client.id)) {
        // Construct full address from parts
        const addressParts = [client.address_street, client.address_neighborhood].filter(Boolean)
        const fullAddress = addressParts.join(', ') || ''

        clientMap.set(client.id, {
          id: client.id,
          public_id: client.public_id,
          business_name: client.business_name,
          owner_name: client.owner_name,
          address: fullAddress,
          phone: client.phone,
          email: client.email,
          status: client.status,
          last_visit_date: lastVisitDates[client.id] || null,
          brands: [],
          assignment: {
            type: assignment.assignment_type || 'primary',
            priority: assignment.priority || 1
          }
        })
      }

      if (brand) {
        const existingClient = clientMap.get(client.id)!
        const brandExists = existingClient.brands.some(b => b.id === brand.id)
        if (!brandExists) {
          existingClient.brands.push(brand)
        }
      }
    })

    // Convert map to array and apply search filter
    let clients = Array.from(clientMap.values())

    if (search) {
      const searchLower = search.toLowerCase()
      clients = clients.filter(c =>
        c.business_name.toLowerCase().includes(searchLower) ||
        c.address?.toLowerCase().includes(searchLower) ||
        c.public_id?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by priority, then by business name
    clients.sort((a, b) => {
      if (a.assignment.priority !== b.assignment.priority) {
        return a.assignment.priority - b.assignment.priority
      }
      return a.business_name.localeCompare(b.business_name)
    })

    return NextResponse.json({
      clients,
      total: totalCount || clients.length,
      pagination: {
        page,
        limit,
        total: totalCount || clients.length,
        totalPages: Math.ceil((totalCount || clients.length) / limit)
      }
    })

  } catch (error) {
    console.error('Error en GET /api/asesor/clients:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
