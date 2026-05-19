import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { MetricCard } from '@/components/ui/MetricCard'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { usePointsDetail, type PointsTransaction } from '@/features/points/api'

function txIcon(type: string) {
  if (type === 'earn' || type === 'earned') return '+'
  if (type === 'redeem' || type === 'redeemed') return '−'
  if (type === 'adjustment') return '±'
  if (type === 'expiration' || type === 'expired') return '×'
  return '·'
}

function TxRow({ tx }: { tx: PointsTransaction }) {
  const positive = tx.points > 0
  return (
    <Card className="mb-2">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-sm font-bold text-navy">
            {txIcon(tx.transaction_type)} {tx.transaction_type}
          </Text>
          <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={2}>
            {tx.source_description ?? tx.source_type ?? '—'}
          </Text>
          <Text className="text-[10px] text-muted-foreground mt-1">
            {new Date(tx.transaction_date).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className={`text-base font-bold ${positive ? 'text-success' : 'text-destructive'}`}
          >
            {positive ? '+' : ''}
            {tx.points}
          </Text>
          <Text className="text-[10px] text-muted-foreground mt-0.5">
            Saldo: {tx.balance_after}
          </Text>
        </View>
      </View>
    </Card>
  )
}

export default function PointsDetailScreen() {
  const { brandId } = useLocalSearchParams<{ brandId: string }>()
  const detail = usePointsDetail(brandId)

  const firstPage = detail.data?.pages[0]
  const transactions = detail.data?.pages.flatMap(p => p.transactions) ?? []
  const brand = firstPage?.brand
  const summary = firstPage?.summary

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title={brand?.name ?? 'Puntos'} showBack />
      <FlatList
        data={transactions}
        keyExtractor={t => t.id}
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={detail.isRefetching} onRefresh={detail.refetch} />
        }
        ListHeaderComponent={
          summary ? (
            <View className="mb-3">
              <Card className="mb-2">
                <View className="flex-row items-center">
                  <BrandLogo logoUrl={brand?.logo_url ?? null} name={brand?.name} size={40} />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                      {brand?.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">Historial de puntos</Text>
                  </View>
                </View>
              </Card>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <MetricCard label="Saldo" value={summary.current_balance} />
                </View>
                <View className="flex-1">
                  <MetricCard label="Acumulados" value={summary.lifetime_points} />
                </View>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          detail.isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <ListEmptyState
              title="Sin movimientos"
              body="Cuando ganes o canjees puntos en esta marca, los vas a ver aquí."
            />
          )
        }
        renderItem={({ item }) => <TxRow tx={item} />}
        onEndReached={() => {
          if (detail.hasNextPage && !detail.isFetchingNextPage) detail.fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          detail.isFetchingNextPage ? (
            <View className="py-3">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}
