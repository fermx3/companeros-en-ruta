import { Pressable, StyleSheet, Text } from 'react-native'

// StyleSheet-only — see Button.tsx header. FilterChip is rendered inside .map
// in screens like Orders, which is the exact crash trigger.

interface FilterChipProps {
  label: string
  selected: boolean
  onPress: () => void
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#4d71ed',
    borderColor: '#4d71ed',
  },
  label: {
    fontSize: 13,
    color: '#4b5563',
    fontFamily: 'NunitoSans_700Bold',
  },
  labelSelected: { color: '#ffffff' },
})
