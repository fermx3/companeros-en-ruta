'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback'
import { Building2, Plus, Edit2, Trash2, ChevronDown, ChevronRight, Package } from 'lucide-react'

interface ProductSize {
  id: string
  size_value: number
  size_unit: string
  is_default: boolean
}

interface CompetitorProduct {
  id: string
  product_name: string
  default_size_grams: number | null
  default_size_ml: number | null
  is_active: boolean
  brand_competitor_product_sizes: ProductSize[]
}

interface Competitor {
  id: string
  public_id: string
  competitor_name: string
  logo_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  brand_competitor_products: CompetitorProduct[]
}

interface CompetitorFormData {
  competitor_name: string
  logo_url: string
  products: Array<{
    id?: string
    product_name: string
    default_size_grams: number | null
    default_size_ml: number | null
    sizes: Array<{
      size_value: number
      size_unit: string
      is_default: boolean
    }>
  }>
}

export default function BrandCompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [formData, setFormData] = useState<CompetitorFormData>({
    competitor_name: '',
    logo_url: '',
    products: []
  })

  const loadCompetitors = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/brand/competitors?include_products=true')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar competidores')
      }

      const data = await response.json()
      setCompetitors(data.competitors || [])

    } catch (err) {
      console.error('Error loading competitors:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar competidores: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCompetitors()
  }, [loadCompetitors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = editingCompetitor
        ? `/api/brand/competitors/${editingCompetitor.id}`
        : '/api/brand/competitors'

      const response = await fetch(url, {
        method: editingCompetitor ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar competidor')
      }

      await loadCompetitors()
      resetForm()

    } catch (err) {
      console.error('Error saving competitor:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este competidor?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/brand/competitors/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar competidor')
      }

      await loadCompetitors()
    } catch (err) {
      console.error('Error deleting competitor:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setDeleting(null)
    }
  }

  const startEdit = (competitor: Competitor) => {
    setEditingCompetitor(competitor)
    setFormData({
      competitor_name: competitor.competitor_name,
      logo_url: competitor.logo_url || '',
      products: competitor.brand_competitor_products.map(p => ({
        id: p.id,
        product_name: p.product_name,
        default_size_grams: p.default_size_grams,
        default_size_ml: p.default_size_ml,
        sizes: p.brand_competitor_product_sizes.map(s => ({
          size_value: s.size_value,
          size_unit: s.size_unit,
          is_default: s.is_default
        }))
      }))
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingCompetitor(null)
    setFormData({
      competitor_name: '',
      logo_url: '',
      products: []
    })
  }

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        product_name: '',
        default_size_grams: null,
        default_size_ml: null,
        sizes: []
      }]
    }))
  }

  const updateProduct = (index: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      )
    }))
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const addSize = (productIndex: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === productIndex
          ? { ...p, sizes: [...p.sizes, { size_value: 0, size_unit: 'g', is_default: false }] }
          : p
      )
    }))
  }

  const updateSize = (productIndex: number, sizeIndex: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === productIndex
          ? {
              ...p,
              sizes: p.sizes.map((s, si) =>
                si === sizeIndex ? { ...s, [field]: value } : s
              )
            }
          : p
      )
    }))
  }

  const removeSize = (productIndex: number, sizeIndex: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === productIndex
          ? { ...p, sizes: p.sizes.filter((_, si) => si !== sizeIndex) }
          : p
      )
    }))
  }

  if (loading && competitors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando competidores...</p>
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
                      <span className="ml-4 text-gray-900 font-medium">Competidores</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Gestión de Competidores
              </h1>
              <p className="text-gray-600 mt-1">
                Configura los competidores y sus productos para seguimiento de precios
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => setShowForm(true)} disabled={showForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Competidor
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
                {editingCompetitor ? 'Editar Competidor' : 'Nuevo Competidor'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Competidor *
                    </label>
                    <input
                      type="text"
                      value={formData.competitor_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, competitor_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL del Logo
                    </label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Products Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium text-gray-900">Productos</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Producto
                    </Button>
                  </div>

                  {formData.products.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay productos. Agrega productos para seguimiento de precios.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {formData.products.map((product, pIdx) => (
                        <div key={pIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Nombre del Producto
                                </label>
                                <input
                                  type="text"
                                  value={product.product_name}
                                  onChange={(e) => updateProduct(pIdx, 'product_name', e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Nombre del producto"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Tamaño por defecto (g)
                                </label>
                                <input
                                  type="number"
                                  value={product.default_size_grams || ''}
                                  onChange={(e) => updateProduct(pIdx, 'default_size_grams', e.target.value ? parseInt(e.target.value) : null)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Ej: 500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Tamaño por defecto (ml)
                                </label>
                                <input
                                  type="number"
                                  value={product.default_size_ml || ''}
                                  onChange={(e) => updateProduct(pIdx, 'default_size_ml', e.target.value ? parseInt(e.target.value) : null)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Ej: 350"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeProduct(pIdx)}
                              className="ml-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Sizes */}
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-gray-600">Variantes de tamaño</span>
                              <Button type="button" variant="outline" size="sm" onClick={() => addSize(pIdx)}>
                                <Plus className="w-3 h-3 mr-1" />
                                Tamaño
                              </Button>
                            </div>
                            {product.sizes.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-1 bg-white px-2 py-1 rounded border">
                                    <input
                                      type="number"
                                      value={size.size_value || ''}
                                      onChange={(e) => updateSize(pIdx, sIdx, 'size_value', parseInt(e.target.value) || 0)}
                                      className="w-16 px-1 py-0.5 text-xs border border-gray-200 rounded"
                                      placeholder="Valor"
                                    />
                                    <select
                                      value={size.size_unit}
                                      onChange={(e) => updateSize(pIdx, sIdx, 'size_unit', e.target.value)}
                                      className="px-1 py-0.5 text-xs border border-gray-200 rounded"
                                    >
                                      <option value="g">g</option>
                                      <option value="ml">ml</option>
                                      <option value="kg">kg</option>
                                      <option value="l">l</option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => removeSize(pIdx, sIdx)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <LoadingSpinner size="sm" /> : (editingCompetitor ? 'Guardar Cambios' : 'Crear Competidor')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Competitors List */}
        {competitors.length === 0 && !showForm ? (
          <EmptyState
            icon={<Building2 className="w-16 h-16" />}
            title="No hay competidores"
            description="Configura los competidores de tu marca para hacer seguimiento de precios en las visitas."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Competidor
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {competitors.map((competitor) => (
              <Card key={competitor.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => setExpandedCompetitor(
                          expandedCompetitor === competitor.id ? null : competitor.id
                        )}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedCompetitor === competitor.id ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      {competitor.logo_url ? (
                        <img
                          src={competitor.logo_url}
                          alt={competitor.competitor_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{competitor.competitor_name}</h3>
                          <StatusBadge
                            status={competitor.is_active ? 'active' : 'inactive'}
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          {competitor.public_id} • {competitor.brand_competitor_products?.length || 0} productos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(competitor)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(competitor.id)}
                        disabled={deleting === competitor.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === competitor.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Products */}
                  {expandedCompetitor === competitor.id && competitor.brand_competitor_products?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Productos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {competitor.brand_competitor_products.filter(p => p.is_active).map((product) => (
                          <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm text-gray-900">{product.product_name}</p>
                                {(product.default_size_grams || product.default_size_ml) && (
                                  <p className="text-xs text-gray-500">
                                    {product.default_size_grams && `${product.default_size_grams}g`}
                                    {product.default_size_grams && product.default_size_ml && ' / '}
                                    {product.default_size_ml && `${product.default_size_ml}ml`}
                                  </p>
                                )}
                                {product.brand_competitor_product_sizes?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {product.brand_competitor_product_sizes.map((size) => (
                                      <span key={size.id} className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                                        {size.size_value}{size.size_unit}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
