import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado', details: authError?.message },
        { status: 401 }
      )
    }

    // 2. Obtener user_profile del asesor
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado', details: profileError?.message },
        { status: 404 }
      )
    }

    // 3. Obtener roles del usuario
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status, brand_id, tenant_id')
      .eq('user_profile_id', userProfile.id)

    // 4. Validar que tenga rol de asesor activo
    const asesorRole = roles?.find(role =>
      role.status === 'active' &&
      role.role === 'advisor'
    )

    if (!asesorRole) {
      return NextResponse.json(
        { error: 'Usuario no tiene rol de asesor activo' },
        { status: 403 }
      )
    }

    const asesorId = userProfile.id
    // brandId y tenantId disponibles para futuras funcionalidades
    // const brandId = asesorRole.brand_id
    // const tenantId = asesorRole.tenant_id

    // 5. Obtener estadísticas de visitas (si existe la tabla)
    let visitStats = {
      total_visits: 0,
      pending_visits: 0,
      completed_visits: 0,
      visits_this_month: 0,
      avg_visit_rating: 0
    }

    try {
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('id, visit_status, client_satisfaction_rating, created_at, visit_date')
        .eq('advisor_id', asesorId)
        .is('deleted_at', null)

      if (!visitsError && visits) {
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        visitStats = {
          total_visits: visits.length,
          pending_visits: visits.filter(v => v.visit_status === 'planned' || v.visit_status === 'scheduled').length,
          completed_visits: visits.filter(v => v.visit_status === 'completed').length,
          visits_this_month: visits.filter(v => new Date(v.created_at) >= firstDayOfMonth).length,
          avg_visit_rating: 0
        }

        // Calcular rating promedio de visitas completadas con rating
        const ratedVisits = visits.filter(v => v.client_satisfaction_rating && v.visit_status === 'completed')
        if (ratedVisits.length > 0) {
          const totalRating = ratedVisits.reduce((sum, v) => sum + (v.client_satisfaction_rating || 0), 0)
          visitStats.avg_visit_rating = totalRating / ratedVisits.length
        }
      }
    } catch {
      // Visits table query failed, using defaults
    }

    // 6. Obtener estadísticas de clientes asignados reales
    let clientStats = {
      total_clients: 0,
      new_clients_month: 0
    }

    try {
      const { data: clientAssignments } = await supabase
        .from('advisor_client_assignments')
        .select('id, created_at')
        .eq('advisor_id', asesorId)
        .eq('is_active', true)

      if (clientAssignments) {
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        clientStats = {
          total_clients: clientAssignments.length,
          new_clients_month: clientAssignments.filter(c => new Date(c.created_at) >= firstDayOfMonth).length
        }
      }
    } catch {
      // advisor_client_assignments query failed, using defaults
    }

    // 7. Calcular performance_score basado en métricas
    const performance_score = Math.min(100, Math.round(
      (visitStats.completed_visits * 0.4) +
      (visitStats.avg_visit_rating * 20 * 0.3) +
      (clientStats.total_clients * 0.2) +
      (visitStats.visits_this_month * 0.1)
    ))

    const stats = {
      ...visitStats,
      ...clientStats,
      performance_score
    }

    return NextResponse.json({
      stats
    })

  } catch (error) {
    console.error('Error en /api/asesor/stats:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
