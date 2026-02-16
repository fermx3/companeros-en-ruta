'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { SurveyStatusBadge } from '@/components/surveys/SurveyStatusBadge'
import { SurveyQuestionBuilder, type QuestionData } from '@/components/surveys/SurveyQuestionBuilder'
import { ArrowLeft, Send, Edit, BarChart3, AlertCircle } from 'lucide-react'
import type { SurveyStatusEnum, SurveyTargetRoleEnum } from '@/lib/types/database'

const ROLE_LABELS: Record<string, string> = {
  promotor: 'Promotor',
  asesor_de_ventas: 'Asesor de Ventas',
  client: 'Cliente'
}

interface SurveyDetail {
  id: string
  public_id: string
  title: string
  description?: string
  survey_status: SurveyStatusEnum
  target_roles: SurveyTargetRoleEnum[]
  start_date: string
  end_date: string
  max_responses_per_user: number
  rejection_reason?: string
  response_count: number
  created_at: string
  brands?: { name: string }
  survey_questions: QuestionData[]
}

export default function BrandSurveyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<SurveyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editQuestions, setEditQuestions] = useState<QuestionData[]>([])

  const fetchSurvey = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/brand/surveys/${surveyId}`)
      if (!res.ok) throw new Error('Error al cargar encuesta')
      const data = await res.json()
      setSurvey(data.survey)
      setEditQuestions(data.survey.survey_questions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [surveyId])

  useEffect(() => {
    fetchSurvey()
  }, [fetchSurvey])

  const handleSubmitForApproval = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/brand/surveys/${surveyId}/submit`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al enviar')
      }
      await fetchSurvey()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/brand/surveys/${surveyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: editQuestions.map((q, i) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            is_required: q.is_required,
            sort_order: i,
            options: q.options
          }))
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }
      setEditing(false)
      await fetchSurvey()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta encuesta? Esta acción no se puede deshacer.')) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/brand/surveys/${surveyId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar')
      }
      router.push('/brand/surveys')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-6"><LoadingSpinner /></div>

  if (!survey) {
    return (
      <div className="p-6">
        <Alert variant="error">Encuesta no encontrada</Alert>
      </div>
    )
  }

  const isDraft = survey.survey_status === 'draft'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/brand/surveys')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
              <SurveyStatusBadge status={survey.survey_status} />
            </div>
            <p className="text-sm text-gray-500">{survey.public_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(survey.survey_status === 'active' || survey.survey_status === 'closed') && (
            <Button variant="outline" onClick={() => router.push(`/brand/surveys/${surveyId}/results`)}>
              <BarChart3 className="w-4 h-4 mr-2" /> Resultados
            </Button>
          )}
          {isDraft && !editing && (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button onClick={handleSubmitForApproval} disabled={actionLoading}>
                <Send className="w-4 h-4 mr-2" /> Enviar a aprobación
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Rejection reason */}
      {survey.rejection_reason && isDraft && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Encuesta rechazada</p>
            <p className="text-sm text-red-700 mt-1">{survey.rejection_reason}</p>
          </div>
        </div>
      )}

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
              <span className="text-gray-500">Vigencia</span>
              <p className="mt-1">{new Date(survey.start_date).toLocaleDateString('es-MX')} - {new Date(survey.end_date).toLocaleDateString('es-MX')}</p>
            </div>
            <div>
              <span className="text-gray-500">Dirigida a</span>
              <p className="mt-1">{survey.target_roles.map(r => ROLE_LABELS[r] || r).join(', ')}</p>
            </div>
            <div>
              <span className="text-gray-500">Respuestas</span>
              <p className="mt-1 font-medium">{survey.response_count}</p>
            </div>
            <div>
              <span className="text-gray-500">Máx. respuestas/usuario</span>
              <p className="mt-1">{survey.max_responses_per_user}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas ({editing ? editQuestions.length : survey.survey_questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SurveyQuestionBuilder
            questions={editing ? editQuestions : survey.survey_questions}
            onChange={setEditQuestions}
            readonly={!editing}
          />

          {editing && (
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => { setEditing(false); setEditQuestions(survey.survey_questions) }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={actionLoading}>
                {actionLoading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete button for drafts */}
      {isDraft && !editing && (
        <div className="flex justify-end">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete} disabled={actionLoading}>
            Eliminar encuesta
          </Button>
        </div>
      )}
    </div>
  )
}
