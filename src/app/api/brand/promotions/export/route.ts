import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { buildCsvString, csvResponse, formatCsvDate, formatCsvCurrency } from '@/lib/utils/csv'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    let query = supabase
      .from('promotions')
      .select(`
        id, public_id, name, description, promotion_type, status,
        start_date, end_date, discount_percentage, discount_amount,
        buy_quantity, get_quantity, points_multiplier,
        usage_limit_total, usage_count_total,
        budget_allocated, budget_spent, created_at
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    const status = searchParams.get('status')
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: promotions, error } = await query

    if (error) {
      return Response.json({ error: 'Error al obtener promociones' }, { status: 500 })
    }

    const typeLabels: Record<string, string> = {
      percentage_discount: 'Descuento %',
      fixed_discount: 'Descuento Fijo',
      buy_x_get_y: 'Compra X Lleva Y',
      points_multiplier: 'Multiplicador Puntos',
      free_product: 'Producto Gratis',
    }

    const statusLabels: Record<string, string> = {
      draft: 'Borrador',
      pending_approval: 'Pendiente',
      approved: 'Aprobada',
      active: 'Activa',
      paused: 'Pausada',
      expired: 'Expirada',
      cancelled: 'Cancelada',
    }

    const headers = [
      'ID', 'Nombre', 'Tipo', 'Estado', 'Valor',
      'Inicio', 'Fin', 'Presupuesto', 'Gastado',
      'Usos Totales', 'Límite Usos', 'Creada',
    ]

    function getPromotionValue(p: any): string {
      if (p.discount_percentage) return `${p.discount_percentage}%`
      if (p.discount_amount) return formatCsvCurrency(p.discount_amount)
      if (p.buy_quantity && p.get_quantity) return `${p.buy_quantity}x${p.get_quantity}`
      if (p.points_multiplier && p.points_multiplier !== 1) return `${p.points_multiplier}x puntos`
      return ''
    }

    let rows = (promotions || []).map(p => [
      p.public_id || '',
      p.name || '',
      typeLabels[p.promotion_type] || p.promotion_type || '',
      statusLabels[p.status] || p.status || '',
      getPromotionValue(p),
      formatCsvDate(p.start_date),
      formatCsvDate(p.end_date),
      formatCsvCurrency(p.budget_allocated),
      formatCsvCurrency(p.budget_spent),
      String(p.usage_count_total ?? 0),
      p.usage_limit_total ? String(p.usage_limit_total) : 'Sin límite',
      formatCsvDate(p.created_at),
    ])

    const search = searchParams.get('search')
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(row =>
        row[1].toLowerCase().includes(s) || row[0].toLowerCase().includes(s)
      )
    }

    const csv = buildCsvString(headers, rows)
    return csvResponse(csv, `promociones_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error in GET /api/brand/promotions/export:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
