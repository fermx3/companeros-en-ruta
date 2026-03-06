import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'
import type { TargetingCriteria } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId, tenantId } = result

    const body = await request.json()
    const { criteria, audience = 'client' } = body as {
      criteria: TargetingCriteria
      audience: 'client' | 'staff' | 'both'
    }

    const response: Record<string, { total: number; matching: number }> = {}

    // --- Client reach ---
    if (audience === 'client' || audience === 'both') {
      // Total active clients with brand membership
      const { count: totalClients } = await supabase
        .from('client_brand_memberships')
        .select('*, clients!inner(id)', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .eq('membership_status', 'active')
        .eq('clients.status', 'active')

      // Build matching query
      let matchQuery = supabase
        .from('client_brand_memberships')
        .select('*, clients!inner(id)', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .eq('membership_status', 'active')
        .eq('clients.status', 'active')

      // Apply filters
      if (criteria.zone_ids?.length) {
        matchQuery = matchQuery.in('clients.zone_id', criteria.zone_ids)
      }
      if (criteria.market_ids?.length) {
        matchQuery = matchQuery.in('clients.market_id', criteria.market_ids)
      }
      if (criteria.client_type_ids?.length) {
        matchQuery = matchQuery.in('clients.client_type_id', criteria.client_type_ids)
      }
      if (criteria.commercial_structure_ids?.length) {
        matchQuery = matchQuery.in('clients.commercial_structure_id', criteria.commercial_structure_ids)
      }
      if (criteria.tier_ids?.length) {
        matchQuery = matchQuery.in('current_tier_id', criteria.tier_ids)
      }

      // Boolean filters
      if (criteria.has_meat_fridge !== undefined) {
        matchQuery = matchQuery.eq('clients.has_meat_fridge', criteria.has_meat_fridge)
      }
      if (criteria.has_soda_fridge !== undefined) {
        matchQuery = matchQuery.eq('clients.has_soda_fridge', criteria.has_soda_fridge)
      }
      if (criteria.accepts_card !== undefined) {
        matchQuery = matchQuery.eq('clients.accepts_card', criteria.accepts_card)
      }
      if (criteria.email_opt_in !== undefined) {
        matchQuery = matchQuery.eq('clients.email_opt_in', criteria.email_opt_in)
      }
      if (criteria.whatsapp_opt_in !== undefined) {
        matchQuery = matchQuery.eq('clients.whatsapp_opt_in', criteria.whatsapp_opt_in)
      }

      // Gender filter
      if (criteria.gender?.length) {
        matchQuery = matchQuery.in('clients.gender', criteria.gender)
      }

      const { count: matchingClients } = await matchQuery

      response.clients = {
        total: totalClients || 0,
        matching: matchingClients || 0,
      }
    }

    // --- Staff reach ---
    if (audience === 'staff' || audience === 'both') {
      // Total active staff (promotores + asesores)
      const { count: totalStaff } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .in('role', ['promotor', 'asesor_de_ventas'])
        .eq('status', 'active')
        .is('deleted_at', null)

      // For staff matching, we need separate counts for promotor and asesor
      // since they use different tables for filtering
      let matchingStaff = 0
      const hasStaffFilters =
        (criteria.staff_zone_ids?.length ?? 0) > 0 ||
        (criteria.staff_specializations?.length ?? 0) > 0 ||
        (criteria.staff_experience_levels?.length ?? 0) > 0 ||
        (criteria.staff_distributor_ids?.length ?? 0) > 0

      if (!hasStaffFilters) {
        // No staff filters — all staff match
        matchingStaff = totalStaff || 0
      } else {
        // Count matching promotores via promotor_assignments
        const hasPromotorFilters =
          (criteria.staff_zone_ids?.length ?? 0) > 0 ||
          (criteria.staff_specializations?.length ?? 0) > 0 ||
          (criteria.staff_experience_levels?.length ?? 0) > 0

        if (hasPromotorFilters) {
          // promotor_assignments table not in generated Supabase types yet
          let promotorQuery = (supabase as any)
            .from('promotor_assignments')
            .select('user_profile_id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .is('deleted_at', null)

          if (criteria.staff_zone_ids?.length) {
            promotorQuery = promotorQuery.in('zone_id', criteria.staff_zone_ids)
          }
          if (criteria.staff_specializations?.length) {
            promotorQuery = promotorQuery.in('specialization', criteria.staff_specializations)
          }
          if (criteria.staff_experience_levels?.length) {
            promotorQuery = promotorQuery.in('experience_level', criteria.staff_experience_levels)
          }

          const { count: promotorCount } = await promotorQuery as { count: number | null }
          matchingStaff += promotorCount || 0
        }

        // Count matching asesores via distributor_id on user_profiles
        if (criteria.staff_distributor_ids?.length) {
          const { count: asesorCount } = await supabase
            .from('user_roles')
            .select('*, user_profiles!inner(distributor_id)', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('role', 'asesor_de_ventas')
            .eq('status', 'active')
            .is('deleted_at', null)
            .in('user_profiles.distributor_id', criteria.staff_distributor_ids)

          matchingStaff += asesorCount || 0
        }
      }

      response.staff = {
        total: totalStaff || 0,
        matching: matchingStaff,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in POST /api/brand/targeting/reach:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
