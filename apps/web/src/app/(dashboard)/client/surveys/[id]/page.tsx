'use client'

import { useParams } from 'next/navigation'
import { SurveyRespondPage } from '@/components/surveys/SurveyRespondPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function ClientSurveyRespondPage() {
  usePageTitle('Responder Encuesta')
  const params = useParams()
  return <SurveyRespondPage surveyId={params.id as string} backPath="/client/surveys" />
}
