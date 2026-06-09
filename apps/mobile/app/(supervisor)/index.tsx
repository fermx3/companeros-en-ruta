import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ChevronRight } from '@/components/ui/Icon'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { MetricCard } from '@/components/ui/MetricCard'
import { useSupervisorMetrics } from '@/features/supervisor/metrics/api'

export default function SupervisorOverview() {
  const metricsQuery = useSupervisorMetrics()
  const metrics = metricsQuery.data

  return (
    <ScrollView
      className="flex-1 bg-app-bg"
      contentContainerClassName="p-4 pb-8"
      // alwaysBounceVertical guarantees the pull-to-refresh gesture is
      // available even when the content is shorter than the viewport.
      alwaysBounceVertical
      refreshControl={
        <RefreshControl
          refreshing={metricsQuery.isRefetching}
          onRefresh={() => {
            metricsQuery.refetch()
          }}
        />
      }
    >
      {metricsQuery.isLoading || !metrics ? (
        <View className="items-center py-12">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
            Equipo
          </Text>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1">
              <MetricCard label="Promotores" value={metrics.team_size} />
            </View>
            <View className="flex-1">
              <MetricCard label="Clientes" value={metrics.total_clients} />
            </View>
          </View>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1">
              <MetricCard label="Rating prom." value={metrics.avg_team_rating.toFixed(1)} />
            </View>
            <View className="flex-1">
              <MetricCard label="Visitas mes" value={metrics.visits_this_month} />
            </View>
          </View>

          <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 mt-3">
            Visitas
          </Text>
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <MetricCard label="Completadas" value={metrics.completed_visits} />
            </View>
            <View className="flex-1">
              <MetricCard label="Pendientes" value={metrics.pending_visits} />
            </View>
          </View>

          {metrics.team_members.length > 0 && (
            <>
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 mt-2">
                Top del equipo
              </Text>
              {[...metrics.team_members]
                .sort((a, b) => b.completed_visits - a.completed_visits)
                .slice(0, 5)
                .map(m => (
                  <Pressable
                    key={m.id}
                    onPress={() => router.push(`/(supervisor)/team/${m.id}` as never)}
                  >
                    <Card className="mb-2">
                      <View className="flex-row items-center">
                        <BrandLogo logoUrl={null} name={m.full_name} size={36} />
                        <View className="ml-3 flex-1">
                          <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                            {m.full_name}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {m.completed_visits} completadas · {m.pending_visits} pendientes
                            {m.avg_rating > 0 ? ` · ★ ${m.avg_rating.toFixed(1)}` : ''}
                          </Text>
                        </View>
                        <ChevronRight size={18} color="#999999" />
                      </View>
                    </Card>
                  </Pressable>
                ))}
            </>
          )}

          {metrics.team_members.length === 0 && (
            <ListEmptyState
              title="Sin promotores asignados"
              body="Cuando tengas promotores a tu cargo, verás sus métricas aquí."
            />
          )}
        </>
      )}
    </ScrollView>
  )
}
