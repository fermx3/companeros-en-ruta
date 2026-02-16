import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAdminProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
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
        tenant_id,
        role,
        status
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (profileError || !userProfile) {
    return { error: { message: 'Perfil de usuario no encontrado', status: 404 } }
  }

  const adminRole = userProfile.user_roles.find(role =>
    role.status === 'active' &&
    ['tenant_admin', 'admin', 'super_admin'].includes(role.role)
  )

  if (!adminRole) {
    return { error: { message: 'Usuario no tiene permisos de administrador', status: 403 } }
  }

  return {
    user,
    userProfileId: userProfile.id,
    tenantId: adminRole.tenant_id || userProfile.tenant_id
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const result = await getAdminProfile(supabase)

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      )
    }

    const { tenantId } = result

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    let query = supabase
      .from('surveys')
      .select(`
        id,
        public_id,
        title,
        description,
        survey_status,
        target_roles,
        start_date,
        end_date,
        created_at,
        rejection_reason,
        brands!inner(name),
        creator:user_profiles!surveys_created_by_fkey(first_name, last_name)
      `)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('survey_status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,public_id.ilike.%${search}%`)
    }

    // Count
    let countQuery = supabase
      .from('surveys')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    if (status && status !== 'all') {
      countQuery = countQuery.eq('survey_status', status)
    }
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,public_id.ilike.%${search}%`)
    }

    const { count } = await countQuery

    const { data: surveys, error: dataError } = await query
      .range(offset, offset + limit - 1)

    if (dataError) {
      throw new Error(`Error al obtener encuestas: ${dataError.message}`)
    }

    // Metrics
    const { data: metricsData } = await supabase
      .from('surveys')
      .select('survey_status')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    const metrics = {
      total: metricsData?.length || 0,
      pending: metricsData?.filter(s => s.survey_status === 'pending_approval').length || 0,
      active: metricsData?.filter(s => s.survey_status === 'active').length || 0,
      closed: metricsData?.filter(s => s.survey_status === 'closed').length || 0
    }

    return NextResponse.json({
      surveys: surveys || [],
      metrics,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error en GET /api/admin/surveys:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
