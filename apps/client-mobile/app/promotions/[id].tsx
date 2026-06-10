import { useMemo } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProfileAvatarButton } from '@/components/ui/ProfileAvatarButton'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import {
  promotionDiscountLabel,
  useClientPromotions,
  useMemberships,
} from '@/features/home/api'
import { useClientProfile } from '@/features/profile/api'
import { useGenerateQR, useQRCodes } from '@/features/qr/api'

export default function PromotionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const promotionsQuery = useClientPromotions()
  const membershipsQuery = useMemberships()
  const profileQuery = useClientProfile()
  const qrQuery = useQRCodes()
  const generate = useGenerateQR()

  const promotion = useMemo(
    () => promotionsQuery.data?.promotions.find(p => p.id === id) ?? null,
    [promotionsQuery.data, id]
  )

  const activeMemberships =
    membershipsQuery.data?.memberships.filter(m => m.membership_status === 'active') ?? []
  const hasMembership = !!promotion && activeMemberships.some(m => m.brand_id === promotion.brand?.id)

  const existingActiveQR = useMemo(
    () =>
      promotion
        ? qrQuery.data?.qr_codes.find(
            qr => qr.promotion?.id === promotion.id && qr.status === 'active'
          ) ?? null
        : null,
    [qrQuery.data, promotion]
  )

  async function onGenerate() {
    const clientId = profileQuery.data?.id
    if (!clientId || !promotion || !promotion.brand?.id) {
      Alert.alert('Espera un momento', 'Cargando datos del perfil. Intenta de nuevo.')
      return
    }
    try {
      const res = await generate.mutateAsync({
        client_id: clientId,
        brand_id: promotion.brand.id,
        promotion_id: promotion.id,
      })
      router.replace(`/qr/${res.qr_code.id}` as never)
    } catch (e) {
      Alert.alert('Error al generar', e instanceof Error ? e.message : '')
    }
  }

  function onJoinBrand() {
    router.push('/(tabs)/brands' as never)
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title="Promoción" showBack right={<ProfileAvatarButton />} />
      <ScrollView contentContainerClassName="p-4 pb-8">
        {promotionsQuery.isLoading ? (
          <Card>
            <ActivityIndicator />
          </Card>
        ) : !promotion ? (
          <Card>
            <Text className="text-sm text-muted-foreground">
              Esta promoción ya no está disponible o no aplica para ti.
            </Text>
          </Card>
        ) : (
          <>
            <Card className="mb-3">
              <View className="flex-row items-center mb-3">
                <BrandLogo
                  logoUrl={promotion.brand?.logo_url ?? null}
                  name={promotion.brand?.name ?? 'Marca'}
                  size={48}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {promotion.brand?.name ?? 'Marca'}
                  </Text>
                  <Text className="text-base font-bold text-navy" numberOfLines={2}>
                    {promotion.name}
                  </Text>
                </View>
              </View>

              {promotionDiscountLabel(promotion) && (
                <Text className="text-2xl font-black text-success mb-2">
                  {promotionDiscountLabel(promotion)}
                </Text>
              )}

              {promotion.description && (
                <Text className="text-sm text-navy mt-1">{promotion.description}</Text>
              )}

              {promotion.end_date && (
                <Text className="text-xs text-muted-foreground mt-3">
                  Vigente hasta{' '}
                  {new Date(promotion.end_date).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              )}

              {promotion.terms_and_conditions && (
                <View
                  className="mt-3 pt-3"
                  style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}
                >
                  <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
                    Términos
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {promotion.terms_and_conditions}
                  </Text>
                </View>
              )}
            </Card>

            {!hasMembership ? (
              <>
                <Card className="mb-3">
                  <Text className="text-sm text-navy">
                    Para canjear esta promoción primero necesitas unirte a {promotion.brand?.name ?? 'la marca'}.
                  </Text>
                </Card>
                <Button onPress={onJoinBrand} variant="default" size="lg" fullWidth>
                  Unirme a la marca
                </Button>
              </>
            ) : existingActiveQR ? (
              <>
                <Card className="mb-3">
                  <Text className="text-sm text-navy">
                    Ya tienes un cupón activo para esta promoción.
                  </Text>
                </Card>
                <Button
                  onPress={() => router.push(`/qr/${existingActiveQR.id}` as never)}
                  variant="default"
                  size="lg"
                  fullWidth
                >
                  Ver mi cupón
                </Button>
              </>
            ) : (
              <Button
                onPress={onGenerate}
                variant="default"
                size="lg"
                fullWidth
                loading={generate.isPending}
              >
                Obtener mi cupón
              </Button>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
