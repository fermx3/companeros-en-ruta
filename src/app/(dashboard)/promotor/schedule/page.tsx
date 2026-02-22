'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/feedback'
import { ChevronLeft, ChevronRight, MapPin, Clock, User, Calendar } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

type Visit = {
  id: string
  visit_number: string
  visit_date: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  check_in_time: string | null
  check_out_time: string | null
  client?: {
    id: string
    business_name: string
    owner_name?: string
    address_street?: string
    address_neighborhood?: string
  }
  brand?: {
    id: string
    name: string
  }
}

type ViewType = 'day' | 'week' | 'month'

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  planned: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  cancelled: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
  no_show: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
}

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planificada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No Presentado'
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  })
}

// Format date to YYYY-MM-DD in local timezone (avoids UTC issues)
function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export default function SchedulePage() {
  usePageTitle('Mi Agenda')
  const router = useRouter()
  const { user } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<ViewType>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate date range based on view type
  const dateRange = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let start: Date
    let end: Date

    switch (viewType) {
      case 'day':
        start = new Date(currentDate)
        start.setHours(0, 0, 0, 0)
        end = new Date(currentDate)
        end.setHours(23, 59, 59, 999)
        break
      case 'week':
        start = getStartOfWeek(currentDate)
        end = getEndOfWeek(currentDate)
        break
      case 'month':
        start = getStartOfMonth(currentDate)
        end = getEndOfMonth(currentDate)
        break
    }

    return { start, end }
  }, [viewType, currentDate])

  const fetchVisits = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Use existing API with custom date range via the date_range param
      // We'll fetch month data and filter client-side for flexibility
      const params = new URLSearchParams({
        status: 'all',
        date_range: 'month',
        limit: '200'
      })

      const response = await fetch(`/api/promotor/visits?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar visitas')
      }

      setVisits(data.visits || [])
    } catch (err) {
      console.error('Error fetching visits:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar visitas')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  // Filter visits based on current date range
  // Compare dates as strings (YYYY-MM-DD) in local timezone to avoid UTC issues
  const filteredVisits = useMemo(() => {
    const startStr = toLocalDateString(dateRange.start)
    const endStr = toLocalDateString(dateRange.end)

    return visits.filter(visit => {
      const visitDateStr = visit.visit_date.slice(0, 10) // YYYY-MM-DD
      return visitDateStr >= startStr && visitDateStr <= endStr
    })
  }, [visits, dateRange])

  // Group visits by date
  const groupedVisits = useMemo(() => {
    const groups: Record<string, Visit[]> = {}

    filteredVisits.forEach(visit => {
      const dateKey = visit.visit_date.slice(0, 10) // YYYY-MM-DD
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(visit)
    })

    // Sort each group by time
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const timeA = a.check_in_time || '00:00'
        const timeB = b.check_in_time || '00:00'
        return timeA.localeCompare(timeB)
      })
    })

    return groups
  }, [filteredVisits])

  // Get sorted dates for display
  const sortedDates = useMemo(() => {
    return Object.keys(groupedVisits).sort()
  }, [groupedVisits])

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get header text based on view type
  const getHeaderText = () => {
    switch (viewType) {
      case 'day':
        return formatDate(currentDate)
      case 'week': {
        const start = getStartOfWeek(currentDate)
        const end = getEndOfWeek(currentDate)
        return `${start.getDate()} - ${end.getDate()} de ${formatMonthYear(currentDate)}`
      }
      case 'month':
        return formatMonthYear(currentDate)
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Agenda</h1>
              <p className="text-gray-600">
                Visualiza y gestiona tus visitas programadas
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewType === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewType('day')
                  setCurrentDate(new Date()) // Reset to today
                }}
                className={viewType === 'day' ? 'bg-blue-600' : ''}
              >
                Hoy
              </Button>
              <Button
                variant={viewType === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('week')}
                className={viewType === 'week' ? 'bg-blue-600' : ''}
              >
                Semana
              </Button>
              <Button
                variant={viewType === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('month')}
                className={viewType === 'month' ? 'bg-blue-600' : ''}
              >
                Mes
              </Button>
            </div>
          </div>

          {/* Date Navigator */}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {getHeaderText()}
              </h2>
              {!isSameDay(currentDate, new Date()) && (
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hoy
                </Button>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : filteredVisits.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay visitas programadas
            </h3>
            <p className="text-gray-600 mb-4">
              No tienes visitas para este periodo
            </p>
            <Button
              onClick={() => router.push('/promotor/visitas/nueva')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Crear Nueva Visita
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(dateKey => {
              const dateObj = new Date(dateKey + 'T12:00:00')
              const dayVisits = groupedVisits[dateKey]
              const isToday = isSameDay(dateObj, new Date())

              return (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className={`sticky top-0 z-10 py-2 px-3 rounded-lg mb-3 ${
                    isToday ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <h3 className={`font-semibold capitalize ${
                      isToday ? 'text-blue-800' : 'text-gray-700'
                    }`}>
                      {isToday ? 'Hoy - ' : ''}{formatDate(dateObj)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {dayVisits.length} visita{dayVisits.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Visit Cards */}
                  <div className="space-y-3">
                    {dayVisits.map(visit => {
                      const colors = STATUS_COLORS[visit.status] || STATUS_COLORS.planned

                      return (
                        <Card
                          key={visit.id}
                          className={`${colors.bg} ${colors.border} border cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => router.push(`/promotor/visitas/${visit.id}`)}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                {/* Client Name */}
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {visit.client?.business_name || 'Cliente'}
                                </h4>

                                {/* Owner Name */}
                                {visit.client?.owner_name && (
                                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                    <User className="h-3 w-3" />
                                    {visit.client.owner_name}
                                  </div>
                                )}

                                {/* Address */}
                                {visit.client?.address_street && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">
                                      {visit.client.address_street}
                                      {visit.client.address_neighborhood && `, ${visit.client.address_neighborhood}`}
                                    </span>
                                  </div>
                                )}

                                {/* Time */}
                                {visit.check_in_time && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(visit.check_in_time).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Status Badge */}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.text} ${colors.bg} border ${colors.border}`}>
                                {STATUS_LABELS[visit.status]}
                              </span>
                            </div>

                            {/* Brand */}
                            {visit.brand && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-xs text-gray-500">
                                  {visit.brand.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && filteredVisits.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredVisits.length}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </Card>
            <Card className="p-4 text-center bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-700">
                {filteredVisits.filter(v => v.status === 'planned').length}
              </div>
              <div className="text-sm text-yellow-600">Planificadas</div>
            </Card>
            <Card className="p-4 text-center bg-blue-50">
              <div className="text-2xl font-bold text-blue-700">
                {filteredVisits.filter(v => v.status === 'in_progress').length}
              </div>
              <div className="text-sm text-blue-600">En Progreso</div>
            </Card>
            <Card className="p-4 text-center bg-green-50">
              <div className="text-2xl font-bold text-green-700">
                {filteredVisits.filter(v => v.status === 'completed').length}
              </div>
              <div className="text-sm text-green-600">Completadas</div>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
