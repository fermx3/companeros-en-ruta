import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { Card } from '@/components/ui/Card'
import { FilterChip } from '@/components/ui/FilterChip'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { MetricCard } from '@/components/ui/MetricCard'
import {
  useAsesorOrders,
  type AsesorOrderListItem,
  type OrderStatus,
} from '@/features/asesor/orders/api'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'submitted', label: 'Enviado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Proceso' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default function OrdersScreen() {
  const [status, setStatus] = useState<OrderStatus>('all')
  const ordersQuery = useAsesorOrders(status)

  const orders = ordersQuery.data?.pages.flatMap(p => p.orders) ?? []
  const summary = ordersQuery.data?.pages[0]?.summary

  return (
    <View className="flex-1 bg-app-bg">
      <View
        className="bg-card py-2.5"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_OPTIONS}
          keyExtractor={i => i.value}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              selected={item.value === status}
              onPress={() => setStatus(item.value)}
            />
          )}
        />
      </View>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={ordersQuery.isRefetching} onRefresh={ordersQuery.refetch} />
        }
        ListHeaderComponent={
          summary && summary.total_orders > 0 ? (
            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <MetricCard label="Pedidos" value={summary.total_orders} />
              </View>
              <View className="flex-1">
                <MetricCard
                  label="Ventas"
                  value={`$${Math.round(summary.total_sales).toLocaleString('es-MX')}`}
                />
              </View>
              <View className="flex-1">
                <MetricCard label="Pendientes" value={summary.pending_orders} />
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          ordersQuery.isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <ListEmptyState
              title={status === 'all' ? 'Sin pedidos' : 'Sin pedidos en este estado'}
              body="Cuando crees un pedido para un cliente, va a aparecer aquí."
            />
          )
        }
        renderItem={({ item }) => <OrderRow order={item} />}
        onEndReached={() => {
          if (ordersQuery.hasNextPage && !ordersQuery.isFetchingNextPage) {
            ordersQuery.fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          ordersQuery.isFetchingNextPage ? (
            <View className="py-3">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  )
}

function OrderRow({ order }: { order: AsesorOrderListItem }) {
  const clientName = order.client?.business_name ?? 'Cliente'
  return (
    <Pressable onPress={() => router.push(`/(asesor)/orders/${order.public_id}` as never)}>
      <Card className="mb-2">
        <View className="flex-row items-start justify-between mb-1">
          <View className="flex-1 pr-2">
            <Text className="text-sm font-bold text-navy">{order.order_number}</Text>
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
              {clientName}
              {order.brand?.name ? ` · ${order.brand.name}` : ''}
            </Text>
          </View>
          <BadgeStatus status={order.order_status} size="sm" />
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-xs text-muted-foreground">
            {new Date(order.order_date).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {' · '}
            {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
          </Text>
          <Text className="text-base font-bold text-navy">
            ${Number(order.total_amount).toFixed(2)}
          </Text>
        </View>
      </Card>
    </Pressable>
  )
}
