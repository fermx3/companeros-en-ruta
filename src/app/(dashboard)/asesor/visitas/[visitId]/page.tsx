'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { VisitHeader } from '@/components/visits/VisitHeader'
import { VisitAssessmentForm } from '@/components/visits/VisitAssessmentForm'
import { VisitInventoryForm } from '@/components/visits/VisitInventoryForm'
import { useVisit } from '@/hooks/useVisits'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Save, CheckCircle, Play, MapPin, Clock } from 'lucide-react'

export default function VisitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const visitId = params.visitId as string

  const { visit, loading, error, updateVisit, checkin, checkout, completeVisit } = useVisit(visitId)
  const [activeTab, setActiveTab] = useState<'assessment' | 'inventory'>('assessment')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

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

  const handleCheckin = async () => {
    setSaving(true)
    setActionError(null)

    try {
      // Try to get location
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
          // Location unavailable, continue without it
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

  const handleSave = async () => {
    setSaving(true)
    setActionError(null)
    try {
      await updateVisit({ notes: visit.notes })
    } catch (err) {
      console.error('Error saving visit:', err)
      setActionError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    setSaving(true)
    setActionError(null)
    try {
      await completeVisit()
      router.push('/asesor/visitas')
    } catch (err) {
      console.error('Error completing visit:', err)
      setActionError(err instanceof Error ? err.message : 'Error al completar visita')
      setSaving(false)
    }
  }

  const canComplete = visit.status === 'in_progress'
  const canCheckin = visit.status === 'pending' || visit.status === 'draft'
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

              {isInProgress && (
                <>
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
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completar Visita
                  </Button>
                </>
              )}

              {isCompleted && (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
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

      <div className="max-w-4xl mx-auto px-4 py-6">
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

        {/* Tabs - only show for in_progress or completed visits */}
        {(isInProgress || isCompleted) && (
          <>
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
          </>
        )}

        {/* Message for pending visits */}
        {canCheckin && (
          <Card className="mt-6">
            <div className="p-6 text-center">
              <Play className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Visita pendiente de inicio
              </h3>
              <p className="text-gray-600 mb-4">
                Inicia la visita para registrar el assessment y el inventario del cliente.
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
        )}
      </div>
    </div>
  )
}
