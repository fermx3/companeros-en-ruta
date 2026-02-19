'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useBrandFetch } from '@/hooks/useBrandFetch'

export interface ExportFilters {
  client_status?: string[]
  client_type_ids?: string[]
  market_ids?: string[]
  commercial_structure_ids?: string[]
  zone_ids?: string[]
  states?: string[]
  cities?: string[]
  postal_codes?: string[]
  membership_status?: string[]
  tier_ids?: string[]
  points_balance_min?: number
  points_balance_max?: number
  points_lifetime_min?: number
  points_lifetime_max?: number
  registration_date_from?: string
  registration_date_to?: string
  last_visit_from?: string
  last_visit_to?: string
  last_purchase_from?: string
  last_purchase_to?: string
  data_period_from?: string
  data_period_to?: string
  promotor_ids?: string[]
  assignment_types?: string[]
}

interface FilterOption {
  id: string
  name: string
}

interface SegmentationFiltersProps {
  filters: ExportFilters
  onChange: (filters: ExportFilters) => void
}

export function SegmentationFilters({ filters, onChange }: SegmentationFiltersProps) {
  const { brandFetch } = useBrandFetch()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [filterOptions, setFilterOptions] = useState<{
    zones: FilterOption[]
    tiers: FilterOption[]
    clientTypes: FilterOption[]
    markets: FilterOption[]
    commercialStructures: FilterOption[]
    promotors: FilterOption[]
  }>({
    zones: [], tiers: [], clientTypes: [], markets: [],
    commercialStructures: [], promotors: [],
  })

  const loadFilterOptions = useCallback(async () => {
    try {
      // Load all filter options in parallel
      const [zonesRes, tiersRes] = await Promise.all([
        brandFetch('/api/brand/exports/filter-options?type=zones'),
        brandFetch('/api/brand/exports/filter-options?type=tiers'),
      ])

      // These endpoints may not exist yet, handle gracefully
      const zonesData = zonesRes.ok ? await zonesRes.json() : []
      const tiersData = tiersRes.ok ? await tiersRes.json() : []

      setFilterOptions(prev => ({
        ...prev,
        zones: zonesData,
        tiers: tiersData,
      }))
    } catch {
      // Filter options are enhancement, not critical
    }
  }, [brandFetch])

  useEffect(() => { loadFilterOptions() }, [loadFilterOptions])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const updateFilter = <K extends keyof ExportFilters>(key: K, value: ExportFilters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: keyof ExportFilters, value: string) => {
    const current = (filters[key] as string[]) || []
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    updateFilter(key, next.length > 0 ? next : undefined)
  }

  const clientStatuses = [
    { id: 'active', name: 'Activo' },
    { id: 'inactive', name: 'Inactivo' },
    { id: 'suspended', name: 'Suspendido' },
    { id: 'prospect', name: 'Prospecto' },
  ]

  const membershipStatuses = [
    { id: 'active', name: 'Activa' },
    { id: 'pending', name: 'Pendiente' },
    { id: 'inactive', name: 'Inactiva' },
    { id: 'suspended', name: 'Suspendida' },
  ]

  const assignmentTypes = [
    { id: 'primary', name: 'Primario' },
    { id: 'support', name: 'Soporte' },
    { id: 'temporary', name: 'Temporal' },
  ]

  const sections = [
    {
      id: 'classification',
      title: 'Clasificación del cliente',
      content: (
        <div className="space-y-4">
          <ChipMultiSelect
            label="Estado cliente"
            options={clientStatuses}
            selected={filters.client_status || []}
            onToggle={(v) => toggleArrayFilter('client_status', v)}
          />
          {filterOptions.clientTypes.length > 0 && (
            <ChipMultiSelect
              label="Tipo de cliente"
              options={filterOptions.clientTypes}
              selected={filters.client_type_ids || []}
              onToggle={(v) => toggleArrayFilter('client_type_ids', v)}
            />
          )}
        </div>
      ),
    },
    {
      id: 'geography',
      title: 'Geografía',
      content: (
        <div className="space-y-4">
          {filterOptions.zones.length > 0 && (
            <ChipMultiSelect
              label="Zona"
              options={filterOptions.zones}
              selected={filters.zone_ids || []}
              onToggle={(v) => toggleArrayFilter('zone_ids', v)}
            />
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estados (separados por coma)</label>
            <input
              type="text"
              placeholder="CDMX, Jalisco..."
              className="w-full px-3 py-1.5 text-sm border rounded-md"
              value={(filters.states || []).join(', ')}
              onChange={(e) => {
                const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                updateFilter('states', vals.length > 0 ? vals : undefined)
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Códigos postales (separados por coma)</label>
            <input
              type="text"
              placeholder="01000, 44100..."
              className="w-full px-3 py-1.5 text-sm border rounded-md"
              value={(filters.postal_codes || []).join(', ')}
              onChange={(e) => {
                const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                updateFilter('postal_codes', vals.length > 0 ? vals : undefined)
              }}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'membership',
      title: 'Membresía y Lealtad',
      content: (
        <div className="space-y-4">
          <ChipMultiSelect
            label="Estado membresía"
            options={membershipStatuses}
            selected={filters.membership_status || []}
            onToggle={(v) => toggleArrayFilter('membership_status', v)}
          />
          {filterOptions.tiers.length > 0 && (
            <ChipMultiSelect
              label="Tier"
              options={filterOptions.tiers}
              selected={filters.tier_ids || []}
              onToggle={(v) => toggleArrayFilter('tier_ids', v)}
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Puntos balance mín</label>
              <input type="number" className="w-full px-3 py-1.5 text-sm border rounded-md" placeholder="0"
                value={filters.points_balance_min ?? ''} onChange={(e) => updateFilter('points_balance_min', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Puntos balance máx</label>
              <input type="number" className="w-full px-3 py-1.5 text-sm border rounded-md" placeholder="Sin límite"
                value={filters.points_balance_max ?? ''} onChange={(e) => updateFilter('points_balance_max', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Puntos lifetime mín</label>
              <input type="number" className="w-full px-3 py-1.5 text-sm border rounded-md" placeholder="0"
                value={filters.points_lifetime_min ?? ''} onChange={(e) => updateFilter('points_lifetime_min', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Puntos lifetime máx</label>
              <input type="number" className="w-full px-3 py-1.5 text-sm border rounded-md" placeholder="Sin límite"
                value={filters.points_lifetime_max ?? ''} onChange={(e) => updateFilter('points_lifetime_max', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'temporal',
      title: 'Temporal',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Registro desde</label>
              <input type="date" className="w-full px-3 py-1.5 text-sm border rounded-md"
                value={filters.registration_date_from || ''} onChange={(e) => updateFilter('registration_date_from', e.target.value || undefined)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Registro hasta</label>
              <input type="date" className="w-full px-3 py-1.5 text-sm border rounded-md"
                value={filters.registration_date_to || ''} onChange={(e) => updateFilter('registration_date_to', e.target.value || undefined)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Última visita desde</label>
              <input type="date" className="w-full px-3 py-1.5 text-sm border rounded-md"
                value={filters.last_visit_from || ''} onChange={(e) => updateFilter('last_visit_from', e.target.value || undefined)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Última visita hasta</label>
              <input type="date" className="w-full px-3 py-1.5 text-sm border rounded-md"
                value={filters.last_visit_to || ''} onChange={(e) => updateFilter('last_visit_to', e.target.value || undefined)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Última compra desde</label>
              <input type="date" className="w-full px-3 py-1.5 text-sm border rounded-md"
                value={filters.last_purchase_from || ''} onChange={(e) => updateFilter('last_purchase_from', e.target.value || undefined)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Última compra hasta</label>
              <input type="date" className="w-full px-3 py-1.5 text-sm border rounded-md"
                value={filters.last_purchase_to || ''} onChange={(e) => updateFilter('last_purchase_to', e.target.value || undefined)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Período datos desde</label>
              <input type="date" className="w-full px-3 py-1.5 text-sm border rounded-md"
                value={filters.data_period_from || ''} onChange={(e) => updateFilter('data_period_from', e.target.value || undefined)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Período datos hasta</label>
              <input type="date" className="w-full px-3 py-1.5 text-sm border rounded-md"
                value={filters.data_period_to || ''} onChange={(e) => updateFilter('data_period_to', e.target.value || undefined)} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'assignment',
      title: 'Asignación',
      content: (
        <div className="space-y-4">
          {filterOptions.promotors.length > 0 && (
            <ChipMultiSelect
              label="Promotor asignado"
              options={filterOptions.promotors}
              selected={filters.promotor_ids || []}
              onToggle={(v) => toggleArrayFilter('promotor_ids', v)}
            />
          )}
          <ChipMultiSelect
            label="Tipo asignación"
            options={assignmentTypes}
            selected={filters.assignment_types || []}
            onToggle={(v) => toggleArrayFilter('assignment_types', v)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtros de segmentación</h3>
      {sections.map(section => (
        <div key={section.id} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
          >
            <span className="text-sm font-medium text-gray-700">{section.title}</span>
            {expandedSections.has(section.id)
              ? <ChevronDown className="h-4 w-4 text-gray-400" />
              : <ChevronRight className="h-4 w-4 text-gray-400" />}
          </button>
          {expandedSections.has(section.id) && (
            <div className="px-4 py-3 bg-white">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ChipMultiSelect({ label, options, selected, onToggle }: {
  label: string
  options: FilterOption[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onToggle(opt.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selected.includes(opt.id)
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  )
}
