import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

interface ScreenHeaderProps {
  title: string
  showBack?: boolean
  right?: React.ReactNode
}

export function ScreenHeader({ title, showBack = false, right }: ScreenHeaderProps) {
  const router = useRouter()
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <View className="flex-row items-center flex-1">
        {showBack && (
          <Pressable onPress={() => router.back()} className="pr-3">
            <Text className="text-2xl text-navy">‹</Text>
          </Pressable>
        )}
        <Text className="text-base font-bold text-navy" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  )
}
