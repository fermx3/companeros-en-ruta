import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useSupervisorTeamMember } from '@/features/supervisor/team/api'

export default function TeamMemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const memberQuery = useSupervisorTeamMember(id)

  if (memberQuery.isLoading || !memberQuery.data) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <ScreenHeader title="Promotor" showBack />
        <View className="flex-1 items-center justify-center">
          {memberQuery.isLoading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Text className="text-destructive">No encontramos este promotor</Text>
          )}
        </View>
      </SafeAreaView>
    )
  }

  const { profile, stats, assigned_clients, recent_visits } = memberQuery.data

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title={profile.full_name} showBack />
      <ScrollView contentContainerClassName="p-4 pb-8">
        <Card className="mb-3">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 pr-2">
              <Text className="text-lg font-bold text-navy">{profile.full_name}</Text>
              {profile.email && (
                <Text className="text-xs text-muted-foreground mt-0.5">{profile.email}</Text>
              )}
              {profile.phone && (
                <Text className="text-xs text-muted-foreground mt-0.5">Tel: {profile.phone}</Text>
              )}
            </View>
            <BadgeStatus status={profile.status} />
          </View>
        </Card>

        <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
          Estadísticas
        </Text>
        <View className="flex-row gap-2 mb-2">
          <View className="flex-1">
            <MetricCard label="Clientes" value={stats.total_clients} />
          </View>
          <View className="flex-1">
            <MetricCard label="Completadas" value={stats.completed_visits} />
          </View>
        </View>
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1">
            <MetricCard label="Pendientes" value={stats.pending_visits} />
          </View>
          <View className="flex-1">
            <MetricCard label="Rating" value={stats.avg_rating > 0 ? stats.avg_rating.toFixed(1) : '—'} />
          </View>
        </View>

        {recent_visits.length > 0 && (
          <>
            <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 mt-2">
              Visitas recientes
            </Text>
            {recent_visits.slice(0, 8).map(v => (
              <Card key={v.id} className="mb-2">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                      {v.client_name}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {new Date(v.visit_date).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {v.client_satisfaction_rating != null
                        ? ` · ★ ${v.client_satisfaction_rating.toFixed(1)}`
                        : ''}
                    </Text>
                  </View>
                  <BadgeStatus status={v.visit_status} size="sm" />
                </View>
              </Card>
            ))}
          </>
        )}

        {assigned_clients.length > 0 && (
          <>
            <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 mt-2">
              Clientes asignados
            </Text>
            {assigned_clients.slice(0, 10).map(c => (
              <Card key={c.id} className="mb-2">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {c.public_id} · {c.client_type}
                    </Text>
                  </View>
                  <BadgeStatus status={c.status} size="sm" />
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
