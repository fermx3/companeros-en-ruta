import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { buildCsvString, csvResponse, formatCsvDate, formatCsvCurrency } from '@/lib/utils/csv'
import archiver from 'archiver'
import { PassThrough } from 'stream'

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
 * POST /api/brand/exports
 * Advanced export with multi-dataset selection and segmentation filters.
 * Returns CSV (single dataset) or ZIP (multiple datasets).
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

    if (datasets.length === 0) {
      return Response.json({ error: 'Selecciona al menos un dataset' }, { status: 400 })
    }

    // Step 1: Resolve filtered client IDs
    const filteredClientIds = await resolveFilteredClientIds(supabase, brandId, tenantId, filters)

    // Step 2: Generate CSV for each selected dataset
    const csvFiles: { name: string; content: string }[] = []

    for (const dataset of datasets) {
      const csv = await generateDatasetCsv(supabase, brandId, tenantId, dataset, filteredClientIds, filters)
      if (csv) {
        csvFiles.push({ name: `${dataset}.csv`, content: csv })
      }
    }

    if (csvFiles.length === 0) {
      return Response.json({ error: 'No se generaron datos para exportar' }, { status: 404 })
    }

    // Step 3: Return single CSV or ZIP
    if (csvFiles.length === 1) {
      return csvResponse(csvFiles[0].content, `${datasets[0]}_${new Date().toISOString().split('T')[0]}.csv`)
    }

    // Multiple files → ZIP
    const zipBuffer = await createZipBuffer(csvFiles)
    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="export_${new Date().toISOString().split('T')[0]}.zip"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error in POST /api/brand/exports:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

async function createZipBuffer(files: { name: string; content: string }[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const passthrough = new PassThrough()
    const chunks: Buffer[] = []

    passthrough.on('data', (chunk: Buffer) => chunks.push(chunk))
    passthrough.on('end', () => resolve(Buffer.concat(chunks)))
    passthrough.on('error', reject)

    archive.pipe(passthrough)

    for (const file of files) {
      archive.append(file.content, { name: file.name })
    }

    archive.finalize()
  })
}

async function resolveFilteredClientIds(
  supabase: any, brandId: string, tenantId: string, filters: ExportFilters
): Promise<string[] | null> {
  // null means "no filter" — include all clients
  const hasClientFilters =
    filters.client_status?.length ||
    filters.client_type_ids?.length ||
    filters.market_ids?.length ||
    filters.commercial_structure_ids?.length ||
    filters.zone_ids?.length ||
    filters.states?.length ||
    filters.cities?.length ||
    filters.postal_codes?.length ||
    filters.membership_status?.length ||
    filters.tier_ids?.length ||
    filters.points_balance_min !== undefined ||
    filters.points_balance_max !== undefined ||
    filters.points_lifetime_min !== undefined ||
    filters.points_lifetime_max !== undefined ||
    filters.registration_date_from ||
    filters.registration_date_to ||
    filters.last_visit_from ||
    filters.last_visit_to ||
    filters.last_purchase_from ||
    filters.last_purchase_to ||
    filters.promotor_ids?.length ||
    filters.assignment_types?.length

  if (!hasClientFilters) return null

  // Start with clients joined to brand via memberships
  let query = supabase
    .from('client_brand_memberships')
    .select('client_id, membership_status, points_balance, lifetime_points, last_purchase_date, client:clients!inner(id, status, client_type_id, market_id, commercial_structure_id, zone_id, address_state, address_city, address_postal_code, registration_date, last_visit_date)')
    .eq('brand_id', brandId)
    .is('deleted_at', null)

  // Membership filters
  if (filters.membership_status?.length) {
    query = query.in('membership_status', filters.membership_status)
  }
  if (filters.tier_ids?.length) {
    query = query.in('current_tier_id', filters.tier_ids)
  }
  if (filters.points_balance_min !== undefined) {
    query = query.gte('points_balance', filters.points_balance_min)
  }
  if (filters.points_balance_max !== undefined) {
    query = query.lte('points_balance', filters.points_balance_max)
  }
  if (filters.points_lifetime_min !== undefined) {
    query = query.gte('lifetime_points', filters.points_lifetime_min)
  }
  if (filters.points_lifetime_max !== undefined) {
    query = query.lte('lifetime_points', filters.points_lifetime_max)
  }
  if (filters.last_purchase_from) {
    query = query.gte('last_purchase_date', filters.last_purchase_from)
  }
  if (filters.last_purchase_to) {
    query = query.lte('last_purchase_date', filters.last_purchase_to)
  }

  const { data: memberships, error } = await query

  if (error || !memberships) return []

  let clientIds = memberships.map((m: any) => m.client_id) as string[]

  // Apply client-level filters in memory (Supabase nested filtering is limited)
  const clientMap = new Map<string, any>()
  for (const m of memberships) {
    const client = m.client as any
    if (client) clientMap.set(m.client_id, client)
  }

  if (filters.client_status?.length) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && filters.client_status!.includes(c.status)
    })
  }
  if (filters.client_type_ids?.length) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && filters.client_type_ids!.includes(c.client_type_id)
    })
  }
  if (filters.market_ids?.length) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && filters.market_ids!.includes(c.market_id)
    })
  }
  if (filters.commercial_structure_ids?.length) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && filters.commercial_structure_ids!.includes(c.commercial_structure_id)
    })
  }
  if (filters.zone_ids?.length) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && filters.zone_ids!.includes(c.zone_id)
    })
  }
  if (filters.states?.length) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && filters.states!.includes(c.address_state)
    })
  }
  if (filters.cities?.length) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && filters.cities!.includes(c.address_city)
    })
  }
  if (filters.postal_codes?.length) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && filters.postal_codes!.includes(c.address_postal_code)
    })
  }
  if (filters.registration_date_from) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && c.registration_date >= filters.registration_date_from!
    })
  }
  if (filters.registration_date_to) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && c.registration_date <= filters.registration_date_to!
    })
  }
  if (filters.last_visit_from) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && c.last_visit_date && c.last_visit_date >= filters.last_visit_from!
    })
  }
  if (filters.last_visit_to) {
    clientIds = clientIds.filter(id => {
      const c = clientMap.get(id)
      return c && c.last_visit_date && c.last_visit_date <= filters.last_visit_to!
    })
  }

  // Promotor assignment filter
  if (filters.promotor_ids?.length || filters.assignment_types?.length) {
    let assignQuery = supabase
      .from('client_assignments')
      .select('client_id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .in('client_id', clientIds)

    if (filters.promotor_ids?.length) {
      assignQuery = assignQuery.in('user_profile_id', filters.promotor_ids)
    }
    if (filters.assignment_types?.length) {
      assignQuery = assignQuery.in('assignment_type', filters.assignment_types)
    }

    const { data: assignments } = await assignQuery
    const assignedClientIds = new Set((assignments || []).map((a: any) => a.client_id))
    clientIds = clientIds.filter(id => assignedClientIds.has(id))
  }

  return [...new Set(clientIds)]
}

async function generateDatasetCsv(
  supabase: any, brandId: string, tenantId: string,
  dataset: DatasetKey, filteredClientIds: string[] | null, filters: ExportFilters
): Promise<string | null> {
  switch (dataset) {
    case 'clients': return generateClientsCsv(supabase, brandId, filteredClientIds)
    case 'visits': return generateVisitsCsv(supabase, brandId, filteredClientIds, filters)
    case 'memberships': return generateMembershipsCsv(supabase, brandId, filteredClientIds)
    case 'promotions': return generatePromotionsCsv(supabase, brandId)
    case 'surveys': return generateSurveysCsv(supabase, brandId)
    case 'products': return generateProductsCsv(supabase, brandId)
    case 'team': return generateTeamCsv(supabase, brandId, tenantId)
    case 'competitors': return generateCompetitorsCsv(supabase, brandId)
    case 'pop_materials': return generatePopMaterialsCsv(supabase, brandId)
    default: return null
  }
}

async function generateClientsCsv(supabase: any, brandId: string, clientIds: string[] | null): Promise<string> {
  let query = supabase
    .from('client_brand_memberships')
    .select(`
      membership_status, joined_date, lifetime_points, points_balance, last_purchase_date,
      client:clients!client_brand_memberships_client_id_fkey(public_id, business_name, legal_name, owner_name, email, phone, whatsapp, status,
        address_street, address_city, address_state, address_postal_code,
        client_type:client_types(name), commercial_structure:commercial_structures(name))
    `)
    .eq('brand_id', brandId)
    .is('deleted_at', null)

  if (clientIds) query = query.in('client_id', clientIds)

  const { data, error } = await query
  if (error) console.error('generateClientsCsv error:', error)
  const headers = ['ID', 'Nombre', 'Propietario', 'Email', 'Teléfono', 'Tipo', 'Estado', 'Ciudad', 'Estado/Prov', 'Membresía', 'Puntos', 'Lifetime', 'Última Compra']
  const rows = (data || []).map((m: any) => {
    const c = m.client as any
    return [c?.public_id || '', c?.business_name || c?.legal_name || '', c?.owner_name || '', c?.email || '', c?.phone || '',
      (c?.client_type as any)?.name || '', c?.status || '', c?.address_city || '', c?.address_state || '',
      m.membership_status || '', String(m.points_balance ?? 0), String(m.lifetime_points ?? 0), formatCsvDate(m.last_purchase_date)]
  })
  return buildCsvString(headers, rows)
}

async function generateVisitsCsv(supabase: any, brandId: string, clientIds: string[] | null, filters: ExportFilters): Promise<string> {
  let query = supabase
    .from('visits')
    .select(`public_id, visit_status, visit_date, check_in_time, check_out_time, client_satisfaction_rating, promotor_notes,
      client:clients!visits_client_id_fkey(business_name), promotor:user_profiles!visits_advisor_id_fkey(first_name, last_name)`)
    .eq('brand_id', brandId)
    .is('deleted_at', null)
    .order('visit_date', { ascending: false })

  if (clientIds) query = query.in('client_id', clientIds)
  if (filters.data_period_from) query = query.gte('visit_date', filters.data_period_from)
  if (filters.data_period_to) query = query.lte('visit_date', filters.data_period_to)

  const { data, error } = await query
  if (error) console.error('generateVisitsCsv error:', error)
  const headers = ['ID', 'Fecha', 'Cliente', 'Promotor', 'Estado', 'Rating', 'Notas']
  const rows = (data || []).map((v: any) => {
    const client = v.client as any
    const promotor = v.promotor as any
    return [v.public_id || '', formatCsvDate(v.visit_date), client?.business_name || '',
      promotor ? `${promotor.first_name} ${promotor.last_name}` : '', v.visit_status || '',
      v.client_satisfaction_rating !== null ? String(v.client_satisfaction_rating) : '', v.promotor_notes || '']
  })
  return buildCsvString(headers, rows)
}

async function generateMembershipsCsv(supabase: any, brandId: string, clientIds: string[] | null): Promise<string> {
  let query = supabase
    .from('client_brand_memberships')
    .select(`public_id, membership_status, joined_date, lifetime_points, points_balance, last_purchase_date,
      client:clients!client_brand_memberships_client_id_fkey(business_name, email), tier:tiers!client_brand_memberships_current_tier_id_fkey(name)`)
    .eq('brand_id', brandId)
    .is('deleted_at', null)

  if (clientIds) query = query.in('client_id', clientIds)

  const { data, error } = await query
  if (error) console.error('generateMembershipsCsv error:', error)
  const headers = ['ID', 'Cliente', 'Email', 'Estado', 'Tier', 'Puntos', 'Lifetime', 'Última Compra']
  const rows = (data || []).map((m: any) => {
    const c = m.client as any
    const t = m.tier as any
    return [m.public_id || '', c?.business_name || '', c?.email || '', m.membership_status || '',
      t?.name || '', String(m.points_balance ?? 0), String(m.lifetime_points ?? 0), formatCsvDate(m.last_purchase_date)]
  })
  return buildCsvString(headers, rows)
}

async function generatePromotionsCsv(supabase: any, brandId: string): Promise<string> {
  const { data, error } = await supabase.from('promotions')
    .select('public_id, name, promotion_type, status, start_date, end_date, discount_percentage, discount_amount, budget_allocated, usage_count_total')
    .eq('brand_id', brandId).is('deleted_at', null)
  if (error) console.error('generatePromotionsCsv error:', error)
  const headers = ['ID', 'Nombre', 'Tipo', 'Estado', 'Inicio', 'Fin', 'Valor', 'Presupuesto', 'Usos']
  const rows = (data || []).map((p: any) => [
    p.public_id || '', p.name || '', p.promotion_type || '', p.status || '',
    formatCsvDate(p.start_date), formatCsvDate(p.end_date),
    p.discount_percentage ? `${p.discount_percentage}%` : formatCsvCurrency(p.discount_amount),
    formatCsvCurrency(p.budget_allocated), String(p.usage_count_total ?? 0)
  ])
  return buildCsvString(headers, rows)
}

async function generateSurveysCsv(supabase: any, brandId: string): Promise<string> {
  const { data, error } = await supabase.from('surveys')
    .select('public_id, title, survey_status, target_roles, start_date, end_date, created_at')
    .eq('brand_id', brandId).is('deleted_at', null)
  if (error) console.error('generateSurveysCsv error:', error)
  const headers = ['ID', 'Título', 'Estado', 'Roles', 'Inicio', 'Fin', 'Creada']
  const rows = (data || []).map((s: any) => [
    s.public_id || '', s.title || '', s.survey_status || '',
    Array.isArray(s.target_roles) ? s.target_roles.join(', ') : '',
    formatCsvDate(s.start_date), formatCsvDate(s.end_date), formatCsvDate(s.created_at)
  ])
  return buildCsvString(headers, rows)
}

async function generateProductsCsv(supabase: any, brandId: string): Promise<string> {
  const { data, error } = await supabase.from('products')
    .select('public_id, name, sku, base_price, is_active, include_in_assessment, category:product_categories(name)')
    .eq('brand_id', brandId).is('deleted_at', null)
  if (error) console.error('generateProductsCsv error:', error)
  const headers = ['ID', 'Nombre', 'SKU', 'Precio', 'Activo', 'En Assessment', 'Categoría']
  const rows = (data || []).map((p: any) => [
    p.public_id || '', p.name || '', p.sku || '', formatCsvCurrency(p.base_price),
    p.is_active ? 'Sí' : 'No', p.include_in_assessment ? 'Sí' : 'No', (p.category as any)?.name || ''
  ])
  return buildCsvString(headers, rows)
}

async function generateTeamCsv(supabase: any, brandId: string, tenantId: string): Promise<string> {
  const { data, error } = await supabase.from('user_roles')
    .select('role, status, user_profile:user_profiles!user_roles_user_profile_id_fkey(public_id, first_name, last_name, email, phone, status)')
    .eq('brand_id', brandId).eq('tenant_id', tenantId).is('deleted_at', null)
    .in('role', ['brand_manager', 'promotor', 'supervisor', 'asesor_de_ventas'])
  if (error) console.error('generateTeamCsv error:', error)
  const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Rol', 'Estado']
  const rows = (data || []).map((r: any) => {
    const p = r.user_profile as any
    return [p?.public_id || '', p ? `${p.first_name} ${p.last_name}` : '', p?.email || '', p?.phone || '', r.role || '', p?.status || '']
  })
  return buildCsvString(headers, rows)
}

async function generateCompetitorsCsv(supabase: any, brandId: string): Promise<string> {
  const { data, error } = await supabase.from('brand_competitors')
    .select('public_id, competitor_name, is_active, products:brand_competitor_products(id)')
    .eq('brand_id', brandId).is('deleted_at', null)
  if (error) console.error('generateCompetitorsCsv error:', error)
  const headers = ['ID', 'Nombre', 'Activo', 'Productos']
  const rows = (data || []).map((c: any) => [
    c.public_id || '', c.competitor_name || '', c.is_active ? 'Sí' : 'No',
    String(Array.isArray(c.products) ? c.products.length : 0)
  ])
  return buildCsvString(headers, rows)
}

async function generatePopMaterialsCsv(supabase: any, brandId: string): Promise<string> {
  const { data, error } = await supabase.from('brand_pop_materials')
    .select('public_id, material_name, material_category, is_active, is_system_template')
    .or(`brand_id.eq.${brandId},is_system_template.eq.true`).is('deleted_at', null)
  if (error) console.error('generatePopMaterialsCsv error:', error)
  const headers = ['ID', 'Nombre', 'Categoría', 'Activo', 'Tipo']
  const rows = (data || []).map((m: any) => [
    m.public_id || '', m.material_name || '', m.material_category || '',
    m.is_active ? 'Sí' : 'No', m.is_system_template ? 'Sistema' : 'Marca'
  ])
  return buildCsvString(headers, rows)
}
