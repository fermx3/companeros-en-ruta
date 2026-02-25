'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, ChevronUp, ChevronDown, Settings2 } from 'lucide-react'
import type { SurveyQuestionTypeEnum, MultipleChoiceOption, VisibilityCondition, InputAttributes } from '@/lib/types/database'
import { normalizeMultipleChoiceOptions, normalizeScaleOptions } from './normalize-options'

const QUESTION_TYPE_LABELS: Record<SurveyQuestionTypeEnum, string> = {
  text: 'Texto libre',
  number: 'Número',
  multiple_choice: 'Opción múltiple',
  checkbox: 'Selección múltiple',
  scale: 'Escala',
  yes_no: 'Sí / No',
  ordered_list: 'Lista ordenada',
  percentage_distribution: 'Distribución porcentual'
}

export interface QuestionData {
  id?: string
  question_text: string
  question_type: SurveyQuestionTypeEnum
  is_required: boolean
  sort_order: number
  options?: MultipleChoiceOption[] | { min: number; max: number; min_label?: string; max_label?: string } | null
  section_id?: string | null
  input_attributes?: InputAttributes | null
}

export interface SectionData {
  id?: string
  title: string
  description?: string | null
  sort_order: number
  visibility_condition?: VisibilityCondition | null
}

const OPERATOR_LABELS: Record<string, string> = {
  equals: 'Es igual a',
  not_equals: 'No es igual a',
  in: 'Está en',
  not_in: 'No está en'
}

interface SurveyQuestionBuilderProps {
  questions: QuestionData[]
  onChange: (questions: QuestionData[]) => void
  sections?: SectionData[]
  onSectionsChange?: (sections: SectionData[]) => void
  readonly?: boolean
}

export function SurveyQuestionBuilder({ questions, onChange, sections = [], onSectionsChange, readonly = false }: SurveyQuestionBuilderProps) {
  const [editingConditionIdx, setEditingConditionIdx] = useState<number | null>(null)
  const [editingAttrsIdx, setEditingAttrsIdx] = useState<number | null>(null)

  // --- Helper: get section identifier (real id or temp index-based) ---
  const getSectionKey = (section: SectionData, index: number): string => {
    return section.id || `__temp_${index}`
  }

  // --- Helper: next top-level sort_order (shared namespace for unsectioned questions + sections) ---
  const nextTopLevelOrder = (): number => {
    const maxUnsectioned = questions
      .filter(q => !q.section_id)
      .reduce((max, q) => Math.max(max, q.sort_order), -1)
    const maxSection = sections.reduce((max, s) => Math.max(max, s.sort_order), -1)
    return Math.max(maxUnsectioned, maxSection) + 1
  }

  // --- Question management ---
  const addQuestion = (sectionId: string | null = null) => {
    const sort_order = sectionId === null
      ? nextTopLevelOrder()
      : questions.filter(q => q.section_id === sectionId).length
    onChange([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        is_required: true,
        sort_order,
        options: null,
        section_id: sectionId,
        input_attributes: null
      }
    ])
  }

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateQuestion = (index: number, updates: Partial<QuestionData>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }

    // Reset options when type changes
    if (updates.question_type) {
      const typesWithOptions = ['multiple_choice', 'checkbox', 'ordered_list', 'percentage_distribution']
      if (typesWithOptions.includes(updates.question_type)) {
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
    const question = questions[index]

    // Sectioned questions: swap within section by sort_order
    if (question.section_id) {
      const groupIndices = questions
        .map((q, i) => ({ q, i }))
        .filter(({ q }) => q.section_id === question.section_id)
        .map(({ i }) => i)

      const posInGroup = groupIndices.indexOf(index)
      const newPosInGroup = direction === 'up' ? posInGroup - 1 : posInGroup + 1
      if (newPosInGroup < 0 || newPosInGroup >= groupIndices.length) return

      const swapIndex = groupIndices[newPosInGroup]
      const updated = [...questions]
      const tempOrder = updated[index].sort_order
      updated[index] = { ...updated[index], sort_order: updated[swapIndex].sort_order }
      updated[swapIndex] = { ...updated[swapIndex], sort_order: tempOrder }
      onChange(updated)
      return
    }

    // Unsectioned questions: swap sort_order with adjacent top-level item
    const topLevel = buildTopLevelItems()
    const tlIdx = topLevel.findIndex(item => item.type === 'question' && item.globalIndex === index)
    if (tlIdx === -1) return
    const newTlIdx = direction === 'up' ? tlIdx - 1 : tlIdx + 1
    if (newTlIdx < 0 || newTlIdx >= topLevel.length) return

    const neighbor = topLevel[newTlIdx]
    const mySortOrder = question.sort_order
    if (neighbor.type === 'question') {
      const updated = [...questions]
      updated[index] = { ...updated[index], sort_order: questions[neighbor.globalIndex].sort_order }
      updated[neighbor.globalIndex] = { ...updated[neighbor.globalIndex], sort_order: mySortOrder }
      onChange(updated)
    } else {
      // Swap with a section
      const updated = [...questions]
      updated[index] = { ...updated[index], sort_order: neighbor.sortOrder }
      onChange(updated)
      if (onSectionsChange) {
        const updatedSections = [...sections]
        updatedSections[neighbor.sectionIndex!] = { ...updatedSections[neighbor.sectionIndex!], sort_order: mySortOrder }
        onSectionsChange(updatedSections)
      }
    }
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

  // --- Section management ---
  const addSection = () => {
    if (!onSectionsChange) return
    onSectionsChange([
      ...sections,
      {
        title: `Sección ${sections.length + 1}`,
        sort_order: nextTopLevelOrder(),
        visibility_condition: null
      }
    ])
  }

  const removeSection = (index: number) => {
    if (!onSectionsChange) return
    const removedSection = sections[index]
    const removedKey = getSectionKey(removedSection, index)
    // Unassign questions from this section
    const updatedQuestions = questions.map(q =>
      q.section_id === removedKey ? { ...q, section_id: null } : q
    )
    onChange(updatedQuestions)
    onSectionsChange(sections.filter((_, i) => i !== index))
  }

  const updateSection = (index: number, updates: Partial<SectionData>) => {
    if (!onSectionsChange) return
    const updated = [...sections]
    updated[index] = { ...updated[index], ...updates }
    onSectionsChange(updated)
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!onSectionsChange) return

    const topLevel = buildTopLevelItems()
    const tlIdx = topLevel.findIndex(item => item.type === 'section' && item.sectionIndex === index)
    if (tlIdx === -1) return
    const newTlIdx = direction === 'up' ? tlIdx - 1 : tlIdx + 1
    if (newTlIdx < 0 || newTlIdx >= topLevel.length) return

    const neighbor = topLevel[newTlIdx]
    const mySortOrder = sections[index].sort_order

    if (neighbor.type === 'section') {
      const neighborSIdx = neighbor.sectionIndex!
      // Swap sort_order between two sections
      const updatedSections = [...sections]
      updatedSections[index] = { ...updatedSections[index], sort_order: sections[neighborSIdx].sort_order }
      updatedSections[neighborSIdx] = { ...updatedSections[neighborSIdx], sort_order: mySortOrder }
      onSectionsChange(updatedSections)
    } else {
      // Swap with an unsectioned question
      const updatedSections = [...sections]
      updatedSections[index] = { ...updatedSections[index], sort_order: neighbor.sortOrder }
      onSectionsChange(updatedSections)

      const updated = [...questions]
      updated[neighbor.globalIndex!] = { ...updated[neighbor.globalIndex!], sort_order: mySortOrder }
      onChange(updated)
    }
  }

  // Get questions that can be used as condition sources (with stable identifiers)
  const conditionSourceQuestions = questions
    .map((q, i) => ({ ...q, _conditionKey: q.id || `__q_${i}` }))
    .filter(q => ['multiple_choice', 'yes_no', 'checkbox'].includes(q.question_type)
  )

  // --- Group questions by section ---
  const unsectionedQuestions = questions
    .map((q, i) => ({ question: q, globalIndex: i }))
    .filter(({ question }) => !question.section_id)

  const sectionGroups = sections.map((section, sIdx) => {
    const key = getSectionKey(section, sIdx)
    const sectionQuestions = questions
      .map((q, i) => ({ question: q, globalIndex: i }))
      .filter(({ question }) => question.section_id === key)
      .sort((a, b) => a.question.sort_order - b.question.sort_order)
    return { section, sIdx, key, questions: sectionQuestions }
  })

  // --- Build unified top-level items list (unsectioned questions + sections) sorted by sort_order ---
  type TopLevelItem =
    | { type: 'question'; globalIndex: number; sortOrder: number; sectionIndex?: undefined }
    | { type: 'section'; sectionIndex: number; sortOrder: number; globalIndex?: undefined }

  const buildTopLevelItems = (): TopLevelItem[] => {
    const items: TopLevelItem[] = [
      ...unsectionedQuestions.map(e => ({ type: 'question' as const, globalIndex: e.globalIndex, sortOrder: e.question.sort_order })),
      ...sectionGroups.map(g => ({ type: 'section' as const, sectionIndex: g.sIdx, sortOrder: g.section.sort_order }))
    ]
    return items.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const topLevelItems = buildTopLevelItems()

  // Build global numbering following unified top-level order
  const orderedEntries: { globalIndex: number }[] = []
  for (const item of topLevelItems) {
    if (item.type === 'question') {
      orderedEntries.push({ globalIndex: item.globalIndex })
    } else {
      const group = sectionGroups[item.sectionIndex]
      for (const sq of group.questions) {
        orderedEntries.push({ globalIndex: sq.globalIndex })
      }
    }
  }
  const globalNumberMap = new Map<number, number>()
  orderedEntries.forEach((entry, displayIdx) => {
    globalNumberMap.set(entry.globalIndex, displayIdx + 1)
  })

  // --- Section selector options for question dropdown ---
  const sectionOptions = sections.map((s, i) => ({
    key: getSectionKey(s, i),
    title: s.title
  }))

  // --- Input attributes editor ---
  const renderInputAttrsEditor = (questionIndex: number) => {
    const question = questions[questionIndex]
    const attrs = question.input_attributes || {}
    const hasTextLike = ['text', 'number'].includes(question.question_type)
    const hasCount = question.question_type === 'ordered_list'

    if (!hasTextLike && !hasCount) return null

    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-2 space-y-2 mt-2">
        <p className="text-xs font-medium text-gray-500">Atributos de input</p>
        {hasTextLike && (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-400">Placeholder</label>
                <input
                  type="text"
                  value={attrs.placeholder || ''}
                  onChange={(e) => updateQuestion(questionIndex, {
                    input_attributes: { ...attrs, placeholder: e.target.value || undefined }
                  })}
                  placeholder="Texto de ayuda..."
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-20">
                <label className="text-xs text-gray-400">Prefijo</label>
                <input
                  type="text"
                  value={attrs.prefix || ''}
                  onChange={(e) => updateQuestion(questionIndex, {
                    input_attributes: { ...attrs, prefix: e.target.value || undefined }
                  })}
                  placeholder="$"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                />
              </div>
              <div className="w-20">
                <label className="text-xs text-gray-400">Sufijo</label>
                <input
                  type="text"
                  value={attrs.suffix || ''}
                  onChange={(e) => updateQuestion(questionIndex, {
                    input_attributes: { ...attrs, suffix: e.target.value || undefined }
                  })}
                  placeholder="kg"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                />
              </div>
              {question.question_type === 'text' && (
                <div className="w-24">
                  <label className="text-xs text-gray-400">MaxLength</label>
                  <input
                    type="number"
                    value={attrs.maxLength ?? ''}
                    onChange={(e) => updateQuestion(questionIndex, {
                      input_attributes: { ...attrs, maxLength: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    placeholder="500"
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                  />
                </div>
              )}
              {question.question_type === 'number' && (
                <div className="w-24">
                  <label className="text-xs text-gray-400">Max</label>
                  <input
                    type="number"
                    value={attrs.max ?? ''}
                    onChange={(e) => updateQuestion(questionIndex, {
                      input_attributes: { ...attrs, max: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    placeholder="100"
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                  />
                </div>
              )}
            </div>
          </>
        )}
        {hasCount && (
          <div className="w-24">
            <label className="text-xs text-gray-400">Items a ordenar</label>
            <input
              type="number"
              value={attrs.count ?? ''}
              onChange={(e) => updateQuestion(questionIndex, {
                input_attributes: { ...attrs, count: e.target.value ? Number(e.target.value) : undefined }
              })}
              placeholder="3"
              min={1}
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
            />
          </div>
        )}
      </div>
    )
  }

  // --- Render a single question card ---
  const renderQuestionCard = (globalIndex: number, groupIndices: number[], tlIdx?: number) => {
    const question = questions[globalIndex]
    const isUnsectioned = !question.section_id
    // For unsectioned questions, use top-level index for bounds; for sectioned, use within-group position
    const posInGroup = isUnsectioned ? (tlIdx ?? 0) : groupIndices.indexOf(globalIndex)
    const groupLength = isUnsectioned ? topLevelItems.length : groupIndices.length
    const displayNumber = globalNumberMap.get(globalIndex) ?? globalIndex + 1

    return (
      <div key={globalIndex} className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          {!readonly && (
            <div className="flex flex-col items-center gap-0.5 pt-1">
              <button
                type="button"
                onClick={() => moveQuestion(globalIndex, 'up')}
                disabled={posInGroup === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveQuestion(globalIndex, 'down')}
                disabled={posInGroup === groupLength - 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 w-6">{displayNumber}.</span>
              <input
                type="text"
                value={question.question_text}
                onChange={(e) => updateQuestion(globalIndex, { question_text: e.target.value })}
                placeholder="Escribe la pregunta..."
                disabled={readonly}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={question.question_type}
                onChange={(e) => updateQuestion(globalIndex, { question_type: e.target.value as SurveyQuestionTypeEnum })}
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
                  onChange={(e) => updateQuestion(globalIndex, { is_required: e.target.checked })}
                  disabled={readonly}
                  className="rounded border-gray-300"
                />
                Obligatoria
              </label>

              {/* Section assignment dropdown */}
              {sectionOptions.length > 0 && !readonly && (
                <select
                  value={question.section_id || ''}
                  onChange={(e) => updateQuestion(globalIndex, { section_id: e.target.value || null })}
                  className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Sin sección</option>
                  {sectionOptions.map((s) => (
                    <option key={s.key} value={s.key}>{s.title}</option>
                  ))}
                </select>
              )}

              {/* Input attributes toggle */}
              {!readonly && ['text', 'number', 'ordered_list'].includes(question.question_type) && (
                <button
                  type="button"
                  onClick={() => setEditingAttrsIdx(editingAttrsIdx === globalIndex ? null : globalIndex)}
                  className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                    editingAttrsIdx === globalIndex || question.input_attributes
                      ? 'bg-gray-200 text-gray-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Settings2 className="w-3 h-3" /> Attrs
                </button>
              )}
            </div>

            {/* Input attributes editor */}
            {editingAttrsIdx === globalIndex && !readonly && renderInputAttrsEditor(globalIndex)}

            {/* Options editor for types that use MultipleChoiceOption[] */}
            {['multiple_choice', 'checkbox', 'ordered_list', 'percentage_distribution'].includes(question.question_type) && (
              <div className="pl-6 space-y-2">
                {normalizeMultipleChoiceOptions(question.options).map((option, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    {question.question_type === 'multiple_choice' && (
                      <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                    )}
                    {question.question_type === 'checkbox' && (
                      <div className="w-3 h-3 rounded border-2 border-gray-300" />
                    )}
                    {question.question_type === 'ordered_list' && (
                      <span className="text-xs text-gray-400 w-4">{optIdx + 1}.</span>
                    )}
                    {question.question_type === 'percentage_distribution' && (
                      <span className="text-xs text-gray-400 w-4">%</span>
                    )}
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => updateOption(globalIndex, optIdx, e.target.value)}
                      disabled={readonly}
                      placeholder={`Opción ${optIdx + 1}`}
                      className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                    {!readonly && (
                      <button
                        type="button"
                        onClick={() => removeOption(globalIndex, optIdx)}
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
                    onClick={() => addOption(globalIndex)}
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
                      onFocus={(e) => e.target.select()}
                      value={scaleOpts.min}
                      onChange={(e) => updateQuestion(globalIndex, {
                        options: { ...scaleOpts, min: Number(e.target.value) }
                      })}
                      disabled={readonly}
                      className="w-16 border border-gray-200 rounded px-2 py-1 text-sm disabled:bg-gray-50"
                    />
                    <input
                      type="text"
                      value={scaleOpts.min_label ?? ''}
                      onChange={(e) => updateQuestion(globalIndex, {
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
                      onFocus={(e) => e.target.select()}
                      value={scaleOpts.max}
                      onChange={(e) => updateQuestion(globalIndex, {
                        options: { ...scaleOpts, max: Number(e.target.value) }
                      })}
                      disabled={readonly}
                      className="w-16 border border-gray-200 rounded px-2 py-1 text-sm disabled:bg-gray-50"
                    />
                    <input
                      type="text"
                      value={scaleOpts.max_label ?? ''}
                      onChange={(e) => updateQuestion(globalIndex, {
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
              onClick={() => removeQuestion(globalIndex)}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // --- Render visibility condition editor for a section ---
  const renderConditionEditor = (sIdx: number, section: SectionData) => {
    if (editingConditionIdx !== sIdx || readonly) return null

    return (
      <div className="bg-white border border-gray-200 rounded p-2 space-y-2">
        <div>
          <label className="text-xs text-gray-500">Mostrar sección cuando la respuesta a:</label>
          <select
            value={section.visibility_condition?.question_id || ''}
            onChange={(e) => {
              const qId = e.target.value
              if (!qId) {
                updateSection(sIdx, { visibility_condition: null })
                return
              }
              updateSection(sIdx, {
                visibility_condition: {
                  question_id: qId,
                  operator: section.visibility_condition?.operator || 'equals',
                  values: section.visibility_condition?.values || []
                }
              })
            }}
            className="w-full border border-gray-200 rounded px-2 py-1 text-xs mt-1"
          >
            <option value="">Seleccionar pregunta...</option>
            {conditionSourceQuestions.map((q) => (
              <option key={q._conditionKey} value={q._conditionKey}>
                {q.question_text || `Pregunta`}
              </option>
            ))}
          </select>
        </div>
        {section.visibility_condition?.question_id && (() => {
          const selectedQuestion = conditionSourceQuestions.find(q => q._conditionKey === section.visibility_condition?.question_id)
          const predefinedOptions = selectedQuestion
            ? selectedQuestion.question_type === 'yes_no'
              ? [{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]
              : normalizeMultipleChoiceOptions(selectedQuestion.options)
            : []

          const singleSelect = selectedQuestion?.question_type === 'yes_no' || selectedQuestion?.question_type === 'multiple_choice'

          const toggleValue = (val: string) => {
            if (singleSelect) {
              updateSection(sIdx, {
                visibility_condition: { ...section.visibility_condition!, values: [val] }
              })
              return
            }
            const current = section.visibility_condition?.values || []
            const newValues = current.includes(val)
              ? current.filter(v => v !== val)
              : [...current, val]
            updateSection(sIdx, {
              visibility_condition: { ...section.visibility_condition!, values: newValues }
            })
          }

          return (
            <>
              <select
                value={section.visibility_condition.operator}
                onChange={(e) => updateSection(sIdx, {
                  visibility_condition: { ...section.visibility_condition!, operator: e.target.value as VisibilityCondition['operator'] }
                })}
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
              >
                {Object.entries(OPERATOR_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <div>
                <label className="text-xs text-gray-500">Valores:</label>
                {predefinedOptions.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {predefinedOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input
                          type={singleSelect ? 'radio' : 'checkbox'}
                          name={singleSelect ? `condition-${sIdx}` : undefined}
                          checked={section.visibility_condition?.values.includes(opt.value) || false}
                          onChange={() => toggleValue(opt.value)}
                          className="rounded border-gray-300"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={section.visibility_condition.values.join(', ')}
                    onChange={(e) => updateSection(sIdx, {
                      visibility_condition: {
                        ...section.visibility_condition!,
                        values: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                      }
                    })}
                    placeholder="valor1, valor2"
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs mt-1"
                  />
                )}
              </div>
            </>
          )
        })()}
      </div>
    )
  }

  // --- Render a section block ---
  const renderSectionBlock = ({ section, sIdx, key, questions: sectionQuestions }: typeof sectionGroups[number], tlIdx: number) => (
    <div key={key} className="border border-blue-200 bg-blue-50/30 rounded-lg p-4 space-y-3">
      {/* Section header */}
      <div className="flex items-start gap-2">
        {!readonly && (
          <div className="flex flex-col items-center gap-0.5 pt-1">
            <button type="button" onClick={() => moveSection(sIdx, 'up')} disabled={tlIdx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => moveSection(sIdx, 'down')} disabled={tlIdx === topLevelItems.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSection(sIdx, { title: e.target.value })}
            disabled={readonly}
            placeholder="Título de la sección"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-transparent disabled:border-transparent disabled:font-semibold"
          />
          <input
            type="text"
            value={section.description || ''}
            onChange={(e) => updateSection(sIdx, { description: e.target.value || null })}
            disabled={readonly}
            placeholder="Descripción (opcional)"
            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-transparent disabled:border-transparent"
          />

          {/* Visibility condition */}
          {!readonly && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingConditionIdx(editingConditionIdx === sIdx ? null : sIdx)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Settings2 className="w-3 h-3" />
                {section.visibility_condition ? 'Condicional' : 'Agregar condición'}
              </button>
              {section.visibility_condition && (
                <button
                  type="button"
                  onClick={() => updateSection(sIdx, { visibility_condition: null })}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Quitar
                </button>
              )}
            </div>
          )}

          {/* Readonly: show condition badge */}
          {readonly && section.visibility_condition && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <Settings2 className="w-3 h-3" /> Condicional
            </span>
          )}

          {renderConditionEditor(sIdx, section)}
        </div>

        {!readonly && (
          <button type="button" onClick={() => removeSection(sIdx)} className="text-gray-400 hover:text-red-500 p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Section questions */}
      {sectionQuestions.length > 0 && (
        <div className="space-y-3 pl-2">
          {sectionQuestions.map(({ globalIndex }) =>
            renderQuestionCard(globalIndex, sectionQuestions.map(e => e.globalIndex))
          )}
        </div>
      )}

      {sectionQuestions.length === 0 && (
        <p className="text-xs text-gray-400 pl-2">Sin preguntas en esta sección</p>
      )}

      {/* Add question to this section */}
      {!readonly && (
        <button
          type="button"
          onClick={() => addQuestion(key)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 pl-2"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar pregunta a esta sección
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Unified top-level rendering: interleaved unsectioned questions and sections */}
      {topLevelItems.map((item, tlIdx) => {
        if (item.type === 'question') {
          return (
            <div key={`q-${item.globalIndex}`} className="space-y-3">
              {renderQuestionCard(item.globalIndex, topLevelItems.filter(i => i.type === 'question').map(i => i.globalIndex!), tlIdx)}
            </div>
          )
        } else {
          const group = sectionGroups[item.sectionIndex]
          return renderSectionBlock(group, tlIdx)
        }
      })}

      {/* Bottom action buttons */}
      {!readonly && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => addQuestion(null)} className="flex-1">
            <Plus className="w-4 h-4 mr-2" /> Agregar pregunta
          </Button>
          {onSectionsChange && (
            <Button type="button" variant="outline" onClick={addSection}>
              <Plus className="w-4 h-4 mr-2" /> Agregar sección
            </Button>
          )}
        </div>
      )}

      {questions.length === 0 && sections.length === 0 && readonly && (
        <p className="text-sm text-gray-500 text-center py-4">No hay preguntas</p>
      )}
    </div>
  )
}
