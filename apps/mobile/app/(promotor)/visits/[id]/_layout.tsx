import { Pressable } from 'react-native'
import { Stack, router } from 'expo-router'

import { ChevronLeft } from '@/components/ui/Icon'

export default function VisitDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#202456',
        headerTitleStyle: { fontFamily: 'NunitoSans_700Bold' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Detalle de visita',
          // The inner stack's `index` is the first screen, so React Navigation
          // does not draw a back arrow automatically. We pop the PARENT stack
          // (back to the visit list) with a custom header left.
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} style={{ paddingRight: 12 }}>
              <ChevronLeft size={24} color="#202456" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="stage1" options={{ title: 'Etapa 1 · Precios' }} />
      <Stack.Screen name="stage2" options={{ title: 'Etapa 2 · Compras' }} />
      <Stack.Screen name="stage3" options={{ title: 'Etapa 3 · POP' }} />
      <Stack.Screen
        name="order"
        options={{ title: 'Crear pedido', presentation: 'modal' }}
      />
    </Stack>
  )
}
