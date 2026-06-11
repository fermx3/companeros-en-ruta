'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, Tag, AlertCircle, TrendingUp, Wallet, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useBrandFetch } from '@/hooks/useBrandFetch'

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
  promotion_type_label?: string
  status: string
  status_label?: string
  start_date: string
  end_date: string
  discount_percentage: number | null
  discount_amount: number | null
  points_multiplier: number | null
  buy_quantity: number | null
  get_quantity: number | null
  min_purchase_amount: number | null
  usage_limit_per_client: number | null
  usage_limit_total: number | null
  usage_count_total: number | null
  budget_allocated: number | null
  budget_spent: number | null
  terms_and_conditions: string | null
  brand: PromotionBrand
}

function getDiscountLabel(p: Promotion): string {
  if (p.discount_percentage && p.discount_percentage > 0) return `${p.discount_percentage}% OFF`
  if (p.discount_amount && p.discount_amount > 0) return `$${p.discount_amount} OFF`
  if (p.points_multiplier && p.points_multiplier > 1) return `${p.points_multiplier}x puntos`
  if (p.buy_quantity && p.get_quantity) return `${p.buy_quantity}x${p.get_quantity}`
  return p.promotion_type_label ?? 'Promoción'
}

const STATUS_TONE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function BrandPromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  usePageTitle('Detalle de promoción')

  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { brandFetch, currentBrandId } = useBrandFetch()

  const loadPromo = useCallback(async () => {
    // brandFetch injects ?brand_id=<current>. The /api/brand/promotions/[id]
    // route requires that to scope by brand_manager assignment; without it
    // resolveBrandAuth fails / returns 404. Wait until currentBrandId is set
    // (it's hydrated from the auth context one tick after mount).
    if (!currentBrandId) return
    try {
      setLoading(true)
      setError(null)
      const res = await brandFetch(`/api/brand/promotions/${id}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al cargar la promoción')
      }
      const data = await res.json()
      setPromotion(data.promotion ?? data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [id, brandFetch, currentBrandId])

  useEffect(() => {
    loadPromo()
  }, [loadPromo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const tone = promotion ? STATUS_TONE[promotion.status] ?? 'bg-gray-100 text-gray-700' : ''

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/brand/promotions">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Detalle de promoción</h1>
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
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Promoción no disponible</h3>
              <p className="text-muted-foreground">No encontramos esta promoción o ya no está accesible.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{promotion.brand?.name}</p>
                    <h2 className="text-lg font-bold text-navy">{promotion.name}</h2>
                  </div>
                  <span className={`text-xs font-semibold rounded-full px-3 py-1 whitespace-nowrap ${tone}`}>
                    {promotion.status_label ?? promotion.status}
                  </span>
                </div>

                <p className="text-2xl font-black text-success">{getDiscountLabel(promotion)}</p>

                {promotion.description && (
                  <p className="text-sm text-navy">{promotion.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Vigencia</p>
                    <p className="text-sm text-navy">
                      {format(new Date(promotion.start_date), "dd MMM", { locale: es })} —{' '}
                      {format(new Date(promotion.end_date), "dd MMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Tipo</p>
                    <p className="text-sm text-navy">{promotion.promotion_type_label ?? promotion.promotion_type}</p>
                  </div>
                  {promotion.min_purchase_amount != null && promotion.min_purchase_amount > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Compra mínima</p>
                      <p className="text-sm text-navy">${Number(promotion.min_purchase_amount).toFixed(0)}</p>
                    </div>
                  )}
                  {promotion.usage_limit_per_client != null && (
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Límite x cliente</p>
                      <p className="text-sm text-navy">{promotion.usage_limit_per_client}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Canjes</p>
                    <p className="text-lg font-bold text-navy">
                      {promotion.usage_count_total ?? 0}
                      {promotion.usage_limit_total != null && (
                        <span className="text-xs text-muted-foreground"> / {promotion.usage_limit_total}</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Presupuesto</p>
                    <p className="text-lg font-bold text-navy">
                      ${Number(promotion.budget_spent ?? 0).toFixed(0)}
                      {promotion.budget_allocated != null && (
                        <span className="text-xs text-muted-foreground"> / ${Number(promotion.budget_allocated).toFixed(0)}</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Marca</p>
                    <p className="text-sm font-bold text-navy truncate">{promotion.brand?.name ?? '—'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {promotion.terms_and_conditions && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                    Términos
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{promotion.terms_and_conditions}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
