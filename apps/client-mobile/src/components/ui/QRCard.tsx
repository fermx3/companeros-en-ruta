import { Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

interface QRCardProps {
  qrValue: string
  brandName?: string | null
  brandColor?: string | null
  discountLabel?: string | null
  expiresLabel?: string | null
  size?: number
}

export function QRCard({
  qrValue,
  brandName,
  brandColor,
  discountLabel,
  expiresLabel,
  size = 180,
}: QRCardProps) {
  // Fallback mirrors colors.primary.DEFAULT in tailwind.config.js. Brand color
  // takes precedence when present so each brand's QR feels owned by them.
  const accent = brandColor ?? '#dd5025'
  return (
    <View
      className="bg-card rounded-2xl p-4 border-2 items-center"
      style={{ borderColor: accent }}
    >
      {brandName ? (
        <Text className="text-sm font-bold mb-2" style={{ color: accent }}>
          {brandName}
        </Text>
      ) : null}
      <QRCode value={qrValue} size={size} backgroundColor="white" color={accent} />
      {discountLabel ? (
        <Text className="text-base font-bold mt-3 text-success">{discountLabel}</Text>
      ) : null}
      {expiresLabel ? (
        <Text className="text-xs text-muted-foreground mt-1">{expiresLabel}</Text>
      ) : null}
    </View>
  )
}
