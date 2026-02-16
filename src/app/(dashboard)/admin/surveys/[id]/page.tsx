'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { SurveyStatusBadge } from '@/components/surveys/SurveyStatusBadge'
import { SurveyQuestionBuilder, type QuestionData } from '@/components/surveys/SurveyQuestionBuilder'
import { ArrowLeft, CheckCircle, XCircle, Users } from 'lucide-react'
import type { SurveyStatusEnum, SurveyTargetRoleEnum } from '@/lib/types/database'

const ROLE_LABELS: Record<string, string> = {
  promotor: 'Promotor',
  asesor_de_ventas: 'Asesor de Ventas',
  client: 'Cliente'
}

interface AdminSurveyDetail {
  id: string
  public_id: string
  title: string
  description?: string
  survey_status: SurveyStatusEnum
  target_roles: SurveyTargetRoleEnum[]
  target_zone_ids?: string[]
  target_client_type_categories?: string[]
  start_date: string
  end_date: string
  max_responses_per_user: number
  rejection_reason?: string
  approval_notes?: string
  response_count: number
  created_at: string
  brands?: { name: string; logo_url?: string }
  creator?: { first_name: string; last_name: string; email: string }
  approver?: { first_name: string; last_name: string }
  survey_questions: QuestionData[]
}

export default function AdminSurveyReviewPage() {
  const router = useRouter()
  const params = useParams()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<AdminSurveyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')

  const fetchSurvey = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/surveys/${surveyId}`)
      if (!res.ok) throw new Error('Error al cargar encuesta')
      const data = await res.json()
      setSurvey(data.survey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [surveyId])

  useEffect(() => {
    fetchSurvey()
  }, [fetchSurvey])

  const handleApprove = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/surveys/${surveyId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_notes: approvalNotes || null })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al aprobar')
      }
      await fetchSurvey()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Debe proporcionar un motivo de rechazo')
      return
    }
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/surveys/${surveyId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: rejectionReason })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al rechazar')
      }
      await fetchSurvey()
      setShowRejectForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-6"><LoadingSpinner /></div>
  if (!survey) return <div className="p-6"><Alert variant="error">Encuesta no encontrada</Alert></div>

  const isPending = survey.survey_status === 'pending_approval'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/surveys')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
              <SurveyStatusBadge status={survey.survey_status} />
            </div>
            <p className="text-sm text-gray-500">{survey.public_id} &middot; {survey.brands?.name}</p>
          </div>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {survey.description && (
              <div className="col-span-2">
                <span className="text-gray-500">Descripción</span>
                <p className="mt-1">{survey.description}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Creada por</span>
              <p className="mt-1">{survey.creator ? `${survey.creator.first_name} ${survey.creator.last_name}` : '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Vigencia</span>
              <p className="mt-1">{new Date(survey.start_date).toLocaleDateString('es-MX')} - {new Date(survey.end_date).toLocaleDateString('es-MX')}</p>
            </div>
            <div>
              <span className="text-gray-500">Dirigida a</span>
              <p className="mt-1">{survey.target_roles.map(r => ROLE_LABELS[r] || r).join(', ')}</p>
            </div>
            <div>
              <span className="text-gray-500">Respuestas</span>
              <p className="mt-1 flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" /> {survey.response_count}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas ({survey.survey_questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SurveyQuestionBuilder
            questions={survey.survey_questions}
            onChange={() => {}}
            readonly
          />
        </CardContent>
      </Card>

      {/* Approval actions */}
      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Aprobación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showRejectForm ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas de aprobación (opcional)</label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Notas opcionales..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" /> Aprobar
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowRejectForm(true)}>
                    <XCircle className="w-4 h-4 mr-2" /> Rechazar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de rechazo *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explica por qué se rechaza la encuesta..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()}>
                    <XCircle className="w-4 h-4 mr-2" /> Confirmar rechazo
                  </Button>
                  <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Previous rejection/approval info */}
      {survey.rejection_reason && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-red-700">Motivo de rechazo previo:</p>
            <p className="text-sm text-gray-700 mt-1">{survey.rejection_reason}</p>
          </CardContent>
        </Card>
      )}
      {survey.approval_notes && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-green-700">Notas de aprobación:</p>
            <p className="text-sm text-gray-700 mt-1">{survey.approval_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
