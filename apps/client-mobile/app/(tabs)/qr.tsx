import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { QRCard } from '@/components/ui/QRCard'
import {
  useClientPromotions,
  useMemberships,
} from '@/features/home/api'
import { useGenerateQR, useQRCodes } from '@/features/qr/api'

export default function QRTab() {
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
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <Pressable
            className={`flex-1 py-2 rounded-md items-center ${tab === 'active' ? 'bg-white shadow' : ''}`}
            onPress={() => setTab('active')}
          >
            <Text className={`text-xs font-medium ${tab === 'active' ? 'text-navy' : 'text-gray-500'}`}>
              Activos
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2 rounded-md items-center ${tab === 'used' ? 'bg-white shadow' : ''}`}
            onPress={() => setTab('used')}
          >
            <Text className={`text-xs font-medium ${tab === 'used' ? 'text-navy' : 'text-gray-500'}`}>
              Usados
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
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
          filtered.map(qr => (
            <View key={qr.id} className="mb-4">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-semibold text-navy">
                    {qr.promotion_name ?? 'Cupón'}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{qr.brand_name}</Text>
                </View>
                <BadgeStatus status={qr.status} />
              </View>
              <QRCard
                qrValue={qr.qr_code_string}
                brandName={qr.brand_name}
                brandColor={qr.brand_color_primary}
                discountLabel={qr.promotion_discount_display}
                expiresLabel={
                  qr.valid_until
                    ? `Vigente hasta ${new Date(qr.valid_until).toLocaleDateString('es-MX')}`
                    : null
                }
              />
            </View>
          ))
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
              try {
                await generate.mutateAsync({
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
            No hay promociones activas. Igual podés generar un cupón genérico de la marca.
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
                {p.discount_display && (
                  <Text className="text-sm font-bold text-success">{p.discount_display}</Text>
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
