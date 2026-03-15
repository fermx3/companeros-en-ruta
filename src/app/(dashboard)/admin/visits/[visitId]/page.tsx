'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/feedback'
import { VisitDetailReadOnly } from '@/components/visits/VisitDetailReadOnly'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { VisitDetailData } from '@/lib/api/visit-detail'

export default function AdminVisitDetailPage() {
  usePageTitle('Detalle de Visita')
  const params = useParams()
  const visitId = params.visitId as string
  const [data, setData] = useState<VisitDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/visits/${visitId}`, { signal: controller.signal })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar visita')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadDetail()
    return () => controller.abort()
  }, [visitId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalle de visita...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-red-800 font-semibold">Error al cargar la visita</h3>
            <p className="text-red-600 text-sm mt-1">{error || 'Visita no encontrada'}</p>
            <Link href="/admin">
              <Button variant="outline" className="mt-4">Volver al panel</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link href="/admin" className="text-gray-400 hover:text-gray-500">Admin</Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-gray-900 font-medium">Visita {data.visit.public_id}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VisitDetailReadOnly data={data} />
      </div>
    </div>
  )
}
