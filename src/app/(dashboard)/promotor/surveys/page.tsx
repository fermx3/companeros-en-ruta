'use client'

import { SurveyListPage } from '@/components/surveys/SurveyListPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function PromotorSurveysPage() {
  usePageTitle('Encuestas')
  return <SurveyListPage basePath="/promotor/surveys" />
}
