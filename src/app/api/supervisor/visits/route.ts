import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const promotorId = searchParams.get('promotor_id') || ''
    const dateFrom = searchParams.get('date_from') || ''
    const dateTo = searchParams.get('date_to') || ''
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
      return NextResponse.json({
        visits: [],
        pagination: { page: 1, totalPages: 0, total: 0 },
        team_members: [],
      })
    }

    // 5. Build visits query
    const targetIds = promotorId && teamIds.includes(promotorId) ? [promotorId] : teamIds

    let query = supabase
      .from('visits')
      .select(`
        id,
        visit_date,
        visit_status,
        client_satisfaction_rating,
        promotor_id,
        client_id,
        clients!inner(
          id,
          name
        )
      `, { count: 'exact' })
      .in('promotor_id', targetIds)
      .is('deleted_at', null)

    if (status) {
      query = query.eq('visit_status', status)
    }
    if (dateFrom) {
      query = query.gte('visit_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('visit_date', dateTo)
    }

    const offset = (page - 1) * limit
    query = query.order('visit_date', { ascending: false }).range(offset, offset + limit - 1)

    const { data: visits, count: totalCount } = await query

    const formattedVisits = visits?.map(v => {
      const client = v.clients as unknown as { id: string; name: string }
      return {
        id: v.id,
        visit_date: v.visit_date,
        visit_status: v.visit_status,
        client_satisfaction_rating: v.client_satisfaction_rating,
        promotor_id: v.promotor_id,
        promotor_name: teamMap.get(v.promotor_id) || 'Desconocido',
        client_name: client.name,
      }
    }) || []

    const total = totalCount || 0
    const totalPages = Math.ceil(total / limit)

    // Return team members for filter dropdown
    const teamMembersList = Array.from(teamMap.entries()).map(([id, name]) => ({ id, name }))

    return NextResponse.json({
      visits: formattedVisits,
      pagination: { page, totalPages, total },
      team_members: teamMembersList,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
