import { useEffect } from 'react'
import { Tabs } from 'expo-router'
import { CalendarDays, ClipboardList, MoreHorizontal, Users } from 'lucide-react-native'

import { useUnreadCount } from '@/features/notifications/api'
import { registerForPushNotificationsAsync } from '@/features/notifications/push'
import { useNotificationsRealtime } from '@/features/notifications/realtime'

const ACTIVE = '#dd5025'
const INACTIVE = '#999999'
const NAVY = '#202456'
const BORDER = '#cccccc'

export default function PromotorLayout() {
  // Wire up push registration + Realtime once the promotor flow mounts (after
  // role gating in app/index.tsx).
  useEffect(() => {
    registerForPushNotificationsAsync().catch(err => {
      console.error('[promotor] push registration failed:', err)
    })
  }, [])
  useNotificationsRealtime()

  // Más tab carries the unread badge so notifications + surveys + perfil live
  // in one place, matching the asesor / supervisor pattern.
  const unreadQuery = useUnreadCount()
  const unread = unreadQuery.data?.count ?? 0

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: BORDER },
        tabBarLabelStyle: { fontFamily: 'NunitoSans_700Bold', fontSize: 11 },
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: NAVY,
        headerTitleStyle: { fontFamily: 'NunitoSans_700Bold' },
      }}
    >
      <Tabs.Screen
        name="visits"
        options={{
          title: 'Visitas',
          tabBarIcon: ({ focused, size }) => (
            <ClipboardList size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ focused, size }) => (
            <Users size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ focused, size }) => (
            <CalendarDays size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Más',
          tabBarIcon: ({ focused, size }) => (
            <MoreHorizontal size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
          tabBarBadge: unread > 0 ? (unread > 99 ? '99+' : unread) : undefined,
          tabBarBadgeStyle: { backgroundColor: ACTIVE, color: '#ffffff' },
        }}
      />

      {/* Hidden sub-routes — each renders its own ScreenHeader inline.
        visits/[id] has its own nested Stack (_layout) for the wizard stages,
        so a single entry suffices. */}
      <Tabs.Screen name="visits/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="clients/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="surveys/index" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="surveys/[surveyId]" options={{ href: null, headerShown: false }} />
    </Tabs>
  )
}
