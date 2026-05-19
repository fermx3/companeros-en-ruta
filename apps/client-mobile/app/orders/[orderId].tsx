import { ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { Card } from '@/components/ui/Card'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useOrders } from '@/features/orders/api'

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>()
  const ordersQuery = useOrders('all')
  const order = ordersQuery.data?.pages
    .flatMap(p => p.orders)
    .find(o => o.id === orderId)

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title={order?.order_number ?? 'Pedido'} showBack />
      <ScrollView contentContainerClassName="p-4 pb-8">
        {!order ? (
          <Card>
            <Text className="text-sm text-muted-foreground text-center">
              No encontramos este pedido. Vuelve a la lista.
            </Text>
          </Card>
        ) : (
          <>
            <Card className="mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-bold text-navy">{order.order_number}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {order.brand_name ?? 'Marca'}
                  </Text>
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
                {' · '}
                {order.source === 'visit' ? 'Originado en una visita' : 'Pedido directo'}
              </Text>
              {order.promotor_name && (
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Promotor: {order.promotor_name}
                </Text>
              )}
              {order.order_type && (
                <Text className="text-xs text-muted-foreground mt-0.5">Tipo: {order.order_type}</Text>
              )}
              <Text className="text-xs text-muted-foreground mt-2">Folio: {order.public_id}</Text>
            </Card>

            {order.notes && (
              <Card className="mb-3">
                <Text className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Notas</Text>
                <Text className="text-sm text-navy">{order.notes}</Text>
              </Card>
            )}

            <Card className="mb-3">
              <Text className="text-xs text-muted-foreground">
                El detalle de los productos del pedido se verá pronto. Por ahora vas
                a poder ver el resumen y el estado del pedido desde aquí.
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
