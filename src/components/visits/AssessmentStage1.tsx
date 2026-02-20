'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Package, Tag, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PhotoEvidenceUpload, EvidencePhoto } from './PhotoEvidenceUpload'
import { CompetitorProductsForm, Competitor, CompetitorAssessment } from './CompetitorProductsForm'
import { cn } from '@/lib/utils'
import type { WizardData } from './VisitAssessmentWizard'

interface Product {
  id: string
  name: string
  sku: string
  brand_id: string
  product_variants: Array<{
    id: string
    variant_name: string
    size_value: number
    size_unit: string
    suggested_price: number | null
  }>
}

interface BrandProductAssessment {
  product_id: string
  product_variant_id?: string
  current_price: number | null
  suggested_price: number | null
  has_active_promotion: boolean
  promotion_description: string
  has_pop_material: boolean
  is_product_present: boolean
  stock_level: string | null
}

interface AssessmentStage1Props {
  data: WizardData['stage1']
  onDataChange: (updates: Partial<WizardData['stage1']>) => void
  brandId: string
  visitId?: string
  className?: string
}

const STOCK_LEVELS = [
  { value: 'out_of_stock', label: 'Sin stock', color: 'bg-red-100 text-red-700' },
  { value: 'low', label: 'Bajo', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'medium', label: 'Medio', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'Alto', color: 'bg-green-100 text-green-700' }
]

const PRICING_EVIDENCE_TYPES = [
  { value: 'price_tag', label: 'Etiqueta de precio' },
  { value: 'shelf_photo', label: 'Foto de anaquel' },
  { value: 'competitor_display', label: 'Display competencia' },
  { value: 'general', label: 'General' }
]

export function AssessmentStage1({
  data,
  onDataChange,
  brandId,
  visitId,
  className
}: AssessmentStage1Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)

  // Load products and competitors
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [productsRes, competitorsRes] = await Promise.all([
          fetch(`/api/brand/products?brand_id=${brandId}`).catch(() => null),
          fetch(`/api/brand/competitors?brand_id=${brandId}&include_products=true`).catch(() => null)
        ])

        if (productsRes?.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData.products || [])
        }

        if (competitorsRes?.ok) {
          const competitorsData = await competitorsRes.json()
          setCompetitors(competitorsData.competitors || [])
        }
      } catch (error) {
        console.error('Error loading stage 1 data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [brandId])

  // Initialize brand product assessments when products load
  useEffect(() => {
    if (products.length > 0 && data.brandProductAssessments.length === 0) {
      const initialAssessments: BrandProductAssessment[] = []

      products.forEach(product => {
        if (product.product_variants.length > 0) {
          product.product_variants.forEach(variant => {
            initialAssessments.push({
              product_id: product.id,
              product_variant_id: variant.id,
              current_price: null,
              suggested_price: variant.suggested_price,
              has_active_promotion: false,
              promotion_description: '',
              has_pop_material: false,
              is_product_present: true,
              stock_level: null
            })
          })
        } else {
          initialAssessments.push({
            product_id: product.id,
            current_price: null,
            suggested_price: null,
            has_active_promotion: false,
            promotion_description: '',
            has_pop_material: false,
            is_product_present: true,
            stock_level: null
          })
        }
      })

      onDataChange({ brandProductAssessments: initialAssessments })
    }
  }, [products, data.brandProductAssessments.length, onDataChange])

  const updateProductAssessment = (
    productId: string,
    variantId: string | undefined,
    updates: Partial<BrandProductAssessment>
  ) => {
    onDataChange({
      brandProductAssessments: data.brandProductAssessments.map(a =>
        a.product_id === productId && a.product_variant_id === variantId
          ? { ...a, ...updates }
          : a
      )
    })
  }

  const handleEvidenceChange = (photos: EvidencePhoto[]) => {
    onDataChange({
      evidence: photos.map(p => ({
        id: p.id,
        file: p.file,
        previewUrl: p.previewUrl,
        fileUrl: p.fileUrl,
        caption: p.caption,
        evidenceType: p.evidenceType,
        captureLatitude: p.captureLatitude,
        captureLongitude: p.captureLongitude
      }))
    })
  }

  const handleCompetitorAssessmentsChange = (assessments: CompetitorAssessment[]) => {
    onDataChange({ competitorAssessments: assessments })
  }

  if (loading) {
    return (
      <div className={cn('animate-pulse space-y-4', className)}>
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-40 bg-muted rounded" />
        <div className="h-40 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
          Auditoría de Precios y Categoría
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Registra los precios observados de tus productos y la competencia
        </p>
      </div>

      {/* Brand Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Productos de la Marca
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay productos configurados para esta marca
            </p>
          ) : (
            <div className="space-y-4">
              {data.brandProductAssessments.map((assessment, idx) => {
                const product = products.find(p => p.id === assessment.product_id)
                const variant = product?.product_variants.find(v => v.id === assessment.product_variant_id)

                return (
                  <div
                    key={`${assessment.product_id}-${assessment.product_variant_id || 'base'}`}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    {/* Product info */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {product?.name || 'Producto'}
                          {variant && (
                            <span className="ml-2 text-sm text-gray-500">
                              ({variant.variant_name} - {variant.size_value}{variant.size_unit})
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500">SKU: {product?.sku}</p>
                      </div>

                      {/* Present toggle */}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={assessment.is_product_present}
                          onChange={(e) => updateProductAssessment(
                            assessment.product_id,
                            assessment.product_variant_id,
                            { is_product_present: e.target.checked }
                          )}
                          className="mr-2 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm text-gray-600">Presente</span>
                      </label>
                    </div>

                    {assessment.is_product_present && (
                      <>
                        {/* Price inputs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Precio actual
                            </label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={assessment.current_price || ''}
                                onChange={(e) => updateProductAssessment(
                                  assessment.product_id,
                                  assessment.product_variant_id,
                                  { current_price: parseFloat(e.target.value) || null }
                                )}
                                className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Precio sugerido
                            </label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={assessment.suggested_price || ''}
                                onChange={(e) => updateProductAssessment(
                                  assessment.product_id,
                                  assessment.product_variant_id,
                                  { suggested_price: parseFloat(e.target.value) || null }
                                )}
                                className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {/* Stock level */}
                          <div className="col-span-2 sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Nivel de stock
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {STOCK_LEVELS.map((level) => (
                                <button
                                  key={level.value}
                                  type="button"
                                  onClick={() => updateProductAssessment(
                                    assessment.product_id,
                                    assessment.product_variant_id,
                                    { stock_level: level.value }
                                  )}
                                  className={cn(
                                    'px-2 py-1 text-xs rounded-full border transition-colors',
                                    assessment.stock_level === level.value
                                      ? level.color
                                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                  )}
                                >
                                  {level.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={assessment.has_active_promotion}
                              onChange={(e) => updateProductAssessment(
                                assessment.product_id,
                                assessment.product_variant_id,
                                { has_active_promotion: e.target.checked }
                              )}
                              className="mr-2 rounded border-gray-300 text-blue-600"
                            />
                            <Tag className="w-3 h-3 mr-1" />
                            Promoción activa
                          </label>

                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={assessment.has_pop_material}
                              onChange={(e) => updateProductAssessment(
                                assessment.product_id,
                                assessment.product_variant_id,
                                { has_pop_material: e.target.checked }
                              )}
                              className="mr-2 rounded border-gray-300 text-blue-600"
                            />
                            Material POP visible
                          </label>
                        </div>

                        {/* Promotion description */}
                        {assessment.has_active_promotion && (
                          <div className="mt-2">
                            <input
                              type="text"
                              value={assessment.promotion_description}
                              onChange={(e) => updateProductAssessment(
                                assessment.product_id,
                                assessment.product_variant_id,
                                { promotion_description: e.target.value }
                              )}
                              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Describe la promoción (ej: 2x1, 20% off...)"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competitor Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Precios de Competencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CompetitorProductsForm
            competitors={competitors}
            assessments={data.competitorAssessments}
            onAssessmentsChange={handleCompetitorAssessmentsChange}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas de auditoría de precios
          </label>
          <textarea
            value={data.pricingAuditNotes}
            onChange={(e) => onDataChange({ pricingAuditNotes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Observaciones adicionales sobre precios, promociones, disponibilidad..."
          />
        </CardContent>
      </Card>

      {/* Photo Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidencia Fotográfica</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoEvidenceUpload
            photos={data.evidence.map(e => ({
              id: e.id,
              file: e.file,
              previewUrl: e.previewUrl,
              fileUrl: e.fileUrl,
              caption: e.caption,
              evidenceType: e.evidenceType,
              captureLatitude: e.captureLatitude,
              captureLongitude: e.captureLongitude,
              capturedAt: new Date()
            }))}
            onPhotosChange={handleEvidenceChange}
            visitId={visitId}
            evidenceStage="pricing"
            evidenceTypes={PRICING_EVIDENCE_TYPES}
            minPhotos={1}
            maxPhotos={5}
          />
        </CardContent>
      </Card>
    </div>
  )
}
