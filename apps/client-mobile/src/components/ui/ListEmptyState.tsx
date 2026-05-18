import { Pressable, Text, View } from 'react-native'

interface ListEmptyStateProps {
  title: string
  body?: string
  ctaLabel?: string
  onCta?: () => void
}

export function ListEmptyState({ title, body, ctaLabel, onCta }: ListEmptyStateProps) {
  return (
    <View className="items-center justify-center px-6 py-12">
      <Text className="text-base font-semibold text-navy text-center">{title}</Text>
      {body && (
        <Text className="text-sm text-gray-500 text-center mt-2">{body}</Text>
      )}
      {ctaLabel && onCta && (
        <Pressable
          className="mt-4 px-4 py-2 rounded-full bg-primary-light"
          onPress={onCta}
        >
          <Text className="text-white font-semibold text-sm">{ctaLabel}</Text>
        </Pressable>
      )}
    </View>
  )
}
