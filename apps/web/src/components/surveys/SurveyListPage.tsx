'use client'

import React, { useState, useEffect } from 'react'
import { SurveyCard } from './SurveyCard'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { ClipboardList } from 'lucide-react'

interface SurveyListPageProps {
  basePath: string // e.g. '/promotor/surveys'
}

interface SurveyItem {
  id: string
  public_id: string
  title: string
  description?: string | null
  survey_status: 'active'
  target_roles: ('promotor' | 'asesor_de_ventas' | 'client')[]
  start_date: string
  end_date: string
  has_responded: boolean
  brands: { name: string; logo_url?: string } | null
}

export function SurveyListPage({ basePath }: SurveyListPageProps) {
  const [surveys, setSurveys] = useState<SurveyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSurveys() {
      try {
        const res = await fetch('/api/surveys')
        if (!res.ok) throw new Error('Error al cargar encuestas')
        const data = await res.json()
        setSurveys(data.surveys || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    fetchSurveys()
  }, [])

  const pending = surveys.filter(s => !s.has_responded)
  const completed = surveys.filter(s => s.has_responded)

  if (loading) return <div className="p-6"><LoadingSpinner /></div>
  if (error) return <div className="p-6"><Alert variant="error">{error}</Alert></div>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Encuestas</h1>
        <p className="text-sm text-gray-500">Encuestas asignadas para responder</p>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes encuestas asignadas</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">Pendientes ({pending.length})</h2>
              <div className="space-y-3">
                {pending.map(survey => (
                  <SurveyCard
                    key={survey.id}
                    survey={survey}
                    href={`${basePath}/${survey.public_id}`}
                    showBrand
                  />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">Respondidas ({completed.length})</h2>
              <div className="space-y-3">
                {completed.map(survey => (
                  <SurveyCard
                    key={survey.id}
                    survey={survey}
                    href={`${basePath}/${survey.public_id}`}
                    showBrand
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
