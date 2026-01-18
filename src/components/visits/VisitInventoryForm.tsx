'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Package, X } from 'lucide-react'

interface InventoryItem {
  product_id: string
  product_name?: string
  current_stock: number
  notes?: string | null
}

interface VisitInventoryFormProps {
  visit: {
    id: string
    inventory?: InventoryItem[]
  }
  onSave: (data: any) => Promise<void>
}

export function VisitInventoryForm({ visit, onSave }: VisitInventoryFormProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(
    visit.inventory || []
  )
  const [skippedInventory, setSkippedInventory] = useState(false)
  const [saving, setSaving] = useState(false)

  // Mock products - en producción vendrían de una API
  const availableProducts = [
    { id: '1', name: 'Producto A - 500g' },
    { id: '2', name: 'Producto B - 1kg' },
    { id: '3', name: 'Producto C - 250g' },
  ]

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
      if (skippedInventory) {
        await onSave({ inventory_skipped: true, items: [] })
      } else {
        const validItems = inventoryItems.filter(item =>
          item.product_id && item.current_stock >= 0
        )
        await onSave({ inventory_skipped: false, items: validItems })
      }
    } catch (error) {
      console.error('Error saving inventory:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Inventario de Productos
        </h2>
        <p className="text-sm text-gray-600">
          Registra el stock actual de productos en el punto de venta (opcional)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Skip inventory option */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={skippedInventory}
              onChange={(e) => setSkippedInventory(e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              No se tomó inventario en esta visita
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Marcar si no fue posible realizar el conteo de productos
          </p>
        </div>

        {!skippedInventory && (
          <>
            {/* Inventory items */}
            <div className="space-y-4">
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
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={addInventoryItem}
                className="w-full border-dashed"
              >
                <Package className="mr-2 h-4 w-4" />
                Agregar producto al inventario
              </Button>
            </div>
          </>
        )}

        {/* Submit button */}
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
      </form>
    </div>
  )
}
