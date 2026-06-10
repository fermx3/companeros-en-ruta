'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { QRCouponCard } from '@/components/qr/qr-coupon-card'
import { BrandCarousel } from '@/components/qr/brand-carousel'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  QrCode,
  ChevronLeft,
  Sparkles,
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
  if (!type || !value) return 'QR de cliente'

  switch (type) {
    case 'percentage':
      return `${value}% de descuento`
    case 'fixed_amount':
      return `$${value} de descuento`
    case 'points':
      return `${value} puntos`
    default:
      return 'QR de cliente'
  }
}

export default function ClientQRPage() {
  usePageTitle('Mis Cupones QR')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        fetch('/api/client/memberships'),
      ])

      if (!qrResponse.ok) {
        const errorData = await qrResponse.json()
        throw new Error(errorData.error || 'Error al cargar códigos QR')
      }

      const qrData = await qrResponse.json()
      setQRCodes(qrData.qr_codes || [])

      if (membershipsResponse.ok) {
        const membershipsData = await membershipsResponse.json()
        const activeMemberships = (membershipsData.memberships || []).filter(
          (m: ClientMembership) => m.membership_status === 'active'
        )
        setMemberships(activeMemberships)
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

  // Active QRs ordered by closest expiry first; history by most recent.
  const activeQRs = useMemo(() => {
    const list = qrCodes.filter(qr => qr.status === 'active')
    return list.slice().sort((a, b) => {
      const av = a.valid_until ? new Date(a.valid_until).getTime() : Number.POSITIVE_INFINITY
      const bv = b.valid_until ? new Date(b.valid_until).getTime() : Number.POSITIVE_INFINITY
      return av - bv
    })
  }, [qrCodes])
  const historyQRs = useMemo(
    () =>
      qrCodes
        .filter(qr => qr.status !== 'active')
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [qrCodes]
  )

  const filteredActiveQRs = selectedBrandId
    ? activeQRs.filter(qr => qr.brand?.id === selectedBrandId)
    : activeQRs

  const filteredHistoryQRs = selectedBrandId
    ? historyQRs.filter(qr => qr.brand?.id === selectedBrandId)
    : historyQRs

  const brands = memberships.map(m => ({
    id: m.brand_id,
    name: m.brand_name,
    logo_url: m.brand_logo_url,
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10">
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
                    Genera tus cupones desde el detalle de cada promoción
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Pointer to promotions — cupones se generan desde ahí, no aquí. */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-navy">¿Quieres un cupón nuevo?</p>
              <p className="text-xs text-muted-foreground">
                Abre una promoción desde Inicio y toca <span className="font-semibold">Obtener mi cupón</span>.
              </p>
            </div>
            <Link href="/client">
              <Button variant="default" size="sm">
                Ver promociones
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'activos' | 'usados')}>
          <TabsList>
            <TabsTrigger value="activos">
              Activos {filteredActiveQRs.length > 0 && <span className="ml-1">({filteredActiveQRs.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="usados">
              Usados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activos">
            {filteredActiveQRs.length === 0 ? (
              <Card className="mt-6">
                <CardContent className="py-12 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes cupones activos</h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedBrandId
                      ? 'No hay cupones activos para esta marca'
                      : 'Genera tu primer cupón desde el detalle de una promoción'}
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
