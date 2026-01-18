'use client'

import { Card } from '@/components/ui/Card'

// ===========================================
// Types
// ===========================================

interface VisitFiltersState {
  status: 'all' | 'pending' | 'in_progress' | 'completed'
  dateRange: 'today' | 'week' | 'month'
}

interface VisitFiltersProps {
  /** Filtros actuales */
  filters: VisitFiltersState
  /** Callback cuando cambian los filtros */
  onFiltersChange: (filters: VisitFiltersState) => void
}

// ===========================================
// Component
// ===========================================

/**
 * Componente de filtros para lista de visitas.
 * Permite filtrar por estado y rango de fechas.
 *
 * @example
 * <VisitFilters
 *   filters={filters}
 *   onFiltersChange={setFilters}
 * />
 */
export function VisitFilters({ filters, onFiltersChange }: VisitFiltersProps) {
  // ===========================================
  // Handlers
  // ===========================================

  /**
   * Manejar cambio de estado
   */
  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status as VisitFiltersState['status']
    })
  }

  /**
   * Manejar cambio de rango de fechas
   */
  const handleDateRangeChange = (dateRange: string) => {
    onFiltersChange({
      ...filters,
      dateRange: dateRange as VisitFiltersState['dateRange']
    })
  }

  // ===========================================
  // Constants
  // ===========================================

  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completadas' }
  ]

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' }
  ]

  // ===========================================
  // Main Render
  // ===========================================

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estado Filter */}
          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Estado de visita
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filtrar por estado de visita"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de fecha Filter */}
          <div>
            <label
              htmlFor="date-range-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Período
            </label>
            <select
              id="date-range-filter"
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filtrar por período de tiempo"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Card>
  )
}
