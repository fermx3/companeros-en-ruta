import { View, type ViewProps } from 'react-native'

interface CardProps extends ViewProps {
  className?: string
}

// Default padding p-4 to fit the dense mobile screens. Override with className
// (e.g., `p-6`) when you want the web's roomier feel.
export function Card({ className, style, ...rest }: CardProps) {
  return (
    <View
      className={`bg-card rounded-2xl p-4 ${className ?? ''}`}
      style={[
        {
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
          borderWidth: 1,
          borderColor: 'rgba(204,204,204,0.4)',
        },
        style,
      ]}
      {...rest}
    />
  )
}
