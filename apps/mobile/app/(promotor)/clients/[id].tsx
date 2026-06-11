import { useMemo } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { usePromotorClients } from '@/features/promotor-clients/api'

export default function PromotorClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const clientsQuery = usePromotorClients()

  const client = useMemo(
    () => clientsQuery.data?.clients.find(c => c.id === id) ?? null,
    [clientsQuery.data, id],
  )

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title="Cliente" showBack />
      {clientsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : !client ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm text-muted-foreground text-center">
            Este cliente ya no está asignado a ti.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="p-4 pb-8">
          <Card className="mb-3">
            <View className="flex-row items-start">
              <BrandLogo
                logoUrl={client.brands[0]?.logo_url ?? null}
                name={client.brands[0]?.name ?? client.business_name}
                size={44}
              />
              <View className="ml-3 flex-1">
                <Text className="text-base font-bold text-navy" numberOfLines={2}>
                  {client.business_name}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">{client.public_id}</Text>
              </View>
              <BadgeStatus status={client.status} />
            </View>
          </Card>

          {(client.owner_name || client.owner_last_name) && (
            <Card className="mb-3">
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
                Dueño
              </Text>
              <Text className="text-sm text-navy">
                {[client.owner_name, client.owner_last_name].filter(Boolean).join(' ')}
              </Text>
            </Card>
          )}

          {client.brands.length > 0 && (
            <Card className="mb-3">
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
                Marcas
              </Text>
              {client.brands.map(b => (
                <View key={b.id} className="flex-row items-center mb-1">
                  <BrandLogo logoUrl={b.logo_url} name={b.name} size={24} />
                  <Text className="text-sm text-navy ml-2">{b.name}</Text>
                </View>
              ))}
            </Card>
          )}

          {(client.phone || client.email || client.address) && (
            <Card className="mb-3">
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
                Contacto
              </Text>
              {client.phone && (
                <Pressable onPress={() => Linking.openURL(`tel:${client.phone}`)} className="mb-1">
                  <Text className="text-sm text-primary">{client.phone}</Text>
                </Pressable>
              )}
              {client.email && (
                <Pressable onPress={() => Linking.openURL(`mailto:${client.email}`)} className="mb-1">
                  <Text className="text-sm text-primary">{client.email}</Text>
                </Pressable>
              )}
              {client.address && (
                <Text className="text-sm text-navy mt-1">{client.address}</Text>
              )}
            </Card>
          )}

          {client.last_visit_date && (
            <Card>
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
                Última visita
              </Text>
              <Text className="text-sm text-navy">
                {new Date(client.last_visit_date).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </Card>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
