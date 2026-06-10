import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { Redirect } from 'expo-router'

import { Button } from '@/components/ui/Button'
import { isOnboardingDismissed } from '@/lib/onboarding-dismiss'
import { signOut, useSession } from '@/lib/auth'
import { useClientProfile } from '@/features/profile/api'

export default function Index() {
  const { session, loading: sessionLoading } = useSession()
  const profileQuery = useClientProfile()
  const [dismissChecked, setDismissChecked] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!userId) {
      setDismissChecked(true)
      return
    }
    isOnboardingDismissed(userId)
      .then(setDismissed)
      .finally(() => setDismissChecked(true))
  }, [userId])

  if (sessionLoading || (session && profileQuery.isLoading) || !dismissChecked) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/login" />

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

  // Show onboarding only if not completed AND user hasn't actively dismissed it.
  // The dismiss flag is per-user; Home keeps a persistent reminder banner so the
  // skip doesn't make the form invisible forever.
  if (profileQuery.data?.onboarding_completed === false && !dismissed) {
    return <Redirect href="/(onboarding)/welcome" />
  }

  return <Redirect href="/(tabs)" />
}
