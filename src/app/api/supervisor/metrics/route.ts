import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface TeamMember {
  id: string
  full_name: string
  email: string
  status: string
  total_clients: number
  completed_visits: number
  pending_visits: number
  avg_rating: number
}

interface SupervisorMetrics {
  team_size: number
  total_clients: number
  total_visits: number
  completed_visits: number
  pending_visits: number
  visits_this_month: number
  avg_team_rating: number
  team_members: TeamMember[]
}

export async function GET() {
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

    // 2. Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 404 }
      )
    }

    // 3. Verify supervisor role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status, brand_id')
      .eq('user_profile_id', userProfile.id)
      .eq('status', 'active')

    const supervisorRole = roles?.find(r => r.role === 'supervisor')

    if (!supervisorRole) {
      return NextResponse.json(
        { error: 'Usuario no tiene rol de supervisor activo' },
        { status: 403 }
      )
    }

    // 4. Get team members (advisors in the same tenant/brand)
    const { data: teamRoles } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_profile_id,
        role,
        status,
        brand_id,
        user_profiles!inner(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('role', 'advisor')
      .eq('status', 'active')
      .eq('brand_id', supervisorRole.brand_id)

    // 5. Build team members array with stats
    const teamMembers: TeamMember[] = []

    if (teamRoles) {
      for (const role of teamRoles) {
        const profile = role.user_profiles as unknown as {
          id: string
          first_name: string
          last_name: string
          email: string
        }

        // Get advisor's client count
        const { count: clientCount } = await supabase
          .from('advisor_client_assignments')
          .select('id', { count: 'exact', head: true })
          .eq('advisor_id', profile.id)
          .eq('is_active', true)

        // Get advisor's visit stats
        const { data: visits } = await supabase
          .from('visits')
          .select('id, visit_status, client_satisfaction_rating')
          .eq('advisor_id', profile.id)
          .is('deleted_at', null)

        const completedVisits = visits?.filter(v => v.visit_status === 'completed').length || 0
        const pendingVisits = visits?.filter(v =>
          v.visit_status === 'planned' || v.visit_status === 'scheduled'
        ).length || 0

        const ratedVisits = visits?.filter(v => v.client_satisfaction_rating) || []
        const avgRating = ratedVisits.length > 0
          ? ratedVisits.reduce((sum, v) => sum + (v.client_satisfaction_rating || 0), 0) / ratedVisits.length
          : 0

        teamMembers.push({
          id: profile.id,
          full_name: `${profile.first_name} ${profile.last_name}`.trim(),
          email: profile.email,
          status: role.status,
          total_clients: clientCount || 0,
          completed_visits: completedVisits,
          pending_visits: pendingVisits,
          avg_rating: avgRating
        })
      }
    }

    // 6. Calculate team totals
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get all team visits for monthly stats
    const advisorIds = teamMembers.map(m => m.id)

    let visitsThisMonth = 0
    if (advisorIds.length > 0) {
      const { count } = await supabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .in('advisor_id', advisorIds)
        .gte('created_at', firstDayOfMonth.toISOString())
        .is('deleted_at', null)

      visitsThisMonth = count || 0
    }

    const metrics: SupervisorMetrics = {
      team_size: teamMembers.length,
      total_clients: teamMembers.reduce((sum, m) => sum + m.total_clients, 0),
      total_visits: teamMembers.reduce((sum, m) => sum + m.completed_visits + m.pending_visits, 0),
      completed_visits: teamMembers.reduce((sum, m) => sum + m.completed_visits, 0),
      pending_visits: teamMembers.reduce((sum, m) => sum + m.pending_visits, 0),
      visits_this_month: visitsThisMonth,
      avg_team_rating: teamMembers.length > 0
        ? teamMembers.reduce((sum, m) => sum + m.avg_rating, 0) / teamMembers.length
        : 0,
      team_members: teamMembers
    }

    return NextResponse.json(metrics)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
