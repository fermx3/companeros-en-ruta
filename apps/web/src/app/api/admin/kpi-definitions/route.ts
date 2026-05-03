import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Admin CRUD for KPI definitions
 * GET — list all KPI definitions for the tenant
 * POST — create a new KPI definition
 * PATCH — update an existing KPI definition (id in body)
 * DELETE — deactivate a KPI definition (id in body)
 */

async function resolveAdminAuth(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Usuario no autenticado', status: 401 }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!profile) return { error: 'Perfil no encontrado', status: 404 }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role, status')
    .eq('user_profile_id', profile.id)

  const isAdmin = roles?.some((r: any) => r.status === 'active' && r.role === 'admin')
  if (!isAdmin) return { error: 'Acceso no autorizado', status: 403 }

  return { user, tenantId: profile.tenant_id }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await resolveAdminAuth(supabase)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data, error } = await supabase
      .from('kpi_definitions')
      .select('*')
      .eq('tenant_id', auth.tenantId)
      .order('display_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ definitions: data || [] })
  } catch (error) {
    console.error('Error in GET /api/admin/kpi-definitions:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await resolveAdminAuth(supabase)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { slug, label, description, icon, color, computation_type } = body

    if (!slug || !label || !computation_type) {
      return NextResponse.json({ error: 'slug, label y computation_type son requeridos' }, { status: 400 })
    }

    // Check slug uniqueness within tenant
    const { data: existing } = await supabase
      .from('kpi_definitions')
      .select('id')
      .eq('tenant_id', auth.tenantId)
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: `El slug "${slug}" ya existe` }, { status: 409 })
    }

    // Get next display order
    const { data: lastDef } = await supabase
      .from('kpi_definitions')
      .select('display_order')
      .eq('tenant_id', auth.tenantId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (lastDef?.display_order || 0) + 1

    const { data, error } = await supabase
      .from('kpi_definitions')
      .insert({
        tenant_id: auth.tenantId,
        slug,
        label,
        description: description || null,
        icon: icon || null,
        color: color || null,
        computation_type,
        is_active: true,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ definition: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/kpi-definitions:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await resolveAdminAuth(supabase)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'id es requerido' }, { status: 400 })

    // Only allow specific fields
    const allowed: Record<string, any> = {}
    if (updates.label !== undefined) allowed.label = updates.label
    if (updates.description !== undefined) allowed.description = updates.description
    if (updates.icon !== undefined) allowed.icon = updates.icon
    if (updates.color !== undefined) allowed.color = updates.color
    if (updates.is_active !== undefined) allowed.is_active = updates.is_active
    if (updates.display_order !== undefined) allowed.display_order = updates.display_order
    allowed.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('kpi_definitions')
      .update(allowed)
      .eq('id', id)
      .eq('tenant_id', auth.tenantId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ definition: data })
  } catch (error) {
    console.error('Error in PATCH /api/admin/kpi-definitions:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await resolveAdminAuth(supabase)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'id es requerido' }, { status: 400 })

    // Soft deactivate rather than delete
    const { error } = await supabase
      .from('kpi_definitions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', auth.tenantId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/kpi-definitions:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
