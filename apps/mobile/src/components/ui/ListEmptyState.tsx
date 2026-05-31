import { Text, View } from 'react-native'
import type { ReactNode } from 'react'

import { Button } from './Button'

interface ListEmptyStateProps {
  title: string
  body?: string
  icon?: ReactNode
  ctaLabel?: string
  onCta?: () => void
}

export function ListEmptyState({ title, body, icon, ctaLabel, onCta }: ListEmptyStateProps) {
  return (
    <View className="items-center justify-center px-6 py-12">
      {icon ? <View className="mb-3">{icon}</View> : null}
      <Text className="text-base font-bold text-navy text-center">{title}</Text>
      {body ? (
        <Text className="text-sm text-muted-foreground text-center mt-2">{body}</Text>
      ) : null}
      {ctaLabel && onCta ? (
        <View className="mt-4">
          <Button onPress={onCta} variant="default" size="default">
            {ctaLabel}
          </Button>
        </View>
      ) : null}
    </View>
  )
}
