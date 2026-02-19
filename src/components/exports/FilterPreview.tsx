'use client'

import { Button } from '@/components/ui/button'
import { Download, Loader2, FileText } from 'lucide-react'
import type { DatasetKey } from './DatasetSelector'

interface FilterPreviewProps {
  counts: Record<string, number> | null
  totalRecords: number
  loading: boolean
  previewLoading: boolean
  selectedDatasets: DatasetKey[]
  onExport: () => void
}

const DATASET_LABELS: Record<DatasetKey, string> = {
  clients: 'Clientes',
  visits: 'Visitas',
  memberships: 'Membresías',
  promotions: 'Promociones',
  surveys: 'Encuestas',
  products: 'Productos',
  team: 'Equipo',
  competitors: 'Competidores',
  pop_materials: 'Materiales POP',
}

export function FilterPreview({ counts, totalRecords, loading, previewLoading, selectedDatasets, onExport }: FilterPreviewProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t shadow-lg px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {selectedDatasets.length} dataset{selectedDatasets.length !== 1 ? 's' : ''}
            </span>
          </div>

          {counts && !previewLoading && (
            <div className="flex items-center gap-4">
              {selectedDatasets.map(key => (
                counts[key] !== undefined && (
                  <span key={key} className="text-xs text-gray-500">
                    {DATASET_LABELS[key]}: <span className="font-semibold text-gray-700">{(counts[key] || 0).toLocaleString()}</span>
                  </span>
                )
              ))}
              <span className="text-sm font-semibold text-gray-900">
                Total: {totalRecords.toLocaleString()} registros
              </span>
            </div>
          )}

          {previewLoading && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Calculando...
            </span>
          )}
        </div>

        <Button
          onClick={onExport}
          disabled={loading || selectedDatasets.length === 0}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {selectedDatasets.length > 1 ? 'Exportar ZIP' : 'Exportar CSV'}
        </Button>
      </div>
    </div>
  )
}
