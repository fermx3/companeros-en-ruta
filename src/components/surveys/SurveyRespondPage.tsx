'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { SurveyForm } from './SurveyForm'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import type { SurveyQuestionTypeEnum, MultipleChoiceOption } from '@/lib/types/database'

interface Question {
  id: string
  question_text: string
  question_type: SurveyQuestionTypeEnum
  is_required: boolean
  sort_order: number
  options?: MultipleChoiceOption[] | { min: number; max: number; min_label?: string; max_label?: string } | null
}

interface SurveyData {
  id: string
  title: string
  description?: string
  brands?: { name: string; logo_url?: string }
  survey_questions: Question[]
}

interface SurveyRespondPageProps {
  surveyId: string
  backPath: string
}

export function SurveyRespondPage({ surveyId, backPath }: SurveyRespondPageProps) {
  const router = useRouter()
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [hasResponded, setHasResponded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchSurvey = useCallback(async () => {
    try {
      const res = await fetch(`/api/surveys/${surveyId}`)
      if (!res.ok) throw new Error('Error al cargar encuesta')
      const data = await res.json()
      setSurvey(data.survey)
      setHasResponded(data.has_responded)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [surveyId])

  useEffect(() => {
    fetchSurvey()
  }, [fetchSurvey])

  const handleSubmit = async (answers: Array<{ question_id: string; value: unknown }>) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/surveys/${surveyId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al enviar respuestas')
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6"><LoadingSpinner /></div>
  if (error && !survey) return <div className="p-6"><Alert variant="error">{error}</Alert></div>
  if (!survey) return null

  if (success) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center py-16">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Encuesta respondida</h2>
        <p className="text-gray-600 mb-6">Gracias por completar la encuesta &quot;{survey.title}&quot;</p>
        <button
          onClick={() => router.push(backPath)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Volver a encuestas
        </button>
      </div>
    )
  }

  if (hasResponded) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center py-16">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ya respondiste esta encuesta</h2>
        <button
          onClick={() => router.push(backPath)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4"
        >
          Volver a encuestas
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(backPath)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          {survey.brands && <p className="text-sm text-gray-500">{survey.brands.name}</p>}
        </div>
      </div>

      {survey.description && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-700">{survey.description}</p>
          </CardContent>
        </Card>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      <SurveyForm
        questions={survey.survey_questions}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  )
}
