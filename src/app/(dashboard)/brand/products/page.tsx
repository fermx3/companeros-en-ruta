'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback'
import { Package, Plus, Edit2, Trash2, ChevronDown, ChevronRight, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductVariant {
  id: string
  public_id: string
  variant_name: string
  variant_code: string
  barcode: string | null
  price: number
  cost: number | null
  size_value: number
  size_unit: string
  package_type: string | null
  is_active: boolean
  is_default: boolean
}

interface Product {
  id: string
  public_id: string
  name: string
  code: string
  description: string | null
  barcode: string | null
  base_price: number
  cost: number | null
  is_active: boolean
  is_featured: boolean
  created_at: string
  product_categories: {
    id: string
    name: string
    code: string
  } | null
  product_variants: ProductVariant[]
}

interface Category {
  id: string
  name: string
  code: string
}

const SIZE_UNITS: Record<string, string> = {
  ml: 'ml',
  g: 'g',
  kg: 'kg',
  l: 'L',
  unidades: 'unidades'
}

interface Brand {
  id: string
  name: string
}

export default function BrandProductsPage() {
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [includeInactive, setIncludeInactive] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category_id: '',
    base_price: '',
    cost: '',
    barcode: ''
  })

  const [variantFormData, setVariantFormData] = useState<{
    id?: string
    variant_name: string
    variant_code: string
    price: string
    cost: string
    size_value: string
    size_unit: string
    package_type: string
    barcode: string
    _action?: string
  }[]>([])

  const loadProducts = useCallback(async (brandId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        dashboard: 'true',
        include_inactive: includeInactive.toString()
      })

      // Use provided brandId or selected one
      const targetBrandId = brandId || selectedBrandId
      if (targetBrandId) {
        params.set('brand_id', targetBrandId)
      }

      const response = await brandFetch(`/api/brand/products?${params}`)

      if (!response.ok) {
        const errorData = await response.json()
        const errorMsg = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Error al cargar productos'
        throw new Error(errorMsg)
      }

      const data = await response.json()
      setProducts(data.products || [])
      setCategories(data.categories || [])

      // Update available brands and selected brand
      if (data.availableBrands) {
        setAvailableBrands(data.availableBrands)
      }
      if (data.currentBrandId && !selectedBrandId) {
        setSelectedBrandId(data.currentBrandId)
      }

    } catch (err) {
      console.error('Error loading products:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar productos: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [includeInactive, selectedBrandId, brandFetch, currentBrandId])

  const handleBrandChange = (newBrandId: string) => {
    setSelectedBrandId(newBrandId)
    loadProducts(newBrandId)
  }

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = editingProduct
        ? `/api/brand/products/${editingProduct.id}`
        : '/api/brand/products'

      const payload = {
        ...formData,
        brand_id: selectedBrandId,
        base_price: parseFloat(formData.base_price) || 0,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        variants: variantFormData.map(v => ({
          ...v,
          price: parseFloat(v.price) || 0,
          cost: v.cost ? parseFloat(v.cost) : null,
          size_value: parseFloat(v.size_value) || 0
        }))
      }

      const response = await brandFetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar producto')
      }

      await loadProducts()
      resetForm()

    } catch (err) {
      console.error('Error saving product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    setDeleting(id)
    try {
      const response = await brandFetch(`/api/brand/products/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar producto')
      }

      await loadProducts()
    } catch (err) {
      console.error('Error deleting product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setDeleting(null)
    }
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      code: product.code,
      description: product.description || '',
      category_id: product.product_categories?.id || '',
      base_price: product.base_price.toString(),
      cost: product.cost?.toString() || '',
      barcode: product.barcode || ''
    })
    setVariantFormData(product.product_variants.map(v => ({
      id: v.id,
      variant_name: v.variant_name,
      variant_code: v.variant_code,
      price: v.price.toString(),
      cost: v.cost?.toString() || '',
      size_value: v.size_value.toString(),
      size_unit: v.size_unit,
      package_type: v.package_type || '',
      barcode: v.barcode || ''
    })))
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      code: '',
      description: '',
      category_id: '',
      base_price: '',
      cost: '',
      barcode: ''
    })
    setVariantFormData([])
  }

  const addVariant = () => {
    setVariantFormData(prev => [...prev, {
      variant_name: '',
      variant_code: '',
      price: formData.base_price,
      cost: formData.cost,
      size_value: '',
      size_unit: 'g',
      package_type: '',
      barcode: '',
      _action: 'create'
    }])
  }

  const updateVariant = (index: number, field: string, value: string) => {
    setVariantFormData(prev => prev.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    ))
  }

  const removeVariant = (index: number) => {
    setVariantFormData(prev => prev.filter((_, i) => i !== index))
  }

  const toggleProductExpand = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando productos...</p>
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
                      <span className="ml-4 text-gray-900 font-medium">Productos</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Catálogo de Productos
              </h1>
              <p className="text-gray-600 mt-1">
                Administra los productos y presentaciones de tu marca
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Brand Selector */}
              {availableBrands.length > 1 && (
                <select
                  value={selectedBrandId || ''}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {availableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              )}
              {availableBrands.length === 1 && (
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-md">
                  {availableBrands[0].name}
                </span>
              )}
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  className="mr-2 rounded border-gray-300"
                />
                Mostrar inactivos
              </label>
              <Button onClick={() => setShowForm(true)} disabled={showForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
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
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Ej: Coca-Cola Original"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código/SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Ej: CC-ORIG"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Base *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.base_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cost}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código de Barras
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="7501234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Descripción del producto..."
                  />
                </div>

                {/* Variants */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Presentaciones</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Presentación
                    </Button>
                  </div>

                  {variantFormData.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      Agrega presentaciones (ej: 355ml Lata, 600ml Botella)
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {variantFormData.map((variant, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              Presentación {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Nombre *
                              </label>
                              <input
                                type="text"
                                value={variant.variant_name}
                                onChange={(e) => updateVariant(index, 'variant_name', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="355ml Lata"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Código *
                              </label>
                              <input
                                type="text"
                                value={variant.variant_code}
                                onChange={(e) => updateVariant(index, 'variant_code', e.target.value.toUpperCase())}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="CC-ORIG-355"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Precio *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Costo
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.cost}
                                onChange={(e) => updateVariant(index, 'cost', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Tamaño *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.size_value}
                                onChange={(e) => updateVariant(index, 'size_value', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="355"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Unidad *
                              </label>
                              <select
                                value={variant.size_unit}
                                onChange={(e) => updateVariant(index, 'size_unit', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                              >
                                {Object.entries(SIZE_UNITS).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Tipo Empaque
                              </label>
                              <input
                                type="text"
                                value={variant.package_type}
                                onChange={(e) => updateVariant(index, 'package_type', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Lata, Botella..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Código Barras
                              </label>
                              <input
                                type="text"
                                value={variant.barcode}
                                onChange={(e) => updateVariant(index, 'barcode', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
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
                    {saving ? <LoadingSpinner size="sm" /> : (editingProduct ? 'Guardar Cambios' : 'Crear Producto')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        {products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-16 h-16" />}
            title="No hay productos"
            description="Agrega productos a tu catálogo para que los promotores puedan verificar precios en las visitas."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id} className={cn(
                "hover:shadow-md transition-shadow",
                !product.is_active && "opacity-60"
              )}>
                <div className="p-4">
                  {/* Product Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <button
                        type="button"
                        onClick={() => toggleProductExpand(product.id)}
                        className="mt-1 p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedProducts.has(product.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-500">{product.code}</span>
                          {product.product_categories && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {product.product_categories.name}
                            </span>
                          )}
                          <StatusBadge
                            status={product.is_active ? 'active' : 'inactive'}
                            size="sm"
                          />
                          {product.is_featured && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                              Destacado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(product.base_price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.product_variants.length} presentacion{product.product_variants.length !== 1 ? 'es' : ''}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(product)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === product.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Variants */}
                  {expandedProducts.has(product.id) && product.product_variants.length > 0 && (
                    <div className="mt-4 ml-16 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Presentaciones</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {product.product_variants.map((variant) => (
                          <div
                            key={variant.id}
                            className={cn(
                              "bg-gray-50 rounded-lg p-3 border",
                              variant.is_default && "border-blue-300 bg-blue-50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 text-sm">
                                {variant.variant_name}
                              </span>
                              {variant.is_default && (
                                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Precio:</span>
                                <span className="font-medium text-gray-900 flex items-center">
                                  <DollarSign className="w-3 h-3 mr-0.5" />
                                  {formatPrice(variant.price)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Tamaño:</span>
                                <span className="text-gray-700">
                                  {variant.size_value}{SIZE_UNITS[variant.size_unit] || variant.size_unit}
                                </span>
                              </div>
                              {variant.package_type && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Empaque:</span>
                                  <span className="text-gray-700">{variant.package_type}</span>
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1">
                                {variant.variant_code}
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
