import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const promotorId = searchParams.get('promotor_id') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // 1. Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    // 2. Profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }

    // 3. Verify supervisor role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status, brand_id')
      .eq('user_profile_id', userProfile.id)
      .eq('status', 'active')

    const supervisorRole = roles?.find(r => r.role === 'supervisor')
    if (!supervisorRole) {
      return NextResponse.json({ error: 'Usuario no tiene rol de supervisor activo' }, { status: 403 })
    }

    // 4. Get team member IDs (subordinates by manager_id)
    const { data: teamProfiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('manager_id', userProfile.id)
      .eq('status', 'active')

    const teamMap = new Map<string, string>()
    teamProfiles?.forEach(p => {
      teamMap.set(p.id, `${p.first_name} ${p.last_name}`.trim())
    })

    const teamIds = Array.from(teamMap.keys())
    if (teamIds.length === 0) {
      return NextResponse.json({ clients: [], pagination: { page: 1, totalPages: 0, total: 0 } })
    }

    // 5. Get assignments filtered by promotor if specified
    const targetIds = promotorId && teamIds.includes(promotorId) ? [promotorId] : teamIds

    const query = supabase
      .from('client_assignments')
      .select(`
        id,
        user_profile_id,
        assignment_type,
        clients!inner(
          id,
          business_name,
          public_id,
          client_type_id,
          status,
          email,
          phone,
          address_street,
          address_city,
          address_state,
          client_types(name)
        )
      `, { count: 'exact' })
      .in('user_profile_id', targetIds)
      .eq('is_active', true)

    // We can't directly filter on joined table text with ilike in count mode reliably,
    // so we fetch all and filter in memory for search (team sizes are small)
    const { data: assignments, count: totalCount } = await query

    let clients = assignments?.map(a => {
      const client = a.clients as unknown as {
        id: string
        business_name: string
        public_id: string
        client_type_id: string | null
        status: string
        email: string | null
        phone: string | null
        address_street: string | null
        address_city: string | null
        address_state: string | null
        client_types: { name: string } | null
      }
      const addressParts = [client.address_street, client.address_city, client.address_state]
        .filter(Boolean)
        .join(', ')
      return {
        id: client.id,
        name: client.business_name,
        public_id: client.public_id,
        client_type: client.client_types?.name ?? '',
        status: client.status,
        contact_email: client.email,
        contact_phone: client.phone,
        address: addressParts || null,
        promotor_id: a.user_profile_id,
        promotor_name: teamMap.get(a.user_profile_id) || 'Desconocido',
        assignment_type: a.assignment_type,
      }
    }) || []

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      clients = clients.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.public_id?.toLowerCase().includes(searchLower)
      )
    }

    // Deduplicate by client id (a client could be assigned to multiple promotors)
    const seen = new Set<string>()
    clients = clients.filter(c => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })

    const total = clients.length
    const totalPages = Math.ceil(total / limit)
    const paginatedClients = clients.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      clients: paginatedClients,
      pagination: { page, totalPages, total },
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
