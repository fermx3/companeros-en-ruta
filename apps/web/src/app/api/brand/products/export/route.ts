import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { buildCsvString, csvResponse, formatCsvCurrency } from '@/lib/utils/csv'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    let query = supabase
      .from('products')
      .select(`
        id, public_id, name, sku, description, barcode,
        base_price, cost, is_active, is_featured,
        include_in_assessment, weight_grams, unit_type, created_at,
        category:product_categories(name)
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    const includeInactive = searchParams.get('include_inactive')
    if (includeInactive !== 'true') {
      query = query.eq('is_active', true)
    }

    const { data: products, error } = await query

    if (error) {
      return Response.json({ error: 'Error al obtener productos' }, { status: 500 })
    }

    const headers = [
      'ID', 'Nombre', 'SKU', 'Código de Barras', 'Categoría',
      'Precio Base', 'Costo', 'Peso (g)', 'Unidad',
      'Activo', 'Destacado', 'En Assessment',
    ]

    const rows = (products || []).map(p => {
      const category = p.category as any

      return [
        p.public_id || '',
        p.name || '',
        p.sku || '',
        p.barcode || '',
        category?.name || '',
        formatCsvCurrency(p.base_price),
        formatCsvCurrency(p.cost),
        p.weight_grams ? String(p.weight_grams) : '',
        p.unit_type || '',
        p.is_active ? 'Sí' : 'No',
        p.is_featured ? 'Sí' : 'No',
        p.include_in_assessment ? 'Sí' : 'No',
      ]
    })

    const csv = buildCsvString(headers, rows)
    return csvResponse(csv, `productos_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error in GET /api/brand/products/export:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
