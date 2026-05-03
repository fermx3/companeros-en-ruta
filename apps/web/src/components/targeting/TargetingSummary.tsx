'use client'

import React from 'react'
import type { TargetingCriteria } from '@/lib/types/database'

interface CatalogItem {
  id: string
  name: string
}

interface TargetingSummaryProps {
  criteria: TargetingCriteria
  /** Optional catalogs to resolve IDs to names */
  catalogs?: {
    zones?: CatalogItem[]
    markets?: CatalogItem[]
    client_types?: CatalogItem[]
    commercial_structures?: CatalogItem[]
    tiers?: CatalogItem[]
    distributors?: CatalogItem[]
  }
  className?: string
}

const SPECIALIZATION_LABELS: Record<string, string> = {
  retail: 'Retail',
  wholesale: 'Mayorista',
  pharma: 'Farma',
  food_service: 'Food Service',
  convenience: 'Conveniencia',
  supermarket: 'Supermercado',
  general: 'General',
}

const EXPERIENCE_LABELS: Record<string, string> = {
  trainee: 'Trainee',
  junior: 'Junior',
  senior: 'Senior',
  expert: 'Experto',
  team_lead: 'Líder de Equipo',
}

const GENDER_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
  prefiero_no_decir: 'Prefiero no decir',
}

const CATEGORY_LABELS: Record<string, string> = {
  retail: 'Retail',
  wholesale: 'Mayorista',
  institutional: 'Institucional',
  online: 'Online',
  hybrid: 'Híbrido',
}

function resolveNames(ids: string[] | undefined, catalog?: CatalogItem[]): string[] {
  if (!ids?.length) return []
  if (!catalog) return ids.map(() => '(ID)')
  return ids.map(id => catalog.find(c => c.id === id)?.name || id.slice(0, 8))
}

function BadgeGroup({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex flex-wrap gap-1 mt-0.5">
        {values.map((v, i) => (
          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}

function BooleanBadge({ label, value }: { label: string; value?: boolean }) {
  if (value === undefined) return null
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {label}: {value ? 'Sí' : 'No'}
    </span>
  )
}

export function TargetingSummary({ criteria, catalogs, className = '' }: TargetingSummaryProps) {
  const hasAnyFilter = Object.values(criteria).some(v => {
    if (v === undefined || v === null) return false
    if (Array.isArray(v)) return v.length > 0
    return true
  })

  if (!hasAnyFilter) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Sin filtros de segmentación (todos los usuarios)
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Client criteria */}
      <BadgeGroup
        label="Zonas"
        values={resolveNames(criteria.zone_ids, catalogs?.zones)}
      />
      <BadgeGroup
        label="Mercados"
        values={resolveNames(criteria.market_ids, catalogs?.markets)}
      />
      <BadgeGroup
        label="Tipos de cliente"
        values={resolveNames(criteria.client_type_ids, catalogs?.client_types)}
      />
      <BadgeGroup
        label="Categorías de cliente"
        values={(criteria.client_type_categories || []).map(c => CATEGORY_LABELS[c] || c)}
      />
      <BadgeGroup
        label="Estructura comercial"
        values={resolveNames(criteria.commercial_structure_ids, catalogs?.commercial_structures)}
      />
      <BadgeGroup
        label="Nivel de lealtad"
        values={resolveNames(criteria.tier_ids, catalogs?.tiers)}
      />
      <BadgeGroup
        label="Género"
        values={(criteria.gender || []).map(g => GENDER_LABELS[g] || g)}
      />

      {/* Boolean filters */}
      {(criteria.has_meat_fridge !== undefined || criteria.has_soda_fridge !== undefined ||
        criteria.accepts_card !== undefined || criteria.email_opt_in !== undefined ||
        criteria.whatsapp_opt_in !== undefined) && (
        <div>
          <span className="text-xs text-gray-500">Filtros</span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            <BooleanBadge label="Refrigerador carne" value={criteria.has_meat_fridge} />
            <BooleanBadge label="Refrigerador refresco" value={criteria.has_soda_fridge} />
            <BooleanBadge label="Acepta tarjeta" value={criteria.accepts_card} />
            <BooleanBadge label="Email opt-in" value={criteria.email_opt_in} />
            <BooleanBadge label="WhatsApp opt-in" value={criteria.whatsapp_opt_in} />
          </div>
        </div>
      )}

      {/* Age range */}
      {(criteria.min_age || criteria.max_age) && (
        <div>
          <span className="text-xs text-gray-500">Edad</span>
          <span className="text-xs text-gray-700 ml-2">
            {criteria.min_age && `Desde ${criteria.min_age}`}
            {criteria.min_age && criteria.max_age && ' - '}
            {criteria.max_age && `Hasta ${criteria.max_age}`}
          </span>
        </div>
      )}

      {/* Staff criteria */}
      <BadgeGroup
        label="Zonas (staff)"
        values={resolveNames(criteria.staff_zone_ids, catalogs?.zones)}
      />
      <BadgeGroup
        label="Especialización (staff)"
        values={(criteria.staff_specializations || []).map(s => SPECIALIZATION_LABELS[s] || s)}
      />
      <BadgeGroup
        label="Nivel de experiencia (staff)"
        values={(criteria.staff_experience_levels || []).map(e => EXPERIENCE_LABELS[e] || e)}
      />
      <BadgeGroup
        label="Distribuidor (staff)"
        values={resolveNames(criteria.staff_distributor_ids, catalogs?.distributors)}
      />
    </div>
  )
}
