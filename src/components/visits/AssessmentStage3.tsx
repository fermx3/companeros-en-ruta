'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Layers, LayoutGrid, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PhotoEvidenceUpload, EvidencePhoto } from './PhotoEvidenceUpload'
import { cn } from '@/lib/utils'
import type { WizardData } from './VisitAssessmentWizard'

interface CommunicationPlan {
  id: string
  plan_name: string
  plan_period: string | null
  target_locations: string | null
  brand_communication_plan_materials: Array<{
    id: string
    quantity_required: number
    placement_notes: string | null
    brand_pop_materials: {
      id: string
      material_name: string
      material_category: string | null
    }
  }>
  brand_communication_plan_activities: Array<{
    id: string
    activity_name: string
    activity_description: string | null
  }>
}

interface POPMaterial {
  id: string
  material_name: string
  material_category: string | null
  is_system_template: boolean
}

interface Exhibition {
  id: string
  exhibition_name: string
  location_description: string | null
  negotiated_period: string | null
}

interface POPMaterialCheck {
  pop_material_id: string
  is_present: boolean
  condition: string | null
  notes: string
}

interface ExhibitionCheck {
  exhibition_id: string
  is_executed: boolean
  execution_quality: string | null
  notes: string
}

interface AssessmentStage3Props {
  data: WizardData['stage3']
  onDataChange: (updates: Partial<WizardData['stage3']>) => void
  brandId: string
  visitId?: string
  className?: string
}

const COMPLIANCE_LEVELS = [
  { value: 'full', label: 'Cumplimiento total', icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
  { value: 'partial', label: 'Cumplimiento parcial', icon: AlertCircle, color: 'text-yellow-600 bg-yellow-100' },
  { value: 'non_compliant', label: 'No cumple', icon: XCircle, color: 'text-red-600 bg-red-100' }
]

const MATERIAL_CONDITIONS = [
  { value: 'good', label: 'Bueno' },
  { value: 'damaged', label: 'Dañado' },
  { value: 'missing', label: 'Faltante' }
]

const EXECUTION_QUALITIES = [
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Bueno' },
  { value: 'fair', label: 'Regular' },
  { value: 'poor', label: 'Deficiente' }
]

const COMMUNICATION_EVIDENCE_TYPES = [
  { value: 'pop_material', label: 'Material POP' },
  { value: 'exhibition', label: 'Exhibición' },
  { value: 'activity', label: 'Actividad' },
  { value: 'general', label: 'General' }
]

export function AssessmentStage3({
  data,
  onDataChange,
  brandId,
  visitId,
  className
}: AssessmentStage3Props) {
  const [communicationPlans, setCommunicationPlans] = useState<CommunicationPlan[]>([])
  const [allMaterials, setAllMaterials] = useState<POPMaterial[]>([])
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)

  // Load communication plans, materials, and exhibitions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [plansRes, materialsRes, exhibitionsRes] = await Promise.all([
          fetch('/api/brand/communication-plans?active_only=true').catch(() => null),
          fetch('/api/brand/pop-materials?include_system=true').catch(() => null),
          fetch('/api/brand/exhibitions?active_only=true').catch(() => null)
        ])

        if (plansRes?.ok) {
          const plansData = await plansRes.json()
          setCommunicationPlans(plansData.plans || [])
        }

        if (materialsRes?.ok) {
          const materialsData = await materialsRes.json()
          setAllMaterials([
            ...(materialsData.systemTemplates || []),
            ...(materialsData.materials || [])
          ])
        }

        if (exhibitionsRes?.ok) {
          const exhibitionsData = await exhibitionsRes.json()
          setExhibitions(exhibitionsData.exhibitions || [])
        }
      } catch (error) {
        console.error('Error loading stage 3 data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [brandId])

  // Initialize material checks when plan is selected
  useEffect(() => {
    if (data.communicationPlanId && communicationPlans.length > 0) {
      const selectedPlan = communicationPlans.find(p => p.id === data.communicationPlanId)
      if (selectedPlan && data.popMaterialChecks.length === 0) {
        const initialChecks: POPMaterialCheck[] = selectedPlan.brand_communication_plan_materials.map(m => ({
          pop_material_id: m.brand_pop_materials.id,
          is_present: false,
          condition: null,
          notes: ''
        }))
        onDataChange({ popMaterialChecks: initialChecks })
      }
    }
  }, [data.communicationPlanId, communicationPlans, data.popMaterialChecks.length, onDataChange])

  // Initialize exhibition checks
  useEffect(() => {
    if (exhibitions.length > 0 && data.exhibitionChecks.length === 0) {
      const initialChecks: ExhibitionCheck[] = exhibitions.map(e => ({
        exhibition_id: e.id,
        is_executed: false,
        execution_quality: null,
        notes: ''
      }))
      onDataChange({ exhibitionChecks: initialChecks })
    }
  }, [exhibitions, data.exhibitionChecks.length, onDataChange])

  const selectedPlan = communicationPlans.find(p => p.id === data.communicationPlanId)

  const updateMaterialCheck = (materialId: string, updates: Partial<POPMaterialCheck>) => {
    onDataChange({
      popMaterialChecks: data.popMaterialChecks.map(c =>
        c.pop_material_id === materialId ? { ...c, ...updates } : c
      )
    })
  }

  const updateExhibitionCheck = (exhibitionId: string, updates: Partial<ExhibitionCheck>) => {
    onDataChange({
      exhibitionChecks: data.exhibitionChecks.map(c =>
        c.exhibition_id === exhibitionId ? { ...c, ...updates } : c
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

  const getMaterialName = (materialId: string) => {
    return allMaterials.find(m => m.id === materialId)?.material_name || 'Material'
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
          <Megaphone className="w-5 h-5 mr-2 text-purple-600" />
          Comunicación y Ejecución POP
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Verifica el cumplimiento del plan de comunicación y materiales POP
        </p>
      </div>

      {/* Communication Plan Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Megaphone className="w-4 h-4 mr-2" />
            Plan de Comunicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {communicationPlans.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay planes de comunicación activos para esta marca
            </p>
          ) : (
            <>
              {/* Plan selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar plan activo
                </label>
                <select
                  value={data.communicationPlanId || ''}
                  onChange={(e) => onDataChange({
                    communicationPlanId: e.target.value || null,
                    popMaterialChecks: [] // Reset checks when plan changes
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin plan seleccionado</option>
                  {communicationPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.plan_name}
                      {plan.plan_period && ` (${plan.plan_period})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan details */}
              {selectedPlan && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900">{selectedPlan.plan_name}</h4>
                  {selectedPlan.target_locations && (
                    <p className="text-sm text-purple-700 mt-1">
                      <strong>Ubicaciones:</strong> {selectedPlan.target_locations}
                    </p>
                  )}
                  {selectedPlan.brand_communication_plan_activities?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-purple-900">Actividades:</p>
                      <ul className="text-sm text-purple-700 list-disc list-inside">
                        {selectedPlan.brand_communication_plan_activities.map(a => (
                          <li key={a.id}>{a.activity_name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Compliance level */}
              {selectedPlan && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de cumplimiento
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMPLIANCE_LEVELS.map((level) => {
                      const Icon = level.icon
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => onDataChange({
                            communicationCompliance: level.value as 'full' | 'partial' | 'non_compliant'
                          })}
                          className={cn(
                            'flex items-center px-3 py-2 rounded-lg border-2 transition-colors',
                            data.communicationCompliance === level.value
                              ? `${level.color} border-current`
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {level.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* POP Materials Check */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            Verificación de Materiales POP
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.popMaterialChecks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              {selectedPlan
                ? 'No hay materiales definidos en este plan'
                : 'Selecciona un plan de comunicación para ver los materiales'}
            </p>
          ) : (
            <div className="space-y-3">
              {data.popMaterialChecks.map((check) => (
                <div
                  key={check.pop_material_id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={check.is_present}
                          onChange={(e) => updateMaterialCheck(check.pop_material_id, {
                            is_present: e.target.checked
                          })}
                          className="mr-2 rounded border-gray-300 text-blue-600 w-5 h-5"
                        />
                      </label>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getMaterialName(check.pop_material_id)}
                        </p>
                      </div>
                    </div>

                    {check.is_present && (
                      <select
                        value={check.condition || ''}
                        onChange={(e) => updateMaterialCheck(check.pop_material_id, {
                          condition: e.target.value || null
                        })}
                        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Condición</option>
                        {MATERIAL_CONDITIONS.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {check.is_present && (
                    <input
                      type="text"
                      value={check.notes}
                      onChange={(e) => updateMaterialCheck(check.pop_material_id, { notes: e.target.value })}
                      placeholder="Notas opcionales..."
                      className="mt-2 w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exhibitions Check */}
      {exhibitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Verificación de Exhibiciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.exhibitionChecks.map((check) => {
                const exhibition = exhibitions.find(e => e.id === check.exhibition_id)

                return (
                  <div
                    key={check.exhibition_id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={check.is_executed}
                            onChange={(e) => updateExhibitionCheck(check.exhibition_id, {
                              is_executed: e.target.checked
                            })}
                            className="mr-2 rounded border-gray-300 text-blue-600 w-5 h-5"
                          />
                        </label>
                        <div>
                          <p className="font-medium text-gray-900">
                            {exhibition?.exhibition_name}
                          </p>
                          {exhibition?.location_description && (
                            <p className="text-xs text-gray-500">
                              {exhibition.location_description}
                            </p>
                          )}
                        </div>
                      </div>

                      {check.is_executed && (
                        <select
                          value={check.execution_quality || ''}
                          onChange={(e) => updateExhibitionCheck(check.exhibition_id, {
                            execution_quality: e.target.value || null
                          })}
                          className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Calidad</option>
                          {EXECUTION_QUALITIES.map(q => (
                            <option key={q.value} value={q.value}>{q.label}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {check.is_executed && (
                      <input
                        type="text"
                        value={check.notes}
                        onChange={(e) => updateExhibitionCheck(check.exhibition_id, { notes: e.target.value })}
                        placeholder="Notas opcionales..."
                        className="mt-2 w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardContent className="pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas de ejecución POP
          </label>
          <textarea
            value={data.popExecutionNotes}
            onChange={(e) => onDataChange({ popExecutionNotes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Observaciones sobre materiales, exhibiciones, actividades..."
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
            evidenceStage="communication"
            evidenceTypes={COMMUNICATION_EVIDENCE_TYPES}
            minPhotos={0}
            maxPhotos={5}
          />
        </CardContent>
      </Card>
    </div>
  )
}
