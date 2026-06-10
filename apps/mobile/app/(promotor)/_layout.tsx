import { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Stack, router } from 'expo-router'

import { Bell } from 'lucide-react-native'

import { useUnreadCount } from '@/features/notifications/api'
import { registerForPushNotificationsAsync } from '@/features/notifications/push'
import { useNotificationsRealtime } from '@/features/notifications/realtime'

export default function PromotorLayout() {
  // Wire up push registration + Realtime once the promotor flow mounts (after
  // role gating in app/index.tsx).
  useEffect(() => {
    registerForPushNotificationsAsync().catch(err => {
      console.error('[promotor] push registration failed:', err)
    })
  }, [])
  useNotificationsRealtime()

  const unreadQuery = useUnreadCount()
  const unread = unreadQuery.data?.count ?? 0

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#202456',
        headerTitleStyle: { fontFamily: 'NunitoSans_700Bold' },
      }}
    >
      <Stack.Screen
        name="visits"
        options={{
          title: 'Mis Visitas',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/notifications' as never)}
              hitSlop={12}
              style={{ paddingHorizontal: 8, paddingVertical: 4 }}
            >
              <View style={{ position: 'relative', width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} color="#202456" />
                {unread > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -8,
                      backgroundColor: '#dd5025',
                      borderRadius: 999,
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 5,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 11,
                        fontFamily: 'NunitoSans_700Bold',
                        lineHeight: 14,
                        textAlign: 'center',
                      }}
                    >
                      {unread > 9 ? '9+' : unread}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="visits/[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
