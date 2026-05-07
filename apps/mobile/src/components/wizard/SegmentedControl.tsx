import { Pressable, Text, View } from 'react-native'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  label?: string
  value: T | null | undefined
  options: readonly Option<T>[]
  onChange: (next: T) => void
  disabled?: boolean
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: SegmentedControlProps<T>) {
  return (
    <View className="my-2">
      {label && <Text className="text-xs text-gray-500 mb-1">{label}</Text>}
      <View className="flex-row bg-gray-100 rounded-lg p-1">
        {options.map(opt => {
          const selected = opt.value === value
          return (
            <Pressable
              key={opt.value}
              className={`flex-1 py-2 rounded-md items-center ${selected ? 'bg-white shadow' : ''} ${disabled ? 'opacity-50' : ''}`}
              onPress={() => !disabled && onChange(opt.value)}
              disabled={disabled}
            >
              <Text
                className={`text-xs font-medium ${selected ? 'text-navy' : 'text-gray-500'}`}
              >
                {opt.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
