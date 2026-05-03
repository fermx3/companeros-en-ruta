import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TargetingCriteria } from '@/lib/types/database'
import { clientMatchesTargeting } from '@/lib/utils/targeting'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    // Resolve tenant — staff users have user_profiles, client users may only have clients
    let tenantId: string
    let profileId: string | null = null

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (userProfile) {
      tenantId = userProfile.tenant_id
      profileId = userProfile.id
    } else {
      // Client user without user_profile — resolve tenant from clients table
      const { data: clientRow } = await supabase
        .from('clients')
        .select('id, tenant_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .single()

      if (!clientRow) {
        return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
      }
      tenantId = clientRow.tenant_id
    }

    // Determine user's role for survey targeting
    const userTargetRoles: string[] = []

    if (profileId) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_profile_id', profileId)
        .eq('status', 'active')
        .is('deleted_at', null)

      const roleMap: Record<string, string> = {
        promotor: 'promotor',
        asesor_de_ventas: 'asesor_de_ventas'
      }

      for (const r of userRoles || []) {
        const mapped = roleMap[r.role]
        if (mapped) userTargetRoles.push(mapped)
      }
    }

    // Check if user is a client (with targeting fields)
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, zone_id, market_id, client_type_id, commercial_structure_id, has_meat_fridge, has_soda_fridge, accepts_card, email_opt_in, whatsapp_opt_in, gender, date_of_birth')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)

    const clientRow = clientData?.[0] ?? null

    if (clientRow) {
      userTargetRoles.push('client')
    }

    if (userTargetRoles.length === 0) {
      return NextResponse.json({ surveys: [] })
    }

    // Get active surveys that target the user's role(s)
    const today = new Date().toISOString().split('T')[0]

    const { data: surveys, error: surveyError } = await supabase
      .from('surveys')
      .select(`
        id,
        public_id,
        title,
        description,
        survey_status,
        target_roles,
        targeting_criteria,
        brand_id,
        start_date,
        end_date,
        max_responses_per_user,
        brands(name, logo_url)
      `)
      .eq('tenant_id', tenantId)
      .eq('survey_status', 'active')
      .is('deleted_at', null)
      .lte('start_date', today)
      .gte('end_date', today)
      .overlaps('target_roles', userTargetRoles)
      .order('created_at', { ascending: false })

    if (surveyError) {
      throw new Error(`Error al obtener encuestas: ${surveyError.message}`)
    }

    // Apply staff targeting filters from targeting_criteria JSONB
    // Fetch staff context once if any surveys have staff targeting
    let staffZoneId: string | null = null
    let staffSpecialization: string | null = null
    let staffExperienceLevel: string | null = null
    let staffDistributorId: string | null = null

    const hasStaffTargeting = (surveys || []).some(s => {
      const tc = s.targeting_criteria as TargetingCriteria | null
      return tc && (
        (tc.staff_zone_ids?.length ?? 0) > 0 ||
        (tc.staff_specializations?.length ?? 0) > 0 ||
        (tc.staff_experience_levels?.length ?? 0) > 0 ||
        (tc.staff_distributor_ids?.length ?? 0) > 0
      )
    })

    if (hasStaffTargeting && profileId) {
      // Fetch promotor assignment
      // promotor_assignments table not in generated Supabase types yet
      const { data: assignment } = await (supabase as any)
        .from('promotor_assignments')
        .select('zone_id, specialization, experience_level')
        .eq('user_profile_id', profileId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle() as { data: { zone_id: string | null; specialization: string; experience_level: string } | null }

      if (assignment) {
        staffZoneId = assignment.zone_id
        staffSpecialization = assignment.specialization
        staffExperienceLevel = assignment.experience_level
      }

      // Fetch distributor_id for asesor
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('distributor_id')
        .eq('id', profileId)
        .single()

      if (profile) {
        staffDistributorId = profile.distributor_id || null
      }
    }

    // Fetch client tier_ids for client targeting (if user is a client)
    let clientTierIds: string[] = []
    if (clientRow) {
      const { data: membershipTiers } = await supabase
        .from('client_brand_memberships')
        .select('current_tier_id')
        .eq('client_id', clientRow.id)
        .eq('membership_status', 'active')
        .is('deleted_at', null)

      clientTierIds = (membershipTiers || [])
        .map(m => m.current_tier_id)
        .filter((t): t is string => t != null)
    }

    // Filter out surveys where user doesn't match targeting criteria
    const filteredSurveys = (surveys || []).filter(survey => {
      const tc = survey.targeting_criteria as TargetingCriteria | null
      if (!tc) return true // No targeting criteria = everyone matches

      // --- Client targeting (applies when user is a client) ---
      if (userTargetRoles.includes('client') && clientRow) {
        const hasClientCriteria =
          (tc.zone_ids?.length ?? 0) > 0 ||
          (tc.market_ids?.length ?? 0) > 0 ||
          (tc.client_type_ids?.length ?? 0) > 0 ||
          (tc.commercial_structure_ids?.length ?? 0) > 0 ||
          (tc.tier_ids?.length ?? 0) > 0 ||
          tc.has_meat_fridge !== undefined ||
          tc.has_soda_fridge !== undefined ||
          tc.accepts_card !== undefined ||
          tc.email_opt_in !== undefined ||
          tc.whatsapp_opt_in !== undefined ||
          (tc.gender?.length ?? 0) > 0 ||
          tc.min_age !== undefined ||
          tc.max_age !== undefined

        if (hasClientCriteria) {
          if (!clientMatchesTargeting(tc, {
            zone_id: clientRow.zone_id,
            market_id: clientRow.market_id,
            client_type_id: clientRow.client_type_id,
            commercial_structure_id: clientRow.commercial_structure_id,
            has_meat_fridge: clientRow.has_meat_fridge,
            has_soda_fridge: clientRow.has_soda_fridge,
            accepts_card: clientRow.accepts_card,
            email_opt_in: clientRow.email_opt_in,
            whatsapp_opt_in: clientRow.whatsapp_opt_in,
            gender: clientRow.gender,
            date_of_birth: clientRow.date_of_birth,
            tier_ids: clientTierIds,
          })) {
            return false
          }
        }
      }

      // --- Staff targeting ---
      // Staff zone filter
      if (tc.staff_zone_ids?.length && staffZoneId) {
        if (!tc.staff_zone_ids.includes(staffZoneId)) return false
      } else if (tc.staff_zone_ids?.length && !staffZoneId) {
        if (userTargetRoles.includes('promotor') && !userTargetRoles.includes('client')) return false
      }

      // Staff specialization filter
      if (tc.staff_specializations?.length && staffSpecialization) {
        if (!tc.staff_specializations.includes(staffSpecialization as any)) return false
      } else if (tc.staff_specializations?.length && !staffSpecialization) {
        if (userTargetRoles.includes('promotor') && !userTargetRoles.includes('client')) return false
      }

      // Staff experience level filter
      if (tc.staff_experience_levels?.length && staffExperienceLevel) {
        if (!tc.staff_experience_levels.includes(staffExperienceLevel as any)) return false
      } else if (tc.staff_experience_levels?.length && !staffExperienceLevel) {
        if (userTargetRoles.includes('promotor') && !userTargetRoles.includes('client')) return false
      }

      // Staff distributor filter
      if (tc.staff_distributor_ids?.length && staffDistributorId) {
        if (!tc.staff_distributor_ids.includes(staffDistributorId)) return false
      } else if (tc.staff_distributor_ids?.length && !staffDistributorId) {
        if (userTargetRoles.includes('asesor_de_ventas') && !userTargetRoles.includes('client')) return false
      }

      return true
    })

    // Check which surveys the user has already responded to
    const surveyIds = filteredSurveys.map(s => s.id)
    let respondedSurveys: Set<string> = new Set()

    if (surveyIds.length > 0 && profileId) {
      const { data: responses } = await supabase
        .from('survey_responses')
        .select('survey_id')
        .eq('respondent_id', profileId)
        .in('survey_id', surveyIds)

      respondedSurveys = new Set((responses || []).map(r => r.survey_id))
    }

    const surveysWithStatus = filteredSurveys.map(({ targeting_criteria, brand_id, ...survey }) => ({
      ...survey,
      has_responded: respondedSurveys.has(survey.id)
    }))

    return NextResponse.json({ surveys: surveysWithStatus })

  } catch (error) {
    console.error('Error en GET /api/surveys:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
