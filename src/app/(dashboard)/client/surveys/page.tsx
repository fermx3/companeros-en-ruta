'use client'

import { SurveyListPage } from '@/components/surveys/SurveyListPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function ClientSurveysPage() {
  usePageTitle('Encuestas')
  return <SurveyListPage basePath="/client/surveys" />
}
