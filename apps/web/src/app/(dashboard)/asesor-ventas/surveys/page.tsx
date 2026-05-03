'use client'

import { SurveyListPage } from '@/components/surveys/SurveyListPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function AsesorVentasSurveysPage() {
  usePageTitle('Encuestas')
  return <SurveyListPage basePath="/asesor-ventas/surveys" />
}
