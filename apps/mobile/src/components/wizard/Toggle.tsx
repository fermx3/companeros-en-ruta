import { Switch, Text, View } from 'react-native'

interface ToggleProps {
  label: string
  hint?: string
  value: boolean
  onValueChange: (next: boolean) => void
  disabled?: boolean
}

export function Toggle({ label, hint, value, onValueChange, disabled }: ToggleProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 pr-3">
        <Text className="text-sm text-navy font-medium">{label}</Text>
        {hint && <Text className="text-xs text-gray-500 mt-0.5">{hint}</Text>}
      </View>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  )
}
