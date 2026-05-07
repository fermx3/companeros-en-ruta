import { Stack } from 'expo-router'

export default function VisitDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0f2444',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Detalle de visita' }} />
      <Stack.Screen name="stage1" options={{ title: 'Etapa 1 · Precios' }} />
      <Stack.Screen name="stage2" options={{ title: 'Etapa 2 · Compras' }} />
      <Stack.Screen name="stage3" options={{ title: 'Etapa 3 · POP' }} />
      {/* `order` screen lands in PR E (apps/mobile/app/(promotor)/visits/[id]/order.tsx).
        Declaring it here without the file present makes Expo Router emit
        "Too many screens defined" and partially mount the layout, which
        breaks navigation context for nested screens. */}
    </Stack>
  )
}
