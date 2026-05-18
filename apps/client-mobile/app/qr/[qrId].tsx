import { Pressable, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import QRCode from 'react-native-qrcode-svg'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { Card } from '@/components/ui/Card'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { discountLabel, useQRCodes } from '@/features/qr/api'

function formatDate(iso: string | null | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function QRDetailScreen() {
  const { qrId } = useLocalSearchParams<{ qrId: string }>()
  const qrQuery = useQRCodes()
  const qr = qrQuery.data?.qr_codes.find(q => q.id === qrId)

  if (!qr) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <ScreenHeader title="Cupón" showBack />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-gray-500">No encontramos este cupón.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const brandName = qr.brand?.name ?? 'Marca'
  const promotionName = qr.promotion?.name ?? 'Cupón sin promoción específica'
  const discount = discountLabel(qr)

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader title={promotionName} showBack />
      <ScrollView contentContainerClassName="p-4 pb-8 items-center">
        {/* Big QR — what the promotor scans */}
        <View className="bg-white rounded-2xl p-6 items-center w-full mb-4 border-2 border-primary-light">
          <QRCode value={qr.code} size={260} backgroundColor="white" color="#1a4480" />
          <Text className="text-xs text-gray-500 mt-3" numberOfLines={1}>
            {qr.code}
          </Text>
        </View>

        {/* Info card */}
        <Card className="w-full mb-3">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 pr-2">
              <Text className="text-base font-bold text-navy">{promotionName}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{brandName}</Text>
            </View>
            <BadgeStatus status={qr.status} />
          </View>

          {discount && (
            <Text className="text-2xl font-bold text-success my-2">{discount}</Text>
          )}

          <View className="border-t border-gray-100 mt-2 pt-2">
            {qr.valid_until && (
              <Text className="text-xs text-gray-600">
                <Text className="text-gray-500">Vigente hasta: </Text>
                {formatDate(qr.valid_until)}
              </Text>
            )}
            <Text className="text-xs text-gray-600 mt-0.5">
              <Text className="text-gray-500">Generado: </Text>
              {formatDate(qr.created_at)}
            </Text>
            {(qr.max_redemptions ?? 1) > 1 && (
              <Text className="text-xs text-gray-600 mt-0.5">
                <Text className="text-gray-500">Canjes: </Text>
                {qr.redemption_count ?? 0} / {qr.max_redemptions}
              </Text>
            )}
            <Text className="text-xs text-gray-600 mt-0.5">
              <Text className="text-gray-500">Código: </Text>
              {qr.code}
            </Text>
          </View>
        </Card>

        {/* Instructions */}
        {qr.status === 'active' && (
          <View className="bg-blue-50 rounded-xl p-3 w-full">
            <Text className="text-xs text-navy text-center">
              Mostrale esta pantalla al promotor para que escanee el código.
              No necesitás conexión a internet en este momento.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
