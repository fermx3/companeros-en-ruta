import { ActivityIndicator, Pressable, Text, View } from 'react-native'

interface WizardActionBarProps {
  onPrevious?: () => void
  onNext?: () => void | Promise<void>
  nextLabel?: string
  previousLabel?: string
  loading?: boolean
  nextDisabled?: boolean
}

export function WizardActionBar({
  onPrevious,
  onNext,
  nextLabel = 'Siguiente',
  previousLabel = 'Anterior',
  loading = false,
  nextDisabled = false,
}: WizardActionBarProps) {
  return (
    <View className="flex-row gap-3 px-4 py-3 bg-white border-t border-gray-200">
      {onPrevious && (
        <Pressable
          className="flex-1 h-12 rounded-full border border-secondary items-center justify-center disabled:opacity-50"
          onPress={onPrevious}
          disabled={loading}
        >
          <Text className="text-gray-700 font-semibold">{previousLabel}</Text>
        </Pressable>
      )}
      {onNext && (
        <Pressable
          className="flex-1 h-12 rounded-full bg-primary-light items-center justify-center disabled:opacity-50"
          onPress={onNext}
          disabled={loading || nextDisabled}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">{nextLabel}</Text>
          )}
        </Pressable>
      )}
    </View>
  )
}
