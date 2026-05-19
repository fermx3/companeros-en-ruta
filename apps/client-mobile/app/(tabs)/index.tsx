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

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { IconPedidos, IconQR } from '@/components/ui/Icon'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { User } from 'lucide-react-native'
import { useClientProfile } from '@/features/profile/api'
import {
  promotionDiscountLabel,
  useClientPromotions,
  useFeaturedProducts,
  useMemberships,
} from '@/features/home/api'

const PRIMARY_HEX = '#dd5025' // mirrors colors.primary.DEFAULT

export default function HomeTab() {
  const profileQuery = useClientProfile()
  const membershipsQuery = useMemberships()
  const promotionsQuery = useClientPromotions()
  const productsQuery = useFeaturedProducts()

  const profile = profileQuery.data
  const memberships = membershipsQuery.data?.memberships ?? []
  const activeMemberships = memberships.filter(m => m.membership_status === 'active')
  const promotions = promotionsQuery.data?.promotions ?? []
  const products = productsQuery.data?.products ?? []

  const refreshing =
    profileQuery.isRefetching ||
    membershipsQuery.isRefetching ||
    promotionsQuery.isRefetching ||
    productsQuery.isRefetching

  const onRefresh = useCallback(() => {
    profileQuery.refetch()
    membershipsQuery.refetch()
    promotionsQuery.refetch()
    productsQuery.refetch()
  }, [profileQuery, membershipsQuery, promotionsQuery, productsQuery])

  return (
    <ScrollView
      className="flex-1 bg-app-bg"
      contentContainerClassName="p-4 pb-8"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Greeting */}
      <Text className="text-3xl font-black text-navy">
        Hola {profile?.owner_name?.split(' ')[0] ?? profile?.business_name ?? ''}
      </Text>
      <Text className="text-sm text-muted-foreground mt-1 mb-4">
        {profile?.business_name ?? ''}
      </Text>

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
                onPress={() => router.push('/(tabs)/qr')}
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

      {/* Quick actions */}
      <Text className="text-sm font-bold text-navy mb-2">Acciones rápidas</Text>
      <View className="flex-row gap-2 mb-4">
        <QuickAction
          icon={<IconQR size={24} color={PRIMARY_HEX} />}
          label="Generar QR"
          onPress={() => router.push('/(tabs)/qr')}
        />
        <QuickAction
          icon={<IconPedidos size={24} color={PRIMARY_HEX} />}
          label="Mis pedidos"
          onPress={() => router.push('/(tabs)/orders')}
        />
        <QuickAction
          icon={<User size={24} color={PRIMARY_HEX} />}
          label="Perfil"
          onPress={() => router.push('/profile')}
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
