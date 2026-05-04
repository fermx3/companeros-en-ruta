import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { signOut } from '@/lib/auth'
import { useMyVisits, type VisitListItem } from '@/features/visits/api'

const STATUS_LABEL: Record<string, string> = {
  planned: 'Planificada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No se presentó',
}

const STATUS_BG: Record<string, string> = {
  planned: 'bg-blue-100',
  in_progress: 'bg-amber-100',
  completed: 'bg-success-bg',
  cancelled: 'bg-red-100',
  no_show: 'bg-gray-100',
}

const STATUS_TEXT: Record<string, string> = {
  planned: 'text-blue-700',
  in_progress: 'text-amber-700',
  completed: 'text-success',
  cancelled: 'text-red-700',
  no_show: 'text-gray-700',
}

function VisitRow({ visit }: { visit: VisitListItem }) {
  const status = visit.visit_status
  const clientName = visit.client?.business_name
    ?? [visit.client?.owner_name, visit.client?.owner_last_name].filter(Boolean).join(' ')
    ?? '—'

  return (
    <Pressable
      className="bg-white rounded-2xl px-4 py-4 mb-3 border border-gray-200"
      onPress={() => router.push(`/(promotor)/visits/${visit.id}`)}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-navy" numberOfLines={1}>
            {clientName}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">{visit.public_id}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${STATUS_BG[status] ?? 'bg-gray-100'}`}>
          <Text className={`text-xs font-medium ${STATUS_TEXT[status] ?? 'text-gray-700'}`}>
            {STATUS_LABEL[status] ?? status}
          </Text>
        </View>
      </View>
      {visit.client?.address_street && (
        <Text className="text-sm text-gray-600" numberOfLines={1}>
          {visit.client.address_street}
          {visit.client.address_neighborhood ? `, ${visit.client.address_neighborhood}` : ''}
        </Text>
      )}
      {visit.visit_date && (
        <Text className="text-xs text-gray-400 mt-1">
          {new Date(visit.visit_date).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      )}
    </Pressable>
  )
}

export default function VisitsScreen() {
  const { data, isLoading, isRefetching, refetch, error } = useMyVisits('month')

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-destructive text-center mb-4">
          Error al cargar visitas: {error instanceof Error ? error.message : 'desconocido'}
        </Text>
        <Pressable className="px-4 py-2 rounded-full bg-primary-light" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Reintentar</Text>
        </Pressable>
      </View>
    )
  }

  const visits = data?.visits ?? []
  const metrics = data?.metrics

  return (
    <View className="flex-1 bg-gray-50">
      {metrics && (
        <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row justify-between">
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-navy">{metrics.completedVisits}</Text>
            <Text className="text-xs text-gray-500">Completadas</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-navy">{metrics.totalClients}</Text>
            <Text className="text-xs text-gray-500">Clientes</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-navy">{metrics.effectiveness}%</Text>
            <Text className="text-xs text-gray-500">Efectividad</Text>
          </View>
        </View>
      )}

      <FlatList
        data={visits}
        keyExtractor={(v) => v.id}
        contentContainerClassName="px-4 py-4"
        renderItem={({ item }) => <VisitRow visit={item} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View className="items-center mt-12">
            <Text className="text-gray-500">No hay visitas este mes</Text>
          </View>
        }
        ListFooterComponent={
          <Pressable
            className="mt-4 py-3 rounded-full border border-secondary items-center"
            onPress={async () => {
              await signOut()
              router.replace('/(auth)/login')
            }}
          >
            <Text className="text-gray-600 font-medium">Cerrar sesión</Text>
          </Pressable>
        }
      />
    </View>
  )
}
