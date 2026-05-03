import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

/**
 * GET /api/brand/zones
 * Lists active zones for the brand's tenant (for dropdowns).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { tenantId } = result

    const { data: zones, error } = await supabase
      .from('zones')
      .select('id, name, code')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name')

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener zonas', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ zones: zones || [] })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
