'use client'

import { useState } from 'react'
import { Plus, Trash2, Building2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CompetitorProduct {
  id: string
  product_name: string
  default_size_grams: number | null
  default_size_ml: number | null
  brand_competitor_product_sizes: Array<{
    id: string
    size_value: number
    size_unit: string
  }>
}

export interface Competitor {
  id: string
  competitor_name: string
  logo_url: string | null
  brand_competitor_products: CompetitorProduct[]
}

export interface CompetitorAssessment {
  competitor_id: string
  competitor_product_id: string | null
  product_name_observed: string
  size_grams: number | null
  observed_price: number | null
  has_active_promotion: boolean
  promotion_description: string
  has_pop_material: boolean
}

interface CompetitorProductsFormProps {
  competitors: Competitor[]
  assessments: CompetitorAssessment[]
  onAssessmentsChange: (assessments: CompetitorAssessment[]) => void
  className?: string
}

export function CompetitorProductsForm({
  competitors,
  assessments,
  onAssessmentsChange,
  className
}: CompetitorProductsFormProps) {
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null)

  const addAssessment = (competitorId: string) => {
    const newAssessment: CompetitorAssessment = {
      competitor_id: competitorId,
      competitor_product_id: null,
      product_name_observed: '',
      size_grams: null,
      observed_price: null,
      has_active_promotion: false,
      promotion_description: '',
      has_pop_material: false
    }
    onAssessmentsChange([...assessments, newAssessment])
  }

  const updateAssessment = (index: number, updates: Partial<CompetitorAssessment>) => {
    onAssessmentsChange(
      assessments.map((a, i) => (i === index ? { ...a, ...updates } : a))
    )
  }

  const removeAssessment = (index: number) => {
    onAssessmentsChange(assessments.filter((_, i) => i !== index))
  }

  const getCompetitorAssessments = (competitorId: string) => {
    return assessments
      .map((a, index) => ({ ...a, index }))
      .filter(a => a.competitor_id === competitorId)
  }

  const getCompetitor = (competitorId: string) => {
    return competitors.find(c => c.id === competitorId)
  }

  if (competitors.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-sm text-gray-600">
          No hay competidores configurados para esta marca.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Configura competidores en el panel de marca para poder registrar sus precios.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Precios de Competencia</h3>
      </div>

      {/* Competitors list */}
      <div className="space-y-3">
        {competitors.map((competitor) => {
          const competitorAssessments = getCompetitorAssessments(competitor.id)
          const isExpanded = expandedCompetitor === competitor.id

          return (
            <div key={competitor.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Competitor header */}
              <button
                type="button"
                onClick={() => setExpandedCompetitor(isExpanded ? null : competitor.id)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {competitor.logo_url ? (
                    <img
                      src={competitor.logo_url}
                      alt={competitor.competitor_name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{competitor.competitor_name}</p>
                    <p className="text-xs text-gray-500">
                      {competitorAssessments.length} producto{competitorAssessments.length !== 1 ? 's' : ''} registrado{competitorAssessments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className="text-gray-400">{isExpanded ? '−' : '+'}</span>
              </button>

              {/* Assessments */}
              {isExpanded && (
                <div className="p-3 space-y-3 border-t">
                  {competitorAssessments.map((assessment) => {
                    const selectedProduct = competitor.brand_competitor_products.find(
                      p => p.id === assessment.competitor_product_id
                    )

                    return (
                      <div
                        key={assessment.index}
                        className="bg-white border border-gray-100 rounded-lg p-3 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            {/* Product selector or custom name */}
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Producto
                              </label>
                              <select
                                value={assessment.competitor_product_id || ''}
                                onChange={(e) => {
                                  const productId = e.target.value || null
                                  const product = competitor.brand_competitor_products.find(p => p.id === productId)
                                  updateAssessment(assessment.index, {
                                    competitor_product_id: productId,
                                    product_name_observed: product?.product_name || '',
                                    size_grams: product?.default_size_grams || null
                                  })
                                }}
                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Otro producto...</option>
                                {competitor.brand_competitor_products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.product_name}
                                    {product.default_size_grams && ` (${product.default_size_grams}g)`}
                                    {product.default_size_ml && ` (${product.default_size_ml}ml)`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Custom product name (if no product selected) */}
                            {!assessment.competitor_product_id && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Nombre observado
                                </label>
                                <input
                                  type="text"
                                  value={assessment.product_name_observed}
                                  onChange={(e) => updateAssessment(assessment.index, { product_name_observed: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Nombre del producto"
                                />
                              </div>
                            )}

                            {/* Size selector */}
                            {selectedProduct?.brand_competitor_product_sizes?.length ? (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Tamaño
                                </label>
                                <select
                                  value={assessment.size_grams || ''}
                                  onChange={(e) => updateAssessment(assessment.index, { size_grams: parseInt(e.target.value) || null })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {selectedProduct.brand_competitor_product_sizes.map((size) => (
                                    <option key={size.id} value={size.size_value}>
                                      {size.size_value}{size.size_unit}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Tamaño (g)
                                </label>
                                <input
                                  type="number"
                                  value={assessment.size_grams || ''}
                                  onChange={(e) => updateAssessment(assessment.index, { size_grams: parseInt(e.target.value) || null })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Ej: 500"
                                />
                              </div>
                            )}

                            {/* Price */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Precio observado
                              </label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={assessment.observed_price || ''}
                                  onChange={(e) => updateAssessment(assessment.index, { observed_price: parseFloat(e.target.value) || null })}
                                  className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAssessment(assessment.index)}
                            className="ml-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex flex-wrap gap-4 pt-2 border-t">
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={assessment.has_active_promotion}
                              onChange={(e) => updateAssessment(assessment.index, { has_active_promotion: e.target.checked })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Promoción activa
                          </label>

                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={assessment.has_pop_material}
                              onChange={(e) => updateAssessment(assessment.index, { has_pop_material: e.target.checked })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Material POP visible
                          </label>
                        </div>

                        {/* Promotion description */}
                        {assessment.has_active_promotion && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Descripción de promoción
                            </label>
                            <input
                              type="text"
                              value={assessment.promotion_description}
                              onChange={(e) => updateAssessment(assessment.index, { promotion_description: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Ej: 2x1, 10% descuento..."
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Add product button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAssessment(competitor.id)}
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar producto de {competitor.competitor_name}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
