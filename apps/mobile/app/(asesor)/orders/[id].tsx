import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { Card } from '@/components/ui/Card'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useAsesorOrder } from '@/features/asesor/orders/api'

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const orderQuery = useAsesorOrder(id)

  if (orderQuery.isLoading || !orderQuery.data) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <ScreenHeader title="Pedido" showBack />
        <View className="flex-1 items-center justify-center">
          {orderQuery.isLoading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Text className="text-destructive">No encontramos este pedido</Text>
          )}
        </View>
      </SafeAreaView>
    )
  }

  const { order } = orderQuery.data

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title={order.order_number} showBack />
      <ScrollView contentContainerClassName="p-4 pb-8">
        <Card className="mb-3">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 pr-2">
              <Text className="text-base font-bold text-navy">{order.order_number}</Text>
              {order.client && (
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {order.client.business_name}
                </Text>
              )}
            </View>
            <BadgeStatus status={order.order_status} />
          </View>
          <Text className="text-3xl font-black text-navy mt-2">
            ${Number(order.total_amount).toFixed(2)}
          </Text>
          <Text className="text-xs text-muted-foreground mt-2">
            {new Date(order.order_date).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          {order.brand && (
            <Text className="text-xs text-muted-foreground mt-0.5">Marca: {order.brand.name}</Text>
          )}
        </Card>

        <Card className="mb-3">
          <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
            Resumen
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-muted-foreground">Subtotal</Text>
            <Text className="text-sm text-navy">${Number(order.subtotal).toFixed(2)}</Text>
          </View>
          {order.discount_amount > 0 && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-muted-foreground">Descuento</Text>
              <Text className="text-sm text-success">
                -${Number(order.discount_amount).toFixed(2)}
              </Text>
            </View>
          )}
          {order.tax_amount > 0 && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-muted-foreground">Impuestos</Text>
              <Text className="text-sm text-navy">${Number(order.tax_amount).toFixed(2)}</Text>
            </View>
          )}
          <View className="flex-row justify-between mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}>
            <Text className="text-sm font-bold text-navy">Total</Text>
            <Text className="text-sm font-bold text-navy">${Number(order.total_amount).toFixed(2)}</Text>
          </View>
        </Card>

        <Card className="mb-3">
          <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
            Items ({order.items.length})
          </Text>
          {order.items.map(item => (
            <View
              key={item.id}
              className="py-2"
              style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
            >
              <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                {item.product?.name ?? 'Producto'}
              </Text>
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-muted-foreground">
                  {item.quantity_ordered} {item.unit_type} × ${Number(item.unit_price).toFixed(2)}
                </Text>
                <Text className="text-sm font-bold text-navy">
                  ${Number(item.line_total).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {(order.delivery_address || order.delivery_instructions) && (
          <Card className="mb-3">
            <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
              Entrega
            </Text>
            {order.delivery_address && (
              <Text className="text-sm text-navy">{order.delivery_address}</Text>
            )}
            {order.delivery_instructions && (
              <Text className="text-xs text-muted-foreground mt-1">{order.delivery_instructions}</Text>
            )}
          </Card>
        )}

        {order.client_notes && (
          <Card className="mb-3">
            <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
              Notas del cliente
            </Text>
            <Text className="text-sm text-navy">{order.client_notes}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
