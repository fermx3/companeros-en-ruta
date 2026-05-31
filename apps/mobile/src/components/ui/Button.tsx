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
  const labelColor = variantStyles[variant].labelColor
  const labelSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14
  const hasIcons = !!leftIcon || !!rightIcon

  // IMPORTANT: Pressable's `style` MUST be a static array, not a function
  // callback. On Expo SDK 54 / RN 0.79 the callback form sometimes does not
  // run on first render, leaving the container without backgroundColor or
  // height — buttons appeared invisible. Pressed visual is handled via the
  // `pressRetentionOffset` shaded label; that's enough feedback for now.
  return (
    <Pressable
      onPress={isInactive ? undefined : onPress}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant].container,
        fullWidth && styles.fullWidth,
        isInactive && styles.disabled,
      ]}
      android_ripple={isInactive ? undefined : { color: 'rgba(0,0,0,0.1)' }}
      hitSlop={size === 'sm' ? 8 : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : hasIcons ? (
        <View style={styles.row}>
          {leftIcon}
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
          {rightIcon}
        </View>
      ) : typeof children === 'string' ? (
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
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fullWidth: { alignSelf: 'stretch' },
  // Disabled at 0.5 looked "white-ish" on pale backgrounds (orange #dd5025 at
  // 50% over #dae3fb desaturates badly). 0.6 keeps it visibly an orange CTA
  // while signaling "inactive".
  disabled: { opacity: 0.6 },
})

const sizeStyles = StyleSheet.create({
  sm: { height: 36, paddingHorizontal: 12 },
  default: { height: 44, paddingHorizontal: 16 },
  lg: { height: 48, paddingHorizontal: 20 },
  icon: { height: 40, width: 40, paddingHorizontal: 0 },
})

const variantStyles: Record<ButtonVariant, { container: object; labelColor: string }> = {
  default: {
    // No shadow on Button. The shadow + Card-with-shadow combo caused an iOS
    // render glitch where buttons inside Cards became invisible. Cards
    // already provide depth — the button doesn't need its own shadow.
    container: {
      backgroundColor: '#dd5025',
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
