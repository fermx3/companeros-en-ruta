import { Stack } from 'expo-router'

export default function PromotorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0f2444',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="visits" options={{ title: 'Mis Visitas' }} />
      <Stack.Screen name="visits/[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
