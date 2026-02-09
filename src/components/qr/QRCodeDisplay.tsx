'use client'

/**
 * QR Code Display Component
 * TASK-012: Display QR codes with download functionality
 */

import React, { useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Download, Copy, Check, RefreshCw } from 'lucide-react'

interface QRCodeDisplayProps {
  /** The value to encode in the QR code */
  value: string
  /** Size of the QR code in pixels */
  size?: number
  /** Title to display above the QR code */
  title?: string
  /** Description text */
  description?: string
  /** Additional info to display (e.g., expiration, discount) */
  info?: {
    label: string
    value: string
  }[]
  /** Whether to show download button */
  showDownload?: boolean
  /** Whether to show copy button */
  showCopy?: boolean
  /** Callback when QR is refreshed/regenerated */
  onRefresh?: () => void
  /** Whether refresh is in progress */
  isRefreshing?: boolean
  /** Background color */
  bgColor?: string
  /** Foreground color */
  fgColor?: string
  /** Logo to display in center (URL or base64) */
  logoUrl?: string
  /** Additional CSS classes */
  className?: string
}

export function QRCodeDisplay({
  value,
  size = 200,
  title,
  description,
  info,
  showDownload = true,
  showCopy = true,
  onRefresh,
  isRefreshing = false,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  logoUrl,
  className = ''
}: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false)

  // Download QR code as PNG
  const handleDownload = useCallback(() => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    // Create canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (2x for better quality)
    const scale = 2
    canvas.width = size * scale
    canvas.height = size * scale

    // Draw white background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)

      // Download
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `qr-${value.slice(0, 20)}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
    img.src = url
  }, [value, size, bgColor])

  // Copy QR code value to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [value])

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {/* Title */}
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 mb-4 text-center">
              {description}
            </p>
          )}

          {/* QR Code */}
          <div
            ref={qrRef}
            className="p-4 bg-white rounded-lg shadow-sm border"
            style={{ backgroundColor: bgColor }}
          >
            <QRCodeSVG
              value={value}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level="M"
              includeMargin={false}
              imageSettings={logoUrl ? {
                src: logoUrl,
                height: size * 0.2,
                width: size * 0.2,
                excavate: true
              } : undefined}
            />
          </div>

          {/* QR Code Value */}
          <p className="mt-3 text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded">
            {value}
          </p>

          {/* Info items */}
          {info && info.length > 0 && (
            <div className="mt-4 w-full space-y-2">
              {info.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-500">{item.label}:</span>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {showDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </Button>
            )}

            {showCopy && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            )}

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Regenerar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default QRCodeDisplay
