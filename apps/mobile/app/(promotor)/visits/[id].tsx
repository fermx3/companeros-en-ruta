import { Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="text-base text-gray-500 text-center">
        Detalle de visita {id}
      </Text>
      <Text className="text-xs text-gray-400 text-center mt-2">
        Stub — el flujo completo (check-in GPS, asesoramiento, evidencia, check-out) se implementa en PR C.
      </Text>
    </View>
  )
}
