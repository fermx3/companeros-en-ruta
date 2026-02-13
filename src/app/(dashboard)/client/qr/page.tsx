'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { QRCouponCard } from '@/components/qr/qr-coupon-card'
import { BrandCarousel } from '@/components/qr/brand-carousel'
import {
  QrCode,
  Plus,
  ChevronLeft,
  Building2
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

function formatDiscount(type: string | null, value: number | null, description: string | null) {
  if (description) return description
  if (!type || !value) return 'Cupón de descuento'

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
  const [activeTab, setActiveTab] = useState<'activos' | 'usados'>('activos')

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

  // Get all active QR codes (support multiple)
  const activeQRs = qrCodes.filter(qr => qr.status === 'active')
  // Get history (non-active QRs)
  const historyQRs = qrCodes.filter(qr => qr.status !== 'active')

  // Filter by selected brand
  const filteredActiveQRs = selectedBrandId
    ? activeQRs.filter(qr => qr.brand?.id === selectedBrandId)
    : activeQRs

  const filteredHistoryQRs = selectedBrandId
    ? historyQRs.filter(qr => qr.brand?.id === selectedBrandId)
    : historyQRs

  // Get brands from memberships for carousel
  const brands = memberships.map(m => ({
    id: m.brand_id,
    name: m.brand_name,
    logo_url: m.brand_logo_url
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center gap-3">
              <Link href="/client">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Mis Cupones QR</h1>
                  <p className="text-sm text-muted-foreground">
                    Administra tus cupones de descuento
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Generate New QR Button */}
        {memberships.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Generar nuevo cupón</h3>
                  <p className="text-sm text-muted-foreground">
                    Crea un código QR para obtener descuentos
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {memberships.length > 1 && (
                    <select
                      value={selectedBrandId || ''}
                      onChange={(e) => setSelectedBrandId(e.target.value || null)}
                      className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
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
                    size="default"
                  >
                    {generating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Generar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'activos' | 'usados')}>
          <TabsList>
            <TabsTrigger value="activos">
              Activos {filteredActiveQRs.length > 0 && <span className="ml-1">({filteredActiveQRs.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="usados">
              Usados
            </TabsTrigger>
          </TabsList>

          {/* Active QRs Tab */}
          <TabsContent value="activos">
            {filteredActiveQRs.length === 0 ? (
              <Card className="mt-6">
                <CardContent className="py-12 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes cupones activos</h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedBrandId
                      ? 'No hay cupones activos para esta marca'
                      : 'Tus cupones de descuento aparecerán aquí'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 mt-6">
                {filteredActiveQRs.map((qr) => (
                  <QRCouponCard
                    key={qr.id}
                    code={qr.code}
                    brandName={qr.brand?.name || 'Sin marca'}
                    brandLogoUrl={qr.brand?.logo_url}
                    status={qr.status}
                    createdAt={qr.created_at}
                    description={formatDiscount(qr.discount_type, qr.discount_value, qr.discount_description)}
                    validUntil={qr.valid_until}
                    maxRedemptions={qr.max_redemptions}
                    redemptionCount={qr.redemption_count}
                    promotionName={qr.promotion?.name}
                    size={180}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* History/Used QRs Tab */}
          <TabsContent value="usados">
            {filteredHistoryQRs.length === 0 ? (
              <Card className="mt-6">
                <CardContent className="py-12 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay cupones usados</h3>
                  <p className="text-muted-foreground">
                    {selectedBrandId
                      ? 'No hay cupones usados para esta marca'
                      : 'Tu historial de cupones aparecerá aquí'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 mt-6">
                {filteredHistoryQRs.map((qr) => (
                  <QRCouponCard
                    key={qr.id}
                    code={qr.code}
                    brandName={qr.brand?.name || 'Sin marca'}
                    brandLogoUrl={qr.brand?.logo_url}
                    status={qr.status}
                    createdAt={qr.created_at}
                    description={formatDiscount(qr.discount_type, qr.discount_value, qr.discount_description)}
                    validUntil={qr.valid_until}
                    maxRedemptions={qr.max_redemptions}
                    redemptionCount={qr.redemption_count}
                    promotionName={qr.promotion?.name}
                    size={180}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Brand Carousel */}
        {brands.length > 1 && (
          <div className="mt-8">
            <BrandCarousel
              brands={brands}
              selectedBrandId={selectedBrandId}
              onSelectBrand={setSelectedBrandId}
            />
          </div>
        )}
      </div>
    </div>
  )
}
