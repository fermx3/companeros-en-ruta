'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert } from '@/components/ui/feedback'
import { Download } from 'lucide-react'
import { DatasetSelector, type DatasetKey } from '@/components/exports/DatasetSelector'
import { SegmentationFilters, type ExportFilters } from '@/components/exports/SegmentationFilters'
import { FilterPreview } from '@/components/exports/FilterPreview'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function BrandExportsPage() {
  usePageTitle('Exportaciones')
  const { brandFetch } = useBrandFetch()
  const [selectedDatasets, setSelectedDatasets] = useState<DatasetKey[]>([])
  const [filters, setFilters] = useState<ExportFilters>({})
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [totalRecords, setTotalRecords] = useState(0)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced preview
  const fetchPreview = useCallback(async () => {
    if (selectedDatasets.length === 0) {
      setCounts(null)
      setTotalRecords(0)
      return
    }

    setPreviewLoading(true)
    try {
      const res = await brandFetch('/api/brand/exports/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasets: selectedDatasets, filters }),
      })

      if (res.ok) {
        const data = await res.json()
        setCounts(data.counts)
        setTotalRecords(data.total_records)
      }
    } catch {
      // Preview is non-critical
    } finally {
      setPreviewLoading(false)
    }
  }, [selectedDatasets, filters, brandFetch])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchPreview, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [fetchPreview])

  const handleExport = async () => {
    if (selectedDatasets.length === 0) return

    setExporting(true)
    setError(null)

    try {
      const res = await brandFetch('/api/brand/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasets: selectedDatasets, filters }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error al exportar' }))
        throw new Error(errorData.error || 'Error al exportar')
      }

      const blob = await res.blob()
      const isZip = selectedDatasets.length > 1
      const extension = isZip ? 'zip' : 'csv'
      const filename = `export_${new Date().toISOString().split('T')[0]}.${extension}`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar datos')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/brand" className="text-gray-400 hover:text-gray-500">
                      Marca
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Exportar Datos</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Exportar Datos
              </h1>
              <p className="text-gray-600 mt-1">
                Selecciona datasets y aplica filtros para exportar datos segmentados
              </p>
            </div>
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Dataset Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selección de datos</CardTitle>
              </CardHeader>
              <CardContent>
                <DatasetSelector
                  selected={selectedDatasets}
                  onChange={setSelectedDatasets}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Segmentation Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <SegmentationFilters
                  filters={filters}
                  onChange={setFilters}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <FilterPreview
        counts={counts}
        totalRecords={totalRecords}
        loading={exporting}
        previewLoading={previewLoading}
        selectedDatasets={selectedDatasets}
        onExport={handleExport}
      />
    </div>
  )
}
