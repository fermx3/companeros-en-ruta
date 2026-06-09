import { useEffect } from 'react'
import { Tabs } from 'expo-router'

import { Home, MoreHorizontal, Package, QrCode, Tag } from '@/components/ui/Icon'
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
  // Re-running on every reload is OK — the backend upserts.
  useEffect(() => {
    registerForPushNotificationsAsync().catch(err => {
      console.error('[tabs] push registration failed:', err)
    })
  }, [])
  useNotificationsRealtime()

  // Live unread count so the Más tab can show a badge from any tab. The
  // Realtime subscription above invalidates this on INSERT.
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
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused, size }) => (
            <Home size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: 'Mi QR',
          tabBarIcon: ({ focused, size }) => (
            <QrCode size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ focused, size }) => (
            <Package size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="brands"
        options={{
          title: 'Marcas',
          tabBarIcon: ({ focused, size }) => (
            <Tag size={size} color={focused ? ACTIVE : INACTIVE} />
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
    </Tabs>
  )
}
