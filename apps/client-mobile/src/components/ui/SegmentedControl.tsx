import { Pressable, StyleSheet, Text, View } from 'react-native'

// All styling via StyleSheet — see Button.tsx header comment. The .map below
// renders Pressable instances, which is the exact pattern that triggers the
// NativeWind MISSING_CONTEXT_ERROR crash if any of these used className.

interface SegmentOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (next: T) => void
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.track}>
      {options.map(opt => {
        const selected = opt.value === value
        return (
          <Pressable
            key={opt.value}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onChange(opt.value)}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
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
  label: {
    fontSize: 13,
    color: '#999999',
    fontFamily: 'NunitoSans_700Bold',
  },
  labelSelected: { color: '#202456' },
})
