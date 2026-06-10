'use client'

import { use, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, Tag, Sparkles, QrCode } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { usePageTitle } from '@/hooks/usePageTitle'

interface PromotionBrand {
  id: string
  name: string
  logo_url: string | null
  brand_color_primary?: string | null
}

interface Promotion {
  id: string
  public_id: string
  name: string
  description: string | null
  promotion_type: string
  discount_percentage: number | null
  discount_amount: number | null
  points_multiplier: number | null
  buy_quantity: number | null
  get_quantity: number | null
  start_date: string
  end_date: string
  status: string
  terms_and_conditions: string | null
  requires_code?: boolean
  promo_code?: string | null
  brand: PromotionBrand
}

interface ClientMembership {
  id: string
  brand_id: string
  brand_name: string
  membership_status: string
}

interface QRCodeRow {
  id: string
  status: 'active' | 'fully_redeemed' | 'expired' | 'cancelled'
  promotion: { id: string; name: string } | null
}

function getDiscountLabel(p: Promotion): string | null {
  if (p.discount_percentage && p.discount_percentage > 0) return `${p.discount_percentage}% OFF`
  if (p.discount_amount && p.discount_amount > 0) return `$${p.discount_amount} OFF`
  if (p.points_multiplier && p.points_multiplier > 1) return `${p.points_multiplier}x puntos`
  if (p.buy_quantity && p.get_quantity) return `${p.buy_quantity}x${p.get_quantity}`
  return null
}

export default function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  usePageTitle('Promoción')
  const router = useRouter()

  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [memberships, setMemberships] = useState<ClientMembership[]>([])
  const [qrCodes, setQrCodes] = useState<QRCodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [promosRes, membershipsRes, qrRes] = await Promise.all([
        fetch('/api/client/promotions'),
        fetch('/api/client/memberships'),
        fetch('/api/qr/generate'),
      ])

      if (promosRes.ok) {
        const data = await promosRes.json()
        const match = (data.promotions || []).find((p: Promotion) => p.id === id)
        setPromotion(match ?? null)
      }
      if (membershipsRes.ok) {
        const data = await membershipsRes.json()
        const active = (data.memberships || []).filter(
          (m: ClientMembership) => m.membership_status === 'active'
        )
        setMemberships(active)
      }
      if (qrRes.ok) {
        const data = await qrRes.json()
        setQrCodes(data.qr_codes || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const hasMembership = !!promotion && memberships.some(m => m.brand_id === promotion.brand?.id)
  const existingActiveQR = useMemo(
    () =>
      promotion
        ? qrCodes.find(qr => qr.promotion?.id === promotion.id && qr.status === 'active') ?? null
        : null,
    [qrCodes, promotion]
  )

  async function onGenerate() {
    if (!promotion || !promotion.brand?.id) return
    try {
      setGenerating(true)
      setError(null)

      const profileRes = await fetch('/api/client/profile')
      if (!profileRes.ok) throw new Error('No se pudo obtener el perfil')
      const profile = await profileRes.json()

      const res = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: profile.id,
          brand_id: promotion.brand.id,
          promotion_id: promotion.id,
          qr_type: 'promotion',
          max_redemptions: 1,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al generar cupón')
      }

      router.push('/client/qr')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar cupón')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/client">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Promoción</h1>
          </div>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!promotion ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Promoción no disponible</h3>
              <p className="text-muted-foreground">
                Esta promoción ya no está disponible o no aplica para ti.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={promotion.brand?.logo_url}
                    alt={promotion.brand?.name || ''}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {promotion.brand?.name}
                    </p>
                    <h2 className="text-lg font-bold text-navy">{promotion.name}</h2>
                  </div>
                </div>

                {getDiscountLabel(promotion) && (
                  <p className="text-3xl font-black text-success mb-3">
                    {getDiscountLabel(promotion)}
                  </p>
                )}

                {promotion.description && (
                  <p className="text-sm text-navy">{promotion.description}</p>
                )}

                <p className="text-xs text-muted-foreground mt-4">
                  Vigente hasta {format(new Date(promotion.end_date), "dd 'de' MMM yyyy", { locale: es })}
                </p>

                {promotion.terms_and_conditions && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
                      Términos
                    </p>
                    <p className="text-xs text-muted-foreground">{promotion.terms_and_conditions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {!hasMembership ? (
              <>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-navy">
                      Para canjear esta promoción primero necesitas unirte a{' '}
                      <span className="font-bold">{promotion.brand?.name ?? 'la marca'}</span>.
                    </p>
                  </CardContent>
                </Card>
                <Link href="/client/brands" className="block">
                  <Button size="lg" className="w-full">
                    Unirme a la marca
                  </Button>
                </Link>
              </>
            ) : existingActiveQR ? (
              <>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-navy">
                      Ya tienes un cupón activo para esta promoción.
                    </p>
                  </CardContent>
                </Card>
                <Link href="/client/qr" className="block">
                  <Button size="lg" className="w-full">
                    <QrCode className="h-4 w-4 mr-2" />
                    Ver mi cupón
                  </Button>
                </Link>
              </>
            ) : (
              <Button size="lg" className="w-full" onClick={onGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Obtener mi cupón
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
