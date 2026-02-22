'use client'

import { useEffect, useState } from 'react'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Plus, Pencil, Trash2, X, Save, Filter,
} from 'lucide-react'
import Link from 'next/link'
import type { KpiTarget } from '@/lib/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'

const KPI_OPTIONS = [
  { slug: 'volume', label: 'Avances de Volumen', defaultUnit: 'MXN' },
  { slug: 'reach_mix', label: 'Reach y Mix', defaultUnit: '%' },
  { slug: 'mix', label: 'Mix de Canales', defaultUnit: 'channels' },
  { slug: 'assortment', label: 'Assortment', defaultUnit: '%' },
  { slug: 'market_share', label: 'Market Share', defaultUnit: '%' },
  { slug: 'share_of_shelf', label: 'Share of Shelf', defaultUnit: '%' },
]

const PERIOD_TYPES = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'quarterly', label: 'Trimestral' },
]

function getCurrentMonthStart(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function getMonthEnd(start: string): string {
  const d = new Date(start + 'T00:00:00')
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`
}

export default function KpiTargetsPage() {
  usePageTitle('Metas de KPI')
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [targets, setTargets] = useState<KpiTarget[]>([])
  const [zones, setZones] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterSlug, setFilterSlug] = useState<string>('')

  // Form state
  const [formSlug, setFormSlug] = useState('volume')
  const [formPeriodType, setFormPeriodType] = useState('monthly')
  const [formPeriodStart, setFormPeriodStart] = useState(getCurrentMonthStart())
  const [formTargetValue, setFormTargetValue] = useState('')
  const [formTargetUnit, setFormTargetUnit] = useState('MXN')
  const [formZoneId, setFormZoneId] = useState<string>('')
  const [formNotes, setFormNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentBrandId) return
    loadTargets()
    loadZones()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBrandId])

  const loadTargets = async () => {
    try {
      setLoading(true)
      const res = await brandFetch('/api/brand/kpi-targets')
      if (res.ok) {
        const data = await res.json()
        setTargets(data.targets || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const loadZones = async () => {
    try {
      const res = await brandFetch('/api/brand/clients?_zones_only=1')
      // Fallback: if no zones endpoint, try the metrics data
      if (!res.ok) return
      const data = await res.json()
      if (data.zones) setZones(data.zones)
    } catch {
      // zones are optional
    }
  }

  const resetForm = () => {
    setFormSlug('volume')
    setFormPeriodType('monthly')
    setFormPeriodStart(getCurrentMonthStart())
    setFormTargetValue('')
    setFormTargetUnit('MXN')
    setFormZoneId('')
    setFormNotes('')
    setFormError(null)
    setEditingId(null)
  }

  const openNewForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (target: KpiTarget) => {
    setFormSlug(target.kpi_slug)
    setFormPeriodType(target.period_type)
    setFormPeriodStart(target.period_start)
    setFormTargetValue(String(target.target_value))
    setFormTargetUnit(target.target_unit)
    setFormZoneId(target.zone_id || '')
    setFormNotes(target.notes || '')
    setFormError(null)
    setEditingId(target.id)
    setShowForm(true)
  }

  const handleSlugChange = (slug: string) => {
    setFormSlug(slug)
    const kpi = KPI_OPTIONS.find(k => k.slug === slug)
    if (kpi) setFormTargetUnit(kpi.defaultUnit)
  }

  const handleSave = async () => {
    const value = parseFloat(formTargetValue)
    if (isNaN(value) || value <= 0) {
      setFormError('El valor de la meta debe ser mayor a 0')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      if (editingId) {
        const res = await brandFetch(`/api/brand/kpi-targets/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_value: value,
            target_unit: formTargetUnit,
            notes: formNotes || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al actualizar')
      } else {
        const periodEnd = formPeriodType === 'monthly'
          ? getMonthEnd(formPeriodStart)
          : formPeriodStart // For weekly/quarterly, user provides both dates

        const res = await brandFetch('/api/brand/kpi-targets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kpi_slug: formSlug,
            period_type: formPeriodType,
            period_start: formPeriodStart,
            period_end: periodEnd,
            target_value: value,
            target_unit: formTargetUnit,
            zone_id: formZoneId || null,
            notes: formNotes || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al crear')
      }

      setShowForm(false)
      resetForm()
      loadTargets()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await brandFetch(`/api/brand/kpi-targets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTargets(prev => prev.filter(t => t.id !== id))
      }
    } catch {
      // silently fail
    }
  }

  const filteredTargets = filterSlug
    ? targets.filter(t => t.kpi_slug === filterSlug)
    : targets

  const getKpiLabel = (slug: string) => KPI_OPTIONS.find(k => k.slug === slug)?.label || slug

  const formatValue = (value: number, unit: string) => {
    if (unit === 'MXN') {
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
      if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`
      return `$${value.toLocaleString('es-MX')}`
    }
    if (unit === '%') return `${value}%`
    return value.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/brand">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Metas de KPIs</h1>
                <p className="text-sm text-gray-500">Define metas mensuales para medir el cumplimiento</p>
              </div>
            </div>
            <Button onClick={openNewForm} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Nueva Meta
            </Button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterSlug}
              onChange={e => setFilterSlug(e.target.value)}
              className="text-sm border rounded-md px-2 py-1 bg-white"
            >
              <option value="">Todos los KPIs</option>
              {KPI_OPTIONS.map(k => (
                <option key={k.slug} value={k.slug}>{k.label}</option>
              ))}
            </select>
          </div>

          {/* Targets Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-400 animate-pulse">Cargando metas...</div>
              ) : filteredTargets.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 text-sm mb-4">No hay metas configuradas</p>
                  <Button variant="outline" size="sm" onClick={openNewForm}>
                    <Plus className="h-4 w-4 mr-2" /> Crear primera meta
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium text-gray-600">KPI</th>
                        <th className="text-left p-3 font-medium text-gray-600">Periodo</th>
                        <th className="text-left p-3 font-medium text-gray-600">Inicio</th>
                        <th className="text-right p-3 font-medium text-gray-600">Meta</th>
                        <th className="text-left p-3 font-medium text-gray-600">Zona</th>
                        <th className="text-left p-3 font-medium text-gray-600">Notas</th>
                        <th className="text-right p-3 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTargets.map(target => (
                        <tr key={target.id} className="border-b last:border-0 hover:bg-gray-50/50">
                          <td className="p-3 font-medium text-gray-900">{getKpiLabel(target.kpi_slug)}</td>
                          <td className="p-3 text-gray-600 capitalize">{target.period_type === 'monthly' ? 'Mensual' : target.period_type === 'weekly' ? 'Semanal' : 'Trimestral'}</td>
                          <td className="p-3 text-gray-600">{target.period_start}</td>
                          <td className="p-3 text-right font-semibold text-gray-900">
                            {formatValue(Number(target.target_value), target.target_unit)}
                          </td>
                          <td className="p-3 text-gray-600">{target.zone_id ? zones.find(z => z.id === target.zone_id)?.name || 'Zona' : 'Global'}</td>
                          <td className="p-3 text-gray-500 truncate max-w-[150px]">{target.notes || '-'}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditForm(target)}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                aria-label="Editar"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(target.id)}
                                className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar Meta' : 'Nueva Meta'}
              </h2>
              <button onClick={() => { setShowForm(false); resetForm() }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{formError}</div>
              )}

              {/* KPI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KPI</label>
                <select
                  value={formSlug}
                  onChange={e => handleSlugChange(e.target.value)}
                  disabled={!!editingId}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white disabled:opacity-60"
                >
                  {KPI_OPTIONS.map(k => (
                    <option key={k.slug} value={k.slug}>{k.label}</option>
                  ))}
                </select>
              </div>

              {/* Period Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de periodo</label>
                <select
                  value={formPeriodType}
                  onChange={e => setFormPeriodType(e.target.value)}
                  disabled={!!editingId}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white disabled:opacity-60"
                >
                  {PERIOD_TYPES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Period Start */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio del periodo</label>
                <input
                  type="date"
                  value={formPeriodStart}
                  onChange={e => setFormPeriodStart(e.target.value)}
                  disabled={!!editingId}
                  className="w-full border rounded-md px-3 py-2 text-sm disabled:opacity-60"
                />
              </div>

              {/* Target Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de la meta ({formTargetUnit})
                </label>
                <input
                  type="number"
                  value={formTargetValue}
                  onChange={e => setFormTargetValue(e.target.value)}
                  placeholder="Ej: 150000"
                  step="0.01"
                  min="0.01"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Zone (optional) */}
              {!editingId && zones.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zona (opcional)</label>
                  <select
                    value={formZoneId}
                    onChange={e => setFormZoneId(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Global (toda la marca)</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas opcionales..."
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                  maxLength={500}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
