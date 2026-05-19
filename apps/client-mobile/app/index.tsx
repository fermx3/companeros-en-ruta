import { ActivityIndicator, Text, View } from 'react-native'
import { Redirect } from 'expo-router'

import { Button } from '@/components/ui/Button'
import { signOut, useSession } from '@/lib/auth'
import { useClientProfile } from '@/features/profile/api'

export default function Index() {
  const { session, loading: sessionLoading } = useSession()
  const profileQuery = useClientProfile()

  if (sessionLoading || (session && profileQuery.isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/login" />

  // Profile not found → user's auth account isn't linked to a client row.
  if (profileQuery.error) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6">
        <Text className="text-base font-bold text-navy mb-2 text-center">
          Tu usuario no está vinculado a un cliente
        </Text>
        <Text className="text-sm text-muted-foreground text-center mb-6">
          Contacta al administrador para que vincule esta cuenta a tu tienda.
        </Text>
        <Button
          onPress={async () => {
            await signOut()
          }}
          variant="outline"
          size="default"
        >
          Cerrar sesión
        </Button>
      </View>
    )
  }

  if (profileQuery.data?.onboarding_completed === false) {
    return <Redirect href="/(onboarding)/welcome" />
  }

  return <Redirect href="/(tabs)" />
}
