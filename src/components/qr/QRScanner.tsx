'use client'

/**
 * QR Code Scanner Component
 * TASK-013: Scan QR codes using device camera
 *
 * Uses a ref-based container approach to prevent React/html5-qrcode DOM conflicts.
 * The scanner div is created manually and managed outside React's reconciliation.
 */

import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/feedback'
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  X,
  QrCode
} from 'lucide-react'

interface QRScannerProps {
  /** Callback when a QR code is successfully scanned */
  onScan: (code: string) => void
  /** Callback when scanning fails */
  onError?: (error: string) => void
  /** Callback when scanner is closed */
  onClose?: () => void
  /** Width of the scanner viewport */
  width?: number
  /** Height of the scanner viewport */
  height?: number
  /** FPS for scanning */
  fps?: number
  /** Whether to show close button */
  showCloseButton?: boolean
  /** Title to display */
  title?: string
  /** Description text */
  description?: string
  /** Additional CSS classes */
  className?: string
}

export function QRScanner({
  onScan,
  onError,
  onClose,
  width = 300,
  height = 300,
  fps = 10,
  showCloseButton = true,
  title = 'Escanear QR',
  description = 'Apunta la camara al codigo QR',
  className = ''
}: QRScannerProps) {
  // Refs for DOM and scanner management
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerDivRef = useRef<HTMLDivElement | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerIdRef = useRef<string>(`qr-scanner-${Math.random().toString(36).substr(2, 9)}`)
  const isMountedRef = useRef(true)

  // State
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)

  // Create scanner div manually (outside React's control)
  useLayoutEffect(() => {
    if (!containerRef.current) return

    // Create a div for the scanner that React won't manage
    const scannerDiv = document.createElement('div')
    scannerDiv.id = scannerIdRef.current
    scannerDiv.style.width = '100%'
    scannerDiv.style.height = '100%'
    containerRef.current.appendChild(scannerDiv)
    scannerDivRef.current = scannerDiv

    return () => {
      // Clean up the div we created
      if (scannerDivRef.current && scannerDivRef.current.parentNode) {
        try {
          scannerDivRef.current.parentNode.removeChild(scannerDivRef.current)
        } catch {
          // Ignore if already removed
        }
      }
      scannerDivRef.current = null
    }
  }, [])

  // Cleanup scanner - synchronous version for unmount
  const cleanupScannerSync = useCallback(() => {
    const scanner = scannerRef.current
    if (!scanner) return

    scannerRef.current = null

    try {
      const state = scanner.getState()
      if (state === Html5QrcodeScannerState.SCANNING) {
        // Fire and forget - we're unmounting
        scanner.stop().catch(() => {})
      }
    } catch {
      // Ignore errors during cleanup
    }

    // Clear scanner DOM - don't wait for stop
    try {
      scanner.clear()
    } catch {
      // Ignore if already cleared
    }
  }, [])

  // Cleanup scanner - async version for user actions
  const cleanupScannerAsync = useCallback(async () => {
    const scanner = scannerRef.current
    if (!scanner) return

    scannerRef.current = null

    try {
      const state = scanner.getState()
      if (state === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop()
      }
    } catch {
      // Ignore errors during cleanup
    }

    // Small delay for browser to release resources
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      scanner.clear()
    } catch {
      // Ignore if already cleared
    }
  }, [])

  // Initialize cameras on mount
  useEffect(() => {
    isMountedRef.current = true

    const initCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras()
        if (!isMountedRef.current) return

        if (devices && devices.length > 0) {
          setCameras(devices.map(d => ({ id: d.id, label: d.label })))
        } else {
          setError('No se encontraron camaras disponibles')
        }
      } catch (err) {
        if (!isMountedRef.current) return
        console.error('Error getting cameras:', err)
        setError('Error al acceder a la camara. Verifica los permisos.')
        onError?.('Camera access error')
      }
    }

    initCameras()

    return () => {
      isMountedRef.current = false
    }
  }, [onError])

  // Cleanup on unmount - use useLayoutEffect for synchronous cleanup
  useLayoutEffect(() => {
    return () => {
      cleanupScannerSync()
    }
  }, [cleanupScannerSync])

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!cameras.length) {
      setError('No hay camaras disponibles')
      return
    }

    if (!isMountedRef.current || !scannerDivRef.current) return

    try {
      setError(null)
      setLastScannedCode(null)

      // Clean up any existing scanner first
      await cleanupScannerAsync()

      if (!isMountedRef.current) return

      // Recreate scanner div if needed
      if (!document.getElementById(scannerIdRef.current)) {
        if (containerRef.current) {
          const scannerDiv = document.createElement('div')
          scannerDiv.id = scannerIdRef.current
          scannerDiv.style.width = '100%'
          scannerDiv.style.height = '100%'
          containerRef.current.appendChild(scannerDiv)
          scannerDivRef.current = scannerDiv
        }
      }

      // Create new scanner instance
      scannerRef.current = new Html5Qrcode(scannerIdRef.current)
      const scanner = scannerRef.current

      // Start scanning
      await scanner.start(
        cameras[currentCameraIndex].id,
        {
          fps,
          qrbox: { width: Math.min(width - 50, 250), height: Math.min(height - 50, 250) },
          aspectRatio: 1
        },
        (decodedText) => {
          if (isMountedRef.current && decodedText !== lastScannedCode) {
            setLastScannedCode(decodedText)
            onScan(decodedText)
          }
        },
        () => {
          // Ignore QR scanning errors (no QR found, etc)
        }
      )

      if (isMountedRef.current) {
        setIsScanning(true)
      }
    } catch (err) {
      console.error('Error starting scanner:', err)
      if (isMountedRef.current) {
        setError('Error al iniciar el escaner')
        onError?.('Scanner start error')
      }
    }
  }, [cameras, currentCameraIndex, fps, width, height, lastScannedCode, onScan, onError, cleanupScannerAsync])

  // Stop scanning
  const stopScanning = useCallback(async () => {
    await cleanupScannerAsync()
    if (isMountedRef.current) {
      setIsScanning(false)
    }
  }, [cleanupScannerAsync])

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1) return

    const newIndex = (currentCameraIndex + 1) % cameras.length
    setCurrentCameraIndex(newIndex)

    if (isScanning) {
      await stopScanning()
      setTimeout(() => {
        startScanning()
      }, 150)
    }
  }, [cameras.length, currentCameraIndex, isScanning, stopScanning, startScanning])

  // Handle close
  const handleClose = useCallback(() => {
    stopScanning()
    onClose?.()
  }, [stopScanning, onClose])

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Description */}
          {description && !isScanning && (
            <p className="text-sm text-gray-600 mb-4 text-center">
              {description}
            </p>
          )}

          {/* Error */}
          {error && (
            <Alert variant="error" className="mb-4 w-full">
              {error}
            </Alert>
          )}

          {/* Scanner Container - React only manages this outer div */}
          <div
            ref={containerRef}
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ width, height }}
          >
            {/* Placeholder shown when not scanning - positioned absolutely so it doesn't interfere */}
            {!isScanning && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10"
                style={{ pointerEvents: 'none' }}
              >
                <Camera className="h-16 w-16 text-gray-600" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 mt-4">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                disabled={cameras.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Iniciar Camara
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={stopScanning}
                >
                  <CameraOff className="h-4 w-4 mr-2" />
                  Detener
                </Button>

                {cameras.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={switchCamera}
                    title="Cambiar camara"
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Last scanned code */}
          {lastScannedCode && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg w-full">
              <p className="text-xs text-emerald-600 font-medium">Ultimo codigo escaneado:</p>
              <p className="text-sm font-mono text-emerald-800 break-all">
                {lastScannedCode}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default QRScanner
