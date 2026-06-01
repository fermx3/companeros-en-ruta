import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import type { ReactNode } from 'react'

interface ScreenHeaderProps {
  title: string
  showBack?: boolean
  right?: ReactNode
}

// Back chevron uses a Unicode ‹ instead of lucide-react-native's ChevronLeft.
// In apps/mobile we hit an issue where lucide icons rendered as empty SVGs
// (visible in apps/client-mobile but not here). Text chevron works
// consistently and avoids the SVG dependency for this single icon.
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
            hitSlop={12}
            style={{ paddingRight: 12, paddingVertical: 4 }}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Text style={{ fontSize: 28, color: '#202456', lineHeight: 28 }}>‹</Text>
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
