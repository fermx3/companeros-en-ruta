'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import type { SurveyQuestionTypeEnum, MultipleChoiceOption } from '@/lib/types/database'
import { normalizeMultipleChoiceOptions, normalizeScaleOptions } from './normalize-options'

const QUESTION_TYPE_LABELS: Record<SurveyQuestionTypeEnum, string> = {
  text: 'Texto libre',
  number: 'Número',
  multiple_choice: 'Opción múltiple',
  scale: 'Escala',
  yes_no: 'Sí / No'
}

export interface QuestionData {
  id?: string
  question_text: string
  question_type: SurveyQuestionTypeEnum
  is_required: boolean
  sort_order: number
  options?: MultipleChoiceOption[] | { min: number; max: number; min_label?: string; max_label?: string } | null
}

interface SurveyQuestionBuilderProps {
  questions: QuestionData[]
  onChange: (questions: QuestionData[]) => void
  readonly?: boolean
}

export function SurveyQuestionBuilder({ questions, onChange, readonly = false }: SurveyQuestionBuilderProps) {
  const addQuestion = () => {
    onChange([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        is_required: true,
        sort_order: questions.length,
        options: null
      }
    ])
  }

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, sort_order: i }))
    onChange(updated)
  }

  const updateQuestion = (index: number, updates: Partial<QuestionData>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }

    // Reset options when type changes
    if (updates.question_type) {
      if (updates.question_type === 'multiple_choice') {
        updated[index].options = [{ value: 'option_1', label: 'Opción 1' }]
      } else if (updates.question_type === 'scale') {
        updated[index].options = { min: 1, max: 5, min_label: 'Muy malo', max_label: 'Excelente' }
      } else {
        updated[index].options = null
      }
    }

    onChange(updated)
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= questions.length) return

    const updated = [...questions]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    onChange(updated.map((q, i) => ({ ...q, sort_order: i })))
  }

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex]
    const currentOptions = normalizeMultipleChoiceOptions(question.options)
    const newOption: MultipleChoiceOption = {
      value: `option_${currentOptions.length + 1}`,
      label: `Opción ${currentOptions.length + 1}`
    }
    updateQuestion(questionIndex, {
      options: [...currentOptions, newOption]
    })
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex]
    const currentOptions = normalizeMultipleChoiceOptions(question.options)
    updateQuestion(questionIndex, {
      options: currentOptions.filter((_, i) => i !== optionIndex)
    })
  }

  const updateOption = (questionIndex: number, optionIndex: number, label: string) => {
    const question = questions[questionIndex]
    const currentOptions = [...normalizeMultipleChoiceOptions(question.options)]
    currentOptions[optionIndex] = {
      ...currentOptions[optionIndex],
      label,
      value: label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    }
    updateQuestion(questionIndex, { options: currentOptions })
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            {!readonly && (
              <div className="flex flex-col items-center gap-1 pt-1">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 'up')}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 'down')}
                  disabled={index === questions.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={question.question_text}
                  onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                  placeholder="Escribe la pregunta..."
                  disabled={readonly}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={question.question_type}
                  onChange={(e) => updateQuestion(index, { question_type: e.target.value as SurveyQuestionTypeEnum })}
                  disabled={readonly}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                <label className="flex items-center gap-1.5 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={question.is_required}
                    onChange={(e) => updateQuestion(index, { is_required: e.target.checked })}
                    disabled={readonly}
                    className="rounded border-gray-300"
                  />
                  Obligatoria
                </label>
              </div>

              {/* Multiple choice options */}
              {question.question_type === 'multiple_choice' && (
                <div className="pl-6 space-y-2">
                  {normalizeMultipleChoiceOptions(question.options).map((option, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => updateOption(index, optIdx, e.target.value)}
                        disabled={readonly}
                        placeholder={`Opción ${optIdx + 1}`}
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                      {!readonly && (
                        <button
                          type="button"
                          onClick={() => removeOption(index, optIdx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => addOption(index)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar opción
                    </button>
                  )}
                </div>
              )}

              {/* Scale options */}
              {question.question_type === 'scale' && (() => {
                const scaleOpts = normalizeScaleOptions(question.options)
                return (
                <div className="pl-6 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Mínimo</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={scaleOpts.min}
                        onChange={(e) => updateQuestion(index, {
                          options: { ...scaleOpts, min: Number(e.target.value) }
                        })}
                        disabled={readonly}
                        className="w-16 border border-gray-200 rounded px-2 py-1 text-sm disabled:bg-gray-50"
                      />
                      <input
                        type="text"
                        value={scaleOpts.min_label ?? ''}
                        onChange={(e) => updateQuestion(index, {
                          options: { ...scaleOpts, min_label: e.target.value }
                        })}
                        disabled={readonly}
                        placeholder="Etiqueta (ej: Muy malo)"
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Máximo</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={scaleOpts.max}
                        onChange={(e) => updateQuestion(index, {
                          options: { ...scaleOpts, max: Number(e.target.value) }
                        })}
                        disabled={readonly}
                        className="w-16 border border-gray-200 rounded px-2 py-1 text-sm disabled:bg-gray-50"
                      />
                      <input
                        type="text"
                        value={scaleOpts.max_label ?? ''}
                        onChange={(e) => updateQuestion(index, {
                          options: { ...scaleOpts, max_label: e.target.value }
                        })}
                        disabled={readonly}
                        placeholder="Etiqueta (ej: Excelente)"
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
                )
              })()}
            </div>

            {!readonly && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {!readonly && (
        <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Agregar pregunta
        </Button>
      )}

      {questions.length === 0 && readonly && (
        <p className="text-sm text-gray-500 text-center py-4">No hay preguntas</p>
      )}
    </div>
  )
}
