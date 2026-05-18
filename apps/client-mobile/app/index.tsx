import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Redirect } from 'expo-router'

import { signOut, useSession } from '@/lib/auth'
import { useClientProfile } from '@/features/profile/api'

export default function Index() {
  const { session, loading: sessionLoading } = useSession()
  const profileQuery = useClientProfile()

  if (sessionLoading || (session && profileQuery.isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/login" />

  // Profile not found → user's auth account isn't linked to a client row.
  if (profileQuery.error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-base font-bold text-navy mb-2 text-center">
          Tu usuario no está vinculado a un cliente
        </Text>
        <Text className="text-sm text-gray-600 text-center mb-6">
          Contactá al administrador para que vincule esta cuenta a tu tienda.
        </Text>
        <Pressable
          className="px-4 py-2 rounded-full border border-secondary"
          onPress={async () => {
            await signOut()
          }}
        >
          <Text className="text-gray-700 font-semibold text-sm">Cerrar sesión</Text>
        </Pressable>
      </View>
    )
  }

  if (profileQuery.data?.onboarding_completed === false) {
    return <Redirect href="/(onboarding)/welcome" />
  }

  return <Redirect href="/(tabs)" />
}
