import { Pressable, StyleSheet, Text, View } from 'react-native'

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

// Bypassing NativeWind className on this component on purpose.
// The interop wrapper around Pressable triggers a navigation-context lookup
// inside RN's accessibility/feedback machinery on re-render after a Zustand
// state update, which crashes with MISSING_CONTEXT_ERROR. Using StyleSheet
// keeps the same visual but avoids the wrapper.
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        {options.map(opt => {
          const selected = opt.value === value
          return (
            <Pressable
              key={opt.value}
              style={[
                styles.option,
                selected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={disabled ? undefined : () => onChange(opt.value)}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  track: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  optionDisabled: { opacity: 0.5 },
  optionLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  optionLabelSelected: { color: '#0f2444' },
})
