import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { Card } from '@/components/ui/Card'
import { FilterChip } from '@/components/ui/FilterChip'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import {
  useSupervisorVisits,
  type SupervisorVisitItem,
  type SupervisorVisitStatus,
} from '@/features/supervisor/visits/api'

const STATUS_OPTIONS: { value: SupervisorVisitStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'planned', label: 'Planificadas' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'no_show', label: 'No presentadas' },
]

export default function SupervisorVisitsScreen() {
  const [status, setStatus] = useState<SupervisorVisitStatus>('all')
  const visitsQuery = useSupervisorVisits({ status })

  const visits = visitsQuery.data?.pages.flatMap(p => p.visits) ?? []
  const total = visitsQuery.data?.pages[0]?.pagination.total

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
        data={visits}
        keyExtractor={v => v.id}
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={visitsQuery.isRefetching} onRefresh={visitsQuery.refetch} />
        }
        ListHeaderComponent={
          total != null && total > 0 ? (
            <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
              {total} {total === 1 ? 'visita' : 'visitas'}
              {status !== 'all' ? ' filtradas' : ' totales'}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          visitsQuery.isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <ListEmptyState
              title={status === 'all' ? 'Sin visitas' : 'Sin visitas en este estado'}
              body="Las visitas del equipo aparecerán acá conforme las programen o las hagan."
            />
          )
        }
        renderItem={({ item }) => <VisitRow visit={item} />}
        onEndReached={() => {
          if (visitsQuery.hasNextPage && !visitsQuery.isFetchingNextPage) {
            visitsQuery.fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          visitsQuery.isFetchingNextPage ? (
            <View className="py-3">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  )
}

function VisitRow({ visit }: { visit: SupervisorVisitItem }) {
  return (
    <Card className="mb-2">
      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-1 pr-2">
          <Text className="text-sm font-bold text-navy" numberOfLines={1}>
            {visit.client_name}
          </Text>
          <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
            {visit.promotor_name}
          </Text>
        </View>
        <BadgeStatus status={visit.visit_status} size="sm" />
      </View>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-xs text-muted-foreground">
          {new Date(visit.visit_date).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        {visit.client_satisfaction_rating != null && (
          <Text className="text-xs font-bold text-success">
            ★ {visit.client_satisfaction_rating.toFixed(1)}
          </Text>
        )}
      </View>
    </Card>
  )
}
