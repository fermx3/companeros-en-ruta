'use client'

import { useState, useCallback, useEffect } from 'react'
import { WizardProgress, WizardStage } from './WizardProgress'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/feedback'
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardData {
  // Stage 1: Pricing & Category Audit
  stage1: {
    brandProductAssessments: Array<{
      product_id: string
      product_variant_id?: string
      current_price: number | null
      suggested_price: number | null
      has_active_promotion: boolean
      promotion_description: string
      has_pop_material: boolean
      is_product_present: boolean
      stock_level: string | null
    }>
    competitorAssessments: Array<{
      competitor_id: string
      competitor_product_id: string | null
      product_name_observed: string
      size_grams: number | null
      observed_price: number | null
      has_active_promotion: boolean
      promotion_description: string
      has_pop_material: boolean
    }>
    pricingAuditNotes: string
    evidence: Array<{
      id: string
      file?: File
      previewUrl: string
      fileUrl?: string
      caption: string
      evidenceType: string
      captureLatitude?: number
      captureLongitude?: number
    }>
    completedAt?: Date
  }
  // Stage 2: Purchase, Inventory & Loyalty
  stage2: {
    hasInventory: boolean
    hasPurchaseOrder: boolean
    purchaseOrderNumber: string
    orderId?: string
    whyNotBuying: string | null
    purchaseInventoryNotes: string
    evidence: Array<{
      id: string
      file?: File
      previewUrl: string
      fileUrl?: string
      caption: string
      evidenceType: string
      captureLatitude?: number
      captureLongitude?: number
    }>
    completedAt?: Date
  }
  // Stage 3: Communication & POP Execution
  stage3: {
    communicationPlanId: string | null
    communicationCompliance: 'full' | 'partial' | 'non_compliant' | null
    popMaterialChecks: Array<{
      pop_material_id: string
      is_present: boolean
      condition: string | null
      notes: string
    }>
    exhibitionChecks: Array<{
      exhibition_id: string
      is_executed: boolean
      execution_quality: string | null
      notes: string
    }>
    popExecutionNotes: string
    evidence: Array<{
      id: string
      file?: File
      previewUrl: string
      fileUrl?: string
      caption: string
      evidenceType: string
      captureLatitude?: number
      captureLongitude?: number
    }>
    completedAt?: Date
  }
}

interface VisitAssessmentWizardProps {
  visitId: string
  clientId: string
  brandId: string
  initialData?: Partial<WizardData>
  onSave: (data: WizardData, stage: number) => Promise<void>
  onComplete: () => Promise<void>
  renderStage: (
    stage: number,
    data: WizardData,
    updateData: (updates: Partial<WizardData>) => void
  ) => React.ReactNode
  className?: string
}

const STAGES: Array<{ id: string; label: string; shortLabel: string }> = [
  { id: 'pricing', label: 'Precios y Categoría', shortLabel: 'Precios' },
  { id: 'inventory', label: 'Compra e Inventario', shortLabel: 'Compra' },
  { id: 'communication', label: 'Comunicación y POP', shortLabel: 'POP' }
]

const getInitialData = (): WizardData => ({
  stage1: {
    brandProductAssessments: [],
    competitorAssessments: [],
    pricingAuditNotes: '',
    evidence: []
  },
  stage2: {
    hasInventory: false,
    hasPurchaseOrder: false,
    purchaseOrderNumber: '',
    whyNotBuying: null,
    purchaseInventoryNotes: '',
    evidence: []
  },
  stage3: {
    communicationPlanId: null,
    communicationCompliance: null,
    popMaterialChecks: [],
    exhibitionChecks: [],
    popExecutionNotes: '',
    evidence: []
  }
})

export function VisitAssessmentWizard({
  visitId,
  clientId,
  brandId,
  initialData,
  onSave,
  onComplete,
  renderStage,
  className
}: VisitAssessmentWizardProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [data, setData] = useState<WizardData>(() => ({
    ...getInitialData(),
    ...initialData
  }))
  const [saving, setSaving] = useState(false)
  const [savingStage, setSavingStage] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Build wizard stages with completion status
  const wizardStages: WizardStage[] = STAGES.map((stage, index) => {
    const stageData = data[`stage${index + 1}` as keyof WizardData]
    const isCompleted = 'completedAt' in stageData && stageData.completedAt != null

    return {
      id: stage.id,
      label: stage.label,
      shortLabel: stage.shortLabel,
      isCompleted,
      isActive: currentStage === index,
      isSaving: savingStage === index
    }
  })

  const allStagesCompleted = wizardStages.every(s => s.isCompleted)

  const updateData = useCallback((updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSaveStage = async () => {
    setSaving(true)
    setSavingStage(currentStage)
    setError(null)

    try {
      // Mark stage as completed
      const stageKey = `stage${currentStage + 1}` as keyof WizardData
      const updatedData = {
        ...data,
        [stageKey]: {
          ...data[stageKey],
          completedAt: new Date()
        }
      }
      setData(updatedData)

      await onSave(updatedData, currentStage + 1)
    } catch (err) {
      console.error('Error saving stage:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar')

      // Revert completion
      const stageKey = `stage${currentStage + 1}` as keyof WizardData
      setData(prev => ({
        ...prev,
        [stageKey]: {
          ...prev[stageKey],
          completedAt: undefined
        }
      }))
    } finally {
      setSaving(false)
      setSavingStage(null)
    }
  }

  const handleNext = async () => {
    // Save current stage before moving
    await handleSaveStage()

    if (currentStage < STAGES.length - 1) {
      setCurrentStage(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1)
    }
  }

  const handleStageClick = (index: number) => {
    // Allow navigation to completed stages or current stage
    const targetStage = wizardStages[index]
    if (targetStage.isCompleted || index <= currentStage) {
      setCurrentStage(index)
    }
  }

  const handleComplete = async () => {
    if (!allStagesCompleted) {
      setError('Debes completar todas las secciones antes de finalizar')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onComplete()
    } catch (err) {
      console.error('Error completing wizard:', err)
      setError(err instanceof Error ? err.message : 'Error al finalizar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn('flex flex-col min-h-full', className)}>
      {/* Progress indicator */}
      <WizardProgress
        stages={wizardStages}
        currentStage={currentStage}
        onStageClick={handleStageClick}
        className="bg-white border-b"
      />

      {/* Error alert */}
      {error && (
        <Alert
          variant="error"
          className="mx-4 mt-4"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Stage content */}
      <div className="flex-1 overflow-auto p-4">
        {renderStage(currentStage, data, updateData)}
      </div>

      {/* Navigation buttons */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStage === 0 || saving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center space-x-3">
            {/* Save current stage */}
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveStage}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>

            {/* Next or Complete */}
            {currentStage < STAGES.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={saving}
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleComplete}
                disabled={saving || !allStagesCompleted}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Finalizar Assessment
              </Button>
            )}
          </div>
        </div>

        {/* Completion status */}
        {currentStage === STAGES.length - 1 && !allStagesCompleted && (
          <p className="text-center text-sm text-yellow-600 mt-3">
            Completa todas las secciones para poder finalizar el assessment
          </p>
        )}
      </div>
    </div>
  )
}
