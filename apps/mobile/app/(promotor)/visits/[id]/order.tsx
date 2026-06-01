import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { CatalogPicker } from '@/components/wizard/CatalogPicker'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { WizardActionBar } from '@/components/wizard/WizardActionBar'

import {
  useBrandProducts,
  useCreateOrder,
  useDistributors,
  useVisit,
} from '@/features/visits/api'
import type { OrderPaymentMethod } from '@/features/visits/types'
import { orderSchema } from '@/features/visits/wizardSchemas'

const PAYMENT_OPTIONS: readonly { value: OrderPaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'credit', label: 'Crédito' },
  { value: 'check', label: 'Cheque' },
  { value: 'card', label: 'Tarjeta' },
]

interface CartItem {
  productOptionId: string
  productLabel: string
  product_id: string
  product_variant_id: string | null
  quantity: number
  unit_price: number
}

export default function OrderModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const visitId = id!
  const router = useRouter()

  const visitQuery = useVisit(visitId)
  const brandId = visitQuery.data?.visit.brand?.id
  const distributorsQuery = useDistributors(brandId)
  const productsQuery = useBrandProducts(brandId)
  const createOrder = useCreateOrder(visitId)

  const [distributorId, setDistributorId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('cash')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<CartItem[]>([])

  const distributors = distributorsQuery.data?.distributors ?? []
  const products = useMemo(() => productsQuery.data?.products ?? [], [productsQuery.data])

  interface ProductOption {
    id: string
    label: string
    sublabel: string | null
    product_id: string
    product_variant_id: string | null
    suggested_price: number | null
  }

  const productOptions = useMemo<ProductOption[]>(
    () =>
      products.flatMap<ProductOption>(p => {
        if (p.product_variants && p.product_variants.length > 0) {
          return p.product_variants.map(v => ({
            id: `${p.id}:${v.id}`,
            label: `${p.name} — ${v.variant_name}`,
            sublabel: v.size_value ? `${v.size_value}${v.size_unit ?? ''}` : null,
            product_id: p.id,
            product_variant_id: v.id,
            suggested_price: v.suggested_price,
          }))
        }
        return [
          {
            id: p.id,
            label: p.name,
            sublabel: p.sku ?? null,
            product_id: p.id,
            product_variant_id: null,
            suggested_price: p.base_price,
          },
        ]
      }),
    [products]
  )

  const distributorOptions = distributors.map(d => ({
    id: d.id,
    label: d.name,
    sublabel: d.contact_name,
  }))

  const total = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0)

  function addItem(option: { id: string }) {
    const found = productOptions.find(p => p.id === option.id)
    if (!found) return
    if (items.some(it => it.productOptionId === found.id)) {
      Alert.alert('Ya está', 'Ese producto ya está en el pedido. Edita la cantidad o el precio.')
      return
    }
    setItems(prev => [
      ...prev,
      {
        productOptionId: found.id,
        productLabel: found.label,
        product_id: found.product_id,
        product_variant_id: found.product_variant_id,
        quantity: 1,
        unit_price: found.suggested_price ?? 0,
      },
    ])
  }

  function updateItem(idx: number, patch: Partial<CartItem>) {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  async function onSubmit() {
    if (!distributorId) {
      Alert.alert('Falta distribuidor', 'Selecciona un distribuidor para el pedido.')
      return
    }
    if (items.length === 0) {
      Alert.alert('Sin items', 'Agrega al menos un producto al pedido.')
      return
    }
    const body = {
      distributor_id: distributorId,
      payment_method: paymentMethod,
      order_notes: notes || null,
      items: items.map(it => ({
        product_id: it.product_id,
        product_variant_id: it.product_variant_id ?? null,
        quantity: it.quantity,
        unit_price: it.unit_price,
      })),
    }
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const where = issue?.path?.length ? ` (${issue.path.join('.')})` : ''
      Alert.alert('Datos inválidos', `${issue?.message ?? ''}${where}`)
      return
    }
    try {
      await createOrder.mutateAsync(body)
      router.back()
    } catch (e) {
      Alert.alert('Error al crear el pedido', e instanceof Error ? e.message : '')
    }
  }

  return (
    <View className="flex-1 bg-app-bg">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        <Text className="text-sm font-bold text-navy mb-2">Distribuidor</Text>
        <View className="bg-card rounded-lg p-3 mb-4">
          {distributorsQuery.isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" />
              <Text className="text-sm text-muted-foreground ml-2">Cargando…</Text>
            </View>
          ) : (
            <CatalogPicker
              title="Distribuidor"
              items={distributorOptions}
              selectedId={distributorId}
              onSelect={d => setDistributorId(d.id)}
              triggerLabel="Seleccionar distribuidor"
              emptyLabel="No hay distribuidores disponibles para esta marca."
            />
          )}
        </View>

        <Text className="text-sm font-bold text-navy mb-2">Forma de pago</Text>
        <View className="bg-card rounded-lg p-3 mb-4">
          <SegmentedControl
            value={paymentMethod}
            options={PAYMENT_OPTIONS}
            onChange={setPaymentMethod}
          />
        </View>

        <Text className="text-sm font-bold text-navy mb-2">Productos</Text>
        <View className="bg-card rounded-lg p-3 mb-4">
          {items.length === 0 && (
            <Text className="text-sm text-muted-foreground mb-2">Sin items todavía.</Text>
          )}
          {items.map((it, i) => (
            <View key={it.productOptionId} className="border border-border rounded-lg p-3 mb-2">
              <View className="flex-row items-start justify-between mb-1">
                <Text className="text-sm font-bold text-navy flex-1" numberOfLines={2}>
                  {it.productLabel}
                </Text>
                <Pressable onPress={() => removeItem(i)}>
                  <Text className="text-xs text-destructive font-semibold">Quitar</Text>
                </Pressable>
              </View>
              <View className="flex-row gap-2 mt-1">
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground mb-1">Cantidad</Text>
                  <TextInput
                    className="border border-border rounded-lg px-3 py-2 text-sm"
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor="#4b5563"
                    value={it.quantity?.toString() ?? '1'}
                    onChangeText={v =>
                      updateItem(i, { quantity: v ? parseInt(v, 10) : 1 })
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground mb-1">Precio unitario</Text>
                  <TextInput
                    className="border border-border rounded-lg px-3 py-2 text-sm"
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#4b5563"
                    value={it.unit_price?.toString() ?? '0'}
                    onChangeText={v => updateItem(i, { unit_price: v ? Number(v) : 0 })}
                  />
                </View>
              </View>
              <Text className="text-xs text-muted-foreground mt-2">
                Subtotal: ${(it.quantity * it.unit_price).toFixed(2)}
              </Text>
            </View>
          ))}
          <CatalogPicker
            title="Agregar producto"
            items={productOptions}
            onSelect={addItem}
            triggerLabel="+ Agregar producto"
            emptyLabel="No hay productos para esta marca."
          />
        </View>

        <Text className="text-sm font-bold text-navy mb-2">Notas (opcional)</Text>
        <TextInput
          className="bg-card border border-border rounded-lg p-3 text-sm text-navy min-h-[80px] mb-4"
          placeholder="Comentarios para el distribuidor…"
          placeholderTextColor="#4b5563"
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <View className="bg-card rounded-lg p-3 mb-4 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-navy">Total</Text>
          <Text className="text-lg font-bold text-navy">${total.toFixed(2)}</Text>
        </View>
      </ScrollView>

      <WizardActionBar
        onPrevious={() => router.back()}
        previousLabel="Cancelar"
        onNext={onSubmit}
        nextLabel="Crear pedido"
        loading={createOrder.isPending}
        nextDisabled={!distributorId || items.length === 0}
      />
    </View>
  )
}
