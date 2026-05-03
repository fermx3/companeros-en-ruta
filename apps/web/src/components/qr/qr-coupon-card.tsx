/**
 * QR Coupon Card Component
 *
 * Specialized card for displaying QR coupons with brand info,
 * status badge, QR code, and action buttons.
 *
 * Mobile-first design following screenshot reference.
 * 
 * **Use this component for**: Client-facing QR displays with brand context,
 * status tracking, promotion info, and redemption progress.
 * 
 * **Create new component if**: You need a simple QR display without brand/status
 * information, or significantly different layout requirements.
 */

'use client'

import React, { useRef, useCallback, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/ui/status-badge'
import { ActionButton } from '@/components/ui/action-button'
import { cn } from '@/lib/utils'

export interface QRCouponCardProps {
  /** QR code value to encode */
  code: string
  /** Brand name */
  brandName: string
  /** Brand logo URL */
  brandLogoUrl?: string | null
  /** QR status */
  status: 'active' | 'fully_redeemed' | 'expired' | 'cancelled'
  /** Creation date */
  createdAt: string
  /** Description text (discount info) */
  description?: string | null
  /** Valid until date */
  validUntil?: string | null
  /** Maximum number of redemptions */
  maxRedemptions?: number
  /** Current redemption count */
  redemptionCount?: number
  /** Promotion name */
  promotionName?: string | null
  /** QR code size in pixels */
  size?: number
  /** Additional CSS classes */
  className?: string
}

export function QRCouponCard({
  code,
  brandName,
  brandLogoUrl,
  status,
  createdAt,
  description,
  validUntil,
  maxRedemptions,
  redemptionCount,
  promotionName,
  size = 200,
  className,
}: QRCouponCardProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  // Format date as "CREADO EL: DD/MM/YYYY"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `CREADO EL: ${date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })}`
  }

  // Format validity date
  const formatValidUntil = (dateString: string | null | undefined) => {
    if (!dateString) return 'Sin fecha límite'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Download QR code as PNG
  const handleDownload = useCallback(() => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (2x for better quality)
    const scale = 2
    canvas.width = size * scale
    canvas.height = size * scale

    // Draw cyan/teal background
    ctx.fillStyle = '#CCFBF1' // bg-cyan-100
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
      downloadLink.download = `cupon-${code.slice(0, 10)}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
    img.src = url
  }, [code, size])

  // Copy QR code value to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [code])

  // Determine badge color based on status
  const getBadgeClassName = () => {
    if (status === 'active') {
      return 'bg-orange-100 text-orange-700 border-orange-200'
    }
    // For other statuses, use default StatusBadge colors
    return ''
  }

  return (
    <Card className={cn('overflow-hidden shadow-lg', className)}>
      <CardContent className="p-0">
        {/* Decorative header with subtle gradient */}
        <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 px-6 py-4 border-b-2 border-dashed border-blue-200">
          {/* Header: Avatar + Status Badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={brandLogoUrl}
                alt={brandName}
                size="md"
              />
              <div>
                <h3 className="font-semibold text-base text-gray-900">{brandName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-600">
                    {formatDate(createdAt)}
                  </p>
                  {/* Type Badge */}
                  {promotionName ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200">
                      🎁 Con Promoción
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      👤 QR Cliente
                    </span>
                  )}
                </div>
              </div>
            </div>
            <StatusBadge
              status={status === 'active' ? 'active' : status === 'expired' ? 'expired' : 'cancelled'}
              size="sm"
              className={status === 'active' ? getBadgeClassName() : ''}
            />
          </div>

          {/* Decorative circles on the edges (coupon style) */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-blue-200"></div>
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-blue-200"></div>
        </div>

        <div className="p-6">
          {/* QR Code with subtle blue ring instead of solid background */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {/* Decorative corner accents */}
              <div className="absolute -top-2 -left-2 w-5 h-5 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
              <div className="absolute -top-2 -right-2 w-5 h-5 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>

              {/* QR Code container with subtle blue glow */}
              <div
                ref={qrRef}
                className="p-6 bg-white rounded-2xl shadow-xl ring-4 ring-blue-100 ring-offset-4 ring-offset-white"
              >
                <QRCodeSVG
                  value={code}
                  size={size}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Code in large text with gradient background */}
            <div className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-xl border-2 border-blue-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium text-center mb-1">CÓDIGO</p>
              <p className="text-2xl font-bold text-primary text-center tracking-wider">
                {code}
              </p>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700 text-center font-medium">
                {description}
              </p>
            </div>
          )}

          {/* Info Section with enhanced design */}
          <div className="space-y-3 mb-6">
            {/* Promotion Name */}
            {promotionName && (
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Promoción
                </span>
                <span className="text-sm font-bold text-gray-900">{promotionName}</span>
              </div>
            )}

            {/* Valid Until */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Válido hasta
              </span>
              <span className="text-sm font-bold text-gray-900">{formatValidUntil(validUntil)}</span>
            </div>

            {/* Redemptions */}
            {maxRedemptions !== undefined && redemptionCount !== undefined && (
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Usos
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {redemptionCount}/{maxRedemptions}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${maxRedemptions > 0 ? (redemptionCount / maxRedemptions) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {Math.max(0, maxRedemptions - redemptionCount)} usos disponibles
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons with enhanced styling */}
          <div className="flex gap-3">
            <ActionButton
              variant="ghost"
              size="md"
              fullWidth
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
              className="border border-blue-200 hover:bg-blue-50 hover:border-blue-400"
            >
              Descargar
            </ActionButton>
            <ActionButton
              variant="ghost"
              size="md"
              fullWidth
              icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              onClick={handleCopy}
              className="border border-blue-200 hover:bg-blue-50 hover:border-blue-400"
            >
              {copied ? 'Copiado' : 'Copiar'}
            </ActionButton>
          </div>
        </div>

        {/* Decorative footer gradient */}
        <div className="h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"></div>
      </CardContent>
    </Card>
  )
}
