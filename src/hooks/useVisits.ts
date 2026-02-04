'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'

type Visit = {
  id: string
  tenant_id: string
  client_id: string
  brand_id: string
  advisor_id: string
  visit_number: string
  visit_date: string
  start_time: string | null
  end_time: string | null
  status: 'draft' | 'pending' | 'in_progress' | 'completed'
  notes: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
  client?: {
    id: string
    public_id?: string
    business_name: string
    owner_name?: string
    address_street?: string
    address_neighborhood?: string
    phone?: string
  }
  brand?: {
    id: string
    name: string
    logo_url?: string
  }
  assessment?: {
    id: string
    visit_id: string
    product_visibility: 'visible' | 'limited' | 'not_visible' | null
    package_condition: 'good' | 'fair' | 'poor' | null
    observed_price: number | null
    suggested_price: number | null
    comments: string | null
  }
  inventory?: Array<{
    id: string
    visit_id: string
    product_id: string
    current_stock: number
    notes: string | null
  }>
}

type VisitFilters = {
  status: 'all' | 'pending' | 'in_progress' | 'completed'
  dateRange: 'today' | 'week' | 'month'
}

type AsesorMetrics = {
  totalClients: number
  monthlyQuota: number
  completedVisits: number
  effectiveness: number
}

type CreateVisitData = {
  client_id: string
  brand_id: string
  visit_date?: string
  notes?: string
  latitude?: number
  longitude?: number
}

// Hook para obtener todas las visitas del asesor
export function useMyVisits(filters: VisitFilters) {
  const { user } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<AsesorMetrics>({
    totalClients: 0,
    monthlyQuota: 0,
    completedVisits: 0,
    effectiveness: 0
  })

  const fetchVisits = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        status: filters.status,
        date_range: filters.dateRange
      })

      const response = await fetch(`/api/asesor/visits?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar visitas')
      }

      setVisits(data.visits || [])
      setMetrics(data.metrics || {
        totalClients: 0,
        monthlyQuota: 100,
        completedVisits: 0,
        effectiveness: 0
      })

    } catch (err) {
      console.error('Error fetching visits:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar visitas')
    } finally {
      setLoading(false)
    }
  }, [user, filters.status, filters.dateRange])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  return {
    visits,
    loading,
    error,
    metrics,
    refetch: fetchVisits
  }
}

// Hook para obtener una visita específica
export function useVisit(visitId: string) {
  const { user } = useAuth()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVisit = useCallback(async () => {
    if (!user || !visitId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/asesor/visits/${visitId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar la visita')
      }

      setVisit(data.visit)
    } catch (err) {
      console.error('Error fetching visit:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar la visita')
    } finally {
      setLoading(false)
    }
  }, [user, visitId])

  const updateVisit = async (updates: Partial<Visit>) => {
    if (!visit) return

    try {
      const response = await fetch(`/api/asesor/visits/${visit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la visita')
      }

      await fetchVisit()
    } catch (err) {
      console.error('Error updating visit:', err)
      throw err
    }
  }

  const checkin = async (location?: { latitude: number; longitude: number }) => {
    if (!visit) return

    try {
      const response = await fetch(`/api/asesor/visits/${visit.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location || {})
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar la visita')
      }

      await fetchVisit()
      return data
    } catch (err) {
      console.error('Error checking in:', err)
      throw err
    }
  }

  const checkout = async (checkoutData?: { notes?: string; latitude?: number; longitude?: number }) => {
    if (!visit) return

    try {
      const response = await fetch(`/api/asesor/visits/${visit.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData || {})
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al completar la visita')
      }

      await fetchVisit()
      return data
    } catch (err) {
      console.error('Error checking out:', err)
      throw err
    }
  }

  const completeVisit = async () => {
    return checkout()
  }

  useEffect(() => {
    fetchVisit()
  }, [fetchVisit])

  return {
    visit,
    loading,
    error,
    updateVisit,
    checkin,
    checkout,
    completeVisit,
    refetch: fetchVisit
  }
}

// Hook para crear una nueva visita
export function useCreateVisit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createVisit = async (visitData: CreateVisitData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/asesor/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la visita')
      }

      return data.visit as Visit
    } catch (err) {
      console.error('Error creating visit:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la visita'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createVisit,
    loading,
    error
  }
}

// Hook para obtener clientes asignados
export function useAssignedClients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Array<{
    id: string
    public_id: string
    business_name: string
    business_type: string
    address: string
    phone: string
    email: string
    last_visit_date: string | null
    brands: Array<{ id: string; name: string; logo_url: string | null }>
    assignment: { type: string; priority: number }
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/asesor/clients')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar clientes')
      }

      setClients(data.clients || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  return {
    clients,
    loading,
    error,
    refetch: fetchClients
  }
}
