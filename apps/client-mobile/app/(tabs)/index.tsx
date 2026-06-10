import { useCallback } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ClipboardList, IconPedidos, IconQR } from '@/components/ui/Icon'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { ProfileAvatarButton } from '@/components/ui/ProfileAvatarButton'
import { useClientProfile } from '@/features/profile/api'
import {
  promotionDiscountLabel,
  useClientPromotions,
  useFeaturedProducts,
  useMemberships,
} from '@/features/home/api'
import { usePendingSurveys } from '@/features/surveys/api'

const PRIMARY_HEX = '#dd5025' // mirrors colors.primary.DEFAULT

export default function HomeTab() {
  const profileQuery = useClientProfile()
  const membershipsQuery = useMemberships()
  const promotionsQuery = useClientPromotions()
  const productsQuery = useFeaturedProducts()
  const pendingSurveys = usePendingSurveys()

  const profile = profileQuery.data
  const memberships = membershipsQuery.data?.memberships ?? []
  const activeMemberships = memberships.filter(m => m.membership_status === 'active')
  const promotions = promotionsQuery.data?.promotions ?? []
  const products = productsQuery.data?.products ?? []

  // Perfectapp loyalty plan summary — aggregates across the cliente's active
  // memberships so the dashboard answers "how am I doing overall" before
  // drilling into per-brand niveles below.
  const totalPoints = activeMemberships.reduce((sum, m) => sum + (m.points_balance ?? 0), 0)
  const primaryTierName =
    activeMemberships
      .map(m => m.current_tier?.name)
      .find(Boolean) ?? 'Perfectapp'

  const refreshing =
    profileQuery.isRefetching ||
    membershipsQuery.isRefetching ||
    promotionsQuery.isRefetching ||
    productsQuery.isRefetching ||
    pendingSurveys.isRefetching

  const onRefresh = useCallback(() => {
    profileQuery.refetch()
    membershipsQuery.refetch()
    promotionsQuery.refetch()
    productsQuery.refetch()
    pendingSurveys.refetch()
  }, [profileQuery, membershipsQuery, promotionsQuery, productsQuery, pendingSurveys])

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      {/* Greeting + Profile avatar */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1 pr-3">
          <Text className="text-3xl font-black text-navy" numberOfLines={1}>
            Hola {profile?.owner_name?.split(' ')[0] ?? profile?.business_name ?? ''}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1" numberOfLines={1}>
            {profile?.business_name ?? ''}
          </Text>
        </View>
        <ProfileAvatarButton size={44} />
      </View>

      {/* Perfectapp loyalty summary */}
      <View
        className="rounded-2xl mb-4 overflow-hidden"
        style={{
          backgroundColor: '#f5f5f5',
          borderWidth: 1,
          borderColor: 'rgba(204,204,204,0.4)',
        }}
      >
        <View
          className="px-4 py-2"
          style={{ backgroundColor: 'rgba(221,80,37,0.10)' }}
        >
          <Text className="text-xs uppercase tracking-widest text-muted-foreground">
            Plan Perfectapp
          </Text>
          <Text className="text-base font-bold text-navy mt-0.5">{primaryTierName}</Text>
        </View>
        <View className="flex-row p-2 gap-2">
          <SummaryTile value={totalPoints.toLocaleString('es-MX')} unit="puntos" label="Mis puntos" />
          <SummaryTile value={String(promotions.length)} unit="promos" label="Promos activas" />
          <SummaryTile value="—" unit="próx." label="Alcance" muted />
          <SummaryTile value={String(activeMemberships.length)} unit="marcas" label="Mis marcas" />
        </View>
      </View>

      {/* Memberships / tier progress */}
      <Text className="text-sm font-bold text-navy mb-2">Mis niveles</Text>
      {membershipsQuery.isLoading ? (
        <Card className="mb-4">
          <ActivityIndicator />
        </Card>
      ) : activeMemberships.length === 0 ? (
        <Card className="mb-4">
          <Text className="text-sm text-muted-foreground">
            Aún no estás unido a ninguna marca. Ve a la pestaña Marcas para descubrir.
          </Text>
        </Card>
      ) : (
        <View className="mb-4">
          {activeMemberships.map(m => {
            const tier = m.current_tier
            const next = m.next_tier
            const ratio = next && next.points_needed > 0
              ? Math.min(1, m.points_balance / (m.points_balance + next.points_needed))
              : 1
            return (
              <Card key={m.id} className="mb-2">
                <View className="flex-row items-center mb-2">
                  <BrandLogo logoUrl={m.brand_logo_url} name={m.brand_name} size={36} />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-bold text-navy">{m.brand_name}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {tier?.name ?? 'Sin nivel'} · {m.points_balance} pts
                    </Text>
                  </View>
                </View>
                {next && next.points_needed > 0 && (
                  <>
                    <View className="h-2 bg-muted rounded-full overflow-hidden">
                      <View
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${Math.round(ratio * 100)}%` }}
                      />
                    </View>
                    <Text className="text-xs text-muted-foreground mt-1">
                      Te faltan {next.points_needed} pts para {next.name}
                    </Text>
                  </>
                )}
              </Card>
            )
          })}
        </View>
      )}

      {/* Promotions */}
      <Text className="text-sm font-bold text-navy mb-2">Promociones para ti</Text>
      {promotionsQuery.isLoading ? (
        <Card className="mb-4">
          <ActivityIndicator />
        </Card>
      ) : promotions.length === 0 ? (
        <Card className="mb-4">
          <Text className="text-sm text-muted-foreground">No hay promociones disponibles ahora.</Text>
        </Card>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {promotions.slice(0, 6).map(p => {
            const discount = promotionDiscountLabel(p)
            const brandName = p.brand?.name ?? 'Marca'
            const brandColor = p.brand?.brand_color_primary ?? PRIMARY_HEX
            return (
              <Pressable
                key={p.id}
                className="w-64 mr-3"
                onPress={() => router.push(`/promotions/${p.id}` as never)}
              >
                <Card>
                  <View className="flex-row items-center mb-2">
                    <BrandLogo logoUrl={p.brand?.logo_url ?? null} name={brandName} size={28} />
                    <Text className="text-xs text-muted-foreground ml-2 flex-1" numberOfLines={1}>
                      {brandName}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-navy" numberOfLines={2}>
                    {p.name}
                  </Text>
                  {discount && (
                    <Text
                      className="text-base font-bold mt-1"
                      style={{ color: brandColor }}
                    >
                      {discount}
                    </Text>
                  )}
                  {p.description && (
                    <Text className="text-xs text-muted-foreground mt-1" numberOfLines={2}>
                      {p.description}
                    </Text>
                  )}
                  {p.end_date && (
                    <Text className="text-[10px] text-muted-foreground mt-2">
                      Vigente hasta{' '}
                      {new Date(p.end_date).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  )}
                  {p.requires_code && p.promo_code && (
                    <Text className="text-[10px] text-amber-700 mt-0.5 font-bold">
                      Código: {p.promo_code}
                    </Text>
                  )}
                </Card>
              </Pressable>
            )
          })}
        </ScrollView>
      )}

      {/* Pending surveys banner — hidden when nothing pending */}
      {pendingSurveys.pendingCount > 0 && (
        <Pressable
          onPress={() => router.push('/surveys' as never)}
          className="mb-4"
        >
          <View
            className="rounded-2xl p-4 flex-row items-center"
            style={{ backgroundColor: PRIMARY_HEX }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ClipboardList size={22} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm" numberOfLines={1}>
                {pendingSurveys.pendingCount === 1
                  ? 'Tienes 1 encuesta pendiente'
                  : `Tienes ${pendingSurveys.pendingCount} encuestas pendientes`}
              </Text>
              <Text className="text-white text-xs mt-0.5 opacity-90" numberOfLines={1}>
                {pendingSurveys.firstPending?.brands?.name
                  ? `Empieza con ${pendingSurveys.firstPending.brands.name}`
                  : 'Responde y gana beneficios'}
              </Text>
            </View>
            <Text className="text-white font-bold text-xs ml-2">Responder →</Text>
          </View>
        </Pressable>
      )}

      {/* Quick actions */}
      <Text className="text-sm font-bold text-navy mb-2">Acciones rápidas</Text>
      <View className="flex-row gap-2 mb-4">
        <QuickAction
          icon={<IconQR size={24} color={PRIMARY_HEX} />}
          label="Mis QR"
          onPress={() => router.push('/(tabs)/qr')}
        />
        <QuickAction
          icon={<ClipboardList size={24} color={PRIMARY_HEX} />}
          label="Encuestas"
          onPress={() => router.push('/surveys' as never)}
        />
        <QuickAction
          icon={<IconPedidos size={24} color={PRIMARY_HEX} />}
          label="Pedidos"
          onPress={() => router.push('/orders' as never)}
        />
      </View>

      {/* Featured products */}
      <Text className="text-sm font-bold text-navy mb-2">Productos destacados</Text>
      {productsQuery.isLoading ? (
        <Card>
          <ActivityIndicator />
        </Card>
      ) : products.length === 0 ? (
        <ListEmptyState title="Sin productos destacados por ahora" />
      ) : (
        <View className="flex-row flex-wrap -mx-1">
          {products.slice(0, 4).map(p => (
            <View key={p.id} className="w-1/2 px-1 mb-2">
              <Card>
                {p.image_url && (
                  <Image
                    source={{ uri: p.image_url }}
                    className="w-full h-24 rounded-lg mb-2 bg-muted"
                    resizeMode="cover"
                  />
                )}
                <Text className="text-sm font-bold text-navy" numberOfLines={2}>
                  {p.name}
                </Text>
                {p.base_price != null && (
                  <Text className="text-xs text-muted-foreground mt-1">
                    ${Number(p.base_price).toFixed(2)}
                  </Text>
                )}
              </Card>
            </View>
          ))}
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  )
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      className="flex-1 bg-card rounded-2xl p-4 items-center"
      style={{
        borderWidth: 1,
        borderColor: 'rgba(204,204,204,0.4)',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
    >
      <View className="mb-2">{icon}</View>
      <Text className="text-xs font-bold text-navy">{label}</Text>
    </Pressable>
  )
}

function SummaryTile({
  value,
  unit,
  label,
  muted = false,
}: {
  value: string
  unit: string
  label: string
  muted?: boolean
}) {
  return (
    <View
      className="flex-1 items-center bg-card rounded-xl py-3 px-1"
      style={{ borderWidth: 1, borderColor: 'rgba(204,204,204,0.4)' }}
    >
      <Text className="text-[10px] text-muted-foreground text-center" numberOfLines={1}>
        {label}
      </Text>
      <Text
        className={`text-xl font-black mt-1 ${muted ? 'text-muted-foreground' : 'text-navy'}`}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>
        {unit}
      </Text>
    </View>
  )
}
