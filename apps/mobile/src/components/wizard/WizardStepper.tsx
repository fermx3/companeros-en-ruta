import { Pressable, Text, View } from 'react-native'

type Stage = 1 | 2 | 3

interface WizardStepperProps {
  current: Stage
  completed: ReadonlySet<Stage>
  onJumpTo?: (stage: Stage) => void
}

const LABELS: Record<Stage, string> = {
  1: 'Precios',
  2: 'Compras',
  3: 'POP',
}

export function WizardStepper({ current, completed, onJumpTo }: WizardStepperProps) {
  return (
    <View
      className="bg-card px-4 py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
    >
      <View className="flex-row justify-between items-center">
        {([1, 2, 3] as const).map((stage, idx) => {
          const isCurrent = stage === current
          const isCompleted = completed.has(stage)
          const reachable = isCurrent || isCompleted
          const dotBg = isCurrent
            ? 'bg-primary'
            : isCompleted
              ? 'bg-success'
              : 'bg-border'
          return (
            <View key={stage} className="flex-row items-center flex-1">
              <Pressable
                onPress={() => reachable && onJumpTo?.(stage)}
                disabled={!reachable || !onJumpTo}
                className="items-center"
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${dotBg}`}
                >
                  <Text className="text-white font-bold text-sm">
                    {isCompleted ? '✓' : stage}
                  </Text>
                </View>
                <Text
                  className={`text-xs mt-1 ${isCurrent ? 'text-navy font-bold' : 'text-muted-foreground'}`}
                >
                  {LABELS[stage]}
                </Text>
              </Pressable>
              {idx < 2 && (
                <View
                  className={`flex-1 h-0.5 mx-2 ${completed.has(stage) ? 'bg-success' : 'bg-border'}`}
                />
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}
