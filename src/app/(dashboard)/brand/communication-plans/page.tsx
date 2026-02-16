'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback'
import { Calendar, Plus, Edit2, Trash2, ChevronDown, ChevronRight, Layers, Megaphone } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PlanMaterial {
  id: string
  quantity_required: number
  placement_notes: string | null
  brand_pop_materials: {
    id: string
    material_name: string
    material_category: string | null
  }
}

interface PlanActivity {
  id: string
  activity_name: string
  activity_description: string | null
  scheduled_date: string | null
  is_recurring: boolean
}

interface CommunicationPlan {
  id: string
  public_id: string
  plan_name: string
  plan_period: string | null
  target_locations: string | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  brand_communication_plan_materials: PlanMaterial[]
  brand_communication_plan_activities: PlanActivity[]
}

interface POPMaterial {
  id: string
  material_name: string
  material_category: string | null
  is_system_template: boolean
}

export default function BrandCommunicationPlansPage() {
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [plans, setPlans] = useState<CommunicationPlan[]>([])
  const [materials, setMaterials] = useState<POPMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<CommunicationPlan | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    plan_name: '',
    plan_period: '',
    target_locations: '',
    start_date: '',
    end_date: '',
    materials: [] as Array<{ pop_material_id: string; quantity_required: number; placement_notes: string }>,
    activities: [] as Array<{ activity_name: string; activity_description: string; scheduled_date: string; is_recurring: boolean }>
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [plansRes, materialsRes] = await Promise.all([
        brandFetch('/api/brand/communication-plans'),
        brandFetch('/api/brand/pop-materials?include_system=true')
      ])

      if (!plansRes.ok) throw new Error('Error al cargar planes')
      if (!materialsRes.ok) throw new Error('Error al cargar materiales')

      const plansData = await plansRes.json()
      const materialsData = await materialsRes.json()

      setPlans(plansData.plans || [])
      setMaterials([
        ...(materialsData.systemTemplates || []),
        ...(materialsData.materials || [])
      ])

    } catch (err) {
      console.error('Error loading data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [brandFetch, currentBrandId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = editingPlan
        ? `/api/brand/communication-plans/${editingPlan.id}`
        : '/api/brand/communication-plans'

      const response = await brandFetch(url, {
        method: editingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar plan')
      }

      await loadData()
      resetForm()

    } catch (err) {
      console.error('Error saving plan:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este plan?')) return

    setDeleting(id)
    try {
      const response = await brandFetch(`/api/brand/communication-plans/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar plan')

      await loadData()
    } catch (err) {
      console.error('Error deleting plan:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setDeleting(null)
    }
  }

  const startEdit = (plan: CommunicationPlan) => {
    setEditingPlan(plan)
    setFormData({
      plan_name: plan.plan_name,
      plan_period: plan.plan_period || '',
      target_locations: plan.target_locations || '',
      start_date: plan.start_date,
      end_date: plan.end_date,
      materials: plan.brand_communication_plan_materials.map(m => ({
        pop_material_id: m.brand_pop_materials.id,
        quantity_required: m.quantity_required,
        placement_notes: m.placement_notes || ''
      })),
      activities: plan.brand_communication_plan_activities.map(a => ({
        activity_name: a.activity_name,
        activity_description: a.activity_description || '',
        scheduled_date: a.scheduled_date || '',
        is_recurring: a.is_recurring
      }))
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingPlan(null)
    setFormData({
      plan_name: '',
      plan_period: '',
      target_locations: '',
      start_date: '',
      end_date: '',
      materials: [],
      activities: []
    })
  }

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { pop_material_id: '', quantity_required: 1, placement_notes: '' }]
    }))
  }

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, { activity_name: '', activity_description: '', scheduled_date: '', is_recurring: false }]
    }))
  }

  const formatDate = (dateString: string) => {
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
                      <span className="ml-4 text-gray-900 font-medium">Planes de Comunicación</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Planes de Comunicación</h1>
              <p className="text-gray-600 mt-1">Configura planes de comunicación para verificar en visitas</p>
            </div>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Plan
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
              <CardTitle>{editingPlan ? 'Editar Plan' : 'Nuevo Plan de Comunicación'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan *</label>
                    <input
                      type="text"
                      value={formData.plan_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, plan_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <input
                      type="text"
                      value={formData.plan_period}
                      onChange={(e) => setFormData(prev => ({ ...prev, plan_period: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Enero 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicaciones Objetivo</label>
                  <textarea
                    value={formData.target_locations}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_locations: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Ej: Zona de cajas y entrada principal"
                  />
                </div>

                {/* Materials Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Materiales POP</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                      <Plus className="w-4 h-4 mr-1" />
                      Material
                    </Button>
                  </div>
                  {formData.materials.map((mat, idx) => (
                    <div key={idx} className="flex gap-3 mb-2 items-end">
                      <div className="flex-1">
                        <select
                          value={mat.pop_material_id}
                          onChange={(e) => {
                            const updated = [...formData.materials]
                            updated[idx].pop_material_id = e.target.value
                            setFormData(prev => ({ ...prev, materials: updated }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Seleccionar material</option>
                          {materials.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.material_name} {m.is_system_template && '(Sistema)'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          value={mat.quantity_required}
                          onChange={(e) => {
                            const updated = [...formData.materials]
                            updated[idx].quantity_required = parseInt(e.target.value) || 1
                            setFormData(prev => ({ ...prev, materials: updated }))
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Qty"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            materials: prev.materials.filter((_, i) => i !== idx)
                          }))
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Activities Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Actividades</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                      <Plus className="w-4 h-4 mr-1" />
                      Actividad
                    </Button>
                  </div>
                  {formData.activities.map((act, idx) => (
                    <div key={idx} className="flex gap-3 mb-2 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={act.activity_name}
                          onChange={(e) => {
                            const updated = [...formData.activities]
                            updated[idx].activity_name = e.target.value
                            setFormData(prev => ({ ...prev, activities: updated }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Nombre de la actividad"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="date"
                          value={act.scheduled_date}
                          onChange={(e) => {
                            const updated = [...formData.activities]
                            updated[idx].scheduled_date = e.target.value
                            setFormData(prev => ({ ...prev, activities: updated }))
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            activities: prev.activities.filter((_, i) => i !== idx)
                          }))
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <LoadingSpinner size="sm" /> : (editingPlan ? 'Guardar Cambios' : 'Crear Plan')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Plans List */}
        {plans.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="w-16 h-16" />}
            title="No hay planes de comunicación"
            description="Crea un plan de comunicación para definir los materiales y actividades a verificar en las visitas."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Plan
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedPlan === plan.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>

                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-purple-600" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{plan.plan_name}</h3>
                          <StatusBadge status={plan.is_active ? 'active' : 'inactive'} size="sm" />
                        </div>
                        <p className="text-sm text-gray-500">
                          {plan.plan_period && `${plan.plan_period} • `}
                          {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {plan.brand_communication_plan_materials?.length || 0} materiales
                      </span>
                      <Button variant="outline" size="sm" onClick={() => startEdit(plan)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        disabled={deleting === plan.id}
                        className="text-red-600 hover:bg-red-50"
                      >
                        {deleting === plan.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {expandedPlan === plan.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {plan.target_locations && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Ubicaciones:</p>
                          <p className="text-sm text-gray-600">{plan.target_locations}</p>
                        </div>
                      )}

                      {plan.brand_communication_plan_materials?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Materiales:</p>
                          <div className="flex flex-wrap gap-2">
                            {plan.brand_communication_plan_materials.map((m) => (
                              <span key={m.id} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                                <Layers className="w-3 h-3 mr-1 text-gray-500" />
                                {m.brand_pop_materials.material_name}
                                {m.quantity_required > 1 && ` (x${m.quantity_required})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {plan.brand_communication_plan_activities?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Actividades:</p>
                          <div className="space-y-1">
                            {plan.brand_communication_plan_activities.map((a) => (
                              <div key={a.id} className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                {a.activity_name}
                                {a.scheduled_date && ` - ${formatDate(a.scheduled_date)}`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
