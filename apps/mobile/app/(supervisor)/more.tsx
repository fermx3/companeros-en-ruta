import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ChevronRight } from '@/components/ui/Icon'
import { signOut } from '@/lib/auth'
import { useUnreadCount } from '@/features/notifications/api'

export default function SupervisorMoreScreen() {
  const unreadQuery = useUnreadCount()
  const unread = unreadQuery.data?.count ?? 0

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
    <ScrollView className="flex-1 bg-app-bg" contentContainerClassName="p-4 pb-8">
      <Pressable className="mb-3" onPress={() => router.push('/notifications' as never)}>
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-bold text-navy">Notificaciones</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {unread > 0 ? `Tienes ${unread} sin leer` : 'Avisos del equipo y visitas'}
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
        <Text className="text-base font-bold text-navy mt-1">Supervisor</Text>
        <Text className="text-sm text-muted-foreground mt-2">
          Reportes detallados, gestión de visitas y configuración de equipo están disponibles
          en la app web.
        </Text>
        <Text className="text-xs text-muted-foreground mt-2">app.companerosenruta.com</Text>
      </Card>

      <View className="mt-4">
        <Button onPress={onLogout} variant="destructive" size="default" fullWidth>
          Cerrar sesión
        </Button>
      </View>
    </ScrollView>
  )
}
