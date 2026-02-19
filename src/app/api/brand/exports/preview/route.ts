import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

interface ExportFilters {
  client_status?: string[]
  client_type_ids?: string[]
  market_ids?: string[]
  commercial_structure_ids?: string[]
  zone_ids?: string[]
  states?: string[]
  cities?: string[]
  postal_codes?: string[]
  membership_status?: string[]
  tier_ids?: string[]
  points_balance_min?: number
  points_balance_max?: number
  points_lifetime_min?: number
  points_lifetime_max?: number
  registration_date_from?: string
  registration_date_to?: string
  last_visit_from?: string
  last_visit_to?: string
  last_purchase_from?: string
  last_purchase_to?: string
  data_period_from?: string
  data_period_to?: string
  promotor_ids?: string[]
  assignment_types?: string[]
}

type DatasetKey = 'clients' | 'visits' | 'memberships' | 'promotions' | 'surveys' | 'products' | 'team' | 'competitors' | 'pop_materials'

/**
 * POST /api/brand/exports/preview
 * Returns counts for each selected dataset based on current filters.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    const body = await request.json()
    const datasets: DatasetKey[] = body.datasets || []
    const filters: ExportFilters = body.filters || {}

    // Resolve filtered client IDs
    const filteredClientIds = await resolveFilteredClientIds(supabase, brandId, tenantId, filters)

    const counts: Record<string, number> = {}
    let totalRecords = 0

    for (const dataset of datasets) {
      const count = await getDatasetCount(supabase, brandId, tenantId, dataset, filteredClientIds, filters)
      counts[dataset] = count
      totalRecords += count
    }

    return Response.json({ counts, total_records: totalRecords })
  } catch (error) {
    console.error('Error in POST /api/brand/exports/preview:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

async function resolveFilteredClientIds(
  supabase: any, brandId: string, tenantId: string, filters: ExportFilters
): Promise<string[] | null> {
  const hasFilters =
    filters.client_status?.length || filters.client_type_ids?.length ||
    filters.market_ids?.length || filters.commercial_structure_ids?.length ||
    filters.zone_ids?.length || filters.states?.length ||
    filters.cities?.length || filters.postal_codes?.length ||
    filters.membership_status?.length || filters.tier_ids?.length ||
    filters.points_balance_min !== undefined || filters.points_balance_max !== undefined ||
    filters.points_lifetime_min !== undefined || filters.points_lifetime_max !== undefined ||
    filters.registration_date_from || filters.registration_date_to ||
    filters.last_visit_from || filters.last_visit_to ||
    filters.last_purchase_from || filters.last_purchase_to ||
    filters.promotor_ids?.length || filters.assignment_types?.length

  if (!hasFilters) return null

  let query = supabase
    .from('client_brand_memberships')
    .select('client_id, membership_status, points_balance, lifetime_points, last_purchase_date, client:clients!inner(id, status, client_type_id, market_id, commercial_structure_id, zone_id, address_state, address_city, address_postal_code, registration_date, last_visit_date)')
    .eq('brand_id', brandId)
    .is('deleted_at', null)

  if (filters.membership_status?.length) query = query.in('membership_status', filters.membership_status)
  if (filters.tier_ids?.length) query = query.in('current_tier_id', filters.tier_ids)
  if (filters.points_balance_min !== undefined) query = query.gte('points_balance', filters.points_balance_min)
  if (filters.points_balance_max !== undefined) query = query.lte('points_balance', filters.points_balance_max)
  if (filters.points_lifetime_min !== undefined) query = query.gte('lifetime_points', filters.points_lifetime_min)
  if (filters.points_lifetime_max !== undefined) query = query.lte('lifetime_points', filters.points_lifetime_max)
  if (filters.last_purchase_from) query = query.gte('last_purchase_date', filters.last_purchase_from)
  if (filters.last_purchase_to) query = query.lte('last_purchase_date', filters.last_purchase_to)

  const { data: memberships } = await query
  if (!memberships) return []

  let clientIds = memberships.map((m: any) => m.client_id) as string[]
  const clientMap = new Map<string, any>()
  for (const m of memberships) {
    const client = m.client as any
    if (client) clientMap.set(m.client_id, client)
  }

  if (filters.client_status?.length) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && filters.client_status!.includes(c.status) })
  if (filters.client_type_ids?.length) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && filters.client_type_ids!.includes(c.client_type_id) })
  if (filters.market_ids?.length) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && filters.market_ids!.includes(c.market_id) })
  if (filters.commercial_structure_ids?.length) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && filters.commercial_structure_ids!.includes(c.commercial_structure_id) })
  if (filters.zone_ids?.length) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && filters.zone_ids!.includes(c.zone_id) })
  if (filters.states?.length) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && filters.states!.includes(c.address_state) })
  if (filters.cities?.length) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && filters.cities!.includes(c.address_city) })
  if (filters.postal_codes?.length) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && filters.postal_codes!.includes(c.address_postal_code) })
  if (filters.registration_date_from) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && c.registration_date >= filters.registration_date_from! })
  if (filters.registration_date_to) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && c.registration_date <= filters.registration_date_to! })
  if (filters.last_visit_from) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && c.last_visit_date && c.last_visit_date >= filters.last_visit_from! })
  if (filters.last_visit_to) clientIds = clientIds.filter(id => { const c = clientMap.get(id); return c && c.last_visit_date && c.last_visit_date <= filters.last_visit_to! })

  if (filters.promotor_ids?.length || filters.assignment_types?.length) {
    let q = supabase.from('client_assignments').select('client_id')
      .eq('tenant_id', tenantId).eq('is_active', true).is('deleted_at', null).in('client_id', clientIds)
    if (filters.promotor_ids?.length) q = q.in('user_profile_id', filters.promotor_ids)
    if (filters.assignment_types?.length) q = q.in('assignment_type', filters.assignment_types)
    const { data: assigns } = await q
    const assignedSet = new Set((assigns || []).map((a: any) => a.client_id))
    clientIds = clientIds.filter(id => assignedSet.has(id))
  }

  return [...new Set(clientIds)]
}

async function getDatasetCount(
  supabase: any, brandId: string, tenantId: string,
  dataset: DatasetKey, clientIds: string[] | null, filters: ExportFilters
): Promise<number> {
  switch (dataset) {
    case 'clients':
    case 'memberships': {
      let q = supabase.from('client_brand_memberships').select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId).is('deleted_at', null)
      if (clientIds) q = q.in('client_id', clientIds)
      const { count } = await q
      return count ?? 0
    }
    case 'visits': {
      let q = supabase.from('visits').select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId).is('deleted_at', null)
      if (clientIds) q = q.in('client_id', clientIds)
      if (filters.data_period_from) q = q.gte('visit_date', filters.data_period_from)
      if (filters.data_period_to) q = q.lte('visit_date', filters.data_period_to)
      const { count } = await q
      return count ?? 0
    }
    case 'promotions': {
      const { count } = await supabase.from('promotions').select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId).is('deleted_at', null)
      return count ?? 0
    }
    case 'surveys': {
      const { count } = await supabase.from('surveys').select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId).is('deleted_at', null)
      return count ?? 0
    }
    case 'products': {
      const { count } = await supabase.from('products').select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId).is('deleted_at', null)
      return count ?? 0
    }
    case 'team': {
      const { count } = await supabase.from('user_roles').select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId).eq('tenant_id', tenantId).is('deleted_at', null)
        .in('role', ['brand_manager', 'promotor', 'supervisor', 'asesor_de_ventas'])
      return count ?? 0
    }
    case 'competitors': {
      const { count } = await supabase.from('brand_competitors').select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId).is('deleted_at', null)
      return count ?? 0
    }
    case 'pop_materials': {
      const { count } = await supabase.from('brand_pop_materials').select('id', { count: 'exact', head: true })
        .or(`brand_id.eq.${brandId},is_system_template.eq.true`).is('deleted_at', null)
      return count ?? 0
    }
    default: return 0
  }
}
