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
  const accent = brandColor ?? '#1a4480'
  return (
    <View
      className="bg-white rounded-2xl p-4 border-2 items-center"
      style={{ borderColor: accent }}
    >
      {brandName && (
        <Text className="text-sm font-bold mb-2" style={{ color: accent }}>
          {brandName}
        </Text>
      )}
      <QRCode value={qrValue} size={size} backgroundColor="white" color={accent} />
      {discountLabel && (
        <Text className="text-base font-bold mt-3 text-success">{discountLabel}</Text>
      )}
      {expiresLabel && (
        <Text className="text-xs text-gray-500 mt-1">{expiresLabel}</Text>
      )}
    </View>
  )
}
