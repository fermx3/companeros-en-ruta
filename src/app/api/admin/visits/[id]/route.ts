import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveAdminAuth, isAdminAuthError, adminAuthErrorResponse } from '@/lib/api/admin-auth'
import { fetchVisitDetail } from '@/lib/api/visit-detail'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id: visitId } = await params
  const supabase = await createClient()

  const auth = await resolveAdminAuth(supabase)
  if (isAdminAuthError(auth)) return adminAuthErrorResponse(auth)

  // Verify visit exists (RLS handles tenant scoping)
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('id')
    .eq('id', visitId)
    .is('deleted_at', null)
    .single()

  if (visitError || !visit) {
    return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
  }

  try {
    const detail = await fetchVisitDetail(supabase, visit.id)
    return NextResponse.json(detail)
  } catch {
    return NextResponse.json({ error: 'Error al cargar detalle de visita' }, { status: 500 })
  }
}
