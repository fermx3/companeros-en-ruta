import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    // 2. Obtener user_profile y brand_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_roles!user_roles_user_profile_id_fkey(
          brand_id,
          role,
          status
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado', details: profileError?.message },
        { status: 404 }
      )
    }

    // Validar que tenga rol de marca activo
    const brandRole = userProfile.user_roles.find(role =>
      role.status === 'active' &&
      ['brand_manager', 'brand_admin'].includes(role.role)
    )

    if (!brandRole || !brandRole.brand_id) {
      return NextResponse.json(
        { error: 'Usuario no tiene permisos de marca activos' },
        { status: 403 }
      )
    }

    const targetBrandId = brandRole.brand_id

    // 3. Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const offset = (page - 1) * limit

    // 4. Obtener membresías reales desde client_brand_memberships con joins
    let query = supabase
      .from('client_brand_memberships')
      .select(`
        id,
        public_id,
        client_id,
        membership_status,
        joined_date,
        lifetime_points,
        points_balance,
        last_purchase_date,
        created_at,
        updated_at,
        clients!client_brand_memberships_client_id_fkey(
          id,
          public_id,
          business_name,
          legal_name,
          owner_name,
          email,
          phone,
          whatsapp,
          address_street,
          address_city,
          address_state,
          status,
          client_type_id,
          zone_id,
          market_id,
          commercial_structure_id,
          created_at,
          updated_at,
          client_types!clients_client_type_id_fkey(
            id,
            name,
            code,
            category
          ),
          commercial_structures!clients_commercial_structure_id_fkey(
            id,
            name,
            code,
            structure_type
          )
        )
      `)
      .eq('brand_id', targetBrandId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Aplicar filtros de búsqueda
    if (search) {
      query = query.or(`public_id.ilike.%${search}%,clients.business_name.ilike.%${search}%,clients.owner_name.ilike.%${search}%,clients.email.ilike.%${search}%`)
    }

    // Aplicar filtros de tipo de membresía
    if (type === 'active') {
      query = query.eq('membership_status', 'active')
    } else if (type === 'pending') {
      query = query.eq('membership_status', 'pending')
    } else if (type === 'inactive') {
      query = query.eq('membership_status', 'inactive')
    }

    // Obtener total count
    const { count, error: countError } = await supabase
      .from('client_brand_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', targetBrandId)
      .is('deleted_at', null)

    if (countError) {
      throw new Error(`Error al contar membresías: ${countError.message}`)
    }

    // Obtener datos paginados
    const { data: memberships, error: dataError } = await query
      .range(offset, offset + limit - 1)

    if (dataError) {
      throw new Error(`Error al obtener membresías: ${dataError.message}`)
    }

    // Transformar datos para el frontend con información real de clientes
    const transformedClients = (memberships || []).map((membership: unknown) => {
      const m = membership as Record<string, unknown>
      const client = m.clients as Record<string, unknown> | null
      const clientType = client?.client_types as Record<string, unknown> | null
      const commercialStructure = client?.commercial_structures as Record<string, unknown> | null

      return {
        id: client?.id || m.id,
        public_id: client?.public_id || m.public_id,
        name: client?.business_name || client?.legal_name || `Cliente ${m.public_id}`,
        owner_name: client?.owner_name,
        contact_email: client?.email,
        contact_phone: client?.phone,
        whatsapp: client?.whatsapp,
        address: client?.address_street ? `${client.address_street}, ${client.address_city}, ${client.address_state}` : null,
        client_type: clientType?.name || 'Sin categoría',
        client_type_code: clientType?.code,
        client_type_category: clientType?.category,
        commercial_structure: commercialStructure?.name || 'Sin estructura',
        commercial_structure_code: commercialStructure?.code,
        commercial_structure_type: commercialStructure?.structure_type,
        status: client?.status || m.membership_status,
        membership_status: m.membership_status,
        joined_date: m.joined_date,
        lifetime_points: m.lifetime_points || 0,
        points_balance: m.points_balance || 0,
        last_purchase_date: m.last_purchase_date,
        created_at: client?.created_at || m.created_at, // Priorizar fecha de creación del cliente
        updated_at: client?.updated_at || m.updated_at, // Priorizar fecha de actualización del cliente
        // Información adicional del cliente
        zone_id: client?.zone_id,
        market_id: client?.market_id,
        client_type_id: client?.client_type_id,
        commercial_structure_id: client?.commercial_structure_id
      }
    })

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      clients: transformedClients,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      },
      filters: {
        search,
        type
      }
    })

  } catch (error) {
    console.error('Error en /api/brand/clients:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
