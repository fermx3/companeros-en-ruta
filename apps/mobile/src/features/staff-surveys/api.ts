import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiFetch } from '@/lib/api'

/**
 * Staff surveys feature.
 *
 * Hits the same /api/surveys endpoints as the client mobile app — the backend
 * already filters by the authenticated user's roles via target_roles overlap,
 * so promotor / asesor_de_ventas / supervisor each see only the surveys their
 * role is targeted by. No separate /api/staff/surveys endpoint is needed.
 */

export interface StaffSurveyListItem {
  id: string
  public_id: string
  title: string
  description: string | null
  survey_status: string
  start_date: string | null
  end_date: string | null
  brands: { name: string; logo_url: string | null } | null
  has_responded?: boolean
}

export interface StaffSurveysListResponse {
  surveys: StaffSurveyListItem[]
}

export interface StaffSurveySection {
  id: string
  title: string | null
  description: string | null
  sort_order: number
  visibility_condition: Record<string, unknown> | null
}

export interface StaffSurveyQuestion {
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

export interface StaffSurveyDetailResponse {
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
    survey_sections: StaffSurveySection[]
    survey_questions: StaffSurveyQuestion[]
  }
  has_responded: boolean
  existing_response: { id: string; submitted_at: string } | null
}

export function useStaffSurveys() {
  return useQuery<StaffSurveysListResponse>({
    queryKey: ['staff', 'surveys'],
    queryFn: () => apiFetch<StaffSurveysListResponse>('/api/surveys'),
  })
}

/** Banner / badge helper — pending = active surveys the user hasn't answered. */
export function usePendingStaffSurveys() {
  const surveysQuery = useStaffSurveys()
  const pending = (surveysQuery.data?.surveys ?? []).filter(s => !s.has_responded)
  return {
    pendingCount: pending.length,
    firstPending: pending[0] ?? null,
    isLoading: surveysQuery.isLoading,
    isRefetching: surveysQuery.isRefetching,
    refetch: surveysQuery.refetch,
  }
}

export function useStaffSurvey(surveyId: string | undefined) {
  return useQuery<StaffSurveyDetailResponse>({
    queryKey: ['staff', 'surveys', surveyId],
    queryFn: () => apiFetch<StaffSurveyDetailResponse>(`/api/surveys/${surveyId}`),
    enabled: !!surveyId,
  })
}

export interface SubmitStaffSurveyAnswer {
  question_id: string
  answer_text?: string | null
  answer_value?: unknown
}

export function useSubmitStaffSurvey(surveyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (answers: SubmitStaffSurveyAnswer[]) =>
      apiFetch<{ success: true }>(`/api/surveys/${surveyId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', 'surveys'] })
      qc.invalidateQueries({ queryKey: ['staff', 'surveys', surveyId] })
    },
  })
}

/** 409 = ya respondida. Surfaces as a clear UX message instead of a raw error. */
export function isDuplicateStaffSurveyResponse(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409
}
