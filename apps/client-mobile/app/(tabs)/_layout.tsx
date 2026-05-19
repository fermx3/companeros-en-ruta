import { Tabs } from 'expo-router'

import { Home, MoreHorizontal, Package, QrCode, Tag } from '@/components/ui/Icon'

const ACTIVE = '#dd5025'
const INACTIVE = '#999999'
const NAVY = '#202456'
const BORDER = '#cccccc'

export default function TabsLayout() {
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
        }}
      />
    </Tabs>
  )
}
