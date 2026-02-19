'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { ArrowLeft, Users, BarChart3 } from 'lucide-react'

interface DistributionItem {
  value: string | number
  count: number
  percentage: number
}

interface QuestionAnalytics {
  question_id: string
  question_text: string
  question_type: string
  total_answers: number
  average?: number | null
  min?: number | null
  max?: number | null
  distribution?: DistributionItem[]
  sample_answers?: string[]
}

interface ResultsData {
  survey: { id: string; title: string; survey_status: string }
  total_responses: number
  role_distribution: Record<string, number>
  question_analytics: QuestionAnalytics[]
}

const ROLE_LABELS: Record<string, string> = {
  promotor: 'Promotor',
  asesor_de_ventas: 'Asesor de Ventas',
  client: 'Cliente'
}

export default function SurveyResultsPage() {
  const router = useRouter()
  const params = useParams()
  const surveyId = params.id as string
  const { brandFetch, currentBrandId } = useBrandFetch()

  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentBrandId) return

    const controller = new AbortController()

    const fetchResults = async () => {
      try {
        const res = await brandFetch(`/api/brand/surveys/${surveyId}/results`, { signal: controller.signal })
        if (!res.ok) throw new Error('Error al cargar resultados')
        setData(await res.json())
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchResults()
    return () => controller.abort()
  }, [surveyId, brandFetch, currentBrandId])

  if (loading) return <div className="p-6"><LoadingSpinner /></div>
  if (error) return <div className="p-6"><Alert variant="error">{error}</Alert></div>
  if (!data) return null

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/brand/surveys/${surveyId}`)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resultados</h1>
          <p className="text-sm text-gray-500">{data.survey.title}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.total_responses}</p>
                <p className="text-xs text-gray-500">Respuestas totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(data.role_distribution).map(([role, count]) => (
          <Card key={role}>
            <CardContent className="pt-4">
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-gray-500">{ROLE_LABELS[role] || role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Question analytics */}
      {data.question_analytics.map((qa, index) => (
        <Card key={qa.question_id}>
          <CardHeader>
            <CardTitle className="text-base">
              <span className="text-gray-400 mr-2">{index + 1}.</span>
              {qa.question_text}
            </CardTitle>
            <p className="text-xs text-gray-500">{qa.total_answers} respuestas</p>
          </CardHeader>
          <CardContent>
            {/* Text answers */}
            {qa.question_type === 'text' && qa.sample_answers && (
              <div className="space-y-2">
                {qa.sample_answers.map((answer, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    &quot;{answer}&quot;
                  </div>
                ))}
                {qa.total_answers > (qa.sample_answers?.length || 0) && (
                  <p className="text-xs text-gray-500">
                    Mostrando {qa.sample_answers.length} de {qa.total_answers} respuestas
                  </p>
                )}
              </div>
            )}

            {/* Number stats */}
            {qa.question_type === 'number' && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-bold">{qa.average?.toFixed(1) ?? '-'}</p>
                  <p className="text-xs text-gray-500">Promedio</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-bold">{qa.min ?? '-'}</p>
                  <p className="text-xs text-gray-500">Mínimo</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-bold">{qa.max ?? '-'}</p>
                  <p className="text-xs text-gray-500">Máximo</p>
                </div>
              </div>
            )}

            {/* Distribution chart (multiple_choice, scale, yes_no) */}
            {qa.distribution && qa.distribution.length > 0 && (
              <div className="space-y-2">
                {qa.question_type === 'scale' && qa.average !== null && qa.average !== undefined && (
                  <div className="text-center mb-3">
                    <p className="text-3xl font-bold text-blue-600">{qa.average.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Promedio</p>
                  </div>
                )}
                {qa.distribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-24 text-right">{item.value}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end px-2 transition-all"
                        style={{ width: `${Math.max(item.percentage, 3)}%` }}
                      >
                        {item.percentage > 10 && (
                          <span className="text-xs text-white font-medium">{item.percentage}%</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 w-16">{item.count} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            )}

            {qa.total_answers === 0 && (
              <div className="text-center py-4">
                <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Sin respuestas aún</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => router.push(`/brand/surveys/${surveyId}`)}>
          Volver al detalle
        </Button>
      </div>
    </div>
  )
}
