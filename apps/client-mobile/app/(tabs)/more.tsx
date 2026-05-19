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
import { ChevronRight } from '@/components/ui/Icon'
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
      className="flex-1 bg-app-bg"
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
          <Text className="text-sm font-bold text-navy">Mi perfil</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">Ver y editar tus datos</Text>
        </Card>
      </Pressable>

      <Card className="mb-2">
        <Text className="text-sm font-bold text-navy mb-3">Mi nivel</Text>
        {pointsQuery.isLoading ? (
          <ActivityIndicator />
        ) : !summary || summary.brands.length === 0 ? (
          <Text className="text-xs text-muted-foreground">
            Aún no tienes puntos. Únete a una marca en la pestaña Marcas.
          </Text>
        ) : (
          <>
            <View className="flex-row justify-between mb-3">
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-navy">
                  {summary.total_balance}
                </Text>
                <Text className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-0.5">Saldo total</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-navy">
                  {summary.total_lifetime_points}
                </Text>
                <Text className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-0.5">Acumulados</Text>
              </View>
            </View>
            {summary.brands.map(b => (
              <Pressable
                key={b.brand_id}
                onPress={() => router.push(`/points/${b.brand_id}` as never)}
                className="flex-row items-center py-2"
                style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}
              >
                <BrandLogo logoUrl={b.brand_logo_url} name={b.brand_name} size={28} />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                    {b.brand_name}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {b.current_balance} pts · {b.lifetime_points} acumulados
                  </Text>
                </View>
                <ChevronRight size={18} color="#999999" />
              </Pressable>
            ))}
          </>
        )}
      </Card>

      <Pressable className="mb-2" onPress={() => router.push('/surveys' as never)}>
        <Card>
          <Text className="text-sm font-bold text-navy">Encuestas</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            Responde encuestas y gana puntos extra
          </Text>
        </Card>
      </Pressable>

      <Pressable onPress={onLogout}>
        <Card>
          <Text className="text-sm font-bold text-destructive">Cerrar sesión</Text>
        </Card>
      </Pressable>
    </ScrollView>
  )
}
