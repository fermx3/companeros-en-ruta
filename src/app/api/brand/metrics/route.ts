import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/brand/metrics
 * Obtiene las métricas del dashboard para la marca del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')

    if (brandId) {
      // Si se proporciona un brandId específico, obtener métricas para esa marca
      const { data, error } = await supabase
        .from('brand_dashboard_metrics')
        .select('*')
        .eq('brand_id', brandId)
        .single()

      if (error) {
        console.error('Error fetching brand dashboard metrics:', error)
        throw new Error(`Error al obtener métricas de marca: ${error.message}`)
      }

      return NextResponse.json(data)
    } else {
      // Si no se proporciona brandId, obtener la marca del usuario actual

      // 1. Obtener el usuario autenticado
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // 2. Buscar el user_profile correspondiente al auth.user
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, tenant_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (profileError || !userProfile) {
        throw new Error('No se encontró perfil de usuario válido')
      }

      // 3. Buscar el rol activo del usuario para obtener su brand_id
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('brand_id, role, tenant_id, scope, status')
        .eq('user_profile_id', userProfile.id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (roleError) {
        console.error('Error fetching user roles:', roleError)
        throw new Error(`Error al consultar roles de usuario: ${roleError.message}`)
      }

      if (!userRoles || userRoles.length === 0) {
        throw new Error('No tienes roles asignados. Contacta al administrador para asignarte a una marca.')
      }

      // Buscar un rol con brand_id o permitir admin global
      let targetBrandId: string | null = null

      // Priorizar roles con brand_id específico
      const brandSpecificRole = userRoles.find(r => r.brand_id)
      if (brandSpecificRole) {
        targetBrandId = brandSpecificRole.brand_id
      } else {
        // Si es admin global, usar la primera marca disponible del tenant
        const adminRole = userRoles.find(r => r.role === 'admin' && r.scope === 'global')
        if (adminRole) {
          const { data: firstBrand } = await supabase
            .from('brands')
            .select('id')
            .eq('tenant_id', adminRole.tenant_id)
            .eq('status', 'active')
            .limit(1)
            .single()

          if (firstBrand) {
            targetBrandId = firstBrand.id
          }
        }
      }

      if (!targetBrandId) {
        throw new Error('No se pudo determinar una marca para mostrar métricas. Roles encontrados: ' + userRoles.map(r => `${r.role}(${r.scope})`).join(', '))
      }

      // 3. Obtener información real de la marca y calcular métricas reales

      // Información básica de la marca (confirmada que existe)
      const { data: brandInfo, error: brandError } = await supabase
        .from('brands')
        .select(`
          *,
          tenants!brands_tenant_id_fkey(
            name,
            slug
          )
        `)
        .eq('id', targetBrandId)
        .single()

      if (brandError || !brandInfo) {
        throw new Error('Marca no encontrada')
      }

      // 4. Obtener métricas reales de client_brand_memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('client_brand_memberships')
        .select('id, membership_status, joined_date, lifetime_points, points_balance, last_purchase_date, created_at')
        .eq('brand_id', targetBrandId)
        .is('deleted_at', null)

      if (membershipsError) {
        console.error('Error al obtener membresías:', membershipsError)
        // Si no podemos obtener membresías, usar 0s pero no fallar
      }

      // Calcular métricas desde client_brand_memberships
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const totalClients = memberships?.length || 0
      const activeClients = memberships?.filter(m => m.membership_status === 'active').length || 0
      const pendingClients = memberships?.filter(m => m.membership_status === 'pending').length || 0

      const totalPointsBalance = memberships?.reduce((sum, m) => sum + (Number(m.points_balance) || 0), 0) || 0
      const avgClientPoints = totalClients > 0 ? Math.round((totalPointsBalance / totalClients) * 100) / 100 : 0

      // Fechas de membresía
      const membershipDates = memberships
        ?.filter(m => m.joined_date)
        .map(m => new Date(m.joined_date!))
        .sort((a, b) => a.getTime() - b.getTime()) || []

      const firstMembershipDate = membershipDates.length > 0 ? membershipDates[0].toISOString() : null
      const lastMembershipDate = membershipDates.length > 0 ? membershipDates[membershipDates.length - 1].toISOString() : null

      // Por ahora, visitas/órdenes/promociones en 0 hasta implementar esas consultas
      const realMetrics = {
        // Información real de marca
        brand_id: brandInfo.id,
        brand_public_id: brandInfo.public_id,
        tenant_id: brandInfo.tenant_id,
        brand_name: brandInfo.name,
        brand_slug: brandInfo.slug,
        logo_url: brandInfo.logo_url,
        brand_color_primary: brandInfo.brand_color_primary,
        brand_color_secondary: brandInfo.brand_color_secondary,
        website: brandInfo.website,
        contact_email: brandInfo.contact_email,
        contact_phone: brandInfo.contact_phone,
        status: brandInfo.status,
        settings: brandInfo.settings || {},
        created_at: brandInfo.created_at,
        updated_at: brandInfo.updated_at,
        tenant_name: brandInfo.tenants?.name || 'Sin Tenant',
        tenant_slug: brandInfo.tenants?.slug || 'sin-tenant',

        // Métricas reales calculadas desde client_brand_memberships
        total_clients: totalClients,
        active_clients: activeClients,
        pending_clients: pendingClients,
        avg_client_points: avgClientPoints,
        total_points_balance: totalPointsBalance,

        // Visitas, órdenes y promociones en 0 hasta implementar
        total_visits: 0,
        monthly_visits: 0,
        active_visits: 0,
        avg_visit_rating: 0,

        total_orders: 0,
        monthly_orders: 0,
        total_revenue: 0,
        monthly_revenue: 0,

        active_promotions: 0,
        total_promotions: 0,

        // KPIs calculados
        conversion_rate: 0, // total_orders / total_visits cuando se implementen
        revenue_per_client: totalClients > 0 ? 0 : 0, // total_revenue / total_clients cuando se implemente

        // Fechas reales de membresías
        first_membership_date: firstMembershipDate,
        last_membership_date: lastMembershipDate,
        last_visit_date: null,
        last_order_date: null
      }

      return NextResponse.json(realMetrics)
    }

    // Si no hay métricas, devolver error 404
    return NextResponse.json(
      { error: 'No se encontraron métricas para la marca' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error in brand metrics API:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    const statusCode = errorMessage.includes('no autenticado') ? 401 :
                      errorMessage.includes('No se encontró') ? 404 : 500

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
