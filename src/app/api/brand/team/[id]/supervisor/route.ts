import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'

/**
 * PUT /api/brand/team/[id]/supervisor
 * Assigns a supervisor (manager_id) to a team member.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: memberId } = await params

    // 1. Resolve brand auth (brand_manager required)
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    // 2. Parse body
    const body = await request.json()
    const { supervisor_id } = body

    if (!supervisor_id) {
      return NextResponse.json({ error: 'supervisor_id es requerido' }, { status: 400 })
    }

    // 2b. Resolve user profile first
    const { data: memberProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq(resolveIdColumn(memberId), memberId)
      .single()

    if (!memberProfile) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
    }

    // 3. Verify the member has an active role in this brand
    const { data: memberRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_profile_id', memberProfile.id)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()

    if (!memberRole) {
      return NextResponse.json({ error: 'Miembro no encontrado en tu marca' }, { status: 404 })
    }

    // 4. Verify the supervisor has an active supervisor role in this brand
    const { data: supervisorRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_profile_id', supervisor_id)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .eq('role', 'supervisor')
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()

    if (!supervisorRole) {
      return NextResponse.json({ error: 'Supervisor no encontrado o no tiene rol de supervisor activo en esta marca' }, { status: 400 })
    }

    // 5. Prevent self-assignment (DB constraint also prevents this)
    if (memberProfile.id === supervisor_id) {
      return NextResponse.json({ error: 'Un usuario no puede ser su propio supervisor' }, { status: 400 })
    }

    // 6. Update manager_id
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ manager_id: supervisor_id, updated_at: new Date().toISOString() })
      .eq('id', memberProfile.id)
      .eq('tenant_id', tenantId)

    if (updateError) {
      return NextResponse.json(
        { error: `Error al asignar supervisor: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Supervisor asignado exitosamente' })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/brand/team/[id]/supervisor
 * Removes supervisor assignment (sets manager_id to null).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: memberId } = await params

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    // 2. Resolve user profile first
    const { data: memberProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq(resolveIdColumn(memberId), memberId)
      .single()

    if (!memberProfile) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
    }

    // 2b. Verify the member has an active role in this brand
    const { data: memberRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_profile_id', memberProfile.id)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()

    if (!memberRole) {
      return NextResponse.json({ error: 'Miembro no encontrado en tu marca' }, { status: 404 })
    }

    // 3. Remove manager_id
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ manager_id: null, updated_at: new Date().toISOString() })
      .eq('id', memberProfile.id)
      .eq('tenant_id', tenantId)

    if (updateError) {
      return NextResponse.json(
        { error: `Error al quitar supervisor: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Supervisor removido exitosamente' })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
