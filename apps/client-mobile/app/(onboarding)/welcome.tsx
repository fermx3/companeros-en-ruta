import { Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'

export default function OnboardingWelcome() {
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
        </View>
      </View>
    </SafeAreaView>
  )
}
