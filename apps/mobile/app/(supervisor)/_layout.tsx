import { Redirect, Tabs } from 'expo-router'
import { ClipboardList, Home, MoreHorizontal, Users } from 'lucide-react-native'

import { useUserRole } from '@/lib/auth'

const ACTIVE = '#dd5025'
const INACTIVE = '#999999'
const NAVY = '#202456'
const BORDER = '#cccccc'

export default function SupervisorTabsLayout() {
  const { role, loading } = useUserRole()

  if (loading) return null

  if (role !== 'supervisor') {
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
        name="index"
        options={{
          title: 'Resumen',
          tabBarIcon: ({ focused, size }) => (
            <Home size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: 'Equipo',
          tabBarIcon: ({ focused, size }) => (
            <Users size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />
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
        name="more"
        options={{
          title: 'Más',
          tabBarIcon: ({ focused, size }) => (
            <MoreHorizontal size={size} color={focused ? ACTIVE : INACTIVE} />
          ),
        }}
      />

      {/* Hide dynamic sub-routes from the tab bar; each renders its own
        ScreenHeader inline. */}
      <Tabs.Screen name="team/[id]" options={{ href: null, headerShown: false }} />
    </Tabs>
  )
}
