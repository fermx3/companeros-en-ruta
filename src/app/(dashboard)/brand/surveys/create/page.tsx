'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/feedback'
import { SurveyQuestionBuilder, type QuestionData, type SectionData } from '@/components/surveys/SurveyQuestionBuilder'
import { SurveyPreviewDialog } from '@/components/surveys/SurveyPreviewDialog'
import { ArrowLeft, ArrowRight, Check, Eye } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/components/ui/toaster'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { TargetingBuilder } from '@/components/targeting/TargetingBuilder'
import { TargetingSummary } from '@/components/targeting/TargetingSummary'
import type { SurveyTargetRoleEnum, TargetingCriteria } from '@/lib/types/database'

const STEPS = [
  { id: 'info', label: 'Información' },
  { id: 'questions', label: 'Preguntas' },
  { id: 'targeting', label: 'Segmentación' },
  { id: 'options', label: 'Opciones' },
  { id: 'review', label: 'Revisión' }
]

const ROLE_OPTIONS: Array<{ value: SurveyTargetRoleEnum; label: string }> = [
  { value: 'promotor', label: 'Promotores' },
  { value: 'asesor_de_ventas', label: 'Asesores de Ventas' },
  { value: 'client', label: 'Clientes (M&P)' }
]


export default function CreateSurveyPage() {
  usePageTitle('Crear Encuesta')
  const router = useRouter()
  const { brandFetch, currentBrandId } = useBrandFetch()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  useUnsavedChanges(isDirty)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [targetRoles, setTargetRoles] = useState<SurveyTargetRoleEnum[]>([])
  const [targetingCriteria, setTargetingCriteria] = useState<TargetingCriteria>({})
  const [maxResponses, setMaxResponses] = useState(1)
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [surveySections, setSurveySections] = useState<SectionData[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const toggleRole = (role: SurveyTargetRoleEnum) => {
    setTargetRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const canProceed = () => {
    switch (step) {
      case 0: return title.trim() && startDate && endDate
      case 1: return questions.length > 0 && questions.every(q => q.question_text.trim())
      case 2: return targetRoles.length > 0
      case 3: return true
      case 4: return true
      default: return true
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const res = await brandFetch('/api/brand/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          start_date: startDate,
          end_date: endDate,
          target_roles: targetRoles,
          target_client_type_categories: targetingCriteria.client_type_categories?.length
            ? targetingCriteria.client_type_categories
            : null,
          targeting_criteria: Object.values(targetingCriteria).some(v => {
            if (v === undefined || v === null) return false
            if (Array.isArray(v)) return v.length > 0
            return true
          }) ? targetingCriteria : null,
          max_responses_per_user: maxResponses,
          sections: surveySections.map((s, i) => ({
            title: s.title,
            description: s.description,
            sort_order: i,
            visibility_condition: s.visibility_condition ? {
              ...s.visibility_condition,
              question_id: (() => {
                const qIdx = questions.findIndex(q =>
                  (q.id && q.id === s.visibility_condition!.question_id) ||
                  `__q_${questions.indexOf(q)}` === s.visibility_condition!.question_id
                )
                return qIdx >= 0 ? `__q_${qIdx}` : s.visibility_condition!.question_id
              })()
            } : null
          })),
          questions: questions.map((q, i) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            is_required: q.is_required,
            sort_order: i,
            options: q.options,
            section_sort_order: q.section_id ? surveySections.findIndex((s, si) => (s.id || `__temp_${si}`) === q.section_id) : undefined,
            input_attributes: q.input_attributes
          }))
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear encuesta')
      }

      const data = await res.json()
      toast({ variant: 'success', title: 'Encuesta creada' })
      setIsDirty(false)
      router.push(`/brand/surveys/${data.survey.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/brand/surveys')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Encuesta</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                i === step
                  ? 'bg-blue-100 text-blue-700'
                  : i < step
                    ? 'bg-green-100 text-green-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < step ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
          </React.Fragment>
        ))}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step].label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setIsDirty(true) }}
                  placeholder="Ej: Encuesta de satisfacción Q1 2026"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional de la encuesta..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <SurveyQuestionBuilder
              questions={questions}
              onChange={setQuestions}
              sections={surveySections}
              onSectionsChange={setSurveySections}
            />
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles objetivo *</label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map(option => (
                    <label key={option.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      targetRoles.includes(option.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={targetRoles.includes(option.value)}
                        onChange={() => toggleRole(option.value)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {targetRoles.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segmentación detallada (opcional)
                  </label>
                  <TargetingBuilder
                    value={targetingCriteria}
                    onChange={setTargetingCriteria}
                    brandId={currentBrandId || ''}
                    audience={
                      targetRoles.includes('client') && targetRoles.some(r => r !== 'client')
                        ? 'all'
                        : targetRoles.includes('client')
                          ? 'client'
                          : 'staff'
                    }
                    staffRoles={targetRoles.filter((r): r is 'promotor' | 'asesor_de_ventas' => r !== 'client')}
                  />
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de respuestas por usuario
              </label>
              <input
                type="number"
                onFocus={(e) => e.target.select()}
                value={maxResponses}
                onChange={(e) => setMaxResponses(Math.max(1, Number(e.target.value)))}
                min={1}
                className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Normalmente 1. Incrementa si quieres permitir múltiples respuestas.</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Título</span>
                  <p className="font-medium">{title}</p>
                </div>
                {description && (
                  <div>
                    <span className="text-xs text-gray-500">Descripción</span>
                    <p className="text-sm">{description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Vigencia</span>
                    <p className="text-sm">{startDate} → {endDate}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Dirigida a</span>
                    <p className="text-sm">{targetRoles.map(r => ROLE_OPTIONS.find(o => o.value === r)?.label).join(', ')}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Segmentación</span>
                  <TargetingSummary criteria={targetingCriteria} />
                </div>
                {surveySections.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">Secciones ({surveySections.length})</span>
                    <ul className="text-sm mt-1 space-y-1">
                      {surveySections.map((s, i) => (
                        <li key={i} className="text-gray-700">
                          {s.title}
                          {s.visibility_condition && <span className="text-xs text-blue-500 ml-2">(condicional)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500">Preguntas ({questions.length})</span>
                  <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                    {questions.map((q, i) => (
                      <li key={i} className="text-gray-700">
                        {q.question_text || <span className="text-gray-400">(sin texto)</span>}
                        <span className="text-xs text-gray-400 ml-2">({q.question_type})</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" /> Vista previa
              </Button>

              <p className="text-xs text-gray-500">
                La encuesta se guardará como borrador. Podrás editarla y enviarla para aprobación desde el detalle.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/brand/surveys')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
          >
            Siguiente <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Encuesta'}
          </Button>
        )}
      </div>

      <SurveyPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        questions={questions}
        sections={surveySections}
      />
    </div>
  )
}
