'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { VisitHeader } from '@/components/visits/VisitHeader'
import { VisitAssessmentForm } from '@/components/visits/VisitAssessmentForm'
import { VisitInventoryForm } from '@/components/visits/VisitInventoryForm'
import { useVisit } from '@/hooks/useVisits'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'

export default function VisitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const visitId = params.visitId as string

  const { visit, loading, error, updateVisit, completeVisit } = useVisit(visitId)
  const [activeTab, setActiveTab] = useState<'assessment' | 'inventory'>('assessment')
  const [saving, setSaving] = useState(false)

  if (loading) {
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

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateVisit({ status: 'in_progress' })
      // Show success message
    } catch (err) {
      console.error('Error saving visit:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      await completeVisit()
      router.push('/asesor/visitas')
    } catch (err) {
      console.error('Error completing visit:', err)
    } finally {
      setSaving(false)
    }
  }

  const canComplete = visit.assessment &&
    visit.assessment.product_visibility !== null &&
    visit.assessment.package_condition !== null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>

              <Button
                onClick={handleComplete}
                disabled={saving || !canComplete}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar Visita
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <VisitHeader visit={visit} />

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('assessment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assessment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Assessment
              {!canComplete && (
                <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                  Requerido
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Inventario
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                Opcional
              </span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'assessment' && (
            <VisitAssessmentForm
              visit={visit}
              onSave={updateVisit}
            />
          )}

          {activeTab === 'inventory' && (
            <VisitInventoryForm
              visit={visit}
              onSave={updateVisit}
            />
          )}
        </div>
      </div>
    </div>
  )
}
