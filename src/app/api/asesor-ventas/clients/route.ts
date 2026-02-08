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

    // 2. Obtener user_profile del asesor de ventas
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

    // 3. Obtener rol de asesor_de_ventas activo
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status, brand_id, tenant_id')
      .eq('user_profile_id', userProfile.id)

    const asesorVentasRole = roles?.find(role =>
      role.status === 'active' &&
      role.role === 'asesor_de_ventas'
    )

    if (!asesorVentasRole) {
      return NextResponse.json(
        { error: 'Usuario no tiene rol de Asesor de Ventas activo' },
        { status: 403 }
      )
    }

    // 4. Obtener clientes asignados al asesor
    // Priority 1: Direct client assignments (client_assignments table)
    // Priority 2: Brand memberships (if asesor has brand_id)

    // First, try to get clients from client_assignments (works for both brand-based and distributor-based asesores)
    const { data: assignments, error: assignmentsError } = await supabase
      .from('client_assignments')
      .select(`
        id,
        is_active,
        created_at,
        client:clients(
          id,
          public_id,
          business_name,
          owner_name,
          email,
          phone,
          whatsapp,
          address_street,
          address_city,
          address_state,
          status
        )
      `)
      .eq('user_profile_id', userProfile.id)
      .eq('is_active', true)
      .is('deleted_at', null)

    if (assignmentsError) {
      console.error('Error fetching client assignments:', assignmentsError)
    }

    // Define common client interface
    interface ClientWithSource {
      id: string
      public_id: string
      business_name: string
      owner_name: string | null
      email: string | null
      phone: string | null
      whatsapp: string | null
      address_street: string | null
      address_city: string | null
      address_state: string | null
      status: string
      source_id: string
      source_type: 'assignment' | 'membership'
      source_status: string
    }

    // Get clients from direct assignments
    const assignedClients: ClientWithSource[] = (assignments || [])
      .filter(a => a.client)
      .map(a => {
        const client = Array.isArray(a.client) ? a.client[0] : a.client
        return {
          id: client?.id,
          public_id: client?.public_id,
          business_name: client?.business_name,
          owner_name: client?.owner_name,
          email: client?.email,
          phone: client?.phone,
          whatsapp: client?.whatsapp,
          address_street: client?.address_street,
          address_city: client?.address_city,
          address_state: client?.address_state,
          status: client?.status,
          source_id: a.id,
          source_type: 'assignment' as const,
          source_status: a.is_active ? 'active' : 'inactive'
        }
      })

    // If no direct assignments but has brand_id, fallback to brand memberships
    let brandClients: ClientWithSource[] = []
    if (assignedClients.length === 0 && asesorVentasRole.brand_id) {
      const { data: memberships, error: membershipsError } = await supabase
        .from('client_brand_memberships')
        .select(`
          id,
          status,
          created_at,
          client:clients(
            id,
            public_id,
            business_name,
            owner_name,
            email,
            phone,
            whatsapp,
            address_street,
            address_city,
            address_state,
            status
          )
        `)
        .eq('brand_id', asesorVentasRole.brand_id)
        .is('deleted_at', null)

      if (membershipsError) {
        console.error('Error fetching brand memberships:', membershipsError)
      }

      brandClients = (memberships || [])
        .filter(m => m.client)
        .map(m => {
          const client = Array.isArray(m.client) ? m.client[0] : m.client
          return {
            id: client?.id,
            public_id: client?.public_id,
            business_name: client?.business_name,
            owner_name: client?.owner_name,
            email: client?.email,
            phone: client?.phone,
            whatsapp: client?.whatsapp,
            address_street: client?.address_street,
            address_city: client?.address_city,
            address_state: client?.address_state,
            status: client?.status,
            source_id: m.id,
            source_type: 'membership' as const,
            source_status: m.status
          }
        })
    }

    // Merge and deduplicate by client id
    const clientsMap = new Map<string, ClientWithSource>()
    for (const client of [...assignedClients, ...brandClients]) {
      if (client.id && !clientsMap.has(client.id)) {
        clientsMap.set(client.id, client)
      }
    }

    // 5. Formatear respuesta
    const clients = Array.from(clientsMap.values())

    return NextResponse.json({
      clients,
      total: clients.length
    })

  } catch (error) {
    console.error('Error en /api/asesor-ventas/clients:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
