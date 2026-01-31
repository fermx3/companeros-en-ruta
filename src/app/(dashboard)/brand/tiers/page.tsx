'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { Award, Users, Plus, Pencil, Trash2, Star, Percent, X } from 'lucide-react'

interface BrandTier {
  id: string
  public_id: string
  name: string
  tier_level: number
  min_points_required: number
  min_visits_required: number
  min_purchases_required: number
  points_multiplier: number
  discount_percentage: number
  benefits: Record<string, unknown> | null
  tier_color: string | null
  is_default: boolean
  is_active: boolean
  member_count: number
}

interface TierFormData {
  name: string
  tier_level: number
  min_points_required: number
  min_visits_required: number
  min_purchases_required: number
  points_multiplier: number
  discount_percentage: number
  tier_color: string
  is_default: boolean
  is_active: boolean
}

const defaultFormData: TierFormData = {
  name: '',
  tier_level: 1,
  min_points_required: 0,
  min_visits_required: 0,
  min_purchases_required: 0,
  points_multiplier: 1,
  discount_percentage: 0,
  tier_color: '#6366F1',
  is_default: false,
  is_active: true
}

function TierFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  saving
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TierFormData) => void
  initialData: TierFormData
  isEditing: boolean
  saving: boolean
}) {
  const [formData, setFormData] = useState<TierFormData>(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Editar Nivel' : 'Crear Nuevo Nivel'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del nivel *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de nivel *
              </label>
              <input
                type="number"
                min="1"
                value={formData.tier_level}
                onChange={(e) => setFormData({ ...formData, tier_level: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">1 = más bajo, números mayores = niveles más altos</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={formData.tier_color}
                  onChange={(e) => setFormData({ ...formData, tier_color: e.target.value })}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.tier_color}
                  onChange={(e) => setFormData({ ...formData, tier_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-md font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Requisitos</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Puntos mínimos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.min_points_required}
                  onChange={(e) => setFormData({ ...formData, min_points_required: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Visitas mínimas
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.min_visits_required}
                  onChange={(e) => setFormData({ ...formData, min_visits_required: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Compras mínimas
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.min_purchases_required}
                  onChange={(e) => setFormData({ ...formData, min_purchases_required: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Beneficios</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Multiplicador de puntos
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.points_multiplier}
                  onChange={(e) => setFormData({ ...formData, points_multiplier: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Ej: 1.5 = 50% más puntos</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  % Descuento
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Nivel predeterminado para nuevos miembros</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Nivel activo</span>
            </label>
          </div>

          <div className="border-t pt-4 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <LoadingSpinner size="sm" className="mr-2" />}
              {isEditing ? 'Guardar cambios' : 'Crear nivel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BrandTiersPage() {
  const [tiers, setTiers] = useState<BrandTier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<BrandTier | null>(null)
  const [saving, setSaving] = useState(false)

  const loadTiers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/brand/tiers')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar niveles')
      }

      const data = await response.json()
      setTiers(data.tiers || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTiers()
  }, [loadTiers])

  const handleCreate = () => {
    setEditingTier(null)
    setModalOpen(true)
  }

  const handleEdit = (tier: BrandTier) => {
    setEditingTier(tier)
    setModalOpen(true)
  }

  const handleDelete = async (tier: BrandTier) => {
    if (!confirm(`¿Estás seguro de eliminar el nivel "${tier.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/brand/tiers/${tier.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar nivel')
      }

      setSuccessMessage('Nivel eliminado correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
      loadTiers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    }
  }

  const handleSubmit = async (formData: TierFormData) => {
    try {
      setSaving(true)
      setError(null)

      const url = editingTier
        ? `/api/brand/tiers/${editingTier.id}`
        : '/api/brand/tiers'
      const method = editingTier ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar nivel')
      }

      setSuccessMessage(editingTier ? 'Nivel actualizado correctamente' : 'Nivel creado correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
      setModalOpen(false)
      loadTiers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const getFormData = (): TierFormData => {
    if (editingTier) {
      return {
        name: editingTier.name,
        tier_level: editingTier.tier_level,
        min_points_required: editingTier.min_points_required,
        min_visits_required: editingTier.min_visits_required,
        min_purchases_required: editingTier.min_purchases_required,
        points_multiplier: editingTier.points_multiplier,
        discount_percentage: editingTier.discount_percentage,
        tier_color: editingTier.tier_color || '#6366F1',
        is_default: editingTier.is_default,
        is_active: editingTier.is_active
      }
    }
    // For new tier, suggest next tier_level
    const maxLevel = tiers.reduce((max, t) => Math.max(max, t.tier_level), 0)
    return { ...defaultFormData, tier_level: maxLevel + 1 }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando niveles...</p>
        </div>
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
                    <Link href="/brand" className="text-gray-400 hover:text-gray-500">
                      Marca
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Niveles</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Niveles de Membresía
              </h1>
              <p className="text-gray-600 mt-1">
                Configura los niveles y beneficios para tus clientes
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Nivel
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

        {successMessage && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {tiers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Award className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Sin niveles configurados</h3>
                <p className="mt-2 text-gray-500">
                  Crea tu primer nivel de membresía para empezar a categorizar a tus clientes.
                </p>
                <Button onClick={handleCreate} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer nivel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <Card key={tier.id} className={`overflow-hidden ${!tier.is_active ? 'opacity-60' : ''}`}>
                <div
                  className="h-2"
                  style={{ backgroundColor: tier.tier_color || '#6366F1' }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: tier.tier_color || '#6366F1' }}
                      >
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {tier.name}
                          {tier.is_default && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Predeterminado
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>Nivel {tier.tier_level}</CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(tier)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {!tier.is_default && (
                        <button
                          onClick={() => handleDelete(tier)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Member count */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Miembros</span>
                    </div>
                    <span className="font-semibold text-gray-900">{tier.member_count}</span>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Requisitos</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Puntos mínimos</span>
                        <span className="font-medium">{tier.min_points_required.toLocaleString()}</span>
                      </div>
                      {tier.min_visits_required > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Visitas mínimas</span>
                          <span className="font-medium">{tier.min_visits_required}</span>
                        </div>
                      )}
                      {tier.min_purchases_required > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Compras mínimas</span>
                          <span className="font-medium">{tier.min_purchases_required}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Beneficios</h4>
                    <div className="flex flex-wrap gap-2">
                      {tier.points_multiplier > 1 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          <Star className="h-3 w-3 mr-1" />
                          {tier.points_multiplier}x puntos
                        </span>
                      )}
                      {tier.discount_percentage > 0 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          <Percent className="h-3 w-3 mr-1" />
                          {tier.discount_percentage}% descuento
                        </span>
                      )}
                      {tier.points_multiplier <= 1 && tier.discount_percentage <= 0 && (
                        <span className="text-xs text-gray-400">Sin beneficios adicionales</span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  {!tier.is_active && (
                    <div className="pt-2 border-t">
                      <span className="text-xs text-orange-600 font-medium">Nivel inactivo</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TierFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={getFormData()}
        isEditing={!!editingTier}
        saving={saving}
      />
    </div>
  )
}
