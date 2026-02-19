'use client'

import { Users, MapPin, UserCheck, Tag, ClipboardList, Package, UsersRound, Building2, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type DatasetKey = 'clients' | 'visits' | 'memberships' | 'promotions' | 'surveys' | 'products' | 'team' | 'competitors' | 'pop_materials'

interface DatasetOption {
  key: DatasetKey
  label: string
  description: string
  icon: LucideIcon
  color: string
}

const DATASETS: DatasetOption[] = [
  { key: 'clients', label: 'Clientes', description: 'Datos de contacto y clasificación', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { key: 'visits', label: 'Visitas', description: 'Historial con métricas', icon: MapPin, color: 'text-green-600 bg-green-50' },
  { key: 'memberships', label: 'Membresías', description: 'Tier, puntos, estado', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50' },
  { key: 'promotions', label: 'Promociones', description: 'Performance y métricas', icon: Tag, color: 'text-orange-600 bg-orange-50' },
  { key: 'surveys', label: 'Encuestas', description: 'Conteo de respuestas', icon: ClipboardList, color: 'text-purple-600 bg-purple-50' },
  { key: 'products', label: 'Productos', description: 'Catálogo con precios', icon: Package, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'team', label: 'Equipo', description: 'Miembros con roles', icon: UsersRound, color: 'text-cyan-600 bg-cyan-50' },
  { key: 'competitors', label: 'Competidores', description: 'Competidores y productos', icon: Building2, color: 'text-red-600 bg-red-50' },
  { key: 'pop_materials', label: 'Materiales POP', description: 'Inventario de materiales', icon: Layers, color: 'text-amber-600 bg-amber-50' },
]

interface DatasetSelectorProps {
  selected: DatasetKey[]
  onChange: (selected: DatasetKey[]) => void
}

export function DatasetSelector({ selected, onChange }: DatasetSelectorProps) {
  const toggle = (key: DatasetKey) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key))
    } else {
      onChange([...selected, key])
    }
  }

  const selectAll = () => {
    if (selected.length === DATASETS.length) {
      onChange([])
    } else {
      onChange(DATASETS.map(d => d.key))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Datasets a exportar</h3>
        <button
          onClick={selectAll}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {selected.length === DATASETS.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DATASETS.map(dataset => {
          const isSelected = selected.includes(dataset.key)
          const Icon = dataset.icon
          return (
            <button
              key={dataset.key}
              onClick={() => toggle(dataset.key)}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg ${dataset.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{dataset.label}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{dataset.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
