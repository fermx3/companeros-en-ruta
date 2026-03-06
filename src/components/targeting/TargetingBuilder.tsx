'use client'

import React, { useEffect, useState } from 'react'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import type {
  TargetingCriteria,
  ClientTypeCategoryEnum,
  GenderValue,
  AdvisorSpecializationEnum,
  AdvisorExperienceLevelEnum,
} from '@/lib/types/database'
import { TargetingSection } from './TargetingSection'
import { CatalogMultiSelect } from './CatalogMultiSelect'
import { ReachEstimate } from './ReachEstimate'

interface CatalogData {
  zones: Array<{ id: string; code: string; name: string; state?: string }>
  markets: Array<{ id: string; code: string; name: string }>
  client_types: Array<{ id: string; code: string; name: string; category: string }>
  commercial_structures: Array<{ id: string; code: string; name: string }>
  tiers: Array<{ id: string; name: string; level: number }>
  distributors: Array<{ id: string; name: string }>
}

export interface TargetingBuilderProps {
  value: TargetingCriteria
  onChange: (criteria: TargetingCriteria) => void
  brandId: string
  audience?: 'client' | 'staff' | 'all'
  staffRoles?: ('promotor' | 'asesor_de_ventas')[]
  showReachEstimate?: boolean
  className?: string
}

const CATEGORY_OPTIONS: Array<{ value: ClientTypeCategoryEnum; label: string }> = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Mayorista' },
  { value: 'institutional', label: 'Institucional' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Híbrido' },
]

const GENDER_OPTIONS: Array<{ value: GenderValue; label: string }> = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
]

const SPECIALIZATION_OPTIONS: Array<{ value: AdvisorSpecializationEnum; label: string }> = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Mayorista' },
  { value: 'pharma', label: 'Farma' },
  { value: 'food_service', label: 'Food Service' },
  { value: 'convenience', label: 'Conveniencia' },
  { value: 'supermarket', label: 'Supermercado' },
  { value: 'general', label: 'General' },
]

const EXPERIENCE_OPTIONS: Array<{ value: AdvisorExperienceLevelEnum; label: string }> = [
  { value: 'trainee', label: 'Trainee' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'expert', label: 'Experto' },
  { value: 'team_lead', label: 'Líder de Equipo' },
]

function ChipSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: Array<{ value: T; label: string }>
  selected: T[]
  onChange: (values: T[]) => void
}) {
  const toggle = (val: T) => {
    onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val])
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selected.includes(opt.value)
                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function BooleanToggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | undefined
  onChange: (val: boolean | undefined) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-600">{label}</label>
      <div className="flex gap-1">
        {(['any', 'yes', 'no'] as const).map(opt => {
          const isActive =
            (opt === 'any' && value === undefined) ||
            (opt === 'yes' && value === true) ||
            (opt === 'no' && value === false)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt === 'any' ? undefined : opt === 'yes')}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {opt === 'any' ? 'Todos' : opt === 'yes' ? 'Sí' : 'No'}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TargetingBuilder({
  value,
  onChange,
  brandId,
  audience = 'client',
  staffRoles = [],
  showReachEstimate = true,
  className = '',
}: TargetingBuilderProps) {
  const { brandFetch } = useBrandFetch()
  const [catalogs, setCatalogs] = useState<CatalogData | null>(null)
  const [loadingCatalogs, setLoadingCatalogs] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingCatalogs(true)

    brandFetch('/api/brand/targeting/catalogs')
      .then(async (res) => {
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (!cancelled) setCatalogs(data)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingCatalogs(false) })

    return () => { cancelled = true }
  }, [brandFetch, brandId])

  const update = (partial: Partial<TargetingCriteria>) => {
    onChange({ ...value, ...partial })
  }

  const showClient = audience === 'client' || audience === 'all'
  const showStaff = audience === 'staff' || audience === 'all'
  const showPromotor = staffRoles.includes('promotor')
  const showAsesor = staffRoles.includes('asesor_de_ventas')

  // Count active filters per section
  const countArr = (...arrs: (unknown[] | undefined)[]) => arrs.reduce((n, a) => n + (a?.length || 0), 0)
  const countBool = (...vals: (boolean | undefined)[]) => vals.filter(v => v !== undefined).length

  const geoCount = countArr(value.zone_ids, value.market_ids)
  const typeCount = countArr(value.client_type_categories, value.client_type_ids, value.commercial_structure_ids)
  const tierCount = countArr(value.tier_ids)
  const equipCount = countBool(value.has_meat_fridge, value.has_soda_fridge, value.accepts_card)
  const demoCount = countArr(value.gender) + (value.min_age || value.max_age ? 1 : 0)
  const commCount = countBool(value.email_opt_in, value.whatsapp_opt_in)
  const staffZoneCount = countArr(value.staff_zone_ids)
  const specCount = countArr(value.staff_specializations)
  const expCount = countArr(value.staff_experience_levels)
  const distCount = countArr(value.staff_distributor_ids)

  const reachAudience: 'client' | 'staff' | 'both' =
    showClient && showStaff ? 'both' : showStaff ? 'staff' : 'client'

  if (loadingCatalogs) {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        <div className="h-12 bg-gray-100 rounded-lg" />
        <div className="h-12 bg-gray-100 rounded-lg" />
        <div className="h-12 bg-gray-100 rounded-lg" />
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Client sections */}
      {showClient && catalogs && (
        <>
          <TargetingSection title="Geografía" activeCount={geoCount}>
            <div className="space-y-3">
              <CatalogMultiSelect
                label="Zonas"
                items={catalogs.zones}
                selectedIds={value.zone_ids || []}
                onChange={ids => update({ zone_ids: ids.length > 0 ? ids : undefined })}
                placeholder="Todas las zonas"
              />
              <CatalogMultiSelect
                label="Mercados"
                items={catalogs.markets}
                selectedIds={value.market_ids || []}
                onChange={ids => update({ market_ids: ids.length > 0 ? ids : undefined })}
                placeholder="Todos los mercados"
              />
            </div>
          </TargetingSection>

          <TargetingSection title="Tipo de Cliente" activeCount={typeCount}>
            <div className="space-y-3">
              <ChipSelect
                label="Categoría"
                options={CATEGORY_OPTIONS}
                selected={value.client_type_categories || []}
                onChange={vals => update({ client_type_categories: vals.length > 0 ? vals : undefined })}
              />
              <CatalogMultiSelect
                label="Tipo específico"
                items={catalogs.client_types}
                selectedIds={value.client_type_ids || []}
                onChange={ids => update({ client_type_ids: ids.length > 0 ? ids : undefined })}
                placeholder="Todos los tipos"
              />
              <CatalogMultiSelect
                label="Estructura comercial"
                items={catalogs.commercial_structures}
                selectedIds={value.commercial_structure_ids || []}
                onChange={ids => update({ commercial_structure_ids: ids.length > 0 ? ids : undefined })}
                placeholder="Todas las estructuras"
              />
            </div>
          </TargetingSection>

          <TargetingSection title="Nivel de Lealtad" activeCount={tierCount}>
            <CatalogMultiSelect
              label="Niveles (tiers)"
              items={catalogs.tiers}
              selectedIds={value.tier_ids || []}
              onChange={ids => update({ tier_ids: ids.length > 0 ? ids : undefined })}
              placeholder="Todos los niveles"
            />
          </TargetingSection>

          <TargetingSection title="Equipamiento" activeCount={equipCount}>
            <div className="space-y-2">
              <BooleanToggle
                label="Refrigerador de carne"
                value={value.has_meat_fridge}
                onChange={v => update({ has_meat_fridge: v })}
              />
              <BooleanToggle
                label="Refrigerador de refresco"
                value={value.has_soda_fridge}
                onChange={v => update({ has_soda_fridge: v })}
              />
              <BooleanToggle
                label="Acepta tarjeta"
                value={value.accepts_card}
                onChange={v => update({ accepts_card: v })}
              />
            </div>
          </TargetingSection>

          <TargetingSection title="Demografía" activeCount={demoCount}>
            <div className="space-y-3">
              <ChipSelect
                label="Género"
                options={GENDER_OPTIONS}
                selected={value.gender || []}
                onChange={vals => update({ gender: vals.length > 0 ? vals : undefined })}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Edad mínima</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={value.min_age || ''}
                    onChange={e => update({ min_age: e.target.value ? Number(e.target.value) : undefined })}
                    onFocus={e => e.target.select()}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Sin mínimo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Edad máxima</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={value.max_age || ''}
                    onChange={e => update({ max_age: e.target.value ? Number(e.target.value) : undefined })}
                    onFocus={e => e.target.select()}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Sin máximo"
                  />
                </div>
              </div>
            </div>
          </TargetingSection>

          <TargetingSection title="Comunicación" activeCount={commCount}>
            <div className="space-y-2">
              <BooleanToggle
                label="Email opt-in"
                value={value.email_opt_in}
                onChange={v => update({ email_opt_in: v })}
              />
              <BooleanToggle
                label="WhatsApp opt-in"
                value={value.whatsapp_opt_in}
                onChange={v => update({ whatsapp_opt_in: v })}
              />
            </div>
          </TargetingSection>
        </>
      )}

      {/* Staff sections */}
      {showStaff && catalogs && (
        <>
          {showPromotor && (
            <>
              <TargetingSection title="Zona (Staff)" activeCount={staffZoneCount}>
                <CatalogMultiSelect
                  label="Zonas asignadas"
                  items={catalogs.zones}
                  selectedIds={value.staff_zone_ids || []}
                  onChange={ids => update({ staff_zone_ids: ids.length > 0 ? ids : undefined })}
                  placeholder="Todas las zonas"
                />
              </TargetingSection>

              <TargetingSection title="Especialización" activeCount={specCount}>
                <ChipSelect
                  label="Especialización del promotor"
                  options={SPECIALIZATION_OPTIONS}
                  selected={value.staff_specializations || []}
                  onChange={vals => update({ staff_specializations: vals.length > 0 ? vals : undefined })}
                />
              </TargetingSection>

              <TargetingSection title="Nivel de Experiencia" activeCount={expCount}>
                <ChipSelect
                  label="Nivel del promotor"
                  options={EXPERIENCE_OPTIONS}
                  selected={value.staff_experience_levels || []}
                  onChange={vals => update({ staff_experience_levels: vals.length > 0 ? vals : undefined })}
                />
              </TargetingSection>
            </>
          )}

          {showAsesor && (
            <TargetingSection title="Distribuidor" activeCount={distCount}>
              <CatalogMultiSelect
                label="Distribuidor del asesor"
                items={catalogs.distributors}
                selectedIds={value.staff_distributor_ids || []}
                onChange={ids => update({ staff_distributor_ids: ids.length > 0 ? ids : undefined })}
                placeholder="Todos los distribuidores"
              />
            </TargetingSection>
          )}
        </>
      )}

      {/* Reach estimate */}
      {showReachEstimate && (
        <ReachEstimate criteria={value} audience={reachAudience} />
      )}
    </div>
  )
}
