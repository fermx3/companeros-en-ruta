import { ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { Card } from '@/components/ui/Card'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useOrders } from '@/features/orders/api'

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>()
  // Look up the order in whatever filter cache contains it. Simplest:
  // re-fetch "all" and find. Most users land here right after seeing the row
  // in the list, so the data is already cached.
  const ordersQuery = useOrders('all')
  const order = ordersQuery.data?.pages
    .flatMap(p => p.orders)
    .find(o => o.id === orderId)

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScreenHeader title={order?.order_number ?? 'Pedido'} showBack />
      <ScrollView contentContainerClassName="p-4 pb-8">
        {!order ? (
          <Card>
            <Text className="text-sm text-gray-500 text-center">
              No encontramos este pedido. Volvé a la lista.
            </Text>
          </Card>
        ) : (
          <>
            <Card className="mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-bold text-navy">{order.order_number}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {order.brand_name ?? 'Marca'}
                  </Text>
                </View>
                <BadgeStatus status={order.order_status} />
              </View>
              <Text className="text-2xl font-bold text-navy mt-2">
                ${Number(order.total_amount).toFixed(2)}
              </Text>
              <Text className="text-xs text-gray-500 mt-2">
                {new Date(order.order_date).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {' · '}
                {order.source === 'visit' ? 'Originado en una visita' : 'Pedido directo'}
              </Text>
              {order.promotor_name && (
                <Text className="text-xs text-gray-500 mt-0.5">
                  Promotor: {order.promotor_name}
                </Text>
              )}
              {order.order_type && (
                <Text className="text-xs text-gray-500 mt-0.5">Tipo: {order.order_type}</Text>
              )}
              <Text className="text-xs text-gray-400 mt-2">Folio: {order.public_id}</Text>
            </Card>

            {order.notes && (
              <Card className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">Notas</Text>
                <Text className="text-sm text-gray-700">{order.notes}</Text>
              </Card>
            )}

            <Card className="mb-3">
              <Text className="text-xs text-gray-500">
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
