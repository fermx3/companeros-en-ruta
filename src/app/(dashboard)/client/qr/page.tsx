'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay'
import {
  QrCode,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  History
} from 'lucide-react'

interface QRCode {
  id: string
  code: string
  qr_type: string
  status: 'active' | 'fully_redeemed' | 'expired' | 'cancelled'
  max_redemptions: number
  redemption_count: number
  discount_type: string | null
  discount_value: number | null
  discount_description: string | null
  valid_from: string
  valid_until: string | null
  created_at: string
  promotion: { id: string; name: string } | null
  brand: { id: string; name: string; logo_url: string | null } | null
}

interface ClientMembership {
  id: string
  brand_id: string
  brand_name: string
  brand_logo_url: string | null
  membership_status: string
}

function getStatusConfig(status: string) {
  const configs = {
    active: {
      label: 'Activo',
      className: 'bg-green-100 text-green-800',
      icon: CheckCircle2,
      iconColor: 'text-green-600'
    },
    fully_redeemed: {
      label: 'Canjeado',
      className: 'bg-blue-100 text-blue-800',
      icon: CheckCircle2,
      iconColor: 'text-blue-600'
    },
    expired: {
      label: 'Expirado',
      className: 'bg-gray-100 text-gray-800',
      icon: Clock,
      iconColor: 'text-gray-600'
    },
    cancelled: {
      label: 'Cancelado',
      className: 'bg-red-100 text-red-800',
      icon: XCircle,
      iconColor: 'text-red-600'
    }
  }
  return configs[status as keyof typeof configs] || configs.active
}

function formatDate(dateString: string | null) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatDiscount(type: string | null, value: number | null, description: string | null) {
  if (description) return description
  if (!type || !value) return 'QR de identificación'

  switch (type) {
    case 'percentage':
      return `${value}% de descuento`
    case 'fixed_amount':
      return `$${value.toFixed(2)} de descuento`
    case 'points':
      return `${value} puntos`
    case 'free_product':
      return 'Producto gratis'
    default:
      return `Descuento: ${value}`
  }
}

export default function ClientQRPage() {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [qrCodes, setQRCodes] = useState<QRCode[]>([])
  const [memberships, setMemberships] = useState<ClientMembership[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [qrResponse, membershipsResponse] = await Promise.all([
        fetch('/api/qr/generate'),
        fetch('/api/client/memberships')
      ])

      if (!qrResponse.ok) {
        const errorData = await qrResponse.json()
        throw new Error(errorData.error || 'Error al cargar códigos QR')
      }

      const qrData = await qrResponse.json()
      setQRCodes(qrData.qr_codes || [])

      if (membershipsResponse.ok) {
        const membershipsData = await membershipsResponse.json()
        const activeMemberships = (membershipsData.memberships || [])
          .filter((m: ClientMembership) => m.membership_status === 'active')
        setMemberships(activeMemberships)

        // Auto-select first brand if only one
        if (activeMemberships.length === 1) {
          setSelectedBrandId(activeMemberships[0].brand_id)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const generateQR = async () => {
    try {
      setGenerating(true)
      setError(null)
      setSuccess(null)

      // Get client ID from profile
      const profileResponse = await fetch('/api/client/profile')
      if (!profileResponse.ok) {
        throw new Error('No se pudo obtener el perfil del cliente')
      }
      const profileData = await profileResponse.json()

      // Generate QR
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: profileData.id,
          brand_id: selectedBrandId,
          qr_type: 'promotion',
          max_redemptions: 1,
          // Default 30 day validity
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al generar código QR')
      }

      setSuccess('Código QR generado exitosamente')
      // Reload QR codes
      await loadData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  // Get active QR code (most recent active one)
  const activeQR = qrCodes.find(qr => qr.status === 'active')
  // Get history (non-active QRs)
  const historyQRs = qrCodes.filter(qr => qr.status !== 'active')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link href="/client" className="text-gray-400 hover:text-gray-500">
                    Mi Portal
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-gray-900 font-medium">Mi Código QR</span>
                  </div>
                </li>
              </ol>
            </nav>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Código QR</h1>
                <p className="text-gray-600">
                  Genera y administra tus códigos QR para promociones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Active QR Section */}
        {activeQR ? (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tu código QR activo</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Display */}
              <QRCodeDisplay
                value={activeQR.code}
                size={220}
                title="Muestra este código al asesor"
                description="El asesor de ventas escaneará este código para aplicar tu promoción"
                info={[
                  {
                    label: 'Código',
                    value: activeQR.code
                  },
                  {
                    label: 'Descuento',
                    value: formatDiscount(activeQR.discount_type, activeQR.discount_value, activeQR.discount_description)
                  },
                  {
                    label: 'Válido hasta',
                    value: formatDate(activeQR.valid_until) || 'Sin fecha límite'
                  },
                  {
                    label: 'Usos',
                    value: `${activeQR.redemption_count}/${activeQR.max_redemptions}`
                  }
                ]}
                showDownload={true}
                showCopy={true}
              />

              {/* QR Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información del QR</CardTitle>
                  <CardDescription>
                    Detalles y estado de tu código
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Estado</span>
                    </div>
                    <span className="px-2 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                      Activo
                    </span>
                  </div>

                  {/* Brand */}
                  {activeQR.brand && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Marca</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {activeQR.brand.logo_url && (
                          <img
                            src={activeQR.brand.logo_url}
                            alt={activeQR.brand.name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        )}
                        <span className="text-gray-700">{activeQR.brand.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Created */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Creado</span>
                    </div>
                    <span className="text-gray-700">
                      {formatDate(activeQR.created_at)}
                    </span>
                  </div>

                  {/* Tip */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Consejo</p>
                        <p className="mt-1">
                          Descarga tu código QR para tenerlo siempre disponible, incluso sin conexión a internet.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* No Active QR - Generate Section */
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes un código QR activo
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Genera un código QR para que el asesor de ventas pueda aplicar promociones y descuentos en tu próxima compra.
              </p>

              {memberships.length > 0 ? (
                <div className="space-y-4">
                  {/* Brand Selection */}
                  {memberships.length > 1 && (
                    <div className="max-w-sm mx-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Selecciona una marca
                      </label>
                      <select
                        value={selectedBrandId || ''}
                        onChange={(e) => setSelectedBrandId(e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Selecciona una marca...</option>
                        {memberships.map((m) => (
                          <option key={m.brand_id} value={m.brand_id}>
                            {m.brand_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    onClick={generateQR}
                    disabled={generating || (memberships.length > 1 && !selectedBrandId)}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Generar Código QR
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg inline-block">
                    <p className="text-sm text-yellow-800">
                      No tienes membresías activas. Únete a una marca para generar códigos QR.
                    </p>
                  </div>
                  <div>
                    <Link href="/client/brands">
                      <Button variant="outline">
                        Ver Marcas Disponibles
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Generate New QR Button (when already has active) */}
        {activeQR && memberships.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Generar nuevo código</h3>
                  <p className="text-sm text-gray-600">
                    Puedes generar un nuevo código QR si lo necesitas
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {memberships.length > 1 && (
                    <select
                      value={selectedBrandId || ''}
                      onChange={(e) => setSelectedBrandId(e.target.value || null)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Selecciona marca...</option>
                      {memberships.map((m) => (
                        <option key={m.brand_id} value={m.brand_id}>
                          {m.brand_name}
                        </option>
                      ))}
                    </select>
                  )}
                  <Button
                    onClick={generateQR}
                    disabled={generating || (memberships.length > 1 && !selectedBrandId)}
                    variant="outline"
                  >
                    {generating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo QR
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        {historyQRs.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <History className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Historial de códigos</h2>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {historyQRs.map((qr) => {
                    const statusConfig = getStatusConfig(qr.status)
                    const StatusIcon = statusConfig.icon

                    return (
                      <div key={qr.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center`}>
                              <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm font-medium text-gray-900">
                                  {qr.code}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.className}`}>
                                  {statusConfig.label}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                {qr.brand && (
                                  <span className="flex items-center">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    {qr.brand.name}
                                  </span>
                                )}
                                <span>
                                  Creado: {formatDate(qr.created_at)}
                                </span>
                                <span>
                                  Usos: {qr.redemption_count}/{qr.max_redemptions}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-700">
                              {formatDiscount(qr.discount_type, qr.discount_value, qr.discount_description)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty History */}
        {qrCodes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sin historial</h3>
              <p className="mt-2 text-gray-500">
                Aún no has generado ningún código QR. Genera tu primer código para empezar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
