import { View, type ViewProps } from 'react-native'

interface CardProps extends ViewProps {
  className?: string
}

export function Card({ className, ...rest }: CardProps) {
  return (
    <View
      className={`bg-white rounded-2xl border border-gray-100 p-4 ${className ?? ''}`}
      {...rest}
    />
  )
}
