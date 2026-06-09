import { Redirect, Tabs } from 'expo-router'

import { IconPedidos, MoreHorizontal, QrCode } from '@/components/ui/Icon'
import { User } from 'lucide-react-native'

import { useUserRole } from '@/lib/auth'

const ACTIVE = '#dd5025'
const INACTIVE = '#999999'
const NAVY = '#202456'
const BORDER = '#cccccc'

export default function AsesorTabsLayout() {
  const { role, loading } = useUserRole()

  if (loading) return null

  // Guard: only asesor_de_ventas can reach this group. Everyone else gets
  // bounced to root which re-routes via the role switch.
  if (role !== 'asesor_de_ventas') {
    return <Redirect href="/" />
  }

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
        name="clients"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ focused, size }) => (
            <User size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ focused, size }) => (
            <IconPedidos size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Escáner',
          tabBarIcon: ({ focused, size }) => (
            <QrCode size={size} color={focused ? ACTIVE : INACTIVE} />
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
        }}
      />

      {/* Hide dynamic sub-routes from the tab bar and let each screen render
        its own ScreenHeader (back chevron + title) inside the body. */}
      <Tabs.Screen name="clients/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="orders/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="orders/new" options={{ href: null, headerShown: false }} />
    </Tabs>
  )
}
