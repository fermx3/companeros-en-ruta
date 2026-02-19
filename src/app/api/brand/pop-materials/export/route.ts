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

    // Get brand-specific materials
    const { data: materials, error } = await supabase
      .from('brand_pop_materials')
      .select('id, public_id, material_name, material_category, is_active, is_system_template, display_order, created_at')
      .or(`brand_id.eq.${brandId},is_system_template.eq.true`)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (error) {
      return Response.json({ error: 'Error al obtener materiales POP' }, { status: 500 })
    }

    const categoryLabels: Record<string, string> = {
      poster: 'Póster',
      exhibidor: 'Exhibidor',
      señalización: 'Señalización',
      colgante: 'Colgante',
      banner: 'Banner',
      otro: 'Otro',
    }

    const headers = [
      'ID', 'Nombre', 'Categoría', 'Activo', 'Tipo', 'Orden',
    ]

    const rows = (materials || []).map(m => [
      m.public_id || '',
      m.material_name || '',
      categoryLabels[m.material_category] || m.material_category || '',
      m.is_active ? 'Sí' : 'No',
      m.is_system_template ? 'Plantilla Sistema' : 'Marca',
      String(m.display_order ?? 0),
    ])

    const csv = buildCsvString(headers, rows)
    return csvResponse(csv, `materiales_pop_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error in GET /api/brand/pop-materials/export:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
