import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
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
        'Necesitás al menos una membresía activa para generar cupones. Ve a la pestaña Marcas.'
      )
      return
    }
    setSelectedBrandId(activeMemberships[0].brand_id)
    setGeneratorOpen(true)
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tabs use StyleSheet (no NativeWind className) — the className wrapper
        around Pressable inside a tight container can crash with
        MISSING_CONTEXT_ERROR on the re-render that follows a tap, same
        symptom we hit on the promotor wizard's SegmentedControl. */}
      <View style={tabStyles.header}>
        <View style={tabStyles.track}>
          {(['active', 'used'] as const).map(opt => {
            const selected = tab === opt
            return (
              <Pressable
                key={opt}
                style={[tabStyles.option, selected && tabStyles.optionSelected]}
                onPress={() => setTab(opt)}
              >
                <Text
                  style={[tabStyles.optionLabel, selected && tabStyles.optionLabelSelected]}
                >
                  {opt === 'active' ? 'Activos' : 'Usados'}
                </Text>
              </Pressable>
            )
          })}
        </View>
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
                ? 'Generá un cupón con el botón de abajo y mostralo en tu tienda cuando llegue tu promotor.'
                : 'Cuando tu promotor escanee uno de tus cupones, aparecerá aquí.'
            }
          />
        ) : (
          filtered.map(qr => <QRListCard key={qr.id} qr={qr} />)
        )}
      </ScrollView>

      {tab === 'active' && (
        <View className="px-4 py-3 bg-white border-t border-gray-200">
          <Pressable
            className="h-12 rounded-full bg-primary-light items-center justify-center"
            onPress={openGenerator}
          >
            <Text className="text-white font-bold">+ Generar cupón</Text>
          </Pressable>
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
                Alert.alert('Cargando perfil', 'Esperá un momento e intentá de nuevo.')
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
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {brandName}
            </Text>
          </View>
        </View>
        <BadgeStatus status={qr.status} />
      </View>

      {discount && (
        <Text className="text-lg font-bold mt-1 mb-2 text-success">{discount}</Text>
      )}

      <View className="border-t border-gray-100 pt-2">
        {qr.valid_until && (
          <Text className="text-xs text-gray-500">
            Vigente hasta{' '}
            {new Date(qr.valid_until).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        )}
        <Text className="text-xs text-gray-400 mt-0.5">Código {qr.code}</Text>
      </View>

      {qr.status === 'active' && (
        <Pressable
          className="mt-3 h-10 rounded-full items-center justify-center bg-primary-light"
          onPress={() => router.push(`/qr/${qr.id}` as never)}
        >
          <Text className="text-white font-semibold text-sm">Ver QR</Text>
        </Pressable>
      )}
    </Card>
  )
}

const tabStyles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  track: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  optionLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  optionLabelSelected: { color: '#0f2444' },
})

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
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Text className="text-base font-bold text-navy">Generar cupón</Text>
        <Pressable onPress={onClose} className="p-2">
          <Text className="text-primary-light font-semibold">Cerrar</Text>
        </Pressable>
      </View>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {activeMemberships.length > 1 && (
          <>
            <Text className="text-sm font-semibold text-navy mb-2">Marca</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {activeMemberships.map(m => {
                const selected = m.brand_id === brandId
                return (
                  <Pressable
                    key={m.brand_id}
                    className={`px-3 py-2 rounded-full border ${selected ? 'bg-primary-light border-primary-light' : 'bg-white border-secondary'}`}
                    onPress={() => onChangeBrand(m.brand_id)}
                  >
                    <Text className={`text-xs font-medium ${selected ? 'text-white' : 'text-gray-700'}`}>
                      {m.brand_name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </>
        )}

        <Text className="text-sm font-semibold text-navy mb-2">Promoción (opcional)</Text>
        {promotionsQuery.isLoading ? (
          <ActivityIndicator />
        ) : promotions.length === 0 ? (
          <Text className="text-sm text-gray-500 mb-2">
            No hay promociones activas. Puedes generar un cupón genérico de la marca.
          </Text>
        ) : (
          promotions.map(p => {
            const selected = p.id === selectedPromotionId
            return (
              <Pressable
                key={p.id}
                className={`border rounded-lg p-3 mb-2 ${selected ? 'border-primary-light bg-blue-50' : 'border-gray-200 bg-white'}`}
                onPress={() => setSelectedPromotionId(selected ? null : p.id)}
              >
                <View className="flex-row items-center mb-1">
                  <BrandLogo logoUrl={null} name={p.name} size={24} />
                  <Text className="text-sm font-semibold text-navy ml-2 flex-1" numberOfLines={1}>
                    {p.name}
                  </Text>
                </View>
                {promotionDiscountLabel(p) && (
                  <Text className="text-sm font-bold text-success">{promotionDiscountLabel(p)}</Text>
                )}
                {p.description && (
                  <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>{p.description}</Text>
                )}
              </Pressable>
            )
          })
        )}
      </ScrollView>
      <View className="px-4 py-3 border-t border-gray-200">
        <Pressable
          className="h-12 rounded-full bg-primary-light items-center justify-center disabled:opacity-50"
          onPress={() => onGenerate(selectedPromotionId)}
          disabled={pending}
        >
          {pending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Generar cupón</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}
