import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveAsesorAuth, isAsesorAuthError, asesorAuthErrorResponse } from '@/lib/api/asesor-auth'

export async function GET() {
  try {
    const supabase = await createClient()

    // Authenticate and verify asesor role
    const authResult = await resolveAsesorAuth(supabase)
    if (isAsesorAuthError(authResult)) return asesorAuthErrorResponse(authResult)
    const { userProfileId, brandId } = authResult

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
      .eq('user_profile_id', userProfileId)
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
    if (assignedClients.length === 0 && brandId) {
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
        .eq('brand_id', brandId)
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
