import { Alert, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { signOut } from '@/lib/auth'

export default function SupervisorMoreScreen() {
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
    <ScrollView className="flex-1 bg-app-bg" contentContainerClassName="p-4 pb-8">
      <Card className="mb-3">
        <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
          Perfil
        </Text>
        <Text className="text-base font-bold text-navy mt-1">Supervisor</Text>
        <Text className="text-sm text-muted-foreground mt-2">
          Reportes detallados, gestión de visitas y configuración de equipo están disponibles
          en la app web.
        </Text>
        <Text className="text-xs text-muted-foreground mt-2">app.companerosenruta.com</Text>
      </Card>

      <View className="mt-4">
        <Button onPress={onLogout} variant="destructive" size="default" fullWidth>
          Cerrar sesión
        </Button>
      </View>
    </ScrollView>
  )
}
