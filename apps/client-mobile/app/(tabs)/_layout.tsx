import { useEffect } from 'react'
import { Tabs } from 'expo-router'

import {
  Home,
  Inbox,
  MoreHorizontal,
  QrCode,
  Tag,
} from '@/components/ui/Icon'
import { ProfileAvatarButton } from '@/components/ui/ProfileAvatarButton'
import { useUnreadCount } from '@/features/notifications/api'
import { registerForPushNotificationsAsync } from '@/features/notifications/push'
import { useNotificationsRealtime } from '@/features/notifications/realtime'

const ACTIVE = '#dd5025'
const INACTIVE = '#999999'
const NAVY = '#202456'
const BORDER = '#cccccc'

export default function TabsLayout() {
  // Mounted only after auth gating in app/index.tsx. Fire push registration
  // once on first mount and subscribe to Realtime for instant in-app updates.
  useEffect(() => {
    registerForPushNotificationsAsync().catch(err => {
      console.error('[tabs] push registration failed:', err)
    })
  }, [])
  useNotificationsRealtime()

  const unreadQuery = useUnreadCount()
  const unread = unreadQuery.data?.count ?? 0

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <ProfileAvatarButton />,
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
        name="index"
        options={{
          // Home renders its own greeting + avatar inline — no Stack header.
          headerShown: false,
          title: 'Inicio',
          tabBarIcon: ({ focused, size }) => (
            <Home size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: 'Mis QR',
          tabBarIcon: ({ focused, size }) => (
            <QrCode size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="brands"
        options={{
          title: 'Planes',
          tabBarIcon: ({ focused, size }) => (
            <Tag size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Buzón',
          tabBarIcon: ({ focused, size }) => (
            <Inbox size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
          tabBarBadge: unread > 0 ? (unread > 99 ? '99+' : unread) : undefined,
          tabBarBadgeStyle: { backgroundColor: ACTIVE, color: '#ffffff' },
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Más',
          tabBarIcon: ({ focused, size }) => (
            <MoreHorizontal size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />

      {/* Hidden routes — accessible via Quick Actions / deep links. Each one
        renders its own ScreenHeader internally, so we hide the Stack header.
        Bottom tab bar stays visible because they live inside the Tabs group. */}
      <Tabs.Screen name="orders/index" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="orders/[orderId]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="surveys/index" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="surveys/[surveyId]" options={{ href: null, headerShown: false }} />
    </Tabs>
  )
}
