'use client'

import React, { useState, useRef, useCallback } from 'react'
import { LoadingSpinner } from '@/components/ui/feedback'

interface ImageUploadProps {
  currentImageUrl?: string
  onUpload: (file: File) => Promise<string>
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function ImageUpload({
  currentImageUrl,
  onUpload,
  accept = 'image/png,image/jpeg,image/svg+xml,image/webp',
  maxSizeMB = 2,
  className = '',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentImageUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imageError, setImageError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync preview with prop changes
  React.useEffect(() => {
    setPreview(currentImageUrl)
    setImageError(false)
  }, [currentImageUrl])

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    // Validate type
    const allowedTypes = accept.split(',').map(t => t.trim())
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido.')
      return
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo excede ${maxSizeMB}MB.`)
      return
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setImageError(false)
    setUploading(true)

    try {
      const url = await onUpload(file)
      setPreview(url)
    } catch (err) {
      setPreview(currentImageUrl)
      const message = err instanceof Error ? err.message : 'Error al subir imagen'
      setError(message)
    } finally {
      setUploading(false)
      URL.revokeObjectURL(localPreview)
    }
  }, [accept, maxSizeMB, onUpload, currentImageUrl])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={className}>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full border-2 border-dashed rounded-lg
          flex flex-col items-center justify-center
          cursor-pointer transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
        style={{ minHeight: '160px' }}
      >
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg z-10">
            <div className="text-center">
              <LoadingSpinner size="md" className="mx-auto mb-2" />
              <p className="text-sm text-gray-600">Subiendo...</p>
            </div>
          </div>
        )}

        {preview && !imageError ? (
          <div className="p-4 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Vista previa"
              className="max-h-24 max-w-full object-contain rounded"
              onError={() => setImageError(true)}
            />
            <p className="mt-2 text-xs text-gray-500">
              Haz clic o arrastra para cambiar
            </p>
          </div>
        ) : (
          <div className="p-6 text-center">
            <svg className="mx-auto w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600">
              Haz clic o arrastra una imagen
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, SVG o WebP. Max {maxSizeMB}MB.
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
