import { Text, View } from 'react-native'

type Size = 'sm' | 'md' | 'lg'

// Status map mirrors apps/web/src/components/ui/status-badge.tsx. Labels in
// español uppercase as in the web. Unknown statuses fall back to the raw key.
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-success-bg', text: 'text-success', label: 'ACTIVA' },
  inactive: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'INACTIVA' },
  suspended: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'SUSPENDIDA' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'PENDIENTE' },
  draft: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'BORRADOR' },
  submitted: { bg: 'bg-blue-100', text: 'text-secondary', label: 'ENVIADO' },
  confirmed: { bg: 'bg-blue-100', text: 'text-secondary', label: 'CONFIRMADO' },
  processing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'EN PROCESO' },
  shipped: { bg: 'bg-blue-100', text: 'text-secondary', label: 'EN CAMINO' },
  delivered: { bg: 'bg-success-bg', text: 'text-success', label: 'ENTREGADO' },
  completed: { bg: 'bg-success-bg', text: 'text-success', label: 'COMPLETADO' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'CANCELADO' },
  expired: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'EXPIRADO' },
  // USADO is a positive outcome (the asesor actually scanned the coupon and
  // the discount was applied) — render in green with a ✓ to distinguish from
  // EXPIRADO (timed out, never used).
  used: { bg: 'bg-success-bg', text: 'text-success', label: '✓ USADO' },
  // redeem_qr_code() flips status to 'fully_redeemed' when redemption_count
  // hits max_redemptions. For client-issued single-use coupons that fires on
  // the first scan — treat it as "USADO" in the UI.
  fully_redeemed: { bg: 'bg-success-bg', text: 'text-success', label: '✓ USADO' },
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
}

const TEXT_SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
}

interface BadgeStatusProps {
  status: string
  label?: string
  size?: Size
}

export function BadgeStatus({ status, label, size = 'md' }: BadgeStatusProps) {
  const style = STATUS_STYLES[status] ?? {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    label: status.toUpperCase(),
  }
  return (
    <View className={`self-start rounded-full ${style.bg} ${SIZE_CLASSES[size]}`}>
      <Text className={`${TEXT_SIZE_CLASSES[size]} font-bold tracking-wider ${style.text}`}>
        {label ?? style.label}
      </Text>
    </View>
  )
}
