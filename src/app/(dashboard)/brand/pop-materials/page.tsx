'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback'
import { Layers, Plus, Edit2, Trash2, Tag } from 'lucide-react'
import { ExportButton } from '@/components/ui/export-button'
import { usePageTitle } from '@/hooks/usePageTitle'

interface POPMaterial {
  id: string
  public_id: string
  material_name: string
  material_category: string | null
  is_system_template: boolean
  is_active: boolean
  display_order: number
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  poster: 'Poster',
  exhibidor: 'Exhibidor',
  senalizacion: 'Señalización',
  colgante: 'Colgante',
  banner: 'Banner',
  otro: 'Otro'
}

const CATEGORY_COLORS: Record<string, string> = {
  poster: 'bg-blue-100 text-blue-700',
  exhibidor: 'bg-green-100 text-green-700',
  senalizacion: 'bg-yellow-100 text-yellow-700',
  colgante: 'bg-purple-100 text-purple-700',
  banner: 'bg-red-100 text-red-700',
  otro: 'bg-gray-100 text-gray-700'
}

export default function BrandPOPMaterialsPage() {
  usePageTitle('Material POP')
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [materials, setMaterials] = useState<POPMaterial[]>([])
  const [systemTemplates, setSystemTemplates] = useState<POPMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<POPMaterial | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [formData, setFormData] = useState({
    material_name: '',
    material_category: ''
  })

  useEffect(() => {
    if (!currentBrandId) return

    const controller = new AbortController()

    const loadMaterials = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await brandFetch('/api/brand/pop-materials?include_system=true', { signal: controller.signal })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar materiales')
        }

        const data = await response.json()
        setMaterials(data.materials || [])
        setSystemTemplates(data.systemTemplates || [])

      } catch (err) {
        if (controller.signal.aborted) return
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(`Error al cargar materiales: ${errorMessage}`)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadMaterials()
    return () => controller.abort()
  }, [brandFetch, currentBrandId, refreshKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = editingMaterial
        ? `/api/brand/pop-materials/${editingMaterial.id}`
        : '/api/brand/pop-materials'

      const response = await brandFetch(url, {
        method: editingMaterial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar material')
      }

      setRefreshKey(k => k + 1)
      resetForm()

    } catch (err) {
      console.error('Error saving material:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este material?')) return

    setDeleting(id)
    try {
      const response = await brandFetch(`/api/brand/pop-materials/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar material')
      }

      setRefreshKey(k => k + 1)
    } catch (err) {
      console.error('Error deleting material:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setDeleting(null)
    }
  }

  const startEdit = (material: POPMaterial) => {
    setEditingMaterial(material)
    setFormData({
      material_name: material.material_name,
      material_category: material.material_category || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingMaterial(null)
    setFormData({
      material_name: '',
      material_category: ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando materiales POP...</p>
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
                      <span className="ml-4 text-gray-900 font-medium">Materiales POP</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Materiales POP
              </h1>
              <p className="text-gray-600 mt-1">
                Configura los materiales de punto de venta para verificación en visitas
              </p>
            </div>
            <div className="flex space-x-3">
              <ExportButton
                endpoint="/api/brand/pop-materials/export"
                filename="materiales_pop"
              />
              <Button onClick={() => setShowForm(true)} disabled={showForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Material
              </Button>
            </div>
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
              <CardTitle>
                {editingMaterial ? 'Editar Material' : 'Nuevo Material POP'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Material *
                    </label>
                    <input
                      type="text"
                      value={formData.material_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, material_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={formData.material_category}
                      onChange={(e) => setFormData(prev => ({ ...prev, material_category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <LoadingSpinner size="sm" /> : (editingMaterial ? 'Guardar Cambios' : 'Crear Material')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* System Templates */}
        {systemTemplates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Materiales del Sistema</h2>
            <p className="text-sm text-gray-500 mb-4">
              Estos materiales están disponibles para todas las marcas y no pueden ser modificados.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {systemTemplates.map((material) => (
                <div key={material.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{material.material_name}</span>
                  </div>
                  {material.material_category && (
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[material.material_category] || CATEGORY_COLORS.otro}`}>
                      {CATEGORY_LABELS[material.material_category] || material.material_category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Materials */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Materiales de tu Marca</h2>
          {materials.length === 0 ? (
            <EmptyState
              icon={<Layers className="w-16 h-16" />}
              title="No hay materiales personalizados"
              description="Agrega materiales POP específicos de tu marca para verificar en las visitas."
              action={
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Material
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Layers className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{material.material_name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {material.material_category && (
                              <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[material.material_category] || CATEGORY_COLORS.otro}`}>
                                {CATEGORY_LABELS[material.material_category] || material.material_category}
                              </span>
                            )}
                            <StatusBadge
                              status={material.is_active ? 'active' : 'inactive'}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(material)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                          disabled={deleting === material.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === material.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
