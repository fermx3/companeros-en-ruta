import { Text, View } from 'react-native'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-success-bg', text: 'text-success', label: 'Activa' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  suspended: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Suspendida' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Enviada' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmada' },
  processing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En proceso' },
  delivered: { bg: 'bg-success-bg', text: 'text-success', label: 'Entregada' },
}

interface BadgeStatusProps {
  status: string
  label?: string
}

export function BadgeStatus({ status, label }: BadgeStatusProps) {
  const style = STATUS_STYLES[status] ?? { bg: 'bg-gray-100', text: 'text-gray-700', label: status }
  return (
    <View className={`px-3 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-medium ${style.text}`}>
        {label ?? style.label}
      </Text>
    </View>
  )
}
