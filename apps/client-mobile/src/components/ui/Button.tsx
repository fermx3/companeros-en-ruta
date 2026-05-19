import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'

// NativeWind+Pressable+map can crash with MISSING_CONTEXT_ERROR (see
// apps/client-mobile/app/(tabs)/qr.tsx line 62-65 for the original symptom).
// The tap-target Pressable's container styles MUST be StyleSheet so the
// Pressable doesn't trigger that render path. Text/icon content inside uses
// className freely — only the iterated Pressable is the hazard.

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon'

interface ButtonProps {
  children?: ReactNode
  onPress?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const isInactive = disabled || loading
  const containerStyle = [
    styles.base,
    sizeStyles[size],
    variantStyles[variant].container,
    fullWidth && styles.fullWidth,
    isInactive && styles.disabled,
  ]
  const labelColor = variantStyles[variant].labelColor
  const labelSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14

  return (
    <Pressable
      onPress={isInactive ? undefined : onPress}
      style={({ pressed }) => [containerStyle, pressed && !isInactive && styles.pressed]}
      android_ripple={isInactive ? undefined : { color: 'rgba(0,0,0,0.1)' }}
      hitSlop={size === 'sm' ? 8 : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={styles.row}>
          {leftIcon ? <View style={styles.iconSpacer}>{leftIcon}</View> : null}
          {typeof children === 'string' ? (
            <Text
              style={{
                color: labelColor,
                fontFamily: 'NunitoSans_700Bold',
                fontSize: labelSize,
              }}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon ? <View style={styles.iconSpacer}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconSpacer: { marginHorizontal: 0 },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
})

const sizeStyles = StyleSheet.create({
  sm: { height: 36, paddingHorizontal: 12 },
  default: { height: 44, paddingHorizontal: 16 },
  lg: { height: 48, paddingHorizontal: 20 },
  icon: { height: 40, width: 40, paddingHorizontal: 0 },
})

const variantStyles: Record<ButtonVariant, { container: object; labelColor: string }> = {
  default: {
    container: {
      backgroundColor: '#dd5025',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    labelColor: '#ffffff',
  },
  secondary: {
    container: { backgroundColor: '#4d71ed' },
    labelColor: '#ffffff',
  },
  outline: {
    container: {
      backgroundColor: '#ffffff',
      borderWidth: 1.5,
      borderColor: '#cccccc',
    },
    labelColor: '#202456',
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    labelColor: '#202456',
  },
  destructive: {
    container: { backgroundColor: '#dc2626' },
    labelColor: '#ffffff',
  },
}
