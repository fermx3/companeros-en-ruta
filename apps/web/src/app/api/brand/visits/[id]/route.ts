import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { fetchVisitDetail } from '@/lib/api/visit-detail'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: visitId } = await params
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const auth = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
  if (isBrandAuthError(auth)) return brandAuthErrorResponse(auth)

  const { brandId } = auth

  // Verify visit exists and belongs to this brand
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('id')
    .eq('id', visitId)
    .eq('brand_id', brandId)
    .is('deleted_at', null)
    .single()

  if (visitError || !visit) {
    return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
  }

  try {
    const detail = await fetchVisitDetail(supabase, visit.id)
    return NextResponse.json(detail)
  } catch (err) {
    console.error('Error fetching visit detail:', err)
    return NextResponse.json({ error: 'Error al cargar detalle de visita' }, { status: 500 })
  }
}
