import { Pressable, Text } from 'react-native'
import { Stack, router } from 'expo-router'

// Custom back chevron for the wizard stages. The stages are navigated via
// `router.replace()` (not push), so React Navigation's history is empty and
// the native back arrow doesn't render. We exit the entire visit detail by
// popping the parent stack — going back to the visit list. Going back to the
// inner `index` would just bounce: the index auto-redirects to stage1 while
// the visit is in_progress.
function ExitWizardHeader() {
  return (
    <Pressable
      onPress={() => router.replace('/(promotor)/visits')}
      hitSlop={12}
      style={{ paddingRight: 12, paddingVertical: 4 }}
      accessibilityRole="button"
      accessibilityLabel="Salir al listado"
    >
      <Text style={{ fontSize: 28, color: '#202456', lineHeight: 28 }}>‹</Text>
    </Pressable>
  )
}

export default function VisitDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#202456',
        headerTitleStyle: { fontFamily: 'NunitoSans_700Bold' },
      }}
    >
      {/* index renders its own ScreenHeader inside the screen body. */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="stage1"
        options={{ title: 'Etapa 1 · Precios', headerLeft: () => <ExitWizardHeader /> }}
      />
      <Stack.Screen
        name="stage2"
        options={{ title: 'Etapa 2 · Compras', headerLeft: () => <ExitWizardHeader /> }}
      />
      <Stack.Screen
        name="stage3"
        options={{ title: 'Etapa 3 · POP', headerLeft: () => <ExitWizardHeader /> }}
      />
      <Stack.Screen
        name="order"
        options={{ title: 'Crear pedido', presentation: 'modal' }}
      />
    </Stack>
  )
}
