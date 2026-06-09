import { Alert, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { signOut } from '@/lib/auth'

// Shown when the authenticated user's role isn't supported on mobile
// (brand_manager, admin) or has no active role assignment. The full
// experience for those roles lives in the web app.
export default function UnsupportedRoleScreen() {
  async function onLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title="Rol no soportado" />
      <View className="flex-1 items-center justify-center px-6">
        <Card className="w-full items-center">
          <Text className="text-2xl font-black text-navy text-center mb-3">
            Tu rol está disponible en la app web
          </Text>
          <Text className="text-sm text-muted-foreground text-center mb-6">
            La app móvil está diseñada para roles de campo (promotor, asesor de
            ventas, supervisor). Para administrar marcas, configurar el sistema o
            ver reportes completos, entra desde la web.
          </Text>
          <Text className="text-xs text-muted-foreground text-center mb-6">
            app.companerosenruta.com
          </Text>
          <Button onPress={onLogout} variant="destructive" size="default">
            Cerrar sesión
          </Button>
        </Card>
      </View>
    </SafeAreaView>
  )
}
