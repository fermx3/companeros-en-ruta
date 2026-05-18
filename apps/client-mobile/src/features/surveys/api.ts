import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiFetch } from '@/lib/api'

export interface SurveyListItem {
  id: string
  public_id: string
  title: string
  description: string | null
  survey_status: string
  start_date: string | null
  end_date: string | null
  brands: { name: string; logo_url: string | null } | null
  /** True when the user has already submitted a response. */
  has_responded?: boolean
}

export interface SurveysListResponse {
  surveys: SurveyListItem[]
}

export interface SurveySection {
  id: string
  title: string | null
  description: string | null
  sort_order: number
  visibility_condition: Record<string, unknown> | null
}

export interface SurveyQuestion {
  id: string
  public_id: string
  question_text: string
  question_type: string
  is_required: boolean
  sort_order: number
  options: { value: string; label: string }[] | null
  section_id: string | null
  input_attributes: Record<string, unknown> | null
}

export interface SurveyDetailResponse {
  survey: {
    id: string
    public_id: string
    title: string
    description: string | null
    survey_status: string
    target_roles: string[] | null
    start_date: string | null
    end_date: string | null
    max_responses_per_user: number | null
    brands: { name: string; logo_url: string | null } | null
    survey_sections: SurveySection[]
    survey_questions: SurveyQuestion[]
  }
  has_responded: boolean
  existing_response: { id: string; submitted_at: string } | null
}

export function useSurveys() {
  return useQuery<SurveysListResponse>({
    queryKey: ['client', 'surveys'],
    queryFn: () => apiFetch<SurveysListResponse>('/api/surveys'),
  })
}

export function useSurvey(surveyId: string | undefined) {
  return useQuery<SurveyDetailResponse>({
    queryKey: ['client', 'surveys', surveyId],
    queryFn: () => apiFetch<SurveyDetailResponse>(`/api/surveys/${surveyId}`),
    enabled: !!surveyId,
  })
}

export interface SubmitSurveyAnswer {
  question_id: string
  answer_text?: string | null
  answer_value?: unknown
}

export function useSubmitSurvey(surveyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (answers: SubmitSurveyAnswer[]) =>
      apiFetch<{ success: true }>(`/api/surveys/${surveyId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', 'surveys'] })
      qc.invalidateQueries({ queryKey: ['client', 'surveys', surveyId] })
    },
  })
}

/**
 * Client submissions to /api/surveys/[id]/respond were 403'd before the
 * survey_responses.client_id migration. Kept as defense-in-depth so older
 * builds or unexpected regressions surface a clear message instead of a raw
 * error.
 */
export function isClientSubmitUnsupported(err: unknown): boolean {
  return err instanceof ApiError && err.status === 403
}

/** A 409 from the respond endpoint means the user already submitted this survey. */
export function isDuplicateSurveyResponse(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409
}
