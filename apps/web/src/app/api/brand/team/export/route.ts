import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import { buildCsvString, csvResponse, formatCsvDate } from '@/lib/utils/csv'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    // Get team members with brand roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        role, status, is_primary,
        user_profile:user_profiles(
          id, public_id, first_name, last_name, email, phone, status, created_at
        )
      `)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .in('role', ['brand_manager', 'promotor', 'supervisor', 'asesor_de_ventas'])

    if (rolesError) {
      return Response.json({ error: 'Error al obtener equipo' }, { status: 500 })
    }

    const roleFilter = searchParams.get('role')
    const statusFilter = searchParams.get('status')

    const roleLabels: Record<string, string> = {
      brand_manager: 'Brand Manager',
      promotor: 'Promotor',
      supervisor: 'Supervisor',
      asesor_de_ventas: 'Asesor de Ventas',
    }

    const headers = [
      'ID', 'Nombre', 'Apellido', 'Email', 'Teléfono',
      'Rol', 'Estado Rol', 'Estado Usuario', 'Principal', 'Fecha Alta',
    ]

    let rows = (roles || []).map(r => {
      const profile = r.user_profile as any

      return {
        role: r.role,
        profileStatus: profile?.status,
        row: [
          profile?.public_id || '',
          profile?.first_name || '',
          profile?.last_name || '',
          profile?.email || '',
          profile?.phone || '',
          roleLabels[r.role] || r.role,
          r.status || '',
          profile?.status || '',
          r.is_primary ? 'Sí' : 'No',
          formatCsvDate(profile?.created_at),
        ],
      }
    })

    if (roleFilter && roleFilter !== 'all') {
      rows = rows.filter(r => r.role === roleFilter)
    }
    if (statusFilter && statusFilter !== 'all') {
      rows = rows.filter(r => r.profileStatus === statusFilter)
    }

    const search = searchParams.get('search')
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(r =>
        r.row[1].toLowerCase().includes(s) ||
        r.row[2].toLowerCase().includes(s) ||
        r.row[3].toLowerCase().includes(s)
      )
    }

    const csv = buildCsvString(headers, rows.map(r => r.row))
    return csvResponse(csv, `equipo_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error in GET /api/brand/team/export:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
