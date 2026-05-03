'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useBrandFetch } from '@/hooks/useBrandFetch'

interface ExportButtonProps {
  endpoint: string
  filename: string
  filters?: Record<string, string | undefined>
  label?: string
}

export function ExportButton({ endpoint, filename, filters, label = 'Exportar CSV' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const { brandFetch } = useBrandFetch()

  const handleExport = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.set(key, value)
          }
        })
      }

      const separator = endpoint.includes('?') ? '&' : '?'
      const url = params.toString()
        ? `${endpoint}${separator}${params.toString()}`
        : endpoint

      const response = await brandFetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error al exportar' }))
        throw new Error(errorData.error || 'Error al exportar')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Export error:', error)
      alert(error instanceof Error ? error.message : 'Error al exportar datos')
    } finally {
      setLoading(false)
    }
  }, [endpoint, filename, filters, brandFetch])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {label}
    </Button>
  )
}
