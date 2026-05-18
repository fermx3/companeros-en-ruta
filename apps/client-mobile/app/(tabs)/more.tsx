import { Alert, Pressable, ScrollView, Text } from 'react-native'
import { router } from 'expo-router'

import { Card } from '@/components/ui/Card'
import { signOut } from '@/lib/auth'

export default function MoreTab() {
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
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="p-4">
      <Pressable className="mb-2" onPress={() => router.push('/profile')}>
        <Card>
          <Text className="text-sm font-semibold text-navy">Mi perfil</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Ver y editar tus datos</Text>
        </Card>
      </Pressable>
      <Card className="mb-2">
        <Text className="text-sm font-semibold text-navy">Mi nivel</Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          Detalle de puntos por marca — próxima iteración
        </Text>
      </Card>
      <Card className="mb-2">
        <Text className="text-sm font-semibold text-navy">Encuestas</Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          Lista de encuestas — próxima iteración
        </Text>
      </Card>
      <Pressable onPress={onLogout}>
        <Card>
          <Text className="text-sm font-semibold text-destructive">Cerrar sesión</Text>
        </Card>
      </Pressable>
    </ScrollView>
  )
}
