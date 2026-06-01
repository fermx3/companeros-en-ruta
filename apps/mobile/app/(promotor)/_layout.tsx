import { Stack } from 'expo-router'

export default function PromotorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#202456',
        headerTitleStyle: { fontFamily: 'NunitoSans_700Bold' },
      }}
    >
      <Stack.Screen name="visits" options={{ title: 'Mis Visitas' }} />
      <Stack.Screen name="visits/[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
