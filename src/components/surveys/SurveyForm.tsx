'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { SurveyQuestionTypeEnum, MultipleChoiceOption, VisibilityCondition, InputAttributes } from '@/lib/types/database'
import { normalizeMultipleChoiceOptions, normalizeScaleOptions } from './normalize-options'

interface Question {
  id: string
  question_text: string
  question_type: SurveyQuestionTypeEnum
  is_required: boolean
  sort_order: number
  options?: MultipleChoiceOption[] | { min: number; max: number; min_label?: string; max_label?: string } | null
  section_id?: string | null
  input_attributes?: InputAttributes | null
}

interface Section {
  id: string
  title: string
  description?: string | null
  sort_order: number
  visibility_condition?: VisibilityCondition | null
}

interface SurveyFormProps {
  questions: Question[]
  sections?: Section[]
  onSubmit?: (answers: Array<{ question_id: string; value: unknown }>) => Promise<void>
  loading?: boolean
  isPreview?: boolean
}

function isSectionVisible(section: Section, answers: Record<string, unknown>): boolean {
  if (!section.visibility_condition) return true
  const { question_id, operator, values } = section.visibility_condition
  const answer = answers[question_id]
  if (answer === undefined || answer === null) return false

  // Normalize: booleans → "yes"/"no", arrays → string[], else string
  let answerValues: string[]
  if (typeof answer === 'boolean') {
    answerValues = [answer ? 'yes' : 'no']
  } else if (Array.isArray(answer)) {
    answerValues = answer.map(String)
  } else {
    answerValues = [String(answer)]
  }

  switch (operator) {
    case 'equals':
    case 'in':
      return answerValues.some(a => values.includes(a))
    case 'not_equals':
    case 'not_in':
      return !answerValues.some(a => values.includes(a))
    default: return true
  }
}

export function SurveyForm({ questions, sections, onSubmit, loading = false, isPreview = false }: SurveyFormProps) {
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

  // Determine which questions are visible based on section visibility
  const getVisibleQuestions = (): Question[] => {
    if (!sections || sections.length === 0) return questions

    const hiddenSectionIds = new Set(
      sections
        .filter(s => !isSectionVisible(s, answers))
        .map(s => s.id)
    )

    return questions.filter(q => {
      if (!q.section_id) return true // No section = always visible
      return !hiddenSectionIds.has(q.section_id)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const visibleQuestions = getVisibleQuestions()

    // Validate required (only visible questions)
    const newErrors: Record<string, string> = {}
    for (const q of visibleQuestions) {
      if (q.is_required) {
        const val = answers[q.id]
        if (q.question_type === 'checkbox' || q.question_type === 'ordered_list') {
          if (!Array.isArray(val) || val.length === 0) {
            newErrors[q.id] = 'Esta pregunta es obligatoria'
          }
        } else if (q.question_type === 'percentage_distribution') {
          if (!val || typeof val !== 'object') {
            newErrors[q.id] = 'Esta pregunta es obligatoria'
          } else {
            const values = Object.values(val as Record<string, number>)
            const sum = values.reduce((s: number, n: number) => s + n, 0)
            if (Math.abs(sum - 100) > 0.01) {
              newErrors[q.id] = 'Los porcentajes deben sumar 100%'
            }
          }
        } else if (val === undefined || val === null || val === '') {
          newErrors[q.id] = 'Esta pregunta es obligatoria'
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Only submit answers for visible questions
    const visibleIds = new Set(visibleQuestions.map(q => q.id))
    const formattedAnswers = Object.entries(answers)
      .filter(([qId, value]) => visibleIds.has(qId) && value !== undefined && value !== null && value !== '')
      .map(([question_id, value]) => ({ question_id, value }))

    await onSubmit!(formattedAnswers)
  }

  const renderQuestion = (question: Question) => {
    const error = errors[question.id]
    const attrs = question.input_attributes

    switch (question.question_type) {
      case 'text':
        return (
          <div>
            {attrs?.prefix || attrs?.suffix ? (
              <div className="flex items-center gap-2">
                {attrs.prefix && <span className="text-sm text-gray-500 font-medium">{attrs.prefix}</span>}
                <textarea
                  value={(answers[question.id] as string) || ''}
                  onChange={(e) => setAnswer(question.id, e.target.value)}
                  placeholder={attrs?.placeholder || 'Escribe tu respuesta...'}
                  maxLength={attrs?.maxLength}
                  rows={3}
                  className={`flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : 'border-gray-300'}`}
                />
                {attrs.suffix && <span className="text-sm text-gray-500 font-medium">{attrs.suffix}</span>}
              </div>
            ) : (
              <textarea
                value={(answers[question.id] as string) || ''}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                placeholder={attrs?.placeholder || 'Escribe tu respuesta...'}
                maxLength={attrs?.maxLength}
                rows={3}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : 'border-gray-300'}`}
              />
            )}
            {attrs?.maxLength && (
              <p className="text-xs text-gray-400 mt-1 text-right">
                {((answers[question.id] as string) || '').length} / {attrs.maxLength}
              </p>
            )}
          </div>
        )

      case 'number':
        return (
          <div className="flex items-center gap-2">
            {attrs?.prefix && <span className="text-sm text-gray-500 font-medium">{attrs.prefix}</span>}
            <input
              type="number"
              onFocus={(e) => e.target.select()}
              value={(answers[question.id] as number) ?? ''}
              onChange={(e) => setAnswer(question.id, e.target.value ? Number(e.target.value) : '')}
              placeholder={attrs?.placeholder || '0'}
              max={attrs?.max}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : 'border-gray-300'}`}
            />
            {attrs?.suffix && <span className="text-sm text-gray-500 font-medium">{attrs.suffix}</span>}
          </div>
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

      case 'checkbox': {
        const checkboxOptions = normalizeMultipleChoiceOptions(question.options)
        const selected = (answers[question.id] as string[]) || []
        return (
          <div className="space-y-2">
            {checkboxOptions.map((option) => {
              const isChecked = selected.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50'
                      : `border-gray-200 hover:bg-gray-50 ${error ? 'border-red-200' : ''}`
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const next = isChecked
                        ? selected.filter(v => v !== option.value)
                        : [...selected, option.value]
                      setAnswer(question.id, next)
                    }}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              )
            })}
          </div>
        )
      }

      case 'ordered_list': {
        const listOptions = normalizeMultipleChoiceOptions(question.options)
        // For ordered_list with count attribute, limit how many items to order
        const maxItems = attrs?.count || listOptions.length
        const orderedValues = (answers[question.id] as string[]) || listOptions.slice(0, maxItems).map(o => o.value)
        // Initialize on first render
        if (!answers[question.id]) {
          setTimeout(() => setAnswer(question.id, listOptions.slice(0, maxItems).map(o => o.value)), 0)
        }
        const labelMap = Object.fromEntries(listOptions.map(o => [o.value, o.label]))

        const moveItem = (idx: number, direction: 'up' | 'down') => {
          const newIdx = direction === 'up' ? idx - 1 : idx + 1
          if (newIdx < 0 || newIdx >= orderedValues.length) return
          const next = [...orderedValues]
          const temp = next[idx]
          next[idx] = next[newIdx]
          next[newIdx] = temp
          setAnswer(question.id, next)
        }

        return (
          <div className="space-y-2">
            {attrs?.count && attrs.count < listOptions.length && (
              <p className="text-xs text-gray-500 mb-1">Ordena los {attrs.count} primeros</p>
            )}
            {orderedValues.map((val, idx) => (
              <div
                key={val}
                className={`flex items-center gap-3 p-3 border rounded-lg bg-white ${error ? 'border-red-200' : 'border-gray-200'}`}
              >
                <span className="text-xs font-bold text-gray-400 w-6 text-center">{idx + 1}</span>
                <span className="flex-1 text-sm text-gray-700">{labelMap[val] || val}</span>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === orderedValues.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      case 'percentage_distribution': {
        const pctOptions = normalizeMultipleChoiceOptions(question.options)
        const pctValues = (answers[question.id] as Record<string, number>) || {}
        const sum = Object.values(pctValues).reduce((s, n) => s + (n || 0), 0)

        return (
          <div className="space-y-3">
            {pctOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-1/3 truncate">{option.label}</span>
                <input
                  type="number"
                  onFocus={(e) => e.target.select()}
                  min={0}
                  max={100}
                  value={pctValues[option.value] ?? ''}
                  onChange={(e) => {
                    const next = { ...pctValues }
                    next[option.value] = e.target.value ? Number(e.target.value) : 0
                    setAnswer(question.id, next)
                  }}
                  placeholder="0"
                  className={`w-20 border rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : 'border-gray-300'}`}
                />
                <span className="text-sm text-gray-400">%</span>
              </div>
            ))}
            <div className={`text-sm font-medium text-right ${Math.abs(sum - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              Total: {sum}%
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  const hasSections = sections && sections.length > 0

  // Render questions grouped by sections
  const renderWithSections = () => {
    const sortedSections = [...sections!].sort((a, b) => a.sort_order - b.sort_order)

    // Questions without a section (rendered first)
    const unsectionedQuestions = questions.filter(q => !q.section_id)

    // Track global question number
    let questionNumber = 0

    return (
      <>
        {/* Unsectioned questions first */}
        {unsectionedQuestions.map((question) => {
          questionNumber++
          return renderQuestionCard(question, questionNumber)
        })}

        {/* Sectioned questions */}
        {sortedSections.map((section) => {
          const visible = isSectionVisible(section, answers)
          if (!visible) return null

          const sectionQuestions = questions
            .filter(q => q.section_id === section.id)
            .sort((a, b) => a.sort_order - b.sort_order)

          if (sectionQuestions.length === 0) return null

          return (
            <div key={section.id} className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                )}
              </div>
              {sectionQuestions.map((question) => {
                questionNumber++
                return renderQuestionCard(question, questionNumber)
              })}
            </div>
          )
        })}
      </>
    )
  }

  const renderQuestionCard = (question: Question, number: number) => (
    <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-900">
          <span className="text-gray-400 mr-2">{number}.</span>
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </p>
      </div>

      {renderQuestion(question)}

      {errors[question.id] && (
        <p className="text-xs text-red-600 mt-1">{errors[question.id]}</p>
      )}
    </div>
  )

  // Flat render (no sections — backward compatible)
  const renderFlat = () => (
    <>
      {questions.map((question, index) => renderQuestionCard(question, index + 1))}
    </>
  )

  if (isPreview) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 font-medium">
          Vista previa — Las respuestas no se guardarán
        </div>
        {hasSections ? renderWithSections() : renderFlat()}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasSections ? renderWithSections() : renderFlat()}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando...' : 'Enviar respuestas'}
      </Button>
    </form>
  )
}
