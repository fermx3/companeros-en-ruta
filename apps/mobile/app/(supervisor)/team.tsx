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
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ChevronRight } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { useSupervisorTeam, type SupervisorTeamMember } from '@/features/supervisor/team/api'

export default function TeamScreen() {
  const [search, setSearch] = useState('')
  const teamQuery = useSupervisorTeam(search)
  const members = teamQuery.data?.team_members ?? []

  return (
    <View className="flex-1 bg-app-bg">
      <View
        className="bg-card px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
      >
        <Input
          placeholder="Buscar promotor…"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={members}
        keyExtractor={m => m.id}
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={teamQuery.isRefetching} onRefresh={teamQuery.refetch} />
        }
        ListEmptyComponent={
          teamQuery.isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <ListEmptyState
              title={search ? 'Sin resultados' : 'Sin promotores asignados'}
              body={
                search
                  ? 'Prueba con otro término.'
                  : 'Cuando tengas promotores a tu cargo, los verás aquí.'
              }
            />
          )
        }
        renderItem={({ item }) => <TeamMemberRow member={item} />}
      />
    </View>
  )
}

function TeamMemberRow({ member }: { member: SupervisorTeamMember }) {
  return (
    <Pressable onPress={() => router.push(`/(supervisor)/team/${member.id}` as never)}>
      <Card className="mb-2">
        <View className="flex-row items-center">
          <BrandLogo logoUrl={null} name={member.full_name} size={40} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-navy" numberOfLines={1}>
              {member.full_name}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
              {member.email}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {member.total_clients} clientes · {member.completed_visits} visitas
              {member.avg_rating > 0 ? ` · ★ ${member.avg_rating.toFixed(1)}` : ''}
            </Text>
          </View>
          <View className="items-end">
            <BadgeStatus status={member.status} size="sm" />
            <ChevronRight size={18} color="#999999" />
          </View>
        </View>
      </Card>
    </Pressable>
  )
}
