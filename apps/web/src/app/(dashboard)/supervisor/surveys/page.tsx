'use client'

import { SurveyListPage } from '@/components/surveys/SurveyListPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function SupervisorSurveysPage() {
  usePageTitle('Encuestas')
  return <SurveyListPage basePath="/supervisor/surveys" />
}
