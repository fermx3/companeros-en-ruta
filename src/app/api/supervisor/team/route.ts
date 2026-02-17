import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface TeamMember {
  id: string
  full_name: string
  email: string
  phone: string | null
  status: string
  total_clients: number
  completed_visits: number
  pending_visits: number
  avg_rating: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''

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

    // 4. Get team promotors in same brand
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
          email,
          phone,
          status
        )
      `)
      .eq('role', 'promotor')
      .eq('status', 'active')
      .eq('brand_id', supervisorRole.brand_id)

    // 5. Build team members with stats
    const teamMembers: TeamMember[] = []

    if (teamRoles) {
      for (const role of teamRoles) {
        const profile = role.user_profiles as unknown as {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          status: string
        }

        const fullName = `${profile.first_name} ${profile.last_name}`.trim()

        // Filter by search
        if (search && !fullName.toLowerCase().includes(search.toLowerCase()) &&
            !profile.email.toLowerCase().includes(search.toLowerCase())) {
          continue
        }

        const { count: clientCount } = await supabase
          .from('client_assignments')
          .select('id', { count: 'exact', head: true })
          .eq('user_profile_id', profile.id)
          .eq('is_active', true)

        const { data: visits } = await supabase
          .from('visits')
          .select('id, visit_status, client_satisfaction_rating')
          .eq('promotor_id', profile.id)
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
          full_name: fullName,
          email: profile.email,
          phone: profile.phone,
          status: profile.status,
          total_clients: clientCount || 0,
          completed_visits: completedVisits,
          pending_visits: pendingVisits,
          avg_rating: avgRating,
        })
      }
    }

    return NextResponse.json({ team_members: teamMembers })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
