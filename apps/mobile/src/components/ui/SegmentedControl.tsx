import { Pressable, StyleSheet, Text, View } from 'react-native'

// All styling via StyleSheet — see Button.tsx header comment. The .map below
// renders Pressable instances, which is the exact pattern that triggers the
// NativeWind MISSING_CONTEXT_ERROR crash if any of these used className.

interface SegmentOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[]
  value: T | null | undefined
  onChange: (next: T) => void
  label?: string
  disabled?: boolean
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  disabled = false,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.heading}>{label}</Text> : null}
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
              android_ripple={disabled ? undefined : { color: 'rgba(0,0,0,0.05)' }}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
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
  container: {},
  heading: {
    fontSize: 12,
    color: '#4b5563',
    fontFamily: 'NunitoSans_700Bold',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  optionDisabled: { opacity: 0.5 },
  optionLabel: {
    fontSize: 13,
    color: '#4b5563',
    fontFamily: 'NunitoSans_700Bold',
  },
  optionLabelSelected: { color: '#202456' },
})
