'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Package, X, Loader2 } from 'lucide-react'

interface InventoryItem {
  product_id: string
  product_name?: string
  current_stock: number
  notes?: string | null
}

interface Product {
  id: string
  name: string
  sku?: string
  product_variants?: Array<{
    id: string
    variant_name: string
    size_value: number
    size_unit: string
  }>
}

interface VisitInventoryFormProps {
  visit: {
    id: string
    inventory?: InventoryItem[]
  }
  brandId?: string
  products?: Product[]
  onSave: (data: any) => Promise<void>
}

export function VisitInventoryForm({ visit, brandId, products: propProducts, onSave }: VisitInventoryFormProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(
    visit.inventory || []
  )
  const [saving, setSaving] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [products, setProducts] = useState<Product[]>(propProducts || [])

  // Load products if not provided via props
  useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      setProducts(propProducts)
      return
    }

    if (!brandId) return

    const loadProducts = async () => {
      setLoadingProducts(true)
      try {
        const response = await fetch(`/api/brand/products?brand_id=${brandId}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()
  }, [brandId, propProducts])

  // Build a flat list of products (with variants if available)
  const availableProducts = products.flatMap(product => {
    if (product.product_variants && product.product_variants.length > 0) {
      return product.product_variants.map(variant => ({
        id: `${product.id}:${variant.id}`,
        name: `${product.name} - ${variant.variant_name} (${variant.size_value}${variant.size_unit})`
      }))
    }
    return [{ id: product.id, name: product.name }]
  })

  const addInventoryItem = () => {
    setInventoryItems(prev => [
      ...prev,
      {
        product_id: '',
        current_stock: 0,
        notes: ''
      }
    ])
  }

  const removeInventoryItem = (index: number) => {
    setInventoryItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateInventoryItem = (index: number, field: keyof InventoryItem, value: any) => {
    setInventoryItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const validItems = inventoryItems.filter(item =>
        item.product_id && item.current_stock >= 0
      )
      await onSave({ inventory_skipped: false, items: validItems })
    } catch (error) {
      console.error('Error saving inventory:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando productos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No hay productos configurados para esta marca</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inventory items */}
          <div className="space-y-3">
            {inventoryItems.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Product selection */}
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Producto
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) => updateInventoryItem(index, 'product_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar producto</option>
                        {availableProducts.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stock quantity */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock actual
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.current_stock}
                        onChange={(e) => updateInventoryItem(index, 'current_stock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas
                      </label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updateInventoryItem(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Observaciones..."
                      />
                    </div>

                    {/* Remove button */}
                    <div className="md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeInventoryItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {/* Add item button */}
          <Button
            type="button"
            variant="outline"
            onClick={addInventoryItem}
            className="w-full border-dashed"
          >
            <Package className="mr-2 h-4 w-4" />
            Agregar producto al inventario
          </Button>

          {/* Submit button */}
          {inventoryItems.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Inventario'}
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
