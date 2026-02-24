import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Shared helper for fetching full visit detail data (read-only).
 * Used by brand and admin visit detail API routes.
 *
 * Resolves all FK names server-side so the client component
 * doesn't need extra fetches.
 */

export interface VisitDetailData {
  visit: {
    id: string
    public_id: string
    visit_date: string
    visit_status: string
    check_in_time: string | null
    check_out_time: string | null
    latitude: number | null
    longitude: number | null
    duration_minutes: number | null
    client_satisfaction_rating: number | null
    promotor_notes: string | null
    brand: { name: string } | null
    client: {
      business_name: string | null
      owner_name: string | null
      owner_last_name: string | null
      address_street: string | null
      address_neighborhood: string | null
    } | null
    promotor: {
      first_name: string
      last_name: string
    } | null
  }
  assessment: {
    stageAssessment: Record<string, unknown> | null
    brandProductAssessments: Array<Record<string, unknown>>
    competitorAssessments: Array<Record<string, unknown>>
    popMaterialChecks: Array<Record<string, unknown>>
    exhibitionChecks: Array<Record<string, unknown>>
    inventoryItems: Array<Record<string, unknown>>
    evidence: Array<Record<string, unknown>>
  }
  orders: Array<{
    id: string
    public_id: string
    order_number: string | null
    order_status: string
    total_amount: string | number
    distributor_id: string | null
    distributor_name: string | null
    payment_method: string | null
    order_notes: string | null
    created_at: string
    items: Array<{
      product_id: string
      product_name: string
      quantity: number
      unit_price: number
    }>
  }>
}

export async function fetchVisitDetail(
  supabase: SupabaseClient,
  visitId: string
): Promise<VisitDetailData> {
  // 1. Fetch visit with related names
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select(`
      id, public_id, visit_date, visit_status,
      check_in_time, check_out_time, latitude, longitude,
      duration_minutes, client_satisfaction_rating, promotor_notes,
      brand:brands!visits_brand_id_fkey(name),
      client:clients!visits_client_id_fkey(
        business_name, owner_name, owner_last_name,
        address_street, address_neighborhood
      ),
      promotor:user_profiles!visits_advisor_id_fkey(first_name, last_name)
    `)
    .eq('id', visitId)
    .is('deleted_at', null)
    .single()

  if (visitError || !visit) {
    console.error('Visit detail query failed:', visitError?.message, visitError?.code, visitError?.details)
    throw new Error(`Visit not found: ${visitError?.message || 'no data'}`)
  }

  // 2. Fetch assessment data (parallel)
  const [
    stageAssessmentRes,
    brandProductRes,
    competitorRes,
    popMaterialRes,
    exhibitionRes,
    evidenceRes,
    inventoryRes,
  ] = await Promise.all([
    supabase
      .from('visit_stage_assessments')
      .select('*')
      .eq('visit_id', visitId)
      .single(),
    supabase
      .from('visit_brand_product_assessments')
      .select('*, product:products!product_id(name)')
      .eq('visit_id', visitId),
    supabase
      .from('visit_competitor_assessments')
      .select('*, competitor:brand_competitors!competitor_id(competitor_name)')
      .eq('visit_id', visitId),
    supabase
      .from('visit_pop_material_checks')
      .select('*, material:brand_pop_materials!pop_material_id(material_name)')
      .eq('visit_id', visitId),
    supabase
      .from('visit_exhibition_checks')
      .select('*, exhibition:brand_exhibitions!exhibition_id(exhibition_name)')
      .eq('visit_id', visitId),
    supabase
      .from('visit_evidence')
      .select('id, file_url, caption, evidence_type, evidence_stage, capture_latitude, capture_longitude, created_at')
      .eq('visit_id', visitId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('visit_inventories')
      .select('id, product_id, current_stock, notes, product:products!visit_inventories_product_id_fkey(name)')
      .eq('visit_id', visitId)
      .is('deleted_at', null),
  ])

  // 3. Resolve product names into flat fields
  const brandProductAssessments = (brandProductRes.data || []).map((bpa) => {
    const product = bpa.product as { name: string } | { name: string }[] | null
    const productName = Array.isArray(product)
      ? product[0]?.name || 'Producto'
      : product?.name || 'Producto'
    const { product: _p, ...rest } = bpa
    return { ...rest, product_name: productName }
  })

  const competitorAssessments = (competitorRes.data || []).map((ca) => {
    const competitor = ca.competitor as { competitor_name: string } | { competitor_name: string }[] | null
    const competitorName = Array.isArray(competitor)
      ? competitor[0]?.competitor_name || 'Competidor'
      : competitor?.competitor_name || 'Competidor'
    const { competitor: _c, ...rest } = ca
    return { ...rest, competitor_name: competitorName }
  })

  const popMaterialChecks = (popMaterialRes.data || []).map((pm) => {
    const material = pm.material as { material_name: string } | { material_name: string }[] | null
    const materialName = Array.isArray(material)
      ? material[0]?.material_name || 'Material'
      : material?.material_name || 'Material'
    const { material: _m, ...rest } = pm
    return { ...rest, material_name: materialName }
  })

  const exhibitionChecks = (exhibitionRes.data || []).map((ec) => {
    const exhibition = ec.exhibition as { exhibition_name: string } | { exhibition_name: string }[] | null
    const exhibitionName = Array.isArray(exhibition)
      ? exhibition[0]?.exhibition_name || 'Exhibición'
      : exhibition?.exhibition_name || 'Exhibición'
    const { exhibition: _e, ...rest } = ec
    return { ...rest, exhibition_name: exhibitionName }
  })

  const inventoryItems = (inventoryRes.data || []).map((inv) => {
    const product = inv.product as { name: string } | { name: string }[] | null
    const productName = Array.isArray(product)
      ? product[0]?.name || 'Producto'
      : product?.name || 'Producto'
    const { product: _p, ...rest } = inv
    return { ...rest, product_name: productName }
  })

  // 4. Fetch orders
  const { data: orders } = await supabase
    .from('visit_orders')
    .select(`
      id, public_id, order_number, order_status, total_amount, distributor_id,
      payment_method, order_notes, created_at,
      visit_order_items (
        id, product_id, product_variant_id, quantity_ordered, unit_price,
        product:products (name)
      )
    `)
    .eq('visit_id', visitId)
    .is('deleted_at', null)
    .neq('order_status', 'cancelled')
    .order('created_at', { ascending: false })

  // Resolve distributor names
  const distributorIds = [...new Set(
    (orders || []).map(o => o.distributor_id).filter(Boolean) as string[]
  )]

  let distributorNames: Record<string, string> = {}
  if (distributorIds.length > 0) {
    const { data: distributors } = await supabase
      .from('distributors')
      .select('id, name')
      .in('id', distributorIds)

    if (distributors) {
      distributorNames = Object.fromEntries(distributors.map(d => [d.id, d.name]))
    }
  }

  const transformedOrders = (orders || []).map(order => ({
    id: order.id,
    public_id: order.public_id,
    order_number: order.order_number,
    order_status: order.order_status,
    total_amount: order.total_amount,
    distributor_id: order.distributor_id,
    distributor_name: order.distributor_id ? distributorNames[order.distributor_id] || null : null,
    payment_method: order.payment_method,
    order_notes: order.order_notes,
    created_at: order.created_at,
    items: (
      (order.visit_order_items as unknown as Array<{
        id: string
        product_id: string
        product_variant_id: string | null
        quantity_ordered: number
        unit_price: number
        product: { name: string } | { name: string }[] | null
      }>) || []
    ).map(item => {
      const product = item.product
      const productName = Array.isArray(product)
        ? product[0]?.name || 'Producto'
        : product?.name || 'Producto'
      return {
        product_id: item.product_id,
        product_name: productName,
        quantity: item.quantity_ordered,
        unit_price: Number(item.unit_price),
      }
    }),
  }))

  return {
    visit: visit as unknown as VisitDetailData['visit'],
    assessment: {
      stageAssessment: stageAssessmentRes.data || null,
      brandProductAssessments,
      competitorAssessments,
      popMaterialChecks,
      exhibitionChecks,
      inventoryItems,
      evidence: evidenceRes.data || [],
    },
    orders: transformedOrders,
  }
}
