import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { resolveIdColumn } from '@/lib/utils/public-id'

const VALID_SPECIALIZATIONS = [
  'general', 'retail', 'wholesale', 'pharma', 'food_service', 'convenience', 'supermarket'
] as const

const VALID_EXPERIENCE_LEVELS = [
  'trainee', 'junior', 'senior', 'expert', 'team_lead'
] as const

/**
 * GET /api/brand/team/[id]/assignment
 * Fetch the active promotor assignment for a team member.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: memberId } = await params

    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    // Resolve user profile first
    const { data: memberProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq(resolveIdColumn(memberId), memberId)
      .single()

    if (!memberProfile) {
      return NextResponse.json(
        { error: 'Miembro no encontrado' },
        { status: 404 }
      )
    }

    // Verify the member has an active promotor role in this brand
    const { data: memberRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_profile_id', memberProfile.id)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .eq('role', 'promotor')
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()

    if (!memberRole) {
      return NextResponse.json(
        { error: 'Miembro no encontrado o no tiene rol de promotor activo en esta marca' },
        { status: 404 }
      )
    }

    const { data: assignment, error } = await supabase
      .from('promotor_assignments')
      .select('id, zone_id, specialization, experience_level, monthly_quota, performance_rating')
      .eq('user_profile_id', memberProfile.id)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener asignación', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ assignment: assignment || null })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/brand/team/[id]/assignment
 * Create or update the promotor assignment for a team member.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: memberId } = await params

    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId, userProfileId } = result

    // Resolve user profile first
    const { data: memberProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq(resolveIdColumn(memberId), memberId)
      .single()

    if (!memberProfile) {
      return NextResponse.json(
        { error: 'Miembro no encontrado' },
        { status: 404 }
      )
    }

    // Verify the member has an active promotor role in this brand
    const { data: memberRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_profile_id', memberProfile.id)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .eq('role', 'promotor')
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()

    if (!memberRole) {
      return NextResponse.json(
        { error: 'Miembro no encontrado o no tiene rol de promotor activo en esta marca' },
        { status: 404 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const { zone_id, specialization, experience_level, monthly_quota } = body

    if (!specialization || !VALID_SPECIALIZATIONS.includes(specialization)) {
      return NextResponse.json(
        { error: `Especialización inválida. Valores permitidos: ${VALID_SPECIALIZATIONS.join(', ')}` },
        { status: 400 }
      )
    }

    if (!experience_level || !VALID_EXPERIENCE_LEVELS.includes(experience_level)) {
      return NextResponse.json(
        { error: `Nivel de experiencia inválido. Valores permitidos: ${VALID_EXPERIENCE_LEVELS.join(', ')}` },
        { status: 400 }
      )
    }

    if (monthly_quota !== undefined && monthly_quota !== null) {
      if (typeof monthly_quota !== 'number' || monthly_quota < 0) {
        return NextResponse.json(
          { error: 'La cuota mensual debe ser un número positivo' },
          { status: 400 }
        )
      }
    }

    // If zone_id provided, verify it belongs to the tenant
    if (zone_id) {
      const { data: zone } = await supabase
        .from('zones')
        .select('id')
        .eq('id', zone_id)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle()

      if (!zone) {
        return NextResponse.json({ error: 'Zona no encontrada o inactiva' }, { status: 400 })
      }
    }

    // Check if an active assignment already exists
    const { data: existing } = await supabase
      .from('promotor_assignments')
      .select('id')
      .eq('user_profile_id', memberProfile.id)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()

    const updateFields = {
      zone_id: zone_id || null,
      specialization,
      experience_level,
      monthly_quota: monthly_quota ?? 0,
      updated_at: new Date().toISOString(),
    }

    let assignment
    let error

    if (existing) {
      // Update existing assignment
      const result = await supabase
        .from('promotor_assignments')
        .update(updateFields)
        .eq('id', existing.id)
        .select('id, zone_id, specialization, experience_level, monthly_quota, performance_rating')
        .single()

      assignment = result.data
      error = result.error
    } else {
      // Insert new assignment
      const result = await supabase
        .from('promotor_assignments')
        .insert({
          user_profile_id: memberProfile.id,
          tenant_id: tenantId,
          assigned_by: userProfileId,
          ...updateFields,
        })
        .select('id, zone_id, specialization, experience_level, monthly_quota, performance_rating')
        .single()

      assignment = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json(
        { error: 'Error al guardar asignación', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
