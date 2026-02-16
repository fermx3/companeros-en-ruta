'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/ui/metric-card"
import { TierProgressCard } from "@/components/client/TierProgressCard"
import { LoyaltyPlansSection } from "@/components/client/LoyaltyPlansSection"
import { WeeklyPromotionsBanner } from "@/components/client/WeeklyPromotionsBanner"
import { Store, ShoppingCart, Star, MapPin, Building2, QrCode, ClipboardList } from "lucide-react"
import Link from 'next/link'

interface ClientProfile {
  id: string
  public_id: string
  business_name: string
  legal_name: string | null
  owner_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_postal_code: string | null
  status: string
  zone_name: string | null
  market_name: string | null
  client_type_name: string | null
  total_points: number
  total_orders: number
  last_order_date: string | null
  last_visit_date: string | null
  created_at: string
}

interface CurrentTier {
  id: string
  name: string
  tier_level: number
  points_multiplier: number
  discount_percentage: number
  tier_color: string | null
}

interface NextTier {
  name: string
  min_points_required: number
  points_needed: number
}

interface ClientMembership {
  id: string
  public_id: string
  brand_id: string
  brand_name: string
  brand_logo_url: string | null
  membership_status: string
  joined_date: string | null
  points_balance: number
  lifetime_points: number
  current_tier: CurrentTier | null
  next_tier: NextTier | null
}

interface PromotionBrand {
  id: string
  name: string
  logo_url: string | null
}

interface Promotion {
  id: string
  public_id: string
  name: string
  description: string | null
  promotion_type: string
  discount_percentage: number | null
  discount_amount: number | null
  start_date: string
  end_date: string
  status: string
  terms_and_conditions: string | null
  brand: PromotionBrand
}

export default function ClientPortal() {
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [memberships, setMemberships] = useState<ClientMembership[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [profileRes, membershipsRes, promotionsRes] = await Promise.all([
        fetch('/api/client/profile'),
        fetch('/api/client/memberships'),
        fetch('/api/client/promotions'),
      ])

      if (!profileRes.ok) {
        const errorData = await profileRes.json()
        throw new Error(errorData.error || 'Error al cargar perfil')
      }

      const profileData = await profileRes.json()
      setProfile(profileData)

      if (membershipsRes.ok) {
        const membershipsData = await membershipsRes.json()
        const active = (membershipsData.memberships || []).filter(
          (m: ClientMembership) => m.membership_status === 'active'
        )
        setMemberships(active)
      }

      if (promotionsRes.ok) {
        const promotionsData = await promotionsRes.json()
        setPromotions(promotionsData.promotions || [])
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-20 bg-gray-200 rounded-2xl" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-44 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error al cargar los datos</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadData} variant="outline" className="mt-4">
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const primaryMembership = memberships[0] || null

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. Welcome Header (compact) */}
        <div className="bg-gradient-to-r from-[#2196F3] to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                Hola, {profile?.business_name || 'Cliente'}
              </h1>
              <p className="text-blue-100 text-sm">
                {profile?.public_id} · {profile?.client_type_name || 'Cliente'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. TierProgressCard */}
        {primaryMembership && (
          <TierProgressCard membership={primaryMembership} />
        )}

        {/* 3. Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Puntos Acumulados"
            value={(profile?.total_points || 0).toLocaleString()}
            icon={<Star className="h-6 w-6" />}
          />
          <MetricCard
            title="Total de Pedidos"
            value={profile?.total_orders || 0}
            icon={<ShoppingCart className="h-6 w-6" />}
          />
          <MetricCard
            title="Zona"
            value={profile?.zone_name || 'Sin asignar'}
            icon={<MapPin className="h-6 w-6" />}
          />
        </div>

        {/* 4. WeeklyPromotionsBanner */}
        <WeeklyPromotionsBanner promotions={promotions} />

        {/* 5. LoyaltyPlansSection */}
        <LoyaltyPlansSection memberships={memberships} />

        {/* 6. Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rapidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/client/qr">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-2xl hover:bg-purple-50 border-purple-200 bg-purple-50/50"
              >
                <QrCode className="h-7 w-7 text-purple-600" />
                <span className="text-sm font-medium">Mi Codigo QR</span>
              </Button>
            </Link>

            <Link href="/client/orders">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-2xl hover:bg-blue-50"
              >
                <ShoppingCart className="h-7 w-7 text-[#2196F3]" />
                <span className="text-sm font-medium">Mis Pedidos</span>
              </Button>
            </Link>

            <Link href="/client/brands">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-2xl hover:bg-indigo-50"
              >
                <Building2 className="h-7 w-7 text-indigo-600" />
                <span className="text-sm font-medium">Mis Marcas</span>
              </Button>
            </Link>

            <Link href="/client/points">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-2xl hover:bg-yellow-50"
              >
                <Star className="h-7 w-7 text-yellow-600" />
                <span className="text-sm font-medium">Mis Puntos</span>
              </Button>
            </Link>

            <Link href="/client/profile">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-2xl hover:bg-green-50"
              >
                <Store className="h-7 w-7 text-green-600" />
                <span className="text-sm font-medium">Mi Perfil</span>
              </Button>
            </Link>

            <Link href="/client/surveys">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-2xl hover:bg-indigo-50"
              >
                <ClipboardList className="h-7 w-7 text-indigo-600" />
                <span className="text-sm font-medium">Encuestas</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
