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
    tenantId: asesorRole.tenant_id,
    brandId: asesorRole.brand_id
  }
}

// GET /api/asesor/visits - List visits with filters and pagination
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
    const status = searchParams.get('status') || 'all'
    const dateRange = searchParams.get('date_range') || 'month'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query - note: visits may not have FK to brands, so we fetch brands separately
    let query = supabase
      .from('visits')
      .select(`
        *,
        client:clients(id, public_id, business_name, owner_name, address_street, address_neighborhood, phone)
      `, { count: 'exact' })
      .eq('advisor_id', advisorId)
      .is('deleted_at', null)
      .order('visit_date', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('visit_status', status)
    }

    // Apply date range filter
    const now = new Date()
    let startDate: Date | null = null

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    if (startDate) {
      query = query.gte('visit_date', startDate.toISOString().slice(0, 10))
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: visits, error: visitsError, count: totalCount } = await query

    if (visitsError) {
      console.error('Error fetching visits:', visitsError)
      return NextResponse.json(
        { error: 'Error al obtener visitas', details: visitsError.message },
        { status: 500 }
      )
    }

    // Fetch brands separately since there's no FK relationship
    const brandIds = [...new Set(visits?.map(v => v.brand_id).filter(Boolean))]
    let brandsMap: Record<string, { id: string; name: string; logo_url: string | null }> = {}

    if (brandIds.length > 0) {
      const { data: brands } = await supabase
        .from('brands')
        .select('id, name, logo_url')
        .in('id', brandIds)

      brands?.forEach(brand => {
        brandsMap[brand.id] = brand
      })
    }

    // Attach brand info to visits
    const visitsWithBrands = visits?.map(visit => ({
      ...visit,
      brand: visit.brand_id ? brandsMap[visit.brand_id] || null : null
    })) || []

    // Get metrics for all visits (not just filtered)
    const { data: allVisits } = await supabase
      .from('visits')
      .select('id, visit_status, client_id')
      .eq('advisor_id', advisorId)
      .is('deleted_at', null)
      .gte('visit_date', new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10))

    // Get assigned clients count
    const { count: totalClients } = await supabase
      .from('advisor_client_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('advisor_id', advisorId)
      .eq('is_active', true)

    // Get monthly quota from advisor_assignments
    const { data: advisorInfo } = await supabase
      .from('advisor_assignments')
      .select('monthly_quota')
      .eq('user_profile_id', advisorId)
      .eq('is_active', true)
      .single()

    const completedVisits = allVisits?.filter(v => v.visit_status === 'completed').length || 0
    const totalVisitsCount = allVisits?.length || 0
    const monthlyQuota = advisorInfo?.monthly_quota || 100

    const metrics = {
      totalClients: totalClients || 0,
      monthlyQuota,
      completedVisits,
      effectiveness: totalVisitsCount > 0 ? Math.round((completedVisits / totalVisitsCount) * 100) : 0
    }

    const pagination = {
      page,
      limit,
      total: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / limit)
    }

    return NextResponse.json({
      visits: visitsWithBrands,
      metrics,
      pagination
    })

  } catch (error) {
    console.error('Error en GET /api/asesor/visits:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

// POST /api/asesor/visits - Create a new visit
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const result = await getAdvisorProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { user, advisorId, tenantId, brandId } = result

    const body = await request.json()
    const {
      client_id,
      visit_date,
      advisor_notes,
      latitude,
      longitude
    } = body

    // Validate required fields
    if (!client_id) {
      return NextResponse.json(
        { error: 'El campo client_id es requerido' },
        { status: 400 }
      )
    }
    // Validate client is assigned to this advisor
    const { data: assignment, error: assignmentError } = await supabase
      .from('advisor_client_assignments')
      .select('id')
      .eq('advisor_id', advisorId)
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'No tienes asignado este cliente', details: 'Solo puedes crear visitas para clientes asignados a ti' },
        { status: 403 }
      )
    }

    // Create the visit (public_id is auto-generated by the database)
    const now = new Date().toISOString()
    const visitData: Record<string, unknown> = {
      tenant_id: tenantId,
      client_id,
      brand_id: brandId,
      advisor_id: advisorId,
      visit_date: visit_date || now.slice(0, 10),
      check_in_time: now,
      visit_status: 'in_progress',
      advisor_notes: advisor_notes || null,
      latitude: latitude || null,
      longitude: longitude || null,
      created_at: now,
      updated_at: now
    }

    const { data: newVisit, error: insertError } = await supabase
      .from('visits')
      .insert(visitData)
      .select(`
        *,
        client:clients(id, public_id, business_name, owner_name, address_street, address_neighborhood, phone)
      `)
      .single()

    if (insertError) {
      console.error('Error creating visit:', insertError)
      return NextResponse.json(
        { error: 'Error al crear la visita', details: insertError.message },
        { status: 500 }
      )
    }

    // Fetch brand info
    let brandInfo = null
    if (brandId) {
      const { data: brand } = await supabase
        .from('brands')
        .select('id, name, logo_url')
        .eq('id', brandId)
        .single()
      brandInfo = brand
    }

    return NextResponse.json({
      visit: { ...newVisit, brand: brandInfo },
      status: 'success',
      message: 'Visita creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/asesor/visits:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
