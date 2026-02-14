'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback'
import { LayoutGrid, Plus, Edit2, Trash2, Package, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Exhibition {
  id: string
  public_id: string
  exhibition_name: string
  negotiated_period: string | null
  location_description: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  products: { id: string; name: string; sku: string } | null
  brand_communication_plans: { id: string; plan_name: string } | null
}

interface CommunicationPlan {
  id: string
  plan_name: string
}

export default function BrandExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [plans, setPlans] = useState<CommunicationPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    exhibition_name: '',
    negotiated_period: '',
    location_description: '',
    start_date: '',
    end_date: '',
    communication_plan_id: ''
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [exhibitionsRes, plansRes] = await Promise.all([
        fetch('/api/brand/exhibitions'),
        fetch('/api/brand/communication-plans?active_only=true')
      ])

      if (!exhibitionsRes.ok) throw new Error('Error al cargar exhibiciones')

      const exhibitionsData = await exhibitionsRes.json()
      setExhibitions(exhibitionsData.exhibitions || [])

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData.plans || [])
      }

    } catch (err) {
      console.error('Error loading data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = editingExhibition
        ? `/api/brand/exhibitions/${editingExhibition.id}`
        : '/api/brand/exhibitions'

      const response = await fetch(url, {
        method: editingExhibition ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          communication_plan_id: formData.communication_plan_id || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar exhibición')
      }

      await loadData()
      resetForm()

    } catch (err) {
      console.error('Error saving exhibition:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta exhibición?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/brand/exhibitions/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar exhibición')

      await loadData()
    } catch (err) {
      console.error('Error deleting exhibition:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setDeleting(null)
    }
  }

  const startEdit = (exhibition: Exhibition) => {
    setEditingExhibition(exhibition)
    setFormData({
      exhibition_name: exhibition.exhibition_name,
      negotiated_period: exhibition.negotiated_period || '',
      location_description: exhibition.location_description || '',
      start_date: exhibition.start_date || '',
      end_date: exhibition.end_date || '',
      communication_plan_id: exhibition.brand_communication_plans?.id || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingExhibition(null)
    setFormData({
      exhibition_name: '',
      negotiated_period: '',
      location_description: '',
      start_date: '',
      end_date: '',
      communication_plan_id: ''
    })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    try {
      return format(new Date(dateString), 'd MMM yyyy', { locale: es })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/brand" className="text-gray-400 hover:text-gray-500">Marca</Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Exhibiciones</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Exhibiciones Negociadas</h1>
              <p className="text-gray-600 mt-1">Configura las exhibiciones a verificar en las visitas</p>
            </div>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Exhibición
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingExhibition ? 'Editar Exhibición' : 'Nueva Exhibición'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Exhibición *</label>
                    <input
                      type="text"
                      value={formData.exhibition_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, exhibition_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período Negociado</label>
                    <input
                      type="text"
                      value={formData.negotiated_period}
                      onChange={(e) => setFormData(prev => ({ ...prev, negotiated_period: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Q1 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Comunicación</label>
                    <select
                      value={formData.communication_plan_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, communication_plan_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sin plan asociado</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>{plan.plan_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación Esperada</label>
                  <textarea
                    value={formData.location_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Descripción de la ubicación de la exhibición"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <LoadingSpinner size="sm" /> : (editingExhibition ? 'Guardar Cambios' : 'Crear Exhibición')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Exhibitions List */}
        {exhibitions.length === 0 ? (
          <EmptyState
            icon={<LayoutGrid className="w-16 h-16" />}
            title="No hay exhibiciones"
            description="Crea exhibiciones negociadas para verificar su cumplimiento en las visitas."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Exhibición
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exhibitions.map((exhibition) => (
              <Card key={exhibition.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{exhibition.exhibition_name}</h3>
                        <StatusBadge status={exhibition.is_active ? 'active' : 'inactive'} size="sm" />
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" onClick={() => startEdit(exhibition)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(exhibition.id)}
                        disabled={deleting === exhibition.id}
                        className="text-red-600 hover:bg-red-50"
                      >
                        {deleting === exhibition.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {exhibition.negotiated_period && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {exhibition.negotiated_period}
                      </div>
                    )}
                    {(exhibition.start_date || exhibition.end_date) && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(exhibition.start_date)} - {formatDate(exhibition.end_date)}
                      </div>
                    )}
                    {exhibition.location_description && (
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                        <span className="line-clamp-2">{exhibition.location_description}</span>
                      </div>
                    )}
                    {exhibition.products && (
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        {exhibition.products.name}
                      </div>
                    )}
                    {exhibition.brand_communication_plans && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {exhibition.brand_communication_plans.plan_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
