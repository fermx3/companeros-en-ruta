/**
 * QR Coupon Card Component
 *
 * Specialized card for displaying QR coupons with brand info,
 * status badge, QR code, and action buttons.
 *
 * Mobile-first design following screenshot reference.
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
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        {/* Header: Avatar + Status Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={brandLogoUrl}
              alt={brandName}
              size="md"
            />
            <div>
              <h3 className="font-semibold text-base">{brandName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>
          <StatusBadge
            status={status === 'active' ? 'active' : status === 'expired' ? 'expired' : 'cancelled'}
            size="sm"
            className={status === 'active' ? getBadgeClassName() : ''}
          />
        </div>

        {/* QR Code with cyan/teal background */}
        <div className="flex flex-col items-center mb-4">
          <div
            ref={qrRef}
            className="p-6 bg-cyan-100 rounded-2xl shadow-md"
          >
            <QRCodeSVG
              value={code}
              size={size}
              bgColor="transparent"
              fgColor="#000000"
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Code in large orange text */}
          <p className="mt-4 text-2xl font-bold text-primary">
            {code}
          </p>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground text-center mb-4">
            {description}
          </p>
        )}

        {/* Info Section */}
        <div className="space-y-2 mb-4">
          {/* Promotion Name */}
          {promotionName && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Promoción:</span>
              <span className="font-medium">{promotionName}</span>
            </div>
          )}

          {/* Valid Until */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Válido hasta:</span>
            <span className="font-medium">{formatValidUntil(validUntil)}</span>
          </div>

          {/* Redemptions */}
          {maxRedemptions !== undefined && redemptionCount !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Usos:</span>
              <span className="font-medium">
                {redemptionCount}/{maxRedemptions}
                {maxRedemptions > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({Math.max(0, maxRedemptions - redemptionCount)} disponibles)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <ActionButton
            variant="ghost"
            size="md"
            fullWidth
            icon={<Download className="h-4 w-4" />}
            onClick={handleDownload}
          >
            Descargar
          </ActionButton>
          <ActionButton
            variant="ghost"
            size="md"
            fullWidth
            icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            onClick={handleCopy}
          >
            {copied ? 'Copiado' : 'Copiar'}
          </ActionButton>
        </div>
      </CardContent>
    </Card>
  )
}
