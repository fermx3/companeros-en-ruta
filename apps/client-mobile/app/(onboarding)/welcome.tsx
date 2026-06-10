import { Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { dismissOnboarding } from '@/lib/onboarding-dismiss'
import { useSession } from '@/lib/auth'

export default function OnboardingWelcome() {
  const { session } = useSession()

  async function handleSkip() {
    const userId = session?.user?.id
    if (userId) await dismissOnboarding(userId)
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-black text-navy text-center mb-4">
          ¡Bienvenido a Compañeros!
        </Text>
        <Text className="text-base text-navy text-center mb-8">
          Antes de empezar, completa unos datos rápidos sobre tu negocio. Son 2 pasos
          cortos y te tomarán menos de 3 minutos.
        </Text>
        <View className="w-full">
          <Button
            onPress={() => router.push('/(onboarding)/form')}
            variant="default"
            size="lg"
            fullWidth
          >
            Completar ahora
          </Button>
          <View className="mt-3">
            <Button onPress={handleSkip} variant="ghost" size="default" fullWidth>
              En otro momento
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
