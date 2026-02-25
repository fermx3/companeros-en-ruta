'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { SurveyForm } from './SurveyForm'
import type { QuestionData, SectionData } from './SurveyQuestionBuilder'

interface SurveyPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: QuestionData[]
  sections?: SectionData[]
}

export function SurveyPreviewDialog({ open, onOpenChange, questions, sections }: SurveyPreviewDialogProps) {
  // Map QuestionData/SectionData → SurveyForm's Question/Section shape
  const mappedQuestions = questions.map((q, i) => ({
    id: q.id || `__preview_q_${i}`,
    question_text: q.question_text,
    question_type: q.question_type,
    is_required: q.is_required,
    sort_order: q.sort_order ?? i,
    options: q.options,
    section_id: q.section_id || null,
    input_attributes: q.input_attributes,
  }))

  const mappedSections = (sections || []).map((s, i) => ({
    id: s.id || `__preview_s_${i}`,
    title: s.title,
    description: s.description,
    sort_order: s.sort_order ?? i,
    visibility_condition: s.visibility_condition,
  }))

  // Fix section_id references: if questions reference temp section IDs like __temp_0,
  // map them to the preview section IDs
  const sectionIdMap = new Map<string, string>()
  ;(sections || []).forEach((s, i) => {
    const previewId = s.id || `__preview_s_${i}`
    // Map original id
    if (s.id) sectionIdMap.set(s.id, previewId)
    // Map __temp_ pattern used in create flow
    sectionIdMap.set(`__temp_${i}`, previewId)
  })

  const finalQuestions = mappedQuestions.map(q => ({
    ...q,
    section_id: q.section_id ? (sectionIdMap.get(q.section_id) || q.section_id) : null,
  }))

  // Fix visibility_condition question_id references
  const questionIdMap = new Map<string, string>()
  questions.forEach((q, i) => {
    const previewId = q.id || `__preview_q_${i}`
    if (q.id) questionIdMap.set(q.id, previewId)
    questionIdMap.set(`__q_${i}`, previewId)
  })

  const finalSections = mappedSections.map(s => ({
    ...s,
    visibility_condition: s.visibility_condition
      ? {
          ...s.visibility_condition,
          question_id: questionIdMap.get(s.visibility_condition.question_id) || s.visibility_condition.question_id,
        }
      : null,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Vista previa de encuesta</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>
        <SurveyForm
          questions={finalQuestions}
          sections={finalSections.length > 0 ? finalSections : undefined}
          isPreview
        />
      </DialogContent>
    </Dialog>
  )
}
