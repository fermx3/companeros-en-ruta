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

    // 4. Obtener clientes asignados a la marca del asesor
    if (!asesorVentasRole.brand_id) {
      return NextResponse.json({
        clients: [],
        message: 'No tiene marca asignada'
      })
    }

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
      return NextResponse.json(
        { error: 'Error al obtener clientes', details: membershipsError.message },
        { status: 500 }
      )
    }

    // 5. Formatear respuesta
    const clients = memberships
      ?.filter(m => m.client)
      .map(m => ({
        membership_id: m.id,
        membership_status: m.status,
        ...m.client
      })) || []

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
