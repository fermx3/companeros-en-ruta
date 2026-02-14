'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, X, Upload, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EvidencePhoto {
  id: string
  file?: File
  previewUrl: string
  fileUrl?: string
  caption: string
  evidenceType: string
  captureLatitude?: number
  captureLongitude?: number
  capturedAt: Date
}

interface PhotoEvidenceUploadProps {
  photos: EvidencePhoto[]
  onPhotosChange: (photos: EvidencePhoto[]) => void
  evidenceStage: 'pricing' | 'inventory' | 'communication'
  evidenceTypes: Array<{ value: string; label: string }>
  minPhotos?: number
  maxPhotos?: number
  className?: string
}

export function PhotoEvidenceUpload({
  photos,
  onPhotosChange,
  evidenceStage,
  evidenceTypes,
  minPhotos = 1,
  maxPhotos = 10,
  className
}: PhotoEvidenceUploadProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturingLocation, setCapturingLocation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const captureLocation = useCallback(async (): Promise<{ latitude: number; longitude: number } | null> => {
    setCapturingLocation(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
    } catch (error) {
      console.warn('Could not capture location:', error)
      return null
    } finally {
      setCapturingLocation(false)
    }
  }, [])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsCapturing(true)

    try {
      const location = await captureLocation()
      const newPhotos: EvidencePhoto[] = []

      for (const file of Array.from(files)) {
        if (photos.length + newPhotos.length >= maxPhotos) break

        const previewUrl = URL.createObjectURL(file)
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          previewUrl,
          caption: '',
          evidenceType: evidenceTypes[0]?.value || 'general',
          captureLatitude: location?.latitude,
          captureLongitude: location?.longitude,
          capturedAt: new Date()
        })
      }

      onPhotosChange([...photos, ...newPhotos])
    } finally {
      setIsCapturing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId)
    if (photo?.previewUrl && !photo.fileUrl) {
      URL.revokeObjectURL(photo.previewUrl)
    }
    onPhotosChange(photos.filter(p => p.id !== photoId))
  }

  const handleUpdatePhoto = (photoId: string, updates: Partial<EvidencePhoto>) => {
    onPhotosChange(
      photos.map(p => (p.id === photoId ? { ...p, ...updates } : p))
    )
  }

  const hasMinPhotos = photos.length >= minPhotos
  const canAddMore = photos.length < maxPhotos

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Evidencia Fotográfica
          </h3>
          <p className="text-xs text-gray-500">
            {minPhotos > 0 && !hasMinPhotos
              ? `Mínimo ${minPhotos} foto${minPhotos > 1 ? 's' : ''} requerida${minPhotos > 1 ? 's' : ''}`
              : `${photos.length} de ${maxPhotos} fotos`}
          </p>
        </div>

        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 mr-2" />
            )}
            {isCapturing ? 'Capturando...' : 'Agregar Foto'}
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photos grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              {/* Photo preview */}
              <div className="aspect-square relative">
                <img
                  src={photo.previewUrl || photo.fileUrl}
                  alt={photo.caption || 'Evidencia'}
                  className="w-full h-full object-cover"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Location indicator */}
                {(photo.captureLatitude && photo.captureLongitude) && (
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    GPS
                  </div>
                )}
              </div>

              {/* Photo details */}
              <div className="p-2 space-y-2">
                {/* Evidence type selector */}
                <select
                  value={photo.evidenceType}
                  onChange={(e) => handleUpdatePhoto(photo.id, { evidenceType: e.target.value })}
                  className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {evidenceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                {/* Caption input */}
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(e) => handleUpdatePhoto(photo.id, { caption: e.target.value })}
                  placeholder="Descripción..."
                  className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isCapturing}
          className={cn(
            'w-full border-2 border-dashed rounded-lg p-8 text-center',
            'hover:border-blue-400 hover:bg-blue-50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            !hasMinPhotos && 'border-red-300 bg-red-50'
          )}
        >
          {isCapturing ? (
            <Loader2 className="w-12 h-12 mx-auto text-gray-400 animate-spin" />
          ) : capturingLocation ? (
            <>
              <MapPin className="w-12 h-12 mx-auto text-blue-400 animate-pulse" />
              <p className="mt-2 text-sm text-gray-600">Obteniendo ubicación...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Toca para tomar o seleccionar fotos
              </p>
              {!hasMinPhotos && (
                <p className="mt-1 text-xs text-red-500">
                  Se requiere al menos {minPhotos} foto{minPhotos > 1 ? 's' : ''}
                </p>
              )}
            </>
          )}
        </button>
      )}

      {/* Validation message */}
      {!hasMinPhotos && photos.length > 0 && (
        <p className="text-xs text-red-500">
          Faltan {minPhotos - photos.length} foto{minPhotos - photos.length > 1 ? 's' : ''} para completar el mínimo requerido
        </p>
      )}
    </div>
  )
}
