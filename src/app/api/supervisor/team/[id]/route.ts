import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient()
    const { id: memberId } = await params

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

    // 4. Verify target member is a subordinate (manager_id) and get profile
    const { data: memberProfile } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, phone, status')
      .eq('id', memberId)
      .eq('manager_id', userProfile.id)
      .single()

    if (!memberProfile) {
      return NextResponse.json({ error: 'Miembro no encontrado en tu equipo' }, { status: 404 })
    }

    // 6. Get assigned clients
    const { data: assignments } = await supabase
      .from('client_assignments')
      .select(`
        id,
        is_active,
        assignment_type,
        clients!inner(
          id,
          name,
          public_id,
          client_type,
          status,
          contact_email,
          contact_phone
        )
      `)
      .eq('user_profile_id', memberId)
      .eq('is_active', true)

    const assignedClients = assignments?.map(a => {
      const client = a.clients as unknown as {
        id: string
        name: string
        public_id: string
        client_type: string
        status: string
        contact_email: string | null
        contact_phone: string | null
      }
      return {
        id: client.id,
        name: client.name,
        public_id: client.public_id,
        client_type: client.client_type,
        status: client.status,
        contact_email: client.contact_email,
        contact_phone: client.contact_phone,
        assignment_type: a.assignment_type,
      }
    }) || []

    // 7. Get recent visits
    const { data: recentVisits } = await supabase
      .from('visits')
      .select(`
        id,
        visit_date,
        visit_status,
        client_satisfaction_rating,
        client_id,
        clients!inner(
          id,
          name
        )
      `)
      .eq('promotor_id', memberId)
      .is('deleted_at', null)
      .order('visit_date', { ascending: false })
      .limit(20)

    const visits = recentVisits?.map(v => {
      const client = v.clients as unknown as { id: string; name: string }
      return {
        id: v.id,
        visit_date: v.visit_date,
        visit_status: v.visit_status,
        client_satisfaction_rating: v.client_satisfaction_rating,
        client_name: client.name,
      }
    }) || []

    // 8. Stats
    const { data: allVisits } = await supabase
      .from('visits')
      .select('id, visit_status, client_satisfaction_rating')
      .eq('promotor_id', memberId)
      .is('deleted_at', null)

    const completedVisits = allVisits?.filter(v => v.visit_status === 'completed').length || 0
    const pendingVisits = allVisits?.filter(v =>
      v.visit_status === 'planned' || v.visit_status === 'scheduled'
    ).length || 0
    const ratedVisits = allVisits?.filter(v => v.client_satisfaction_rating) || []
    const avgRating = ratedVisits.length > 0
      ? ratedVisits.reduce((sum, v) => sum + (v.client_satisfaction_rating || 0), 0) / ratedVisits.length
      : 0

    return NextResponse.json({
      profile: {
        id: memberProfile.id,
        full_name: `${memberProfile.first_name} ${memberProfile.last_name}`.trim(),
        first_name: memberProfile.first_name,
        last_name: memberProfile.last_name,
        email: memberProfile.email,
        phone: memberProfile.phone,
        status: memberProfile.status,
      },
      stats: {
        total_clients: assignedClients.length,
        completed_visits: completedVisits,
        pending_visits: pendingVisits,
        avg_rating: avgRating,
      },
      assigned_clients: assignedClients,
      recent_visits: visits,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
