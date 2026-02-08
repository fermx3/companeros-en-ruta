import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to get brand profile from auth
async function getBrandProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: { message: 'Usuario no autenticado', status: 401 } }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      tenant_id,
      user_roles!user_roles_user_profile_id_fkey(
        brand_id,
        role,
        status,
        scope,
        tenant_id
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  // Filter active roles
  const activeRoles = userProfile.user_roles.filter(role => role.status === 'active')

  if (activeRoles.length === 0) {
    return { error: { message: 'Usuario no tiene roles activos', status: 403 } }
  }

  // Priority 1: Look for brand-specific role (brand_manager, brand_admin)
  const brandRole = activeRoles.find(role =>
    role.brand_id &&
    ['brand_manager', 'brand_admin'].includes(role.role)
  )

  if (brandRole) {
    return {
      user,
      userProfile,
      brandRole,
      brandId: brandRole.brand_id,
      tenantId: brandRole.tenant_id || userProfile.tenant_id
    }
  }

  // Priority 2: Global admin - get first brand from tenant
  const adminRole = activeRoles.find(role =>
    role.role === 'admin' && role.scope === 'global'
  )

  if (adminRole) {
    const { data: firstBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('tenant_id', adminRole.tenant_id || userProfile.tenant_id)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (firstBrand) {
      return {
        user,
        userProfile,
        brandRole: adminRole,
        brandId: firstBrand.id,
        tenantId: adminRole.tenant_id || userProfile.tenant_id
      }
    }
  }

  return { error: { message: 'Usuario no tiene permisos de marca activos', status: 403 } }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const result = await getBrandProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { brandId, tenantId } = result

    // Get search params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const offset = (page - 1) * limit

    // Query team members: users with roles for this brand (promotor, supervisor)
    // We need to get user_roles for this brand, then join user_profiles
    let query = supabase
      .from('user_roles')
      .select(`
        id,
        role,
        status,
        created_at,
        user_profiles!user_roles_user_profile_id_fkey(
          id,
          public_id,
          first_name,
          last_name,
          email,
          phone,
          avatar_url,
          created_at,
          updated_at
        )
      `)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .in('role', ['promotor', 'supervisor'])
      .order('created_at', { ascending: false })

    // Filter by role if specified
    if (role === 'supervisor') {
      query = query.eq('role', 'supervisor')
    } else if (role === 'promotor') {
      query = query.eq('role', 'promotor')
    }

    // Filter by status if specified
    if (status === 'active') {
      query = query.eq('status', 'active')
    } else if (status === 'inactive') {
      query = query.eq('status', 'inactive')
    }

    // Get count first
    const countQuery = supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .in('role', ['promotor', 'supervisor'])

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting team members:', countError)
    }

    // Get paginated data
    const { data: teamRoles, error: teamError } = await query
      .range(offset, offset + limit - 1)

    if (teamError) {
      console.error('Error fetching team:', teamError)
      return NextResponse.json(
        { error: 'Error al obtener el equipo', details: teamError.message },
        { status: 500 }
      )
    }

    // Get promotor assignments for additional data
    // Note: Supabase returns single object when using FK relationship with .single() style select
    const userProfileIds = (teamRoles || [])
      .map(tr => {
        const profile = tr.user_profiles as { id: string } | { id: string }[] | null
        if (Array.isArray(profile)) {
          return profile[0]?.id
        }
        return profile?.id
      })
      .filter(Boolean) as string[]

    let promotorAssignments: Record<string, {
      specialization: string | null
      experience_level: string | null
      monthly_quota: number | null
      performance_rating: number | null
    }> = {}

    if (userProfileIds.length > 0) {
      const { data: assignments } = await supabase
        .from('promotor_assignments')
        .select('user_profile_id, specialization, experience_level, monthly_quota, performance_rating')
        .in('user_profile_id', userProfileIds)
        .eq('is_active', true)

      if (assignments) {
        promotorAssignments = assignments.reduce((acc, a) => {
          acc[a.user_profile_id] = {
            specialization: a.specialization,
            experience_level: a.experience_level,
            monthly_quota: a.monthly_quota,
            performance_rating: a.performance_rating
          }
          return acc
        }, {} as typeof promotorAssignments)
      }
    }

    // Get visit counts for team members
    let visitCounts: Record<string, number> = {}
    let orderCounts: Record<string, number> = {}

    if (userProfileIds.length > 0) {
      // Count visits per promotor
      const { data: visits } = await supabase
        .from('visits')
        .select('promotor_id')
        .in('promotor_id', userProfileIds)
        .eq('brand_id', brandId)

      if (visits) {
        visitCounts = visits.reduce((acc, v) => {
          acc[v.promotor_id] = (acc[v.promotor_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }

      // Count orders per promotor (if orders table has promotor_id)
      const { data: orders } = await supabase
        .from('orders')
        .select('promotor_id')
        .in('promotor_id', userProfileIds)

      if (orders) {
        orderCounts = orders.reduce((acc, o) => {
          if (o.promotor_id) {
            acc[o.promotor_id] = (acc[o.promotor_id] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Get last activity (last visit date) for each team member
    let lastActivity: Record<string, string | null> = {}

    if (userProfileIds.length > 0) {
      const { data: recentVisits } = await supabase
        .from('visits')
        .select('promotor_id, updated_at')
        .in('promotor_id', userProfileIds)
        .eq('brand_id', brandId)
        .order('updated_at', { ascending: false })

      if (recentVisits) {
        // Get most recent activity per promotor
        for (const visit of recentVisits) {
          if (!lastActivity[visit.promotor_id]) {
            lastActivity[visit.promotor_id] = visit.updated_at
          }
        }
      }
    }

    // Transform data for frontend
    const transformedTeam = (teamRoles || [])
      .filter(tr => tr.user_profiles)
      .map(tr => {
        // Handle both array and single object returns from Supabase
        const profileData = tr.user_profiles as unknown
        const profile = (Array.isArray(profileData) ? profileData[0] : profileData) as {
          id: string
          public_id: string
          first_name: string | null
          last_name: string | null
          email: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        } | null

        if (!profile) return null

        const assignment = promotorAssignments[profile.id]

        // Combine first_name and last_name
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(' ') || 'Sin nombre'

        return {
          id: profile.id,
          public_id: profile.public_id,
          full_name: fullName,
          email: profile.email,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          role: tr.role,
          status: tr.status || 'active',
          specialization: assignment?.specialization,
          experience_level: assignment?.experience_level,
          monthly_quota: assignment?.monthly_quota,
          performance_rating: assignment?.performance_rating,
          total_visits: visitCounts[profile.id] || 0,
          total_orders: orderCounts[profile.id] || 0,
          last_activity: lastActivity[profile.id] || null,
          created_at: tr.created_at,
          updated_at: profile.updated_at
        }
      })
      // Filter out nulls and filter by search if specified
      .filter((member): member is NonNullable<typeof member> => {
        if (!member) return false
        if (!search) return true
        const searchLower = search.toLowerCase()
        return (
          member.full_name.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.public_id.toLowerCase().includes(searchLower)
        )
      })

    const totalPages = Math.ceil((count || transformedTeam.length) / limit)

    // Calculate metrics
    const metrics = {
      totalMembers: transformedTeam.length,
      supervisors: transformedTeam.filter(m => m.role === 'supervisor').length,
      promotors: transformedTeam.filter(m => m.role === 'promotor').length,
      activeMembers: transformedTeam.filter(m => m.status === 'active').length,
      inactiveMembers: transformedTeam.filter(m => m.status === 'inactive').length
    }

    return NextResponse.json({
      team: transformedTeam,
      metrics,
      pagination: {
        page,
        limit,
        total: count || transformedTeam.length,
        totalPages
      },
      filters: {
        search,
        role,
        status
      }
    })

  } catch (error) {
    console.error('Error en GET /api/brand/team:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
