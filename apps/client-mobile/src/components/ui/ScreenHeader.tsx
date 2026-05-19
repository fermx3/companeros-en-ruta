import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import type { ReactNode } from 'react'

import { ChevronLeft } from './Icon'

interface ScreenHeaderProps {
  title: string
  showBack?: boolean
  right?: ReactNode
}

export function ScreenHeader({ title, showBack = false, right }: ScreenHeaderProps) {
  const router = useRouter()
  return (
    <View
      className="flex-row items-center justify-between px-4 py-3 bg-card"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
    >
      <View className="flex-row items-center flex-1">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            className="pr-3 py-2"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <ChevronLeft size={24} color="#202456" />
          </Pressable>
        ) : null}
        <Text className="text-base font-bold text-navy" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  )
}
