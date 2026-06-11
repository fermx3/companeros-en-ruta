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
import {
  usePromotorClients,
  type PromotorClient,
} from '@/features/promotor-clients/api'

export default function PromotorClientsScreen() {
  const [search, setSearch] = useState('')
  const clientsQuery = usePromotorClients()

  const clients = useMemo(() => clientsQuery.data?.clients ?? [], [clientsQuery.data])
  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const term = search.toLowerCase()
    return clients.filter(c =>
      c.business_name.toLowerCase().includes(term)
        || (c.owner_name ?? '').toLowerCase().includes(term)
        || (c.owner_last_name ?? '').toLowerCase().includes(term)
        || c.public_id.toLowerCase().includes(term),
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
        alwaysBounceVertical
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
                  ? 'Prueba con otro término de búsqueda.'
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

function ClientRow({ client }: { client: PromotorClient }) {
  const ownerFull = [client.owner_name, client.owner_last_name].filter(Boolean).join(' ')
  const primaryBrand = client.brands[0] ?? null
  const extraBrands = Math.max(0, client.brands.length - 1)
  return (
    <Pressable onPress={() => router.push(`/(promotor)/clients/${client.id}` as never)}>
      <Card className="mb-2">
        <View className="flex-row items-start">
          <BrandLogo
            logoUrl={primaryBrand?.logo_url ?? null}
            name={primaryBrand?.name ?? client.business_name}
            size={36}
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-navy" numberOfLines={1}>
              {client.business_name}
            </Text>
            {ownerFull && (
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {ownerFull}
              </Text>
            )}
            {primaryBrand && (
              <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                {primaryBrand.name}
                {extraBrands > 0 ? ` · +${extraBrands}` : ''}
              </Text>
            )}
            {client.last_visit_date && (
              <Text className="text-[10px] text-muted-foreground mt-1">
                Última visita {new Date(client.last_visit_date).toLocaleDateString('es-MX')}
              </Text>
            )}
          </View>
          <View className="ml-2 items-end">
            <BadgeStatus status={client.status} />
            <ChevronRight size={18} color="#999999" />
          </View>
        </View>
      </Card>
    </Pressable>
  )
}
