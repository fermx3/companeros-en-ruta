'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { SurveyQuestionTypeEnum, MultipleChoiceOption } from '@/lib/types/database'
import { normalizeMultipleChoiceOptions, normalizeScaleOptions } from './normalize-options'

interface Question {
  id: string
  question_text: string
  question_type: SurveyQuestionTypeEnum
  is_required: boolean
  sort_order: number
  options?: MultipleChoiceOption[] | { min: number; max: number; min_label?: string; max_label?: string } | null
}

interface SurveyFormProps {
  questions: Question[]
  onSubmit: (answers: Array<{ question_id: string; value: unknown }>) => Promise<void>
  loading?: boolean
}

export function SurveyForm({ questions, onSubmit, loading = false }: SurveyFormProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setAnswer = (questionId: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    // Clear error on change
    if (errors[questionId]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[questionId]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required
    const newErrors: Record<string, string> = {}
    for (const q of questions) {
      if (q.is_required) {
        const val = answers[q.id]
        if (val === undefined || val === null || val === '') {
          newErrors[q.id] = 'Esta pregunta es obligatoria'
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formattedAnswers = Object.entries(answers)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([question_id, value]) => ({ question_id, value }))

    await onSubmit(formattedAnswers)
  }

  const renderQuestion = (question: Question) => {
    const error = errors[question.id]

    switch (question.question_type) {
      case 'text':
        return (
          <textarea
            value={(answers[question.id] as string) || ''}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows={3}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : 'border-gray-300'}`}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={(answers[question.id] as number) ?? ''}
            onChange={(e) => setAnswer(question.id, e.target.value ? Number(e.target.value) : '')}
            placeholder="0"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : 'border-gray-300'}`}
          />
        )

      case 'multiple_choice': {
        const options = normalizeMultipleChoiceOptions(question.options)
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  answers[question.id] === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : `border-gray-200 hover:bg-gray-50 ${error ? 'border-red-200' : ''}`
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={() => setAnswer(question.id, option.value)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )
      }

      case 'scale': {
        const scaleOpts = normalizeScaleOptions(question.options)
        const scaleValues = Array.from(
          { length: scaleOpts.max - scaleOpts.min + 1 },
          (_, i) => scaleOpts.min + i
        )
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              {scaleOpts.min_label && (
                <span className="text-xs text-gray-500">{scaleOpts.min_label}</span>
              )}
              {scaleOpts.max_label && (
                <span className="text-xs text-gray-500">{scaleOpts.max_label}</span>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              {scaleValues.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAnswer(question.id, val)}
                  className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors ${
                    answers[question.id] === val
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : `border-gray-300 text-gray-600 hover:border-blue-300 ${error ? 'border-red-300' : ''}`
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )
      }

      case 'yes_no':
        return (
          <div className="flex gap-3">
            {[
              { value: true, label: 'Sí' },
              { value: false, label: 'No' }
            ].map(({ value, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setAnswer(question.id, value)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                  answers[question.id] === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : `border-gray-200 text-gray-600 hover:bg-gray-50 ${error ? 'border-red-200' : ''}`
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question, index) => (
        <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">
              <span className="text-gray-400 mr-2">{index + 1}.</span>
              {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </p>
          </div>

          {renderQuestion(question)}

          {errors[question.id] && (
            <p className="text-xs text-red-600 mt-1">{errors[question.id]}</p>
          )}
        </div>
      ))}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando...' : 'Enviar respuestas'}
      </Button>
    </form>
  )
}
