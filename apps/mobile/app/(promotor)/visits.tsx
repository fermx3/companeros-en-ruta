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
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { MetricCard } from '@/components/ui/MetricCard'
import { useMyVisits, type VisitListItem } from '@/features/visits/api'
import { StaffSurveysPendingBanner } from '@/features/staff-surveys/PendingBanner'

function VisitRow({ visit }: { visit: VisitListItem }) {
  const status = visit.visit_status
  const clientName = visit.client?.business_name
    ?? [visit.client?.owner_name, visit.client?.owner_last_name].filter(Boolean).join(' ')
    ?? '—'

  return (
    <Pressable onPress={() => router.push(`/(promotor)/visits/${visit.id}`)}>
      <Card className="mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 pr-3">
            <Text className="text-base font-bold text-navy" numberOfLines={1}>
              {clientName}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{visit.public_id}</Text>
          </View>
          <BadgeStatus status={status} />
        </View>
        {visit.client?.address_street && (
          <Text className="text-sm text-navy" numberOfLines={1}>
            {visit.client.address_street}
            {visit.client.address_neighborhood ? `, ${visit.client.address_neighborhood}` : ''}
          </Text>
        )}
        {visit.visit_date && (
          <Text className="text-xs text-muted-foreground mt-1">
            {new Date(visit.visit_date).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        )}
      </Card>
    </Pressable>
  )
}

export default function VisitsScreen() {
  const { data, isLoading, isRefetching, refetch, error } = useMyVisits('month')

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6">
        <Text className="text-destructive text-center mb-4">
          Error al cargar visitas: {error instanceof Error ? error.message : 'desconocido'}
        </Text>
        <Button onPress={() => refetch()} variant="default" size="default">
          Reintentar
        </Button>
      </View>
    )
  }

  const visits = data?.visits ?? []
  const metrics = data?.metrics

  return (
    <View className="flex-1 bg-app-bg">
      {metrics && (
        <View className="px-4 pt-3 pb-1 flex-row gap-2">
          <View className="flex-1">
            <MetricCard label="Completadas" value={metrics.completedVisits} />
          </View>
          <View className="flex-1">
            <MetricCard label="Clientes" value={metrics.totalClients} />
          </View>
          <View className="flex-1">
            <MetricCard label="Efectividad" value={`${metrics.effectiveness}%`} />
          </View>
        </View>
      )}

      <FlatList
        data={visits}
        keyExtractor={(v) => v.id}
        contentContainerClassName="px-4 py-3"
        alwaysBounceVertical
        ListHeaderComponent={<StaffSurveysPendingBanner rolePathPrefix="/(promotor)" />}
        renderItem={({ item }) => <VisitRow visit={item} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <ListEmptyState
            title="No hay visitas este mes"
            body="Cuando tengas visitas asignadas, las verás aquí."
          />
        }
      />
    </View>
  )
}
