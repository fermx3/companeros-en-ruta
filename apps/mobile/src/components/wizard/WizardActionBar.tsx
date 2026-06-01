import { View } from 'react-native'

import { Button } from '@/components/ui/Button'

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
    <View
      className="flex-row gap-3 px-4 py-3 bg-card"
      style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}
    >
      {onPrevious && (
        <View className="flex-1">
          <Button
            onPress={onPrevious}
            variant="outline"
            size="lg"
            fullWidth
            disabled={loading}
          >
            {previousLabel}
          </Button>
        </View>
      )}
      {onNext && (
        <View className="flex-1">
          <Button
            onPress={onNext}
            variant="default"
            size="lg"
            fullWidth
            loading={loading}
            disabled={nextDisabled}
          >
            {nextLabel}
          </Button>
        </View>
      )}
    </View>
  )
}
