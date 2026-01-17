'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'

type Visit = {
  id: string
  tenant_id: string
  client_id: string
  brand_id: string
  asesor_id: string
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
    business_name: string
    business_type: string
    address: string
  }
  brand?: {
    id: string
    name: string
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
  const supabase = createClient()

  const fetchVisits = useCallback(async () => {
    if (!user) return
    console.log('Fetching visits for user:', user.id)
    setLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('visits')
        .select(`
          *,
          client:clients(*),
          brand:brands(*)
        `)
        .eq('asesor_id', user.id)
        .order('visit_date', { ascending: false })

      if (queryError) {
        console.error('Error fetching visits:', queryError)
        throw queryError
      }
      console.log(data);

      setVisits(data as Visit[])

      // Calculate metrics
      const totalVisits = data?.length || 0
      const completed = data?.filter((v: Visit) => v.status === 'completed').length || 0
      const uniqueClients = new Set(data?.map((v: Visit) => v.client_id)).size

      setMetrics({
        totalClients: uniqueClients,
        monthlyQuota: 100,
        completedVisits: completed,
        effectiveness: totalVisits > 0 ? (completed / totalVisits) * 100 : 0
      })

    } catch (err) {
      console.error('Error fetching visits:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar visitas')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

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
  const supabase = createClient()

  const fetchVisit = useCallback(async () => {
    if (!user || !visitId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('visits')
        .select(`
          *,
          client:clients(*),
          brand:brands(*)
        `)
        .eq('id', visitId)
        .eq('asesor_id', user.id)
        .single()

      if (queryError) throw queryError
      if (!data) throw new Error('Visita no encontrada')

      setVisit(data as Visit)
    } catch (err) {
      console.error('Error fetching visit:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar la visita')
    } finally {
      setLoading(false)
    }
  }, [user, visitId, supabase])

  const updateVisit = async (updates: Partial<Visit>) => {
    if (!visit) return

    try {
      const { error: updateError } = await supabase
        .from('visits')
        .update(updates)
        .eq('id', visit.id)

      if (updateError) throw updateError

      await fetchVisit()
    } catch (err) {
      console.error('Error updating visit:', err)
      throw err
    }
  }

  const completeVisit = async () => {
    if (!visit) return

    try {
      const { error: updateError } = await supabase
        .from('visits')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', visit.id)

      if (updateError) throw updateError
    } catch (err) {
      console.error('Error completing visit:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchVisit()
  }, [fetchVisit])

  return {
    visit,
    loading,
    error,
    updateVisit,
    completeVisit,
    refetch: fetchVisit
  }
}
