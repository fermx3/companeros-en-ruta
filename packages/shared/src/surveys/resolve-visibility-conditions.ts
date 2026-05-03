import type { SupabaseClient } from '@supabase/supabase-js'

interface SectionInput {
  sort_order: number
  visibility_condition?: {
    question_id?: string
    operator?: string
    values?: string[]
  } | null
}

/**
 * Resolves temporary `__q_N` question references in section visibility_conditions
 * to real UUIDs after questions have been inserted.
 *
 * The frontend normalizes all question_id values to `__q_N` format (where N = sort_order)
 * before sending to the API. This function maps those back to the real UUIDs
 * using the questionIdMap built from inserted questions.
 */
export async function resolveVisibilityConditions(
  supabase: SupabaseClient,
  sections: SectionInput[],
  sectionIdMap: Record<string, string>,
  questionIdMap: Record<string, string>
): Promise<void> {
  if (sections.length === 0 || Object.keys(questionIdMap).length === 0) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: { id: string; visibility_condition: any }[] = []

  for (const section of sections) {
    const vc = section.visibility_condition
    if (!vc?.question_id) continue

    const sectionId = sectionIdMap[String(section.sort_order)]
    if (!sectionId) {
      console.warn(
        `[resolveVisibilityConditions] No section UUID found for sort_order=${section.sort_order}`
      )
      continue
    }

    const tempMatch = vc.question_id.match(/^__q(?:sort)?_(\d+)$/)
    if (!tempMatch) {
      console.warn(
        `[resolveVisibilityConditions] Unexpected question_id format: ${vc.question_id} (section sort_order=${section.sort_order})`
      )
      continue
    }

    const qSortOrder = tempMatch[1]
    const realQuestionId = questionIdMap[qSortOrder]
    if (!realQuestionId) {
      console.warn(
        `[resolveVisibilityConditions] No question UUID found for sort_order=${qSortOrder} (section sort_order=${section.sort_order}). Question may have been deleted.`
      )
      continue
    }

    updates.push({
      id: sectionId,
      visibility_condition: { ...vc, question_id: realQuestionId }
    })
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('survey_sections')
      .update({ visibility_condition: update.visibility_condition })
      .eq('id', update.id)

    if (error) {
      console.error(
        `[resolveVisibilityConditions] Failed to update section ${update.id}:`,
        error.message
      )
    }
  }
}
