import { forwardRef } from 'react'
import { StyleSheet, TextInput, type TextInputProps } from 'react-native'

interface InputProps extends TextInputProps {
  invalid?: boolean
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { invalid = false, style, placeholderTextColor, ...rest },
  ref
) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={placeholderTextColor ?? '#999999'}
      style={[styles.base, invalid && styles.invalid, style]}
      {...rest}
    />
  )
})

const styles = StyleSheet.create({
  base: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: '#202456',
  },
  invalid: { borderColor: '#dc2626' },
})
