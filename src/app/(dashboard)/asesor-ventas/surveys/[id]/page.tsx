'use client'

import { useParams } from 'next/navigation'
import { SurveyRespondPage } from '@/components/surveys/SurveyRespondPage'

export default function AsesorVentasSurveyRespondPage() {
  const params = useParams()
  return <SurveyRespondPage surveyId={params.id as string} backPath="/asesor-ventas/surveys" />
}
