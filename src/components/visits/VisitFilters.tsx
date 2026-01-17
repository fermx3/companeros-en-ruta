'use client'

import { useState } from 'react'

interface VisitFiltersProps {
  filters: {
    status: 'all' | 'pending' | 'in_progress' | 'completed'
    dateRange: 'today' | 'week' | 'month'
  }
  onFiltersChange: (filters: any) => void
}

export function VisitFilters({ filters, onFiltersChange }: VisitFiltersProps) {
  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status
    })
  }

  const handleDateRangeChange = (dateRange: string) => {
    onFiltersChange({
      ...filters,
      dateRange
    })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estado Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado de visita
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completadas</option>
          </select>
        </div>

        {/* Rango de fecha Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>
    </div>
  )
}
