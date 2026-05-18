import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { useClientProfile } from '@/features/profile/api'
import {
  useClientPromotions,
  useFeaturedProducts,
  useMemberships,
} from '@/features/home/api'

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

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="p-4 pb-8">
      {/* Greeting */}
      <Text className="text-2xl font-bold text-navy">
        Hola {profile?.owner_name?.split(' ')[0] ?? profile?.business_name ?? ''}
      </Text>
      <Text className="text-sm text-gray-500 mt-1 mb-4">
        {profile?.business_name ?? ''}
      </Text>

      {/* Memberships / tier progress */}
      <Text className="text-sm font-semibold text-navy mb-2">Mis niveles</Text>
      {membershipsQuery.isLoading ? (
        <Card className="mb-4">
          <ActivityIndicator />
        </Card>
      ) : activeMemberships.length === 0 ? (
        <Card className="mb-4">
          <Text className="text-sm text-gray-500">
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
                    <Text className="text-sm font-semibold text-navy">{m.brand_name}</Text>
                    <Text className="text-xs text-gray-500">
                      {tier?.name ?? 'Sin nivel'} · {m.points_balance} pts
                    </Text>
                  </View>
                </View>
                {next && next.points_needed > 0 && (
                  <>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <View
                        className="h-2 bg-primary-light rounded-full"
                        style={{ width: `${Math.round(ratio * 100)}%` }}
                      />
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">
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
      <Text className="text-sm font-semibold text-navy mb-2">Promociones para ti</Text>
      {promotionsQuery.isLoading ? (
        <Card className="mb-4">
          <ActivityIndicator />
        </Card>
      ) : promotions.length === 0 ? (
        <Card className="mb-4">
          <Text className="text-sm text-gray-500">No hay promociones disponibles ahora.</Text>
        </Card>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {promotions.slice(0, 6).map(p => (
            <Pressable
              key={p.id}
              className="w-64 mr-3"
              onPress={() => router.push('/(tabs)/qr')}
            >
              <Card>
                <View className="flex-row items-center mb-1">
                  <BrandLogo logoUrl={p.brand_logo_url} name={p.brand_name} size={28} />
                  <Text className="text-xs text-gray-500 ml-2">{p.brand_name}</Text>
                </View>
                <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                  {p.name}
                </Text>
                {p.discount_display && (
                  <Text className="text-base font-bold text-success mt-1">
                    {p.discount_display}
                  </Text>
                )}
                {p.valid_until && (
                  <Text className="text-[10px] text-gray-400 mt-1">
                    Vigente hasta {new Date(p.valid_until).toLocaleDateString('es-MX')}
                  </Text>
                )}
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Quick actions */}
      <Text className="text-sm font-semibold text-navy mb-2">Acciones rápidas</Text>
      <View className="flex-row gap-2 mb-4">
        <Pressable
          className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center"
          onPress={() => router.push('/(tabs)/qr')}
        >
          <Text className="text-2xl mb-1">🔳</Text>
          <Text className="text-sm font-semibold text-navy">Generar QR</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center"
          onPress={() => router.push('/(tabs)/orders')}
        >
          <Text className="text-2xl mb-1">📦</Text>
          <Text className="text-sm font-semibold text-navy">Mis pedidos</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center"
          onPress={() => router.push('/profile')}
        >
          <Text className="text-2xl mb-1">👤</Text>
          <Text className="text-sm font-semibold text-navy">Perfil</Text>
        </Pressable>
      </View>

      {/* Featured products */}
      <Text className="text-sm font-semibold text-navy mb-2">Productos destacados</Text>
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
                    className="w-full h-24 rounded-lg mb-2 bg-gray-200"
                    resizeMode="cover"
                  />
                )}
                <Text className="text-sm font-medium text-navy" numberOfLines={2}>
                  {p.name}
                </Text>
                {p.base_price != null && (
                  <Text className="text-xs text-gray-500 mt-1">
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
