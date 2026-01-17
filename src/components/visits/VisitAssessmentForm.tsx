'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

interface VisitAssessmentFormProps {
  visit: {
    id: string
    assessment?: {
      product_visibility: 'visible' | 'limited' | 'not_visible' | null
      package_condition: 'good' | 'fair' | 'poor' | null
      observed_price: number | null
      suggested_price: number | null
      comments: string | null
    }
  }
  onSave: (data: any) => Promise<void>
}

export function VisitAssessmentForm({ visit, onSave }: VisitAssessmentFormProps) {
  const [formData, setFormData] = useState({
    product_visibility: visit.assessment?.product_visibility || null,
    package_condition: visit.assessment?.package_condition || null,
    observed_price: visit.assessment?.observed_price || 0,
    suggested_price: visit.assessment?.suggested_price || 0,
    comments: visit.assessment?.comments || ''
  })

  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Check if there are changes
    const originalData = {
      product_visibility: visit.assessment?.product_visibility || null,
      package_condition: visit.assessment?.package_condition || null,
      observed_price: visit.assessment?.observed_price || 0,
      suggested_price: visit.assessment?.suggested_price || 0,
      comments: visit.assessment?.comments || ''
    }

    const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasChanges(hasChanged)
  }, [formData, visit.assessment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    setSaving(true)
    try {
      await onSave(formData)
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving assessment:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Assessment de Producto
        </h2>
        <p className="text-sm text-gray-600">
          Evalúa la visibilidad, estado del empaque y precios del producto
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visibilidad del producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibilidad del producto *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'visible', label: '✅ Visible', desc: 'Bien posicionado' },
              { value: 'limited', label: '🟡 Limitada', desc: 'Posición regular' },
              { value: 'not_visible', label: '❌ No visible', desc: 'Mal posicionado' }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField('product_visibility', option.value)}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  formData.product_visibility === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Estado del empaque */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado del empaque *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'good', label: '✅ Bueno', desc: 'Sin daños' },
              { value: 'fair', label: '🟡 Regular', desc: 'Daños menores' },
              { value: 'poor', label: '❌ Malo', desc: 'Daños evidentes' }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField('package_condition', option.value)}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  formData.package_condition === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Precios */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio observado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.observed_price}
                onChange={(e) => updateField('observed_price', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio sugerido
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.suggested_price}
                onChange={(e) => updateField('suggested_price', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Comentarios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentarios adicionales
          </label>
          <textarea
            value={formData.comments}
            onChange={(e) => updateField('comments', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Observaciones sobre la visita..."
          />
        </div>

        {/* Submit button */}
        {hasChanges && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={saving || !formData.product_visibility || !formData.package_condition}
              className="w-full sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Assessment'}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
