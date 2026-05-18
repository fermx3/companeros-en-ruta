import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { signOut } from '@/lib/auth'
import { usePointsSummary } from '@/features/points/api'

export default function MoreTab() {
  const pointsQuery = usePointsSummary()
  const summary = pointsQuery.data

  async function onLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4"
      refreshControl={
        <RefreshControl
          refreshing={pointsQuery.isRefetching}
          onRefresh={pointsQuery.refetch}
        />
      }
    >
      <Pressable className="mb-2" onPress={() => router.push('/profile')}>
        <Card>
          <Text className="text-sm font-semibold text-navy">Mi perfil</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Ver y editar tus datos</Text>
        </Card>
      </Pressable>

      <Card className="mb-2">
        <Text className="text-sm font-semibold text-navy mb-2">Mi nivel</Text>
        {pointsQuery.isLoading ? (
          <ActivityIndicator />
        ) : !summary || summary.brands.length === 0 ? (
          <Text className="text-xs text-gray-500">
            Aún no tienes puntos. Únete a una marca en la pestaña Marcas.
          </Text>
        ) : (
          <>
            <View className="flex-row justify-between mb-3">
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-navy">
                  {summary.total_balance}
                </Text>
                <Text className="text-xs text-gray-500">Saldo total</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-navy">
                  {summary.total_lifetime_points}
                </Text>
                <Text className="text-xs text-gray-500">Acumulados</Text>
              </View>
            </View>
            {summary.brands.map(b => (
              <Pressable
                key={b.brand_id}
                onPress={() => router.push(`/points/${b.brand_id}` as never)}
                className="flex-row items-center py-2 border-t border-gray-100"
              >
                <BrandLogo logoUrl={b.brand_logo_url} name={b.brand_name} size={28} />
                <View className="ml-3 flex-1">
                  <Text className="text-sm text-navy" numberOfLines={1}>
                    {b.brand_name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {b.current_balance} pts · {b.lifetime_points} acumulados
                  </Text>
                </View>
                <Text className="text-gray-400">›</Text>
              </Pressable>
            ))}
          </>
        )}
      </Card>

      <Pressable className="mb-2" onPress={() => router.push('/surveys' as never)}>
        <Card>
          <Text className="text-sm font-semibold text-navy">Encuestas</Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            Responde encuestas y gana puntos extra
          </Text>
        </Card>
      </Pressable>

      <Pressable onPress={onLogout}>
        <Card>
          <Text className="text-sm font-semibold text-destructive">Cerrar sesión</Text>
        </Card>
      </Pressable>
    </ScrollView>
  )
}
