import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { buildCsvString, csvResponse } from '@/lib/utils/csv'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    const { data: competitors, error } = await supabase
      .from('brand_competitors')
      .select(`
        id, public_id, competitor_name, is_active, display_order, created_at,
        products:brand_competitor_products(
          product_name, is_active
        )
      `)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (error) {
      return Response.json({ error: 'Error al obtener competidores' }, { status: 500 })
    }

    const headers = [
      'ID', 'Nombre', 'Activo', 'Productos', 'Productos Activos', 'Orden',
    ]

    const rows = (competitors || []).map(c => {
      const products = Array.isArray(c.products) ? c.products : []
      const activeProducts = products.filter((p: any) => p.is_active !== false)

      return [
        c.public_id || '',
        c.competitor_name || '',
        c.is_active ? 'Sí' : 'No',
        String(products.length),
        String(activeProducts.length),
        String(c.display_order ?? 0),
      ]
    })

    const csv = buildCsvString(headers, rows)
    return csvResponse(csv, `competidores_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error in GET /api/brand/competitors/export:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
