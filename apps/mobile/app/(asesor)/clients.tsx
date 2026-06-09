import { useMemo, useState } from 'react'
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
import { useAsesorClients, type AsesorClient } from '@/features/asesor/clients/api'

export default function ClientsScreen() {
  const [search, setSearch] = useState('')
  const clientsQuery = useAsesorClients()

  const clients = useMemo(() => clientsQuery.data?.clients ?? [], [clientsQuery.data])
  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const term = search.toLowerCase()
    return clients.filter(c =>
      c.business_name.toLowerCase().includes(term) ||
      c.public_id.toLowerCase().includes(term) ||
      (c.owner_name?.toLowerCase().includes(term) ?? false)
    )
  }, [clients, search])

  return (
    <View className="flex-1 bg-app-bg">
      <View
        className="bg-card px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
      >
        <Input
          placeholder="Buscar por nombre, ID o dueño…"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={clientsQuery.isRefetching}
            onRefresh={clientsQuery.refetch}
          />
        }
        ListEmptyComponent={
          clientsQuery.isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <ListEmptyState
              title={search ? 'Sin resultados' : 'Sin clientes asignados'}
              body={
                search
                  ? 'Probá con otro término de búsqueda.'
                  : 'Cuando te asignen clientes, los verás aquí.'
              }
            />
          )
        }
        renderItem={({ item }) => <ClientRow client={item} />}
      />
    </View>
  )
}

function ClientRow({ client }: { client: AsesorClient }) {
  const ownerFull = [client.owner_name, client.owner_last_name].filter(Boolean).join(' ')
  return (
    <Pressable onPress={() => router.push(`/(asesor)/clients/${client.public_id}` as never)}>
      <Card className="mb-2">
        <View className="flex-row items-start">
          <BrandLogo logoUrl={null} name={client.business_name} size={36} />
          <View className="ml-3 flex-1 pr-2">
            <Text className="text-sm font-bold text-navy" numberOfLines={1}>
              {client.business_name}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {client.public_id}
              {ownerFull ? ` · ${ownerFull}` : ''}
            </Text>
            {client.address_city && (
              <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                {client.address_street ?? ''}
                {client.address_city ? `, ${client.address_city}` : ''}
              </Text>
            )}
          </View>
          <View className="items-end">
            <BadgeStatus status={client.status} size="sm" />
            <ChevronRight size={18} color="#999999" />
          </View>
        </View>
      </Card>
    </Pressable>
  )
}
