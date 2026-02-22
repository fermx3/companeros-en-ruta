'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Alert, LoadingSpinner } from '@/components/ui/feedback'
import { QRScanner } from '@/components/qr'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  QrCode,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Gift,
  Building2,
  Tag,
  RefreshCw,
  MapPin
} from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'

interface QRValidationResult {
  valid: boolean
  message: string
  qr_code: {
    id: string
    code: string
    type: string
    status: string
    discount: {
      type: string | null
      value: number | null
      description: string | null
    }
    redemptions: {
      used: number
      max: number
      remaining: number
    }
    validity: {
      from: string
      until: string | null
    }
    client: {
      id: string
      public_id: string
      business_name: string
      owner_name: string | null
    } | null
    promotion: {
      id: string
      public_id: string
      name: string
      description: string | null
    } | null
    brand: {
      id: string
      name: string
      logo_url: string | null
    } | null
  } | null
}

interface RedemptionResult {
  success: boolean
  message: string
  redemption_id: string | null
  qr_data: {
    qr_id: string
    client_id: string
    promotion_id: string | null
    discount_type: string | null
    discount_value: number | null
    discount_description: string | null
    redemptions_remaining: number
  } | null
}

type Step = 'scan' | 'preview' | 'result'

export default function EntregarPromocionPage() {
  usePageTitle('Entregar Promoción')
  const [step, setStep] = useState<Step>('scan')
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [validation, setValidation] = useState<QRValidationResult | null>(null)
  const [redemptionResult, setRedemptionResult] = useState<RedemptionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { location: geoLocation } = useGeolocation({ autoFetch: true })

  // Handle QR scan
  const handleScan = useCallback(async (code: string) => {
    setScannedCode(code)
    setError(null)
    setLoading(true)

    try {
      // Validate QR code
      const response = await fetch(`/api/qr/redeem?code=${encodeURIComponent(code)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al validar el codigo QR')
        setStep('scan')
        return
      }

      setValidation(data)
      setStep('preview')
    } catch (err) {
      console.error('Error validating QR:', err)
      setError('Error de conexion. Por favor, intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle redemption
  const handleRedeem = useCallback(async () => {
    if (!scannedCode) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/qr/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code: scannedCode,
          latitude: geoLocation?.latitude,
          longitude: geoLocation?.longitude
        })
      })

      const data = await response.json()

      setRedemptionResult(data)
      setStep('result')

      if (!data.success) {
        setError(data.error || data.message)
      }
    } catch (err) {
      console.error('Error redeeming QR:', err)
      setError('Error de conexion. Por favor, intente de nuevo.')
      setStep('result')
    } finally {
      setLoading(false)
    }
  }, [scannedCode, geoLocation])

  // Reset to scan again
  const handleReset = useCallback(() => {
    setStep('scan')
    setScannedCode(null)
    setValidation(null)
    setRedemptionResult(null)
    setError(null)
  }, [])

  // Format discount
  const formatDiscount = (type: string | null, value: number | null): string => {
    if (!type || value === null) return 'Sin descuento'
    switch (type) {
      case 'percentage':
        return `${value}% de descuento`
      case 'fixed_amount':
        return `$${value.toFixed(2)} de descuento`
      case 'free_product':
        return 'Producto gratis'
      case 'points':
        return `${value} puntos`
      default:
        return `Descuento: ${value}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/asesor-ventas" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Entregar Promocion</li>
              </ol>
            </nav>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QrCode className="h-6 w-6 text-emerald-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Entregar Promocion</h1>
                  <p className="text-gray-600">Escanea el QR del cliente para entregar su promocion</p>
                </div>
              </div>
              <Link href="/asesor-ventas">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && step !== 'result' && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step 1: Scan QR */}
        {step === 'scan' && (
          <QRScanner
            onScan={handleScan}
            onError={(err) => setError(err)}
            title="Escanear Codigo QR"
            description="Apunta la camara al codigo QR del cliente para validar su promocion"
            showCloseButton={false}
          />
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">
                {step === 'preview' ? 'Canjeando promocion...' : 'Validando codigo QR...'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && validation && !loading && (
          <Card>
            <CardContent className="p-6">
              {/* Validation Status */}
              <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
                validation.valid
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {validation.valid ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${validation.valid ? 'text-emerald-800' : 'text-red-800'}`}>
                    {validation.message}
                  </p>
                  {validation.qr_code && (
                    <p className="text-sm text-gray-600 font-mono">
                      {validation.qr_code.code}
                    </p>
                  )}
                </div>
              </div>

              {validation.qr_code && (
                <>
                  {/* Client Info */}
                  {validation.qr_code.client && (
                    <div className="flex items-start gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {validation.qr_code.client.business_name}
                        </p>
                        {validation.qr_code.client.owner_name && (
                          <p className="text-sm text-gray-600">
                            {validation.qr_code.client.owner_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 font-mono">
                          {validation.qr_code.client.public_id}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Promotion Info */}
                  <div className="space-y-4 mb-6">
                    {validation.qr_code.promotion && (
                      <div className="flex items-start gap-3">
                        <Gift className="h-5 w-5 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {validation.qr_code.promotion.name}
                          </p>
                          {validation.qr_code.promotion.description && (
                            <p className="text-sm text-gray-600">
                              {validation.qr_code.promotion.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDiscount(
                            validation.qr_code.discount.type,
                            validation.qr_code.discount.value
                          )}
                        </p>
                        {validation.qr_code.discount.description && (
                          <p className="text-sm text-gray-600">
                            {validation.qr_code.discount.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Redemption Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Canjes usados</p>
                      <p className="text-lg font-semibold">
                        {validation.qr_code.redemptions.used} / {validation.qr_code.redemptions.max}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Canjes restantes</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        {validation.qr_code.redemptions.remaining}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {geoLocation && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                      <MapPin className="h-4 w-4" />
                      <span>Ubicacion registrada</span>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRedeem}
                  disabled={!validation.valid || loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Canjear Promocion
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Result */}
        {step === 'result' && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              {redemptionResult?.success ? (
                <>
                  <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Promocion Canjeada
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {redemptionResult.message}
                  </p>

                  {redemptionResult.qr_data && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Descuento</p>
                          <p className="font-medium">
                            {formatDiscount(
                              redemptionResult.qr_data.discount_type,
                              redemptionResult.qr_data.discount_value
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Canjes restantes</p>
                          <p className="font-medium">
                            {redemptionResult.qr_data.redemptions_remaining}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Error al Canjear
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {error || redemptionResult?.message || 'Ocurrio un error inesperado'}
                  </p>
                </>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Escanear Otro
                </Button>
                <Link href="/asesor-ventas/historial-qr">
                  <Button variant="outline">
                    Ver Historial
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
