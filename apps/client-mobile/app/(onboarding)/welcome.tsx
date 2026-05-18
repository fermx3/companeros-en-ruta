import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function OnboardingWelcome() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-navy text-center mb-4">
          ¡Bienvenido a Compañeros!
        </Text>
        <Text className="text-base text-gray-600 text-center mb-8">
          Antes de empezar, completa unos datos rápidos sobre tu negocio. Son 2 pasos
          cortos y te tomarán menos de 3 minutos.
        </Text>
        <Pressable
          className="w-full h-12 rounded-full bg-primary-light items-center justify-center"
          onPress={() => router.push('/(onboarding)/form')}
        >
          <Text className="text-white font-bold text-base">Completar ahora</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
