import { Text, View } from 'react-native'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  hint?: string
  className?: string
}

export function MetricCard({ label, value, icon, hint, className }: MetricCardProps) {
  return (
    <View
      className={`bg-card rounded-xl p-4 ${className ?? ''}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(204,204,204,0.4)',
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {label}
        </Text>
        {icon}
      </View>
      <Text className="text-3xl font-black text-navy">{value}</Text>
      {hint ? <Text className="text-xs text-muted-foreground mt-1">{hint}</Text> : null}
    </View>
  )
}
