import type { TargetingCriteria } from '@/lib/types/database'

/**
 * Client profile data needed for targeting evaluation.
 * Fetch these fields from the `clients` table + `client_brand_memberships`.
 */
export interface ClientTargetingProfile {
  zone_id: string | null
  market_id: string | null
  client_type_id: string | null
  commercial_structure_id: string | null
  has_meat_fridge: boolean | null
  has_soda_fridge: boolean | null
  accepts_card: boolean | null
  email_opt_in: boolean | null
  whatsapp_opt_in: boolean | null
  gender: string | null
  date_of_birth: string | null // ISO date
  /** current_tier_id from client_brand_memberships (per-brand) */
  tier_ids: string[]
}

/**
 * Checks whether a client matches the given targeting criteria.
 * Returns true if the client should see the promotion/communication.
 * If criteria is null/undefined, everyone matches (no targeting = broadcast).
 */
export function clientMatchesTargeting(
  criteria: TargetingCriteria | null | undefined,
  client: ClientTargetingProfile
): boolean {
  if (!criteria) return true

  // Geography
  if (criteria.zone_ids?.length && client.zone_id) {
    if (!criteria.zone_ids.includes(client.zone_id)) return false
  } else if (criteria.zone_ids?.length && !client.zone_id) {
    return false
  }

  // Market
  if (criteria.market_ids?.length && client.market_id) {
    if (!criteria.market_ids.includes(client.market_id)) return false
  } else if (criteria.market_ids?.length && !client.market_id) {
    return false
  }

  // Client type
  if (criteria.client_type_ids?.length && client.client_type_id) {
    if (!criteria.client_type_ids.includes(client.client_type_id)) return false
  } else if (criteria.client_type_ids?.length && !client.client_type_id) {
    return false
  }

  // Commercial structure
  if (criteria.commercial_structure_ids?.length && client.commercial_structure_id) {
    if (!criteria.commercial_structure_ids.includes(client.commercial_structure_id)) return false
  } else if (criteria.commercial_structure_ids?.length && !client.commercial_structure_id) {
    return false
  }

  // Tier (any of the client's tier_ids must match)
  if (criteria.tier_ids?.length) {
    if (client.tier_ids.length === 0 || !criteria.tier_ids.some(t => client.tier_ids.includes(t))) {
      return false
    }
  }

  // Boolean filters — only filter when criteria explicitly sets the value
  if (criteria.has_meat_fridge !== undefined && client.has_meat_fridge !== criteria.has_meat_fridge) {
    return false
  }
  if (criteria.has_soda_fridge !== undefined && client.has_soda_fridge !== criteria.has_soda_fridge) {
    return false
  }
  if (criteria.accepts_card !== undefined && client.accepts_card !== criteria.accepts_card) {
    return false
  }
  if (criteria.email_opt_in !== undefined && client.email_opt_in !== criteria.email_opt_in) {
    return false
  }
  if (criteria.whatsapp_opt_in !== undefined && client.whatsapp_opt_in !== criteria.whatsapp_opt_in) {
    return false
  }

  // Gender
  if (criteria.gender?.length && client.gender) {
    if (!criteria.gender.includes(client.gender as any)) return false
  } else if (criteria.gender?.length && !client.gender) {
    return false
  }

  // Age range
  if ((criteria.min_age !== undefined || criteria.max_age !== undefined) && client.date_of_birth) {
    const today = new Date()
    const dob = new Date(client.date_of_birth)
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    if (criteria.min_age !== undefined && age < criteria.min_age) return false
    if (criteria.max_age !== undefined && age > criteria.max_age) return false
  }

  return true
}
