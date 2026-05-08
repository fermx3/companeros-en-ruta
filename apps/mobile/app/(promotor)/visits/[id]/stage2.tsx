import { useEffect, useMemo } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { CatalogPicker } from '@/components/wizard/CatalogPicker'
import { EvidenceUploader } from '@/components/wizard/EvidenceUploader'
import { SegmentedControl } from '@/components/wizard/SegmentedControl'
import { Toggle } from '@/components/wizard/Toggle'
import { WizardActionBar } from '@/components/wizard/WizardActionBar'
import { WizardStepper } from '@/components/wizard/WizardStepper'

import {
  useBrandProducts,
  useClientPromotions,
  useDeleteOrder,
  useSaveStage,
  useVisit,
  useVisitAssessment,
  useVisitOrders,
} from '@/features/visits/api'
import {
  serializeStage2,
  useVisitWizardSlice,
  useWizardStore,
} from '@/features/visits/wizardStore'
import type { InventoryItem, WhyNotBuying } from '@/features/visits/types'
import { makeStage2Schema } from '@/features/visits/wizardSchemas'

const WHY_OPTIONS: readonly { value: WhyNotBuying; label: string }[] = [
  { value: 'lack_of_budget', label: 'Sin presupuesto' },
  { value: 'low_turnover', label: 'Baja rotación' },
  { value: 'too_much_stock', label: 'Stock alto' },
  { value: 'price', label: 'Precio' },
  { value: 'other', label: 'Otro' },
]

export default function Stage2Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const visitId = id!
  const router = useRouter()

  const visitQuery = useVisit(visitId)
  const visit = visitQuery.data?.visit
  const brandId = visit?.brand?.id
  const clientId = visit?.client?.id
  const productsQuery = useBrandProducts(brandId)
  const promotionsQuery = useClientPromotions(clientId, brandId)
  const ordersQuery = useVisitOrders(visitId)
  const assessmentQuery = useVisitAssessment(visitId)
  const saveStage = useSaveStage(visitId)
  const deleteOrder = useDeleteOrder(visitId)

  const slice = useVisitWizardSlice(visitId)
  const hydrate = useWizardStore(s => s.hydrate)
  const patchStage2 = useWizardStore(s => s.patchStage2)
  const markCompleted = useWizardStore(s => s.markCompleted)

  useEffect(() => {
    if (!slice.hydrated && assessmentQuery.data) {
      hydrate(visitId, assessmentQuery.data)
    }
  }, [slice.hydrated, assessmentQuery.data, hydrate, visitId])

  const orders = ordersQuery.data?.orders ?? []
  const promotions = promotionsQuery.data?.promotions ?? []
  const products = useMemo(() => productsQuery.data?.products ?? [], [productsQuery.data])

  const productOptions = useMemo(
    () =>
      products.flatMap(p => {
        if (p.product_variants && p.product_variants.length > 0) {
          return p.product_variants.map(v => ({
            id: `${p.id}:${v.id}`,
            label: `${p.name} — ${v.variant_name}`,
            sublabel: v.size_value ? `${v.size_value}${v.size_unit ?? ''}` : null,
          }))
        }
        return [{ id: p.id, label: p.name, sublabel: p.sku ?? null }]
      }),
    [products]
  )

  function addInventoryItem() {
    patchStage2(visitId, {
      inventoryItems: [
        ...slice.stage2.inventoryItems,
        { product_id: '', current_stock: 0, notes: null },
      ],
    })
  }

  function updateInventoryItem(index: number, patch: Partial<InventoryItem>) {
    patchStage2(visitId, {
      inventoryItems: slice.stage2.inventoryItems.map((it, i) =>
        i === index ? { ...it, ...patch } : it
      ),
    })
  }

  function removeInventoryItem(index: number) {
    patchStage2(visitId, {
      inventoryItems: slice.stage2.inventoryItems.filter((_, i) => i !== index),
    })
  }

  async function onConfirmDeleteOrder(orderId: string, orderNumber: string | null) {
    Alert.alert(
      'Eliminar pedido',
      `¿Eliminar ${orderNumber ?? 'este pedido'}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrder.mutateAsync(orderId)
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo eliminar')
            }
          },
        },
      ]
    )
  }

  async function onNext() {
    const schema = makeStage2Schema(orders.length)
    const parsed = schema.safeParse({
      hasInventory: slice.stage2.hasInventory,
      hasPurchaseOrder: slice.stage2.hasPurchaseOrder,
      purchaseOrderNumber: slice.stage2.purchaseOrderNumber ?? null,
      whyNotBuying: slice.stage2.whyNotBuying ?? null,
      purchaseInventoryNotes: slice.stage2.purchaseInventoryNotes ?? null,
      inventoryItems: slice.stage2.inventoryItems.filter(it => it.product_id),
      orderId: slice.stage2.orderId ?? null,
    })
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const where = issue?.path?.length ? ` (${issue.path.join('.')})` : ''
      Alert.alert('Faltan datos', `${issue?.message ?? 'Revisa el formulario.'}${where}`)
      return
    }
    try {
      await saveStage.mutateAsync(serializeStage2(slice))
      markCompleted(visitId, 2)
      router.push(`/(promotor)/visits/${visitId}/stage3`)
    } catch (e) {
      Alert.alert('Error al guardar', e instanceof Error ? e.message : '')
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <WizardStepper
        current={2}
        completed={slice.completedStages}
        onJumpTo={stage =>
          router.push(`/(promotor)/visits/${visitId}/stage${stage}` as never)
        }
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {/* Active client promotions */}
        <Text className="text-sm font-semibold text-navy mb-2">Promociones activas del cliente</Text>
        {promotionsQuery.isLoading ? (
          <Text className="text-sm text-gray-500 mb-4">Cargando promociones…</Text>
        ) : promotions.length === 0 ? (
          <Text className="text-sm text-gray-500 mb-4">Sin promociones activas para esta marca.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {promotions.map(p => (
              <View key={p.id} className="bg-white rounded-lg p-3 mr-2 w-64 border border-gray-200">
                <Text className="text-sm font-medium text-navy" numberOfLines={1}>{p.name}</Text>
                {p.discount_display && (
                  <Text className="text-xs text-success font-semibold mt-1">{p.discount_display}</Text>
                )}
                {p.description && (
                  <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>{p.description}</Text>
                )}
                {p.valid_until && (
                  <Text className="text-[10px] text-gray-400 mt-2">
                    Vigente hasta {new Date(p.valid_until).toLocaleDateString('es-MX')}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Purchase order section */}
        <Text className="text-sm font-semibold text-navy mb-2">¿Hay orden de compra hoy?</Text>
        <View className="bg-white rounded-lg p-3 mb-4">
          <Toggle
            label="Sí, hay pedido de compra"
            value={slice.stage2.hasPurchaseOrder}
            onValueChange={v =>
              patchStage2(visitId, {
                hasPurchaseOrder: v,
                whyNotBuying: v ? null : slice.stage2.whyNotBuying,
              })
            }
          />
          {slice.stage2.hasPurchaseOrder && (
            <View className="mt-2">
              <Text className="text-xs text-gray-500 mb-1">Número de pedido (opcional)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="ej. PO-12345"
                placeholderTextColor="#9ca3af"
                value={slice.stage2.purchaseOrderNumber ?? ''}
                onChangeText={v => patchStage2(visitId, { purchaseOrderNumber: v || null })}
              />
            </View>
          )}
          {!slice.stage2.hasPurchaseOrder && orders.length === 0 && (
            <View className="mt-2">
              <SegmentedControl
                label="Motivo (requerido)"
                value={slice.stage2.whyNotBuying ?? null}
                options={WHY_OPTIONS}
                onChange={v => patchStage2(visitId, { whyNotBuying: v })}
              />
            </View>
          )}
        </View>

        {/* Orders */}
        <Text className="text-sm font-semibold text-navy mb-2">Pedidos creados en esta visita</Text>
        <View className="bg-white rounded-lg p-3 mb-4">
          {ordersQuery.isLoading ? (
            <Text className="text-sm text-gray-500">Cargando pedidos…</Text>
          ) : orders.length === 0 ? (
            <Text className="text-sm text-gray-500 mb-2">Sin pedidos registrados.</Text>
          ) : (
            orders.map(o => (
              <View
                key={o.id}
                className="border border-gray-200 rounded-lg p-3 mb-2"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-medium text-navy">
                      {o.order_number ?? 'Pedido'}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {o.distributor_name ?? '—'} · {o.items.length} items · ${Number(o.total_amount).toFixed(2)}
                    </Text>
                    <Text className="text-[10px] text-gray-400 mt-0.5">
                      {o.payment_method ?? 'efectivo'} · {o.order_status}
                    </Text>
                  </View>
                  <Pressable onPress={() => onConfirmDeleteOrder(o.id, o.order_number)}>
                    <Text className="text-xs text-destructive font-semibold">Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
          <Pressable
            className="h-11 rounded-full border border-secondary items-center justify-center mt-2"
            onPress={() => router.push(`/(promotor)/visits/${visitId}/order` as never)}
          >
            <Text className="text-sm text-gray-700 font-medium">+ Crear pedido</Text>
          </Pressable>
        </View>

        {/* Inventory */}
        <Text className="text-sm font-semibold text-navy mb-2">Inventario</Text>
        <View className="bg-white rounded-lg p-3 mb-4">
          <Toggle
            label="Capturar inventario"
            value={slice.stage2.hasInventory}
            onValueChange={v => patchStage2(visitId, { hasInventory: v })}
          />
          {slice.stage2.hasInventory && (
            <View className="mt-2">
              {slice.stage2.inventoryItems.length === 0 ? (
                <Text className="text-xs text-gray-500 mb-2">Sin items todavía.</Text>
              ) : (
                slice.stage2.inventoryItems.map((item, i) => (
                  <View key={i} className="border border-gray-200 rounded-lg p-3 mb-2">
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="text-xs text-gray-500 flex-1">Item {i + 1}</Text>
                      <Pressable onPress={() => removeInventoryItem(i)}>
                        <Text className="text-xs text-destructive font-semibold">Quitar</Text>
                      </Pressable>
                    </View>
                    <CatalogPicker
                      title="Producto"
                      items={productOptions}
                      selectedId={item.product_id || null}
                      onSelect={p => updateInventoryItem(i, { product_id: p.id })}
                      triggerLabel="Seleccionar producto"
                    />
                    <View className="mt-2">
                      <Text className="text-xs text-gray-500 mb-1">Stock actual</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                        value={item.current_stock?.toString() ?? '0'}
                        onChangeText={v =>
                          updateInventoryItem(i, { current_stock: v ? parseInt(v, 10) : 0 })
                        }
                      />
                    </View>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2"
                      placeholder="Notas (opcional)"
                      placeholderTextColor="#9ca3af"
                      value={item.notes ?? ''}
                      onChangeText={v => updateInventoryItem(i, { notes: v || null })}
                    />
                  </View>
                ))
              )}
              <Pressable
                className="h-10 rounded-full border border-secondary items-center justify-center mt-1"
                onPress={addInventoryItem}
              >
                <Text className="text-sm text-gray-700 font-medium">+ Agregar item</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Notes */}
        <Text className="text-sm font-semibold text-navy mb-2">Notas</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[80px] mb-4"
          placeholder="Observaciones sobre la compra y el inventario…"
          placeholderTextColor="#9ca3af"
          multiline
          value={slice.stage2.purchaseInventoryNotes ?? ''}
          onChangeText={v => patchStage2(visitId, { purchaseInventoryNotes: v || null })}
        />

        {/* Evidence */}
        <View className="bg-white rounded-lg p-3 mb-4">
          <EvidenceUploader visitId={visitId} stage="inventory" max={5} />
        </View>
      </ScrollView>

      <WizardActionBar
        onPrevious={() => router.back()}
        onNext={onNext}
        nextLabel="Siguiente"
        loading={saveStage.isPending}
      />
    </View>
  )
}
