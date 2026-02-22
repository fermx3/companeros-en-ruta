'use client'

import { useParams } from 'next/navigation'
import { SurveyRespondPage } from '@/components/surveys/SurveyRespondPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function PromotorSurveyRespondPage() {
  usePageTitle('Responder Encuesta')
  const params = useParams()
  return <SurveyRespondPage surveyId={params.id as string} backPath="/promotor/surveys" />
}
