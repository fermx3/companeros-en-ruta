import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useAsesorClients } from '@/features/asesor/clients/api'
import {
  useCreateAsesorOrder,
  type CreateOrderItem,
} from '@/features/asesor/orders/api'
import { useAsesorProducts } from '@/features/asesor/products/api'

// Cart item state with the picked unit price (defaults to base_price). Quantity
// > 0 means the item is "in the cart".
interface CartLine {
  product_id: string
  product_name: string
  unit_type: string
  base_price: number
  quantity: number
  unit_price: number
}

export default function NewOrderScreen() {
  const params = useLocalSearchParams<{ clientId?: string }>()
  const [selectedClientPid, setSelectedClientPid] = useState<string | null>(
    params.clientId ?? null
  )
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Record<string, CartLine>>({})
  const [notes, setNotes] = useState('')

  const clientsQuery = useAsesorClients()
  const createOrder = useCreateAsesorOrder()

  const clients = useMemo(() => clientsQuery.data?.clients ?? [], [clientsQuery.data])
  const selectedClient = clients.find(c => c.public_id === selectedClientPid)
  // Products endpoint needs the client UUID (not the public_id) — that's what
  // the API uses to look up the asesor's assignment + the client's memberships.
  const productsQuery = useAsesorProducts(selectedClient?.id)

  const products = useMemo(() => productsQuery.data?.products ?? [], [productsQuery.data])
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products
    const term = search.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    )
  }, [products, search])

  const cartLines = Object.values(cart).filter(l => l.quantity > 0)
  const subtotal = cartLines.reduce(
    (sum, l) => sum + l.quantity * l.unit_price,
    0
  )

  function updateLine(productId: string, patch: Partial<CartLine>) {
    setCart(prev => {
      const next = { ...prev }
      const current = next[productId]
      if (!current) return prev
      next[productId] = { ...current, ...patch }
      return next
    })
  }

  function addProduct(productId: string) {
    const p = products.find(x => x.id === productId)
    if (!p) return
    setCart(prev => {
      const existing = prev[productId]
      if (existing) {
        return { ...prev, [productId]: { ...existing, quantity: existing.quantity + 1 } }
      }
      return {
        ...prev,
        [productId]: {
          product_id: p.id,
          product_name: p.name,
          unit_type: p.unit_type,
          base_price: p.base_price,
          quantity: 1,
          unit_price: p.base_price,
        },
      }
    })
  }

  function removeProduct(productId: string) {
    setCart(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  async function onSubmit() {
    if (!selectedClient) {
      Alert.alert('Falta cliente', 'Selecciona un cliente para el pedido.')
      return
    }
    if (cartLines.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega al menos un producto.')
      return
    }
    const items: CreateOrderItem[] = cartLines.map(l => ({
      product_id: l.product_id,
      quantity: l.quantity,
      unit_price: l.unit_price,
      unit_type: l.unit_type,
    }))
    try {
      const result = await createOrder.mutateAsync({
        client_id: selectedClient.id,
        items,
        client_notes: notes.trim() || undefined,
      })
      Alert.alert('Pedido creado', `Número: ${result.order.order_number}`, [
        {
          text: 'Ver pedido',
          onPress: () =>
            router.replace(`/(asesor)/orders/${result.order.public_id}` as never),
        },
      ])
    } catch (e) {
      Alert.alert('Error al crear', e instanceof Error ? e.message : 'Inténtalo de nuevo')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title="Nuevo pedido" showBack />
      <ScrollView contentContainerClassName="p-4 pb-32">
        {/* Cliente */}
        <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
          Cliente
        </Text>
        {selectedClient ? (
          <Card className="mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-bold text-navy">{selectedClient.business_name}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {selectedClient.public_id}
                </Text>
              </View>
              <Button
                onPress={() => setSelectedClientPid(null)}
                variant="ghost"
                size="sm"
              >
                Cambiar
              </Button>
            </View>
          </Card>
        ) : (
          <Card className="mb-3">
            {clientsQuery.isLoading ? (
              <ActivityIndicator />
            ) : (
              <View>
                <Text className="text-sm text-muted-foreground mb-2">
                  Selecciona un cliente:
                </Text>
                {clients.slice(0, 10).map(c => (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedClientPid(c.public_id)}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: 'rgba(204,204,204,0.4)',
                    }}
                  >
                    <Text className="text-sm text-navy">{c.business_name}</Text>
                    <Text className="text-xs text-muted-foreground">{c.public_id}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Productos */}
        {selectedClient && (
          <>
            <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 mt-2">
              Productos
            </Text>
            <Input
              placeholder="Buscar producto…"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              style={{ marginBottom: 12 }}
            />
            {productsQuery.isLoading ? (
              <ActivityIndicator />
            ) : (
              filteredProducts.slice(0, 20).map(p => {
                const inCart = cart[p.id]
                return (
                  <Card key={p.id} className="mb-2">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          SKU: {p.sku} · ${Number(p.base_price).toFixed(2)}
                        </Text>
                      </View>
                      {inCart && inCart.quantity > 0 ? (
                        <View className="flex-row items-center gap-2">
                          <Button
                            onPress={() =>
                              updateLine(p.id, { quantity: Math.max(0, inCart.quantity - 1) })
                            }
                            variant="outline"
                            size="sm"
                          >
                            −
                          </Button>
                          <Text className="text-sm font-bold text-navy w-6 text-center">
                            {inCart.quantity}
                          </Text>
                          <Button
                            onPress={() => updateLine(p.id, { quantity: inCart.quantity + 1 })}
                            variant="default"
                            size="sm"
                          >
                            +
                          </Button>
                        </View>
                      ) : (
                        <Button onPress={() => addProduct(p.id)} variant="default" size="sm">
                          Agregar
                        </Button>
                      )}
                    </View>
                  </Card>
                )
              })
            )}

            {/* Carrito + notas */}
            {cartLines.length > 0 && (
              <>
                <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 mt-3">
                  Carrito ({cartLines.length})
                </Text>
                <Card className="mb-3">
                  {cartLines.map(l => (
                    <View
                      key={l.product_id}
                      className="py-2 flex-row items-center justify-between"
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(204,204,204,0.4)',
                      }}
                    >
                      <View className="flex-1 pr-2">
                        <Text className="text-sm text-navy" numberOfLines={1}>
                          {l.product_name}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {l.quantity} × ${l.unit_price.toFixed(2)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-bold text-navy">
                          ${(l.quantity * l.unit_price).toFixed(2)}
                        </Text>
                        <Pressable onPress={() => removeProduct(l.product_id)}>
                          <Text className="text-xs text-destructive font-bold mt-1">Quitar</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                  <View className="flex-row justify-between mt-3">
                    <Text className="text-sm font-bold text-navy">Subtotal</Text>
                    <Text className="text-sm font-bold text-navy">${subtotal.toFixed(2)}</Text>
                  </View>
                </Card>

                <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
                  Notas (opcional)
                </Text>
                <Input
                  placeholder="Observaciones para el pedido…"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  style={{ height: undefined, minHeight: 80, paddingTop: 10 }}
                />
              </>
            )}
          </>
        )}
      </ScrollView>

      <View
        className="px-4 py-3 bg-card"
        style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}
      >
        <Button
          onPress={onSubmit}
          variant="default"
          size="lg"
          fullWidth
          loading={createOrder.isPending}
          disabled={!selectedClient || cartLines.length === 0}
        >
          {`Crear pedido ($${subtotal.toFixed(2)})`}
        </Button>
      </View>
    </SafeAreaView>
  )
}
