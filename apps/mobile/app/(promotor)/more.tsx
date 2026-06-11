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
import { signOut } from '@/lib/auth'
import { useUnreadCount } from '@/features/notifications/api'
import { usePromotorProfile } from '@/features/promotor-profile/api'
import { usePendingStaffSurveys } from '@/features/staff-surveys/api'

export default function PromotorMoreScreen() {
  const profileQuery = usePromotorProfile()
  const unreadQuery = useUnreadCount()
  const pendingSurveys = usePendingStaffSurveys()

  const profile = profileQuery.data
  const unread = unreadQuery.data?.count ?? 0
  const pendingCount = pendingSurveys.pendingCount

  const refreshing =
    profileQuery.isRefetching || unreadQuery.isRefetching || pendingSurveys.isRefetching

  function onRefresh() {
    profileQuery.refetch()
    unreadQuery.refetch()
    pendingSurveys.refetch()
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
      alwaysBounceVertical
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Pressable className="mb-3" onPress={() => router.push('/notifications' as never)}>
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-bold text-navy">Notificaciones</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {unread > 0 ? `Tienes ${unread} sin leer` : 'Asignaciones, visitas y avisos'}
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

      <Pressable className="mb-3" onPress={() => router.push('/(promotor)/surveys' as never)}>
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-bold text-navy">Encuestas</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {pendingCount > 0
                  ? `Tienes ${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}`
                  : 'Encuestas asignadas a tu rol'}
              </Text>
            </View>
            {pendingCount > 0 && (
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
                  {pendingCount > 99 ? '99+' : pendingCount}
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
            {profile.zone_name && (
              <Text className="text-sm text-navy mt-1">
                <Text className="text-muted-foreground">Zona: </Text>
                {profile.zone_name}
              </Text>
            )}
            {profile.total_assigned_clients > 0 && (
              <Text className="text-sm text-navy">
                <Text className="text-muted-foreground">Clientes asignados: </Text>
                {profile.total_assigned_clients}
              </Text>
            )}
          </>
        )}
      </Card>

      <View className="mt-4">
        <Button onPress={onLogout} variant="destructive" size="default" fullWidth>
          Cerrar sesión
        </Button>
      </View>
    </ScrollView>
  )
}
