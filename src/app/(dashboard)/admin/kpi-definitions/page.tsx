'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Alert, LoadingSpinner } from '@/components/ui/feedback'
import { Plus, Edit2, Power, PowerOff, TrendingUp, Target, Package, PieChart, LayoutGrid } from 'lucide-react'

interface KpiDefinition {
  id: string
  slug: string
  label: string
  description: string | null
  icon: string | null
  color: string | null
  computation_type: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

const ICON_MAP: Record<string, any> = {
  TrendingUp, Target, Package, PieChart, LayoutGrid,
}

const COMPUTATION_LABELS: Record<string, string> = {
  volume: 'Volumen de ventas',
  reach_mix: 'Alcance y Mix',
  assortment: 'Surtido',
  market_share: 'Participación de mercado',
  share_of_shelf: 'Share of Shelf',
}

export default function AdminKpiDefinitionsPage() {
  const [definitions, setDefinitions] = useState<KpiDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    slug: '', label: '', description: '', icon: 'TrendingUp', color: 'blue', computation_type: 'volume',
  })

  const loadDefinitions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/kpi-definitions')
      if (!res.ok) throw new Error('Error al cargar definiciones')
      const data = await res.json()
      setDefinitions(data.definitions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDefinitions() }, [loadDefinitions])

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/kpi-definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear')
      setSuccessMsg('KPI creado exitosamente')
      setShowCreateForm(false)
      setFormData({ slug: '', label: '', description: '', icon: 'TrendingUp', color: 'blue', computation_type: 'volume' })
      loadDefinitions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const handleUpdate = async (id: string, updates: Partial<KpiDefinition>) => {
    try {
      const res = await fetch('/api/admin/kpi-definitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar')
      }
      setSuccessMsg('KPI actualizado')
      setEditingId(null)
      loadDefinitions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const toggleActive = async (def: KpiDefinition) => {
    await handleUpdate(def.id, { is_active: !def.is_active })
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li><Link href="/admin" className="text-gray-400 hover:text-gray-500">Admin</Link></li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Definiciones KPI</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Definiciones de KPI</h1>
              <p className="text-gray-600 mt-1">Configura los KPIs disponibles para Brand Managers</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
              <Plus className="w-4 h-4 mr-2" /> Nuevo KPI
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert variant="error" className="mb-4" onClose={() => setError(null)}>{error}</Alert>}
        {successMsg && <Alert variant="success" className="mb-4" onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Nuevo KPI</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (único)</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                    placeholder="ej: volume_growth" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.label} onChange={e => setFormData(p => ({ ...p, label: e.target.value }))}
                    placeholder="ej: Crecimiento de Volumen" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Descripción del KPI..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cálculo</label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.computation_type} onChange={e => setFormData(p => ({ ...p, computation_type: e.target.value }))}>
                    {Object.entries(COMPUTATION_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.icon} onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))}>
                    {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.color} onChange={e => setFormData(p => ({ ...p, color: e.target.value }))}>
                    {['blue', 'green', 'purple', 'orange', 'red', 'cyan', 'amber'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!formData.slug || !formData.label}>Crear KPI</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI List */}
        <div className="space-y-3">
          {definitions.map(def => {
            const IconComponent = ICON_MAP[def.icon || 'TrendingUp'] || TrendingUp
            const isEditing = editingId === def.id

            return (
              <Card key={def.id} className={!def.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-${def.color || 'blue'}-50`}>
                      <IconComponent className={`h-5 w-5 text-${def.color || 'blue'}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <EditForm
                          def={def}
                          onSave={(updates) => handleUpdate(def.id, updates)}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900">{def.label}</h3>
                            <span className="text-xs text-gray-400 font-mono">{def.slug}</span>
                            {!def.is_active && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Inactivo</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{def.description || 'Sin descripción'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Cálculo: {COMPUTATION_LABELS[def.computation_type] || def.computation_type}
                          </p>
                        </>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingId(def.id)} title="Editar">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(def)}
                          title={def.is_active ? 'Desactivar' : 'Activar'}>
                          {def.is_active
                            ? <PowerOff className="h-4 w-4 text-red-500" />
                            : <Power className="h-4 w-4 text-green-500" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {definitions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay definiciones de KPI</p>
              <p className="text-sm mt-1">Crea el primer KPI para que los Brand Managers puedan configurar su dashboard</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EditForm({ def, onSave, onCancel }: {
  def: KpiDefinition
  onSave: (updates: Partial<KpiDefinition>) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState(def.label)
  const [description, setDescription] = useState(def.description || '')

  return (
    <div className="space-y-2">
      <input type="text" className="w-full px-2 py-1 text-sm border rounded"
        value={label} onChange={e => setLabel(e.target.value)} />
      <input type="text" className="w-full px-2 py-1 text-sm border rounded"
        value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción..." />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ label, description })}>Guardar</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  )
}
