import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { signOut } from '@/lib/auth'
import { useAsesorProfile, useAsesorStats } from '@/features/asesor/profile/api'

export default function MoreScreen() {
  const profileQuery = useAsesorProfile()
  const statsQuery = useAsesorStats()

  const profile = profileQuery.data
  const stats = statsQuery.data?.stats

  const refreshing = profileQuery.isRefetching || statsQuery.isRefetching
  function onRefresh() {
    profileQuery.refetch()
    statsQuery.refetch()
  }

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
      contentContainerClassName="p-4 pb-8"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card className="mb-3">
        <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
          Perfil
        </Text>
        {profileQuery.isLoading || !profile ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text className="text-base font-bold text-navy mt-1">{profile.full_name}</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{profile.public_id}</Text>
            {profile.email && (
              <Text className="text-sm text-navy mt-2">
                <Text className="text-muted-foreground">Email: </Text>
                {profile.email}
              </Text>
            )}
            {profile.phone && (
              <Text className="text-sm text-navy">
                <Text className="text-muted-foreground">Tel: </Text>
                {profile.phone}
              </Text>
            )}
            {profile.distributor_name && (
              <Text className="text-sm text-navy mt-1">
                <Text className="text-muted-foreground">Distribuidor: </Text>
                {profile.distributor_name}
              </Text>
            )}
            {profile.needsDistributorAssignment && (
              <View
                className="mt-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' }}
              >
                <Text className="text-xs text-destructive">
                  Te falta asignación de distribuidor. Contacta a tu administrador.
                </Text>
              </View>
            )}
          </>
        )}
      </Card>

      <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 mt-2">
        Estadísticas
      </Text>
      {statsQuery.isLoading || !stats ? (
        <Card>
          <ActivityIndicator />
        </Card>
      ) : (
        <>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1">
              <MetricCard label="Pedidos mes" value={stats.orders_this_month} />
            </View>
            <View className="flex-1">
              <MetricCard label="Clientes" value={stats.total_clients} />
            </View>
          </View>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1">
              <MetricCard label="Pendientes" value={stats.pending_orders} />
            </View>
            <View className="flex-1">
              <MetricCard label="Completados" value={stats.completed_orders} />
            </View>
          </View>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1">
              <MetricCard
                label="Ventas total"
                value={`$${Math.round(stats.total_sales_amount).toLocaleString('es-MX')}`}
              />
            </View>
            <View className="flex-1">
              <MetricCard label="QR mes" value={stats.qr_redeemed_this_month} />
            </View>
          </View>
        </>
      )}

      <View className="mt-4">
        <Button onPress={onLogout} variant="destructive" size="default" fullWidth>
          Cerrar sesión
        </Button>
      </View>
    </ScrollView>
  )
}
