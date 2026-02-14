'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { VisitHeader } from '@/components/visits/VisitHeader'
import { VisitAssessmentWizard, WizardData } from '@/components/visits/VisitAssessmentWizard'
import { AssessmentStage1 } from '@/components/visits/AssessmentStage1'
import { AssessmentStage2 } from '@/components/visits/AssessmentStage2'
import { AssessmentStage3 } from '@/components/visits/AssessmentStage3'
import { useVisit } from '@/hooks/useVisits'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Play, MapPin, Clock, CheckCircle } from 'lucide-react'

export default function VisitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const visitId = params.visitId as string

  const { visit, loading, error, checkin, checkout, refetch } = useVisit(visitId)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [initialWizardData, setInitialWizardData] = useState<Partial<WizardData> | undefined>(undefined)
  const [loadingAssessment, setLoadingAssessment] = useState(false)

  // Load existing assessment data when visit is in progress or completed
  useEffect(() => {
    const loadAssessmentData = async () => {
      if (!visit || (visit.status !== 'in_progress' && visit.status !== 'completed')) return

      setLoadingAssessment(true)
      try {
        const response = await fetch(`/api/promotor/visits/${visitId}/assessment`)
        if (response.ok) {
          const data = await response.json()

          // Transform the data to WizardData format
          const wizardData: Partial<WizardData> = {}

          // Stage 1 data
          if (data.brandProductAssessments?.length > 0 || data.competitorAssessments?.length > 0) {
            wizardData.stage1 = {
              brandProductAssessments: data.brandProductAssessments || [],
              competitorAssessments: data.competitorAssessments || [],
              pricingAuditNotes: data.stageAssessment?.pricing_audit_notes || '',
              evidence: data.evidence?.filter((e: { evidence_stage: string }) => e.evidence_stage === 'pricing') || [],
              completedAt: data.stageAssessment?.stage1_completed_at ? new Date(data.stageAssessment.stage1_completed_at) : undefined
            }
          }

          // Stage 2 data
          if (data.stageAssessment) {
            wizardData.stage2 = {
              hasInventory: data.stageAssessment.has_inventory || false,
              hasPurchaseOrder: data.stageAssessment.has_purchase_order || false,
              purchaseOrderNumber: data.stageAssessment.purchase_order_number || '',
              orderId: data.stageAssessment.order_id,
              whyNotBuying: data.stageAssessment.why_not_buying || null,
              purchaseInventoryNotes: data.stageAssessment.purchase_inventory_notes || '',
              evidence: data.evidence?.filter((e: { evidence_stage: string }) => e.evidence_stage === 'inventory') || [],
              completedAt: data.stageAssessment?.stage2_completed_at ? new Date(data.stageAssessment.stage2_completed_at) : undefined
            }
          }

          // Stage 3 data
          if (data.stageAssessment || data.popMaterialChecks?.length > 0 || data.exhibitionChecks?.length > 0) {
            wizardData.stage3 = {
              communicationPlanId: data.stageAssessment?.communication_plan_id || null,
              communicationCompliance: data.stageAssessment?.communication_compliance || null,
              popMaterialChecks: data.popMaterialChecks || [],
              exhibitionChecks: data.exhibitionChecks || [],
              popExecutionNotes: data.stageAssessment?.pop_execution_notes || '',
              evidence: data.evidence?.filter((e: { evidence_stage: string }) => e.evidence_stage === 'communication') || [],
              completedAt: data.stageAssessment?.stage3_completed_at ? new Date(data.stageAssessment.stage3_completed_at) : undefined
            }
          }

          setInitialWizardData(wizardData)
        }
      } catch (err) {
        console.error('Error loading assessment data:', err)
      } finally {
        setLoadingAssessment(false)
      }
    }

    loadAssessmentData()
  }, [visit, visitId])

  const handleCheckin = async () => {
    setSaving(true)
    setActionError(null)

    try {
      let location: { latitude: number; longitude: number } | undefined

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000
            })
          })
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        } catch {
          console.log('Location unavailable, continuing without it')
        }
      }

      await checkin(location)
    } catch (err) {
      console.error('Error checking in:', err)
      setActionError(err instanceof Error ? err.message : 'Error al iniciar visita')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAssessment = useCallback(async (data: WizardData, stage: number) => {
    const stageKey = `stage${stage}` as keyof WizardData
    const stageData = data[stageKey]

    const response = await fetch(`/api/promotor/visits/${visitId}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, data: stageData })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al guardar')
    }
  }, [visitId])

  const handleCompleteAssessment = useCallback(async () => {
    // Verify all stages are completed
    const response = await fetch(`/api/promotor/visits/${visitId}/assessment`, {
      method: 'PUT'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al completar assessment')
    }

    // Perform checkout
    await checkout()
    router.push('/promotor/visitas')
  }, [visitId, checkout, router])

  const renderStage = useCallback((
    stage: number,
    data: WizardData,
    updateData: (updates: Partial<WizardData>) => void
  ) => {
    if (!visit) return null

    switch (stage) {
      case 0:
        return (
          <AssessmentStage1
            data={data.stage1}
            onDataChange={(updates) => updateData({ stage1: { ...data.stage1, ...updates } })}
            brandId={visit.brand_id}
          />
        )
      case 1:
        return (
          <AssessmentStage2
            data={data.stage2}
            onDataChange={(updates) => updateData({ stage2: { ...data.stage2, ...updates } })}
            visitId={visitId}
            clientId={visit.client_id}
          />
        )
      case 2:
        return (
          <AssessmentStage3
            data={data.stage3}
            onDataChange={(updates) => updateData({ stage3: { ...data.stage3, ...updates } })}
            brandId={visit.brand_id}
          />
        )
      default:
        return null
    }
  }, [visit, visitId])

  if (loading || loadingAssessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !visit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar la visita
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  const canCheckin = visit.status === 'planned'
  const isCompleted = visit.status === 'completed'
  const isInProgress = visit.status === 'in_progress'

  // Format duration if visit is in progress or completed
  const formatDuration = () => {
    if (!visit.start_time) return null

    const start = new Date(visit.start_time)
    const end = visit.end_time ? new Date(visit.end_time) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins} min`
    }
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Only show when not in wizard mode */}
      {!isInProgress && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a visitas
              </Button>

              <div className="flex space-x-3">
                {canCheckin && (
                  <Button
                    onClick={handleCheckin}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {saving ? 'Iniciando...' : 'Iniciar Visita'}
                  </Button>
                )}

                {isCompleted && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Visita Completada
                  </span>
                )}
              </div>
            </div>

            {actionError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {actionError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visit Info - Show compact version when in progress */}
      {!isInProgress && (
        <div className="max-w-4xl mx-auto px-4 py-6 w-full">
          <VisitHeader visit={visit} />

          {/* Visit Info Card */}
          <Card className="mt-4">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Time Info */}
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Hora inicio</p>
                    <p className="text-sm font-medium">
                      {visit.start_time
                        ? new Date(visit.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                        : 'No iniciada'}
                    </p>
                  </div>
                </div>

                {visit.end_time && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Hora fin</p>
                      <p className="text-sm font-medium">
                        {new Date(visit.end_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}

                {visit.start_time && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Duración</p>
                      <p className="text-sm font-medium">{formatDuration()}</p>
                    </div>
                  </div>
                )}

                {/* Location Info */}
                {visit.latitude && visit.longitude && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Ubicación registrada</p>
                      <p className="text-sm font-medium text-green-600">
                        {visit.latitude.toFixed(4)}, {visit.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Wizard for in_progress visits */}
      {isInProgress && (
        <VisitAssessmentWizard
          visitId={visitId}
          clientId={visit.client_id}
          brandId={visit.brand_id}
          initialData={initialWizardData}
          onSave={handleSaveAssessment}
          onComplete={handleCompleteAssessment}
          renderStage={renderStage}
          className="flex-1"
        />
      )}

      {/* Completed visit - show read-only wizard */}
      {isCompleted && initialWizardData && (
        <div className="max-w-4xl mx-auto px-4 pb-6 w-full">
          <Card className="mt-4 p-6">
            <div className="text-center text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Assessment completado
              </h3>
              <p className="text-sm">
                Esta visita fue completada el {visit.end_time ? new Date(visit.end_time).toLocaleDateString('es-ES', { dateStyle: 'full' }) : 'N/A'}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Message for pending visits */}
      {canCheckin && (
        <div className="max-w-4xl mx-auto px-4 pb-6 w-full">
          <Card className="mt-6">
            <div className="p-6 text-center">
              <Play className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Visita pendiente de inicio
              </h3>
              <p className="text-gray-600 mb-4">
                Inicia la visita para comenzar el assessment del cliente.
              </p>
              <Button
                onClick={handleCheckin}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="mr-2 h-4 w-4" />
                {saving ? 'Iniciando...' : 'Iniciar Visita'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
