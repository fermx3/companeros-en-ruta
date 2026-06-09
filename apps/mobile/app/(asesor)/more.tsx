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

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ChevronRight } from '@/components/ui/Icon'
import { MetricCard } from '@/components/ui/MetricCard'
import { signOut } from '@/lib/auth'
import { useUnreadCount } from '@/features/notifications/api'
import { useAsesorProfile, useAsesorStats } from '@/features/asesor/profile/api'

export default function MoreScreen() {
  const profileQuery = useAsesorProfile()
  const statsQuery = useAsesorStats()
  const unreadQuery = useUnreadCount()

  const profile = profileQuery.data
  const stats = statsQuery.data?.stats
  const unread = unreadQuery.data?.count ?? 0

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
      <Pressable className="mb-3" onPress={() => router.push('/notifications' as never)}>
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-bold text-navy">Notificaciones</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {unread > 0 ? `Tienes ${unread} sin leer` : 'Avisos de pedidos, asignaciones y más'}
              </Text>
            </View>
            {unread > 0 && (
              <View
                style={{
                  backgroundColor: '#dd5025',
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'NunitoSans_700Bold' }}>
                  {unread > 99 ? '99+' : unread}
                </Text>
              </View>
            )}
            <ChevronRight size={18} color="#999999" />
          </View>
        </Card>
      </Pressable>

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
