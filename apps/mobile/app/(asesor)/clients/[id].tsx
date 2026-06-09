import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useAsesorClient } from '@/features/asesor/clients/api'

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const clientQuery = useAsesorClient(id)

  if (clientQuery.isLoading || !clientQuery.data) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <ScreenHeader title="Cliente" showBack />
        <View className="flex-1 items-center justify-center">
          {clientQuery.isLoading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Text className="text-destructive">No encontramos este cliente</Text>
          )}
        </View>
      </SafeAreaView>
    )
  }

  const { client, memberships, recent_orders, stats } = clientQuery.data
  const ownerFull = [client.owner_name, client.owner_last_name].filter(Boolean).join(' ')

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title={client.business_name} showBack />
      <ScrollView contentContainerClassName="p-4 pb-8">
        <Card className="mb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-lg font-bold text-navy">{client.business_name}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">{client.public_id}</Text>
              {ownerFull && (
                <Text className="text-sm text-navy mt-2">
                  <Text className="text-muted-foreground">Dueño: </Text>
                  {ownerFull}
                </Text>
              )}
              {client.client_type && (
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Tipo: {client.client_type.name}
                </Text>
              )}
            </View>
            <BadgeStatus status={client.status} />
          </View>
        </Card>

        <Card className="mb-3">
          <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
            Contacto
          </Text>
          {client.phone && (
            <Text className="text-sm text-navy">
              <Text className="text-muted-foreground">Tel: </Text>
              {client.phone}
            </Text>
          )}
          {client.whatsapp && (
            <Text className="text-sm text-navy">
              <Text className="text-muted-foreground">WhatsApp: </Text>
              {client.whatsapp}
            </Text>
          )}
          {client.email && (
            <Text className="text-sm text-navy">
              <Text className="text-muted-foreground">Email: </Text>
              {client.email}
            </Text>
          )}
          {client.address.street && (
            <Text className="text-sm text-navy mt-2">
              {client.address.street}
              {client.address.city ? `, ${client.address.city}` : ''}
              {client.address.state ? `, ${client.address.state}` : ''}
            </Text>
          )}
          {client.zone && (
            <Text className="text-xs text-muted-foreground mt-1">Zona: {client.zone.name}</Text>
          )}
          {client.market && (
            <Text className="text-xs text-muted-foreground">Mercado: {client.market.name}</Text>
          )}
        </Card>

        <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
          Estadísticas
        </Text>
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1">
            <MetricCard label="Pedidos" value={stats.total_orders} />
          </View>
          <View className="flex-1">
            <MetricCard label="Ventas" value={`$${Math.round(stats.total_sales).toLocaleString('es-MX')}`} />
          </View>
        </View>
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1">
            <MetricCard label="Pendientes" value={stats.pending_orders} />
          </View>
          <View className="flex-1">
            <MetricCard label="Completados" value={stats.completed_orders} />
          </View>
        </View>

        {memberships.length > 0 && (
          <>
            <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 mt-3">
              Membresías
            </Text>
            {memberships.map(m => (
              <Card key={m.id} className="mb-2">
                <View className="flex-row items-center">
                  <BrandLogo logoUrl={m.brand?.logo_url ?? null} name={m.brand?.name ?? 'Marca'} size={32} />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-navy">{m.brand?.name ?? 'Marca'}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {m.tier?.name ?? 'Sin nivel'} · {m.points_balance} pts
                    </Text>
                  </View>
                  <BadgeStatus status={m.status} size="sm" />
                </View>
              </Card>
            ))}
          </>
        )}

        {recent_orders.length > 0 && (
          <>
            <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 mt-3">
              Pedidos recientes
            </Text>
            {recent_orders.slice(0, 5).map(o => (
              <Card key={o.id} className="mb-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-bold text-navy">{o.order_number}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {new Date(o.order_date).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-bold text-navy">
                      ${Number(o.total_amount).toFixed(2)}
                    </Text>
                    <BadgeStatus status={o.order_status} size="sm" />
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

        <View className="mt-4">
          <Button
            onPress={() =>
              router.push(`/(asesor)/orders/new?clientId=${client.public_id}` as never)
            }
            variant="default"
            size="lg"
            fullWidth
          >
            + Nuevo pedido
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
