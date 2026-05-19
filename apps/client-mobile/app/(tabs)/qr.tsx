import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FilterChip } from '@/components/ui/FilterChip'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import {
  promotionDiscountLabel,
  useClientPromotions,
  useMemberships,
} from '@/features/home/api'
import { discountLabel, useGenerateQR, useQRCodes, type QRCode } from '@/features/qr/api'
import { useClientProfile } from '@/features/profile/api'

export default function QRTab() {
  const profileQuery = useClientProfile()
  const membershipsQuery = useMemberships()
  const qrQuery = useQRCodes()
  const generate = useGenerateQR()

  const activeMemberships = useMemo(
    () =>
      (membershipsQuery.data?.memberships ?? []).filter(m => m.membership_status === 'active'),
    [membershipsQuery.data]
  )

  const [tab, setTab] = useState<'active' | 'used'>('active')
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)

  const qrCodes = qrQuery.data?.qr_codes ?? []
  const filtered = qrCodes.filter(qr =>
    tab === 'active' ? qr.status === 'active' : qr.status === 'used'
  )

  function openGenerator() {
    if (activeMemberships.length === 0) {
      Alert.alert(
        'Sin marcas activas',
        'Necesitas al menos una membresía activa para generar cupones. Ve a la pestaña Marcas.'
      )
      return
    }
    setSelectedBrandId(activeMemberships[0].brand_id)
    setGeneratorOpen(true)
  }

  return (
    <View className="flex-1 bg-app-bg">
      <View className="bg-card px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}>
        <SegmentedControl
          options={[
            { value: 'active', label: 'Activos' },
            { value: 'used', label: 'Usados' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={qrQuery.isRefetching} onRefresh={qrQuery.refetch} />
        }
      >
        {qrQuery.isLoading ? (
          <Card>
            <ActivityIndicator />
          </Card>
        ) : filtered.length === 0 ? (
          <ListEmptyState
            title={tab === 'active' ? 'Sin cupones activos' : 'Sin cupones usados todavía'}
            body={
              tab === 'active'
                ? 'Genera un cupón con el botón de abajo y muéstralo en tu tienda cuando llegue tu promotor.'
                : 'Cuando tu promotor escanee uno de tus cupones, aparecerá aquí.'
            }
          />
        ) : (
          filtered.map(qr => <QRListCard key={qr.id} qr={qr} />)
        )}
      </ScrollView>

      {tab === 'active' && (
        <View
          className="px-4 py-3 bg-card"
          style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}
        >
          <Button onPress={openGenerator} variant="default" size="lg" fullWidth>
            + Generar cupón
          </Button>
        </View>
      )}

      {generatorOpen && selectedBrandId && (
        <Modal
          visible
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setGeneratorOpen(false)}
        >
          <GeneratorSheet
            brandId={selectedBrandId}
            onChangeBrand={setSelectedBrandId}
            activeMemberships={activeMemberships}
            onClose={() => setGeneratorOpen(false)}
            onGenerate={async promotionId => {
              const clientId = profileQuery.data?.id
              if (!clientId) {
                Alert.alert('Cargando perfil', 'Espera un momento e inténtalo de nuevo.')
                return
              }
              try {
                await generate.mutateAsync({
                  client_id: clientId,
                  brand_id: selectedBrandId,
                  promotion_id: promotionId,
                })
                setGeneratorOpen(false)
              } catch (e) {
                Alert.alert('Error al generar', e instanceof Error ? e.message : '')
              }
            }}
            pending={generate.isPending}
          />
        </Modal>
      )}
    </View>
  )
}

function QRListCard({ qr }: { qr: QRCode }) {
  const brandName = qr.brand?.name ?? 'Marca'
  const promotionName = qr.promotion?.name ?? 'Cupón sin promoción específica'
  const discount = discountLabel(qr)
  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1 pr-2">
          <BrandLogo logoUrl={qr.brand?.logo_url ?? null} name={brandName} size={32} />
          <View className="ml-2 flex-1">
            <Text className="text-sm font-bold text-navy" numberOfLines={1}>
              {promotionName}
            </Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {brandName}
            </Text>
          </View>
        </View>
        <BadgeStatus status={qr.status} />
      </View>

      {discount && (
        <Text className="text-lg font-bold mt-1 mb-2 text-success">{discount}</Text>
      )}

      <View className="pt-2" style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}>
        {qr.valid_until && (
          <Text className="text-xs text-muted-foreground">
            Vigente hasta{' '}
            {new Date(qr.valid_until).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        )}
        <Text className="text-xs text-muted-foreground mt-0.5">Código {qr.code}</Text>
      </View>

      {qr.status === 'active' && (
        <View className="mt-3">
          <Button
            onPress={() => router.push(`/qr/${qr.id}` as never)}
            variant="default"
            size="default"
            fullWidth
          >
            Ver QR
          </Button>
        </View>
      )}
    </Card>
  )
}

interface GeneratorSheetProps {
  brandId: string
  activeMemberships: { brand_id: string; brand_name: string; brand_logo_url: string | null }[]
  onChangeBrand: (id: string) => void
  onClose: () => void
  onGenerate: (promotionId: string | null) => void | Promise<void>
  pending: boolean
}

function GeneratorSheet({
  brandId,
  activeMemberships,
  onChangeBrand,
  onClose,
  onGenerate,
  pending,
}: GeneratorSheetProps) {
  const promotionsQuery = useClientPromotions(brandId)
  const promotions = promotionsQuery.data?.promotions ?? []
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null)

  return (
    <View className="flex-1 bg-card">
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
      >
        <Text className="text-base font-bold text-navy">Generar cupón</Text>
        <Button onPress={onClose} variant="ghost" size="sm">
          Cerrar
        </Button>
      </View>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {activeMemberships.length > 1 && (
          <>
            <Text className="text-sm font-bold text-navy mb-2">Marca</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {activeMemberships.map(m => (
                <FilterChip
                  key={m.brand_id}
                  label={m.brand_name}
                  selected={m.brand_id === brandId}
                  onPress={() => onChangeBrand(m.brand_id)}
                />
              ))}
            </View>
          </>
        )}

        <Text className="text-sm font-bold text-navy mb-2">Promoción (opcional)</Text>
        {promotionsQuery.isLoading ? (
          <ActivityIndicator />
        ) : promotions.length === 0 ? (
          <Text className="text-sm text-muted-foreground mb-2">
            No hay promociones activas. Puedes generar un cupón genérico de la marca.
          </Text>
        ) : (
          promotions.map(p => {
            const selected = p.id === selectedPromotionId
            return (
              <Pressable
                key={p.id}
                style={{
                  borderWidth: 1,
                  borderColor: selected ? '#4d71ed' : 'rgba(204,204,204,0.6)',
                  backgroundColor: selected ? 'rgba(77,113,237,0.08)' : '#ffffff',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                }}
                onPress={() => setSelectedPromotionId(selected ? null : p.id)}
              >
                <View className="flex-row items-center mb-1">
                  <BrandLogo logoUrl={null} name={p.name} size={24} />
                  <Text className="text-sm font-bold text-navy ml-2 flex-1" numberOfLines={1}>
                    {p.name}
                  </Text>
                </View>
                {promotionDiscountLabel(p) && (
                  <Text className="text-sm font-bold text-success">{promotionDiscountLabel(p)}</Text>
                )}
                {p.description && (
                  <Text className="text-xs text-muted-foreground mt-1" numberOfLines={2}>{p.description}</Text>
                )}
              </Pressable>
            )
          })
        )}
      </ScrollView>
      <View
        className="px-4 py-3"
        style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}
      >
        <Button
          onPress={() => onGenerate(selectedPromotionId)}
          variant="default"
          size="lg"
          fullWidth
          loading={pending}
        >
          Generar cupón
        </Button>
      </View>
    </View>
  )
}
