'use client'

import React, { useState, useEffect } from 'react'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback'
import { Switch } from '@/components/ui/switch'
import { Package, ClipboardCheck } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

interface ProductVariant {
  id: string
  variant_name: string
}

interface Product {
  id: string
  name: string
  sku: string
  is_active: boolean
  include_in_assessment: boolean
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

export default function AssessmentConfigPage() {
  usePageTitle('Configuración de Evaluación')
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!currentBrandId) return

    const controller = new AbortController()

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await brandFetch('/api/brand/products?dashboard=true', { signal: controller.signal })
        if (!res.ok) throw new Error('Error al cargar productos')
        const data = await res.json()
        setProducts(data.products || [])
        setCategories(data.categories || [])
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchProducts()
    return () => controller.abort()
  }, [brandFetch, currentBrandId])

  const handleToggle = async (product: Product) => {
    const newValue = !product.include_in_assessment
    setSaving(prev => ({ ...prev, [product.id]: true }))

    // Optimistic update
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id ? { ...p, include_in_assessment: newValue } : p
      )
    )

    try {
      const res = await brandFetch(`/api/brand/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ include_in_assessment: newValue }),
      })

      if (!res.ok) {
        throw new Error('Error al actualizar producto')
      }
    } catch {
      // Revert on error
      setProducts(prev =>
        prev.map(p =>
          p.id === product.id ? { ...p, include_in_assessment: !newValue } : p
        )
      )
      setError('Error al guardar cambio. Intenta de nuevo.')
    } finally {
      setSaving(prev => ({ ...prev, [product.id]: false }))
    }
  }

  // Group products by category
  const productsByCategory = categories
    .map(cat => ({
      category: cat,
      products: products.filter(p => p.product_categories?.id === cat.id),
    }))
    .filter(group => group.products.length > 0)

  // Products without category
  const uncategorized = products.filter(p => !p.product_categories)

  const includedCount = products.filter(p => p.include_in_assessment).length

  if (!currentBrandId) {
    return (
      <div className="p-6">
        <Alert variant="warning">Selecciona una marca para configurar el assessment.</Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Assessment</h1>
        <p className="text-gray-500 mt-1">
          Selecciona los productos que aparecerán en el assessment del Promotor durante las visitas.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10 text-gray-400" />}
          title="Sin productos"
          description="No hay productos activos para esta marca. Crea productos desde la sección de Productos."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{includedCount}</span> de{' '}
                <span className="font-semibold text-gray-900">{products.length}</span>{' '}
                productos incluidos en el assessment.
              </p>
            </CardContent>
          </Card>

          {productsByCategory.map(({ category, products: catProducts }) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-base">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {catProducts.map(product => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      saving={saving[product.id] || false}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {uncategorized.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sin categoría</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {uncategorized.map(product => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      saving={saving[product.id] || false}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function ProductRow({
  product,
  saving,
  onToggle,
}: {
  product: Product
  saving: boolean
  onToggle: (product: Product) => void
}) {
  const variantCount = product.product_variants?.length || 0

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Package className="h-4 w-4 text-gray-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-500">
            SKU: {product.sku}
            {variantCount > 0 && (
              <> · {variantCount} variante{variantCount !== 1 ? 's' : ''}</>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {saving && (
          <span className="text-xs text-gray-400">Guardando...</span>
        )}
        <Switch
          checked={product.include_in_assessment}
          onCheckedChange={() => onToggle(product)}
          disabled={saving}
        />
      </div>
    </div>
  )
}
